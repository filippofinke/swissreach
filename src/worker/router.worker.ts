/// <reference lib="webworker" />
/**
 * Routing web worker.
 *
 * Loads the serialized minotor timetable + stops index, then answers two kinds
 * of requests off the main thread:
 *   - `search`    : stop name autocomplete (StopsIndex text search)
 *   - `isochrone` : full-network Range-RAPTOR, returning the shortest travel
 *                   duration (and transfer count) to every reachable station.
 *
 * All transit data lives in memory here, enabling fully client-side routing.
 */
import { RangeQuery, type RangeResult, Router, type StopId, StopsIndex, Timetable } from 'minotor';
import type {
  IsochroneParams,
  IsochronePoint,
  Journey,
  JourneyLeg,
  Meta,
  SearchHit,
} from '../state/types';

type Cluster = { lat: number; lon: number; name: string; sourceId?: string };

let stopsIndex: StopsIndex | null = null;
let meta: Meta | null = null;
let dataBaseUrl = '';
// Routers are built lazily per service-day timetable file and cached by filename
// (so identical days, which share a file, share a router).
const routers = new Map<string, Router>();
// One display point per physical station (platforms folded into their parent).
const clusters = new Map<StopId, Cluster>();
const stopToCluster = new Map<StopId, StopId>();
const clusterToStops = new Map<StopId, StopId[]>();
// The most recent full-network range result, reused for journey reconstruction.
let lastRange: RangeResult | null = null;
// In-flight timetable fetch — aborting stale downloads when the user switches dates.
let timetableFetchController: AbortController | null = null;

type Req =
  | { type: 'init'; baseUrl: string }
  | { type: 'search'; reqId: number; query: string; maxResults?: number }
  | { type: 'nearest'; reqId: number; lat: number; lon: number }
  | { type: 'journey'; reqId: number; destSourceId: string }
  | { type: 'isochrone'; reqId: number; params: IsochroneParams };

async function init(baseUrl: string): Promise<unknown> {
  dataBaseUrl = baseUrl;
  const stopsBuf = await fetch(`${baseUrl}data/stops.bin`).then((r) => {
    if (!r.ok) throw new Error(`stops.bin: HTTP ${r.status}`);
    return r.arrayBuffer();
  });
  meta = (await fetch(`${baseUrl}data/meta.json`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)) as Meta | null;

  stopsIndex = StopsIndex.fromData(new Uint8Array(stopsBuf));

  // Build station clusters: every stop maps to its parent station (or itself),
  // so the isochrone shows one point per physical station.
  for (const stop of stopsIndex) {
    const clusterId = stop.parent ?? stop.id;
    stopToCluster.set(stop.id, clusterId);
    const members = clusterToStops.get(clusterId);
    if (members) members.push(stop.id);
    else clusterToStops.set(clusterId, [stop.id]);
    const existing = clusters.get(clusterId);
    const hasCoords = stop.lat !== undefined && stop.lon !== undefined;
    const isParent = stop.parent === undefined; // the station node itself
    if (!existing) {
      clusters.set(clusterId, {
        lat: stop.lat ?? NaN,
        lon: stop.lon ?? NaN,
        name: stop.name,
        sourceId: isParent ? stop.sourceStopId : undefined,
      });
    } else {
      if (hasCoords && Number.isNaN(existing.lat)) {
        existing.lat = stop.lat!;
        existing.lon = stop.lon!;
      }
      // The station node carries the canonical name + shareable source id.
      if (isParent) {
        existing.name = stop.name;
        existing.sourceId = stop.sourceStopId;
      }
    }
  }

  return { meta, stopCount: clusters.size };
}

function search(query: string, maxResults: number): SearchHit[] {
  if (!stopsIndex) return [];
  return stopsIndex.findStopsByName(query, maxResults).map((s) => ({
    id: s.id,
    sourceId: s.sourceStopId,
    name: s.name,
    lat: s.lat,
    lon: s.lon,
  }));
}

function nearest(
  lat: number,
  lon: number,
): { sourceId: string; name: string; lat: number; lon: number } | null {
  if (!stopsIndex) return null;
  const found = stopsIndex.findStopsByLocation(lat, lon, 1, 12);
  if (found.length === 0) return null;
  const clusterId = stopToCluster.get(found[0].id) ?? found[0].id;
  const c = clusters.get(clusterId);
  if (!c?.sourceId) return null;
  return { sourceId: c.sourceId, name: c.name, lat: c.lat, lon: c.lon };
}

/** Lazily loads (and caches) the router for a given service day's timetable. */
async function ensureRouter(date: string): Promise<Router | null> {
  if (!stopsIndex || !meta) return null;
  const files = meta.timetableFiles ?? {};
  const file = files[date] ?? files[meta.defaultDate] ?? 'timetable.bin';
  const cached = routers.get(file);
  if (cached) return cached;

  // Abort any in-flight timetable fetch (e.g. user switched dates rapidly).
  timetableFetchController?.abort();
  timetableFetchController = new AbortController();
  const { signal } = timetableFetchController;

  let res: Response;
  try {
    res = await fetch(`${dataBaseUrl}data/${file}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null;
    throw err;
  }
  if (!res.ok) {
    // Requested day unavailable — fall back to the default day if different.
    const fallback = files[meta.defaultDate];
    if (fallback && fallback !== file) return ensureRouter(meta.defaultDate);
    return null;
  }
  const timetable = Timetable.fromData(new Uint8Array(await res.arrayBuffer()));
  const router = new Router(timetable, stopsIndex);
  routers.set(file, router);
  return router;
}

async function isochrone(p: IsochroneParams): Promise<{
  origin: { lat: number; lon: number; name: string } | null;
  reason?: 'no-data' | 'unknown-origin';
  points: IsochronePoint[];
}> {
  const router = await ensureRouter(p.date);
  if (!router || !stopsIndex) return { origin: null, reason: 'no-data', points: [] };
  const origin = stopsIndex.findStopBySourceStopId(p.originSourceId);
  if (!origin) return { origin: null, reason: 'unknown-origin', points: [] };

  const builder = new RangeQuery.Builder()
    .from(origin.id)
    .departureTime(p.departureTime)
    .lastDepartureTime(p.departureTime + p.windowMin)
    .maxTransfers(p.maxTransfers)
    .minTransferTime(p.minTransferTime)
    .maxDuration(p.maxDurationMin);
  if (p.modes.length > 0) {
    builder.transportModes(new Set(p.modes));
  }
  const result = router.rangeRoute(builder.build());
  lastRange = result; // reused by journey reconstruction
  const durations = result.allShortestDurations();

  const best = new Map<StopId, { duration: number; transfers: number }>();
  for (const [stopId, arr] of durations) {
    const clusterId = stopToCluster.get(stopId) ?? stopId;
    const transfers = Math.max(0, arr.legNumber - 1);
    const prev = best.get(clusterId);
    if (!prev || arr.duration < prev.duration) {
      best.set(clusterId, { duration: arr.duration, transfers });
    }
  }

  // Ensure the origin itself is present at duration 0.
  const originCluster = stopToCluster.get(origin.id) ?? origin.id;
  best.set(originCluster, { duration: 0, transfers: 0 });

  const points: IsochronePoint[] = [];
  for (const [clusterId, v] of best) {
    const c = clusters.get(clusterId);
    if (!c || Number.isNaN(c.lat) || Number.isNaN(c.lon)) continue;
    points.push({
      lat: c.lat,
      lon: c.lon,
      name: c.name,
      duration: v.duration,
      transfers: v.transfers,
      sourceId: c.sourceId,
    });
  }

  const oc = clusters.get(originCluster);
  return {
    origin: oc ? { lat: oc.lat, lon: oc.lon, name: oc.name } : null,
    points,
  };
}

function journey(destSourceId: string): Journey {
  const empty: Journey = {
    found: false,
    destName: '',
    departure: 0,
    arrival: 0,
    duration: 0,
    transfers: 0,
    legs: [],
  };
  if (!stopsIndex || !lastRange) return empty;
  const dest = stopsIndex.findStopBySourceStopId(destSourceId);
  if (!dest) return empty;
  const clusterId = dest.parent ?? dest.id;
  const destName = clusters.get(clusterId)?.name ?? dest.name;
  const targets = new Set(clusterToStops.get(clusterId) ?? [dest.id]);

  const route = lastRange.fastestRoute(targets);
  if (!route) return { ...empty, destName };

  const legs: JourneyLeg[] = route.legs.map((leg): JourneyLeg => {
    if ('route' in leg) {
      return {
        kind: 'vehicle',
        line: leg.route.name,
        mode: leg.route.type,
        fromName: leg.from.name,
        toName: leg.to.name,
        departure: leg.departureTime,
        arrival: leg.arrivalTime,
      };
    }
    if ('type' in leg) {
      return {
        kind: 'transfer',
        fromName: leg.from.name,
        toName: leg.to.name,
        minutes: leg.minTransferTime ?? 0,
      };
    }
    return {
      kind: 'access',
      fromName: leg.from.name,
      toName: leg.to.name,
      minutes: leg.duration,
    };
  });

  const vehicleLegs = legs.filter((l) => l.kind === 'vehicle');
  if (vehicleLegs.length === 0) return { ...empty, destName };

  return {
    found: true,
    destName,
    departure: route.departureTime(),
    arrival: route.arrivalTime(),
    duration: route.totalDuration(),
    transfers: Math.max(0, vehicleLegs.length - 1),
    legs,
  };
}

self.onmessage = async (e: MessageEvent<Req>) => {
  const msg = e.data;
  try {
    if (msg.type === 'init') {
      const info = await init(msg.baseUrl);
      (self as DedicatedWorkerGlobalScope).postMessage({ type: 'ready', info });
    } else if (msg.type === 'search') {
      const stops = search(msg.query, msg.maxResults ?? 7);
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: 'searchResult',
        reqId: msg.reqId,
        stops,
      });
    } else if (msg.type === 'nearest') {
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: 'nearestResult',
        reqId: msg.reqId,
        stop: nearest(msg.lat, msg.lon),
      });
    } else if (msg.type === 'journey') {
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: 'journeyResult',
        reqId: msg.reqId,
        journey: journey(msg.destSourceId),
      });
    } else if (msg.type === 'isochrone') {
      const t0 = performance.now();
      const res = await isochrone(msg.params);
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: 'isochroneResult',
        reqId: msg.reqId,
        origin: res.origin,
        reason: res.reason,
        points: res.points,
        elapsedMs: performance.now() - t0,
      });
    }
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      reqId: 'reqId' in msg ? msg.reqId : undefined,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
