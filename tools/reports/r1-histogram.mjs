/**
 * Report-only distances for R1 non-text pixels. Does not change a mask or a limit.
 * Run: node tools/reports/r1-histogram.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { diffPilot } from './diff-pilot.mjs';

function parse(line) {
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
}

function add(target, source) {
  for (const key of Object.keys(target)) target[key] += source[key] || 0;
}

function cropPair(referencePath, renderedPath, bounds) {
  const pad = 12;
  const left = PNG.sync.read(fs.readFileSync(referencePath));
  const right = PNG.sync.read(fs.readFileSync(renderedPath));
  const x0 = Math.max(0, bounds.x0 - pad);
  const y0 = Math.max(0, bounds.y0 - pad);
  const x1 = Math.min(left.width, bounds.x1 + pad);
  const y1 = Math.min(left.height, bounds.y1 + pad);
  const width = Math.max(1, x1 - x0);
  const height = Math.max(1, y1 - y0);
  function cut(image) {
    const out = new PNG({ width, height });
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const src = ((y0 + y) * image.width + (x0 + x)) * 4;
        const dst = (y * width + x) * 4;
        out.data[dst] = image.data[src];
        out.data[dst + 1] = image.data[src + 1];
        out.data[dst + 2] = image.data[src + 2];
        out.data[dst + 3] = 255;
      }
    }
    return out;
  }
  const a = cut(left);
  const b = cut(right);
  const gap = 8;
  const sheet = new PNG({ width: a.width + b.width + gap, height: Math.max(a.height, b.height) });
  sheet.data.fill(255);
  for (const [image, ox] of [[a, 0], [b, a.width + gap]]) {
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const src = (y * image.width + x) * 4;
        const dst = (y * sheet.width + ox + x) * 4;
        sheet.data[dst] = image.data[src];
        sheet.data[dst + 1] = image.data[src + 1];
        sheet.data[dst + 2] = image.data[src + 2];
        sheet.data[dst + 3] = 255;
      }
    }
  }
  return PNG.sync.write(sheet);
}

const rows = fs.readFileSync('reports/full-run-track-a-last.csv', 'utf8').trim().split(/\r?\n/).slice(1).map(parse);
const codes = rows.filter((parts) => (parts[8] || '').includes('raster R1')).map((parts) => parts[0]);
const outDir = 'reports/output/track-a2/r1';
fs.mkdirSync(outDir, { recursive: true });
const documents = [];

for (const code of codes) {
  const workDir = path.join(outDir, 'work', code);
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  const started = Date.now();
  const result = await diffPilot(code, {
    fastMetrics: true,
    writeHeatmap: false,
    skipDeviation: true,
    diagnoseNonText: true,
    workDir,
  });
  const pages = result.raster.nonTextDiagnosis || [];
  const toText = { '0-1': 0, '2-3': 0, '4-8': 0, 'over 8': 0 };
  const toImage = { '0-1': 0, '2-3': 0, '4-8': 0, 'over 8': 0 };
  const toEither = { '0-1': 0, '2-3': 0, '4-8': 0, 'over 8': 0 };
  const far = { fills: 0, strokes: 0, clip: 0, images: 0, other: 0 };
  let bounds = null;
  let boundsPage = null;
  for (const page of pages) {
    add(toText, page.toText);
    add(toImage, page.toImage);
    add(toEither, page.toEither);
    for (const key of Object.keys(far)) far[key] += page.far[key] || 0;
    if (page.bounds && (!bounds || page.farCount > (bounds.farCount || 0))) {
      bounds = { ...page.bounds, farCount: page.farCount };
      boundsPage = page.page;
    }
  }
  documents.push({
    code,
    nonText: result.raster.nonText?.ratio,
    textInk: result.raster.textInk?.ratio,
    toText,
    toImage,
    toEither,
    far,
    seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
    boundsPage,
  });
  if (bounds && boundsPage) {
    const reference = fs.readdirSync(workDir).find((name) => name.startsWith(`${code}-reference-${boundsPage}`));
    const rendered = fs.readdirSync(workDir).find((name) => name.startsWith(`${code}-rendered-${boundsPage}`));
    if (reference && rendered) {
      fs.writeFileSync(path.join(outDir, `${code}-far.png`), cropPair(path.join(workDir, reference), path.join(workDir, rendered), bounds));
    }
  }
  fs.rmSync(workDir, { recursive: true, force: true });
  console.log(JSON.stringify({ n: documents.length, of: codes.length, code, far: toEither['over 8'], seconds: documents.at(-1).seconds }));
}

documents.sort((left, right) => right.toEither['over 8'] - left.toEither['over 8']);
const payload = {
  note: 'Distances are in raster pixels at 150 dpi. Masks and limits are unchanged. over 8 is farther than 8 px from both the nearest text span box and the nearest allowed image box. clip is 0 because the spec does not record clip paths.',
  documents,
  worst10: documents.slice(0, 10).map((row) => row.code),
};
fs.writeFileSync('reports/output/track-a2/r1-histogram.json', `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ documents: documents.length, worst10: payload.worst10 }));
