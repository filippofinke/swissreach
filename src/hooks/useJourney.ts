/**
 * Fetches a single journey (itinerary) for the currently selected destination
 * station against the most recent isochrone result held by the worker.
 */
import { useEffect, useRef, useState } from 'react';
import type { RouterClient } from '../router-client';
import type { Journey } from '../state/types';

export type JourneyTarget = { sourceId: string; name: string };

export type JourneyStatus =
  | { kind: 'closed' }
  | { kind: 'loading'; target: JourneyTarget }
  | { kind: 'ok'; target: JourneyTarget; journey: Journey }
  | { kind: 'error'; target: JourneyTarget; message: string };

export function useJourney(client: RouterClient | null): {
  status: JourneyStatus;
  fetchJourney: (target: JourneyTarget) => void;
  close: () => void;
} {
  const [status, setStatus] = useState<JourneyStatus>({ kind: 'closed' });
  const tokenRef = useRef(0);

  const close = () => {
    tokenRef.current++;
    setStatus({ kind: 'closed' });
  };

  const fetchJourney = (target: JourneyTarget) => {
    if (!client) return;
    const token = ++tokenRef.current;
    setStatus({ kind: 'loading', target });
    client
      .journey(target.sourceId)
      .then((journey) => {
        if (token !== tokenRef.current) return;
        setStatus({ kind: 'ok', target, journey });
      })
      .catch((err: unknown) => {
        if (token !== tokenRef.current) return;
        setStatus({
          kind: 'error',
          target,
          message: err instanceof Error ? err.message : String(err),
        });
      });
  };

  // Close panel when the client identity changes (defensive).
  useEffect(() => {
    return () => {
      tokenRef.current++;
    };
  }, []);

  return { status, fetchJourney, close };
}
