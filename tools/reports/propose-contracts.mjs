/**
 * Group the top label proposals into one contract per document family.
 * These types are not imported by the app.
 * Run: node tools/reports/propose-contracts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceOf = {
  'party.shipper': 'Job.shipper_name',
  'party.consignee': 'Job.consignee_name',
  'party.billTo': 'Invoice.party_name',
  'party.notify': null,
  'invoice.number': 'Invoice.invoice_number',
  'invoice.date': 'Invoice.invoice_date',
  'invoice.dueDate': 'Invoice.due_date',
  'invoice.total': 'Invoice.total_amount',
  'invoice.tax': 'Invoice.tax_total',
  'invoice.amount': 'Invoice.subtotal',
  'invoice.currency': 'Invoice.currency_code',
  'shipment.number': 'Job.shipment_number',
  'shipment.mawb': 'JobAirDetail.mawb_number',
  'shipment.hawb': 'JobAirWaybill.awb_number',
  'shipment.hbl': 'JobSeaFclDetail.hbl_number',
  'shipment.mbl': 'JobSeaFclDetail.mbl_number',
  'shipment.pol': 'Job.origin_port_code',
  'shipment.pod': 'Job.dest_port_code',
  'shipment.vessel': 'JobSeaFclDetail.vessel_name',
  'shipment.voyage': 'JobSeaFclDetail.voyage_number',
  'shipment.etd': 'JobSeaFclDetail.etd',
  'shipment.eta': 'JobSeaFclDetail.eta',
  'shipment.carrier': 'Quotation.carrier_name',
  'shipment.freightTerms': null,
  'shipment.placeOfReceipt': null,
  'shipment.placeOfDelivery': null,
  'shipment.finalDestination': null,
  'shipment.referenceNo': null,
  'shipment.igmNo': null,
  'cargo.description': 'JobCargo.description',
  'cargo.pieces': 'JobCargo.packages',
  'cargo.grossWeight': 'JobCargo.gross_weight',
  'cargo.measurement': 'JobCargo.measurement',
  'cargo.containerNo': 'JobCargo.container_number',
  'cargo.netWeight': null,
  'cargo.sealNo': null,
  'charge.description': 'JobCharge.description',
  'charge.quantity': 'JobCharge.quantity',
  'charge.rate': 'JobCharge.unit_price',
  'job.number': 'Job.job_number',
  'company.phone': 'OrganizationProfile.phone',
  'company.email': 'OrganizationProfile.email',
  'company.address': 'OrganizationProfile.address',
  'company.website': 'OrganizationProfile.website',
  'ledger.debit': 'VoucherLine.debit_amount',
  'ledger.credit': 'VoucherLine.credit_amount',
  'ledger.accountName': 'VoucherLine.account_name',
  'ledger.openingBalance': null,
  'ledger.closingBalance': null,
  'document.user': 'Job.created_by',
  'document.pageNumber': null,
};

function parseCsv(text) {
  return text.trim().split(/\r?\n/).slice(1).map((line) => {
    const cells = [];
    let current = '';
    let quoted = false;
    for (const char of line) {
      if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) {
        cells.push(current);
        current = '';
      } else current += char;
    }
    cells.push(current);
    return cells;
  });
}

function leftover(label) {
  if (/^\d/.test(label)) return true;
  if ((label.match(/\d/g) || []).length >= 4) return true;
  if (!label.includes(' ') && label.length <= 4) return true;
  return false;
}

function familiesFor(label, familyCounts, proposedPath) {
  const ranked = Object.entries(familyCounts).sort((a, b) => b[1] - a[1]);
  const top = ranked[0]?.[0];
  const names = new Set();
  if (proposedPath.startsWith('ledger.') || /\b(debit|credit|opening|closing)\b/.test(label)) names.add('ledger');
  if (/voucher|narration/.test(label)) names.add('voucher');
  if (/arrival|\bigm\b/.test(label)) names.add('arrivalNotice');
  if (/quot/.test(label) || top === 'quotation') names.add('quotation');
  if (top === 'air_docs' || /mawb|hawb|\bawb\b/.test(label)) names.add('awb');
  if (top === 'sea_docs' || /hbl|mbl|bill of lading|consignor/.test(label)) names.add('bl');
  if (familyCounts.air_docs && familyCounts.sea_docs && proposedPath.startsWith('party.')) {
    names.add('awb');
    names.add('bl');
  }
  if (top === 'commercial' || proposedPath.startsWith('invoice.') || proposedPath.startsWith('charge.')) names.add('invoice');
  if (top === 'ops_list' || proposedPath.startsWith('job.') || /\bjob\b/.test(label)) names.add('jobCard');
  if (top === 'finance' && !names.has('ledger') && !names.has('voucher')) names.add('ledger');
  if (!names.size) names.add('invoice');
  return [...names];
}

const rows = parseCsv(fs.readFileSync(path.join(root, 'reports/binding-proposals.csv'), 'utf8'));
const buckets = {
  invoice: [],
  jobCard: [],
  bl: [],
  awb: [],
  arrivalNotice: [],
  quotation: [],
  voucher: [],
  ledger: [],
};
let dropped = 0;
function keep(label, proposedPath) {
  if (label.length > 48) return false;
  if (leftover(label)) return false;
  if (Object.prototype.hasOwnProperty.call(sourceOf, proposedPath)) return true;
  if (/bank|petty|pvt|llc|chennai|dubai|mumbai|sharjah|india|cash book|office|hdfc|hsbc|icici|adcb/.test(label)) return false;
  return /no\b|date|name|party|weight|port|place|user|page|charge|total|balance|address|phone|email|vessel|voyage|container|seal|package|marks|agent|consignor|notify/.test(label);
}
for (const [label, frequency, families, proposedPath, fresh] of rows) {
  if (!keep(label, proposedPath)) {
    dropped += 1;
    continue;
  }
  const familyCounts = Object.fromEntries(families.split('|').filter(Boolean).map((item) => {
    const [name, count] = item.split(':');
    return [name, Number(count) || 0];
  }));
  let pathName = proposedPath;
  if (label === 'narration') pathName = 'voucher.narration';
  if (label === 'shippers reference') pathName = 'shipment.referenceNo';
  const field = pathName.split('.').pop();
  const source = pathName === 'voucher.narration'
    ? 'Voucher.narration'
    : (Object.prototype.hasOwnProperty.call(sourceOf, pathName) ? sourceOf[pathName] : null);
  const entry = { label, frequency: Number(frequency), path: pathName, field, fresh: fresh === 'yes', source };
  for (const bucket of familiesFor(label, familyCounts, pathName)) {
    if (!buckets[bucket].some((item) => item.path === entry.path)) buckets[bucket].push(entry);
  }
}

const dir = path.join(root, 'src/features/reports/contracts/proposals');
fs.mkdirSync(dir, { recursive: true });
const titles = {
  invoice: 'Invoice',
  jobCard: 'Job card',
  bl: 'Bill of lading',
  awb: 'Air waybill',
  arrivalNotice: 'Arrival notice',
  quotation: 'Quotation',
  voucher: 'Voucher',
  ledger: 'Ledger',
};
for (const [key, fields] of Object.entries(buckets)) {
  const used = new Set();
  const lines = fields.map((field) => {
    let name = field.field;
    if (used.has(name)) name = field.path.replace(/\./g, '_');
    used.add(name);
    const note = field.source ? `Source: ${field.source}.` : 'No source in the current data model.';
    return `  /** ${field.label} (${field.frequency}). ${note} */\n  ${name}: string;`;
  });
  const members = lines.length ? lines.join('\n') : '  /** No top-300 label had this family as its main family. */';
  const typeName = titles[key].split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  const body = `/**\n * Proposed ${titles[key]} bindings from the filtered label inventory.\n * Not wired into the report renderer.\n */\nexport interface ${typeName}ContractProposal {\n${members}\n}\n`;
  fs.writeFileSync(path.join(dir, `${key}.ts`), body);
}
const missing = Object.values(buckets).flat().filter((field) => !field.source);
console.log(JSON.stringify({
  dropped,
  counts: Object.fromEntries(Object.entries(buckets).map(([key, fields]) => [key, fields.length])),
  noSource: [...new Set(missing.map((field) => field.path))],
}, null, 2));
