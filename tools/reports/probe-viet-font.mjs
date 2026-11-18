import fs from 'node:fs';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';
import { execFileSync } from 'node:child_process';

async function trial(file, label) {
  const text = 'Kính đề nghị giao cho — Ghi chú';
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const bytes = fs.readFileSync(file);
  const font = await doc.embedFont(bytes, { subset: true });
  let encoded = 'ok';
  try { font.encodeText(text); } catch (error) { encoded = String(error.message || error); }
  const page = doc.addPage([500, 200]);
  page.drawText(text, { x: 20, y: 100, size: 12, font });
  const outPath = `reports/output/track-a2/viet-${label}.pdf`;
  fs.writeFileSync(outPath, await doc.save());
  const out = execFileSync('pdftotext', ['-layout', outPath, '-'], { encoding: 'utf8' });
  console.log(JSON.stringify({ label, encoded, text: out.trim() }));
}

await trial('reports/fonts/NotoSans-Bold.ttf', 'bold');
await trial('reports/fonts/NotoSans-Regular.ttf', 'regular');
await trial('reports/fonts/Arimo-Bold.ttf', 'arimo-bold');
await trial('reports/fonts/NotoNaskhArabic-Regular.ttf', 'naskh');
