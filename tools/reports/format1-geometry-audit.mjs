/**
 * List Format 1 demo geometry failures and classify vs logo/letterhead/branding.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffPilot } from './diff-pilot.mjs';
import { inspectPdfFile } from './extract.mjs';
import { displayGeometry } from './page-box.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const code = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';
const outDir = path.join(root, 'reports/format1');
const GEOMETRY_TOLERANCE = 0.1;

function near(a, b, tolerance = GEOMETRY_TOLERANCE) {
  return Math.abs(a - b) <= tolerance;
}

function sameDash(left, right) {
  return JSON.stringify(left || []) === JSON.stringify(right || []);
}

function matchLine(line, others) {
  return others.some((other) => (
    near(line.x1, other.x1)
    && near(line.y1, other.y1)
    && near(line.x2, other.x2)
    && near(line.y2, other.y2)
    && near(line.width || 0, other.width || 0)
    && (line.color || '#000000') === (other.color || '#000000')
    && (line.lineCap || 0) === (other.lineCap || 0)
    && (line.lineJoin || 0) === (other.lineJoin || 0)
    && sameDash(line.dash, other.dash)
  ));
}

function matchRect(rect, others) {
  return others.some((other) => (
    near(rect.x, other.x)
    && near(rect.y, other.y)
    && near(rect.width, other.width)
    && near(rect.height, other.height)
    && (rect.fill || null) === (other.fill || null)
    && (rect.stroke || null) === (other.stroke || null)
    && sameDash(rect.dash, other.dash)
  ));
}

function pageOf(read, index) {
  if (read.pageReads?.[index]) return read.pageReads[index];
  return {
    width: read.width,
    height: read.height,
    lines: read.vectors?.lines || read.lines || [],
    rects: read.vectors?.rects || read.rects || [],
    paths: read.vectors?.paths || read.paths || [],
    spans: read.spans || [],
    pageBox: read.pageBox,
  };
}

function boxContainsPoint(box, x, y, pad = 3) {
  return x >= box.x - pad && x <= box.x + box.width + pad && y >= box.y - pad && y <= box.y + box.height + pad;
}

function classify(element, boxes) {
  const hits = [];
  for (const box of boxes) {
    if (element.type === 'line') {
      if (boxContainsPoint(box, element.x1, element.y1) && boxContainsPoint(box, element.x2, element.y2)) hits.push(box.kind);
    } else if (element.type === 'rect') {
      const cx = element.x + (element.width || 0) / 2;
      const cy = element.y + (element.height || 0) / 2;
      if (boxContainsPoint(box, cx, cy) || (
        element.x >= box.x - 3
        && element.y >= box.y - 3
        && element.x + (element.width || 0) <= box.x + box.width + 3
        && element.y + (element.height || 0) <= box.y + box.height + 3
      )) hits.push(box.kind);
    }
  }
  return hits.length ? hits : ['outside-allowed-boxes'];
}

function brandingBoxes(spec) {
  const page = spec.pages[0];
  const boxes = [];
  if (spec.slots?.logo) boxes.push({ kind: 'logo', ...spec.slots.logo });
  for (const image of page.images || []) {
    if (image.proposedClass === 'logo' || image.proposedClass === 'letterhead') {
      boxes.push({ kind: image.proposedClass, x: image.x, y: image.y, width: image.width, height: image.height });
    }
  }
  if (spec.slots?.company) {
    boxes.push({ kind: 'company-name', ...spec.slots.company });
  }
  // Right-side org profile block only (not a page-wide branding union).
  boxes.push({ kind: 'omitted-branding', x: 440, y: 775, width: 150, height: 65 });
  // Footer branding / powered-by strip.
  boxes.push({ kind: 'omitted-branding', x: 0, y: 0, width: 600, height: 40 });
  return boxes;
}

const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
const demoPdf = path.join(outDir, 'demo-live.pdf');
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'format1-geom-'));
const pilot = await diffPilot(code, {
  renderedPath: demoPdf,
  workDir: work,
  tag: 'format1-geom',
  writeHeatmap: false,
  skipDeviation: true,
});

const rendered = await inspectPdfFile(demoPdf);
const specPage = displayGeometry(spec.pages[0], spec.pages[0].pageBox);
const renderedPage = displayGeometry(pageOf(rendered, 0), pageOf(rendered, 0).pageBox || rendered.pageBox);
const boxes = brandingBoxes(spec);

const missingLines = (specPage.lines || []).filter((line) => !matchLine(line, renderedPage.lines || []));
const missingRects = (specPage.rects || []).filter((rect) => !matchRect(rect, renderedPage.rects || []));
const failures = [
  ...missingLines.map((line) => ({
    type: 'line',
    x1: line.x1,
    y1: line.y1,
    x2: line.x2,
    y2: line.y2,
    width: line.width || 0,
    size: { length: Math.hypot(line.x2 - line.x1, line.y2 - line.y1) },
    color: line.color || '#000000',
    boxes: classify({ type: 'line', ...line }, boxes),
  })),
  ...missingRects.map((rect) => ({
    type: 'rect',
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    size: { width: rect.width, height: rect.height },
    fill: rect.fill || null,
    stroke: rect.stroke || null,
    boxes: classify({ type: 'rect', ...rect }, boxes),
  })),
];

const outside = failures.filter((item) => item.boxes.includes('outside-allowed-boxes'));
const report = {
  diffPilotGeometry: pilot.geometry,
  counts: {
    specLines: (specPage.lines || []).length,
    renderedLines: (renderedPage.lines || []).length,
    specRects: (specPage.rects || []).length,
    renderedRects: (renderedPage.rects || []).length,
    missingLines: missingLines.length,
    missingRects: missingRects.length,
    outsideAllowed: outside.length,
  },
  boxes,
  failures,
  outsideAllowed: outside,
};
fs.writeFileSync(path.join(outDir, 'geometry-failures.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  diffPilot: pilot.geometry,
  counts: report.counts,
  outside: outside.map((item) => ({
    type: item.type,
    coords: item.type === 'line'
      ? { x1: item.x1, y1: item.y1, x2: item.x2, y2: item.y2, width: item.width }
      : { x: item.x, y: item.y, width: item.width, height: item.height },
    size: item.size,
  })),
}, null, 2));
