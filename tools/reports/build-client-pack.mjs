/**
 * Build reports/client-pack/ for INV/26/00102, INV/26/00094, and one quotation
 * each of air / FCL / LCL: classic PDF, flow PDF, nearest Fresa reference copy,
 * plus differences.md. Flow PDFs must not contain Fresa branding.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'reports/client-pack');
const livePath = path.join(root, 'reports/output/flow-real/live.json');
const invoiceLivePath = path.join(root, 'reports/output/invoice-v2/batch-live.json');
const classicInvoiceDir = path.join(root, 'reports/output/invoice-v2/classic');
const classicQuoteDir = path.join(root, 'reports/output/flow-real/classic/quotation');

const FRESA = {
  invoice: path.join(root, 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf'),
  quotation: path.join(root, 'reports/references/files/fcl-quotation-report-format.pdf'),
};

function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
const invoiceLive = JSON.parse(fs.readFileSync(invoiceLivePath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const invoices = ['INV/26/00102', 'INV/26/00094'].map((number) => {
  const row = invoiceLive.invoices.find((item) => item.invoice?.invoice_number === number);
  if (!row) throw new Error(`Missing invoice ${number}`);
  return row;
});

const quotes = ['fcl', 'air', 'lcl'].map((bucket) => {
  const row = (live.quotations || []).find((item) => item.bucket === bucket);
  if (!row) throw new Error(`Missing ${bucket} quotation`);
  return row;
});

const org = invoiceLive.organization || live.organization;
const differences = [];

for (const row of invoices) {
  const number = row.invoice.invoice_number;
  const slug = number.replace(/[^\w.-]+/g, '_');
  const dir = path.join(outDir, 'invoice', slug);
  fs.mkdirSync(dir, { recursive: true });
  const flowPdf = path.join(dir, 'flow.pdf');
  await renderInvoiceFlowPdf({
    organization: org,
    invoice: row.invoice,
    party: row.party,
    job: row.job,
    code: 'INVOICE_FLOW_TAX_INVOICE_1',
  }, flowPdf);
  const classicCandidates = [
    path.join(classicInvoiceDir, `${row.id}.pdf`),
    path.join(root, 'reports/flow-spike', `classic-${number.replace(/[^\w.-]+/g, '_')}.pdf`),
  ];
  const classicSrc = classicCandidates.find((file) => fs.existsSync(file));
  if (!classicSrc) throw new Error(`Missing classic PDF for ${number}`);
  copy(classicSrc, path.join(dir, 'classic.pdf'));
  if (fs.existsSync(FRESA.invoice)) copy(FRESA.invoice, path.join(dir, 'fresa-reference-nearest.pdf'));
  const text = pdfText(flowPdf);
  const leak = /fresa|powered by/i.test(text);
  differences.push({
    record: number,
    type: 'invoice',
    nearestFresa: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    flowLeak: leak,
    knownDifferences: [
      'Flow uses tax_amount; classic VAT uses tax_total when set.',
      'Flow layout is pdfmake Format-1-inspired, not a pixel match to the Fresa sample.',
      'Empty record fields stay blank — never filled from the Fresa sample.',
    ],
    blanks: [
      !row.party?.address ? 'party.address empty in record' : null,
      !row.job ? 'job context empty in record' : null,
    ].filter(Boolean),
  });
  if (leak) throw new Error(`Fresa leak in flow PDF for ${number}`);
}

for (const row of quotes) {
  const number = row.quotation.quotation_number;
  const slug = `${row.bucket}-${number.replace(/[^\w.-]+/g, '_')}`;
  const dir = path.join(outDir, 'quotation', slug);
  fs.mkdirSync(dir, { recursive: true });
  const flowPdf = path.join(dir, 'flow.pdf');
  await renderInvoiceFlowPdf({
    organization: org,
    quotation: row.quotation,
    party: row.party,
    job: row.job,
    code: 'QUOTATION_FLOW_1',
  }, flowPdf);
  const classicSrc = path.join(classicQuoteDir, `${row.id}.pdf`);
  if (fs.existsSync(classicSrc)) copy(classicSrc, path.join(dir, 'classic.pdf'));
  if (fs.existsSync(FRESA.quotation)) copy(FRESA.quotation, path.join(dir, 'fresa-reference-nearest.pdf'));
  const text = pdfText(flowPdf);
  const leak = /fresa|powered by/i.test(text);
  const q = row.quotation;
  differences.push({
    record: number,
    type: `quotation-${row.bucket}`,
    id: row.id,
    nearestFresa: 'FCL_QUOTATION_REPORT_FORMAT',
    flowLeak: leak,
    knownDifferences: [
      'Flow quotation is a commercial face (pdfmake), not the FCL Quotation Jasper/Fresa sample layout.',
      'Incoterms bind from incoterm or incoterms; blank when the record has neither.',
      'Carrier binds carrier_name or carrier_preference; blank when both empty.',
    ],
    blanks: [
      !q.commodity ? 'Commodity empty in record' : null,
      !q.incoterm && !q.incoterms ? 'Incoterms empty in record' : null,
      !q.carrier_name && !q.carrier_preference ? 'Carrier empty in record' : null,
      !q.valid_until ? null : 'Valid until empty in record',
      !q.department_name ? 'Department name empty in record (job_type still prints under Job / Service)' : null,
    ].filter(Boolean),
  });
  if (leak) throw new Error(`Fresa leak in flow PDF for ${number}`);
}

const md = [
  '# Client pack — known differences and blanks',
  '',
  'One page for reviewers. Flow PDFs contain no Fresa names or branding.',
  '',
  ...differences.flatMap((row) => [
    `## ${row.record} (${row.type})`,
    '',
    `Nearest Fresa reference: \`${row.nearestFresa}\` (copied as \`fresa-reference-nearest.pdf\`).`,
    '',
    '### Differences',
    ...row.knownDifferences.map((line) => `- ${line}`),
    '',
    '### Blanks',
    ...(row.blanks.length ? row.blanks.map((line) => `- ${line}`) : ['- (none recorded for measured fields)']),
    '',
  ]),
].join('\n');

fs.writeFileSync(path.join(outDir, 'differences.md'), `${md}\n`);
fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify({ differences, outDir: 'reports/client-pack' }, null, 2)}\n`);
console.log(JSON.stringify({ folders: fs.readdirSync(outDir), leakFree: differences.every((row) => !row.flowLeak) }, null, 2));
