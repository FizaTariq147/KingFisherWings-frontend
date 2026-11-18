/**
 * Geometry-only raster. Text blocks and images are removed from both content
 * streams, then the pages are diffed at 150 dpi. The 0.5% limit is the same
 * ratio the masked non-text check already uses. This check does not change
 * that one.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PDFArray, PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';

const LIMIT = 0.005;
const PATH_OPS = new Set(['m', 'l', 'c', 'v', 'y', 'h', 're', 'S', 's', 'f', 'F', 'f*', 'B', 'B*', 'b', 'b*', 'n', 'W', 'W*']);

function tokenize(buffer) {
  const text = Buffer.from(buffer).toString('latin1');
  const tokens = [];
  let index = 0;
  while (index < text.length) {
    const char = text[index];
    if (/\s/.test(char)) { index += 1; continue; }
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
        if (next === '\\' && index < text.length) { value += text[index]; index += 1; }
        else if (next === '(') depth += 1;
        else if (next === ')') depth -= 1;
      }
      tokens.push({ kind: 'operand', value });
      continue;
    }
    if (char === '<' && text[index + 1] === '<') { tokens.push({ kind: 'operand', value: '<<' }); index += 2; continue; }
    if (char === '<') {
      let value = '<';
      index += 1;
      while (index < text.length && text[index] !== '>') value += text[index++];
      if (text[index] === '>') value += text[index++];
      tokens.push({ kind: 'operand', value });
      continue;
    }
    if (char === '>' && text[index + 1] === '>') { tokens.push({ kind: 'operand', value: '>>' }); index += 2; continue; }
    if ('[]{}'.includes(char)) { tokens.push({ kind: 'operand', value: char }); index += 1; continue; }
    if (char === '/') {
      let value = '/';
      index += 1;
      while (index < text.length && !/[\s<>[\](){}/%]/.test(text[index])) value += text[index++];
      tokens.push({ kind: 'operand', value });
      continue;
    }
    let value = '';
    while (index < text.length && !/[\s<>[\](){}/%]/.test(text[index])) value += text[index++];
    tokens.push(/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value) ? { kind: 'operand', value } : { kind: 'operator', value });
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
    if (String(item) !== '/FlateDecode') throw new Error(`unsupported filter ${item}`);
    data = zlib.inflateSync(data);
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
  const ref = dict.get(PDFName.of(name.slice(1)));
  if (!ref) return null;
  return { ref, obj: dict.context.lookup(ref) };
}

function filterTokens(buffer, resources, seen) {
  const tokens = tokenize(buffer);
  const out = [];
  const operands = [];
  let inText = false;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.kind === 'operand') {
      if (!inText) operands.push(token.value);
      continue;
    }
    const op = token.value;
    if (op === 'BT') { inText = true; operands.length = 0; continue; }
    if (op === 'ET') { inText = false; continue; }
    if (inText) continue;
    if (op === 'BI') {
      operands.length = 0;
      while (index + 1 < tokens.length && !(tokens[index + 1].kind === 'operator' && tokens[index + 1].value === 'EI')) index += 1;
      if (tokens[index + 1]?.value === 'EI') index += 1;
      continue;
    }
    if (op === 'Do') {
      const found = xobject(resources, operands.at(-1));
      const subtype = found ? String(found.obj?.dict?.lookup(PDFName.of('Subtype'))) : '';
      if (subtype === '/Form') filterStream(found.obj.dict.context, found.ref, found.obj, seen);
      if (subtype !== '/Image') out.push(...operands, 'Do');
      operands.length = 0;
      continue;
    }
    if (PATH_OPS.has(op) || true) {
      out.push(...operands, op);
      operands.length = 0;
    }
  }
  return Buffer.from(`${out.join('\n')}\n`, 'latin1');
}

function filterStream(context, ref, stream, seen) {
  const key = String(ref);
  if (seen.has(key)) return;
  seen.add(key);
  if (typeof stream?.getContents !== 'function') return;
  const next = filterTokens(streamBytes(stream), stream.dict.lookup(PDFName.of('Resources')), seen);
  writeStream(context, ref, stream, next);
}

async function stripGeometry(pdfPath, dest) {
  const doc = await PDFDocument.load(fs.readFileSync(pdfPath), { updateMetadata: false });
  for (const page of doc.getPages()) {
    const entries = page.node.normalizedEntries();
    if (!entries.Contents || typeof entries.Contents.size !== 'function') continue;
    const seen = new Set();
    for (let index = 0; index < entries.Contents.size(); index += 1) {
      const ref = entries.Contents.get(index);
      const stream = page.node.context.lookup(ref);
      const next = filterTokens(streamBytes(stream), entries.Resources, seen);
      writeStream(page.node.context, ref, stream, next);
    }
  }
  fs.writeFileSync(dest, await doc.save());
}

export async function geometryOnlyRatio(referencePdf, renderedPdf, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const leftPdf = path.join(dir, 'geometry-ref.pdf');
  const rightPdf = path.join(dir, 'geometry-out.pdf');
  await stripGeometry(referencePdf, leftPdf);
  await stripGeometry(renderedPdf, rightPdf);
  const leftPrefix = path.join(dir, 'geometry-ref');
  const rightPrefix = path.join(dir, 'geometry-out');
  execFileSync('pdftoppm', ['-png', '-r', '150', leftPdf, leftPrefix], { stdio: 'ignore' });
  execFileSync('pdftoppm', ['-png', '-r', '150', rightPdf, rightPrefix], { stdio: 'ignore' });
  const pages = fs.readdirSync(dir).filter((name) => /^geometry-ref-\d+\.png$/.test(name)).sort();
  let mismatches = 0;
  let pixels = 0;
  for (const name of pages) {
    const rightName = name.replace('geometry-ref-', 'geometry-out-');
    if (!fs.existsSync(path.join(dir, rightName))) continue;
    const left = PNG.sync.read(fs.readFileSync(path.join(dir, name)));
    const right = PNG.sync.read(fs.readFileSync(path.join(dir, rightName)));
    const width = Math.min(left.width, right.width);
    const height = Math.min(left.height, right.height);
    const leftData = Buffer.alloc(width * height * 4);
    const rightData = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      left.data.copy(leftData, y * width * 4, y * left.width * 4, y * left.width * 4 + width * 4);
      right.data.copy(rightData, y * width * 4, y * right.width * 4, y * right.width * 4 + width * 4);
    }
    const scratch = Buffer.alloc(width * height * 4);
    mismatches += pixelmatch(leftData, rightData, scratch, width, height, { threshold: 0.1 });
    pixels += width * height;
  }
  const ratio = pixels ? mismatches / pixels : 1;
  return { mismatches, pixels, ratio, pass: ratio <= LIMIT, limit: LIMIT };
}
