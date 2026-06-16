/**
 * Generates a synthetic-but-realistic Swiss GTFS feed (a small zip) from the
 * network model in `swiss-network.ts`.
 *
 * The output mirrors the structure of the real Swiss GTFS2020 feed closely
 * enough for `minotor` to parse it the same way:
 *   - parent stations have stop_id "Parent<didok>" with location_type=1
 *   - platform stops have stop_id "<didok>:0:1" referencing the parent
 *   - stop_times reference the platform stops
 *
 * Travel times between consecutive stops are derived from the great-circle
 * distance and a per-line / per-mode average speed, which yields plausible
 * isochrones.
 *
 * Run with: npm run data:sample
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { LINES, type Line, STATIONS } from './swiss-network.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_ZIP = resolve(ROOT, 'tmp-gtfs', 'sample-gtfs.zip');

// Standard GTFS route_type codes (minotor's standardGtfsProfile).
const ROUTE_TYPE: Record<string, number> = {
  TRAM: 0,
  SUBWAY: 1,
  RAIL: 2,
  BUS: 3,
  FERRY: 4,
  CABLE_TRAM: 5,
  AERIAL_LIFT: 6,
  FUNICULAR: 7,
  TROLLEYBUS: 11,
  MONORAIL: 12,
};

// Fallback average speeds (km/h) when a line does not override them.
const DEFAULT_SPEED: Record<string, number> = {
  RAIL: 90,
  SUBWAY: 32,
  BUS: 30,
  TROLLEYBUS: 22,
  TRAM: 18,
  CABLE_TRAM: 14,
  FUNICULAR: 15,
  AERIAL_LIFT: 25,
  FERRY: 25,
  MONORAIL: 30,
};

const stationById = new Map(STATIONS.map((s) => [s.id, s]));

/** Great-circle distance in kilometres. */
function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function hmToMin(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

/** Format minutes-from-midnight as a GTFS "HH:MM:SS" time (may exceed 24h). */
function minToGtfs(totalMinFloat: number): string {
  const totalSec = Math.round(totalMinFloat * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Cumulative travel-minute offsets (incl. dwell) for each stop on a line. */
function legOffsets(line: Line): number[] {
  const speed = line.speedKmh ?? DEFAULT_SPEED[line.mode];
  const dwell = line.dwellMin ?? 1;
  const offsets: number[] = [0];
  let acc = 0;
  for (let i = 1; i < line.stops.length; i++) {
    const a = stationById.get(line.stops[i - 1])!;
    const b = stationById.get(line.stops[i])!;
    const km = haversineKm(a.lat, a.lon, b.lat, b.lon);
    const travel = (km / speed) * 60;
    // Add dwell time at every intermediate stop (boarding/alighting).
    acc += travel + (i > 1 ? dwell : 0);
    offsets.push(acc);
  }
  return offsets;
}

function csv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(','),
    )
    .join('\n');
}

function build(): void {
  // agency.txt
  const agency = csv([
    ['agency_id', 'agency_name', 'agency_url', 'agency_timezone', 'agency_lang'],
    ['ch', 'Sample Swiss Transit', 'https://example.org', 'Europe/Zurich', 'de'],
  ]);

  // stops.txt — parent stations + one platform child per station.
  const stopRows: (string | number)[][] = [
    ['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'location_type', 'parent_station'],
  ];
  for (const s of STATIONS) {
    stopRows.push([`Parent${s.id}`, s.name, s.lat, s.lon, 1, '']);
    stopRows.push([`${s.id}:0:1`, s.name, s.lat, s.lon, 0, `Parent${s.id}`]);
  }
  const stops = csv(stopRows);

  // calendar.txt — a single service active every day over a wide range.
  const calendar = csv([
    [
      'service_id',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'start_date',
      'end_date',
    ],
    ['DAILY', 1, 1, 1, 1, 1, 1, 1, '20200101', '20301231'],
  ]);

  const routeRows: (string | number)[][] = [
    ['route_id', 'route_short_name', 'route_long_name', 'route_type'],
  ];
  const tripRows: (string | number)[][] = [['route_id', 'service_id', 'trip_id', 'trip_headsign']];
  const stopTimeRows: (string | number)[][] = [
    [
      'trip_id',
      'arrival_time',
      'departure_time',
      'stop_id',
      'stop_sequence',
      'pickup_type',
      'drop_off_type',
    ],
  ];

  let lineIdx = 0;
  for (const line of LINES) {
    const routeId = `R${lineIdx++}`;
    const headsignFwd = stationById.get(line.stops[line.stops.length - 1])!.name;
    const headsignRev = stationById.get(line.stops[0])!.name;
    routeRows.push([routeId, line.name, `${headsignRev} – ${headsignFwd}`, ROUTE_TYPE[line.mode]]);

    const offsets = legOffsets(line);
    const totalSpan = offsets[offsets.length - 1];
    const first = hmToMin(line.firstDep);
    const last = hmToMin(line.lastDep);

    // Generate trips in both directions at the configured headway.
    for (const dir of [0, 1] as const) {
      const seq = dir === 0 ? line.stops : [...line.stops].reverse();
      const offs = dir === 0 ? offsets : offsets.map((o) => totalSpan - o).reverse();
      let tripCounter = 0;
      for (let dep = first; dep <= last; dep += line.headwayMin) {
        const tripId = `${routeId}_${dir}_${tripCounter++}`;
        tripRows.push([routeId, 'DAILY', tripId, dir === 0 ? headsignFwd : headsignRev]);
        for (let i = 0; i < seq.length; i++) {
          const t = dep + offs[i];
          const time = minToGtfs(t);
          stopTimeRows.push([tripId, time, time, `${seq[i]}:0:1`, i + 1, 0, 0]);
        }
      }
    }
  }

  const zip = new JSZip();
  zip.file('agency.txt', agency);
  zip.file('stops.txt', stops);
  zip.file('calendar.txt', calendar);
  zip.file('routes.txt', csv(routeRows));
  zip.file('trips.txt', csv(tripRows));
  zip.file('stop_times.txt', csv(stopTimeRows));

  mkdirSync(dirname(OUT_ZIP), { recursive: true });
  zip
    .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    .then((buf) => {
      writeFileSync(OUT_ZIP, buf);
      console.log(
        `Wrote ${OUT_ZIP}\n` +
          `  stations: ${STATIONS.length}\n` +
          `  lines:    ${LINES.length}\n` +
          `  trips:    ${tripRows.length - 1}\n` +
          `  stop_times: ${stopTimeRows.length - 1}`,
      );
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

build();
