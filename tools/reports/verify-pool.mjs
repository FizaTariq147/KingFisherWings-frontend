/**
 * Parallel verify. One document per worker, isolated temp PNGs.
 * Usage:
 *   node tools/reports/verify-pool.mjs subset
 *   node tools/reports/verify-pool.mjs full
 *   node tools/reports/verify-pool.mjs list reports/cache/subset-80.json
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { PIPELINE_VERSION, versionKey } from './pipeline-version.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_OF_SCOPE = new Set(['BARCODE_AWB_REPORT_FORMAT', 'STANDARD_INVOICE_RPM_REF_79']);
const PILOTS = [
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'TRIAL_BALANCE_REPORT_FORMAT_1_TRIAL_BALANCE_SUMMARY',
];
const BASELINE = path.join(root, 'reports/full-run-track-a.csv');
const SUBSET_FILE = path.join(root, 'reports/cache/subset-80.json');

function parseLine(line) {
  const parts = [];
  let cur = '';
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === ',' && !quoted) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

function csv(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function censusCodes() {
  return fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8')
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(',')[0])
    .filter((code) => code && !OUT_OF_SCOPE.has(code));
}

function baselineRows() {
  return fs.readFileSync(BASELINE, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean).map(parseLine)
    .filter((parts) => parts[0] && !String(parts.join(',')).includes('out of scope'));
}

function familiesOf() {
  const text = fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8');
  const map = new Map();
  const pattern = /"code": "([^"]+)"\s*,\s*"name": "[^"]*"\s*,\s*"family": "([^"]+)"/g;
  for (const match of text.matchAll(pattern)) map.set(match[1], match[2]);
  return map;
}

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

export function buildSubset() {
  const codes = censusCodes();
  const codeSet = new Set(codes);
  const rows = baselineRows().filter((parts) => codeSet.has(parts[0]));
  const failing = rows.filter((parts) => (parts[8] || '').trim());
  const rank = (cls) => {
    if (cls.includes('raster R1')) return 0;
    if (cls.includes('raster R2')) return 1;
    if (cls.includes('static')) return 2;
    if (cls.includes('dynamic')) return 3;
    return 4;
  };
  failing.sort((a, b) => rank(a[8] || '') - rank(b[8] || '') || a[0].localeCompare(b[0]));
  const chosen = [];
  const seen = new Set();
  function add(code) {
    if (!code || seen.has(code) || !codeSet.has(code)) return;
    seen.add(code);
    chosen.push(code);
  }
  for (const code of PILOTS) add(code);
  for (const parts of failing) add(parts[0]);
  const familyMap = familiesOf();
  const byFamily = new Map();
  for (const code of codes) {
    const family = familyMap.get(code) || 'unregistered';
    if (!byFamily.has(family)) byFamily.set(family, []);
    byFamily.get(family).push(code);
  }
  const random = mulberry32(8);
  const familyOrder = shuffle([...byFamily.keys()], random);
  for (const family of familyOrder) {
    if (chosen.length >= 80) break;
    const already = byFamily.get(family).some((code) => seen.has(code));
    if (already) continue;
    const pick = shuffle(byFamily.get(family), random)[0];
    add(pick);
  }
  const rest = shuffle(codes.filter((code) => !seen.has(code)), mulberry32(8));
  for (const code of rest) {
    if (chosen.length >= 80) break;
    add(code);
  }
  const payload = {
    seed: 8,
    size: chosen.length,
    pilots: PILOTS,
    version: versionKey(),
    note: 'Fixed subset: four pilots, baseline failure documents, then a seed-8 family sample up to 80.',
    codes: chosen.slice(0, Math.max(80, chosen.length)),
  };
  // Keep every pilot and every baseline failure even when that exceeds 80.
  // Extra seeded rows are only added while the list is under 80.
  fs.mkdirSync(path.dirname(SUBSET_FILE), { recursive: true });
  fs.writeFileSync(SUBSET_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
}

function codesFor(mode, listFile) {
  if (mode === 'subset') {
    if (!fs.existsSync(SUBSET_FILE)) buildSubset();
    return JSON.parse(fs.readFileSync(SUBSET_FILE, 'utf8')).codes;
  }
  if (mode === 'full') return censusCodes();
  if (mode === 'list') return JSON.parse(fs.readFileSync(listFile, 'utf8')).codes || JSON.parse(fs.readFileSync(listFile, 'utf8'));
  throw new Error(`Unknown mode ${mode}`);
}

function outputFile(mode) {
  if (mode === 'full') return path.join(root, 'reports/full-run-track-a-last.csv');
  if (mode === 'subset') return path.join(root, 'reports/full-run-track-a-subset.csv');
  return path.join(root, 'reports/full-run-track-a-list.csv');
}

async function main() {
  const mode = process.argv[2] || 'subset';
  const listFile = process.argv[3];
  if (mode === 'build-subset') {
    const payload = buildSubset();
    console.log(JSON.stringify({ size: payload.size, note: payload.note }));
    return;
  }
  const codes = codesFor(mode, listFile);
  const outFile = outputFile(mode);
  const cores = os.availableParallelism?.() || os.cpus().length;
  const workerCount = Math.max(2, Math.min(cores, 6));
  console.log(JSON.stringify({ version: PIPELINE_VERSION, documents: codes.length, workers: workerCount, cores }));
  fs.writeFileSync(outFile, 'code,pages,page,geometry,static,dynamic,raster,pagination,failure_class,cause_counts,non_text,text_ink,masked_fraction\n');
  const queue = [...codes];
  let finished = 0;
  const cleanBaseline = new Set(baselineRows().filter((parts) => !(parts[8] || '').trim()).map((parts) => parts[0]));
  const regressions = [];
  const totals = { extractMs: 0, renderMs: 0, rasterReferenceMs: 0, rasterRenderedMs: 0, diffMs: 0, specHit: 0, specMiss: 0, goldenHit: 0, goldenMiss: 0 };
  const pool = Array.from({ length: workerCount }, (_, index) => new Worker(new URL('./verify-worker.mjs', import.meta.url), {
    workerData: { root, workerId: index },
  }));
  let active = 0;
  await new Promise((resolve, reject) => {
    function pump(worker) {
      if (!queue.length) {
        if (active === 0) resolve();
        return;
      }
      active += 1;
      worker.postMessage({ code: queue.shift() });
    }
    for (const worker of pool) {
      worker.on('message', (message) => {
        active -= 1;
        finished += 1;
        if (!message.ok) {
          fs.appendFileSync(outFile, `${csv(message.code)},,,,,extract or render error,${csv(message.error)},\n`);
          console.log(JSON.stringify({ n: finished, of: codes.length, code: message.code, error: String(message.error).split('\n')[0] }));
        } else {
          const row = message.row;
          const classes = row.classes || [];
          if (cleanBaseline.has(row.code) && classes.length) regressions.push({ code: row.code, classes });
          const line = [
            row.code, row.pages, row.page, row.geometry, row.static, row.dynamic, row.raster, row.pagination,
            classes.join(' | '), classes.map((name) => `${name}=1`).join('; '),
            row.nonText, row.textInk, row.masked,
          ].map(csv).join(',');
          fs.appendFileSync(outFile, `${line}\n`);
          const t = row.timings || {};
          totals.extractMs += t.extractMs || 0;
          totals.renderMs += t.renderMs || 0;
          totals.rasterReferenceMs += t.rasterReferenceMs || 0;
          totals.rasterRenderedMs += t.rasterRenderedMs || 0;
          totals.diffMs += t.diffMs || 0;
          if (t.spec === 'hit') totals.specHit += 1; else totals.specMiss += 1;
          if (t.golden === 'hit') totals.goldenHit += 1; else totals.goldenMiss += 1;
          console.log(JSON.stringify({
            n: finished,
            of: codes.length,
            code: row.code,
            seconds: row.seconds,
            classes,
            extractMs: t.extractMs,
            spec: t.spec,
            reference: t.reference,
            renderMs: t.renderMs,
            rendered: t.rendered,
            rasterReferenceMs: t.rasterReferenceMs,
            rasterRenderedMs: t.rasterRenderedMs,
            golden: t.golden,
            diffMs: t.diffMs,
          }));
        }
        pump(worker);
      });
      worker.on('error', reject);
      pump(worker);
    }
  });
  await Promise.all(pool.map((worker) => worker.terminate()));
  const summary = { outFile, documents: codes.length, regressions: regressions.length, regressionCodes: regressions, totals, version: PIPELINE_VERSION };
  fs.writeFileSync(outFile.replace(/\.csv$/, '-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify(summary));
}

const mode = process.argv[2] || 'subset';
if (mode === 'build-subset') {
  const payload = buildSubset();
  console.log(JSON.stringify({ size: payload.codes.length, note: payload.note }));
} else {
  await main();
}
