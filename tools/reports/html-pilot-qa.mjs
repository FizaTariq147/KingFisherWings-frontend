/**
 * Hybrid Option C — visual QA for HTML/CSS pilots.
 *
 * 1. Renders fixture PDFs via vitest (Playwright).
 * 2. Rasters generated (and reference when a PDF exists) at 150 dpi.
 * 3. Writes qa-notes.md per code. Does NOT mark accepted.
 *
 *   node tools/reports/html-pilot-qa.mjs
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outRoot = path.join(root, 'reports/html-pilots');

const PILOTS = [
  {
    code: 'HBL_DRAFT_REPORT_FORMAT_JASPER',
    referencePdf: path.join(root, 'reports/references/files/hbl-draft-report-fomat-jasper.pdf'),
    note: 'Reference is pinned FRESA HBL Jasper PDF. Generated uses KingFisher fixture data (not FRESA demo parties).',
  },
  {
    code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    referencePdf: (() => {
      const candidates = [
        path.join(root, 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf'),
        path.join(
          root,
          'src/features/reports/qa/fresa-references/pdfs/invoice-report-format-1-tax-invoice-india.pdf',
        ),
      ];
      return candidates.find((p) => fs.existsSync(p)) || null;
    })(),
    note: 'Catalogue HTML path only. Classic generateInvoicePdf is untouched.',
  },
  {
    code: 'JOB_LIST_SUMMARY_REPORT_FORMAT',
    referencePdf: null,
    referenceFile: path.join(root, 'reports/references/files/job-list-summary-report-format.xlsx'),
    note: 'FRESA sample is XLSX. HTML pilot emits landscape PDF. Raster vs FRESA PDF is N/A.',
  },
];

fs.mkdirSync(outRoot, { recursive: true });

console.log('Rendering HTML pilots via vitest…');
execFileSync(
  process.execPath,
  [
    path.join(root, 'node_modules/vitest/vitest.mjs'),
    'run',
    'src/features/reports/htmlPilots/htmlPilots.render.qa.test.ts',
  ],
  { cwd: root, stdio: 'inherit' },
);

function rasterize(pdfPath, pngPrefix) {
  const bin = process.platform === 'win32' ? 'pdftoppm' : 'pdftoppm';
  const result = spawnSync(bin, ['-png', '-r', '150', '-singlefile', pdfPath, pngPrefix], {
    encoding: 'utf8',
  });
  return result.status === 0;
}

const summary = [];

for (const pilot of PILOTS) {
  const dir = path.join(outRoot, pilot.code);
  fs.mkdirSync(dir, { recursive: true });
  const generatedPdf = path.join(dir, 'generated.pdf');
  const renderOk = fs.existsSync(generatedPdf) && fs.statSync(generatedPdf).size > 100;

  let generatedPng = null;
  let referencePng = null;
  if (renderOk) {
    const genPrefix = path.join(dir, 'generated-page-01');
    if (rasterize(generatedPdf, genPrefix) && fs.existsSync(`${genPrefix}.png`)) {
      generatedPng = `${genPrefix}.png`;
    }
  }
  if (pilot.referencePdf && fs.existsSync(pilot.referencePdf)) {
    const refCopy = path.join(dir, 'reference.pdf');
    fs.copyFileSync(pilot.referencePdf, refCopy);
    const refPrefix = path.join(dir, 'reference-page-01');
    if (rasterize(refCopy, refPrefix) && fs.existsSync(`${refPrefix}.png`)) {
      referencePng = `${refPrefix}.png`;
    }
  } else if (pilot.referenceFile && fs.existsSync(pilot.referenceFile)) {
    fs.copyFileSync(pilot.referenceFile, path.join(dir, path.basename(pilot.referenceFile)));
  }

  const notes = `# QA — ${pilot.code}

Nothing accepted. PDF generation alone is not acceptance.

## Checklist

- [ ] Page dimensions / orientation match the approved reference (or documented exception)
- [ ] Margins, fonts, spacing, borders, tables reviewed
- [ ] Long values tested
- [ ] Missing / empty values leave blanks (no invented data)
- [ ] Multi-page behavior reviewed where applicable
- [ ] Overlay / difference images inspected
- [ ] Required data and calculations verified against fixture + live record

## Notes

${pilot.note}

## Artifacts

- Fixture: \`fixture.json\`
- Generated PDF: ${renderOk ? '`generated.pdf`' : 'MISSING'}
- Generated PNG (150 dpi): ${generatedPng ? path.basename(generatedPng) : 'n/a'}
- Reference PNG (150 dpi): ${referencePng ? path.basename(referencePng) : 'n/a'}
- Diff: ${
    generatedPng && referencePng
      ? 'Run ImageMagick `compare` locally; not auto-accepted.'
      : 'Difference image not produced (missing generated or PDF reference).'
  }

## Remaining acceptance gaps

- Visual raster acceptance not claimed.
- Backend payload fixtures for live company data still required (see docs/reports/BACKEND_HTML_PILOT_PLAN.md).
- Do not edit status.json / signoff.csv / thresholds from this pilot work.
`;

  fs.writeFileSync(path.join(dir, 'qa-notes.md'), notes);
  summary.push({
    code: pilot.code,
    renderOk,
    generatedPng: Boolean(generatedPng),
    referencePng: Boolean(referencePng),
  });
}

const payload = { ok: summary.every((s) => s.renderOk), pilots: summary };
fs.writeFileSync(path.join(outRoot, 'summary.json'), `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify(payload, null, 2));
if (!payload.ok) process.exitCode = 1;
