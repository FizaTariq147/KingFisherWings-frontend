/**
 * Bump the component that changed. A cache entry is reused only when the
 * reference SHA-256 and that component's version still match.
 * extract: spec + reference text regions
 * render: rendered PDF
 * checker: comparison only (never stored as a shipped artifact)
 * raster: golden reference PNGs (verification cache, not output)
 */
export const PIPELINE_VERSION = {
  id: 'track-a-speed-1',
  extract: 'e3-paint-order',
  render: 'r8-rule-stroke-color',
  checker: 'c3-geometry-raster',
  raster: 'pdftoppm-150',
};

export function versionKey() {
  return `${PIPELINE_VERSION.id}|${PIPELINE_VERSION.extract}|${PIPELINE_VERSION.render}|${PIPELINE_VERSION.checker}|${PIPELINE_VERSION.raster}`;
}
