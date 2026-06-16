/**
 * Reachable stations rendered as circles, with a hover popup and a click
 * handler that lifts the selection up to the parent (for the journey panel).
 */
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { MapGeoJSONFeature, MapMouseEvent } from 'maplibre-gl';
import { useEffect, useMemo, useState } from 'react';
import { Layer, Popup, Source, useMap } from 'react-map-gl/maplibre';
import { colorFor } from '../map/colors';
import type { AppState, IsochronePoint } from '../state/types';
import { useTranslation } from '../i18n/I18nProvider';

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return m > 0 ? `${h}h${m}m` : `${h}h`;
  return `${m}m`;
}

type StationProps = {
  name: string;
  sourceId: string;
  color: string;
  label: string;
};

export type StationsProps = {
  points: IsochronePoint[];
  metric: AppState['metric'];
  maxDuration: number;
  onStationClick: (sourceId: string, name: string, lon: number, lat: number) => void;
};

type LayerMouseEvent = MapMouseEvent & { features?: MapGeoJSONFeature[] };

export function Stations({ points, metric, maxDuration, onStationClick }: StationsProps) {
  const { t } = useTranslation();
  const { current: map } = useMap();
  const [hover, setHover] = useState<{ lon: number; lat: number; props: StationProps } | null>(
    null,
  );

  const data = useMemo<FeatureCollection<Point, StationProps>>(
    () => ({
      type: 'FeatureCollection',
      features: points.map(
        (p): Feature<Point, StationProps> => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
          properties: {
            name: p.name,
            sourceId: p.sourceId ?? '',
            color: colorFor(metric, metric === 'time' ? p.duration : p.transfers, maxDuration),
            label:
              metric === 'time'
                ? `${formatDuration(p.duration)} · ${t.changes(p.transfers)}`
                : `${t.changes(p.transfers)} · ${formatDuration(p.duration)}`,
          },
        }),
      ),
    }),
    [points, metric, maxDuration, t],
  );

  // Keep the canvas cursor in sync with hover state.
  useEffect(() => {
    if (!map) return;
    const canvas = map.getCanvas();
    canvas.style.cursor = hover ? 'pointer' : '';
  }, [hover, map]);

  // Hover + click handlers wired imperatively against the layer.
  useEffect(() => {
    if (!map) return;
    const onMove = (e: LayerMouseEvent) => {
      const f = e.features?.[0];
      if (f?.geometry.type !== 'Point') {
        setHover(null);
        return;
      }
      const [lon, lat] = f.geometry.coordinates as [number, number];
      setHover({ lon, lat, props: f.properties as unknown as StationProps });
    };
    const onLeave = () => setHover(null);
    const onClick = (e: LayerMouseEvent) => {
      const f = e.features?.[0];
      if (f?.geometry.type !== 'Point') return;
      const props = f.properties as unknown as StationProps;
      if (!props.sourceId) return;
      const [lon, lat] = f.geometry.coordinates as [number, number];
      onStationClick(props.sourceId, props.name, lon, lat);
    };

    map.on('mousemove', 'stations-circles', onMove);
    map.on('mouseleave', 'stations-circles', onLeave);
    map.on('click', 'stations-circles', onClick);
    return () => {
      map.off('mousemove', 'stations-circles', onMove);
      map.off('mouseleave', 'stations-circles', onLeave);
      map.off('click', 'stations-circles', onClick);
    };
  }, [map, onStationClick]);

  return (
    <>
      <Source id="stations" type="geojson" data={data}>
        <Layer
          id="stations-circles"
          type="circle"
          paint={{
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.2, 11, 5],
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 0.8,
            'circle-opacity': 0.95,
          }}
        />
      </Source>
      {hover && (
        <Popup
          longitude={hover.lon}
          latitude={hover.lat}
          closeButton={false}
          closeOnClick={false}
          offset={8}
          anchor="bottom"
        >
          <strong>{hover.props.name}</strong>
          <br />
          {hover.props.label}
        </Popup>
      )}
    </>
  );
}
