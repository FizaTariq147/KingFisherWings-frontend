/**
 * Page-1 review sheets: reference | output | diff, with mask boxes outlined.
 * Does not change status or signoff.csv. reviewed_by, reviewed_on and decision stay blank.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DPI = 72;
const MASK = new Set(['logo', 'letterhead', 'decorative', 'decorative Fresa branding', 'form_background']);

function parseLine(line) {
  const parts = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === ',' && !quoted) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

function families() {
  const text = fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8');
  const map = new Map();
  const pattern = /"code": "([^"]+)"\s*,\s*"name": "[^"]*"\s*,\s*"family": "([^"]+)"/g;
  for (const match of text.matchAll(pattern)) map.set(match[1], match[2]);
  return map;
}

function referenceFile(code) {
  const mapped = fs.readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8');
  const line = mapped.split(/\r?\n/).find((row) => row.startsWith(`${code},`));
  const file = line?.match(/reports\/references\/files\/[^,]+/)?.[0];
  if (file) return path.join(root, file);
  const census = fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8');
  const censusFile = census.split(/\r?\n/).find((row) => row.startsWith(`${code},`))?.split(',')[1];
  if (censusFile?.endsWith('.pdf')) return path.join(root, censusFile);
  return '';
}

function raster(pdf, dest) {
  const prefix = dest.replace(/\.png$/, '');
  execFileSync('pdftoppm', ['-png', '-r', String(DPI), '-f', '1', '-l', '1', '-singlefile', pdf, prefix], { stdio: 'ignore' });
  return `${prefix}.png`;
}

function crop(png, width, height) {
  const data = Buffer.alloc(width * height * 4, 255);
  for (let y = 0; y < height; y += 1) {
    png.data.copy(data, y * width * 4, y * png.width * 4, (y * png.width + width) * 4);
  }
  return data;
}

function paint(data, width, x, y) {
  if (x < 0 || y < 0 || x >= width) return;
  const offset = (y * width + x) * 4;
  data[offset] = 220;
  data[offset + 1] = 30;
  data[offset + 2] = 30;
  data[offset + 3] = 255;
}

function strokeLine(data, width, height, x0, y0, x1, y1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let step = 0; step <= steps; step += 1) {
    const x = Math.round(x0 + ((x1 - x0) * step) / steps);
    const y = Math.round(y0 + ((y1 - y0) * step) / steps);
    if (y >= 0 && y < height) paint(data, width, x, y);
  }
}

function outline(data, width, height, view, box) {
  const corners = [
    [box.x, box.y],
    [box.x + box.width, box.y],
    [box.x + box.width, box.y + box.height],
    [box.x, box.y + box.height],
  ].map(([x, y]) => view.convertToViewportPoint(x, y));
  for (let index = 0; index < corners.length; index += 1) {
    const next = corners[(index + 1) % corners.length];
    strokeLine(data, width, height, corners[index][0], corners[index][1], next[0], next[1]);
  }
}

function sheet(left, right, diff, width, height) {
  const gap = 8;
  const out = new PNG({ width: width * 3 + gap * 2, height });
  out.data.fill(255);
  const place = (source, origin) => {
    for (let y = 0; y < height; y += 1) {
      source.copy(out.data, (y * out.width + origin) * 4, y * width * 4, (y * width + width) * 4);
    }
  };
  place(left, 0);
  place(right, width + gap);
  place(diff, (width + gap) * 2);
  return PNG.sync.write(out);
}

async function masksFor(code, pdfPath) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  if (!fs.existsSync(specPath) || !pdfPath) return { boxes: [], view: null };
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const pageSpec = spec.pages?.[0] || spec;
  const boxes = (pageSpec.images || []).filter((image) => MASK.has(image.proposedClass));
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  return { boxes, view: page.getViewport({ scale: DPI / 72 }) };
}

function csv(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const familyOf = families();
const seen = new Set();
const rows = [];
for (const line of fs.readFileSync(path.join(root, 'reports/full-run-track-a-last.csv'), 'utf8').trim().split(/\r?\n/).slice(1)) {
  const parts = parseLine(line);
  if (!parts[0] || seen.has(parts[0])) continue;
  seen.add(parts[0]);
  rows.push(parts);
}

const index = [['code', 'family', 'layers_passed', 'exception_class', 'reviewed_by', 'reviewed_on', 'decision']];
let written = 0;
for (const parts of rows) {
  const code = parts[0];
  const family = familyOf.get(code) || 'unregistered';
  const layers = ['page', 'geometry', 'static', 'dynamic', 'raster', 'pagination']
    .filter((name, index) => parts[index + 2] === 'pass' || (name === 'pagination' && parts[index + 2] === 'single-page'));
  const reference = referenceFile(code);
  const rendered = path.join(root, 'reports/output', `${code}.pdf`);
  const dir = path.join(root, 'reports/review', family);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${code}.png`);
  if (reference && fs.existsSync(rendered)) {
    const leftFile = raster(reference, path.join(dir, `.${code}-ref`));
    const rightFile = raster(rendered, path.join(dir, `.${code}-out`));
    const left = PNG.sync.read(fs.readFileSync(leftFile));
    const right = PNG.sync.read(fs.readFileSync(rightFile));
    const width = Math.min(left.width, right.width);
    const height = Math.min(left.height, right.height);
    const leftData = crop(left, width, height);
    const rightData = crop(right, width, height);
    const diff = Buffer.alloc(width * height * 4);
    pixelmatch(leftData, rightData, diff, width, height, { threshold: 0.1 });
    const { boxes, view } = await masksFor(code, reference);
    if (view) {
      for (const box of boxes) outline(diff, width, height, view, box);
    }
    fs.writeFileSync(dest, sheet(leftData, rightData, diff, width, height));
    fs.rmSync(leftFile, { force: true });
    fs.rmSync(rightFile, { force: true });
    written += 1;
  }
  index.push([code, family, layers.join(' '), parts[8] || '', '', '', ''].map(csv));
  if (written % 25 === 0) console.log(JSON.stringify({ written, of: rows.length, code }));
}
fs.writeFileSync(path.join(root, 'reports/review/index.csv'), `${index.map((row) => row.join(',')).join('\n')}\n`);
console.log(JSON.stringify({ documents: rows.length, sheets: written }));
