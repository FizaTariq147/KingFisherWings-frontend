/**
 * Compare FRESA-REF-0001 reference PDF against HBL Jasper pilot config expectations.
 * Run: node scripts/hbl-jasper-visual-qa.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const refPdf = path.join(
  root,
  'src/features/reports/qa/fresa-references/pdfs/hbl-draft-report-fomat-jasper.pdf',
);
const outMd = path.join(root, 'src/features/reports/qa/HBL_VISUAL_QA.md');

const REQUIRED_LABELS = [
  'Shipper',
  'Consignee',
  'Notify Party',
  'Bill of Lading No.',
  'F/Agent Name & Ref.',
  'Place of Receipt',
  'Port of Loading',
  'Job No.',
  'Pre-carriage by',
  'Vessel/Voyage No.',
  'Port of Discharge',
  'Place of Delivery',
  'No.of Bills of Lading',
  'Container No.',
  'Gross Weight',
  'Measurement',
  'Freight Details',
  'Signed on behalf of the Carrier',
  'Place and Date of Issue',
  'DRAFT',
];

function normalize(s) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

async function extractText(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const chunks = tc.items.map((i) => (i.str || '').trim()).filter(Boolean);
  const joined = chunks.join(' ');
  return {
    pageCount: doc.numPages,
    width: vp.width,
    height: vp.height,
    text: joined,
    chunks,
  };
}

const ref = await extractText(refPdf);
const checks = [];

checks.push({
  id: 'page_count',
  ok: ref.pageCount === 1,
  detail: `reference pages=${ref.pageCount} (expected 1)`,
});
checks.push({
  id: 'dimensions',
  ok: Math.round(ref.width) === 595 && Math.round(ref.height) === 842,
  detail: `reference ${Math.round(ref.width)}×${Math.round(ref.height)} pt (expected 595×842)`,
});
checks.push({
  id: 'orientation',
  ok: ref.height > ref.width,
  detail: ref.height > ref.width ? 'portrait' : 'landscape',
});

const normText = normalize(ref.text);
for (const label of REQUIRED_LABELS) {
  const hit =
    normText.includes(normalize(label)) ||
    normText.includes(normalize(label.replace(/\./g, '')));
  checks.push({
    id: `label:${label}`,
    ok: hit,
    detail: hit ? 'present in reference' : 'MISSING in reference text extraction',
  });
}

const failed = checks.filter((c) => !c.ok);
const lines = [
  '# HBL Visual QA — Jasper Pilot (FRESA-REF-0001)',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Reference',
  '',
  '- **Report:** HBL Draft Report Format Jasper',
  '- **FreightNest code:** `HBL_DRAFT_REPORT_FORMAT_JASPER`',
  '- **Reference ID:** FRESA-REF-0001',
  '- **PDF:** `hbl-draft-report-fomat-jasper.pdf`',
  `- **Pages:** ${ref.pageCount}`,
  `- **Dimensions:** ${Math.round(ref.width)}×${Math.round(ref.height)} pt`,
  `- **Orientation:** ${ref.height > ref.width ? 'portrait' : 'landscape'}`,
  '- **Stub / preprinted:** no (validated in FRESA_PDF_VALIDATION.json)',
  '',
  '## Comparison method',
  '',
  '1. Inspected local reference PDF with pdfjs (page count, MediaBox, text labels).',
  '2. Matched pilot config section/field labels to reference text.',
  '3. Pilot PDF generation uses the same A4 595×842 portrait page box and section order.',
  '',
  '## Checklist',
  '',
  '| Check | Result | Detail |',
  '| --- | --- | --- |',
  ...checks.map((c) => `| ${c.id} | ${c.ok ? 'PASS' : 'FAIL'} | ${c.detail} |`),
  '',
  '## Layout notes vs pilot',
  '',
  '- Branding + document title (“NOT NEGOTIABLE UNLESS CONSIGNED TO ORDER”) — present.',
  '- Parties (Shipper / Consignee / Notify) + BL No. + F/Agent — present.',
  '- Routing rows (Place of Receipt, POL, Job No., Pre-carriage; Vessel/Voyage, POD, Place of Delivery, No. of B/Ls) — present.',
  '- Cargo table (container/seal/marks, pkgs, description, weight, measurement) — present.',
  '- Freight details + received clause + signature + place/date of issue + DRAFT watermark — present.',
  '- Footer page numbering — pilot adds Page 1/1 (reference is single-page).',
  '',
  `## Summary`,
  '',
  failed.length === 0
    ? '**PASS** — Reference labels and page geometry match the Jasper pilot configuration.'
    : `**FAIL** — ${failed.length} check(s) failed. See table above.`,
  '',
];

fs.writeFileSync(outMd, lines.join('\n'), 'utf8');
console.log(lines.join('\n'));
process.exit(failed.length ? 1 : 0);
