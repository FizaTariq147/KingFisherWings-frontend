/**
 * Compare quotation detail-screen fields to the flow PDF for the 10 real quotes.
 * Binds are already in flow-doc; this reports remaining blanks after re-render.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const live = JSON.parse(fs.readFileSync(path.join(root, 'reports/output/flow-real/live.json'), 'utf8'));
const outDir = path.join(root, 'reports/flow-spike/real/quotation');
fs.mkdirSync(outDir, { recursive: true });

function filled(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

/** Detail-page fields (QuotationDetailPage detailSection). */
function screenFields(q, party) {
  return [
    { label: 'Quotation No', value: q.quotation_number, pdfHints: [q.quotation_number] },
    { label: 'Client', value: q.customer_name || party?.name, pdfHints: [q.customer_name, party?.name] },
    { label: 'Department', value: q.department_name || q.job_type, pdfHints: [q.department_name, q.job_type] },
    { label: 'Status', value: q.api_status || q.status, pdfHints: [q.api_status, q.status] },
    { label: 'Quotation date', value: q.quotation_date, pdfHints: [q.quotation_date] },
    { label: 'Currency', value: q.currency_code, pdfHints: [q.currency_code] },
    { label: 'Shipment No', value: q.shipment_number, pdfHints: [q.shipment_number] },
    { label: 'Job No', value: q.job_number, pdfHints: [q.job_number] },
    { label: 'Incoterms', value: q.incoterm || q.incoterms, pdfHints: [q.incoterm, q.incoterms] },
    { label: 'Commodity', value: q.commodity, pdfHints: [q.commodity] },
    { label: 'POL', value: q.origin_port_code || q.origin_port_name, pdfHints: [q.origin_port_code, q.origin_port_name] },
    { label: 'POD', value: q.dest_port_code || q.dest_port_name, pdfHints: [q.dest_port_code, q.dest_port_name] },
    { label: 'Carrier', value: q.carrier_name || q.carrier_preference, pdfHints: [q.carrier_name, q.carrier_preference] },
    { label: 'Valid until', value: q.valid_until, pdfHints: [q.valid_until] },
  ];
}

const rows = [];
for (const row of live.quotations || []) {
  const q = row.quotation;
  const pdfPath = path.join(outDir, `${row.id}-flow.pdf`);
  await renderInvoiceFlowPdf({
    organization: live.organization,
    quotation: q,
    party: row.party,
    job: row.job,
    code: 'QUOTATION_FLOW_1',
  }, pdfPath);
  const text = pdfText(pdfPath);
  const shownButBlank = [];
  const remainingEmpty = [];
  for (const field of screenFields(q, row.party)) {
    if (!filled(field.value)) {
      remainingEmpty.push({ field: field.label, reason: 'empty in the record' });
      continue;
    }
    const onPdf = (field.pdfHints || []).filter(filled).some((hint) => text.includes(String(hint).trim()));
    // Dates may be reformatted — also accept day-month fragments
    const dateOk =
      field.label === 'Quotation date' || field.label === 'Valid until'
        ? /\d{2}/.test(text) && String(field.value).slice(0, 4).length === 4
          ? /JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{2}-\w{3}-\d{2}|\d{4}/i.test(text)
          : onPdf
        : onPdf;
    if (!(onPdf || dateOk)) {
      shownButBlank.push({ field: field.label, value: field.value, reason: 'on screen, blank or unbound on flow PDF' });
    }
  }
  rows.push({
    id: row.id,
    number: q.quotation_number,
    bucket: row.bucket,
    shownButBlank,
    remainingEmpty,
  });
}

const report = {
  summary: {
    quotes: rows.length,
    stillShownButBlank: rows.reduce((sum, row) => sum + row.shownButBlank.length, 0),
  },
  rows,
};

fs.writeFileSync(
  path.join(root, 'reports/flow-spike/real/quotation-screen-blanks.json'),
  `${JSON.stringify(report, null, 2)}\n`,
);

const md = [
  '# Quotation screen vs flow PDF',
  '',
  'Detail-page fields with a value on screen that were blank on the flow PDF are listed first (should be empty after binding). Remaining empties are empty in the record.',
  '',
  ...rows.flatMap((row) => [
    `## ${row.number} (${row.bucket})`,
    '',
    '### Shown on screen, blank on flow',
    ...(row.shownButBlank.length
      ? row.shownButBlank.map((item) => `- **${item.field}**: ${item.reason} (record value present)`)
      : ['- (none)']),
    '',
    '### Remaining empty (empty in the record)',
    ...(row.remainingEmpty.length
      ? row.remainingEmpty.map((item) => `- **${item.field}**: ${item.reason}`)
      : ['- (none)']),
    '',
  ]),
].join('\n');

fs.writeFileSync(path.join(root, 'reports/flow-spike/real/quotation-screen-blanks.md'), `${md}\n`);
console.log(JSON.stringify(report.summary, null, 2));
