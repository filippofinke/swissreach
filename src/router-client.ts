/**
 * Promise-based main-thread client for the routing web worker.
 */

import type { IsochroneParams, IsochronePoint, Journey, Meta, SearchHit } from './state/types';
import RouterWorker from './worker/router.worker.ts?worker';

type IsochroneResult = {
  origin: { lat: number; lon: number; name: string } | null;
  /** When `origin` is null, why the routing could not run. */
  reason?: 'no-data' | 'unknown-origin';
  points: IsochronePoint[];
  elapsedMs: number;
};

export class RouterClient {
  private worker: Worker;
  private reqId = 1;
  private pending = new Map<
    number,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  private readyPromise: Promise<{ meta: Meta | null; stopCount: number }>;

  constructor(baseUrl: string) {
    this.worker = new RouterWorker();
    let readyResolve!: (v: { meta: Meta | null; stopCount: number }) => void;
    let readyReject!: (e: Error) => void;
    this.readyPromise = new Promise((res, rej) => {
      readyResolve = res;
      readyReject = rej;
    });

    this.worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'ready') {
        readyResolve(msg.info);
        return;
      }
      if (msg.type === 'error') {
        if (typeof msg.reqId === 'number' && this.pending.has(msg.reqId)) {
          this.pending.get(msg.reqId)!.reject(new Error(msg.message));
          this.pending.delete(msg.reqId);
        } else {
          readyReject(new Error(msg.message));
        }
        return;
      }
      const id = msg.reqId as number;
      const p = this.pending.get(id);
      if (!p) return;
      this.pending.delete(id);
      p.resolve(msg);
    };
    const failAll = (err: Error) => {
      readyReject(err);
      for (const { reject } of this.pending.values()) reject(err);
      this.pending.clear();
    };
    this.worker.onerror = (e) => failAll(new Error(e.message || 'Worker error'));
    this.worker.onmessageerror = () => failAll(new Error('Worker message deserialization failed'));

    this.worker.postMessage({ type: 'init', baseUrl });
  }

  ready(): Promise<{ meta: Meta | null; stopCount: number }> {
    return this.readyPromise;
  }

  private call<T>(payload: Record<string, unknown>): Promise<T> {
    const reqId = this.reqId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(reqId, {
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      this.worker.postMessage({ ...payload, reqId });
    });
  }

  async search(query: string, maxResults = 7): Promise<SearchHit[]> {
    const r = await this.call<{ stops: SearchHit[] }>({
      type: 'search',
      query,
      maxResults,
    });
    return r.stops;
  }

  async nearest(
    lat: number,
    lon: number,
  ): Promise<{ sourceId: string; name: string; lat: number; lon: number } | null> {
    const r = await this.call<{
      stop: { sourceId: string; name: string; lat: number; lon: number } | null;
    }>({ type: 'nearest', lat, lon });
    return r.stop;
  }

  async journey(destSourceId: string): Promise<Journey> {
    const r = await this.call<{ journey: Journey }>({
      type: 'journey',
      destSourceId,
    });
    return r.journey;
  }

  async isochrone(params: IsochroneParams): Promise<IsochroneResult> {
    return this.call<IsochroneResult>({ type: 'isochrone', params });
  }
}
