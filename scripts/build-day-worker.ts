/**
 * Worker thread: parses a subset of service days from a GTFS feed and writes
 * each day's serialized timetable to `outDir`. Identical days collapse onto the
 * same content-hashed filename, so concurrent workers writing the same hash is
 * safe (the file content is identical; `wx` open guards against double-write).
 *
 * Spawned by `build-data-parallel.ts` via `worker_threads`.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { extendedGtfsProfile, GtfsParser, standardGtfsProfile } from 'minotor/parser';

type Job = {
  workerId: number;
  zipPath: string;
  profile: 'standard' | 'extended';
  outDir: string;
  dates: string[];
};

type DayResult = {
  date: string;
  file: string;
  bytes: number;
  wrote: boolean;
  ms: number;
};

const job = workerData as Job;
const profile = job.profile === 'extended' ? extendedGtfsProfile : standardGtfsProfile;
const parser = new GtfsParser(job.zipPath, profile);

const results: DayResult[] = [];

for (const date of job.dates) {
  const t0 = Date.now();
  const timetable = await parser.parseTimetable(new Date(`${date}T12:00:00`));
  const bin = timetable.serialize();
  const hash = createHash('sha1').update(bin).digest('hex').slice(0, 12);
  const file = `timetable_${hash}.bin`;
  const path = resolve(job.outDir, file);

  // `wx` = open exclusively, fail if file already exists. Another worker may
  // have written the same hash already — that's fine, content is identical.
  let wrote = false;
  try {
    writeFileSync(path, bin, { flag: 'wx' });
    wrote = true;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== 'EEXIST') throw err;
  }

  const ms = Date.now() - t0;
  results.push({ date, file, bytes: bin.byteLength, wrote, ms });
  parentPort?.postMessage({ type: 'progress', workerId: job.workerId, date, file, bytes: bin.byteLength, wrote, ms });
}

parentPort?.postMessage({ type: 'done', workerId: job.workerId, results });
