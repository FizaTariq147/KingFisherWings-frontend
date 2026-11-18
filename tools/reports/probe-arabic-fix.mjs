import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const codes = [
  'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
  'FG_STANDARD_INVOICE_ARABIC_RPM_REF_464',
  'FG_KSA_INVOICE_ARABIC_RPM_REF_1161',
  'FG_STANDARD_INVOICE_ARABIC_FORMAT1_RPM_REF_939',
  'CARTING_CONFIRMATION_REPORT_FORMAT',
  'LOADING_CONFIRMATION_REPORT_FORMAT',
  'HBL_DRAFT_REPORT_FORMAT_68',
];

for (const code of codes) {
  await extractSpec(code);
  await renderSpec(code);
  const result = await diffPilot(code);
  console.log(JSON.stringify({
    code,
    geometry: result.geometry.pass,
    static: result.staticText.pass,
    staticFailures: (result.staticText.failures || []).slice(0, 5),
    dynamic: result.dynamicText.pass,
    dynamicFailures: (result.dynamicText.failures || []).slice(0, 5),
    raster: result.raster.pass,
  }));
}
