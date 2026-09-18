/**
 * Compare section strip catalogue sizes vs JSON layout store sizes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Can't import TS easily — compare JSON stores to remaining/leftover catalogs + known cores.
const dataDir = 'src/features/reports/data';
const constDir = 'src/features/reports/constants';

function layoutCount(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')).length;
}

const rem = JSON.parse(fs.readFileSync(path.join(constDir, 'remainingFormatCatalog.json'), 'utf8'));
const left = JSON.parse(fs.readFileSync(path.join(constDir, 'leftoverFormatCatalog.json'), 'utf8'));

const byBucket = {};
for (const r of rem) {
  byBucket[r.bucket] = (byBucket[r.bucket] || 0) + 1;
}

const report = {
  stores: {
    invoice: layoutCount('invoiceFormatUiLayouts.json'),
    accounts: layoutCount('accountsFormatUiLayouts.json'),
    wms: layoutCount('wmsFormatUiLayouts.json'),
    arrival: layoutCount('arrivalNoticeFormatUiLayouts.json'),
    delivery: layoutCount('deliveryOrderFormatUiLayouts.json'),
    hawb: layoutCount('hawbFormatUiLayouts.json'),
    hbl: layoutCount('hblFormatUiLayouts.json'),
    other: layoutCount('otherReportsFormatUiLayouts.json'),
    quotation: layoutCount('quotationFormatUiLayouts.json'),
    ops_list: layoutCount('opsListFormatUiLayouts.json'),
    commercial: layoutCount('commercialExtraFormatUiLayouts.json'),
    sea_air: layoutCount('seaDocsExtraFormatUiLayouts.json'),
    leftover: layoutCount('leftoverFormatUiLayouts.json'),
  },
  remainingBuckets: byBucket,
  leftoverCatalog: left.length,
};

const total = Object.values(report.stores).reduce((a, b) => a + b, 0);
console.log(JSON.stringify({ ...report, totalStores: total }, null, 2));

// Catalog page wiring checklist
const page = fs.readFileSync('src/features/reports/pages/ReportCatalogPage.tsx', 'utf8');
const strips = [
  'InvoiceFormatBrowseStrip',
  'AccountsFormatBrowseStrip',
  'WmsFormatBrowseStrip',
  'ArrivalNoticeFormatBrowseStrip',
  'DeliveryOrderFormatBrowseStrip',
  'HawbFormatBrowseStrip',
  'HblFormatBrowseStrip',
  'OtherReportsFormatBrowseStrip',
  'QuotationFormatBrowseStrip',
  'OpsListFormatBrowseStrip',
  'CommercialExtraFormatBrowseStrip',
  'SeaDocsExtraFormatBrowseStrip',
  'LeftoverFormatBrowseStrip',
];
const autoPdfs = strips.map((s) => s.replace('BrowseStrip', 'AutoPdf'));
autoPdfs.push('CatalogReportAutoPdf');

console.log(
  JSON.stringify(
    {
      stripsWired: strips.map((s) => ({ name: s, ok: page.includes(s) })),
      autoPdfWired: autoPdfs.map((s) => ({ name: s, ok: page.includes(s) })),
      hasGeneratePanel: page.includes('ReportGeneratePanel'),
      hasImport: page.includes('Import registry') || page.includes('importTemplates'),
      hasBrowseList: page.includes('ReportCatalogBrowseList'),
      hasResolveAny: page.includes('hasAnyFormatUiLayout'),
    },
    null,
    2,
  ),
);
