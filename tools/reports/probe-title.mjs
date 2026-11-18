import fs from 'node:fs';
import { renderSpec } from './render-spec.mjs';
import { inspectPdfFile } from './extract.mjs';
import { diffPilot } from './diff-pilot.mjs';

const code = 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC';
await renderSpec(code);
const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const span = (spec.spans || []).find((item) => item.id === 'p1s2');
const read = await inspectPdfFile(`reports/output/${code}.pdf`);
const near = (read.spans || []).filter((item) => Math.abs(item.y - span.y) < 1);
const result = await diffPilot(code);
console.log(JSON.stringify({
  ref: { text: span.text, x: span.x, y: span.y, width: span.width, advances: span.advances?.length, chars: [...span.text].length },
  near: near.map((item) => ({ text: item.text, x: item.x, y: item.y, width: item.width })),
  failures: result.staticText.failures.filter((item) => item.id === 'p1s2'),
}, null, 2));
