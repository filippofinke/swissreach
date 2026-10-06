/**
 * Swiss city names drawn as HTML markers, so the basemap needs no glyph
 * server. Smaller towns appear as the user zooms in.
 */
import { useEffect, useState } from 'react';
import { Marker, useMap } from 'react-map-gl/maplibre';
import { CITIES } from '../map/cities';

/** Highest Natural Earth scalerank shown at a given zoom. */
function maxRank(zoom: number): number {
  if (zoom >= 9) return 10;
  if (zoom >= 8) return 8;
  if (zoom >= 7) return 7;
  return 4;
}

export function CityLabels() {
  const { current: map } = useMap();
  const [zoom, setZoom] = useState(() => map?.getZoom() ?? 0);

  useEffect(() => {
    if (!map) return;
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map]);

  const limit = maxRank(zoom);
  return (
    <>
      {CITIES.filter((c) => c.rank <= limit).map((c) => (
        <Marker
          key={c.name}
          longitude={c.lon}
          latitude={c.lat}
          anchor="left"
          style={{ pointerEvents: 'none' }}
        >
          <div className={`city-label${c.rank <= 4 ? ' city-label--major' : ''}`}>{c.name}</div>
        </Marker>
      ))}
    </>
  );
}
