/**
 * Rasterize first page of verification PDFs to PNG evidence.
 * Run: node scripts/render-pdf-evidence-pngs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  'src/features/reports/qa/visual-evidence/branding/company1-hbl-jasper.pdf',
  'src/features/reports/qa/visual-evidence/branding/company1-hawb-draft.pdf',
  'src/features/reports/qa/visual-evidence/hawb/hawb_draft_report_format.pdf',
  'src/features/reports/qa/visual-evidence/hawb/hawb_draft_report_format_1.pdf',
  'src/features/reports/qa/visual-evidence/hawb/hawb_draft_report_format_2.pdf',
  'src/features/reports/qa/visual-evidence/hawb/hawb_original_pre_printed_report_format_1.pdf',
  'src/features/reports/qa/visual-evidence/hawb/hawb_original_pre_printed_report_format_2.pdf',
];

async function renderFirstPage(pdfRel) {
  const pdfPath = path.join(root, pdfRel);
  if (!fs.existsSync(pdfPath)) return { pdfRel, ok: false, reason: 'missing' };
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const out = pdfPath.replace(/\.pdf$/i, '-page1.png');
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  return {
    pdfRel,
    ok: true,
    png: path.relative(root, out).replace(/\\/g, '/'),
    width: canvas.width,
    height: canvas.height,
    pages: doc.numPages,
  };
}

const results = [];
for (const t of targets) {
  try {
    results.push(await renderFirstPage(t));
  } catch (err) {
    results.push({
      pdfRel: t,
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    });
  }
}

const outJson = path.join(
  root,
  'src/features/reports/qa/visual-evidence/pdf-page-raster-results.json',
);
fs.writeFileSync(outJson, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
console.log(JSON.stringify({ results, outJson: path.relative(root, outJson) }, null, 2));
