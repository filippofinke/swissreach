/**
 * Top-level MapLibre canvas. Owns the basemap style, the viewport's initial
 * camera, and provides an imperative `flyTo` API for parent components.
 */
import 'maplibre-gl/dist/maplibre-gl.css';
import { forwardRef, type ReactNode, useImperativeHandle, useRef } from 'react';
import {
  Map as MapLibreMap,
  type MapRef,
  NavigationControl,
} from 'react-map-gl/maplibre';
import { LIGHT_STYLE } from '../map/backgrounds';

export type MapViewHandle = {
  flyTo: (lon: number, lat: number) => void;
  project: (lon: number, lat: number) => { x: number; y: number } | null;
  containerSize: () => { width: number; height: number } | null;
};

export type MapViewProps = {
  initialCenter: { lon: number; lat: number; zoom: number };
  onMapClick?: (lon: number, lat: number) => void;
  onViewportChange?: () => void;
  children?: ReactNode;
};

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { initialCenter, onMapClick, onViewportChange, children },
  ref,
) {
  const mapRef = useRef<MapRef | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lon, lat) => {
      mapRef.current?.easeTo({ center: [lon, lat], duration: 600 });
    },
    project: (lon, lat) => {
      const m = mapRef.current?.getMap();
      if (!m) return null;
      const p = m.project([lon, lat]);
      return { x: p.x, y: p.y };
    },
    containerSize: () => {
      const m = mapRef.current?.getMap();
      if (!m) return null;
      const c = m.getContainer();
      return { width: c.clientWidth, height: c.clientHeight };
    },
  }));

  return (
    <MapLibreMap
      ref={mapRef}
      mapStyle={LIGHT_STYLE}
      initialViewState={{
        longitude: initialCenter.lon,
        latitude: initialCenter.lat,
        zoom: initialCenter.zoom,
      }}
      attributionControl={false}
      interactiveLayerIds={['stations-circles']}
      onClick={(e) => {
        // Skip when a station feature was hit — its own handler runs.
        if (e.features && e.features.length > 0) return;
        onMapClick?.(e.lngLat.lng, e.lngLat.lat);
      }}
      onMove={() => onViewportChange?.()}
      onResize={() => onViewportChange?.()}
    >
      <NavigationControl position="top-right" />
      {children}
    </MapLibreMap>
  );
});
