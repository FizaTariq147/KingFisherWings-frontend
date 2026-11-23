/**
 * Render quotation / credit-note / debit-note flow templates, reconcile money
 * against the record, and write contact sheets under reports/flow-spike/<type>/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';
import {
  buildCreditNoteFlowDocDefinition,
  buildDebitNoteFlowDocDefinition,
  buildQuotationFlowDocDefinition,
} from './flow-doc.mjs';
import { flowTotalsRows, money2 } from './invoice-flow-totals.mjs';
import { writeFlowTemplateHash } from './flow-template-hash.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const spikeRoot = path.join(root, 'reports/flow-spike');

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

function pdfText(file) {
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

function contactSheet(thumbs, outPath) {
  const images = thumbs.map((item) => ({ ...item, png: readPng(item.file) }));
  const cellW = Math.max(...images.map((item) => item.png.width));
  const cellH = Math.max(...images.map((item) => item.png.height));
  const cols = 2;
  const rows = Math.ceil(images.length / cols);
  const sheet = new PNG({ width: cols * cellW + 24, height: rows * (cellH + 28) + 16 });
  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = 255;
    sheet.data[i + 1] = 255;
    sheet.data[i + 2] = 255;
    sheet.data[i + 3] = 255;
  }
  images.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const ox = 8 + col * cellW;
    const oy = 8 + row * (cellH + 28) + 20;
    for (let y = 0; y < item.png.height; y += 1) {
      for (let x = 0; x < item.png.width; x += 1) {
        const si = (item.png.width * y + x) << 2;
        const di = (sheet.width * (oy + y) + (ox + x)) << 2;
        sheet.data[di] = item.png.data[si];
        sheet.data[di + 1] = item.png.data[si + 1];
        sheet.data[di + 2] = item.png.data[si + 2];
        sheet.data[di + 3] = item.png.data[si + 3];
      }
    }
  });
  writePng(outPath, sheet);
}

function line(qty, rate, tax, description = 'Charge') {
  const pretax = Math.round(qty * rate * 100) / 100;
  const taxAmount = Math.round(tax * 100) / 100;
  return {
    description,
    quantity: qty,
    unit_price: rate,
    tax_amount: taxAmount,
    line_total: Math.round((pretax + taxAmount) * 100) / 100,
  };
}

function fromLines(lines, extra = {}) {
  const subtotal = Math.round(lines.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) * 100) / 100;
  const tax = Math.round(lines.reduce((sum, item) => sum + item.tax_amount, 0) * 100) / 100;
  const discount = extra.discount || 0;
  const rounding = extra.rounding || 0;
  const total = Math.round((subtotal + tax - discount + rounding) * 100) / 100;
  return { subtotal, tax_amount: tax, discount, rounding, total_amount: total, lines };
}

const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const org = live.organization || { display_name: 'Demo Logistics', address: 'Sample Street', city: 'Dubai', country_code: 'AE' };

/** Synthetic anonymized records — marked synthetic. No live quotation/CN/DN batch available. */
function quotationRecords() {
  return [
    {
      id: 'q-syn-01',
      synthetic: true,
      quotation: {
        quotation_number: 'QT/26/0001',
        quotation_date: '2026-01-10',
        valid_until: '2026-02-10',
        currency_code: 'USD',
        party_name: 'Sample Forwarder LLC',
        terms: 'Rates subject to carrier space. Validity as stated.',
        incoterms: 'FOB',
        origin_port_code: 'CNSHA',
        dest_port_code: 'AEJEA',
        ...fromLines([line(1, 100, 0, 'Ocean Freight'), line(1, 40, 0, 'THC'), line(1, 15, 0, 'Documentation')]),
      },
      party: { name: 'Sample Forwarder LLC', address: 'Harbour Road', city: 'Dubai' },
      organization: org,
    },
    {
      id: 'q-syn-02',
      synthetic: true,
      quotation: {
        quotation_number: 'QT/26/0002',
        quotation_date: '2026-01-12',
        valid_until: '2026-02-12',
        currency_code: 'AED',
        party_name: 'Desert Trade Co',
        terms: 'Air freight quotation. Fuel surcharge may apply.',
        ...fromLines([line(1, 200, 10, 'Air Freight'), line(1, 50, 2.5, 'Handling'), line(2, 25, 2.5, 'Security')]),
      },
      party: { name: 'Desert Trade Co', address: 'Al Quoz', city: 'Dubai' },
      organization: org,
    },
    {
      id: 'q-syn-03',
      synthetic: true,
      quotation: {
        quotation_number: 'QT/26/0003',
        quotation_date: '2026-01-15',
        valid_until: '2026-02-15',
        currency_code: 'EUR',
        party_name: 'Euro Cargo BV',
        terms: 'FCL quotation.',
        ...fromLines([line(1, 80, 8, 'Freight'), line(3, 20, 6, 'Origin Charges'), line(1, 12, 1.2, 'Seal'), line(2, 5, 1, 'VGM')]),
      },
      party: { name: 'Euro Cargo BV', city: 'Rotterdam' },
      organization: org,
    },
    {
      id: 'q-syn-long',
      synthetic: true,
      quotation: {
        quotation_number: 'QT/26/LONG',
        quotation_date: '2026-01-20',
        valid_until: '2026-03-01',
        currency_code: 'USD',
        party_name: 'Long Quote Customer',
        terms: 'Multi-line quotation for pagination.',
        ...fromLines(Array.from({ length: 28 }, (_, index) => line(1, (index + 1) * 10, (index + 1) * 0.5, `Charge ${index + 1}`))),
      },
      party: { name: 'Long Quote Customer' },
      organization: org,
    },
  ];
}

function noteRecords(kind) {
  const prefix = kind === 'credit' ? 'CN' : 'DN';
  const key = kind === 'credit' ? 'creditNote' : 'debitNote';
  const numberField = kind === 'credit' ? 'credit_note_number' : 'debit_note_number';
  const base = [
    {
      id: `${kind}-syn-01`,
      synthetic: true,
      [key]: {
        [numberField]: `${prefix}/26/0001`,
        invoice_date: '2026-01-18',
        currency_code: 'USD',
        party_name: 'Sample Customer',
        credited_invoice_number: 'INV/26/00102',
        status: 'POSTED',
        remarks: 'Adjustment to original invoice',
        ...fromLines([line(1, 50, 0, 'Freight adjustment')]),
      },
      invoice: { invoice_number: 'INV/26/00102' },
      party: { name: 'Sample Customer' },
      organization: org,
    },
    {
      id: `${kind}-syn-02`,
      synthetic: true,
      [key]: {
        [numberField]: `${prefix}/26/0002`,
        invoice_date: '2026-01-19',
        currency_code: 'AED',
        party_name: 'Trade Partner LLC',
        credited_invoice_number: 'INV/26/00094',
        status: 'POSTED',
        ...fromLines([line(1, 100, 5, 'Rate correction'), line(1, 20, 1, 'Fee')]),
      },
      invoice: { invoice_number: 'INV/26/00094' },
      party: { name: 'Trade Partner LLC', address: 'Business Bay' },
      organization: org,
    },
    {
      id: `${kind}-syn-03`,
      synthetic: true,
      [key]: {
        [numberField]: `${prefix}/26/0003`,
        invoice_date: '2026-01-21',
        currency_code: 'EUR',
        party_name: 'EU Consignee SA',
        credited_invoice_number: 'INV/26/00101',
        status: 'DRAFT',
        ...fromLines([line(2, 40, 4, 'Charge A'), line(1, 15, 1.5, 'Charge B'), line(1, 10, 1, 'Charge C')]),
      },
      invoice: { invoice_number: 'INV/26/00101' },
      party: { name: 'EU Consignee SA' },
      organization: org,
    },
    {
      id: `${kind}-syn-long`,
      synthetic: true,
      [key]: {
        [numberField]: `${prefix}/26/LONG`,
        invoice_date: '2026-01-22',
        currency_code: 'USD',
        party_name: 'Long Note Customer',
        credited_invoice_number: 'INV/26/00100',
        status: 'POSTED',
        ...fromLines(Array.from({ length: 24 }, (_, index) => line(1, 20 + index, (20 + index) * 0.05, `Line ${index + 1}`))),
      },
      invoice: { invoice_number: 'INV/26/00100' },
      party: { name: 'Long Note Customer' },
      organization: org,
    },
  ];
  return base;
}

async function runType(type, code, records, buildMeta) {
  const dir = path.join(spikeRoot, type);
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  const thumbs = [];
  for (const record of records) {
    const meta = buildMeta(record);
    const doc = type === 'quotation' ? record.quotation : type === 'credit-note' ? record.creditNote : record.debitNote;
    const number = doc.quotation_number || doc.credit_note_number || doc.debit_note_number;
    const slug = String(number).replace(/[^\w.-]+/g, '_');
    const pdf = path.join(dir, `${slug}.pdf`);
    await renderInvoiceFlowPdf({ ...record, code }, pdf);
    const textOut = pdfText(pdf);
    const totals = flowTotalsRows({
      subtotal: doc.subtotal,
      tax_amount: doc.tax_amount,
      discount: doc.discount,
      rounding: doc.rounding,
      total_amount: doc.total_amount,
      lines: doc.lines,
    });
    const vsRecord = totals.map((row) => ({
      key: row.key,
      amount: row.amount,
      inPdf: containsAmount(textOut, row.amount),
    }));
    results.push({
      id: record.id,
      number,
      synthetic: true,
      recordOk: vsRecord.every((row) => row.inPdf),
      vsRecord,
      blanks: meta.blanks || [],
      leak: /fresa|powered by|<h3>/i.test(textOut),
    });
    thumbs.push({ label: number, file: raster(pdf, path.join(dir, `thumb-${slug}`)) });
  }
  contactSheet(thumbs, path.join(dir, 'contact-sheet.png'));
  fs.writeFileSync(path.join(dir, 'reconcile.json'), `${JSON.stringify({ code, results }, null, 2)}\n`);
  fs.writeFileSync(
    path.join(dir, 'blanks.md'),
    `# ${code} blanks\n\n${results.map((row) => `- **${row.number}**: ${row.blanks.length ? row.blanks.join(', ') : '(none)'}`).join('\n')}\n`,
  );
  return {
    code,
    pass: results.filter((row) => row.recordOk).length,
    total: results.length,
    blanks: results.map((row) => ({ number: row.number, blanks: row.blanks })),
  };
}

const summary = {
  quotation: await runType('quotation', 'QUOTATION_FLOW_1', quotationRecords(), (record) => buildQuotationFlowDocDefinition(record)),
  creditNote: await runType('credit-note', 'CREDIT_NOTE_FLOW_1', noteRecords('credit'), (record) => buildCreditNoteFlowDocDefinition(record)),
  debitNote: await runType('debit-note', 'DEBIT_NOTE_FLOW_1', noteRecords('debit'), (record) => buildDebitNoteFlowDocDefinition(record)),
  templateHash: writeFlowTemplateHash(spikeRoot),
};

fs.writeFileSync(path.join(spikeRoot, 'module-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
