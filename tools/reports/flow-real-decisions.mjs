/**
 * Decision round: re-render quotations + invoices with updated bindings,
 * tax assertions (tax_amount only), CN/DN wording, fill-share before/after,
 * blanks.md, wording list. Reads existing live.json + batch-live.json.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';
import { assertFlowTaxIntegrity, money2 } from './invoice-flow-totals.mjs';
import { buildQuotationFlowDocDefinition, buildCreditNoteFlowDocDefinition, buildDebitNoteFlowDocDefinition } from './flow-doc.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const livePath = path.join(root, 'reports/output/flow-real/live.json');
const invoiceLivePath = path.join(root, 'reports/output/invoice-v2/batch-live.json');
const outRoot = path.join(root, 'reports/flow-spike/real');
const classicDir = path.join(root, 'reports/output/flow-real/classic');

function filled(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return true;
}

function pdfText(file) {
  if (!fs.existsSync(file)) return '';
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function writePng(file, png) {
  fs.writeFileSync(file, PNG.sync.write(png));
}

function raster(pdfPath, prefix) {
  execFileSync('pdftoppm', ['-png', '-r', '72', '-f', '1', '-l', '1', pdfPath, prefix], { stdio: 'pipe' });
  return `${prefix}-1.png`;
}

function sideBySide(classicPngPath, flowPngPath, outPath) {
  const left = readPng(classicPngPath);
  const right = readPng(flowPngPath);
  const gap = 16;
  const header = 28;
  const width = left.width + right.width + gap + 24;
  const height = Math.max(left.height, right.height) + header + 16;
  const sheet = new PNG({ width, height });
  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = 255;
    sheet.data[i + 1] = 255;
    sheet.data[i + 2] = 255;
    sheet.data[i + 3] = 255;
  }
  const blit = (src, ox, oy) => {
    for (let y = 0; y < src.height; y += 1) {
      for (let x = 0; x < src.width; x += 1) {
        const si = (src.width * y + x) << 2;
        const di = (sheet.width * (oy + y) + (ox + x)) << 2;
        sheet.data[di] = src.data[si];
        sheet.data[di + 1] = src.data[si + 1];
        sheet.data[di + 2] = src.data[si + 2];
        sheet.data[di + 3] = src.data[si + 3];
      }
    }
  };
  blit(left, 8, header);
  blit(right, 8 + left.width + gap, header);
  writePng(outPath, sheet);
}

function moneyTokens(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return [];
  const body = Math.abs(value).toFixed(2);
  const [whole, frac] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tokens = [`${grouped}.${frac}`, `${whole}.${frac}`];
  if (frac === '00') tokens.push(grouped, whole);
  return tokens;
}

function containsAmount(text, amount) {
  return moneyTokens(amount).some((token) => {
    const escaped = token.replace(/\./g, '\\.');
    return new RegExp(`(?<![\\d,./])${escaped}(?![\\d.])`).test(text);
  });
}

/** Fields measured for quotation fill share (before = prior binding rules). */
const QUOTE_FIELDS = [
  { key: 'valid_until', before: (q) => filled(q.valid_until), after: (q) => filled(q.valid_until) },
  { key: 'incoterm', before: (q) => filled(q.incoterms), after: (q) => filled(q.incoterms) || filled(q.incoterm) },
  { key: 'carrier_airline', before: (q) => filled(q.carrier_name), after: (q) => filled(q.carrier_name) || filled(q.carrier_preference) || filled(q.airline_name) || filled(q.airline) },
  { key: 'flight', before: () => false, after: (q) => filled(q.flight_number) || filled(q.flight_no) || filled(q.voyage_number) || filled(q.vessel_name) },
  { key: 'transit', before: () => false, after: (q) => filled(q.transit_time_days) },
  { key: 'gross_weight', before: () => false, after: (q) => filled(q.gross_weight) },
  { key: 'volume_cbm', before: () => false, after: (q) => filled(q.volume_cbm) },
  { key: 'containers', before: () => false, after: (q) => filled(q.container_count) || filled(q.container_type_id) },
  { key: 'terms', before: (q) => filled(q.terms), after: (q) => filled(q.terms) || filled(q.terms_and_conditions) },
  { key: 'remarks', before: (q) => filled(q.remarks), after: (q) => filled(q.remarks) || filled(q.special_requirements) },
];

function fillShare(rows, phase) {
  const byBucket = { air: { filled: 0, total: 0 }, fcl: { filled: 0, total: 0 }, lcl: { filled: 0, total: 0 }, other: { filled: 0, total: 0 } };
  for (const row of rows) {
    const bucket = row.bucket || 'other';
    const q = row.quotation || {};
    for (const field of QUOTE_FIELDS) {
      byBucket[bucket].total += 1;
      if (field[phase](q)) byBucket[bucket].filled += 1;
    }
  }
  const summary = {};
  for (const [bucket, counts] of Object.entries(byBucket)) {
    if (!counts.total) continue;
    summary[bucket] = {
      filled: counts.filled,
      total: counts.total,
      share: Number((counts.filled / counts.total).toFixed(4)),
      pct: `${((counts.filled / counts.total) * 100).toFixed(1)}%`,
    };
  }
  return summary;
}

function remainingEmpty(rows) {
  const out = [];
  for (const row of rows) {
    const q = row.quotation || {};
    const empty = [];
    for (const field of QUOTE_FIELDS) {
      if (!field.after(q)) {
        empty.push({
          field: field.key,
          reason: 'empty in the record',
        });
      }
    }
    out.push({
      number: q.quotation_number,
      bucket: row.bucket,
      empty,
    });
  }
  return out;
}

function renderClassicBatch() {
  fs.mkdirSync(classicDir, { recursive: true });
  execFileSync(
    process.execPath,
    [
      path.join(root, 'node_modules/vitest/vitest.mjs'),
      'run',
      '--project',
      'unit',
      'src/features/reports/flow/flowRealClassicRender.test.ts',
    ],
    {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        FLOW_REAL_CLASSIC_DIR: classicDir,
        FLOW_REAL_LIVE_JSON: livePath,
        TZ: 'UTC',
      },
    },
  );
}

function orgPayload(organization) {
  return { organization, bank: organization?.bank || organization?.bank_details || {} };
}

async function renderType(type, rows, live, code, pickDoc) {
  const dir = path.join(outRoot, type);
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  for (const row of rows) {
    const doc = pickDoc(row);
    const id = row.id;
    const record = {
      ...orgPayload(live.organization),
      party: row.party,
      job: row.job,
      invoice: row.invoice,
      quotation: row.quotation,
      creditNote: row.creditNote,
      debitNote: row.debitNote,
      code,
    };
    const flowPdf = path.join(dir, `${id}-flow.pdf`);
    await renderInvoiceFlowPdf(record, flowPdf);
    const classicPdf = path.join(classicDir, type, `${id}.pdf`);
    if (!fs.existsSync(classicPdf) && type === 'invoice') {
      // invoice classic may live under batch path — skip compare if missing
    }
    const classicText = fs.existsSync(classicPdf) ? pdfText(classicPdf) : '';
    const flowText = pdfText(flowPdf);
    if (fs.existsSync(classicPdf)) {
      const classicPng = raster(classicPdf, path.join(dir, `${id}-classic`));
      const flowPng = raster(flowPdf, path.join(dir, `${id}-flow`));
      sideBySide(classicPng, flowPng, path.join(dir, `${id}-compare.png`));
    } else {
      raster(flowPdf, path.join(dir, `${id}-flow`));
    }
    const tax = assertFlowTaxIntegrity({
      subtotal: doc.subtotal,
      tax_amount: doc.tax_amount,
      discount: doc.discount ?? doc.discount_amount,
      rounding: doc.rounding,
      total_amount: doc.total_amount,
      tax_total: doc.tax_total,
      lines: doc.lines,
    });
    const amounts = [
      doc.subtotal,
      doc.total_amount,
      ...(doc.lines || []).map((line) => line.line_total),
    ].filter((value) => value != null && value !== '');
    const moneyVsFlow = amounts.map((amount) => ({
      amount,
      inFlow: containsAmount(flowText, amount),
    }));
    results.push({
      id,
      number: doc.quotation_number || doc.credit_note_number || doc.debit_note_number || doc.invoice_number,
      bucket: row.bucket || null,
      synthetic: Boolean(row.synthetic),
      tax,
      moneyVsFlow,
      leak: /fresa|powered by|<h3>/i.test(flowText),
      relatedInvoice: /Related Invoice/i.test(flowText),
      inventedTerms: /This credit note adjusts|This debit note adjusts/i.test(flowText),
    });
  }
  return results;
}

async function renderInvoices(liveInvoices, organization) {
  const dir = path.join(outRoot, 'invoice');
  fs.mkdirSync(dir, { recursive: true });
  const classicInvoiceDir = path.join(root, 'reports/output/invoice-v2/classic');
  const results = [];
  for (const row of (liveInvoices || []).slice(0, 10)) {
    const invoice = row.invoice;
    const id = row.id || invoice.id;
    const record = {
      ...orgPayload(organization),
      invoice,
      party: row.party,
      job: row.job,
      code: 'INVOICE_FLOW_TAX_INVOICE_1',
    };
    const flowPdf = path.join(dir, `${id}-flow.pdf`);
    await renderInvoiceFlowPdf(record, flowPdf);
    const classicPdf = path.join(classicInvoiceDir, `${id}.pdf`);
    const flowText = pdfText(flowPdf);
    if (fs.existsSync(classicPdf)) {
      const classicPng = raster(classicPdf, path.join(dir, `${id}-classic`));
      const flowPng = raster(flowPdf, path.join(dir, `${id}-flow`));
      sideBySide(classicPng, flowPng, path.join(dir, `${id}-compare.png`));
    } else {
      raster(flowPdf, path.join(dir, `${id}-flow`));
    }
    const tax = assertFlowTaxIntegrity({
      subtotal: invoice.subtotal,
      tax_amount: invoice.tax_amount,
      discount: invoice.discount ?? invoice.discount_amount,
      rounding: invoice.rounding,
      total_amount: invoice.total_amount,
      tax_total: invoice.tax_total,
      lines: invoice.lines,
    });
    results.push({
      id,
      number: invoice.invoice_number,
      tax,
      leak: /fresa|powered by|<h3>/i.test(flowText),
    });
  }
  return results;
}

function blanksForQuotation(row, bound) {
  const q = row.quotation || {};
  const party = row.party || {};
  const boxes = [
    { box: 'Bill To name', reason: filled(q.customer_name) || filled(q.party_name) || filled(party.name) ? null : 'empty in the record' },
    { box: 'Valid Until', reason: filled(q.valid_until) ? null : 'empty in the record' },
    { box: 'Incoterms', reason: filled(q.incoterm) || filled(q.incoterms) ? null : 'empty in the record' },
    { box: 'Carrier / Airline', reason: filled(q.carrier_name) || filled(q.carrier_preference) || filled(q.airline_name) ? null : 'empty in the record' },
    { box: 'Flight / Voyage', reason: filled(q.flight_number) || filled(q.voyage_number) || filled(q.vessel_name) ? null : 'empty in the record' },
    { box: 'Transit', reason: filled(q.transit_time_days) ? null : 'empty in the record' },
    { box: 'Gross weight', reason: filled(q.gross_weight) ? null : 'empty in the record' },
    { box: 'Volume', reason: filled(q.volume_cbm) ? null : 'empty in the record' },
    { box: 'Containers', reason: filled(q.container_count) || filled(q.container_type_id) ? null : 'empty in the record' },
    { box: 'Terms', reason: filled(q.terms) || filled(q.terms_and_conditions) ? null : 'empty in the record' },
    { box: 'Remarks', reason: filled(q.remarks) || filled(q.special_requirements) ? null : 'empty in the record' },
    { box: 'Lines', reason: (q.lines || []).length ? null : 'empty in the record' },
  ];
  void bound;
  return boxes.filter((item) => item.reason);
}

const live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
const invoiceLive = fs.existsSync(invoiceLivePath)
  ? JSON.parse(fs.readFileSync(invoiceLivePath, 'utf8'))
  : { invoices: [], organization: live.organization };

const fillBefore = fillShare(live.quotations || [], 'before');
const fillAfter = fillShare(live.quotations || [], 'after');

renderClassicBatch();

const quotationResults = await renderType('quotation', live.quotations || [], live, 'QUOTATION_FLOW_1', (row) => row.quotation);
const creditResults = await renderType('credit-note', live.creditNotes || [], live, 'CREDIT_NOTE_FLOW_1', (row) => row.creditNote);
const debitResults = await renderType('debit-note', live.debitNotes || [], live, 'DEBIT_NOTE_FLOW_1', (row) => row.debitNote);
const invoiceResults = await renderInvoices(invoiceLive.invoices || [], invoiceLive.organization || live.organization);

// Bound meta for blanks
const quotationBlanks = (live.quotations || []).map((row) => {
  const meta = buildQuotationFlowDocDefinition({
    ...orgPayload(live.organization),
    quotation: row.quotation,
    party: row.party,
    job: row.job,
  });
  return {
    number: row.quotation?.quotation_number,
    bucket: row.bucket,
    blanks: blanksForQuotation(row, meta.bound),
    bound: meta.bound,
  };
});

const taxViolations = [];
for (const group of [
  ['quotation', quotationResults],
  ['credit-note', creditResults],
  ['debit-note', debitResults],
  ['invoice', invoiceResults],
]) {
  const [type, rows] = group;
  for (const row of rows) {
    for (const violation of row.tax.violations || []) {
      taxViolations.push({ type, id: row.id, number: row.number, ...violation });
    }
  }
}

const wording = {
  creditNote: buildCreditNoteFlowDocDefinition({ creditNote: live.creditNotes?.[0]?.creditNote || {}, organization: live.organization }).wording,
  debitNote: buildDebitNoteFlowDocDefinition({ debitNote: live.debitNotes?.[0]?.debitNote || {}, organization: live.organization }).wording,
  fixedWordingList: [
    { wording: 'CREDIT NOTE / DEBIT NOTE (title)', source: 'classic commercialNoteToPdfModel labelsFor documentTitle', kept: true },
    { wording: 'Credit Note # / Debit Note #', source: 'classic labelsFor numberLabel', kept: true },
    { wording: 'Credit Note Date / Debit Note Date', source: 'classic labelsFor dateLabel', kept: true },
    { wording: 'Related Invoice', source: 'classic jobRefLabel when credited_invoice_* set', kept: true },
    { wording: 'Due Date', source: 'classic labelsFor dueDateLabel', kept: true },
    { wording: 'Bill To', source: 'shared flow face (classic CUSTOMER role)', kept: true },
    { wording: 'Charges / Qty / Rate / Tax / Total', source: 'shared flow charge table', kept: true },
    { wording: 'Sub Total / Discount / Tax / Rounding / Total', source: 'shared flow totals', kept: true },
    { wording: 'Bank Details labels', source: 'printed only when bank.* fields set', kept: true },
    { wording: 'Terms body', source: 'record.remarks (classic TERMS & CONDITIONS)', kept: true },
    { wording: 'Original Invoice', source: 'removed — replaced with classic Related Invoice', kept: false },
    { wording: 'This credit/debit note adjusts…', source: 'removed — no classic or record source', kept: false },
    { wording: 'Status', source: 'removed — not on classic commercial note face', kept: false },
  ],
  cnRelatedInvoicePrinted: creditResults.every((row) => row.relatedInvoice),
  inventedTermsRemoved: creditResults.every((row) => !row.inventedTerms) && debitResults.every((row) => !row.inventedTerms),
};

const blanksMd = [
  '# Real-record blanks — after decision bindings',
  '',
  `Fetched at: ${live.fetchedAt}`,
  '',
  'CREDIT_NOTE_FLOW_1 / DEBIT_NOTE_FLOW_1 are staging-only (soft gate + VITE_REPORTS_FLOW_STAGING); synthetic notes never count toward release.',
  '',
  '## Quotation fill share by type',
  '',
  '### Before (prior binding)',
  '',
  '```json',
  JSON.stringify(fillBefore, null, 2),
  '```',
  '',
  '### After (bound transit, weights, volumes, containers, incoterm|incoterms, terms_and_conditions, carrier/airline, flight/voyage, remarks)',
  '',
  '```json',
  JSON.stringify(fillAfter, null, 2),
  '```',
  '',
  '## Quotation empty boxes (after)',
  '',
  ...quotationBlanks.flatMap((row) => [
    `### ${row.number} (${row.bucket})`,
    ...(row.blanks.length ? row.blanks.map((blank) => `- **${blank.box}**: ${blank.reason}`) : ['- (no empty boxes recorded)']),
    '',
  ]),
  '## Credit note',
  '',
  `Real count: ${live.notes?.creditNotes?.realCount ?? 0} (synthetic used for testing only).`,
  '',
  '## Debit note',
  '',
  `Real count: ${live.notes?.debitNotes?.realCount ?? 0} (synthetic used for testing only).`,
  '',
  '## Tax assertion violations',
  '',
  taxViolations.length
    ? taxViolations.map((row) => `- ${row.type} ${row.number}: ${row.code} — ${row.detail}`).join('\n')
    : '- (none)',
  '',
].join('\n');

fs.writeFileSync(path.join(outRoot, 'blanks.md'), `${blanksMd}\n`);
fs.writeFileSync(path.join(outRoot, 'wording.md'), `${[
  '# Credit / debit note fixed wording',
  '',
  ...wording.fixedWordingList.map((row) => `- **${row.wording}** — ${row.source}${row.kept ? '' : ' *(removed)*'}`),
  '',
  '```json',
  JSON.stringify({ creditNote: wording.creditNote, debitNote: wording.debitNote }, null, 2),
  '```',
  '',
].join('\n')}\n`);

const summary = {
  fillBefore,
  fillAfter,
  remainingEmpty: remainingEmpty(live.quotations || []),
  taxViolations,
  taxOk: {
    quotation: quotationResults.filter((row) => row.tax.ok).length,
    creditNote: creditResults.filter((row) => row.tax.ok).length,
    debitNote: debitResults.filter((row) => row.tax.ok).length,
    invoice: invoiceResults.filter((row) => row.tax.ok).length,
  },
  wording,
  affectedInvoicesVsClassicTax: [
    'INV/26/00089',
    'INV/26/00093',
    'INV/26/00094',
    'INV/26/00095',
    'INV/26/00097',
    'INV/26/00098',
  ],
  staging: {
    creditDebitCatalogName: 'staging only: no real records tested',
    requires: ['VITE_REPORTS_GATE soft (default)', 'VITE_REPORTS_FLOW_STAGING=1'],
  },
};

fs.writeFileSync(path.join(outRoot, 'decisions-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outRoot, 'fill-share.md'),
  [
    '# Quotation fill share before / after field binding',
    '',
    '## Before',
    '',
    '```json',
    JSON.stringify(fillBefore, null, 2),
    '```',
    '',
    '## After',
    '',
    '```json',
    JSON.stringify(fillAfter, null, 2),
    '```',
    '',
    '## Remaining empty (after) — why',
    '',
    ...summary.remainingEmpty.map((row) =>
      `- **${row.number}** (${row.bucket}): ${row.empty.length ? row.empty.map((item) => `${item.field} (${item.reason})`).join('; ') : 'all measured fields held'}`,
    ),
    '',
  ].join('\n'),
);

fs.writeFileSync(path.join(outRoot, 'decisions-needed.md'), `${[
  '# Decisions applied',
  '',
  '1. CN/DN flow codes staging-only behind soft gate + VITE_REPORTS_FLOW_STAGING; label `staging only: no real records tested`. Synthetic never counts toward release.',
  '2. Tax uses tax_amount only; assertions on every record. Classic difference listed in RELEASE_NOTES_PHASE1.md for six invoices.',
  '3. Quotation binds transit, weights, volumes, containers, incoterm|incoterms, terms_and_conditions, validity, carrier/airline, flight/voyage, remarks — no invented values.',
  '4. CN/DN use Related Invoice; invented terms sentences removed. See wording.md.',
  '',
].join('\n')}\n`);

console.log(JSON.stringify({
  fillBefore,
  fillAfter,
  taxViolations: taxViolations.length,
  taxOk: summary.taxOk,
  inventedTermsRemoved: wording.inventedTermsRemoved,
  relatedInvoice: wording.cnRelatedInvoicePrinted,
}, null, 2));
