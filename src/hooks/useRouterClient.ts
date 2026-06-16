/**
 * Constructs a single `RouterClient` for the app lifetime and exposes its
 * ready state. The worker is created lazily and disposed on unmount.
 */
import { useEffect, useRef, useState } from 'react';
import { RouterClient } from '../router-client';
import type { Meta } from '../state/types';

export type RouterClientStatus =
  | { kind: 'loading'; client: RouterClient }
  | { kind: 'ready'; client: RouterClient; meta: Meta | null }
  | { kind: 'error'; client: RouterClient; message: string };

export function useRouterClient(baseUrl: string): RouterClientStatus {
  const clientRef = useRef<RouterClient | null>(null);
  if (clientRef.current === null) {
    clientRef.current = new RouterClient(baseUrl);
  }
  const client = clientRef.current;

  const [status, setStatus] = useState<RouterClientStatus>({ kind: 'loading', client });

  useEffect(() => {
    let cancelled = false;
    client
      .ready()
      .then((info) => {
        if (!cancelled) setStatus({ kind: 'ready', client, meta: info.meta });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setStatus({
            kind: 'error',
            client,
            message: err instanceof Error ? err.message : String(err),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return status;
}
