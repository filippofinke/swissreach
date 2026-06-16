/**
 * Multi-threaded variant of `build-real.ts`. Downloads the Swiss GTFS feed
 * (unless cached) and fans the per-day timetable parsing out to a worker pool.
 *
 *   npm run data:real:parallel                        # today, 1 day
 *   DAYS=365 npm run data:real:parallel               # whole year, default pool
 *   DAYS=365 WORKERS=8 npm run data:real:parallel     # custom pool size
 *   DAYS=365 npm run data:real:parallel 2026-01-01    # specific start date
 */
import { resolve } from 'node:path';
import { buildDataParallel } from './build-data-parallel.ts';
import { DEFAULT_GTFS_URL, downloadGtfs } from './fetch-swiss-gtfs.ts';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const startDate = process.argv[2] ?? process.env.DATE ?? today();
  const days = Math.max(1, Number(process.env.DAYS ?? '1'));
  const workers = process.env.WORKERS ? Math.max(1, Number(process.env.WORKERS)) : undefined;
  const url = process.env.GTFS_URL ?? DEFAULT_GTFS_URL;
  const zip = resolve(process.cwd(), 'swiss-gtfs.zip');
  const reuse = process.env.FRESH !== '1';

  await downloadGtfs(url, zip, reuse);
  await buildDataParallel({
    zipPath: zip,
    startDate,
    days,
    profile: 'extended',
    feedName: 'Swiss public transport (full GTFS feed)',
    defaultOrigin: process.env.DEFAULT_ORIGIN ?? 'Parent8507000',
    workers,
  });
  console.log('\nReal Swiss data ready. Run `npm run dev` and search any stop.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
