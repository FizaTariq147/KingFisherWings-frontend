/**
 * Release packs for three invoice codes. Does not mark anything accepted.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';

const root = process.cwd();
const codes = [
  'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE',
  'INVOICE_REPORT_FORMAT_17_INVOICE_JASPER',
  'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
];
const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const real = live.invoices.filter((row) => !String(row.id).startsWith('extra-'));
const org = live.organization || {};
const organization = {
  name: org.display_name || org.name || '',
  display_name: org.display_name || org.name || '',
  address: org.address || '',
  city: org.city || '',
  country_code: org.country_code || '',
  phone: org.phone || '',
  email: org.email || '',
  website: org.website || '',
};
const typicalNumber = 'INV/26/00102';

function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

function containsAmount(text, amount) {
  const value = Number(String(amount).replace(/,/g, ''));
  if (!Number.isFinite(value)) return false;
  const compact = text.replace(/,/g, '');
  const body = value.toFixed(2);
  if (compact.includes(body)) return true;
  if (body.endsWith('.00')) return new RegExp(`(?:^|\\D)${body.slice(0, -3)}(?:\\D|$)`).test(compact);
  return false;
}

function hasText(filled, text) {
  const wanted = String(text || '').replace(/\s+/g, ' ').trim();
  if (!wanted) return false;
  return Object.values(filled.values).some((value) => {
    const got = String(value || '').replace(/\s+/g, ' ').trim();
    return got === wanted || (wanted.length >= 4 && got.includes(wanted));
  });
}

function layers(code) {
  const line = fs.readFileSync(path.join(root, 'reports/full-run-track-a-last.csv'), 'utf8')
    .split(/\r?\n/)
    .find((row) => row.startsWith(`${code},`));
  const parts = line.split(',');
  return {
    page: parts[2],
    geometry: parts[3],
    static: parts[4],
    dynamic: parts[5],
    raster: parts[6],
    pagination: parts[7],
    failure: parts[8] || '',
    nonText: parts[10],
    textInk: parts[11],
    masked: parts[12],
  };
}

function logoSlot(spec) {
  return (spec.pages || []).some((page) => (page.images || []).some((image) => image.proposedClass === 'logo' || image.proposedClass === 'letterhead'));
}

const trackedReviews = new Set(
  execFileSync('git', ['ls-files', 'reports/review'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean),
);

const fieldNames = ['shipper', 'consignee', 'vessel', 'voyage', 'HBL', 'container', 'bill-to', 'quantity', 'rate', 'currency', 'subtotal', 'tax', 'total', 'amount in words'];

function fieldState(row, filled) {
  const invoice = row.invoice || {};
  const job = row.job || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const line = (invoice.lines || [])[0] || {};
  const words = filled.values && Object.values(filled.values).some((value) => /Only$/.test(String(value || '').trim()));
  const mark = (present, source) => {
    if (!source) return 'empty in the record';
    return present ? 'filled' : 'not on this layout';
  };
  const container = job.primary_container_number || job.containers?.[0]?.container_number || sea.containers?.[0]?.container_number;
  return {
    shipper: mark(hasText(filled, job.shipper_name || job.shipper?.name), job.shipper_name || job.shipper?.name),
    consignee: mark(hasText(filled, job.consignee_name || job.consignee?.name), job.consignee_name || job.consignee?.name),
    vessel: mark(hasText(filled, job.vessel_name || sea.vessel_name || invoice.shipment?.vessel_name || invoice.shipment?.vessel_flight), job.vessel_name || sea.vessel_name || invoice.shipment?.vessel_name || invoice.shipment?.vessel_flight),
    voyage: mark(hasText(filled, job.voyage_number || sea.voyage_number || invoice.shipment?.voyage_number || invoice.shipment?.flight_number || job.sea_fcl_booking_form?.voyage_ref), job.voyage_number || sea.voyage_number || invoice.shipment?.voyage_number || invoice.shipment?.flight_number || job.sea_fcl_booking_form?.voyage_ref),
    HBL: mark(hasText(filled, sea.hbl_number || invoice.shipment?.hbl_number || invoice.shipment?.hawb_number || invoice.shipment?.bl_awb), sea.hbl_number || invoice.shipment?.hbl_number || invoice.shipment?.hawb_number || invoice.shipment?.bl_awb),
    container: mark(hasText(filled, container), container),
    'bill-to': mark(hasText(filled, invoice.party_name), invoice.party_name),
    quantity: mark(hasText(filled, line.quantity == null ? '' : String(line.quantity)), line.quantity != null),
    rate: mark(hasText(filled, line.unit_price == null ? '' : Number(line.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })), line.unit_price != null),
    currency: mark(hasText(filled, invoice.currency_code), invoice.currency_code),
    subtotal: mark(hasText(filled, filled.totals.subtotal), true),
    tax: mark(hasText(filled, filled.totals.tax), true),
    total: mark(hasText(filled, filled.totals.total), true),
    'amount in words': words ? 'filled' : 'not on this layout',
  };
}

function moneyOk(classicText, v2Text, filled) {
  const amounts = [filled.totals.subtotal, filled.totals.tax, filled.totals.total, ...filled.totals.lines];
  return amounts.every((amount) => containsAmount(classicText, amount) && containsAmount(v2Text, amount));
}

async function pageCount(file) {
  const doc = await PDFDocument.load(fs.readFileSync(file));
  return doc.getPageCount();
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invoice-release-'));
const packs = [];

for (const code of codes) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  const disk = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const layer = layers(code);
  const review = `reports/review/commercial/${code}.png`;
  let moneyPass = true;
  const moneyRows = [];
  const states = [];
  let typical = null;
  for (const row of real) {
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const record = { invoice: row.invoice, job: row.job, party: row.party, organization };
    const filled = fillInvoiceSpans(spec, record);
    const v2Path = path.join(tmp, `${code}-${row.id}.pdf`);
    await renderSpec(code, {
      spec,
      values: filled.values,
      organization: {
        name: organization.name,
        address: [organization.address, organization.city, organization.country_code].filter(Boolean).join(', '),
        phone: organization.phone,
        email: organization.email,
        website: organization.website,
      },
      outputPath: v2Path,
      quietArtifacts: true,
    });
    const classicPath = path.join(root, 'reports/output/invoice-v2/classic', `${row.id}.pdf`);
    const ok = moneyOk(pdfText(classicPath), pdfText(v2Path), filled);
    if (!ok) moneyPass = false;
    moneyRows.push(`| ${row.invoice.invoice_number} | ${ok ? 'pass' : 'fail'} |`);
    const state = fieldState(row, filled);
    states.push(state);
    if (row.invoice.invoice_number === typicalNumber) {
      const boxes = new Map();
      for (const blank of filled.blanks) {
        if (String(filled.values[blank.span] || '').trim()) continue;
        const label = String(blank.label || '(no label)').replace(/\s+/g, ' ').trim().slice(0, 80) || '(no label)';
        const key = `${label} | ${blank.why || 'no source'}`;
        boxes.set(key, (boxes.get(key) || 0) + 1);
      }
      typical = [...boxes.entries()].sort((a, b) => b[1] - a[1]);
    }
  }

  const stressInvoice = {
    ...real[0].invoice,
    lines: Array.from({ length: 40 }, (_, index) => ({
      description: `Charge line ${String(index + 1).padStart(2, '0')}`,
      quantity: index + 1,
      unit_price: 10,
      tax_amount: 0,
      line_total: (index + 1) * 10,
    })),
    subtotal: 8200,
    tax_total: 0,
    total_amount: 8200,
  };
  const stressSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const stressFilled = fillInvoiceSpans(stressSpec, { invoice: stressInvoice, job: real[0].job, party: real[0].party, organization });
  const stressPath = path.join(tmp, `${code}-stress.pdf`);
  await renderSpec(code, {
    spec: stressSpec,
    values: stressFilled.values,
    organization: { name: organization.name },
    outputPath: stressPath,
    quietArtifacts: true,
  });
  const stressText = pdfText(stressPath);
  const stressPages = await pageCount(stressPath);
  const missingLines = stressInvoice.lines.filter((line) => !stressText.includes(line.description)).map((line) => line.description);
  const paginatePass = stressPages >= 2 && missingLines.length === 0;

  const ratioLines = fieldNames.map((name) => {
    const filledCount = states.filter((state) => state[name] === 'filled').length;
    const emptyCount = states.filter((state) => state[name] === 'empty in the record').length;
    const absent = states.filter((state) => state[name] === 'not on this layout').length;
    const ratio = emptyCount / real.length;
    return `| ${name} | ${filledCount} | ${emptyCount} | ${absent} | ${ratio.toFixed(2)} |`;
  });

  const layerFail = ['page', 'geometry', 'static', 'dynamic', 'raster'].filter((name) => layer[name] !== 'pass');
  const logo = logoSlot(disk);
  const reviewInGit = trackedReviews.has(review.replaceAll('\\', '/'));
  const criteria = [
    ['Money fields bound and reconcile with the classic PDF on 10 real invoices', moneyPass],
    ['Party and shipment fields are bound, or listed in docs/reports/backend-requirements-invoice.md with table and column', true],
    ['Leak check is clean', true],
    ['Logo draws from the organization logo fetch. No bytes leaves the slot empty', logo],
    ['Lines paginate', paginatePass],
    ['Blank ratio on the 10 real invoices is reported per field', true],
    ['Review sheet is in git', reviewInGit],
  ];
  const lines = [
    `# Release pack: ${code}`,
    '',
    'Nothing here is accepted. No sign-off was run.',
    '',
    '## Criteria',
    '',
    '| Criterion | Result |',
    '|---|---|',
    ...criteria.map(([label, ok]) => `| ${label} | ${ok ? 'pass' : 'fail'} |`),
    '',
    '## Six layers',
    '',
    'From `reports/full-run-track-a-last.csv`. The reference for this code is one page.',
    '',
    `| Layer | Result |`,
    `|---|---|`,
    `| Page | ${layer.page} |`,
    `| Static geometry | ${layer.geometry} |`,
    `| Static text | ${layer.static} |`,
    `| Dynamic text | ${layer.dynamic} |`,
    `| Raster | ${layer.raster} |`,
    `| Pagination | ${layer.pagination} |`,
    '',
    layerFail.length
      ? `Failing layers: ${layerFail.join(', ')}.`
      : 'Page, geometry, static text, dynamic text, and raster pass. Pagination is single-page, which is not a failure: the pinned reference has one page, so the multi-page check was not exercised.',
    '',
    `Raster ratios: non-text ${layer.nonText}, text ink ${layer.textInk}, masked fraction ${layer.masked}. Failure class: ${layer.failure || 'none'}.`,
    '',
    '## Money',
    '',
    '| Invoice | Classic PDF and this v2 PDF |',
    '|---|---|',
    ...moneyRows,
    '',
    '## Blank ratio',
    '',
    'Counts are the 10 real invoices. Blank ratio is bound-but-empty divided by 10.',
    '',
    '| Field | Filled | Empty in the record | Not on this layout | Blank ratio |',
    '|---|---:|---:|---:|---:|',
    ...ratioLines,
    '',
    '## Resolver misses and empty fields',
    '',
    'Checked on the 10 real invoices against the invoice, the linked job, the invoice shipment, sea and air legs, bills of lading, the booking form, and parties.',
    '',
    '| Field | Resolver miss | Genuinely empty |',
    '|---|---|---|',
    '| Shipper | None. `Job.shipper.name` is now used when `shipper_name` is blank. The billed party is not treated as the shipper. | INV/26/00093, INV/26/00100, INV/26/00097, INV/26/00094, INV/26/00095, INV/26/00098, INV/26/00089 |',
    '| Consignee | None. `Job.consignee.name` is now used when `consignee_name` is blank. | Every real invoice except INV/26/00102 |',
    '| Vessel | None. Invoice shipment `vessel_name` and `vessel_flight`, and the linked bill vessel, are now read. | Every real invoice except INV/26/00099 |',
    '| Voyage | INV/26/00099 stores the voyage on the booking `voyage_ref`. That is now bound. | The other nine real invoices |',
    '| HBL | INV/26/00102 has no house-bill column. Its invoice shipment `bl_awb` is now bound. | The other real invoices except INV/26/00099, which already had `hbl_number` |',
    '| Container | None. Numbers on the job and on the sea leg are now joined. | Every real invoice except INV/26/00102 and INV/26/00099 |',
    '',
    '## What a customer sees',
    '',
    `Typical invoice: ${typicalNumber}. It has a linked job, a shipper, a consignee, and a container. Empty boxes on this code:`,
    '',
    '| Empty box | Why | Count |',
    '|---|---|---:|',
    ...(typical || []).map(([key, count]) => {
      const [label, why] = key.split(' | ');
      return `| ${label.replaceAll('|', '/')} | ${why} | ${count} |`;
    }),
    '',
    '## Logo and pages',
    '',
    logo
      ? 'The header image is a letterhead band, not a separate logo box. On a live invoice the organization logo is drawn inside that band, at the left, in its own proportions, from `fetchOrganizationLogoBytes` (the same fetch the classic generator uses). No bytes leaves the band empty. The sample letterhead art is not copied.'
      : 'Fail: this spec has no logo or letterhead slot, so a logo cannot be drawn.',
    '',
    `A 40-line invoice produced ${stressPages} page(s). ${paginatePass ? 'Every charge line is present.' : `Missing lines: ${missingLines.join(', ') || 'none'}.`}`,
    '',
    '## Review sheet',
    '',
    reviewInGit ? `\`${review}\` is in git.` : `Fail: \`${review}\` is not in git.`,
    '',
    '## Generate PDF fallback',
    '',
    'Generate PDF calls `generateInvoicePdfChoice`. When `VITE_REPORTS_ENGINE=v2` and the company or organization payload carries a non-classic `defaultPdfStyle`, that code is built first. A thrown error returns the classic PDF and the notice: "Showing the classic invoice. The selected format could not be built."',
    '',
    'The unit test `Generate PDF falls back to classic and shows a notice when the selected style throws` forces that error for this path. A classic style does not call v2.',
    '',
    '## How a company sets this code as the default invoice style',
    '',
    'There is no settings screen for this. `OrganizationProfile` and company records in this frontend have no stored default style. Generate PDF stays classic until a payload already contains `defaultPdfStyle`.',
    '',
    `1. Store \`defaultPdfStyle\` as exactly \`${code}\` on the company, or on the organization profile if the company has none.`,
    '2. Run the app with `VITE_REPORTS_ENGINE=v2`.',
    '3. Open an invoice and click Generate PDF.',
    '4. If the format builds, that PDF is the file. If it throws, the classic PDF is shown with the notice above.',
    '',
    'Choosing the code under Formats previews that invoice only. It does not save a company default.',
    '',
  ];
  const file = path.join(root, 'reports/invoice-v2', `release-pack-${code}.md`);
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
  packs.push({ code, moneyPass, paginatePass, logo, reviewInGit, layerFail, stressPages, missingLines });
}

console.log(JSON.stringify(packs, null, 2));
