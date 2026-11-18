/**
 * Font census for the pinned PDFs.
 * Run: node tools/reports/font-census.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, 'reports/references/files');

function hasGlyphs(arg) {
  const items = Array.isArray(arg) ? arg : [arg];
  for (const item of items) {
    if (!item) continue;
    if (item.unicode != null || item.fontChar) return true;
    if (typeof item.length === 'number') {
      for (const glyph of item) if (glyph && (glyph.unicode != null || glyph.fontChar)) return true;
    }
  }
  return false;
}

function csv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const files = fs.readdirSync(dir).filter((name) => name.toLowerCase().endsWith('.pdf')).sort();
const rows = ['font,embedded,file,spans'];
let embeddedSpans = 0;
let plainSpans = 0;
let failed = 0;
for (const file of files) {
  try {
    const data = new Uint8Array(fs.readFileSync(path.join(dir, file)));
    const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
    const counts = new Map();
    for (let number = 1; number <= doc.numPages; number += 1) {
      const page = await doc.getPage(number);
      const ops = await page.getOperatorList();
      let fontId = '';
      for (let index = 0; index < ops.fnArray.length; index += 1) {
        const fn = ops.fnArray[index];
        if (fn === OPS.setFont) fontId = String(ops.argsArray[index]?.[0] || '');
        if (fn !== OPS.showText || !fontId || !hasGlyphs(ops.argsArray[index])) continue;
        const font = page.commonObjs.has(fontId) ? page.commonObjs.get(fontId) : null;
        const name = font?.name || fontId;
        const embedded = font ? !font.missingFile : false;
        const key = `${name}\t${embedded}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }
    await doc.destroy();
    for (const [key, spans] of counts) {
      const [name, embedded] = key.split('\t');
      rows.push([name, embedded, `reports/references/files/${file}`, spans].map(csv).join(','));
      if (embedded === 'true') embeddedSpans += spans;
      else plainSpans += spans;
    }
  } catch (error) {
    failed += 1;
    console.error(file, error.message);
  }
}
const out = path.join(root, 'reports/font-census.csv');
fs.writeFileSync(out, `${rows.join('\n')}\n`);
const total = embeddedSpans + plainSpans;
console.log(JSON.stringify({
  files: files.length,
  failed,
  fonts: rows.length - 1,
  embeddedSpans,
  nonEmbeddedSpans: plainSpans,
  nonEmbeddedShare: total ? Number((plainSpans / total).toFixed(4)) : 0,
}, null, 2));
