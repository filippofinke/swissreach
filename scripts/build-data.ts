/**
 * Parses a GTFS feed (the generated sample by default, or the real Swiss feed)
 * into the compact `minotor` protobuf binaries consumed by the browser app:
 *
 *   public/data/timetable_<hash>.bin  (one serialized Timetable per service day;
 *                                       identical days share a file)
 *   public/data/stops.bin             (serialized StopsIndex, day-independent)
 *   public/data/meta.json             (center, default origin, the list of
 *                                       available days + their timetable files)
 *
 * A rolling window of `DAYS` days (default 14) is built starting from the start
 * date, so the app can plan trips on any day in the window (holiday-aware). The
 * browser lazy-loads only the day the user selects.
 *
 * Usage:
 *   npm run data:build                       # sample feed, standard profile
 *   DAYS=7 npm run data:build
 *   tsx scripts/build-data.ts <zip> <startDate> <profile>
 *     <zip>       path to a GTFS .zip          (default tmp-gtfs/sample-gtfs.zip)
 *     <startDate> first day YYYY-MM-DD         (default today)
 *     <profile>   "standard" | "extended"      (default standard)
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import {
  extendedGtfsProfile,
  GtfsParser,
  type GtfsProfile,
  standardGtfsProfile,
} from 'minotor/parser';

/** Minimal CSV row splitter that respects double-quoted fields. */
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

/** Reads routes.txt from the GTFS zip and returns the transport modes present. */
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

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public', 'data');

export type BuildOptions = {
  zipPath: string;
  startDate: string; // YYYY-MM-DD, first day of the window
  days: number; // number of service days to build
  profile: 'standard' | 'extended';
  feedName?: string;
  defaultOrigin?: string;
};

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Parses a GTFS zip and writes one timetable per day in the window (identical
 * days are deduplicated by content hash), a shared stops index, and meta.json.
 */
export async function buildData(opts: BuildOptions): Promise<void> {
  const { zipPath, startDate, days, profile: profileName } = opts;
  const profile = profileName === 'extended' ? extendedGtfsProfile : standardGtfsProfile;

  console.log(
    `Parsing GTFS\n  feed:    ${zipPath}\n  window:  ${startDate} +${days}d\n  profile: ${profileName}`,
  );
  const parser = new GtfsParser(zipPath, profile);

  const stopsIndex = await parser.parseStops();
  const stopsBin = stopsIndex.serialize();
  console.log(`  stops parsed: ${stopsIndex.size()}`);

  // Map center = centroid of all stops that carry coordinates.
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
  // Remove stale timetable binaries from a previous build.
  for (const f of readdirSync(OUT_DIR)) {
    if (/^timetable.*\.bin$/.test(f)) rmSync(resolve(OUT_DIR, f));
  }

  // Build one timetable per day; identical days share a content-hashed file.
  const dates: string[] = [];
  const timetableFiles: Record<string, string> = {};
  const written = new Set<string>();
  let totalBytes = 0;
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const t0 = Date.now();
    const timetable = await parser.parseTimetable(new Date(`${date}T12:00:00`));
    const bin = timetable.serialize();
    const hash = createHash('sha1').update(bin).digest('hex').slice(0, 12);
    const file = `timetable_${hash}.bin`;
    if (!written.has(hash)) {
      writeFileSync(resolve(OUT_DIR, file), bin);
      written.add(hash);
      totalBytes += bin.byteLength;
    }
    dates.push(date);
    timetableFiles[date] = file;
    console.log(
      `  ${date}: ${(bin.byteLength / 1024).toFixed(0)} KiB -> ${file}` +
        ` (${((Date.now() - t0) / 1000).toFixed(1)}s)`,
    );
  }

  const meta = {
    name: opts.feedName ?? process.env.FEED_NAME ?? 'Sample Swiss network',
    buildDate: startDate,
    defaultDate: startDate,
    generatedAt: new Date().toISOString(),
    stopCount: n,
    center,
    defaultOrigin,
    dates,
    timetableFiles,
    modes,
    stopsBytes: stopsBin.byteLength,
  };

  writeFileSync(resolve(OUT_DIR, 'stops.bin'), stopsBin);
  writeFileSync(resolve(OUT_DIR, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

  console.log(
    `Wrote data to ${OUT_DIR}\n` +
      `  days:          ${days} (${written.size} unique timetable file(s), ${(totalBytes / 1024).toFixed(0)} KiB)\n` +
      `  stops.bin:     ${(stopsBin.byteLength / 1024).toFixed(1)} KiB\n` +
      `  center:        ${center.lat.toFixed(4)}, ${center.lon.toFixed(4)}\n` +
      `  defaultOrigin: ${defaultOrigin}\n` +
      `  window:        ${dates[0]} … ${dates[dates.length - 1]}\n` +
      `  modes:         ${modes.join(', ')}`,
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
  await buildData({
    zipPath: zipArg,
    startDate: startArg,
    days,
    profile: profileArg,
  });
}

// Run as a CLI unless imported by another script.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
