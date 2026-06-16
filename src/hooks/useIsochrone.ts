/**
 * Drives the routing worker: re-runs RAPTOR when any routing key in
 * `AppState` changes, exposes the most recent result, and reports status.
 *
 * Calls are debounced so that rapid slider/toggle changes coalesce into a
 * single request. Out-of-order responses are dropped via a token guard so
 * the displayed result always matches the most recent request.
 */
import { useEffect, useRef, useState } from 'react';
import type { RouterClient } from '../router-client';
import type { AppState, IsochronePoint } from '../state/types';

export type IsochroneResult = {
  origin: { lat: number; lon: number; name: string } | null;
  points: IsochronePoint[];
  elapsedMs: number;
  reason?: 'no-data' | 'unknown-origin';
};

export type IsochroneStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ok'; result: IsochroneResult }
  | { kind: 'empty'; reason: 'no-data' | 'unknown-origin' }
  | { kind: 'error'; message: string };

const ROUTING_KEYS: (keyof AppState)[] = [
  'origin',
  'date',
  'departure',
  'maxDuration',
  'maxTransfers',
  'modes',
];

/** Returns true when any routing-affecting key differs between two states. */
export function routingKeysChanged(a: AppState, b: AppState): boolean {
  return ROUTING_KEYS.some((k) => {
    const va = a[k];
    const vb = b[k];
    if (Array.isArray(va) && Array.isArray(vb)) {
      return va.length !== vb.length || va.some((x, i) => x !== vb[i]);
    }
    return va !== vb;
  });
}

export function useIsochrone(
  client: RouterClient | null,
  state: AppState,
  enabled: boolean,
): IsochroneStatus {
  const [status, setStatus] = useState<IsochroneStatus>({ kind: 'idle' });
  const tokenRef = useRef(0);
  const lastStateRef = useRef<AppState | null>(null);

  useEffect(() => {
    if (!client || !enabled) return;
    // Skip when only non-routing keys changed.
    if (lastStateRef.current && !routingKeysChanged(lastStateRef.current, state)) {
      return;
    }
    lastStateRef.current = state;

    const token = ++tokenRef.current;
    const timer = window.setTimeout(async () => {
      setStatus({ kind: 'loading' });
      try {
        const res = await client.isochrone({
          originSourceId: state.origin,
          date: state.date,
          departureTime: state.departure,
          windowMin: 60,
          maxTransfers: state.maxTransfers,
          maxDurationMin: state.maxDuration,
          minTransferTime: 2,
          modes: state.modes,
        });
        if (token !== tokenRef.current) return;
        if (!res.origin) {
          setStatus({ kind: 'empty', reason: res.reason ?? 'unknown-origin' });
          return;
        }
        setStatus({ kind: 'ok', result: res });
      } catch (err) {
        if (token !== tokenRef.current) return;
        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [client, enabled, state]);

  return status;
}
