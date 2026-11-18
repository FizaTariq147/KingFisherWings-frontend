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
  text += streamBytes(page.node.context.lookup(entries.Contents.get(index)));
}
const lines = text.split('\n');
const hits = [];
for (let index = 0; index < lines.length; index += 1) {
  if (lines[index] === 'rg' || lines[index] === 'f' || lines[index] === 'cm' || lines[index] === 're') {
    hits.push(`${index}: ${lines.slice(Math.max(0, index - 6), index + 1).join(' ')}`);
  }
}
console.log(hits.filter((line) => /rg| 1 1 1 rg|re$/.test(line)).slice(0, 80).join('\n'));
console.log('---tail---');
console.log(lines.slice(-40).join('\n'));
