/**
 * Origin station marker (the red pin at the start of the isochrone).
 */
import { Marker } from 'react-map-gl/maplibre';

export type OriginMarkerProps = {
  lon: number;
  lat: number;
  name: string;
};

export function OriginMarker({ lon, lat, name }: OriginMarkerProps) {
  return (
    <Marker longitude={lon} latitude={lat} anchor="center">
      <div className="origin-marker" title={name} />
    </Marker>
  );
}
