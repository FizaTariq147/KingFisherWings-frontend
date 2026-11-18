/**
 * Track A full remesure with the new raster rule.
 * Writes reports/full-run-track-a.csv and reports/rehearsal-raster-track-a.csv.
 * Resumes from existing rows. Run: node --max-old-space-size=8192 tools/reports/track-a-remeasure.mjs
 */
import fs from 'node:fs';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const OUT_OF_SCOPE = new Set(['BARCODE_AWB_REPORT_FORMAT', 'STANDARD_INVOICE_RPM_REF_79']);
const FULL = 'reports/full-run-track-a.csv';
const TABLE = 'reports/rehearsal-raster-track-a.csv';
const RASTER = 'reports/raster-track-a.csv';

function csv(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function classesOf(result) {
  const classes = [];
  if (!result.page.pass) classes.push('page');
  if ((result.geometry.uncaptured || 0) > 0) classes.push('geometry uncaptured');
  if ((result.geometry.unmatchedLines || 0) + (result.geometry.unmatchedRects || 0) + (result.geometry.unmatchedPaths || 0) > 0) {
    classes.push('geometry mismatch');
  }
  for (const failure of result.staticText.failures || []) classes.push(`static ${failure.cause}`);
  for (const failure of result.dynamicText.failures || []) classes.push(`dynamic ${failure.cause}`);
  if (!result.raster.pass) {
    const nonTextFail = (result.raster.nonText?.ratio ?? 1) > 0.005;
    classes.push(nonTextFail ? 'raster R1' : 'raster R2');
  }
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

if (!fs.existsSync(FULL)) {
  fs.writeFileSync(FULL, 'code,pages,page,geometry,static,dynamic,raster,pagination,failure_class,cause_counts,non_text,text_ink,masked_fraction\n');
}
if (!fs.existsSync(TABLE)) {
  fs.writeFileSync(TABLE, 'code,full_page_ratio,non_text_ratio,text_ink_ratio,masked_fraction,r1,r2,pass\n');
}
if (!fs.existsSync(RASTER)) {
  fs.writeFileSync(RASTER, 'code,non_text,text_ink,masked_fraction,non_text_pass,text_ink_pass,masked_pass,raster_pass,r_class\n');
}

const finished = doneCodes(FULL);
const tableDone = doneCodes(TABLE);

for (const code of OUT_OF_SCOPE) {
  if (finished.has(code)) continue;
  const pages = census.find((item) => item.code === code)?.pages ?? '';
  await append(FULL, `${csv(code)},${pages},,,,,,out of scope,,,,,\n`);
  finished.add(code);
}

let index = 0;
for (const code of ordered) {
  index += 1;
  if (OUT_OF_SCOPE.has(code) || finished.has(code)) continue;
  const started = Date.now();
  try {
    if (global.gc) global.gc();
    const extracted = await extractSpec(code);
    await renderSpec(code);
    const result = await diffPilot(code);
    const causes = classesOf(result);
    const unique = [...new Set(causes)];
    const counts = causes.reduce((map, name) => map.set(name, (map.get(name) || 0) + 1), new Map());
    const pagination = result.pagination.multiPage ? (result.pagination.pass ? 'pass' : 'fail') : 'single-page';
    const nonText = result.raster.nonText?.ratio;
    const textInk = result.raster.textInk?.ratio;
    const masked = result.raster.maskedFraction;
    const row = [
      code,
      extracted.pages || extracted.extraction?.pageCount || '',
      result.page.pass ? 'pass' : 'fail',
      result.geometry.pass ? 'pass' : 'fail',
      result.staticText.pass ? 'pass' : 'fail',
      result.dynamicText.pass ? 'pass' : 'fail',
      result.raster.pass ? 'pass' : 'fail',
      pagination,
      unique.join(' | '),
      [...counts].map(([name, count]) => `${name}=${count}`).join('; '),
      nonText,
      textInk,
      masked,
    ].map(csv).join(',');
    await append(FULL, `${row}\n`);

    const nonTextPass = nonText <= 0.005;
    const textInkPass = textInk <= 0.4;
    const maskedPass = masked <= 0.25;
    const rClass = result.raster.pass ? 'pass' : (nonTextPass ? 'R2' : 'R1');
    await append(RASTER, [
      code, nonText, textInk, masked, nonTextPass, textInkPass, maskedPass, result.raster.pass, rClass,
    ].map(csv).join(',') + '\n');

    if (rehearsalSet.has(code) && !tableDone.has(code)) {
      await append(TABLE, [
        code,
        result.raster.ratio,
        nonText,
        textInk,
        masked,
        rClass === 'R1' ? 1 : 0,
        rClass === 'R2' ? 1 : 0,
        result.raster.pass ? 1 : 0,
      ].map(csv).join(',') + '\n');
    }
    console.log(JSON.stringify({
      n: index,
      of: ordered.length,
      code,
      seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      classes: unique,
      rClass,
      clean: unique.length === 0,
    }));
  } catch (error) {
    await append(FULL, `${csv(code)},,,,,extract or render error,${csv(String(error.message || error))},\n`);
    console.error(JSON.stringify({ n: index, code, error: String(error.message || error) }));
  }
}
