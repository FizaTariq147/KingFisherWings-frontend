import path from 'node:path';
import fs from 'node:fs';
import { renderSpec } from './render-spec.mjs';
import { geometryOnlyRatio } from './content-layers.mjs';

const codes = process.argv.slice(2);
for (const code of codes) {
  const started = Date.now();
  await renderSpec(code);
  const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
  const ratio = await geometryOnlyRatio(spec.source, path.join('reports/output', `${code}.pdf`), path.join('reports/output/track-a4/retest', code));
  console.log(JSON.stringify({ code, ratio: Number(ratio.ratio.toFixed(6)), pass: ratio.pass, ms: Date.now() - started }));
}
