/**
 * Minimal pixel-diff (pixelmatch-compatible subset) to avoid npm install friction.
 */
export default function simplePixelmatch(img1, img2, output, width, height, options = {}) {
  const threshold = options.threshold ?? 0.1;
  const maxDelta = 35215 * threshold * threshold;
  let mismatched = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const dr = img1[i] - img2[i];
      const dg = img1[i + 1] - img2[i + 1];
      const db = img1[i + 2] - img2[i + 2];
      const da = img1[i + 3] - img2[i + 3];
      const delta = dr * dr + dg * dg + db * db + da * da;
      if (delta > maxDelta) {
        mismatched += 1;
        if (output) {
          output[i] = 255;
          output[i + 1] = 0;
          output[i + 2] = 0;
          output[i + 3] = 255;
        }
      } else if (output) {
        const g = Math.round(
          img1[i] * 0.3 + img1[i + 1] * 0.59 + img1[i + 2] * 0.11,
        );
        output[i] = g;
        output[i + 1] = g;
        output[i + 2] = g;
        output[i + 3] = img1[i + 3];
      }
    }
  }
  return mismatched;
}
