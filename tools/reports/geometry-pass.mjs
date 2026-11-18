import fs from 'node:fs';
import path from 'node:path';
import { inspectPdfFile } from './extract.mjs';
import { displayGeometry } from './page-box.mjs';

function near(a, b) { return Math.abs((a || 0) - (b || 0)) <= 0.1; }
function matchLine(line, others) {
  return others.some((other) =>
    near(line.x1, other.x1) && near(line.y1, other.y1) && near(line.x2, other.x2) && near(line.y2, other.y2)
    && near(line.width || 0, other.width || 0)
    && (line.color || '#000000') === (other.color || '#000000')
    && (line.lineCap || 0) === (other.lineCap || 0)
    && (line.lineJoin || 0) === (other.lineJoin || 0)
    && JSON.stringify(line.dash || []) === JSON.stringify(other.dash || []));
}
function matchRect(rect, others) {
  return others.some((other) =>
    near(rect.x, other.x) && near(rect.y, other.y) && near(rect.width, other.width) && near(rect.height, other.height)
    && (rect.fill || null) === (other.fill || null)
    && (rect.stroke || null) === (other.stroke || null)
    && JSON.stringify(rect.dash || []) === JSON.stringify(other.dash || []));
}

const code = process.argv[2];
const spec = JSON.parse(fs.readFileSync(path.join('reports/specs', `${code}.json`), 'utf8'));
const rendered = await inspectPdfFile(path.join('reports/output', `${code}.pdf`));
let lines = 0;
let rects = 0;
let paths = 0;
for (let index = 0; index < spec.pages.length; index += 1) {
  const left = displayGeometry(spec.pages[index], spec.pages[index].pageBox);
  const right = displayGeometry(rendered.pageReads[index], rendered.pageReads[index].pageBox);
  lines += left.lines.filter((line) => !matchLine(line, right.lines || [])).length;
  const missed = left.rects.filter((rect) => !matchRect(rect, right.rects || []));
  rects += missed.length;
  if (missed[0]) console.log(JSON.stringify(missed[0]));
  paths += (left.paths || []).length ? left.paths.length : 0;
}
console.log(JSON.stringify({ code, unmatchedLines: lines, unmatchedRects: rects, pathCount: paths }));
