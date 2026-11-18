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
  extract: 'e1-class-order',
  render: 'r3-glyph-advances',
  checker: 'c2-nontxt-diagnose',
  raster: 'pdftoppm-150',
};

export function versionKey() {
  return `${PIPELINE_VERSION.id}|${PIPELINE_VERSION.extract}|${PIPELINE_VERSION.render}|${PIPELINE_VERSION.checker}|${PIPELINE_VERSION.raster}`;
}
