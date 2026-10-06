/**
 * Builds the self-hosted Swiss vector basemap from Natural Earth (public
 * domain, no attribution required):
 *
 *   npm run data:basemap
 *
 * Outputs:
 *   public/basemap/switzerland.json  GeoJSON with a `kind` property per feature
 *                                    (mask, country, canton, lake, river)
 *   src/map/cities.ts                Swiss city labels rendered as HTML markers
 *
 * MapLibre slices the GeoJSON into vector tiles client-side, so no tile server
 * or glyph server is needed. Everything outside Switzerland is covered by a
 * mask polygon to keep the focus on the country.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

const NE_BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson';

/** Switzerland bbox (lon/lat) with a small margin. */
const BBOX: [number, number, number, number] = [5.8, 45.7, 10.6, 47.9];

/** Local spellings for Natural Earth's English city names. */
const CITY_NAMES: Record<string, string> = {
  Geneva: 'Genève',
  'Saint Gallen': 'St. Gallen',
};

async function load(name: string): Promise<FeatureCollection> {
  const url = `${NE_BASE}/ne_10m_${name}.geojson`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return (await res.json()) as FeatureCollection;
}

const round = (n: number) => Math.round(n * 1e4) / 1e4;

function roundCoords(c: unknown): unknown {
  if (typeof c === 'number') return round(c);
  return (c as unknown[]).map(roundCoords);
}

function positions(g: Geometry): Position[] {
  switch (g.type) {
    case 'Point':
      return [g.coordinates];
    case 'LineString':
    case 'MultiPoint':
      return g.coordinates;
    case 'Polygon':
    case 'MultiLineString':
      return g.coordinates.flat();
    case 'MultiPolygon':
      return g.coordinates.flat(2);
    default:
      return [];
  }
}

/** Shoelace signed area; positive means counter-clockwise. */
function signedArea(ring: Position[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return a / 2;
}

/** MapLibre tells holes from outer rings by winding, so normalise it. */
function wind(ring: Position[], ccw: boolean): Position[] {
  return signedArea(ring) > 0 === ccw ? ring : [...ring].reverse();
}

function intersectsBbox(g: Geometry | null): boolean {
  if (!g) return false;
  const [w, s, e, n] = BBOX;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of positions(g)) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return minX <= e && maxX >= w && minY <= n && maxY >= s;
}

function feature(kind: string, geometry: Geometry): Feature {
  return {
    type: 'Feature',
    properties: { kind },
    geometry: {
      ...geometry,
      coordinates: roundCoords((geometry as { coordinates: unknown }).coordinates),
    } as Geometry,
  };
}

async function main() {
  const [countries, states, lakes, lakesEu, rivers, riversEu, places] = await Promise.all([
    load('admin_0_countries'),
    load('admin_1_states_provinces'),
    load('lakes'),
    load('lakes_europe'),
    load('rivers_lake_centerlines'),
    load('rivers_europe'),
    load('populated_places_simple'),
  ]);

  const ch = countries.features.find((f) => f.properties?.ADM0_A3 === 'CHE');
  if (ch?.geometry.type !== 'Polygon') throw new Error('Switzerland polygon not found');
  const [outer, ...enclaves] = ch.geometry.coordinates;

  const features: Feature[] = [];

  // World polygon with Switzerland punched out; foreign enclaves stay masked.
  features.push(
    feature('mask', {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-180, -85],
            [180, -85],
            [180, 85],
            [-180, 85],
            [-180, -85],
          ],
          wind(outer, false),
        ],
        ...enclaves.map((ring) => [wind(ring, true)]),
      ],
    }),
  );
  features.push(feature('country', ch.geometry));

  for (const f of states.features) {
    if (f.properties?.adm0_a3 === 'CHE') features.push(feature('canton', f.geometry));
  }
  for (const f of [...lakes.features, ...lakesEu.features]) {
    if (intersectsBbox(f.geometry)) features.push(feature('lake', f.geometry));
  }
  for (const f of [...rivers.features, ...riversEu.features]) {
    if (intersectsBbox(f.geometry)) features.push(feature('river', f.geometry));
  }

  const basemap: FeatureCollection = { type: 'FeatureCollection', features };
  const basemapOut = resolve(process.cwd(), 'public/basemap/switzerland.json');
  mkdirSync(dirname(basemapOut), { recursive: true });
  writeFileSync(basemapOut, JSON.stringify(basemap));
  console.log(`Wrote ${basemapOut} (${features.length} features)`);

  const cities = places.features
    .filter((f) => f.properties?.adm0_a3 === 'CHE' && f.geometry.type === 'Point')
    .map((f) => {
      const p = f.properties as { name: string; scalerank: number; pop_max: number };
      const [lon, lat] = (f.geometry as { coordinates: Position }).coordinates;
      return {
        name: CITY_NAMES[p.name] ?? p.name,
        lon: round(lon),
        lat: round(lat),
        rank: p.scalerank,
        pop: p.pop_max,
      };
    })
    .sort((a, b) => a.rank - b.rank || b.pop - a.pop)
    .map(({ pop: _pop, ...c }) => c);

  const citiesOut = resolve(process.cwd(), 'src/map/cities.ts');
  writeFileSync(
    citiesOut,
    `/**
 * Swiss city labels for the basemap. Generated by scripts/build-basemap.ts
 * from Natural Earth (public domain) — do not edit by hand.
 */
export type City = { name: string; lon: number; lat: number; rank: number };

export const CITIES: City[] = ${JSON.stringify(cities, null, 2)};
`,
  );
  console.log(`Wrote ${citiesOut} (${cities.length} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
