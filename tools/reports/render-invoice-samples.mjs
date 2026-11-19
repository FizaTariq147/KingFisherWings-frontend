/**
 * Draw invoice-shaped records through the spec renderer.
 * Empty fields stay empty. Organization text replaces company slots.
 * Fresa branding text is not drawn.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { renderSpec } from './render-spec.mjs';
import { bindingForLabel, loadDictionary, nearestLabel } from './invoice-bindings.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const code = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';

function text(value) {
  return value == null ? '' : String(value).trim();
}

function recordValues(record) {
  const org = record.organization || {};
  const invoice = record.invoice || {};
  const job = record.job || {};
  return {
    'company.name': text(org.display_name) || text(org.name),
    'company.address': [org.address, org.city, org.country_code].map(text).filter(Boolean).join(', '),
    'company.phone': text(org.phone),
    'company.email': text(org.email),
    'party.billTo': text(invoice.party_name),
    'party.shipper': text(job.shipper_name),
    'party.consignee': text(job.consignee_name),
    'party.notify': '',
    'job.number': text(invoice.job_number) || text(job.job_number),
    'invoice.number': text(invoice.invoice_number),
    'invoice.date': text(invoice.invoice_date),
    'invoice.currency': text(invoice.currency_code),
    'invoice.amount': invoice.subtotal == null ? '' : String(invoice.subtotal),
    'invoice.tax': invoice.tax_total == null ? '' : String(invoice.tax_total),
    'invoice.total': invoice.total_amount == null ? '' : String(invoice.total_amount),
    'shipment.pol': text(job.origin_port_code),
    'shipment.pod': text(job.dest_port_code),
    'shipment.vessel': text(job.vessel_name),
    'shipment.voyage': text(job.voyage_number),
    'shipment.etd': text(job.etd),
    'shipment.eta': text(job.eta),
    'shipment.hbl': text(job.hbl_number),
    'shipment.mbl': text(job.mbl_number),
    'cargo.description': text(job.commodity),
    'cargo.pieces': job.pieces == null ? '' : String(job.pieces),
    'cargo.grossWeight': job.gross_weight == null ? '' : String(job.gross_weight),
    'cargo.netWeight': '',
    'cargo.containerNo': text(job.container_number),
  };
}

function spanValues(spec, record) {
  const dictionary = loadDictionary();
  const byPath = recordValues(record);
  const values = {};
  const pages = spec.pages?.length ? spec.pages : [spec];
  const lineSpans = [];
  for (const page of pages) {
    for (const span of page.spans || []) {
      if (span.role !== 'dynamic') continue;
      const label = nearestLabel(span, page.spans || []);
      const binding = bindingForLabel(label?.text || '', dictionary);
      values[span.id] = binding ? (byPath[binding] ?? '') : '';
      if (binding === 'cargo.description') lineSpans.push(span.id);
    }
  }
  const lines = record.invoice?.lines || [];
  lineSpans.forEach((id, index) => {
    if (lines[index]?.description) values[id] = String(lines[index].description);
  });
  return {
    values,
    extraLines: Math.max(0, lines.length - lineSpans.length),
    lineSlots: lineSpans.length,
  };
}

const organization = {
  name: 'Northwind Logistics',
  display_name: 'Northwind Logistics',
  address: 'Warehouse 4, Jebel Ali',
  city: 'Dubai',
  country_code: 'AE',
  phone: '+97140000000',
  email: 'accounts@northwind.example',
  website: 'https://northwind.example',
};

function invoice(partial) {
  return {
    organization,
    invoice: {
      invoice_number: partial.number,
      party_name: partial.party,
      currency_code: partial.currency,
      invoice_date: partial.date || '2026-03-01',
      job_number: partial.jobNumber || '',
      subtotal: partial.subtotal,
      tax_total: partial.tax,
      total_amount: partial.total,
      lines: partial.lines || [],
    },
    job: partial.job || {},
  };
}

const longName = 'Harbor Trading and General Contracting LLC — Gulf Distribution Desk';
const manyLines = Array.from({ length: 12 }, (_, index) => ({
  description: `Charge line ${index + 1} ocean freight documentation`,
}));

const records = [
  invoice({ number: 'INV-LONG-1', party: longName, currency: 'AED', subtotal: 1000, tax: 50, total: 1050, lines: [{ description: longName }] }),
  invoice({ number: 'INV-LINES-2', party: 'Gulf Cargo', currency: 'AED', subtotal: 4800, tax: 240, total: 5040, lines: manyLines }),
  invoice({ number: 'INV-USD-3', party: 'Atlas Imports', currency: 'USD', subtotal: 2200, tax: 0, total: 2200, lines: [{ description: 'Air freight' }] }),
  invoice({ number: 'INV-EUR-4', party: 'Baltic Mills', currency: 'EUR', subtotal: 900, tax: 180, total: 1080, lines: [{ description: 'Road haulage' }, { description: 'Fuel' }] }),
  invoice({ number: 'INV-EMPTY-5', party: '', currency: 'AED', subtotal: null, tax: null, total: null, lines: [] }),
  invoice({ number: 'INV-ADDR-6', party: 'A very long billing party name that wraps past a single invoice column and keeps going', currency: 'AED', subtotal: 15, tax: 0, total: 15, job: { origin_port_code: 'AEJEA', dest_port_code: 'INNSA', commodity: 'General cargo' } }),
  invoice({ number: 'INV-BOX-7', party: 'Crate Co', currency: 'AED', subtotal: 640, tax: 32, total: 672, job: { container_number: 'MSCU1234567', hbl_number: 'HBL100', vessel_name: 'Northern Star', voyage_number: '012E' }, lines: [{ description: 'FCL freight' }] }),
  invoice({ number: 'INV-ZERO-8', party: 'No Tax Ltd', currency: 'AED', subtotal: 300, tax: 0, total: 300, lines: [{ description: 'Documentation' }] }),
  invoice({ number: 'INV-MULTI-9', party: 'Two Desk Trading', currency: 'USD', subtotal: 1500, tax: 75, total: 1575, jobNumber: 'JOB-4401', lines: [{ description: 'Origin charges' }, { description: 'Destination charges' }, { description: 'Agency' }] }),
  invoice({ number: 'INV-NOJOB-10', party: 'Walk In Customer', currency: 'AED', subtotal: 40, tax: 2, total: 42, jobNumber: '', lines: [{ description: 'Local delivery' }] }),
];

const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
const outDir = path.join(root, 'reports/output/invoice-v2');
fs.mkdirSync(outDir, { recursive: true });
const summary = [];
for (const [index, record] of records.entries()) {
  const filled = spanValues(spec, record);
  const outPath = path.join(outDir, `sample-${index + 1}.pdf`);
  const rendered = await renderSpec(code, {
    values: filled.values,
    organization: {
      name: record.organization.display_name,
      address: [record.organization.address, record.organization.city, record.organization.country_code].filter(Boolean).join(', '),
      phone: record.organization.phone,
      email: record.organization.email,
      website: record.organization.website,
    },
    outputPath: outPath,
  });
  const bytes = fs.readFileSync(outPath);
  const doc = await PDFDocument.load(bytes);
  const warnings = rendered.warnings || [];
  if (filled.extraLines) {
    const noun = filled.extraLines === 1 ? 'charge line has' : 'charge lines have';
    warnings.push({ warning: `${filled.extraLines} ${noun} no row in this spec (${filled.lineSlots} description slots)` });
  }
  summary.push({
    file: `sample-${index + 1}.pdf`,
    invoice: record.invoice.invoice_number,
    pages: doc.getPageCount(),
    warnings: warnings.length,
    warningText: warnings.map((entry) => entry.warning).filter(Boolean),
  });
  console.log(JSON.stringify(summary.at(-1)));
}
fs.writeFileSync(path.join(root, 'reports/invoice-v2-samples.json'), `${JSON.stringify(summary, null, 2)}\n`);
