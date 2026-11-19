/**
 * Field coverage for the 10 downloaded invoices and 5 synthetic invoices.
 * Writes reports/invoice-v2/coverage.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { amountInWords } from './amount-words.mjs';

const root = process.cwd();
const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/invoice-v2/batch-live.json'), 'utf8'));
const codes = [...fs.readFileSync(path.join(root, 'src/features/reports/engine/invoiceV2Codes.ts'), 'utf8').matchAll(/'([A-Z][A-Z0-9_]+)'/g)].map((match) => match[1]);
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
  logo_url: org.logo_url || '',
};

function countsFor(filled) {
  const counts = { a: 0, b: 0, c: 0, d: 0 };
  const seen = new Set();
  for (const [id, value] of Object.entries(filled.values)) {
    if (!String(value || '').trim() || seen.has(id)) continue;
    seen.add(id);
    counts.a += 1;
  }
  for (const blank of filled.blanks) {
    if (seen.has(blank.span)) continue;
    seen.add(blank.span);
    if (blank.why === 'empty in the record') counts.b += 1;
    else if (blank.why === 'wrong path') counts.c += 1;
    else counts.d += 1;
  }
  return counts;
}

function hasText(filled, text) {
  const wanted = String(text || '').replace(/\s+/g, ' ').trim();
  if (!wanted) return false;
  return Object.values(filled.values).some((value) => {
    const got = String(value || '').replace(/\s+/g, ' ').trim();
    return got === wanted || (wanted.length >= 4 && got.includes(wanted));
  });
}

const GST_BLOCKED = new Set([
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_5_TAX_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_6_SIMPLE_INVOICE_INDIA',
  'INVOICE_REPORT_FORMAT_14_INVOICE',
  'INVOICE_REPORT_FORMAT_20_TAX_INVOICE_INDIA',
  'PURCHASE_INVOICE_REPORT_FORMAT_1',
  'PURCHASE_INVOICE_REPORT_FORMAT_2',
]);

function named(row, filled, code) {
  const invoice = row.invoice || {};
  const job = row.job || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const party = row.party || {};
  const bill = [invoice.party_name || party.name, party.address, party.city].filter(Boolean).join(', ');
  const line = (invoice.lines || [])[0] || {};
  const words = amountInWords(invoice.total_amount ?? 0, invoice.currency_code);
  const tax = (invoice.lines || []).map((item) => item.tax_amount).find((item) => item != null && Number(item) !== 0);
  const mark = (present, source) => {
    if (!source) return 'empty in the record';
    return present ? 'filled' : 'not on this layout';
  };
  return {
    'bill-to': mark(hasText(filled, bill) || hasText(filled, invoice.party_name), invoice.party_name || party.name),
    shipper: mark(hasText(filled, job.shipper_name), job.shipper_name),
    consignee: mark(hasText(filled, job.consignee_name), job.consignee_name),
    vessel: mark(hasText(filled, job.vessel_name || sea.vessel_name), job.vessel_name || sea.vessel_name),
    voyage: mark(hasText(filled, job.voyage_number || sea.voyage_number), job.voyage_number || sea.voyage_number),
    container: mark(hasText(filled, job.primary_container_number || job.containers?.[0]?.container_number), job.primary_container_number || job.containers?.[0]?.container_number),
    HBL: mark(hasText(filled, sea.hbl_number), sea.hbl_number),
    quantity: mark(hasText(filled, line.quantity == null ? '' : String(line.quantity)), line.quantity != null),
    rate: mark(hasText(filled, line.unit_price == null ? '' : Number(line.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })), line.unit_price != null),
    currency: mark(hasText(filled, invoice.currency_code), invoice.currency_code),
    'per-line tax': tax == null
      ? 'empty in the record'
      : hasText(filled, Number(tax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        ? 'filled'
        : GST_BLOCKED.has(code)
          ? 'not drawn; SGST/CGST blocked'
          : 'not on this layout',
    'amount in words': mark(hasText(filled, words), words),
    logo: organization.logo_url ? 'profile has a logo file' : 'empty slot',
  };
}

const out = ['# Invoice v2 field coverage', ''];
out.push('Counts are dynamic spans. (a) bound and filled. (b) bound, empty in the record. (c) not bound, and a source exists on the invoice, job, shipment, or party. (d) no source.');
out.push('Synthetic records are not stored invoices. They reuse the first downloaded invoice and add lines.');
out.push('The logo is not a span. The catalogue draws it with `fetchOrganizationLogoBytes`, the same fetch the classic generator uses. No bytes leaves the slot empty. These records have an organization logo URL, so the slot is filled when that fetch returns bytes.');
out.push('Labels that named a field already on the invoice, job, shipment, or party are bound: voyage, flight, ref no, INCO terms, customer P/O, balance, due date, department, place of origin, and MAWB/MBL/HAWB/HBL. (c) is what remains unbound after that. Amount in words is derived from the total and the currency.');
out.push('');

const names = ['bill-to', 'shipper', 'consignee', 'vessel', 'voyage', 'container', 'HBL', 'quantity', 'rate', 'currency', 'per-line tax', 'amount in words', 'logo'];
for (const code of codes) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  out.push(`## ${code}`, '');
  out.push('| Record | Kind | (a) | (b) | (c) | (d) |');
  out.push('|---|---|---:|---:|---:|---:|');
  const namedRows = [];
  for (const row of live.invoices) {
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
    const filled = fillInvoiceSpans(spec, { invoice: row.invoice, job: row.job, party: row.party, organization });
    const counts = countsFor(filled);
    const kind = String(row.id).startsWith('extra-') ? 'synthetic' : 'real';
    out.push(`| ${row.invoice.invoice_number || row.id} | ${kind} | ${counts.a} | ${counts.b} | ${counts.c} | ${counts.d} |`);
    namedRows.push([row, kind, named(row, filled, code)]);
  }
  out.push('');
  if (namedRows.length) {
    out.push('Named fields on this layout:', '');
    out.push(`| Record | Kind | ${names.join(' | ')} |`);
    out.push(`|---|---|${names.map(() => '---').join('|')}|`);
    for (const [row, kind, flags] of namedRows) {
      out.push(`| ${row.invoice.invoice_number || row.id} | ${kind} | ${names.map((name) => flags[name]).join(' | ')} |`);
    }
    out.push('');
  }
}

const file = path.join(root, 'reports/invoice-v2/coverage.md');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, `${out.join('\n')}\n`);
console.log('wrote', path.relative(root, file));
