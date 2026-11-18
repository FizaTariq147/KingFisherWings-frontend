import fs from 'node:fs';
import path from 'node:path';
import { geometryOnlyRatio } from './content-layers.mjs';

const codes = process.argv.slice(2);
for (const code of codes) {
  const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
  const rendered = path.join('reports/output/track-a4/smoke', `${code}.pdf`);
  const result = await geometryOnlyRatio(spec.source, rendered, path.join('reports/output/track-a4/smoke', code));
  console.log(JSON.stringify({ code, ...result }));
}
