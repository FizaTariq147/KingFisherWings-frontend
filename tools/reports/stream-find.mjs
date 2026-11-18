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
console.log('rotate', page.getRotation().angle, 'media', page.getMediaBox(), 'crop', page.node.CropBox() ? 'yes' : 'no');
const entries = page.node.normalizedEntries();
console.log('contents', entries.Contents.size());
let text = '';
for (let index = 0; index < entries.Contents.size(); index += 1) {
  text += streamBytes(page.node.context.lookup(entries.Contents.get(index)));
}
for (const needle of process.argv.slice(3)) {
  let from = 0;
  let n = 0;
  while (n < 4) {
    const at = text.indexOf(needle, from);
    if (at < 0) break;
    console.log('---', needle, at);
    console.log(text.slice(Math.max(0, at - 80), at + 40).replace(/\n/g, ' '));
    from = at + needle.length;
    n += 1;
  }
  if (!n) console.log('missing', needle);
}
