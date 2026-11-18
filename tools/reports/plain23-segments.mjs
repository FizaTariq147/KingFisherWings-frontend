/**
 * After the page-box and precision render, measure the 23 non-rotated R1
 * documents. Keep the geometry-only rasters and, for those that still fail,
 * the 20 segments with the most differing pixels.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractSpec } from './extract.mjs';
import { renderSpec } from './render-spec.mjs';
import { geometryOnlyRatio } from './content-layers.mjs';
import { readOperators } from './read-operators.mjs';
import { readPageBoxes } from './page-box.mjs';

const codes = JSON.parse(fs.readFileSync('reports/output/track-a4/plain-r1-codes.json', 'utf8'));
const outRoot = path.resolve('reports/output/track-a4/plain23');
const SCALE = 150 / 72;

async function vectors(pdfPath) {
  const boxes = await readPageBoxes(pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const pages = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const view = page.getViewport({ scale: 1 });
    const box = boxes[index - 1];
    const [x0, y0, x1, y1] = box.mediaBox;
    const read = readOperators(await page.getOperatorList(), page, {
      width: view.width,
      height: view.height,
      minX: x0,
      minY: y0,
      maxX: x1,
      maxY: y1,
    });
    pages.push({
      width: view.width,
      height: view.height,
      lines: read.lines || [],
      rects: read.rects || [],
    });
  }
  return pages;
}

function bandCount(left, right, line) {
  const width = Math.min(left.width, right.width);
  const height = Math.min(left.height, right.height);
  const pad = ((line.width || 0.5) + 1.5) * SCALE;
  const x0 = Math.max(0, Math.floor(Math.min(line.x1, line.x2) * SCALE - pad));
  const x1 = Math.min(width, Math.ceil(Math.max(line.x1, line.x2) * SCALE + pad));
  const yTop = (line.pageHeight - Math.max(line.y1, line.y2)) * SCALE - pad;
  const yBot = (line.pageHeight - Math.min(line.y1, line.y2)) * SCALE + pad;
  const y0 = Math.max(0, Math.floor(Math.min(yTop, yBot)));
  const y1 = Math.min(height, Math.ceil(Math.max(yTop, yBot)));
  let count = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const a = (y * left.width + x) * 4;
      const b = (y * right.width + x) * 4;
      if (left.data[a] !== right.data[b] || left.data[a + 1] !== right.data[b + 1] || left.data[a + 2] !== right.data[b + 2]) count += 1;
    }
  }
  return count;
}

function nearest(line, others) {
  let best = null;
  let score = Infinity;
  for (const other of others) {
    const next = Math.hypot(line.x1 - other.x1, line.y1 - other.y1) + Math.hypot(line.x2 - other.x2, line.y2 - other.y2);
    if (next < score) {
      score = next;
      best = other;
    }
  }
  return { line: best, score };
}

function round(value) {
  return value == null ? null : Math.round(value * 10000) / 10000;
}

const results = [];
for (const code of codes) {
  const started = Date.now();
  await extractSpec(code);
  await renderSpec(code);
  const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
  const dir = path.join(outRoot, code);
  const ratio = await geometryOnlyRatio(spec.source, path.join('reports/output', `${code}.pdf`), dir);
  const row = {
    code,
    ratio: ratio.ratio,
    pass: ratio.pass,
    mismatches: ratio.mismatches,
    pixels: ratio.pixels,
    ms: Date.now() - started,
  };
  if (!ratio.pass) {
    const reference = await vectors(path.join(dir, 'geometry-ref.pdf'));
    const output = await vectors(path.join(dir, 'geometry-out.pdf'));
    const ranked = [];
    for (let index = 0; index < reference.length; index += 1) {
      const leftFile = path.join(dir, `geometry-ref-${index + 1}.png`);
      const rightFile = path.join(dir, `geometry-out-${index + 1}.png`);
      if (!fs.existsSync(leftFile) || !fs.existsSync(rightFile)) continue;
      const left = PNG.sync.read(fs.readFileSync(leftFile));
      const right = PNG.sync.read(fs.readFileSync(rightFile));
      const page = reference[index];
      const outLines = output[index]?.lines || [];
      for (const line of page.lines) {
        const placed = { ...line, pageHeight: page.height };
        const mismatches = bandCount(left, right, placed);
        if (!mismatches) continue;
        const hit = nearest(line, outLines);
        ranked.push({
          page: index + 1,
          mismatches,
          width: line.width,
          source: line.source || 'stroke',
          color: line.color,
          reference: { x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2 },
          output: hit.line ? { x1: hit.line.x1, y1: hit.line.y1, x2: hit.line.x2, y2: hit.line.y2, width: hit.line.width, color: hit.line.color, source: hit.line.source } : null,
          endpointDistance: round(hit.score),
        });
      }
    }
    ranked.sort((a, b) => b.mismatches - a.mismatches);
    const top = ranked.slice(0, 20);
    const distances = top.map((item) => item.endpointDistance).filter((value) => value != null);
    row.top = top;
    row.distance = {
      matched: distances.length,
      max: distances.length ? Math.max(...distances) : null,
      median: distances.length ? distances.slice().sort((a, b) => a - b)[Math.floor(distances.length / 2)] : null,
    };
    row.referenceLines = reference.reduce((sum, page) => sum + page.lines.length, 0);
    row.outputLines = output.reduce((sum, page) => sum + page.lines.length, 0);
    row.referenceRects = reference.reduce((sum, page) => sum + page.rects.length, 0);
    row.outputRects = output.reduce((sum, page) => sum + page.rects.length, 0);
  }
  results.push(row);
  console.log(JSON.stringify({ code, pass: row.pass, ratio: Number(row.ratio.toFixed(6)), ms: row.ms, distance: row.distance || null, lines: row.referenceLines == null ? null : [row.referenceLines, row.outputLines] }));
}
fs.mkdirSync(outRoot, { recursive: true });
fs.writeFileSync(path.join(outRoot, 'segments.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({
  documents: results.length,
  stillFail: results.filter((row) => !row.pass).length,
  nowPass: results.filter((row) => row.pass).map((row) => row.code),
}));
