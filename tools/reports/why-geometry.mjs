import fs from 'node:fs';
import path from 'node:path';
import { inspectPdfFile } from './extract.mjs';
import { displayGeometry } from './page-box.mjs';

const code = process.argv[2];
const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
const rendered = await inspectPdfFile(path.join('reports/output', `${code}.pdf`));
const specPage = spec.pages[0];
const outPage = rendered.pageReads[0];
const left = displayGeometry(specPage, specPage.pageBox);
const right = displayGeometry(outPage, outPage.pageBox);

function fieldDiff(item, other, keys) {
  const diffs = [];
  for (const key of keys) {
    const a = item[key];
    const b = other[key];
    if (typeof a === 'number' || typeof b === 'number') {
      if (Math.abs((a || 0) - (b || 0)) > 0.1) diffs.push(`${key}:${a}->${b}`);
    } else if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) diffs.push(`${key}:${JSON.stringify(a)}->${JSON.stringify(b)}`);
  }
  return diffs;
}

function nearest(item, others, score) {
  let best = null;
  let bestScore = Infinity;
  for (const other of others) {
    const next = score(other);
    if (next < bestScore) { bestScore = next; best = other; }
  }
  return { best, bestScore };
}

const lineMiss = [];
for (const line of left.lines || []) {
  const hit = nearest(line, right.lines || [], (other) =>
    Math.abs(line.x1 - other.x1) + Math.abs(line.y1 - other.y1) + Math.abs(line.x2 - other.x2) + Math.abs(line.y2 - other.y2));
  const diffs = hit.best ? fieldDiff(line, hit.best, ['x1', 'y1', 'x2', 'y2', 'width', 'color', 'lineCap', 'lineJoin', 'dash']) : ['none'];
  if (diffs.length) lineMiss.push({ diffs, distance: hit.bestScore, line: [line.x1, line.y1, line.x2, line.y2, line.width, line.color], other: hit.best && [hit.best.x1, hit.best.y1, hit.best.x2, hit.best.y2, hit.best.width, hit.best.color, hit.best.lineCap, hit.best.dash] });
}
const rectMiss = [];
for (const rect of left.rects || []) {
  const hit = nearest(rect, right.rects || [], (other) =>
    Math.abs(rect.x - other.x) + Math.abs(rect.y - other.y) + Math.abs(rect.width - other.width) + Math.abs(rect.height - other.height));
  const diffs = hit.best ? fieldDiff(rect, hit.best, ['x', 'y', 'width', 'height', 'fill', 'stroke', 'dash']) : ['none'];
  if (diffs.length) rectMiss.push({ diffs, distance: hit.bestScore, rect: [rect.x, rect.y, rect.width, rect.height, rect.fill, rect.stroke], other: hit.best && [hit.best.x, hit.best.y, hit.best.width, hit.best.height, hit.best.fill, hit.best.stroke] });
}
console.log(JSON.stringify({
  lines: [(left.lines || []).length, (right.lines || []).length, lineMiss.length],
  rects: [(left.rects || []).length, (right.rects || []).length, rectMiss.length],
  paths: [(left.paths || []).length, (right.paths || []).length],
  lineSamples: lineMiss.slice(0, 5),
  rectSamples: rectMiss.slice(0, 5),
}, null, 2));
