/**
 * Round 6 measurements. Official render, then Poppler and MuPDF.
 * Run: node tools/reports/round6-measure.mjs
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

function textSplit(text) {
  if (!text) return null;
  return {
    blurredMismatches: text.blurredMismatches,
    blurredRatio: text.blurredRatio,
    textPixels: text.textPixels,
    embedded: text.embedded,
    nonEmbedded: text.nonEmbedded,
  };
}

function compact(result) {
  return {
    code: result.code,
    page: result.page,
    geometry: result.geometry,
    staticText: { pass: result.staticText.pass, spans: result.staticText.spans, failures: result.staticText.failures.length, causes: result.staticText.failures.map((failure) => failure.cause) },
    dynamicText: { pass: result.dynamicText.pass, spans: result.dynamicText.spans, failures: result.dynamicText.failures.length, causes: result.dynamicText.failures.map((failure) => failure.cause) },
    raster: {
      pass: result.raster.pass,
      mismatches: result.raster.mismatches,
      ratio: result.raster.ratio,
      rasterizer: result.raster.rasterizer,
      nonText: result.raster.nonText,
      text: textSplit(result.raster.text),
    },
    pagination: result.pagination,
    widthMisses: result.widthMisses,
    patchedAdvances: result.patchedAdvances,
  };
}

for (const code of codes) await renderSpec(code);
const official = [];
const mupdf = [];
for (const code of codes) {
  const result = await diffPilot(code);
  const advances = JSON.parse(fs.readFileSync(path.join(root, 'reports/output', `${code}.advances.json`), 'utf8'));
  result.patchedAdvances = advances.patchedAdvances;
  fs.writeFileSync(path.join(root, 'reports/output', `${code}.diff.json`), `${JSON.stringify(result, null, 2)}\n`);
  official.push(compact(result));
  console.log(JSON.stringify({ official: code, static: official.at(-1).staticText.failures, dynamic: official.at(-1).dynamicText.failures, raster: official.at(-1).raster.ratio, misses: official.at(-1).widthMisses }));
  const embedded = await diffPilot(code, { engine: 'mupdf', tag: `${code}-mupdf` });
  mupdf.push({
    code,
    ratio: embedded.raster.ratio,
    mismatches: embedded.raster.mismatches,
    pass: embedded.raster.pass,
    nonText: embedded.raster.nonText?.ratio,
    text: textSplit(embedded.raster.text),
  });
  console.log(JSON.stringify({ mupdf: code, ratio: embedded.raster.ratio, nonText: embedded.raster.nonText?.ratio }));
}
fs.writeFileSync(path.join(root, 'reports/output/round6-measure.json'), `${JSON.stringify({ official, mupdf }, null, 2)}\n`);
console.log(path.join(root, 'reports/output/round6-measure.json'));
