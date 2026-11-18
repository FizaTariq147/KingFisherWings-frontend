import fs from 'node:fs';
import { inspectPdfFile } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';

const code = 'CARTING_CONFIRMATION_REPORT_FORMAT';
await renderSpec(code);
const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const span = (spec.spans || []).find((item) => item.id === 'p1s25');
const read = await inspectPdfFile(`reports/output/${code}.pdf`);
const near = (read.spans || []).filter((item) => Math.abs(item.y - (span?.y || 0)) < 2).slice(0, 10);
console.log(JSON.stringify({
  ref: span && { text: span.text, x: span.x, y: span.y, width: span.width, font: span.font, segments: span.segments },
  near,
}, null, 2));
