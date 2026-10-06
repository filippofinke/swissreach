/**
 * Self-hosted vector basemap focused on Switzerland. The data comes from
 * Natural Earth (public domain, no attribution required) and is built by
 * `npm run data:basemap`; MapLibre tiles the GeoJSON client-side. Everything
 * outside the country is covered by a mask so Switzerland stays the focus.
 */
import type { StyleSpecification } from 'maplibre-gl';

// MapLibre fetches GeoJSON from a worker, so the URL must be absolute.
const BASEMAP_URL = new URL(
  `${import.meta.env.BASE_URL}basemap/switzerland.json`,
  window.location.href,
).href;

/** Bounds the camera may not leave: Switzerland plus a margin. */
export const SWISS_BOUNDS: [[number, number], [number, number]] = [
  [3.6, 44.9],
  [12.6, 48.7],
];

const WATER = '#c9dcec';

export const LIGHT_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    basemap: { type: 'geojson', data: BASEMAP_URL },
  },
  layers: [
    { id: 'land', type: 'background', paint: { 'background-color': '#f7f7f5' } },
    {
      id: 'rivers',
      type: 'line',
      source: 'basemap',
      filter: ['==', ['get', 'kind'], 'river'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': WATER,
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1, 12, 3],
      },
    },
    {
      id: 'lakes',
      type: 'fill',
      source: 'basemap',
      filter: ['==', ['get', 'kind'], 'lake'],
      paint: { 'fill-color': WATER },
    },
    {
      id: 'cantons',
      type: 'line',
      source: 'basemap',
      filter: ['==', ['get', 'kind'], 'canton'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': '#c4c4c4',
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.6, 12, 1.4],
        'line-dasharray': [3, 2],
      },
    },
    {
      id: 'mask',
      type: 'fill',
      source: 'basemap',
      filter: ['==', ['get', 'kind'], 'mask'],
      paint: { 'fill-color': '#e4e4e2' },
    },
    {
      id: 'country',
      type: 'line',
      source: 'basemap',
      filter: ['==', ['get', 'kind'], 'country'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': '#8d8d8d',
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1.2, 12, 2.5],
      },
    },
  ],
};
