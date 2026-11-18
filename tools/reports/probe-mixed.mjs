import fs from 'node:fs';
import { renderSpec } from './render-spec.mjs';
import { inspectPdfFile } from './extract.mjs';

async function probe(code, id) {
  await renderSpec(code);
  const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
  const span = (spec.spans || []).find((item) => item.id === id);
  const read = await inspectPdfFile(`reports/output/${code}.pdf`);
  const near = (read.spans || []).filter((item) => Math.abs((item.y || 0) - (span?.y || 0)) < 1.5);
  console.log(JSON.stringify({
    code,
    id,
    ref: span && { text: span.text, x: span.x, y: span.y, width: span.width },
    near: near.map((item) => ({ text: item.text, x: item.x, y: item.y, width: item.width, font: item.font })),
  }, null, 2));
}

await probe('CARTING_CONFIRMATION_REPORT_FORMAT', 'p1s25');
await probe('FG_STANDARD_INVOICE_ARABIC_FORMAT1_RPM_REF_939', 'p1s2');
await probe('INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC', 'p1s24');
