/**
 * Re-measure a set of codes; compare against a previous clean set for regressions.
 * Usage: node --max-old-space-size=8192 --expose-gc tools/reports/track-a-iter.mjs <label> [codes-file-or-csv]
 * If no codes file, remesures every in-scope census code (writes reports/full-run-track-a-<label>.csv).
 */
import fs from 'node:fs';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const label = process.argv[2] || 'iter';
const codesArg = process.argv[3];
const OUT_OF_SCOPE = new Set(['BARCODE_AWB_REPORT_FORMAT', 'STANDARD_INVOICE_RPM_REF_79']);
const OUT = `reports/full-run-track-a-${label}.csv`;
const PREV_CLEAN = 'reports/output/track-a/prev-clean.json';

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

function parseCsv(file) {
  return fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
    const parts = [];
    let cur = '';
    let q = false;
    for (const ch of line) {
      if (ch === '"') {
        q = !q;
        continue;
      }
      if (ch === ',' && !q) {
        parts.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    parts.push(cur);
    return parts;
  });
}

let codes;
if (codesArg && fs.existsSync(codesArg)) {
  const text = fs.readFileSync(codesArg, 'utf8');
  if (codesArg.endsWith('.json')) codes = JSON.parse(text);
  else if (codesArg.endsWith('.csv')) codes = parseCsv(codesArg).map((parts) => parts[0]).filter((code) => code && !OUT_OF_SCOPE.has(code));
  else codes = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
} else {
  codes = fs.readFileSync('reports/capability-census.csv', 'utf8').trim().split(/\r?\n/).slice(1)
    .map((line) => line.split(',')[0])
    .filter((code) => code && !OUT_OF_SCOPE.has(code));
}

const prevClean = fs.existsSync(PREV_CLEAN) ? new Set(JSON.parse(fs.readFileSync(PREV_CLEAN, 'utf8'))) : new Set();
fs.writeFileSync(OUT, 'code,pages,page,geometry,static,dynamic,raster,pagination,failure_class,cause_counts,non_text,text_ink,masked_fraction\n');

const regressions = [];
let clean = 0;
let index = 0;
for (const code of codes) {
  index += 1;
  if (OUT_OF_SCOPE.has(code)) continue;
  try {
    if (global.gc) global.gc();
    const extracted = await extractSpec(code);
    await renderSpec(code);
    const result = await diffPilot(code);
    const causes = classesOf(result);
    const unique = [...new Set(causes)];
    if (!unique.length) clean += 1;
    if (prevClean.has(code) && unique.length) regressions.push({ code, classes: unique });
    const pagination = result.pagination.multiPage ? (result.pagination.pass ? 'pass' : 'fail') : 'single-page';
    const counts = causes.reduce((map, name) => map.set(name, (map.get(name) || 0) + 1), new Map());
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
      result.raster.nonText?.ratio,
      result.raster.textInk?.ratio,
      result.raster.maskedFraction,
    ].map(csv).join(',');
    fs.appendFileSync(OUT, `${row}\n`);
    console.log(JSON.stringify({ n: index, of: codes.length, code, classes: unique, clean }));
  } catch (error) {
    fs.appendFileSync(OUT, `${csv(code)},,,,,extract or render error,${csv(String(error.message || error))},\n`);
    console.error(JSON.stringify({ n: index, code, error: String(error.message || error) }));
  }
}

fs.writeFileSync(`reports/output/track-a/${label}-regressions.json`, `${JSON.stringify(regressions, null, 2)}\n`);
console.log(JSON.stringify({ label, docs: codes.length, clean, regressions: regressions.length }));
