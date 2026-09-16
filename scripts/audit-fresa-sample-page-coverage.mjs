/**
 * Compare Fresa sample-report-formats page dump vs integrated format catalogs.
 * Read-only audit — does not change app code.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath =
  process.argv[2] ||
  path.join(
    process.env.USERPROFILE || '',
    '.cursor/projects/d-KingFisherWings-frontend/agent-tools/2d1b994d-9ba5-4378-8248-a83e1e0527d3.txt',
  );

const SITE_CHROME = new Set(
  [
    'Privacy Policy',
    'Usage Policy',
    'Support',
    'Reviews',
    'Blog',
    'eBooks',
    'Careers',
    'Webinar',
    'Service Network',
    'Fresa Partner',
    'Fresa Milestone',
    'Awards',
    'Client Success',
    'Open Source',
    'Domain Registration',
    'Dedicated Hosting',
    'SEO',
    'Marketing',
  ].map((s) => s.toLowerCase()),
);

const KEEP_KEYWORDS =
  /Report|Invoice|Format|Notice|Quotation|Manifest|HAWB|HBL|MAWB|ASN|WMS/i;

/** Explicit page name → catalog name (known integrated FG / marketing aliases). */
const PAGE_TO_CATALOG = {
  'Collection/Delivery Note -Jasper UK': 'FG Delivery Note Format UK',
  'Consignment Delivery Note': 'FG Consignment Delivery Note',
  'Consignment Delivery Note Format1': 'FG Consignment Delivery Note Format-1',
  'D.O FCL Vietnam': 'Delivery Order FCL Vietnam',
  'D.O LCL Vietnam without Stamp': 'Delivery Order LCL Vietnam Without Stamp',
  'Delivery Confirmation –OSA': 'Delivery Confirmation OSA Report Format',
  'Delivery NOC Letter Jasper': 'FG Delivery NOC Letter',
  'Delivery Note Format 1 -Jasper': 'FG Delivery Note Format-1',
  'Delivery Note Jasper': 'FG Delivery Note',
  'Delivery Order –Format 17': 'Delivery Order Report Format-17',
  'Delivery Order –Format16': 'Delivery Order Report Format-16 (House)',
  'Delivery Order Abu Dhabi –Jasper': 'FG Delivery Order Abu Dhabi',
  'Delivery Order Air Jasper': 'Delivery Order AIR Jasper Report Format',
  'Delivery Order Air Jasper –Format1': 'FG Delivery Order Air Format-1',
  'Delivery Order Air Jasper –Format2': 'FG Delivery Order Air Format-2',
  'Delivery Order Jasper (SEA) –Format 8': 'Delivery Order Report Format-8 (FG SEA)',
  'Delivery Order Jasper –Courier': 'Delivery Order Report Format-10',
  'Delivery Order Jasper –Format 10': 'FG Delivery Order SEA Format-10',
  'Delivery Order Jasper –Format 3': 'FG Delivery Order SEA Format-3',
  'Delivery Order Jasper –Format 5': 'FG Delivery Order SEA Format-5',
  'Delivery Order Jasper –Format 6': 'FG Delivery Order SEA Format-6',
  'Delivery Order Jasper –Format 7': 'FG Delivery Order SEA Format-7',
  'Delivery Order Jasper –Format 8': 'FG Delivery Order Format-8',
  'Delivery Order Jasper –Format 9': 'Delivery Order Report Format-9',
  'Delivery Order Jasper –Format13 USA': 'Delivery Order Report Format-13',
  'Delivery Order Jasper –Format14 USA': 'Delivery Order Report Format-14',
  'Delivery Order Jasper –Format15': 'Delivery Order Report Format-15',
  'Delivery Order Jasper –Format16 US': 'FG Delivery Order Format-16',
  'Delivery Order Jasper –Format18': 'Delivery Order Report Format-18',
  'Delivery Order Sea Jasper –Format1': 'FG Delivery Order SEA Format-1',
  'Delivery Order USA –Jasper format 2': 'Delivery Order Report Format-3',
  'Delivery Order USA Air Jasper': 'FG Delivery Order Air USA',
  'Delivery Order for Trucker': 'FG Delivery Order For Trucker',
  'E-Delivery Order Jasper': 'FG E-Delivery Order',
  'Electronic Delivery Order Jasper –Format 1': 'FG E-Delivery Order SEA Format-1',
  'Export Delivery Order Jasper': 'FG Export Delivery Order',
  'Notice of Delivery –Jasper': 'FG Notice Of Delivery',
  'Proof of Delivery Jasper Arabic': 'FG Proof Of Delivery / HBL PLMAAJEA00081',
  'Arrival Confirmation Format1': 'Arrival Confirmation Format-1',
  'Arrival Information –Jasper': 'FG Arrival Information',
  'Arrival Notice USA –Jasper': 'FG Arrival Notice',
  'Arrival Notice USA –Jasper format 2': 'FG Arrival Notice Format-2',
  'Arrival Notice USA –Jasper format 2 without charges': 'FG Arrival Notice Without Charges',
  'Arrival Notice USA –Jasper format 3': 'FG Arrival Notice Format-3',
  'Cargo Arrival Notice –Air': 'Cargo Arrival Notice Air Report Format',
  'Cargo Arrival Notice –Air Without Charges':
    'Cargo Arrival Notice Air Without Charges Report Format',
  'Cargo Arrival Notice –Jasper': 'FG Cargo Arrival Notice',
  'Cargo Arrival Notice –Jasper format 1': 'FG Cargo Arrival Notice Format-1',
  'Cargo Arrival Notice –Sea': 'FG Cargo Arrival Notice SEA',
  'Cargo Arrival Notice –Sea –Jasper': 'FG Cargo Arrival Notice SEA',
  'Cargo Arrival Notice –Sea Format 2': 'Cargo Arrival Notice SEA Format-2',
  'Cargo Arrival Notice –Sea Format 3': 'Cargo Arrival Notice SEA Format-3',
  'Cargo Arrival Notice –Sea Format1': 'Cargo Arrival Notice SEA Format-1',
  'Cargo Arrival Notice –Sea Without Charges Format1':
    'Cargo Arrival Notice SEA Without Charges Format-1',
  'Sea Arrival Notice LCL Vietnam': 'SEA Arrival Notice LCL Vietnam',
  'cargo arrival notice sea format3 Jasper': 'FG Cargo Arrival Notice SEA Format-3',
  'HBL Draft- Jasper format 1': 'FG HBL Format-1',
  // HBL Draft – Jasper format 69 / 89: not in catalogs — leave unmapped (remain missing)
  'Transhipment List Report Format': 'Transshipment List Report Format',
  'Booking Confirmation Report Format-1 Booking Confirmation':
    'Booking Confirmation Report Format-1',
  'Booking Confirmation Report Format-2 Booking Confirmation':
    'Booking Confirmation Report Format-2',
  'Pre Alert to Client Report Format': 'Pre Alert To Client Report Format',
  'Advance Shipping Note Location Wise- 1': 'Advance Shipping Note Location Wise-2',
  'Advance Shipping Note Location Summary': 'Advance Shipping Note Summary',
  'Land Freight/ Transportation Invoice': 'Invoice Report Format Land Freight Transportation',
  'Simple Invoice': 'Invoice Report Format-7 Simple Invoice',
  'Summary Invoice': 'Invoice Report Format-3 Summary Invoice',
  'Standard Invoice': 'Invoice Report Format-10 Standard Invoice',
  'Standard Invoice USA': 'Invoice Report Format-9 Standard Invoice USA',
  'Warehouse Invoice': 'Invoice Report Format-21 Warehouse Invoice',
  'Proforma Invoice All Charges Report Format':
    'Invoice Report Format-71 Proforma Invoice All Charges',
};

/** Extra catalog targets to try for multi-option aliases. */
const PAGE_TO_CATALOG_EXTRA = {
  'Delivery Order Air Jasper': ['FG Delivery Order Air Jasper'],
  'Cargo Arrival Notice –Air': ['FG Cargo Arrival Notice Air'],
  'Land Freight/ Transportation Invoice': [
    'Invoice Report Format-18 Land Freight Transportation Invoice',
  ],
};

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[().,/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSiteChrome(name) {
  if (SITE_CHROME.has(name.toLowerCase())) return true;
  if (name.length < 8 && !KEEP_KEYWORDS.test(name)) return true;
  return false;
}

function extractNames(htmlLike) {
  const names = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+|\#)\)/g;
  let m;
  while ((m = re.exec(htmlLike))) {
    const name = m[1].trim();
    if (!name || name.startsWith('!')) continue;
    if (/Fresa Technologies|Skip to content|Enquiry|Login/i.test(name)) continue;
    if (name.length < 3) continue;
    if (isSiteChrome(name)) continue;
    names.push(name);
  }
  return [...new Set(names)];
}

/** Names that appear in the main 4-column table (lines `1.|` … `73.|`). */
function extractMainTableNames(htmlLike) {
  const names = new Set();
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+|\#)\)/g;
  for (const line of htmlLike.split(/\r?\n/)) {
    if (!/^\d+\.\|/.test(line)) continue;
    let m;
    const lineRe = new RegExp(re.source, 'g');
    while ((m = lineRe.exec(line))) {
      const name = m[1].trim();
      if (!name || name.startsWith('!')) continue;
      if (isSiteChrome(name)) continue;
      names.add(name);
    }
  }
  return names;
}

function collectIntegratedNames() {
  const files = [
    'src/features/reports/constants/otherReportsFormatCatalog.ts',
    'src/features/reports/constants/accountsFormatCatalog.ts',
    'src/features/reports/constants/deliveryOrderFormatCatalog.ts',
    'src/features/reports/constants/arrivalNoticeFormatCatalog.ts',
    'src/features/reports/constants/hawbFormatCatalog.ts',
    'src/features/reports/constants/hblFormatCatalog.ts',
    'src/features/reports/constants/wmsFormatCatalog.ts',
    'src/features/reports/constants/invoiceFormatCatalogNames.ts',
  ];
  const names = new Set();
  for (const rel of files) {
    const text = fs.readFileSync(path.join(root, rel), 'utf8');
    for (const m of text.matchAll(/name:\s*'([^']+)'/g)) names.add(m[1]);
    for (const m of text.matchAll(/name:\s*`([^`]+)`/g)) {
      // skip template literals with ${}
      if (!m[1].includes('${')) names.add(m[1]);
    }
    for (const m of text.matchAll(/:\s*'([^']*Report Format[^']*)'/g)) names.add(m[1]);
    for (const m of text.matchAll(/:\s*'([^']*Invoice[^']*)'/g)) names.add(m[1]);
  }
  // Expand HBL draft numbers present via spreads
  const hbl = fs.readFileSync(path.join(root, 'src/features/reports/constants/hblFormatCatalog.ts'), 'utf8');
  for (const m of hbl.matchAll(/HBL_DRAFT_REPORT_FORMAT_(\d+)/g)) {
    names.add(`HBL Draft Report Format-${m[1]}`);
  }
  for (const n of [
    97, 99, 100, 101, 102, 107, 109, 114, 116, 117, 118, 120, 122, 127, 128, 129, 130, 132, 134,
    135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 151, 171, 172,
    2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]) {
    names.add(`HBL Draft Report Format-${n}`);
  }
  // Registry also counts as "in system" for list reports
  const reg = fs.readFileSync(
    path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'),
    'utf8',
  );
  for (const m of reg.matchAll(/"name":\s*"([^"]+)"/g)) names.add(m[1]);
  return names;
}

function lookupExplicitAlias(pageName) {
  if (PAGE_TO_CATALOG[pageName]) return PAGE_TO_CATALOG[pageName];
  // dash / en-dash tolerant key lookup
  const pn = norm(pageName);
  for (const [k, v] of Object.entries(PAGE_TO_CATALOG)) {
    if (norm(k) === pn) return v;
  }
  return null;
}

function aliases(name) {
  const n = name;
  const out = new Set([n]);
  const explicit = lookupExplicitAlias(n);
  if (explicit) out.add(explicit);
  const extras = PAGE_TO_CATALOG_EXTRA[n] || PAGE_TO_CATALOG_EXTRA[
    Object.keys(PAGE_TO_CATALOG_EXTRA).find((k) => norm(k) === norm(n))
  ];
  if (extras) for (const e of extras) out.add(e);

  // common page vs catalog spelling variants
  out.add(n.replace(/Transhipment/i, 'Transshipment'));
  out.add(n.replace(/Transshipment/i, 'Transhipment'));
  out.add(n.replace(/Pre Alert to Client/i, 'Pre Alert To Client'));
  out.add(
    n.replace(
      /Booking Confirmation Report Format-(\d) Booking Confirmation/i,
      'Booking Confirmation Report Format-$1',
    ),
  );
  out.add(n.replace(/Advance Shipping Note Location Wise-\s*1/i, 'Advance Shipping Note Location Wise-2'));
  out.add(n.replace(/Advance Shipping Note Location Wise-2/i, 'Advance Shipping Note Location Wise- 1'));
  out.add(n.replace(/Advance Shipping Note Location Summary/i, 'Advance Shipping Note Summary'));
  return [...out];
}

function isMatched(pageName, integrated) {
  for (const a of aliases(pageName)) {
    if (integrated.has(a)) return true;
  }
  const pn = norm(pageName);
  for (const integ of integrated) {
    const inn = norm(integ);
    if (inn === pn) return true;
    // contain either way for long FG aliases
    if (pn.length > 12 && (inn.includes(pn) || pn.includes(inn))) return true;
  }
  // HBL Jasper format N ↔ HBL Draft Report Format-N
  const hblJ =
    pageName.match(/HBL Draft.*?format\s*(\d+)/i) ||
    pageName.match(/HBL Original.*?format\s*(\d+)/i);
  if (hblJ) {
    const num = hblJ[1];
    if (integrated.has(`HBL Draft Report Format-${num}`)) return true;
    if (integrated.has(`FG HBL Original Format-${num}`)) return true;
    if (integrated.has(`FG HBL Format-${num}`)) return true;
  }
  if (
    /HBL Draft Report Format Jasper/i.test(pageName) ||
    /^HBL Draft-\s*Jasper$/i.test(pageName.trim())
  ) {
    // page #1 jasper — not same as Format-2; treat as missing unless FG HBL HKG or similar
    if (integrated.has('FG HBL HKG') || integrated.has('HBL Draft Report Format Jasper'))
      return 'partial';
  }
  return false;
}

const page = fs.readFileSync(pagePath, 'utf8');
const pageNames = extractNames(page);
const mainTableNames = extractMainTableNames(page);
const integrated = collectIntegratedNames();

const missing = [];
const partial = [];
const matched = [];

for (const name of pageNames) {
  const r = isMatched(name, integrated);
  if (r === 'partial') partial.push(name);
  else if (r) matched.push(name);
  else missing.push(name);
}

missing.sort((a, b) => a.localeCompare(b));
const missingMainTableOnly = missing.filter((n) => mainTableNames.has(n)).sort((a, b) => a.localeCompare(b));

console.log(
  JSON.stringify(
    {
      pageUnique: pageNames.length,
      matched: matched.length,
      partial: partial.length,
      missing: missing.length,
      missingNames: missing,
      missingMainTableOnly,
      partialNames: partial,
    },
    null,
    2,
  ),
);
