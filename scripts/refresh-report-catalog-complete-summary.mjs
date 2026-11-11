/**
 * Refresh inventory summary fields on fresaReportCatalogComplete.json
 * from live registry + FormatUiLayouts JSON object counts.
 * Does not delete report rows.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const dataDir = path.join(root, 'src/features/reports/data');
const completePath = path.join(dataDir, 'fresaReportCatalogComplete.json');

const stores = [
  'hblFormatUiLayouts',
  'hawbFormatUiLayouts',
  'invoiceFormatUiLayouts',
  'accountsFormatUiLayouts',
  'wmsFormatUiLayouts',
  'arrivalNoticeFormatUiLayouts',
  'deliveryOrderFormatUiLayouts',
  'opsListFormatUiLayouts',
  'otherReportsFormatUiLayouts',
  'quotationFormatUiLayouts',
  'commercialExtraFormatUiLayouts',
  'seaDocsExtraFormatUiLayouts',
  'leftoverFormatUiLayouts',
];

function countCodes(fileBase) {
  const j = JSON.parse(fs.readFileSync(path.join(dataDir, `${fileBase}.json`), 'utf8'));
  const arr = Array.isArray(j) ? j : j.layouts || j.items || [];
  return new Set(arr.map((x) => String(x.code || '').toUpperCase()).filter(Boolean)).size;
}

const reg = JSON.parse(fs.readFileSync(path.join(dataDir, 'fresaReportRegistry.json'), 'utf8'));
const byFamily = {};
const byStatus = {};
const bySuggestedPackKey = {};
for (const r of reg) {
  byFamily[r.family] = (byFamily[r.family] || 0) + 1;
  byStatus[r.gapStatus] = (byStatus[r.gapStatus] || 0) + 1;
  if (r.suggestedPackKey) {
    bySuggestedPackKey[r.suggestedPackKey] = (bySuggestedPackKey[r.suggestedPackKey] || 0) + 1;
  }
}

const byLayoutStore = {};
let uniqueJsonLayouts = 0;
for (const s of stores) {
  const n = countCodes(s);
  byLayoutStore[s] = n;
  uniqueJsonLayouts += n;
}

const complete = JSON.parse(fs.readFileSync(completePath, 'utf8'));
complete.generatedAt = new Date().toISOString();
complete.source = 'fresaReportRegistry.json + *FormatUiLayouts.json (refresh-report-catalog-complete-summary.mjs)';
complete.totals = {
  reports: reg.length,
  withClientLayout: reg.filter((r) => r.hasClientLayout).length,
  layoutStores: stores.length,
  suggestedPackKeys: Object.keys(bySuggestedPackKey).length,
  uniqueJsonLayoutObjects: uniqueJsonLayouts,
  note: 'uniqueJsonLayoutObjects can be < reports when codes alias shared shells',
};
complete.byFamily = byFamily;
complete.byStatus = byStatus;
complete.byLayoutStore = byLayoutStore;
complete.bySuggestedPackKey = bySuggestedPackKey;

fs.writeFileSync(completePath, `${JSON.stringify(complete, null, 2)}\n`);
console.log(
  `Updated ${completePath}: reports=${reg.length} uniqueJson=${uniqueJsonLayouts} packs=${Object.keys(bySuggestedPackKey).length}`,
);
