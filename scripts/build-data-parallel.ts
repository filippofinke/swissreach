/**
 * Multi-threaded variant of `build-data.ts`. Parses the GTFS feed once in the
 * main thread (stops, modes, defaults) and fans the per-day timetable parsing
 * out to a pool of worker threads (`build-day-worker.ts`).
 *
 *   npm run data:real:parallel                 # today, 1 day
 *   DAYS=365 npm run data:real:parallel        # whole year
 *   DAYS=365 WORKERS=12 npm run data:real:parallel
 *
 * Each worker re-opens the GTFS zip in its own thread, so RAM usage scales with
 * the worker count (the Swiss feed needs ~1.5 GB per worker — pick `WORKERS`
 * accordingly). Default = max(1, cpus - 1), capped at 8.
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import JSZip from 'jszip';
import {
  extendedGtfsProfile,
  GtfsParser,
  type GtfsProfile,
  standardGtfsProfile,
} from 'minotor/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public', 'data');
// Workers go through a tiny .mjs shim that registers the tsx loader inside the
// worker thread, then dynamic-imports the real TypeScript worker file. Node
// worker_threads don't inherit the main thread's loader hooks, so `--import tsx`
// in execArgv is unreliable; the shim is the portable way.
const WORKER_FILE = new URL('./build-day-worker.entry.mjs', import.meta.url);

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

async function presentModes(zipPath: string, profile: GtfsProfile): Promise<string[]> {
  const zip = await JSZip.loadAsync(readFileSync(zipPath));
  const file = zip.file('routes.txt');
  if (!file) return [];
  const text = await file.async('string');
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const idx = header.indexOf('route_type');
  if (idx === -1) return [];
  const modes = new Set<string>();
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const rt = Number(cells[idx]);
    if (!Number.isFinite(rt)) continue;
    const mode = profile.routeTypeParser(rt);
    if (mode) modes.add(mode);
  }
  return [...modes];
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function enumerateDates(start: string, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) out.push(addDays(start, i));
  return out;
}

/** Round-robin chunking keeps each worker's date range spread across the year, */
/** which evens out per-day parse cost (weekday vs. weekend). */
function chunkRoundRobin<T>(items: T[], n: number): T[][] {
  const out: T[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < items.length; i++) out[i % n].push(items[i]);
  return out.filter((c) => c.length > 0);
}

export type BuildOptions = {
  zipPath: string;
  startDate: string;
  days: number;
  profile: 'standard' | 'extended';
  feedName?: string;
  defaultOrigin?: string;
  workers?: number;
};

type WorkerProgress = {
  type: 'progress';
  workerId: number;
  date: string;
  file: string;
  bytes: number;
  wrote: boolean;
  ms: number;
};
type WorkerDone = {
  type: 'done';
  workerId: number;
  results: Array<{ date: string; file: string; bytes: number; wrote: boolean; ms: number }>;
};
type WorkerMsg = WorkerProgress | WorkerDone;

function runWorker(workerId: number, job: object): Promise<WorkerDone['results']> {
  return new Promise((res, rej) => {
    const worker = new Worker(WORKER_FILE, {
      workerData: { workerId, ...job },
    });
    worker.on('message', (msg: WorkerMsg) => {
      if (msg.type === 'progress') {
        const tag = msg.wrote ? '+' : '=';
        console.log(
          `  [w${workerId}] ${msg.date}: ${(msg.bytes / 1024).toFixed(0)} KiB ${tag} ${msg.file} (${(msg.ms / 1000).toFixed(1)}s)`,
        );
      } else if (msg.type === 'done') {
        res(msg.results);
      }
    });
    worker.on('error', rej);
    worker.on('exit', (code) => {
      if (code !== 0) rej(new Error(`worker ${workerId} exited ${code}`));
    });
  });
}

export async function buildDataParallel(opts: BuildOptions): Promise<void> {
  const { zipPath, startDate, days, profile: profileName } = opts;
  const profile = profileName === 'extended' ? extendedGtfsProfile : standardGtfsProfile;
  const cpus = os.cpus().length;
  const workers = Math.max(1, Math.min(opts.workers ?? cpus - 1, days, 8));

  console.log(
    `Parsing GTFS (parallel)\n  feed:    ${zipPath}\n  window:  ${startDate} +${days}d\n  profile: ${profileName}\n  workers: ${workers} (cpus=${cpus})`,
  );

  // Main thread parses stops once (day-independent) + collects feed metadata.
  const mainParser = new GtfsParser(zipPath, profile);
  const stopsIndex = await mainParser.parseStops();
  const stopsBin = stopsIndex.serialize();
  console.log(`  stops parsed: ${stopsIndex.size()}`);

  let sumLat = 0;
  let sumLon = 0;
  let n = 0;
  let withCoords = 0;
  for (const stop of stopsIndex) {
    if (stop.lat !== undefined && stop.lon !== undefined) {
      sumLat += stop.lat;
      sumLon += stop.lon;
      withCoords++;
    }
    n++;
  }
  const center =
    withCoords > 0
      ? { lat: sumLat / withCoords, lon: sumLon / withCoords, zoom: 7.4 }
      : { lat: 46.8, lon: 8.2, zoom: 7.4 };

  const wantedOrigin = opts.defaultOrigin ?? process.env.DEFAULT_ORIGIN;
  let defaultOrigin = 'Parent8507000';
  if (wantedOrigin && stopsIndex.findStopBySourceStopId(wantedOrigin)) {
    defaultOrigin = wantedOrigin;
  } else if (!stopsIndex.findStopBySourceStopId(defaultOrigin)) {
    for (const stop of stopsIndex) {
      if (stop.locationType === 'STATION' && stop.sourceStopId) {
        defaultOrigin = stop.sourceStopId;
        break;
      }
    }
  }

  const modes = await presentModes(zipPath, profile);

  mkdirSync(OUT_DIR, { recursive: true });
  for (const f of readdirSync(OUT_DIR)) {
    if (/^timetable.*\.bin$/.test(f)) rmSync(resolve(OUT_DIR, f));
  }

  // Fan timetable parsing out to workers.
  const dates = enumerateDates(startDate, days);
  const chunks = chunkRoundRobin(dates, workers);
  const t0 = Date.now();
  const all = await Promise.all(
    chunks.map((chunk, i) =>
      runWorker(i, {
        zipPath,
        profile: profileName,
        outDir: OUT_DIR,
        dates: chunk,
      }),
    ),
  );

  // Flatten worker results, then merge back into date-ordered meta.
  const byDate = new Map<string, { file: string; bytes: number }>();
  const uniqueFiles = new Set<string>();
  let totalBytes = 0;
  for (const workerResults of all) {
    for (const r of workerResults) {
      byDate.set(r.date, { file: r.file, bytes: r.bytes });
      if (r.wrote) {
        uniqueFiles.add(r.file);
        totalBytes += r.bytes;
      }
    }
  }

  const orderedDates: string[] = [];
  const timetableFiles: Record<string, string> = {};
  for (const date of dates) {
    const v = byDate.get(date);
    if (!v) throw new Error(`worker did not return result for ${date}`);
    orderedDates.push(date);
    timetableFiles[date] = v.file;
  }

  // Recompute hash set from filenames (handles the case where every worker
  // observed a hash as already-written and `wrote` was false everywhere).
  const allFiles = new Set(Object.values(timetableFiles));

  const meta = {
    name: opts.feedName ?? process.env.FEED_NAME ?? 'Sample Swiss network',
    buildDate: startDate,
    defaultDate: startDate,
    generatedAt: new Date().toISOString(),
    stopCount: n,
    center,
    defaultOrigin,
    dates: orderedDates,
    timetableFiles,
    modes,
    stopsBytes: stopsBin.byteLength,
  };

  writeFileSync(resolve(OUT_DIR, 'stops.bin'), stopsBin);
  writeFileSync(resolve(OUT_DIR, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

  const elapsed = (Date.now() - t0) / 1000;
  console.log(
    `Wrote data to ${OUT_DIR}\n` +
      `  days:          ${days} (${allFiles.size} unique timetable file(s), ${(totalBytes / 1024).toFixed(0)} KiB newly written, ${uniqueFiles.size} written this run)\n` +
      `  stops.bin:     ${(stopsBin.byteLength / 1024).toFixed(1)} KiB\n` +
      `  center:        ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}\n` +
      `  defaultOrigin: ${defaultOrigin}\n` +
      `  window:        ${orderedDates[0]} … ${orderedDates[orderedDates.length - 1]}\n` +
      `  modes:         ${modes.join(', ')}\n` +
      `  elapsed:       ${elapsed.toFixed(1)}s across ${workers} worker(s)`,
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const zipArg = process.argv[2] ?? resolve(ROOT, 'tmp-gtfs', 'sample-gtfs.zip');
  const startArg = process.argv[3] ?? today();
  const profileArg = (process.argv[4] ?? 'standard') as 'standard' | 'extended';
  const days = Math.max(1, Number(process.env.DAYS ?? '14'));
  const workers = process.env.WORKERS ? Math.max(1, Number(process.env.WORKERS)) : undefined;
  await buildDataParallel({
    zipPath: zipArg,
    startDate: startArg,
    days,
    profile: profileArg,
    workers,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
