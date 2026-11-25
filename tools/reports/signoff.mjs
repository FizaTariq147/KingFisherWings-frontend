/**
 * npm run report:signoff -- <code> <reviewer>
 * Absolute-spec codes: appends reports/signoff.csv only when every layer passes,
 * or when the code's line in reports/exceptions.md contains the word approved.
 * Flow codes: six layers do not apply — see docs/reports/FLOW_ACCEPTANCE.md.
 * Does not change catalogue status. Do not invent acceptance.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffPilot } from './diff-pilot.mjs';
import { isFlowInvoiceCode } from './invoice-flow-options.mjs';
import { flowTemplateHash } from './flow-template-hash.mjs';

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

function writeSignoff(target, reviewerName, referenceHash) {
  const date = new Date().toISOString().slice(0, 10);
  const signoff = path.join(root, 'reports/signoff.csv');
  const lines = fs.readFileSync(signoff, 'utf8').split(/\r?\n/).filter((line, index) => line || index === 0);
  const row = [target, reviewerName, date, referenceHash].join(',');
  const next = lines.some((line) => line.startsWith(`${target},`))
    ? lines.map((line) => (line.startsWith(`${target},`) ? row : line))
    : [...lines, row];
  fs.writeFileSync(signoff, `${next.join('\n').replace(/\n*$/, '\n')}`);
  return { code: target, reviewer: reviewerName, date, referenceHash };
}

function assertFlowAcceptance(target) {
  const reconcilePath = path.join(root, 'reports/flow-spike/reconcile-25.json');
  if (!fs.existsSync(reconcilePath)) {
    throw new Error('Missing reports/flow-spike/reconcile-25.json — run node tools/reports/flow-reconcile.mjs');
  }
  const reconcile = JSON.parse(fs.readFileSync(reconcilePath, 'utf8'));
  if (reconcile.summary?.recordPass !== reconcile.summary?.total) {
    throw new Error(`Flow money reconciliation incomplete: ${reconcile.summary?.recordPass}/${reconcile.summary?.total}`);
  }

  const leakPath = path.join(root, 'reports/output/invoice-v2/leak-check.json');
  if (!fs.existsSync(leakPath)) {
    throw new Error('Missing leak-check.json — run npm run report:leak-check');
  }
  const leak = JSON.parse(fs.readFileSync(leakPath, 'utf8'));
  const leakRows = Array.isArray(leak) ? leak : leak.results || leak.codes || [];
  const dirty = leakRows.filter((row) => Number(row.leaks || 0) > 0);
  if (dirty.length) {
    throw new Error(`Leak check is not clean (${dirty.length} codes with leaks)`);
  }

  const demo = path.join(root, 'reports/flow-spike/demo-vs-reference.png');
  const contact = path.join(root, 'reports/flow-spike/contact-sheet.png');
  const hashFile = path.join(root, 'reports/flow-spike/template-hash.txt');
  if (!fs.existsSync(demo) || !fs.existsSync(contact)) {
    throw new Error('Missing demo-vs-reference.png or contact-sheet.png — run node tools/reports/flow-spike.mjs');
  }
  if (!fs.existsSync(hashFile)) {
    throw new Error('Missing template-hash.txt — run flow-spike / flow-template-hash');
  }
  const stored = fs.readFileSync(hashFile, 'utf8').trim();
  const current = flowTemplateHash();
  if (stored !== current) {
    throw new Error(`Template hash mismatch: stored ${stored.slice(0, 12)}… current ${current.slice(0, 12)}…`);
  }

  return { reconcile: reconcile.summary, templateHash: current, target };
}

if (isFlowInvoiceCode(code)) {
  try {
    const check = assertFlowAcceptance(code);
    const written = writeSignoff(code, reviewer, check.templateHash);
    console.log(JSON.stringify({ ...written, engine: 'flow', passed: true, check }, null, 2));
  } catch (error) {
    console.error(`${code} is not eligible for flow sign-off: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
  process.exit(0);
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
const written = writeSignoff(code, reviewer, referenceHash);
console.log(JSON.stringify({ ...written, passed, approvedException: approvedException(code) }));
