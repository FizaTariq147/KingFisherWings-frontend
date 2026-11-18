import fs from 'node:fs';
import { inspectPdfFile } from './extract.mjs';

const code = 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC';
const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
const refSpan = (spec.spans || []).find((span) => span.id === 'p1s2');
const rendered = await inspectPdfFile(`reports/output/${code}.pdf`);
const outSpan = (rendered.pages?.[0]?.spans || rendered.spans || []).find((span) => (span.text || '').includes('ﺔﻴ') || span.text === refSpan?.text)
  || (rendered.pages?.[0]?.spans || []).slice(0, 5);
console.log(JSON.stringify({
  ref: refSpan && {
    text: refSpan.text,
    x: refSpan.x,
    y: refSpan.y,
    width: refSpan.width,
    size: refSpan.size,
    font: refSpan.font,
    segments: refSpan.segments?.slice(0, 3),
    horizontalScale: refSpan.horizontalScale,
    advances: refSpan.advances?.slice(0, 5),
  },
  outSample: Array.isArray(outSpan) ? outSpan.map((span) => ({ text: span.text, x: span.x, y: span.y, width: span.width, size: span.size, font: span.font })) : {
    text: outSpan.text, x: outSpan.x, y: outSpan.y, width: outSpan.width, size: outSpan.size, font: outSpan.font,
  },
}, null, 2));
