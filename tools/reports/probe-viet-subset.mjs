import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';

const text = 'Kính đề nghị giao cho';
for (const subset of [true, false]) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(fs.readFileSync('reports/fonts/NotoSans-Bold.ttf'), { subset });
  const page = doc.addPage();
  page.drawText(text, { x: 40, y: 700, size: 12, font, color: rgb(0, 0, 0) });
  const file = `reports/output/track-a2/viet-subset-${subset}.pdf`;
  fs.writeFileSync(file, await doc.save());
  const out = execFileSync('pdftotext', ['-enc', 'UTF-8', file, '-'], { encoding: 'utf8' });
  console.log(JSON.stringify({ subset, out: out.trim(), encoded: font.encodeText(text).length }));
}
