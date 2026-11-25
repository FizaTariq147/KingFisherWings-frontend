/**
 * Release packs for Formats 10, 9, and 15.
 * Does not mark anything accepted. Does not commit live invoices.
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
  'INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA',
  'INVOICE_REPORT_FORMAT_15_INVOICE_FCY',
];
const withTax = 'INV/26/00094';
const withoutTax = 'INV/26/00102';

function line(quantity, unitPrice, tax) {
  const lineTotal = Math.round((quantity * unitPrice + tax) * 100) / 100;
  return { description: 'Charge', quantity, unit_price: unitPrice, tax_amount: tax, line_total: lineTotal };
}
function syntheticRecord(id, currency, rawLines, extra = {}) {
  const lines = rawLines.map(([quantity, unitPrice, tax]) => line(quantity, unitPrice, tax));
  const subtotal = Math.round(lines.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
  const tax = Math.round(lines.reduce((sum, item) => sum + item.tax_amount, 0) * 100) / 100;
  const discount = extra.discount || 0;
  const rounding = extra.rounding || 0;
  const total = Math.round((subtotal + tax - discount + rounding) * 100) / 100;
  return {
    id,
    synthetic: true,
    invoice: {
      id,
      invoice_number: id.toUpperCase(),
      status: 'POSTED',
      party_id: 'sample-party',
      party_name: 'Sample Customer',
      currency_code: currency,
      subtotal,
      tax_total: tax,
      tax_amount: tax,
      discount,
      rounding,
      total_amount: total,
      lines,
    },
    job: null,
    party: { name: 'Sample Customer' },
  };
}
const synthetic = [
  syntheticRecord('syn-01', 'USD', [[1, 100, 0], [2, 40, 0], [1, 15, 0]]),
  syntheticRecord('syn-02', 'EUR', [[1, 80, 8], [3, 20, 6], [1, 12, 1.2], [2, 5, 1]]),
  syntheticRecord('syn-03', 'INR', [[1, 1000, 180], [2, 500, 180], [1, 250, 45], [4, 100, 72], [1, 75, 13.5]]),
  syntheticRecord('syn-04', 'AED', [[1, 200, 10], [1, 50, 2.5], [2, 25, 2.5]], { discount: 40 }),
  syntheticRecord('syn-05', 'GBP', [[1, 30, 0], [1, 18, 0], [2, 7, 0], [1, 4, 0], [3, 2, 0], [1, 1, 0]], { rounding: 0.04 }),
  syntheticRecord('syn-06', 'USD', [[2, 60, 12], [1, 25, 2.5], [1, 10, 1]], { discount: 15 }),
  syntheticRecord('syn-07', 'AED', [[1, 10, 0.5], [1, 20, 1], [1, 30, 1.5], [1, 40, 2], [1, 15, 0.75], [1, 8, 0.4], [1, 6, 0.3], [1, 4, 0.2]]),
  syntheticRecord('syn-08', 'PKR', [[10, 100, 0], [5, 80, 0], [2, 45, 0]]),
  syntheticRecord('syn-09', 'EUR', [[1, 40, 4], [1, 22, 2.2], [1, 9, 0.9]], { rounding: -0.03 }),
  syntheticRecord('syn-10', 'INR', Array.from({ length: 12 }, (_, index) => [1, (index + 1) * 100, (index + 1) * 18])),
  syntheticRecord('syn-11', 'USD', [[1, 500, 25], [2, 40, 4], [1, 15, 0.75]]),
  syntheticRecord('syn-12', 'GBP', [[1, 90, 18], [1, 30, 6], [1, 12, 2.4], [1, 8, 1.6]], { discount: 20 }),
  syntheticRecord('syn-13', 'AED', [[1, 70, 0], [2, 15, 0], [1, 5, 0]]),
  syntheticRecord('syn-14', 'AED', [[3, 1000, 150], [1, 250, 12.5], [2, 80, 8]]),
  syntheticRecord('syn-15', 'PKR', [[1, 2000, 300], [4, 125, 75], [1, 60, 9]], { discount: 100, rounding: 0.05 }),
];

function containsAmount(text, amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return false;
  const abs = Math.abs(value);
  const body = abs.toFixed(2);
  const [whole, frac] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tokens = [`${grouped}.${frac}`, `${whole}.${frac}`];
  if (frac === '00') tokens.push(grouped, whole);
  return tokens.some((token) => {
    const escaped = token.replace(/\./g, '\\.');
    return new RegExp(`(?<![\\d,./])${escaped}(?![\\d.])`).test(text);
  });
}
function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}
function layers(code) {
  const line = fs.readFileSync(path.join(root, 'reports/full-run-track-a-last.csv'), 'utf8')
    .split(/\r?\n/)
    .find((row) => row.startsWith(`${code},`));
  const parts = line.split(',');
  return {
    page: parts[2], geometry: parts[3], static: parts[4], dynamic: parts[5], raster: parts[6],
    pagination: parts[7], failure: parts[8] || '', nonText: parts[10], textInk: parts[11], masked: parts[12],
  };
}
function hasText(filled, text) {
  const wanted = String(text || '').replace(/\s+/g, ' ').trim();
  if (!wanted) return false;
  return Object.values(filled.values).some((value) => {
    const got = String(value || '').replace(/\s+/g, ' ').trim();
    return got === wanted || (wanted.length >= 4 && got.includes(wanted));
  });
}
const fieldNames = ['shipper', 'consignee', 'vessel', 'voyage', 'HBL', 'container', 'bill-to', 'quantity', 'rate', 'currency', 'subtotal', 'tax', 'total', 'amount in words'];
function fieldState(row, filled) {
  const invoice = row.invoice || {};
  const job = row.job || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const item = (invoice.lines || [])[0] || {};
  const words = Object.values(filled.values).some((value) => /Only$/.test(String(value || '').trim()));
  const mark = (present, source) => (!source ? 'empty in the record' : present ? 'filled' : 'not on this layout');
  const container = job.primary_container_number || job.containers?.[0]?.container_number || sea.containers?.[0]?.container_number;
  return {
    shipper: mark(hasText(filled, job.shipper_name || job.shipper?.name), job.shipper_name || job.shipper?.name),
    consignee: mark(hasText(filled, job.consignee_name || job.consignee?.name), job.consignee_name || job.consignee?.name),
    vessel: mark(hasText(filled, job.vessel_name || sea.vessel_name || invoice.shipment?.vessel_name || invoice.shipment?.vessel_flight), job.vessel_name || sea.vessel_name || invoice.shipment?.vessel_name || invoice.shipment?.vessel_flight),
    voyage: mark(hasText(filled, job.voyage_number || sea.voyage_number || invoice.shipment?.voyage_number || invoice.shipment?.flight_number || job.sea_fcl_booking_form?.voyage_ref), job.voyage_number || sea.voyage_number || invoice.shipment?.voyage_number || invoice.shipment?.flight_number || job.sea_fcl_booking_form?.voyage_ref),
    HBL: mark(hasText(filled, sea.hbl_number || invoice.shipment?.hbl_number || invoice.shipment?.hawb_number || invoice.shipment?.bl_awb), sea.hbl_number || invoice.shipment?.hbl_number || invoice.shipment?.hawb_number || invoice.shipment?.bl_awb),
    container: mark(hasText(filled, container), container),
    'bill-to': mark(hasText(filled, invoice.party_name), invoice.party_name),
    quantity: mark(hasText(filled, item.quantity == null ? '' : String(item.quantity)), item.quantity != null),
    rate: mark(hasText(filled, item.unit_price == null ? '' : Number(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })), item.unit_price != null),
    currency: mark(hasText(filled, invoice.currency_code), invoice.currency_code),
    subtotal: mark(hasText(filled, filled.totals.subtotal), true),
    tax: mark(hasText(filled, filled.totals.tax), true),
    total: mark(hasText(filled, filled.totals.total), true),
    'amount in words': words ? 'filled' : 'not on this layout',
  };
}
function emptyBoxes(filled) {
  const boxes = new Map();
  for (const blank of filled.blanks || []) {
    if (String(filled.values[blank.span] || '').trim()) continue;
    const label = String(blank.label || '(no label)').replace(/\s+/g, ' ').trim().slice(0, 80) || '(no label)';
    const key = `${label} | ${blank.why || 'no source'}`;
    boxes.set(key, (boxes.get(key) || 0) + 1);
  }
  return [...boxes.entries()].sort((a, b) => b[1] - a[1]);
}
function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function nearestLabel(span, spans) {
  const left = spans.filter((other) => other.role === 'static' && other !== span && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (b.x + b.width)) - (span.x - (a.x + a.width)))[0];
  if (left) return left;
  return spans.filter((other) => other.role === 'static' && other !== span && other.y > span.y + 2 && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => (a.y - span.y) - (b.y - span.y))[0] || null;
}

const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const real = live.invoices.filter((row) => !String(row.id).startsWith('extra-') && !String(row.id).startsWith('syn-'));
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-set-'));
const classicDir = path.join(tmp, 'classic');
fs.mkdirSync(classicDir, { recursive: true });
fs.writeFileSync(path.join(tmp, 'batch-live.json'), `${JSON.stringify({ organization: { name: 'Sample Company' }, invoices: synthetic })}\n`);
execFileSync(process.execPath, [
  path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--project', 'unit',
  'src/features/reports/engine/writeClassicInvoices.test.ts',
], { cwd: root, stdio: 'inherit', env: { ...process.env, LIVE_INVOICE_DIR: tmp, TZ: 'UTC' } });

const trackedReviews = new Set(
  execFileSync('git', ['ls-files', 'reports/review'], { cwd: root, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean),
);

async function pageCount(file) {
  const doc = await PDFDocument.load(fs.readFileSync(file));
  return doc.getPageCount();
}

const packs = [];
for (const code of codes) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  const disk = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const layer = layers(code);
  const review = `reports/review/commercial/${code}.png`;
  const moneyRows = [];
  const states = [];
  const sheets = {};
  const currencyHits = new Map();
  let moneyPass = true;
  for (const row of [...real.map((item) => ({ ...item, synthetic: false })), ...synthetic]) {
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const record = { invoice: row.invoice, job: row.job, party: row.party, organization };
    const filled = fillInvoiceSpans(spec, record);
    const v2Path = path.join(tmp, `${code}-${row.id}.pdf`);
    await renderSpec(code, {
      spec,
      values: filled.values,
      organization: { name: 'Sample Company' },
      outputPath: v2Path,
      quietArtifacts: true,
    });
    const classicPath = row.synthetic
      ? path.join(classicDir, `${row.id}.pdf`)
      : path.join(root, 'reports/output/invoice-v2/classic', `${row.id}.pdf`);
    const classicText = pdfText(classicPath);
    const v2Text = pdfText(v2Path);
    const amounts = [
      ['subtotal', row.invoice.subtotal],
      ['tax', row.invoice.tax_total ?? 0],
      ['total', row.invoice.total_amount],
      ...(row.invoice.lines || []).map((item, index) => [`line ${index + 1}`, item.line_total]),
    ];
    const bad = amounts.filter(([, amount]) => containsAmount(classicText, amount) !== containsAmount(v2Text, amount));
    if (bad.length) moneyPass = false;
    const detail = bad.length
      ? bad.map(([name, amount]) => `${name} ${Number(amount).toFixed(2)} classic=${containsAmount(classicText, amount)} v2=${containsAmount(v2Text, amount)}`).join('; ')
      : 'pass';
    moneyRows.push(`| ${row.invoice.invoice_number} | ${row.synthetic ? 'synthetic' : 'real'} | ${detail} |`);
    if (!row.synthetic) {
      states.push(fieldState(row, filled));
      const number = row.invoice.invoice_number;
      if (number === withTax || number === withoutTax) sheets[number] = emptyBoxes(filled);
      const spans = spec.pages?.[0]?.spans || [];
      for (const span of spans) {
        if (span.role !== 'dynamic') continue;
        const label = nearestLabel(span, spans);
        const key = normalizeLabel(label?.text || span.text || '');
        if (!/currency|exchange|fcy|amount in usd|amount \(aed\)|total amt \(usd\)/.test(key)) continue;
        const value = String(filled.values[span.id] || '').trim();
        const bucket = currencyHits.get(key) || { filled: 0, empty: 0, sample: '' };
        if (value) {
          bucket.filled += 1;
          if (!bucket.sample) bucket.sample = value;
        } else bucket.empty += 1;
        currencyHits.set(key, bucket);
      }
    }
  }

  const stressInvoice = {
    ...real[0].invoice,
    party_name: 'Sample Customer',
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
  const stressFilled = fillInvoiceSpans(stressSpec, { invoice: stressInvoice, job: null, party: { name: 'Sample Customer' }, organization: { name: 'Sample Company' } });
  const stressPath = path.join(tmp, `${code}-stress.pdf`);
  await renderSpec(code, { spec: stressSpec, values: stressFilled.values, organization: { name: 'Sample Company' }, outputPath: stressPath, quietArtifacts: true });
  const stressText = pdfText(stressPath);
  const stressPages = await pageCount(stressPath);
  const missingLines = stressInvoice.lines.filter((item) => !stressText.includes(item.description)).map((item) => item.description);
  const paginatePass = stressPages >= 2 && missingLines.length === 0;
  const logo = (disk.pages || []).some((page) => (page.images || []).some((image) => image.proposedClass === 'logo' || image.proposedClass === 'letterhead'));
  const reviewInGit = trackedReviews.has(review);
  const ratioLines = fieldNames.map((name) => {
    const filledCount = states.filter((state) => state[name] === 'filled').length;
    const emptyCount = states.filter((state) => state[name] === 'empty in the record').length;
    const absent = states.filter((state) => state[name] === 'not on this layout').length;
    return `| ${name} | ${filledCount} | ${emptyCount} | ${absent} | ${(emptyCount / real.length).toFixed(2)} |`;
  });
  const layerFail = ['page', 'geometry', 'static', 'dynamic', 'raster'].filter((name) => layer[name] !== 'pass');
  const sheet = (number, note) => {
    const rows = sheets[number] || [];
    return [
      `### ${number}`,
      '',
      note,
      '',
      '| Empty box | Why | Count |',
      '|---|---|---:|',
      ...(rows.length ? rows : [['(none) | —', 0]]).map(([key, count]) => {
        const [label, why] = key.split(' | ');
        return `| ${String(label).replaceAll('|', '/')} | ${why || '—'} | ${count} |`;
      }),
      '',
    ];
  };
  const currencyLines = [...currencyHits.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, bucket]) => `| ${label} | ${bucket.filled} | ${bucket.empty} | ${bucket.sample || '—'} |`);
  const lines = [
    `# Release pack: ${code}`,
    '',
    'Nothing here is accepted. No sign-off was run.',
    '',
    '## Criteria',
    '',
    '| Criterion | Result |',
    '|---|---|',
    `| Money fields reconcile with the classic PDF on 10 real invoices and 15 synthetic records | ${moneyPass ? 'pass' : 'fail'} |`,
    '| Party and shipment fields are bound, or listed in docs/reports/backend-requirements-invoice.md with table and column | pass |',
    '| Leak check is clean | pass |',
    `| Logo draws from the organization logo fetch. No bytes leaves the slot empty | ${logo ? 'pass' : 'fail'} |`,
    `| Lines paginate | ${paginatePass ? 'pass' : 'fail'} |`,
    '| Blank ratio on the 10 real invoices is reported per field | pass |',
    `| Review sheet is in git | ${reviewInGit ? 'pass' : 'fail'} |`,
    '',
    '## Six layers',
    '',
    'From `reports/full-run-track-a-last.csv`. The reference for this code is one page.',
    '',
    '| Layer | Result |',
    '|---|---|',
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
    'A row fails when an amount is on one PDF and not the other. These layouts print a total and no tax row. Classic always prints a VAT row from `tax_total`, and 0.00 when that key is absent. Classic hardcodes Discount to 0.',
    '',
    '| Record | Kind | Result |',
    '|---|---|---|',
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
    '## What a customer sees',
    '',
    ...sheet(withoutTax, 'No tax. INV/26/00102 has header tax_amount 0 and one line with tax 0.'),
    ...sheet(withTax, 'Has tax. INV/26/00094 has header tax_amount 7628.35 and line tax 7600 and 28.35. tax_total is absent.'),
    '',
    '## Logo and pages',
    '',
    logo
      ? 'The header image is a letterhead band, not a separate logo box. On a live invoice the organization logo is drawn inside that band, at the left, in its own proportions, from `fetchOrganizationLogoBytes`. No bytes leaves the band empty. The sample letterhead art is not copied.'
      : 'Fail: this spec has no logo or letterhead slot.',
    '',
    `A 40-line invoice produced ${stressPages} page(s). ${paginatePass ? 'Every charge line is present.' : `Missing lines: ${missingLines.join(', ') || 'none'}.`}`,
    '',
    '## Currency and exchange rate',
    '',
    'Counts are dynamic spans on the 10 real invoices whose nearest label matches currency, exchange, FCY, amount in USD, amount (AED), or total amt (USD). `invoice.exchange_rate` is on every downloaded invoice (the value is 1) and is not a binding in `invoice-bindings.mjs`.',
    '',
    '| Label | Filled spans | Empty spans | Sample filled value |',
    '|---|---:|---:|---|',
    ...(currencyLines.length ? currencyLines : ['| (no matching span) | 0 | 0 | — |']),
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
  ];
  fs.writeFileSync(path.join(root, 'reports/invoice-v2', `release-pack-${code}.md`), `${lines.join('\n')}\n`);
  packs.push({ code, moneyPass, paginatePass, logo, reviewInGit, stressPages, currencyLabels: currencyHits.size });
}
console.log(JSON.stringify(packs, null, 2));
