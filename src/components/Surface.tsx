/**
 * Renders the isochrone surface as H3 hexagons (GeoJSON source + fill/outline
 * layers). The GeoJSON is memoised so the source data only recomputes when
 * its inputs change.
 */
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import { buildHexagons } from '../map/hexagons';
import type { AppState, IsochronePoint } from '../state/types';

export type SurfaceProps = {
  points: IsochronePoint[];
  metric: AppState['metric'];
  maxDuration: number;
  resolution: number;
};

export function Surface({ points, metric, maxDuration, resolution }: SurfaceProps) {
  const data = useMemo(
    () =>
      buildHexagons(points, {
        resolution,
        metric,
        maxDuration,
        spreadRings: resolution >= 8 ? 2 : 1,
      }),
    [points, metric, maxDuration, resolution],
  );

  return (
    <Source id="iso-surface" type="geojson" data={data}>
      <Layer
        id="iso-fill"
        type="fill"
        paint={{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.5,
          'fill-antialias': true,
        }}
      />
      <Layer
        id="iso-outline"
        type="line"
        paint={{
          'line-color': ['get', 'color'],
          'line-width': 1,
          'line-opacity': 0.6,
        }}
      />
    </Source>
  );
}
