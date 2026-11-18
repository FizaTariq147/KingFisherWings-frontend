import { diffPilot } from './diff-pilot.mjs';

const codes = [
  'D_O_FCL_VIETNAM_RPM_REF_411',
  'D_O_LCL_VIETNAM_WITHOUT_STAMP_RPM_REF_427',
  'FG_PROOF_OF_DELIVERY_RPM_REF_847',
  'CARTING_CONFIRMATION_REPORT_FORMAT',
  'LOADING_CONFIRMATION_REPORT_FORMAT',
  'PICKUP_CONFIRMATION_REPORT_FORMAT',
  'FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT',
  'STUFFING_REPORT_JASPER_REPORT_FORMAT',
];

for (const code of codes) {
  const result = await diffPilot(code, { fastMetrics: true, writeHeatmap: false, skipDeviation: true });
  const failures = [
    ...(result.staticText.failures || []),
    ...(result.dynamicText.failures || []),
  ].slice(0, 12);
  console.log(JSON.stringify({ code, failures }, null, 2));
}
