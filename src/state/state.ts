/**
 * Shareable application state encoded in the URL query string.
 *
 * Encodes the `date` and `origin` parameters plus the rest of the visualization
 * controls so any configuration can be shared.
 */
import { ALL_MODES, type AppState, type RouteType } from './types';

/** Today as YYYY-MM-DD in the user's local timezone (not UTC). */
function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const DEFAULTS: Omit<AppState, 'origin'> = {
  date: localToday(), // overridden by meta window when available
  departure: 8 * 60, // 08:00
  maxDuration: 120,
  maxTransfers: 5,
  modes: [...ALL_MODES],
  metric: 'time',
  resolution: 7,
};

function parseTime(s: string | null): number | undefined {
  if (!s) return undefined;
  const m = /^(\d{1,2}):?(\d{2})$/.exec(s);
  if (!m) return undefined;
  return Math.min(23, +m[1]) * 60 + Math.min(59, +m[2]);
}

export function formatTime(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function readState(defaultOrigin: string): AppState {
  const q = new URLSearchParams(location.search);
  const modesParam = q.get('modes');
  const modes =
    modesParam === null
      ? [...DEFAULTS.modes]
      : (modesParam
          .split(',')
          .map((m) => m.toUpperCase())
          .filter((m): m is RouteType => (ALL_MODES as string[]).includes(m)) as RouteType[]);

  const num = (key: string, def: number): number => {
    const v = q.get(key);
    if (v === null) return def;
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  const metric = q.get('metric');

  return {
    origin: q.get('origin') ?? defaultOrigin,
    date: q.get('date') ?? DEFAULTS.date,
    departure: parseTime(q.get('dep')) ?? DEFAULTS.departure,
    maxDuration: Math.max(15, Math.min(300, num('max', DEFAULTS.maxDuration))),
    maxTransfers: Math.max(0, Math.min(8, num('transfers', DEFAULTS.maxTransfers))),
    modes: modes.length ? modes : [...DEFAULTS.modes],
    metric: metric === 'transfers' ? 'transfers' : 'time',
    resolution: Math.max(5, Math.min(9, num('res', DEFAULTS.resolution))),
  };
}

export function writeState(state: AppState, replace = true): void {
  const q = new URLSearchParams();
  q.set('date', state.date);
  q.set('origin', state.origin);
  q.set('dep', formatTime(state.departure));
  q.set('max', String(state.maxDuration));
  q.set('transfers', String(state.maxTransfers));
  // Only include modes when not the full default set (keeps URLs short).
  if (state.modes.length !== ALL_MODES.length) {
    q.set('modes', state.modes.join(','));
  }
  q.set('metric', state.metric);
  q.set('res', String(state.resolution));
  const url = `${location.pathname}?${q.toString()}`;
  if (replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
}
