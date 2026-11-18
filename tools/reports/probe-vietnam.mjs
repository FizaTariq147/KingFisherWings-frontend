import fs from 'node:fs';
import { inspectPdfFile } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';

const code = 'D_O_FCL_VIETNAM_RPM_REF_411';
await renderSpec(code);
const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const ids = new Set(['p1s19', 'p1s54']);
const spans = (spec.spans || []).filter((span) => ids.has(span.id));
const read = await inspectPdfFile(`reports/output/${code}.pdf`);
for (const span of spans) {
  const near = (read.spans || []).filter((item) => Math.abs(item.y - span.y) < 2);
  console.log(JSON.stringify({
    id: span.id,
    text: span.text,
    x: span.x,
    y: span.y,
    font: span.font,
    codes: [...span.text].map((char) => char.codePointAt(0).toString(16)),
    near: near.map((item) => ({ text: item.text, x: item.x, y: item.y, font: item.font, width: item.width })),
  }, null, 2));
}
