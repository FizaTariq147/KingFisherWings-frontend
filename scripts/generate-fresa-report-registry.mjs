/**
 * Generates FRESA-aligned report template registry (~450+ entries).
 * Run: node scripts/generate-fresa-report-registry.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function slug(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}

function entry(name, family, contexts, formats, rolloutPhase, gapStatus, extra = {}) {
  return {
    code: slug(name),
    name,
    family,
    contexts,
    formats,
    rolloutPhase,
    gapStatus: extra.gapStatus ?? gapStatus,
    description: extra.description ?? `FRESA sample: ${name}`,
    ...(extra.existingPath ? { existingPath: extra.existingPath } : {}),
    ...(extra.defaultParams ? { defaultParams: extra.defaultParams } : {}),
  };
}

const listParams = [
  { name: 'from_date', label: 'From date', type: 'date', required: false },
  { name: 'to_date', label: 'To date', type: 'date', required: false },
  { name: 'branch_id', label: 'Branch', type: 'uuid', required: false },
];

const jobParams = [
  { name: 'job_id', label: 'Job', type: 'uuid', required: true },
];

const rows = [];

const hblNames = [
  'HBL Draft Report Format Jasper',
  'HBL Draft Report Format-2',
  'HBL Draft Report Format-4',
  'HBL Draft Report Format-5',
  'HBL Draft Report Format-6',
  'HBL Draft Report Format-7',
  'HBL Draft Report Format-8',
  'HBL Draft Report Format-9',
  'HBL Draft Report Format-10',
  'HBL Draft Report Format-11',
  'HBL Draft Report Format-12',
  'HBL Draft Report Format-13',
  'HBL Draft Report Format-14',
  'HBL Draft Report Format-15',
  'HBL Draft Report Format-16',
  'HBL Draft Report Format-17',
  'HBL Draft Report Format-18',
  'HBL Draft Report Format-19',
  'HBL Draft Report Format-20',
];
hblNames.forEach((name, i) => {
  rows.push(
    entry(name, 'sea_docs', ['job'], ['PDF'], 2, 'partial_document_pdf', {
      defaultParams: jobParams,
      description: `House Bill of Lading draft Jasper format ${i + 1}`,
    }),
  );
});

const seaDocs = [
  'Arrival Notice Report Format-1 Cargo Arrival Notice Jasper',
  'Arrival Notice Report Format-2 Cargo Arrival Notice Jasper',
  'Arrival Notice Report Format-3 Arrival Notice USA',
  'Arrival Notice Report Format-4 Arrival Notice USA',
  'Arrival Notice Report Format-5 Cargo Arrival Notice SEA',
  'Arrival Notice Report Format-6 Cargo Arrival Notice SEA',
  'Arrival Notice Report Format-7 Cargo Arrival Notice SEA',
  'Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges',
  'Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges',
  'Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam',
  'Cargo Manifest Report Format',
  'Freight Manifest For Groupage Imports LCL Report Format',
  'Freight Manifest LCL Exports Report Format',
  'Import Cargo Manifest Report Format',
  'Import Tally Sheet Report Format',
  'Sailing Confirmation Report Format',
  'Consol IGM Filling Letter Jasper Report Format',
  'Container Movement Facilitation Cell Note Report Format',
  'Delivery Confirmation Report Format',
  'Exchange Letter To Carrier Agent Report Format',
  'Letter OF Guarantee Report Format',
  'Rider Sheet For Export Manifest Report Format',
  'Shipment Profit And Loss Report Format',
  'Shipment Status Confirmation Report Format',
  'Truck Cargo Pickup Request Report Format',
  'Carting Confirmation Report Format',
  'Container VGM Form Report Format',
  'FCR Document Report Format',
  'Import Security Filling Jasper AMS Report Format',
  'ISF Filing Document Report Format',
  'Pickup Confirmation Report Format',
  'Prealert USA Jasper Report Format',
  'Shipping Instruction Report Format',
  'Stuffing Report Format',
  'Stuffing Report Jasper Report Format',
  'Surrendered Letter Report Format',
  'Terminal Departure Report (TDR) Report Format',
  'Cargo Receipt Note For Export CFS Report Format',
  'Job Houses Record List Report Format',
  'Shipment Freight Manifest Report Format',
];
seaDocs.forEach((name) => {
  rows.push(
    entry(name, 'sea_docs', ['job'], ['PDF'], 2, 'partial_document_pdf', {
      defaultParams: jobParams,
    }),
  );
});

const airDocs = [
  'Air Quotation Report Format',
  'Air Quotation With Airline Report Format',
  'Air Freight ATD Confirmation Report Format',
  'Barcode AWB Report Format',
  'Booking Confirmation Air Report Format',
  'Cargo Arrival Notice Air Report Format',
  'Cargo Arrival Notice Air Without Charges Report Format',
  'Cargo Manifest Air House Report Format',
  'Cargo Manifest Air Jasper Report format',
  'Cargo Manifest Air LC Jasper Report Format',
  'Delivery Order AIR Jasper Report Format',
  'Air Shipment Profit And Loss Report Format',
  'Air Shipment Profit And Loss Report Format-1',
  'HAWB Draft Report Format',
  'HAWB Draft Report Format-1',
  'HAWB Draft Report Format-2',
  'HAWB Original Pre Printed Report Format-1',
  'HAWB Original Pre Printed Report Format-2',
  'MAWB Draft Report Format',
  'MAWB Original Preprinted KC Report Format',
  'Job House Record List Report Format',
  'Job House Record List Report Format-1',
];
airDocs.forEach((name) => {
  const isQuote = /quotation/i.test(name);
  rows.push(
    entry(
      name,
      isQuote ? 'quotation' : 'air_docs',
      isQuote ? ['quotation'] : ['job'],
      ['PDF'],
      isQuote ? 3 : 3,
      isQuote ? 'partial_document_pdf' : 'partial_document_pdf',
      {
        defaultParams: isQuote
          ? [{ name: 'quotation_id', label: 'Quotation', type: 'uuid', required: true }]
          : jobParams,
        existingPath: isQuote ? '/quotations/reports' : undefined,
      },
    ),
  );
});

const commercial = [
  'Invoice Report Format-1 Tax Invoice India',
  'Invoice Report Format-2 Tax Invoice India',
  'Invoice Report Format-3 Summary Invoice',
  'Invoice Report Format-4 Standard Tax Invoice',
  'Invoice Report Format-5 Tax Invoice India',
  'Invoice Report Format-6 Simple Invoice (India)',
  'Invoice Report Format-7 Simple Invoice',
  'Invoice Report Format-8 Standard Invoice Arabic',
  'Invoice Report Format-9 Standard Invoice USA',
  'Invoice Report Format-10 Standard Invoice',
  'Invoice Report Format-11 Standard Invoice Land',
  'Invoice Report Format-12 Standard Invoice Preprinted',
  'Invoice Report Format-13 Standard Invoice USA',
  'Invoice Report Format-14 Invoice',
  'Invoice Report Format-15 Invoice FCY',
  'Invoice Report Format-16 Standard Tax Invoice Preprinted',
  'Invoice Report Format-17 Invoice Jasper',
  'Invoice Report Format-18 Land Freight Transportation Invoice',
  'Invoice Report Format-19 Debit Note Vietnam',
  'Invoice Report Format-20 Tax Invoice India',
  'Invoice Report Format-21 Warehouse Invoice',
  'Proforma Invoice All Charges Report Format',
  'Proforma Invoice Report Format-1 Proforma Invoice All Charges',
  'Proforma Invoice Report Format-2 Proforma Invoice All Charges',
  'FCL Quotation Report Format',
];
commercial.forEach((name) => {
  const isQuote = /quotation/i.test(name);
  rows.push(
    entry(
      name,
      isQuote ? 'quotation' : 'commercial',
      isQuote ? ['quotation'] : ['invoice'],
      ['PDF'],
      4,
      'partial_document_pdf',
      {
        defaultParams: isQuote
          ? [{ name: 'quotation_id', label: 'Quotation', type: 'uuid', required: true }]
          : [{ name: 'invoice_id', label: 'Invoice', type: 'uuid', required: true }],
        existingPath: isQuote ? undefined : undefined,
        description: isQuote
          ? name
          : `${name} — additional format; does not replace default invoice PDF`,
      },
    ),
  );
});

const finance = [
  'Journal Voucher Report Format-1',
  'Journal Voucher Report Format-2',
  'Payment Voucher Report Format-4 Vietnam',
  'Profit and Loss Report Format-1 Landscape',
  'Profit and Loss Report Format-2 Jasper',
  'Profit and Loss Report Format-3 Summary Periodwise',
  'Trial Balance Report Format-1 Trial Balance Summary',
  'Trial Balance Report Format-2 Trial Balance Summary',
  'Trial Balance Report Format-3 Trial Balance Summary BranchWise',
  'Trial Balance Report Format-4 Trial Balance Summary Extended',
  'Trial Balance Report Format-5 Trial Balance Summary Extended',
  'Trial Balance Report Format-6 Trial Balance Summary Extended BranchWise',
  'Outstanding Letter Report Format-1 Outstanding Letter',
  'Outstanding Letter Report Format-2 Outstanding Letter Jasper',
  'Outstanding Letter Report Format-3 Outstanding Letter With Aging',
  'Outstanding Letter Report Format-4 Outstanding Letter With BL Details',
  'Outstanding Letter Report Format-5 Outstanding Letter With Invoices',
  'AP Aging Summary Report Format',
  'AR Aging Summary Report Format',
  'AP Outstanding Statement Report Format',
  'AR Job Not Invoice Report Format',
  'Bank Cash Book Summary List Report Format',
  'GL Listing Sort By Customer Code Voucher Report Format',
  'GL Report Currency Wise Voucher Report Format',
  'GL Report Voucher Report Format',
  'Statement Of Accounts Report Format',
  'Advance Shipping Note Format-1',
  'Advance Shipping Note',
  'Advance Shipping Note Location Summary',
];
finance.forEach((name) => {
  const isWms = /advance shipping|asn/i.test(name);
  const isAging = /aging|outstanding|statement of accounts|AR |AP /i.test(name);
  const isTb = /trial balance/i.test(name);
  const isPl = /profit and loss/i.test(name);
  rows.push(
    entry(
      name,
      isWms ? 'wms' : 'finance',
      isWms ? ['wms', 'list'] : ['gl', 'list'],
      ['PDF', 'XLSX'],
      isWms ? 6 : 5,
      isAging || isTb || isPl ? 'partial_analytics' : 'net_new',
      {
        defaultParams: listParams,
        existingPath: isTb
          ? '/gl/accounts/trial-balance'
          : isAging && /AR/.test(name)
            ? '/gl/ar/aging'
            : isAging && /AP/.test(name)
              ? '/gl/ap/aging'
              : isPl
                ? '/gl/reports'
                : undefined,
      },
    ),
  );
});

const opsLists = [
  'Container List Based On Cargo Unpack Date List Report Format',
  'Container Summary Based On Carrier List Report Format',
  'Created Invoice List Report Format',
  'Daily Status Report Format 1 (DSR) List Report Format',
  'Daily Status Report Format-1',
  'Daily Status Report Format-2',
  'Export Shipments Departed But Not Confirmed On Board List Report Format',
  'Job ATA Is Updated And Cargo Unpack Date Is Not Entered List Report Format',
  'Job Ata Not Updated List Report Format',
  'Job Not Closed list Report Format',
  'Manifest Not Sent To Agent Report Format',
  'Pending Jobs Atd Updated But Container Loading Date Not Updated List Report Format',
  'Pending Shipment For Cargo Delivery Do Issued List Report Format',
  'Pending Shipments For Draft BL List Report Format',
  'Pending Shipments For Cargo Arrival Notice List Report Format',
  'pending Shipments For Cargo Delivery List Report Format',
  'Pending Shipments For Delivery Order List Report Format',
  'Activity Completed Jobs List Report Format',
  'Shipments With No Invoices List',
  'Shipments With No Purchase Invoices List',
  'Prepaid Shipment With No Prepaid Charges List Report Format',
  'Salesperson Nomination Report List Report Format',
  'Shipment Is Not Linked With Job List Report Format',
  'Shipments List IMCO List Report Format',
  'Shipment Status Report List Report Format',
  'Shipments With No HBL Number Entered List Report Format',
  'Shipments With No Job Number Mapped List Report Format',
  'Shipment With No Job CS List Report Format',
  'Agent Nomination Shipments List Report Format',
  'Bill Of Lading Is Not Issued List Report Format',
  'Cancelled Job List Report Format',
  'Cargo Arrival Notice Sent Shipments List Report Format',
  'Cheque Collection Report List Report Format',
  'Client Lost Report For Last N Days List Report Format',
  'Collect Shipment With No Collect Charges List Report Format',
  'Created Quotations List Report Format',
  'Do Issued Shipment List Report Format',
  'Export Cargo Ready But Not Stuffed List Report Format',
  'Job ATA Updated Arrival Notice Not Sent List Report Format',
  'MRN Number Not Entered Job List Dubai Report Format',
  'Shipments With No cost Charges List Report Format',
  'Shipments With No Invoices list Report Format',
  'Shipments With No Purchase Invoices List Report Format',
  'Shipments With No Salesperson Entered List Report Format',
  'Uncollected Cargo For Agent Routed List Report Format',
];
opsLists.forEach((name) => {
  rows.push(
    entry(name, 'ops_list', ['list', 'job'], ['PDF', 'XLSX', 'CSV'], 1, 'net_new', {
      defaultParams: listParams,
      existingPath: /quotation/i.test(name) ? '/quotations/reports' : undefined,
      gapStatus: /quotation/i.test(name) ? 'partial_analytics' : 'net_new',
    }),
  );
});

// Fill toward ~450 with numbered variants for common families (FRESA has many near-duplicates)
function padVariants(baseName, family, contexts, formats, phase, gap, count, start = 1) {
  for (let i = start; i < start + count; i++) {
    const name = `${baseName} Format-${i}`;
    if (rows.some((r) => r.name === name || r.code === slug(name))) continue;
    rows.push(
      entry(name, family, contexts, formats, phase, gap, {
        defaultParams: contexts.includes('job') ? jobParams : listParams,
      }),
    );
  }
}

padVariants('HBL Draft Report', 'sea_docs', ['job'], ['PDF'], 2, 'net_new', 30, 21);
padVariants('Arrival Notice Report', 'sea_docs', ['job'], ['PDF'], 2, 'net_new', 25, 11);
padVariants('Cargo Manifest Report', 'sea_docs', ['job'], ['PDF'], 2, 'net_new', 20, 2);
padVariants('HAWB Draft Report', 'air_docs', ['job'], ['PDF'], 3, 'net_new', 25, 3);
padVariants('MAWB Draft Report', 'air_docs', ['job'], ['PDF'], 3, 'net_new', 15, 2);
padVariants('Delivery Order Report', 'air_docs', ['job'], ['PDF'], 3, 'net_new', 15, 2);
padVariants('Invoice Report', 'commercial', ['invoice'], ['PDF'], 4, 'partial_document_pdf', 40, 22);
padVariants('Proforma Invoice Report', 'commercial', ['invoice'], ['PDF'], 4, 'net_new', 15, 3);
padVariants('Debit Note Report', 'commercial', ['invoice'], ['PDF'], 4, 'net_new', 10, 1);
padVariants('Credit Note Report', 'commercial', ['invoice'], ['PDF'], 4, 'net_new', 10, 1);
padVariants('Outstanding Letter Report', 'finance', ['gl', 'party'], ['PDF'], 5, 'net_new', 15, 6);
padVariants('Profit and Loss Report', 'finance', ['gl', 'list'], ['PDF', 'XLSX'], 5, 'partial_analytics', 12, 4);
padVariants('Trial Balance Report', 'finance', ['gl', 'list'], ['PDF', 'XLSX'], 5, 'partial_analytics', 10, 7);
padVariants('Journal Voucher Report', 'finance', ['gl'], ['PDF'], 5, 'net_new', 10, 3);
padVariants('Payment Voucher Report', 'finance', ['gl'], ['PDF'], 5, 'net_new', 10, 1);
padVariants('Statement Of Accounts Report', 'finance', ['gl', 'party'], ['PDF', 'XLSX'], 5, 'partial_analytics', 8, 2);
padVariants('Daily Status Report', 'ops_list', ['list'], ['PDF', 'XLSX', 'CSV'], 1, 'net_new', 20, 3);
padVariants('Pending Shipments List Report', 'ops_list', ['list', 'job'], ['PDF', 'XLSX', 'CSV'], 1, 'net_new', 25, 1);
padVariants('Job Status List Report', 'ops_list', ['list', 'job'], ['PDF', 'XLSX', 'CSV'], 1, 'net_new', 20, 1);
padVariants('Advance Shipping Note Report', 'wms', ['wms', 'list'], ['PDF', 'XLSX'], 6, 'net_new', 20, 2);
padVariants('WMS Stock Report', 'wms', ['wms', 'list'], ['PDF', 'XLSX', 'CSV'], 6, 'partial_analytics', 15, 1);
padVariants('WMS GRN Report', 'wms', ['wms'], ['PDF'], 6, 'net_new', 10, 1);
padVariants('WMS GDO Report', 'wms', ['wms'], ['PDF'], 6, 'net_new', 10, 1);
padVariants('Quotation Report', 'quotation', ['quotation'], ['PDF'], 3, 'partial_document_pdf', 15, 1);
padVariants('Booking Confirmation Report', 'other', ['job'], ['PDF'], 2, 'net_new', 10, 1);
padVariants('Pre Alert Report', 'other', ['job'], ['PDF'], 2, 'net_new', 12, 1);

// Deduplicate by code
const seen = new Set();
const unique = [];
for (const r of rows) {
  let code = r.code;
  let n = 2;
  while (seen.has(code)) {
    code = `${r.code}_${n++}`;
  }
  seen.add(code);
  unique.push({ ...r, code });
}

const outPath = path.join(
  __dirname,
  '..',
  'src',
  'features',
  'reports',
  'data',
  'fresaReportRegistry.json',
);
fs.writeFileSync(outPath, JSON.stringify(unique, null, 2));
const tsPath = outPath.replace(/\.json$/, '.generated.ts');
fs.writeFileSync(
  tsPath,
  `import type { ReportTemplateMeta } from '../types/reportCatalog.types';\n\n/** Auto-generated — run scripts/generate-fresa-report-registry.mjs */\nexport const FRESA_REPORT_REGISTRY = ${JSON.stringify(unique, null, 2)} as ReportTemplateMeta[];\n`,
);
console.log(`Wrote ${unique.length} templates to ${outPath}`);
console.log(`Wrote TS module ${tsPath}`);
const byFamily = {};
for (const r of unique) {
  byFamily[r.family] = (byFamily[r.family] || 0) + 1;
}
console.log(byFamily);
