/**
 * One document per message. Temp PNGs stay in this worker's directory.
 * Cache: reports/cache/objects/<sha256>/
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parentPort, workerData } from 'node:worker_threads';
import { extractSpec, inspectPdfFile } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';
import { PIPELINE_VERSION } from './pipeline-version.mjs';

const root = workerData.root;
const workDir = path.join(root, 'reports/cache/work', String(workerData.workerId));

function sha256File(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function pdfOf(code) {
  const line = fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8')
    .split(/\r?\n/)
    .find((row) => row.startsWith(`${code},`));
  const file = line?.split(',')[1];
  if (!file) throw new Error(`No reference file for ${code}`);
  return path.join(root, file);
}

function cacheDir(sha) {
  return path.join(root, 'reports/cache/objects', sha);
}

function readMeta(dir) {
  const file = path.join(dir, 'meta.json');
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeMeta(dir, meta) {
  fs.writeFileSync(path.join(dir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
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
  return [...new Set(classes)];
}

async function verify(code) {
  const started = Date.now();
  const pdf = pdfOf(code);
  const sha = sha256File(pdf);
  const dir = cacheDir(sha);
  fs.mkdirSync(dir, { recursive: true });
  const meta = readMeta(dir);
  const timings = {
    code,
    sha: sha.slice(0, 12),
    spec: 'miss',
    reference: 'miss',
    golden: 'miss',
    rendered: 'miss',
    extractMs: 0,
    renderMs: 0,
    rasterReferenceMs: 0,
    rasterRenderedMs: 0,
    diffMs: 0,
  };
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  const cachedSpec = path.join(dir, 'spec.json');
  const extractStarted = Date.now();
  if (meta.extract === PIPELINE_VERSION.extract && fs.existsSync(cachedSpec)) {
    fs.copyFileSync(cachedSpec, specPath);
    timings.spec = 'hit';
  } else {
    await extractSpec(code);
    fs.copyFileSync(specPath, cachedSpec);
    meta.extract = PIPELINE_VERSION.extract;
    meta.sha = sha;
    meta.render = null;
    meta.reference = null;
    writeMeta(dir, meta);
    timings.spec = 'miss';
  }
  timings.extractMs = Date.now() - extractStarted;

  const readPath = path.join(dir, 'reference-read.json');
  let referenceInspect = null;
  if (meta.extract === PIPELINE_VERSION.extract && meta.reference === PIPELINE_VERSION.extract && fs.existsSync(readPath)) {
    referenceInspect = JSON.parse(fs.readFileSync(readPath, 'utf8'));
    timings.reference = 'hit';
  } else {
    const readStarted = Date.now();
    referenceInspect = await inspectPdfFile(pdf);
    fs.writeFileSync(readPath, JSON.stringify(referenceInspect));
    meta.reference = PIPELINE_VERSION.extract;
    writeMeta(dir, meta);
    timings.reference = 'miss';
    timings.extractMs += Date.now() - readStarted;
  }

  const renderedCache = path.join(dir, `rendered-${PIPELINE_VERSION.render}.pdf`);
  const renderedOut = path.join(root, 'reports/output', `${code}.pdf`);
  fs.mkdirSync(path.dirname(renderedOut), { recursive: true });
  const renderStarted = Date.now();
  if (meta.extract === PIPELINE_VERSION.extract && meta.render === PIPELINE_VERSION.render && fs.existsSync(renderedCache)) {
    fs.copyFileSync(renderedCache, renderedOut);
    timings.rendered = 'hit';
  } else {
    await renderSpec(code);
    fs.copyFileSync(renderedOut, renderedCache);
    meta.render = PIPELINE_VERSION.render;
    writeMeta(dir, meta);
    timings.rendered = 'miss';
  }
  timings.renderMs = Date.now() - renderStarted;

  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  const diffStarted = Date.now();
  const result = await diffPilot(code, {
    referenceInspect,
    workDir,
    goldenDir: path.join(dir, 'golden'),
    writeHeatmap: false,
    fastMetrics: true,
    skipDeviation: true,
    timing: timings,
  });
  timings.diffMs = Date.now() - diffStarted;
  fs.rmSync(workDir, { recursive: true, force: true });
  const classes = classesOf(result);
  return {
    code,
    pages: result.page?.reference?.[2] || '',
    page: result.page.pass ? 'pass' : 'fail',
    geometry: result.geometry.pass ? 'pass' : 'fail',
    static: result.staticText.pass ? 'pass' : 'fail',
    dynamic: result.dynamicText.pass ? 'pass' : 'fail',
    raster: result.raster.pass ? 'pass' : 'fail',
    pagination: result.pagination.multiPage ? (result.pagination.pass ? 'pass' : 'fail') : 'single-page',
    classes,
    nonText: result.raster.nonText?.ratio,
    textInk: result.raster.textInk?.ratio,
    masked: result.raster.maskedFraction,
    timings,
    seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
  };
}

parentPort.on('message', async (message) => {
  if (!message || message.type === 'stop') {
    parentPort.close();
    return;
  }
  try {
    const row = await verify(message.code);
    parentPort.postMessage({ ok: true, row });
  } catch (error) {
    parentPort.postMessage({ ok: false, code: message.code, error: String(error?.stack || error) });
  }
});
