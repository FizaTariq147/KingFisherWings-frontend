import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const codes = ['D_O_FCL_VIETNAM_RPM_REF_411', 'D_O_LCL_VIETNAM_WITHOUT_STAMP_RPM_REF_427'];
for (const code of codes) {
  await renderSpec(code);
  const result = await diffPilot(code, { fastMetrics: true, writeHeatmap: false, skipDeviation: true });
  const classes = [];
  if (!result.page.pass) classes.push('page');
  if (!result.geometry.pass) classes.push('geometry');
  for (const failure of result.staticText.failures || []) classes.push(`static ${failure.cause}`);
  for (const failure of result.dynamicText.failures || []) classes.push(`dynamic ${failure.cause}`);
  if (!result.raster.pass) classes.push((result.raster.nonText?.ratio ?? 1) > 0.005 ? 'raster R1' : 'raster R2');
  console.log(JSON.stringify({
    code,
    classes: [...new Set(classes)],
    staticFailures: (result.staticText.failures || []).slice(0, 6),
    nonText: result.raster.nonText?.ratio,
    textInk: result.raster.textInk?.ratio,
  }));
}
