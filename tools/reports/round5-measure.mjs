/**
 * Round 5 measurements. System fonts are read from Windows and are not copied.
 * Run: node tools/reports/round5-measure.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const codes = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY',
];

function compact(result) {
  return {
    code: result.code,
    page: result.page,
    geometry: result.geometry,
    staticText: { pass: result.staticText.pass, spans: result.staticText.spans, failures: result.staticText.failures.length },
    dynamicText: { pass: result.dynamicText.pass, spans: result.dynamicText.spans, failures: result.dynamicText.failures.length },
    raster: {
      pass: result.raster.pass,
      mismatches: result.raster.mismatches,
      ratio: result.raster.ratio,
      rasterizer: result.raster.rasterizer,
      maskMode: result.raster.maskMode,
      allowedDifferencesFile: result.raster.allowedDifferencesFile,
      causes: result.raster.causes,
      causeShare: result.raster.causeShare,
      nonText: result.raster.nonText,
      text: result.raster.text ? {
        blurredMismatches: result.raster.text.blurredMismatches,
        blurredRatio: result.raster.text.blurredRatio,
        textPixels: result.raster.text.textPixels,
        inkMean: result.raster.text.inkMean,
        inkMin: result.raster.text.inkMin,
        inkSpans: result.raster.text.inkSpans,
      } : null,
      heatmaps: result.raster.heatmaps,
    },
    pagination: { pass: result.pagination.pass, status: result.pagination.status, singlePage: result.pagination.singlePage, multiPage: result.pagination.multiPage },
    fontsOverHalfPercent: result.dynamicText.naturalWidth.fontsOverHalfPercent,
    widthMisses: result.widthMisses,
    consolas: result.consolas,
  };
}

const diagnosticDir = path.join(root, 'reports/output/diagnostic');
fs.mkdirSync(diagnosticDir, { recursive: true });
const diagnostic = [];
for (const code of codes) {
  const outputPath = path.join(diagnosticDir, `${code}.pdf`);
  await renderSpec(code, { systemFonts: true, outputPath });
  const result = await diffPilot(code, {
    renderedPath: outputPath,
    tag: `diag-${code}`,
    maskMode: 'slots',
    textHeatmap: true,
  });
  diagnostic.push(compact(result));
  console.log(JSON.stringify({ diagnostic: code, raster: diagnostic.at(-1).raster.ratio, blurred: diagnostic.at(-1).raster.text?.blurredRatio }));
}

for (const code of codes) await renderSpec(code);
const official = [];
const mupdf = [];
for (const code of codes) {
  const result = await diffPilot(code);
  fs.writeFileSync(path.join(root, 'reports/output', `${code}.diff.json`), `${JSON.stringify(result, null, 2)}\n`);
  official.push(compact(result));
  console.log(JSON.stringify({ official: code, static: official.at(-1).staticText, dynamic: official.at(-1).dynamicText, raster: official.at(-1).raster.ratio, misses: official.at(-1).widthMisses.length }));
  const embedded = await diffPilot(code, { engine: 'mupdf', tag: `${code}-mupdf` });
  mupdf.push({ code, ratio: embedded.raster.ratio, mismatches: embedded.raster.mismatches, pass: embedded.raster.pass, blurred: embedded.raster.text?.blurredRatio, nonText: embedded.raster.nonText?.ratio });
  console.log(JSON.stringify({ mupdf: code, ...mupdf.at(-1) }));
}

const out = path.join(root, 'reports/output/round5-measure.json');
fs.writeFileSync(out, JSON.stringify({ diagnostic, official, mupdf }, null, 2));
console.log(out);
