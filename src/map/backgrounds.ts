/**
 * MapLibre raster basemap. Only the Carto "Light" basemap is exposed.
 */
import type { StyleSpecification } from 'maplibre-gl';

function raster(tiles: string[], attribution: string): StyleSpecification {
  return {
    version: 8,
    sources: {
      bg: {
        type: 'raster',
        tiles,
        tileSize: 256,
        maxzoom: 19,
        attribution,
      },
    },
    layers: [{ id: 'bg', type: 'raster', source: 'bg' }],
  };
}

export const LIGHT_STYLE: StyleSpecification = raster(
  ['a', 'b', 'c', 'd'].map((s) => `https://${s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`),
  '© OpenStreetMap contributors © CARTO',
);
