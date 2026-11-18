import fs from 'node:fs';
import zlib from 'node:zlib';
import { PDFArray, PDFDocument, PDFName } from 'pdf-lib';

function streamBytes(stream) {
  const raw = Buffer.from(stream.getContents());
  const filter = stream.dict.lookup(PDFName.of('Filter'));
  const filters = filter instanceof PDFArray
    ? Array.from({ length: filter.size() }, (_, index) => filter.lookup(index))
    : filter ? [filter] : [];
  let data = raw;
  for (const item of filters) {
    if (String(item) !== '/FlateDecode') continue;
    data = zlib.inflateSync(data);
  }
  return data.toString('latin1');
}

const doc = await PDFDocument.load(fs.readFileSync(process.argv[2]));
const page = doc.getPages()[0];
const entries = page.node.normalizedEntries();
let text = '';
for (let index = 0; index < entries.Contents.size(); index += 1) {
  text += `\n${streamBytes(page.node.context.lookup(entries.Contents.get(index)))}`;
}
const colors = new Map();
for (const match of text.matchAll(/([^\n]{0,40})\n(rg|RG|g|G|k|K|sc|SC|scn|SCN)\n/g)) {
  const key = `${match[1].trim()} ${match[2]}`;
  colors.set(key, (colors.get(key) || 0) + 1);
}
console.log([...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map((item) => `${item[1]} ${item[0]}`).join('\n'));
console.log('length', text.length, 'Do', (text.match(/\nDo\n/g) || []).length, 'sh', (text.match(/\nsh\n/g) || []).length);
