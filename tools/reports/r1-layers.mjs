/**
 * Layer isolation for the worst R1 documents.
 * Removes text blocks and images from both content streams, rasters at 150 dpi,
 * then does the same for text-only. Does not change masks or limits.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PDFArray, PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readOperators } from './read-operators.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'reports/output/track-a3');
const DPI = 150;
const SCALE = DPI / 72;
const PATH_OPS = new Set(['m', 'l', 'c', 'v', 'y', 'h', 're', 'S', 's', 'f', 'F', 'f*', 'B', 'B*', 'b', 'b*', 'n', 'W', 'W*']);
const WORST = [
  'GL_REPORT_VOUCHER_REPORT_FORMAT',
  'OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER',
  'STUFFING_REPORT_JASPER_REPORT_FORMAT',
  'FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT',
  'CARGO_MANIFEST_REPORT_FORMAT',
  'CONTAINER_LOAD_PLAN_REPORT_FORMAT',
  'FG_TAX_INVOICE_INDIA_FORMAT1_RPM_REF_796',
  'CONTAINER_OUTTURN_REPORT_FORMAT',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'GL_LISTING_SORT_BY_CUSTOMER_CODE_VOUCHER_REPORT_FORMAT',
];

function referenceFile(code) {
  const mapped = fs.readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8');
  const line = mapped.split(/\r?\n/).find((row) => row.startsWith(`${code},`));
  const file = line?.match(/reports\/references\/files\/[^,]+/)?.[0];
  if (file) return path.join(root, file);
  const census = fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8');
  const censusFile = census.split(/\r?\n/).find((row) => row.startsWith(`${code},`))?.split(',')[1];
  if (censusFile?.endsWith('.pdf')) return path.join(root, censusFile);
  throw new Error(`No reference for ${code}`);
}

function tokenize(buffer) {
  const text = Buffer.from(buffer).toString('latin1');
  const tokens = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (char === '%') {
      while (index < text.length && text[index] !== '\n' && text[index] !== '\r') index += 1;
      continue;
    }
    if (char === '(') {
      let value = '(';
      index += 1;
      let depth = 1;
      while (index < text.length && depth) {
        const next = text[index];
        value += next;
        index += 1;
        if (next === '\\' && index < text.length) {
          value += text[index];
          index += 1;
        } else if (next === '(') depth += 1;
        else if (next === ')') depth -= 1;
      }
      tokens.push({ kind: 'operand', value });
      continue;
    }
    if (char === '<' && text[index + 1] === '<') {
      tokens.push({ kind: 'operand', value: '<<' });
      index += 2;
      continue;
    }
    if (char === '<') {
      let value = '<';
      index += 1;
      while (index < text.length && text[index] !== '>') value += text[index++];
      if (text[index] === '>') value += text[index++];
      tokens.push({ kind: 'operand', value });
      continue;
    }
    if (char === '>' && text[index + 1] === '>') {
      tokens.push({ kind: 'operand', value: '>>' });
      index += 2;
      continue;
    }
    if ('[]{}'.includes(char)) {
      tokens.push({ kind: 'operand', value: char });
      index += 1;
      continue;
    }
    if (char === '/') {
      let value = '/';
      index += 1;
      while (index < text.length && !/[\s<>[\](){}/%]/.test(text[index])) value += text[index++];
      tokens.push({ kind: 'operand', value });
      continue;
    }
    let value = '';
    while (index < text.length && !/[\s<>[\](){}/%]/.test(text[index])) value += text[index++];
    if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value)) tokens.push({ kind: 'operand', value });
    else tokens.push({ kind: 'operator', value });
  }
  return tokens;
}

function streamBytes(stream) {
  const raw = Buffer.from(stream.getContents());
  const filter = stream.dict.lookup(PDFName.of('Filter'));
  const filters = filter instanceof PDFArray
    ? Array.from({ length: filter.size() }, (_, index) => filter.lookup(index))
    : filter ? [filter] : [];
  let data = raw;
  for (const item of filters) {
    const name = String(item);
    if (name === '/FlateDecode') data = zlib.inflateSync(data);
    else throw new Error(`unsupported filter ${name}`);
  }
  return data;
}

function writeStream(context, ref, stream, bytes) {
  stream.dict.delete(PDFName.of('Filter'));
  stream.dict.delete(PDFName.of('DecodeParms'));
  stream.dict.set(PDFName.of('Length'), context.obj(bytes.length));
  context.assign(ref, PDFRawStream.of(stream.dict, bytes));
}

function xobject(resources, name) {
  if (!resources || !name?.startsWith('/')) return null;
  const dict = resources.lookup(PDFName.of('XObject'));
  if (!dict || typeof dict.get !== 'function') return null;
  const key = PDFName.of(name.slice(1));
  const ref = dict.get(key);
  if (!ref) return null;
  const obj = dict.context.lookup(ref);
  return { ref, obj };
}

function filterTokens(buffer, mode, resources, seen) {
  const tokens = tokenize(buffer);
  const out = [];
  const operands = [];
  let inText = false;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.kind === 'operand') {
      if (inText) {
        if (mode === 'text') out.push(token.value);
      } else operands.push(token.value);
      continue;
    }
    const op = token.value;
    if (op === 'BT') {
      inText = true;
      operands.length = 0;
      if (mode === 'text') out.push('BT');
      continue;
    }
    if (op === 'ET') {
      inText = false;
      if (mode === 'text') out.push('ET');
      continue;
    }
    if (inText) {
      if (mode === 'text') out.push(op);
      continue;
    }
    if (op === 'BI') {
      operands.length = 0;
      while (index + 1 < tokens.length && !(tokens[index + 1].kind === 'operator' && tokens[index + 1].value === 'EI')) index += 1;
      if (tokens[index + 1]?.value === 'EI') index += 1;
      continue;
    }
    if (op === 'Do') {
      const name = operands.at(-1);
      const found = xobject(resources, name);
      const subtype = found ? String(found.obj?.dict?.lookup(PDFName.of('Subtype'))) : '';
      if (subtype === '/Form') filterStream(found.obj.dict.context, found.ref, found.obj, mode, seen);
      const drop = subtype === '/Image' || subtype === '/Form' && false;
      if (subtype !== '/Image') out.push(...operands, 'Do');
      operands.length = 0;
      continue;
    }
    if (mode === 'text' && PATH_OPS.has(op)) {
      operands.length = 0;
      continue;
    }
    out.push(...operands, op);
    operands.length = 0;
  }
  return Buffer.from(`${out.join('\n')}\n`, 'latin1');
}

function filterStream(context, ref, stream, mode, seen) {
  const key = String(ref);
  if (seen.has(key)) return;
  seen.add(key);
  if (!(stream instanceof PDFRawStream) && typeof stream?.getContents !== 'function') return;
  const resources = stream.dict.lookup(PDFName.of('Resources'));
  const next = filterTokens(streamBytes(stream), mode, resources, seen);
  writeStream(context, ref, stream, next);
}

async function rewrite(pdfPath, mode, dest) {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath), { updateMetadata: false });
  for (const page of doc.getPages()) {
    const entries = page.node.normalizedEntries();
    const contents = entries.Contents;
    const seen = new Set();
    for (let index = 0; index < contents.size(); index += 1) {
      const ref = contents.get(index);
      const stream = page.node.context.lookup(ref);
      const resources = entries.Resources;
      const next = filterTokens(streamBytes(stream), mode, resources, seen);
      writeStream(page.node.context, ref, stream, next);
    }
  }
  fs.writeFileSync(dest, await doc.save());
}

function pngFiles(prefix) {
  return fs.readdirSync(path.dirname(prefix))
    .filter((name) => name.startsWith(`${path.basename(prefix)}-`) && name.endsWith('.png'))
    .sort()
    .map((name) => path.join(path.dirname(prefix), name));
}

function rasterize(pdf, prefix) {
  for (const file of pngFiles(prefix)) fs.rmSync(file);
  execFileSync('pdftoppm', ['-png', '-r', String(DPI), pdf, prefix], { stdio: 'ignore' });
  return pngFiles(prefix);
}

function diffPages(leftFiles, rightFiles) {
  const pages = Math.min(leftFiles.length, rightFiles.length);
  let mismatches = 0;
  let pixels = 0;
  const pageDiffs = [];
  for (let index = 0; index < pages; index += 1) {
    const left = PNG.sync.read(fs.readFileSync(leftFiles[index]));
    const right = PNG.sync.read(fs.readFileSync(rightFiles[index]));
    const width = Math.min(left.width, right.width);
    const height = Math.min(left.height, right.height);
    const leftData = Buffer.alloc(width * height * 4);
    const rightData = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      left.data.copy(leftData, y * width * 4, y * left.width * 4, y * left.width * 4 + width * 4);
      right.data.copy(rightData, y * width * 4, y * right.width * 4, y * right.width * 4 + width * 4);
    }
    const scratch = Buffer.alloc(width * height * 4);
    const count = pixelmatch(leftData, rightData, scratch, width, height, { threshold: 0.1 });
    mismatches += count;
    pixels += width * height;
    pageDiffs.push({ width, height, count, left, right });
  }
  return { mismatches, pixels, ratio: pixels ? mismatches / pixels : 1, pageDiffs };
}

async function vectors(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const pages = [];
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const view = page.getViewport({ scale: 1 });
    const ops = await page.getOperatorList();
    const read = readOperators(ops, page, { width: view.width, height: view.height });
    const placed = (read.lines || []).map((line) => {
      const start = view.convertToViewportPoint(line.x1, line.y1);
      const end = view.convertToViewportPoint(line.x2, line.y2);
      return {
        ...line,
        vx1: start[0],
        vy1: start[1],
        vx2: end[0],
        vy2: end[1],
        displayedY: view.height - (start[1] + end[1]) / 2,
      };
    });
    pages.push({ width: view.width, height: view.height, lines: placed, rects: read.rects || [] });
  }
  return pages;
}

function bandCount(diff, line) {
  const pad = (line.width || 0.5) * SCALE + 2;
  const x0 = Math.max(0, Math.floor(Math.min(line.vx1, line.vx2) * SCALE - pad));
  const x1 = Math.min(diff.width, Math.ceil(Math.max(line.vx1, line.vx2) * SCALE + pad));
  const y0 = Math.max(0, Math.floor(Math.min(line.vy1, line.vy2) * SCALE - pad));
  const y1 = Math.min(diff.height, Math.ceil(Math.max(line.vy1, line.vy2) * SCALE + pad));
  let count = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const left = (y * diff.left.width + x) * 4;
      const right = (y * diff.right.width + x) * 4;
      if (diff.left.data[left] !== diff.right.data[right]
        || diff.left.data[left + 1] !== diff.right.data[right + 1]
        || diff.left.data[left + 2] !== diff.right.data[right + 2]) count += 1;
    }
  }
  return count;
}

function matchLine(line, others) {
  let best = null;
  let score = Infinity;
  for (const other of others) {
    const next = Math.abs(line.displayedY - other.displayedY)
      + Math.abs(Math.min(line.vx1, line.vx2) - Math.min(other.vx1, other.vx2)) * 0.05
      + Math.abs(Math.max(line.vx1, line.vx2) - Math.max(other.vx1, other.vx2)) * 0.05;
    if (next < score) {
      score = next;
      best = other;
    }
  }
  return score < 6 ? best : null;
}

function decimals(value) {
  const text = String(value);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

function precision(code) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const pages = spec.pages?.length ? spec.pages : [spec];
  let max = 0;
  let samples = 0;
  const colors = new Set();
  for (const page of pages) {
    for (const item of [...(page.lines || []), ...(page.rects || [])]) {
      for (const key of ['x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'strokeWidth']) {
        if (item[key] == null || item[key] === '') continue;
        max = Math.max(max, decimals(item[key]));
        samples += 1;
      }
      if (item.color) colors.add(item.color);
      if (item.fill) colors.add(item.fill);
      if (item.stroke) colors.add(item.stroke);
    }
  }
  return { maxDecimals: max, samples, colorDigits: [...colors].every((color) => /^#[0-9a-f]{6}$/i.test(color)) ? 8 : 'other' };
}

async function one(code) {
  const reference = referenceFile(code);
  const rendered = path.join(root, 'reports/output', `${code}.pdf`);
  const dir = path.join(outDir, 'layers', code);
  fs.mkdirSync(dir, { recursive: true });
  const modes = {};
  for (const mode of ['geometry', 'text']) {
    const left = path.join(dir, `${mode}-ref.pdf`);
    const right = path.join(dir, `${mode}-out.pdf`);
    await rewrite(reference, mode, left);
    await rewrite(rendered, mode, right);
    const diff = diffPages(rasterize(left, path.join(dir, `${mode}-ref`)), rasterize(right, path.join(dir, `${mode}-out`)));
    modes[mode] = { mismatches: diff.mismatches, pixels: diff.pixels, ratio: Number(diff.ratio.toFixed(6)), pages: diff.pageDiffs.length };
    if (mode === 'geometry') modes.geometryDiff = diff;
  }
  const referenceVectors = await vectors(reference);
  const renderedVectors = await vectors(rendered);
  const ranked = [];
  referenceVectors.forEach((page, index) => {
    const diff = modes.geometryDiff.pageDiffs[index];
    const output = renderedVectors[index];
    if (!diff || !output) return;
    for (const line of page.lines) {
      const mismatches = bandCount(diff, line);
      if (!mismatches) continue;
      const other = matchLine(line, output.lines);
      ranked.push({
        page: index + 1,
        referenceY: Number(line.displayedY.toFixed(2)),
        outputY: other ? Number(other.displayedY.toFixed(2)) : null,
        width: line.width,
        kind: line.source || 'stroke',
        mismatches,
      });
    }
  });
  ranked.sort((a, b) => b.mismatches - a.mismatches);
  const rectLines = referenceVectors.reduce((sum, page) => sum + page.lines.filter((line) => line.source === 'rect').length, 0);
  const strokeLines = referenceVectors.reduce((sum, page) => sum + page.lines.filter((line) => line.source !== 'rect').length, 0);
  delete modes.geometryDiff;
  const carrier = modes.geometry.ratio > 0.005 ? 'geometry' : 'text';
  return {
    code,
    carrier,
    geometry: modes.geometry,
    text: modes.text,
    precision: precision(code),
    referenceLines: { rectConverted: rectLines, stroke: strokeLines },
    topLines: ranked.slice(0, 20),
  };
}

const only = process.argv.slice(2);
const codes = only.length ? only : WORST;
fs.mkdirSync(outDir, { recursive: true });
const rows = [];
for (const code of codes) {
  const started = Date.now();
  try {
    const row = await one(code);
    rows.push(row);
    console.log(JSON.stringify({ code, carrier: row.carrier, geometry: row.geometry.ratio, text: row.text.ratio, seconds: Number(((Date.now() - started) / 1000).toFixed(1)) }));
  } catch (error) {
    rows.push({ code, error: String(error.stack || error) });
    console.log(JSON.stringify({ code, error: String(error.message || error) }));
  }
}
fs.writeFileSync(path.join(outDir, 'layers.json'), `${JSON.stringify(rows, null, 2)}\n`);
