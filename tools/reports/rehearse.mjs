/**
 * Seeded 20-PDF rehearsal. Report only: specs are generated and verified, not corrected.
 * Run: node tools/reports/rehearse.mjs [--seed=5] [--exclude=reports/output/rehearsal/seed-5.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const seedArg = process.argv.find((arg) => arg.startsWith('--seed='));
const SEED = seedArg ? Number(seedArg.slice('--seed='.length)) : 5;
const PILOTS = new Set([
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY',
]);

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, random) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') { cell += '"'; index += 1; }
        else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function familiesOf() {
  const families = new Map();
  let code = '';
  for (const line of fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8').split(/\n/)) {
    const codeMatch = line.match(/"code": "([^"]+)"/);
    const familyMatch = line.match(/"family": "([^"]+)"/);
    if (codeMatch) code = codeMatch[1];
    else if (familyMatch && code) { families.set(code, familyMatch[1]); code = ''; }
  }
  return families;
}

function excluded() {
  const codes = new Set(PILOTS);
  const flag = process.argv.find((arg) => arg.startsWith('--exclude='));
  if (!flag) return codes;
  const data = JSON.parse(fs.readFileSync(path.resolve(flag.slice('--exclude='.length)), 'utf8'));
  for (const item of data.selected || data) codes.add(item.code || item);
  return codes;
}

function select() {
  const skip = excluded();
  const families = familiesOf();
  const census = new Map();
  for (const row of parseCsv(fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8')).slice(1)) {
    if (!row[0]) continue;
    census.set(row[0], { pages: Number(row[2]) || 1, renderModes: Number(row[9]) || 0 });
  }
  const pdfs = new Set();
  for (const line of fs.readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8').split(/\n/).slice(1)) {
    const match = line.match(/^([^,]+),(reports\/references\/files\/[^,]+\.pdf)/i);
    if (match) pdfs.add(match[1]);
  }
  const candidates = [...pdfs].filter((code) => !skip.has(code) && census.has(code)).map((code) => ({
    code,
    family: families.get(code) || 'other',
    pages: census.get(code).pages,
    renderModes: census.get(code).renderModes,
  }));
  const random = mulberry32(SEED);
  const pool = shuffle(candidates, random);
  const chosen = [];
  const take = (test, count) => {
    for (const item of pool) {
      if (chosen.length >= 20 || chosen.filter(test).length >= count) break;
      if (!test(item) || chosen.includes(item)) continue;
      chosen.push(item);
    }
  };
  take((item) => item.pages > 1, 3);
  take((item) => item.renderModes > 0, 3);
  const seen = new Set(chosen.map((item) => item.family));
  for (const item of pool) {
    if (chosen.length >= 20) break;
    if (chosen.includes(item) || seen.has(item.family)) continue;
    chosen.push(item);
    seen.add(item.family);
  }
  for (const item of pool) {
    if (chosen.length >= 20) break;
    if (!chosen.includes(item)) chosen.push(item);
  }
  return chosen.slice(0, 20);
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

const selected = select();
const documents = [];
for (const item of selected) {
  try {
    const extracted = await extractSpec(item.code);
    await renderSpec(item.code);
    const result = await diffPilot(item.code);
    const classes = classesOf(result);
    documents.push({
      ...item,
      pagesExtracted: extracted.pages,
      layoutKind: extracted.layoutKind,
      uncaptured: result.geometry.uncaptured,
      staticFailures: result.staticText.failures.length,
      dynamicFailures: result.dynamicText.failures.length,
      raster: result.raster.ratio,
      paginationPass: result.pagination.pass,
      classes: [...new Set(classes)],
      classCounts: classes.reduce((counts, name) => ({ ...counts, [name]: (counts[name] || 0) + 1 }), {}),
    });
    console.log(JSON.stringify({ code: item.code, family: item.family, classes: documents.at(-1).classes, raster: result.raster.ratio }));
  } catch (error) {
    documents.push({ ...item, error: String(error.message || error), classes: ['extract or render error'] });
    console.log(JSON.stringify({ code: item.code, error: String(error.message || error) }));
  }
}

const grouped = {};
for (const document of documents) {
  for (const [name, count] of Object.entries(document.classCounts || { 'extract or render error': 1 })) {
    const group = grouped[name] || { documents: 0, instances: 0 };
    group.documents += 1;
    group.instances += count;
    grouped[name] = group;
  }
}

const summary = {
  seed: SEED,
  selected: selected.map((item) => ({ code: item.code, family: item.family, pages: item.pages, renderModes: item.renderModes })),
  multiPage: selected.filter((item) => item.pages > 1).length,
  textRenderModes: selected.filter((item) => item.renderModes > 0).length,
  families: [...new Set(selected.map((item) => item.family))],
  grouped,
  documents,
};
const outDir = path.join(root, 'reports/output/rehearsal');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `seed-${SEED}.json`), JSON.stringify(summary, null, 2));
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(path.join(outDir, `seed-${SEED}.json`));
