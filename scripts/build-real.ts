/**
 * One command to run the app on the REAL Swiss network: downloads the official
 * GTFS feed (unless already present) and builds the browser data for one day
 * with all ~30,000 stops — every train station, bus stop, tram stop, ferry pier
 * and cable car, including small stops like "Balerna, Mercole".
 *
 *   npm run data:real                 # today, reuse swiss-gtfs.zip if present
 *   npm run data:real -- 2026-07-01   # a specific service day
 *   GTFS_URL=<url> npm run data:real  # override the download URL
 *   FRESH=1 npm run data:real         # force a fresh download
 *
 * The download is large (hundreds of MB) but only one day is kept (~5 MB of
 * browser data). Requires outbound access to data.opentransportdata.swiss.
 */
import { resolve } from 'node:path';
import { buildData } from './build-data.ts';
import { DEFAULT_GTFS_URL, downloadGtfs } from './fetch-swiss-gtfs.ts';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const startDate = process.argv[2] ?? process.env.DATE ?? today();
  const days = Math.max(1, Number(process.env.DAYS ?? '1'));
  const url = process.env.GTFS_URL ?? DEFAULT_GTFS_URL;
  const zip = resolve(process.cwd(), 'swiss-gtfs.zip');
  const reuse = process.env.FRESH !== '1';

  await downloadGtfs(url, zip, reuse);
  await buildData({
    zipPath: zip,
    startDate,
    days,
    profile: 'extended', // the Swiss feed uses extended GTFS route types
    feedName: 'Swiss public transport (full GTFS feed)',
    defaultOrigin: process.env.DEFAULT_ORIGIN ?? 'Parent8507000',
  });
  console.log('\nReal Swiss data ready. Run `npm run dev` and search any stop.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
