import type { RouteType } from 'minotor';

export type { RouteType };

/** A reachable station with its travel cost from the origin. */
export type IsochronePoint = {
  lat: number;
  lon: number;
  name: string;
  duration: number; // minutes from origin departure
  transfers: number;
  sourceId?: string; // parent-station source id, for re-centering the origin
};

export type SearchHit = {
  id: number;
  sourceId?: string;
  name: string;
  lat?: number;
  lon?: number;
};

export type IsochroneParams = {
  originSourceId: string;
  date: string; // YYYY-MM-DD service day to route on
  departureTime: number; // minutes from midnight
  windowMin: number; // departure-time window length
  maxTransfers: number;
  maxDurationMin: number;
  minTransferTime: number;
  modes: RouteType[];
};

/** One step of a reconstructed journey. */
export type JourneyLeg =
  | {
      kind: 'vehicle';
      line: string;
      mode: RouteType;
      fromName: string;
      toName: string;
      departure: number; // minutes from midnight
      arrival: number;
    }
  | { kind: 'transfer'; fromName: string; toName: string; minutes: number }
  | { kind: 'access'; fromName: string; toName: string; minutes: number };

export type Journey = {
  found: boolean;
  destName: string;
  departure: number;
  arrival: number;
  duration: number; // minutes
  transfers: number;
  legs: JourneyLeg[];
};

/** What the colour scale encodes. */
export type Metric = 'time' | 'transfers';

export type Meta = {
  name: string;
  buildDate: string;
  generatedAt: string;
  stopCount: number;
  center: { lat: number; lon: number; zoom: number };
  defaultOrigin: string;
  /** First service day in the available window (usually "today"). */
  defaultDate: string;
  /** All available service days (sorted, ascending). */
  dates: string[];
  /** Maps each service day to its timetable binary filename. */
  timetableFiles: Record<string, string>;
  modes?: RouteType[];
  stopsBytes?: number;
};

/** Full shareable application state (encoded in the URL). */
export type AppState = {
  origin: string; // source stop id, e.g. "Parent8507000"
  date: string; // YYYY-MM-DD
  departure: number; // minutes from midnight
  maxDuration: number; // minutes
  maxTransfers: number;
  modes: RouteType[];
  metric: Metric;
  resolution: number; // H3 hexagon resolution (5-9)
};

export const ALL_MODES: RouteType[] = [
  'RAIL',
  'BUS',
  'TRAM',
  'SUBWAY',
  'FERRY',
  'CABLE_TRAM',
  'AERIAL_LIFT',
  'FUNICULAR',
  'TROLLEYBUS',
  'MONORAIL',
];

// MODE_LABELS removed in favor of i18n
