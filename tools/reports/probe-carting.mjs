import fs from 'node:fs';
import { renderSpec } from './render-spec.mjs';
import { inspectPdfFile } from './extract.mjs';

const code = 'CARTING_CONFIRMATION_REPORT_FORMAT';
await renderSpec(code);
const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const span = (spec.spans || []).find((item) => item.id === 'p1s25');
const read = await inspectPdfFile(`reports/output/${code}.pdf`);
const near = (read.spans || []).filter((item) => Math.abs(item.y - span.y) < 1);
console.log(JSON.stringify({ ref: { text: span.text, x: span.x, width: span.width }, near: near.map((item) => ({ text: item.text, x: item.x, width: item.width, font: item.font })) }, null, 2));
