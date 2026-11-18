import fs from 'node:fs';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const codes = [
  'ADVANCE_SHIPPING_NOTE',
  'GL_REPORT_VOUCHER_REPORT_FORMAT',
  'CONTAINER_OUTTURN_REPORT_FORMAT',
  'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
  'FG_STANDARD_INVOICE_ARABIC_RPM_REF_464',
];

const out = [];
for (const code of codes) {
  await extractSpec(code);
  await renderSpec(code);
  const result = await diffPilot(code);
  out.push({
    code,
    page: result.page.pass,
    geometry: result.geometry.pass,
    static: result.staticText.pass,
    staticFailures: (result.staticText.failures || []).slice(0, 8),
    dynamic: result.dynamicText.pass,
    dynamicFailures: (result.dynamicText.failures || []).slice(0, 8),
    raster: result.raster.pass,
    nonText: result.raster.nonText,
    textInk: result.raster.textInk,
    masked: result.raster.maskedFraction,
    causes: result.raster.causes,
    causeShare: result.raster.causeShare,
  });
  console.log(JSON.stringify(out.at(-1), null, 2));
}
fs.writeFileSync('reports/output/track-a/probe-causes.json', `${JSON.stringify(out, null, 2)}\n`);
