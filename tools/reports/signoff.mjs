/**
 * npm run report:signoff -- <code> <reviewer>
 * Appends or updates reports/signoff.csv only when every layer passes,
 * or when the code's line in reports/exceptions.md contains the word approved.
 * Does not change catalogue status.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffPilot } from './diff-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const code = process.argv[2];
const reviewer = process.argv[3];
if (!code || !reviewer) {
  console.error('Usage: npm run report:signoff -- <code> <reviewer>');
  process.exit(1);
}

function referenceFile(target) {
  const mapped = fs.readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8');
  const line = mapped.split(/\r?\n/).find((row) => row.startsWith(`${target},`));
  const file = line?.match(/reports\/references\/files\/[^,]+/)?.[0];
  if (file) return path.join(root, file);
  const census = fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8');
  const censusFile = census.split(/\r?\n/).find((row) => row.startsWith(`${target},`))?.split(',')[1];
  if (censusFile) return path.join(root, censusFile);
  throw new Error(`No reference for ${target}`);
}

function approvedException(target) {
  const text = fs.readFileSync(path.join(root, 'reports/exceptions.md'), 'utf8');
  return text.split(/\r?\n/).some((line) => line.includes(target) && /\bapproved\b/.test(line));
}

const result = await diffPilot(code, { fastMetrics: true, writeHeatmap: false, skipDeviation: true });
const layers = [result.page, result.geometry, result.staticText, result.dynamicText, result.raster];
if (result.pagination.multiPage) layers.push(result.pagination);
const passed = layers.every((layer) => layer.pass);
if (!passed && !approvedException(code)) {
  console.error(`${code} is not eligible: a layer failed and reports/exceptions.md has no approved flag for it`);
  process.exit(1);
}

const file = referenceFile(code);
const referenceHash = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const date = new Date().toISOString().slice(0, 10);
const signoff = path.join(root, 'reports/signoff.csv');
const lines = fs.readFileSync(signoff, 'utf8').split(/\r?\n/).filter((line, index) => line || index === 0);
const row = [code, reviewer, date, referenceHash].join(',');
const next = lines.some((line) => line.startsWith(`${code},`))
  ? lines.map((line) => (line.startsWith(`${code},`) ? row : line))
  : [...lines, row];
fs.writeFileSync(signoff, `${next.join('\n').replace(/\n*$/, '\n')}`);
console.log(JSON.stringify({ code, reviewer, date, referenceHash, passed, approvedException: approvedException(code) }));
