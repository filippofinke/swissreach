/**
 * Downloads the official SBB logo (simplified) to public/sbb-logo.svg.
 *
 * The app uses it only where it links to / cites SBB (the "Open in SBB" button
 * and the About dialog), alongside a clear "unofficial / not affiliated"
 * disclaimer. The logo is a trademark of Schweizerische Bundesbahnen SBB.
 *
 *   npm run logo
 *
 * Failure is non-fatal: when the file is absent the app simply hides the logo,
 * so this never blocks a build.
 */
import { createWriteStream } from 'node:fs';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const URL =
  process.env.SBB_LOGO_URL ??
  'https://upload.wikimedia.org/wikipedia/commons/2/23/SBB_logo_simplified.svg';

async function main(): Promise<void> {
  const out = resolve(process.cwd(), 'public', 'sbb-logo.svg');
  console.log(`Fetching SBB logo\n  from: ${URL}\n  to:   ${out}`);
  const res = await fetch(URL, { redirect: 'follow' });
  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(out));
  console.log('Done.');
}

main().catch((err) => {
  // Non-fatal: the app hides the logo when the file is missing.
  console.warn(`Could not fetch SBB logo (${err.message}). Skipping.`);
});
