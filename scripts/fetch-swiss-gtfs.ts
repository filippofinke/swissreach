/**
 * Downloads the official Swiss GTFS2020 feed from opentransportdata.swiss.
 *
 * The full feed is large (~hundreds of MB) and the parse step keeps only a
 * single day, producing ~5 MB of compressed browser data. After downloading,
 * build the binaries for a specific day with the *extended* GTFS profile:
 *
 *   npm run data:fetch
 *   tsx scripts/build-data.ts swiss-gtfs.zip 2026-06-14 extended
 *
 * Or do everything in one go with `npm run data:real`.
 *
 * If the permalink changes, grab the current GTFS2020 download URL from
 * https://data.opentransportdata.swiss/en/dataset/timetable-2026-gtfs2020
 * and pass it as the first argument:
 *
 *   tsx scripts/fetch-swiss-gtfs.ts <url>
 */
import { createWriteStream, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export const DEFAULT_GTFS_URL =
  'https://data.opentransportdata.swiss/en/dataset/timetable-2026-gtfs2020/permalink';

/**
 * Downloads the Swiss GTFS feed to `out`. When `reuseExisting` is true and the
 * file already exists (non-empty), the download is skipped — handy to avoid
 * re-downloading the large archive on repeated builds.
 */
export async function downloadGtfs(
  url: string = DEFAULT_GTFS_URL,
  out: string = resolve(process.cwd(), 'swiss-gtfs.zip'),
  reuseExisting = false,
): Promise<string> {
  if (reuseExisting && existsSync(out) && statSync(out).size > 0) {
    console.log(`Reusing existing ${out} (${(statSync(out).size / 1e6).toFixed(1)} MB)`);
    return out;
  }
  console.log(`Downloading Swiss GTFS feed\n  from: ${url}\n  to:   ${out}`);
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok || !res.body) {
    throw new Error(`Download failed: HTTP ${res.status} ${res.statusText}`);
  }
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(out));
  console.log(`Downloaded ${(statSync(out).size / 1e6).toFixed(1)} MB`);
  return out;
}

// Run as a CLI: `tsx scripts/fetch-swiss-gtfs.ts [url]`
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadGtfs(process.argv[2])
    .then(() =>
      console.log('Done.\nNext: tsx scripts/build-data.ts swiss-gtfs.zip 2026-06-14 extended'),
    )
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
