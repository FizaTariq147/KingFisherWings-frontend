import fs from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';
import { inspectPdfFile } from './extract.mjs';

const text = 'ﺔﻴﺒﻳﺮﺿ ﺓﺭﻮﺗﺎﻓ';
const fontBytes = fs.readFileSync('reports/fonts/NotoNaskhArabic-Regular.ttf');
const fk = fontkit.create(fontBytes);
const missing = [];
for (const char of text) {
  const glyph = fk.glyphForCodePoint(char.codePointAt(0));
  if (!glyph || glyph.id === 0) missing.push(char.codePointAt(0).toString(16));
}
console.log(JSON.stringify({ missing, unitsPerEm: fk.unitsPerEm, charCount: [...text].length }));

const doc = await PDFDocument.create();
doc.registerFontkit(fontkit);
const font = await doc.embedFont(fontBytes);
const page = doc.addPage([595, 842]);
try {
  page.drawText(text, { x: 399.3, y: 724.9, size: 14, font });
  console.log('drawText ok');
} catch (error) {
  console.log('drawText fail', String(error.message || error));
}
try {
  font.encodeText(text);
  console.log('encodeText ok', font.widthOfTextAtSize(text, 14));
} catch (error) {
  console.log('encodeText fail', String(error.message || error));
}
const bytes = await doc.save();
fs.writeFileSync('reports/output/track-a/naskh-probe.pdf', bytes);
const read = await inspectPdfFile('reports/output/track-a/naskh-probe.pdf');
console.log(JSON.stringify({
  keys: Object.keys(read),
  pageKeys: Object.keys(read.pages?.[0] || {}),
  spans: (read.pages?.[0]?.spans || read.spans || []).slice(0, 10).map((span) => ({ text: span.text, x: span.x, y: span.y, font: span.font })),
}, null, 2));
