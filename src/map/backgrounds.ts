/**
 * MapLibre basemap: the swisstopo light base map (vector tiles). The style
 * brings its own sources, glyphs and sprites, and its tiles carry the
 * required "© swisstopo" attribution.
 */

export const LIGHT_STYLE = 'https://vectortiles.geo.admin.ch/styles/ch.swisstopo.lightbasemap.vt/style.json';

/** Bounds the camera may not leave: Switzerland plus a margin. */
export const SWISS_BOUNDS: [[number, number], [number, number]] = [
  [3.6, 44.9],
  [12.6, 48.7],
];
