/**
 * Verify every pinned PDF except the two scanned files.
 * Writes reports/full-run.csv and, for the 40 rehearsal documents,
 * reports/rehearsal-raster.csv. Does not change a threshold or a render.
 * Run: node tools/reports/full-run.mjs
 */
import fs from 'node:fs';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const OUT_OF_SCOPE = new Set(['BARCODE_AWB_REPORT_FORMAT', 'STANDARD_INVOICE_RPM_REF_79']);
const FULL = 'reports/full-run.csv';
const TABLE = 'reports/rehearsal-raster.csv';

function csv(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function classesOf(result) {
  const classes = [];
  if (!result.page.pass) classes.push('page');
  if ((result.geometry.uncaptured || 0) > 0) classes.push('geometry uncaptured');
  if ((result.geometry.unmatchedLines || 0) + (result.geometry.unmatchedRects || 0) + (result.geometry.unmatchedPaths || 0) > 0) classes.push('geometry mismatch');
  for (const failure of result.staticText.failures || []) classes.push(`static ${failure.cause}`);
  for (const failure of result.dynamicText.failures || []) classes.push(`dynamic ${failure.cause}`);
  if (!result.raster.pass) classes.push('raster');
  if (result.pagination.multiPage && !result.pagination.pass) classes.push('pagination');
  return classes;
}

async function append(file, line) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      fs.appendFileSync(file, line);
      return;
    } catch (error) {
      if (attempt === 7 || (error.code !== 'EBUSY' && error.errno !== -4094)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
}

function doneCodes(file) {
  if (!fs.existsSync(file)) return new Set();
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(1).filter(Boolean);
  return new Set(lines.filter((line) => !line.includes('extract or render error')).map((line) => line.split(',')[0].replaceAll('"', '')));
}

const census = fs.readFileSync('reports/capability-census.csv', 'utf8').trim().split(/\r?\n/).slice(1).map((line) => {
  const cells = line.split(',');
  return { code: cells[0], pages: Number(cells[2]) || 0 };
});
const rehearsal = ['reports/output/rehearsal/seed-5.json', 'reports/output/rehearsal/seed-6.json']
  .flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')).selected.map((item) => item.code));
const rehearsalSet = new Set(rehearsal);
const ordered = [
  ...rehearsal.filter((code) => census.some((item) => item.code === code)),
  ...census.map((item) => item.code).filter((code) => !rehearsalSet.has(code)),
];
console.log(JSON.stringify({ census: census.length, rehearsal: rehearsal.length, ordered: ordered.length, missingRehearsal: rehearsal.filter((code) => !census.some((item) => item.code === code)) }));

if (!fs.existsSync(FULL)) {
  fs.writeFileSync(FULL, 'code,pages,page,geometry,static,dynamic,raster,pagination,failure_class,cause_counts\n');
}
if (!fs.existsSync(TABLE)) {
  fs.writeFileSync(TABLE, 'code,full_page_ratio,non_text_ratio,embedded_blur,non_embedded_blur,image_barcode_pixels,branding_mask_pixels,text_ink_difference\n');
}
const finished = doneCodes(FULL);
const tableDone = doneCodes(TABLE);

for (const code of OUT_OF_SCOPE) {
  if (finished.has(code)) continue;
  const pages = census.find((item) => item.code === code)?.pages ?? '';
  await append(FULL, `${csv(code)},${pages},,,,,,out of scope,\n`);
  finished.add(code);
}

let index = 0;
for (const code of ordered) {
  index += 1;
  if (OUT_OF_SCOPE.has(code) || finished.has(code)) continue;
  const started = Date.now();
  try {
    const extracted = await extractSpec(code);
    await renderSpec(code);
    const result = await diffPilot(code);
    const causes = classesOf(result);
    const unique = [...new Set(causes)];
    const counts = causes.reduce((map, name) => map.set(name, (map.get(name) || 0) + 1), new Map());
    const pagination = result.pagination.multiPage ? (result.pagination.pass ? 'pass' : 'fail') : 'single-page';
    const row = [
      code,
      extracted.pages,
      result.page.pass ? 'pass' : 'fail',
      result.geometry.pass ? 'pass' : 'fail',
      result.staticText.pass ? 'pass' : 'fail',
      result.dynamicText.pass ? 'pass' : 'fail',
      result.raster.pass ? 'pass' : 'fail',
      pagination,
      unique.join(' | '),
      [...counts].map(([name, count]) => `${name}=${count}`).join('; '),
    ].map(csv).join(',');
    await append(FULL, `${row}\n`);
    if (rehearsalSet.has(code) && !tableDone.has(code)) {
      const text = result.raster.text || {};
      const table = [
        code,
        result.raster.ratio,
        result.raster.nonText?.ratio,
        text.embedded?.blurredRatio,
        text.nonEmbedded?.blurredRatio,
        result.raster.imageBarcodePixels,
        result.raster.brandingMaskPixels,
        result.raster.textInk?.ratio,
      ].map(csv).join(',');
      await append(TABLE, `${table}\n`);
    }
    console.log(JSON.stringify({ n: index, of: ordered.length, code, seconds: Number(((Date.now() - started) / 1000).toFixed(1)), classes: unique }));
  } catch (error) {
    const message = String(error.message || error).replace(/\s+/g, ' ').slice(0, 300);
    const pages = census.find((item) => item.code === code)?.pages ?? '';
    await append(FULL, `${[code, pages, '', '', '', '', '', '', `extract or render error: ${message}`, ''].map(csv).join(',')}\n`);
    console.log(JSON.stringify({ n: index, of: ordered.length, code, error: message }));
  }
}

console.log('FULL RUN DONE');
