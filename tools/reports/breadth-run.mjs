/**
 * Breadth wiring pass. Reads the capability census, binds every spec it can,
 * and writes what is wired and what stays browse-only. Accepts nothing.
 *
 *   node tools/reports/breadth-run.mjs [--skip-samples]
 *
 * Inputs:  reports/capability-census.csv, reports/specs/*.json,
 *          reports/binding-dictionary.csv, reports/invoice-v2-totals.json,
 *          reports/output/invoice-v2/batch-live.json (optional),
 *          src/features/reports/engine/invoiceV2Codes.ts
 * Outputs: reports/breadth/{coverage.csv,wired.json,browse-only.json,summary.md,samples-index.json}
 *          reports/breadth/samples/<registryFamily>/<code>.pdf and _contact-sheet.pdf
 *          src/features/reports/engine/breadthCodes.ts
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { leaksOnEmptyRecord } from './allowlist.mjs';
import { moduleForCode } from './document-context.mjs';
import { analyzeSpecBindings, fillSpecSpans } from './fill-spec-spans.mjs';
import { renderSpec } from './render-spec.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'reports/breadth');
const samplesDir = path.join(outDir, 'samples');
const codesFile = path.join(root, 'src/features/reports/engine/breadthCodes.ts');
const skipSamples = process.argv.includes('--skip-samples');

const EXCLUDED = new Map([
  ['BARCODE_AWB_REPORT_FORMAT', 'excluded from the breadth pass'],
  ['STANDARD_INVOICE_RPM_REF_79', 'excluded from the breadth pass'],
]);
const THRESHOLD = 0.5;
const MONEY_MODULES = new Set(['invoice', 'credit_debit']);

const ORGANIZATION = { name: '', address: '', phone: '', email: '', website: '' };
const EMPTY_RECORD = {
  invoice: { lines: [], subtotal: 0, tax_total: 0, total_amount: 0 },
  job: {},
  party: {},
  organization: {},
};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function csvCell(value) {
  const textValue = String(value ?? '');
  return /[",\r\n]/.test(textValue) ? `"${textValue.replaceAll('"', '""')}"` : textValue;
}

function tsString(value) {
  return `'${String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

/* ---------- inputs ---------- */

function censusCodes() {
  const lines = fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  const seen = new Set();
  const codes = [];
  let rows = 0;
  for (const line of lines) {
    const code = line.split(',')[0].trim();
    if (!code) continue;
    rows += 1;
    if (seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }
  return { codes, rows };
}

function registryFamilies() {
  const source = fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8');
  const entries = JSON.parse(source.slice(source.indexOf('= [') + 2, source.lastIndexOf('] as ') + 1));
  return new Map(entries.map((entry) => [entry.code, entry.family || 'other']));
}

function invoiceV2Codes() {
  const source = fs.readFileSync(path.join(root, 'src/features/reports/engine/invoiceV2Codes.ts'), 'utf8');
  return [...new Set([...source.matchAll(/'([A-Z][A-Z0-9_]+)'/g)].map((match) => match[1]))];
}

/* ---------- records ---------- */

/** A record with every path populated by obviously fake text. Used to count what can be filled. */
function richRecord() {
  const lines = [
    { description: 'Sample charge A', quantity: 1, unit_price: 100, tax_amount: 5, line_total: 105 },
    { description: 'Sample charge B', quantity: 2, unit_price: 40, tax_amount: 0, line_total: 80 },
  ];
  return {
    organization: {
      name: 'Sample Company',
      display_name: 'Sample Company',
      address: '1 Sample Road',
      city: 'Sampletown',
      country_code: 'AE',
      phone: '+000 000 0000',
      email: 'accounts@sample.example',
      website: 'www.sample.example',
    },
    invoice: {
      id: 'sample-invoice',
      invoice_number: 'INV-SAMPLE-1',
      invoice_date: '2026-01-15',
      due_date: '2026-02-14',
      currency_code: 'USD',
      party_name: 'Sample Customer',
      job_number: 'JOB-SAMPLE-1',
      remarks: 'Sample remarks',
      lpo_number: 'LPO-SAMPLE-1',
      outstanding_balance: 185,
      subtotal: 180,
      tax_total: 5,
      total_amount: 185,
      lines,
    },
    job: {
      job_number: 'JOB-SAMPLE-1',
      shipment_number: 'SHP-SAMPLE-1',
      client_reference_no: 'REF-SAMPLE-1',
      shipper_name: 'Sample Shipper',
      consignee_name: 'Sample Consignee',
      origin_port_code: 'AEJEA',
      dest_port_code: 'INNSA',
      vessel_name: 'SAMPLE VESSEL',
      voyage_number: 'V001',
      etd: '2026-01-20',
      eta: '2026-02-03',
      commodity_description: 'Sample goods',
      pieces: 10,
      gross_weight: 1200,
      volume_cbm: 12.5,
      incoterms: 'FOB',
      department_name: 'Sea Export',
      service_scope: 'Port to port',
      dest_door_address: 'Sample Destination',
      primary_container_number: 'SAMP1234567',
      containers: [{ container_number: 'SAMP1234567', container_type_code: '40HC', seal_number: 'SEAL001' }],
      cargo: [{ marks_numbers: 'SAMPLE MARKS' }],
      sea_fcl_details: {
        hbl_number: 'HBL-SAMPLE-1',
        mbl_number: 'MBL-SAMPLE-1',
        shipping_line_name: 'Sample Line',
        place_of_receipt: 'Sample Origin',
        place_of_delivery: 'Sample Delivery',
        freight_terms: 'PREPAID',
      },
    },
    party: { name: 'Sample Customer', address: '2 Customer Street', city: 'Customer City' },
    quotation: { quotation_number: 'QTN-SAMPLE-1', quotation_date: '2026-01-10', valid_until: '2026-02-10', currency_code: 'USD', total_amount: 185, terms: 'Sample terms' },
    voucher: { voucher_number: 'VCH-SAMPLE-1', voucher_date: '2026-01-16', amount: 185, currency_code: 'USD', narration: 'Sample narration', payee_name: 'Sample Customer', payment_mode: 'Bank', reference_no: 'PAY-SAMPLE-1' },
    bank: { bank_name: 'Sample Bank', branch_name: 'Sample Branch', account_name: 'Sample Company', account_number: '000000000000', iban: 'XX00SAMPLE0000000000', swift_code: 'SAMPXX00', ifsc_code: 'SAMP0000000' },
    session: { user_name: 'Sample User', printed_at: '2026-01-17 10:00', created_by: 'Sample User' },
  };
}

function liveBatch() {
  const file = path.join(root, 'reports/output/invoice-v2/batch-live.json');
  if (!fs.existsSync(file)) return null;
  const live = readJson(file, null);
  return live && Array.isArray(live.invoices) ? live : null;
}

/** One real record when batch-live.json is there, otherwise the fake rich record. */
function sampleRecord(live) {
  if (!live) return { record: richRecord(), source: 'synthetic (batch-live.json not found)' };
  const row = live.invoices.find((item) => item.job && !String(item.id).startsWith('extra-') && !String(item.id).startsWith('syn-'))
    || live.invoices.find((item) => !String(item.id).startsWith('extra-') && !String(item.id).startsWith('syn-'))
    || live.invoices[0];
  return {
    record: { organization: live.organization || {}, invoice: row.invoice || {}, job: row.job || {}, party: row.party || {} },
    source: `reports/output/invoice-v2/batch-live.json (${row.invoice?.invoice_number || row.id})`,
  };
}

function syntheticInvoices() {
  const make = (id, currency, rows, extra = {}) => {
    const lines = rows.map(([quantity, unit, tax]) => ({
      quantity, unit_price: unit, tax_amount: tax, line_total: Math.round((quantity * unit + tax) * 100) / 100,
    }));
    const subtotal = Math.round(lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0) * 100) / 100;
    const taxTotal = Math.round(lines.reduce((sum, line) => sum + line.tax_amount, 0) * 100) / 100;
    const discount = extra.discount || 0;
    const rounding = extra.rounding || 0;
    return {
      invoice_number: id, currency_code: currency, subtotal, tax_total: taxTotal, discount, rounding,
      total_amount: Math.round((subtotal + taxTotal - discount + rounding) * 100) / 100, lines,
    };
  };
  return [
    make('syn-a', 'USD', [[1, 100, 0], [2, 40, 0]]),
    make('syn-b', 'EUR', [[1, 80, 8], [3, 20, 6]]),
    make('syn-c', 'AED', [[1, 200, 10], [2, 25, 2.5]], { discount: 40 }),
    make('syn-d', 'GBP', [[1, 30, 0], [2, 7, 0]], { rounding: 0.04 }),
  ];
}

/* ---------- arithmetic (mirrors invoiceV2Suitability) ---------- */

const n = (value) => {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const close = (left, right) => Math.abs(Math.round(left * 100) - Math.round(right * 100)) <= 1;
const lineAmount = (line) => (line.line_total != null && Number.isFinite(Number(line.line_total)) ? Number(line.line_total) : n(line.quantity) * n(line.unit_price) + n(line.tax_amount));

function adds(profile, invoice) {
  if (!profile.total) return { ok: false, reason: 'no total printed' };
  if (invoice.total_amount == null) return { ok: false, reason: 'total missing on the invoice' };
  const lines = invoice.lines || [];
  const lineSum = lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const total = n(invoice.total_amount);
  const taxShown = profile.tax ? n(invoice.tax_total) : 0;
  const discountShown = profile.discount ? n(invoice.discount) : 0;
  const roundingShown = profile.rounding ? n(invoice.rounding) : 0;
  const subtotal = invoice.subtotal == null ? lineSum : n(invoice.subtotal);
  const base = profile.subtotal ? subtotal : lineSum;
  const printed = base + taxShown - discountShown + roundingShown;
  const linesPrinted = lineSum + taxShown - discountShown + roundingShown;
  if (close(printed, total) && close(linesPrinted, total)) return { ok: true, reason: '' };
  return { ok: false, reason: profile.subtotal ? 'subtotal does not reach the total' : 'lines do not reach the total' };
}

function arithmeticFor(code, module, totals, invoices) {
  if (!MONEY_MODULES.has(module)) return 'n/a';
  const profile = totals[code];
  if (!profile) return 'no totals profile';
  const results = invoices.map((invoice) => adds(profile, invoice));
  const bad = results.filter((result) => !result.ok);
  if (!bad.length) return `adds up ${results.length}/${results.length}`;
  return `mismatch ${bad.length}/${results.length}: ${[...new Set(bad.map((item) => item.reason))].join('; ')}`;
}

/* ---------- render helpers ---------- */

async function leakCheck(code, spec) {
  const filled = fillSpecSpans(spec, EMPTY_RECORD);
  const supplied = new Set(Object.values(filled.values).map((value) => String(value).replace(/\s+/g, ' ').trim()).filter(Boolean));
  const painted = [];
  const tmp = path.join(os.tmpdir(), `breadth-leak-${code}.pdf`);
  await renderSpec(code, { spec, values: filled.values, organization: ORGANIZATION, painted, quietArtifacts: true, outputPath: tmp });
  fs.rmSync(tmp, { force: true });
  return [...new Set(painted.filter((value) => leaksOnEmptyRecord(value, supplied)))];
}

async function renderSample(code, spec, record, file) {
  const filled = fillSpecSpans(spec, record);
  const org = record.organization || {};
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const result = await renderSpec(code, {
    spec,
    values: filled.values,
    organization: {
      name: org.display_name || org.name || '',
      address: [org.address, org.city, org.country_code].filter(Boolean).join(', '),
      phone: org.phone || '',
      email: org.email || '',
      website: org.website || '',
    },
    outputPath: file,
    quietArtifacts: true,
  });
  const pdf = await PDFDocument.load(fs.readFileSync(file));
  return { pages: pdf.getPageCount(), warnings: result.warnings?.length || 0 };
}

async function contactSheet(family, entries, file) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const [width, height] = [842, 595];
  const columns = 4;
  const rowsPerPage = 2;
  const perPage = columns * rowsPerPage;
  const margin = 20;
  const gap = 8;
  const labelHeight = 16;
  const cellWidth = (width - margin * 2 - gap * (columns - 1)) / columns;
  const cellHeight = (height - margin * 2 - gap * (rowsPerPage - 1)) / rowsPerPage;
  let page = null;
  let placed = 0;
  for (const entry of entries) {
    if (placed % perPage === 0) {
      page = doc.addPage([width, height]);
      page.drawText(`${family} (${entries.length} wired, approximate, not final)`, { x: margin, y: height - 14, size: 8, font, color: rgb(0.2, 0.2, 0.2) });
    }
    const slot = placed % perPage;
    const column = slot % columns;
    const row = Math.floor(slot / columns);
    const x = margin + column * (cellWidth + gap);
    const top = height - margin - 8 - row * (cellHeight + gap);
    try {
      const [embedded] = await doc.embedPdf(fs.readFileSync(entry.file), [0]);
      const scale = Math.min(cellWidth / embedded.width, (cellHeight - labelHeight - 8) / embedded.height);
      const drawWidth = embedded.width * scale;
      const drawHeight = embedded.height * scale;
      page.drawRectangle({ x, y: top - labelHeight - drawHeight, width: drawWidth, height: drawHeight, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.4 });
      page.drawPage(embedded, { x, y: top - labelHeight - drawHeight, width: drawWidth, height: drawHeight });
    } catch {
      /* the label below still records the code */
    }
    const label = entry.code.length > 52 ? `${entry.code.slice(0, 51)}…` : entry.code;
    page.drawText(label.replace(/[^\x20-\x7e]/g, '?'), { x, y: top - 9, size: 5.5, font, color: rgb(0, 0, 0) });
    placed += 1;
  }
  fs.writeFileSync(file, await doc.save());
}

/* ---------- main ---------- */

const { codes: census, rows: censusRows } = censusCodes();
const families = registryFamilies();
const forced = new Set(invoiceV2Codes());
const totals = readJson(path.join(root, 'reports/invoice-v2-totals.json'), {});
const live = liveBatch();
const sample = sampleRecord(live);
const arithmeticInvoices = live
  ? live.invoices.map((row) => row.invoice).filter(Boolean)
  : syntheticInvoices();
const analysisRecord = richRecord();

const candidates = [...census.filter((code) => !EXCLUDED.has(code))];
for (const code of forced) if (!candidates.includes(code)) candidates.push(code);

const results = [];
for (const code of EXCLUDED.keys()) {
  results.push({ code, registryFamily: families.get(code) || 'unregistered', module: moduleForCode(code), dynamic: 0, bound: 0, filled: 0, empty: 0, noSource: 0, boundRatio: 0, wired: false, forced: false, reason: EXCLUDED.get(code), leaks: 0, pages: '', warnings: '', arithmetic: 'n/a', excluded: true });
}

for (const code of candidates) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  const base = {
    code,
    registryFamily: families.get(code) || 'unregistered',
    module: moduleForCode(code),
    dynamic: 0, bound: 0, filled: 0, empty: 0, noSource: 0, boundRatio: 0,
    wired: false,
    forced: forced.has(code),
    reason: '',
    leaks: 0,
    pages: '',
    warnings: '',
    arithmetic: 'n/a',
  };
  if (!fs.existsSync(specPath)) {
    results.push({ ...base, reason: 'no extracted layout yet' });
    continue;
  }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const analysis = analyzeSpecBindings(spec, analysisRecord);
  Object.assign(base, {
    dynamic: analysis.dynamic, bound: analysis.bound, filled: analysis.filled,
    empty: analysis.empty, noSource: analysis.noSource, boundRatio: analysis.boundRatio,
  });
  const meets = analysis.dynamic > 0 && analysis.boundRatio >= THRESHOLD;
  if (!meets && !base.forced) {
    base.reason = analysis.dynamic === 0
      ? 'no data fields found in this layout'
      : `only ${Math.round(analysis.boundRatio * 100)}% of its data fields have a source`;
    results.push(base);
    continue;
  }
  base.wired = true;
  base.spec = spec;
  results.push(base);
}

let leakTotal = 0;
const forcedFailures = [];
const index = [];
const sheetEntries = new Map();
if (!skipSamples) fs.rmSync(samplesDir, { recursive: true, force: true });

for (const row of results.filter((item) => item.wired)) {
  const { spec } = row;
  row.arithmetic = arithmeticFor(row.code, row.module, totals, arithmeticInvoices);
  let failure = '';
  try {
    const leaks = await leakCheck(row.code, spec);
    row.leaks = leaks.length;
    leakTotal += leaks.length;
    if (leaks.length) {
      failure = 'prints sample text on an empty record';
      row.leakExamples = leaks.slice(0, 5);
    }
  } catch (error) {
    failure = 'could not be drawn';
    row.error = error instanceof Error ? error.message : String(error);
  }
  if (!failure && !skipSamples) {
    const file = path.join(samplesDir, row.registryFamily, `${row.code}.pdf`);
    try {
      const drawn = await renderSample(row.code, spec, sample.record, file);
      row.pages = drawn.pages;
      row.warnings = drawn.warnings;
      index.push({
        code: row.code, registryFamily: row.registryFamily, module: row.module,
        file: path.relative(root, file).replaceAll('\\', '/'), pages: drawn.pages, warnings: drawn.warnings,
      });
      if (!sheetEntries.has(row.registryFamily)) sheetEntries.set(row.registryFamily, []);
      sheetEntries.get(row.registryFamily).push({ code: row.code, file });
    } catch (error) {
      failure = 'could not be drawn';
      row.error = error instanceof Error ? error.message : String(error);
    }
  }
  if (failure) {
    if (row.forced) {
      forcedFailures.push({ code: row.code, failure, detail: row.error || row.leakExamples || '' });
    } else {
      row.wired = false;
      row.reason = failure;
      fs.rmSync(path.join(samplesDir, row.registryFamily, `${row.code}.pdf`), { force: true });
    }
  }
}

for (const row of results) delete row.spec;

if (!skipSamples) {
  for (const [family, entries] of sheetEntries) {
    const present = entries.filter((entry) => fs.existsSync(entry.file));
    if (present.length) await contactSheet(family, present, path.join(samplesDir, family, '_contact-sheet.pdf'));
  }
}

const wired = results.filter((row) => row.wired).sort((a, b) => a.code.localeCompare(b.code));
const browseOnly = results.filter((row) => !row.wired).sort((a, b) => a.code.localeCompare(b.code));
const wiredCodes = new Set(wired.map((row) => row.code));
const indexRows = index.filter((row) => wiredCodes.has(row.code)).sort((a, b) => a.code.localeCompare(b.code));
const sheetFiles = [...sheetEntries.keys()].sort().map((family) => `reports/breadth/samples/${family}/_contact-sheet.pdf`);

/* ---------- outputs ---------- */

fs.mkdirSync(outDir, { recursive: true });
const header = ['code', 'registryFamily', 'module', 'dynamic', 'bound', 'filled', 'empty', 'noSource', 'boundRatio', 'wired', 'forced', 'reason', 'leaks', 'pages', 'warnings', 'arithmetic'];
const sorted = [...results].sort((a, b) => a.code.localeCompare(b.code));
fs.writeFileSync(
  path.join(outDir, 'coverage.csv'),
  `${[header.join(','), ...sorted.map((row) => header.map((key) => csvCell(row[key])).join(','))].join('\n')}\n`,
);
fs.writeFileSync(
  path.join(outDir, 'wired.json'),
  `${JSON.stringify(wired.map((row) => ({
    code: row.code, registryFamily: row.registryFamily, module: row.module,
    boundRatio: row.boundRatio, forced: row.forced, arithmetic: row.arithmetic,
  })), null, 2)}\n`,
);
fs.writeFileSync(
  path.join(outDir, 'browse-only.json'),
  `${JSON.stringify(browseOnly.map((row) => ({
    code: row.code, registryFamily: row.registryFamily, module: row.module,
    boundRatio: row.boundRatio, reason: row.reason,
  })), null, 2)}\n`,
);
fs.writeFileSync(path.join(outDir, 'samples-index.json'), `${JSON.stringify({ record: sample.source, samples: indexRows, contactSheets: sheetFiles }, null, 2)}\n`);

const byReason = new Map();
for (const row of browseOnly) {
  const key = row.reason.startsWith('only ') ? 'data fields have too little source (below 50%)' : row.reason;
  byReason.set(key, (byReason.get(key) || 0) + 1);
}
const tally = (rows, key) => {
  const map = new Map();
  for (const row of rows) map.set(row[key], (map.get(row[key]) || 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};
const arithmeticBad = wired.filter((row) => row.arithmetic.startsWith('mismatch'));
const format10 = 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE';
const summary = [
  '# Breadth wiring summary',
  '',
  'Nothing here is accepted. No threshold or sign-off changed. Classic generators were not touched.',
  '',
  `- Census rows: ${censusRows}, unique codes: ${census.length}, excluded: ${[...EXCLUDED.keys()].join(', ')}`,
  `- Wire rule: at least ${THRESHOLD * 100}% of a spec's data fields resolve to a binding path, plus every code in invoiceV2Codes.ts`,
  `- **Wired: ${wired.length}** (${wired.filter((row) => row.forced).length} invoice v2 codes forced in)`,
  `- **Browse-only: ${browseOnly.length}**`,
  `- Format 10 (${format10}) wired: ${wiredCodes.has(format10) ? 'yes' : 'NO'}`,
  `- Empty-record leaks across wired codes: ${wired.reduce((sum, row) => sum + row.leaks, 0)} (${browseOnly.filter((row) => row.reason === 'prints sample text on an empty record').length} code(s) held back as browse-only for leaking)`,
  `- Sample record: ${sample.source}`,
  `- Arithmetic profile source: ${live ? 'batch-live.json invoices' : 'four synthetic invoices (batch-live.json not found)'}`,
  '',
  '## Browse-only reasons',
  '',
  ...[...byReason.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => `- ${reason}: ${count}`),
  '',
  '## Wired by module',
  '',
  ...tally(wired, 'module').map(([key, count]) => `- ${key}: ${count}`),
  '',
  '## Wired by registry family',
  '',
  ...tally(wired, 'registryFamily').map(([key, count]) => `- ${key}: ${count}`),
  '',
  '## Arithmetic (money layouts with a totals profile)',
  '',
  `- Wired money layouts: ${wired.filter((row) => MONEY_MODULES.has(row.module)).length}`,
  `- With a totals profile: ${wired.filter((row) => row.arithmetic !== 'n/a' && row.arithmetic !== 'no totals profile').length}`,
  `- Without a totals profile (not measured): ${wired.filter((row) => row.arithmetic === 'no totals profile').length}`,
  `- Mismatch on at least one sample invoice: ${arithmeticBad.length}`,
  ...arithmeticBad.map((row) => `  - ${row.code}: ${row.arithmetic}`),
  '',
  '## Failures',
  '',
  ...(forcedFailures.length ? forcedFailures.map((item) => `- FORCED ${item.code}: ${item.failure} ${JSON.stringify(item.detail)}`) : ['- No forced code failed.']),
  ...results.filter((row) => !row.wired && /sample text|could not be drawn/.test(row.reason)).map((row) => `- demoted ${row.code}: ${row.reason}`),
  '',
  '## Notes',
  '',
  '- Static labels outside reports/label-allowlist.json are not painted by the renderer when values are supplied. That list was built from invoice specs, so non-invoice layouts show fewer printed labels than their references.',
  '- Samples are approximate, not final. Document numbers for delivery order, arrival notice and manifest map to the job number because the record has no separate number.',
  '',
].join('\n');
fs.writeFileSync(path.join(outDir, 'summary.md'), summary);

const reasonLines = browseOnly.map((row) => `  ${tsString(row.code)}: ${tsString(row.reason)},`);
fs.writeFileSync(
  codesFile,
  [
    '/**',
    ' * Generated by tools/reports/breadth-run.mjs. Do not edit by hand.',
    ' * A code in this list can be drawn from a record by the spec renderer.',
    ' * It does not mean the code is accepted.',
    ' */',
    'export const BREADTH_WIRED_CODES: readonly string[] = [',
    ...wired.map((row) => `  ${tsString(row.code)},`),
    '];',
    '',
    'const WIRED = new Set<string>(BREADTH_WIRED_CODES);',
    '',
    'const BREADTH_BROWSE_REASONS: Readonly<Record<string, string>> = {',
    ...reasonLines,
    '};',
    '',
    'export function isBreadthWired(code: string): boolean {',
    '  return WIRED.has(code);',
    '}',
    '',
    '/** Why a code is browse-only. Empty for a wired code. */',
    'export function breadthBrowseReason(code: string): string {',
    '  if (WIRED.has(code)) return \'\';',
    '  return BREADTH_BROWSE_REASONS[code] || \'no extracted layout for this format\';',
    '}',
    '',
  ].join('\n'),
);

console.log(JSON.stringify({
  censusUnique: census.length,
  wired: wired.length,
  browseOnly: browseOnly.length,
  format10Wired: wiredCodes.has(format10),
  leaks: wired.reduce((sum, row) => sum + row.leaks, 0),
  leaksBeforeDemotion: leakTotal,
  forcedFailures,
  arithmeticMismatch: arithmeticBad.length,
  sample: sample.source,
}, null, 2));
if (forcedFailures.length) process.exitCode = 1;
