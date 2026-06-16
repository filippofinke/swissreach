/**
 * Build an H3 hexagon surface from a set of reachable transit stations.
 *
 * Each station is mapped to an H3 cell, then "grown" by a few rings so that
 * neighbouring stations' areas merge into a single continuous coloured blob
 * (rather than isolated hexes at exact station locations). Each cell keeps the
 * minimum value across all contributing stations (closest/fastest wins).
 */
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { cellToBoundary, getHexagonEdgeLengthAvg, gridDiskDistances, latLngToCell } from 'h3-js';
import type { IsochronePoint, Metric } from '../state/types';
import { colorFor } from './colors.ts';

export type HexProps = {
  value: number; // the metric value for this hex (minutes if time, count if transfers)
  color: string; // fill colour (from colorFor)
};

export type HexOptions = {
  resolution: number; // H3 resolution (e.g. 6..9). Higher = smaller hexes.
  metric: Metric; // 'time' | 'transfers'
  maxDuration: number; // minutes; used for colour scaling and as an upper clamp
  spreadRings?: number; // how many H3 rings to grow around each station (default 1)
  walkSpeedKmh?: number; // default 4.5; used to add a small time penalty per ring when metric==='time'
};

export function buildHexagons(
  points: IsochronePoint[],
  opts: HexOptions,
): FeatureCollection<Polygon, HexProps> {
  const empty: FeatureCollection<Polygon, HexProps> = {
    type: 'FeatureCollection',
    features: [],
  };

  if (points.length === 0) {
    return empty;
  }

  const { resolution, metric, maxDuration, spreadRings = 1, walkSpeedKmh = 4.5 } = opts;

  // Minutes added when stepping one ring away from a station's cell.
  // Approximated as the time to walk one hex edge at the walking speed.
  const edgeKm = getHexagonEdgeLengthAvg(resolution, 'km');
  const minutesPerRing = metric === 'time' && walkSpeedKmh > 0 ? (edgeKm / walkSpeedKmh) * 60 : 0;

  // Aggregate by cell, keeping the minimum value across all stations.
  const cellValues = new Map<string, number>();

  for (const point of points) {
    const baseValue = metric === 'time' ? point.duration : point.transfers;
    const baseCell = latLngToCell(point.lat, point.lon, resolution);

    // gridDiskDistances groups cells by their ring distance from baseCell:
    // rings[k] is the array of cells exactly k rings away (ring 0 = baseCell).
    const rings = gridDiskDistances(baseCell, Math.max(0, spreadRings));

    for (let k = 0; k < rings.length; k++) {
      const penalty = metric === 'time' ? minutesPerRing * k : 0;
      const candidate = baseValue + penalty;

      // Drop cells that exceed the maximum duration (time metric only).
      if (metric === 'time' && candidate > maxDuration) {
        continue;
      }

      for (const cell of rings[k]) {
        const existing = cellValues.get(cell);
        if (existing === undefined || candidate < existing) {
          cellValues.set(cell, candidate);
        }
      }
    }
  }

  const features: Feature<Polygon, HexProps>[] = [];

  for (const [cell, value] of cellValues) {
    // cellToBoundary(cell, true) -> [lng, lat] pairs in GeoJSON order.
    const boundary = cellToBoundary(cell, true) as [number, number][];
    if (boundary.length === 0) {
      continue;
    }
    const ring: [number, number][] = boundary.map(([lng, lat]) => [lng, lat]);
    // Close the ring by repeating the first coordinate.
    ring.push([ring[0][0], ring[0][1]]);

    features.push({
      type: 'Feature',
      properties: {
        value,
        color: colorFor(metric, value, maxDuration),
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}
