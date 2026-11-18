import fs from 'node:fs';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const codes = [
  'CONTAINER_OUTTURN_REPORT_FORMAT',
  'FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'ADVANCE_SHIPPING_NOTE',
  'HBL_DRAFT_REPORT_FORMAT_68',
  'INVOICE_REPORT_FORMAT_14_INVOICE',
];

for (const code of codes) {
  await extractSpec(code);
  await renderSpec(code);
  const result = await diffPilot(code);
  const spec = JSON.parse(fs.readFileSync(`reports/specs/${code}.json`, 'utf8'));
  console.log(JSON.stringify({
    code,
    geometry: result.geometry.pass,
    static: result.staticText.pass,
    dynamic: result.dynamicText.pass,
    raster: result.raster.pass,
    nonText: result.raster.nonText?.ratio,
    textInk: result.raster.textInk?.ratio,
    masked: result.raster.maskedFraction,
    images: (spec.images || []).map((image) => image.proposedClass),
    logo: spec.slots?.logo,
  }));
}
