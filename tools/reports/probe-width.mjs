import fs from 'node:fs';
import { inspectPdfFile } from './extract.mjs';

const code = process.argv[2] || 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC';
const id = process.argv[3] || 'p1s2';
const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const span = (spec.spans || []).find((item) => item.id === id);
const read = await inspectPdfFile(`reports/output/${code}.pdf`);
const near = (read.spans || []).filter((item) => span && Math.abs(item.y - span.y) < 1 && Math.abs(item.x - span.x) < 2);
console.log(JSON.stringify({
  ref: span && { text: span.text, x: span.x, width: span.width, size: span.size, charSpacing: span.charSpacing, advances: span.advances?.length },
  near: near.map((item) => ({ text: item.text, x: item.x, width: item.width, size: item.size, charSpacing: item.charSpacing, font: item.font })),
}, null, 2));
