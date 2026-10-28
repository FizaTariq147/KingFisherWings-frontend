/**
 * Registry reconciliation — counts only, no mutations.
 * Usage: node scripts/reconcile-fresa-registry.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

const STORES = [
  'invoiceFormatUiLayouts.json',
  'accountsFormatUiLayouts.json',
  'wmsFormatUiLayouts.json',
  'arrivalNoticeFormatUiLayouts.json',
  'deliveryOrderFormatUiLayouts.json',
  'hawbFormatUiLayouts.json',
  'hblFormatUiLayouts.json',
  'otherReportsFormatUiLayouts.json',
  'quotationFormatUiLayouts.json',
  'opsListFormatUiLayouts.json',
  'commercialExtraFormatUiLayouts.json',
  'seaDocsExtraFormatUiLayouts.json',
  'leftoverFormatUiLayouts.json',
];

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function headJson(rel) {
  try {
    return JSON.parse(
      execSync(`git show HEAD:${rel}`, {
        encoding: 'utf8',
        maxBuffer: 80 * 1024 * 1024,
        cwd: root,
      }),
    );
  } catch {
    return null;
  }
}

function codesOf(rows) {
  return new Set((Array.isArray(rows) ? rows : []).map((r) => r.code).filter(Boolean));
}

const inv = loadJson(path.join(dataDir, 'FRESA_REFERENCE_INVENTORY.json')) || {};
const fp = loadJson(path.join(dataDir, 'FRESA_REFERENCE_FINGERPRINTS.json')) || {};
const summary = inv.summary || {};
const reports = Array.isArray(inv.reports) ? inv.reports : [];

const links = [...new Set(inv.pageDirectPdfLinks || [])];
const pdfUrls = links.filter((u) => /\.pdf(\?|#|$)/i.test(u));
const xlsxUrls = links.filter((u) => /\.xlsx?(\?|#|$)/i.test(u));
const otherUrls = links.filter((u) => !/\.(pdf|xlsx?)(\?|#|$)/i.test(u));

const access = {};
const impl = {};
for (const r of reports) {
  access[r.accessStatus || 'unknown'] = (access[r.accessStatus || 'unknown'] || 0) + 1;
  impl[r.implementationStatus || 'unknown'] =
    (impl[r.implementationStatus || 'unknown'] || 0) + 1;
}

const byExtFromDownload = { pdf: 0, xlsx: 0, other: 0, none: 0 };
for (const r of reports) {
  const url = (r.candidateUrls || [])[0] || '';
  if (r.accessStatus !== 'downloaded') {
    if (!url) byExtFromDownload.none += 1;
    else if (/\.xlsx?/i.test(url)) byExtFromDownload.xlsx += 1;
    else if (/\.pdf/i.test(url)) byExtFromDownload.other += 1; // failed pdf attempt
    else byExtFromDownload.other += 1;
    continue;
  }
  if (/\.xlsx?/i.test(r.downloadedPath || url)) byExtFromDownload.xlsx += 1;
  else if (/\.pdf/i.test(r.downloadedPath || url)) byExtFromDownload.pdf += 1;
  else byExtFromDownload.other += 1;
}

const pdfDir = path.join(root, 'tmp/fresa-references/pdfs');
const diskPdfs = fs.existsSync(pdfDir)
  ? fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
  : [];

let headTotal = 0;
let curTotal = 0;
const headCodes = new Set();
const curCodes = new Set();
const byStore = [];

for (const s of STORES) {
  const rel = `src/features/reports/data/${s}`;
  const head = headJson(rel) || [];
  const cur = loadJson(path.join(dataDir, s)) || [];
  const hc = codesOf(head);
  const cc = codesOf(cur);
  headTotal += head.length;
  curTotal += cur.length;
  hc.forEach((c) => headCodes.add(c));
  cc.forEach((c) => curCodes.add(c));
  byStore.push({
    store: s,
    headCount: head.length,
    currentCount: cur.length,
    delta: cur.length - head.length,
  });
}

const removed = [...headCodes].filter((c) => !curCodes.has(c)).sort();
const added = [...curCodes].filter((c) => !headCodes.has(c)).sort();

const visualManifest = loadJson(
  path.join(dataDir, 'FRESA_VISUAL_DIFF_MANIFEST.json'),
);
const visuallyVerified = visualManifest?.passed?.length || 0;
const visuallyFailed = visualManifest?.failed?.length || 0;
const visuallySkipped = visualManifest?.skipped?.length || 0;

const out = {
  generatedAt: new Date().toISOString(),
  definitions: {
    discoveredReportNames:
      'Unique display names scraped / curated from the Fresa sample page (not registry size).',
    registeredLayouts:
      'Local JSON layout definitions across all *FormatUiLayouts.json stores (stable report IDs).',
    validReferencePdfs:
      'Downloaded PDF files fingerprint-classified as non-stub (usable for visual-diff).',
    xlsxReferences: 'Sample assets that are spreadsheets, not PDF document layouts.',
    visuallyVerified:
      'Reports that passed page-image visual-diff against their matched reference (not structural uniqueness).',
  },
  counts: {
    pageNameCount: inv.pageNameCount ?? null,
    curatedNameCount: inv.curatedNameCount ?? null,
    uniqueDiscoveredNames: inv.uniqueNameCount ?? summary.totalDiscoveredNames ?? null,
    inventoryRows: summary.totalInventoryRows ?? reports.length,
    uniqueSourceUrlsOnPage: links.length,
    uniquePdfUrlsOnPage: pdfUrls.length,
    uniqueXlsxUrlsOnPage: xlsxUrls.length,
    otherPageUrls: otherUrls.length,
    downloadedReferences: summary.downloadedReferences ?? access.downloaded ?? null,
    unavailableReferences: summary.unavailableReferences ?? access.unavailable ?? null,
    diskPdfFiles: diskPdfs.length,
    fingerprintOkPdfs: fp.ok ?? fp.summary?.ok ?? null,
    fingerprintStubPdfs: fp.stubs ?? fp.summary?.stubs ?? null,
    uniqueReferenceFingerprints: fp.uniqueFingerprints ?? null,
    identicalReferenceGroups: Array.isArray(fp.identicalReferenceGroups)
      ? fp.identicalReferenceGroups.length
      : fp.identicalReferenceGroups ?? null,
    matchedLocalLayouts: summary.matchedLocalLayouts ?? null,
    missingLocalLayouts: summary.missingLocalLayouts ?? null,
    registryAtHead: headTotal,
    registryCurrent: curTotal,
    registryUniqueCodesHead: headCodes.size,
    registryUniqueCodesCurrent: curCodes.size,
    codesRemovedSinceHead: removed.length,
    codesAddedSinceHead: added.length,
    visuallyVerified,
    visuallyFailed,
    visuallySkippedUnverified: visuallySkipped,
  },
  accessStatusBreakdown: access,
  implementationStatusBreakdown: impl,
  registryByStore: byStore,
  removalAnalysis: {
    note:
      'Previous 816→702 drop was HAWB (−25) + HBL (−89) store rebuilds to marketing-page-only lists — not leftover purge (leftover stayed 83). Restore script returned HAWB/HBL to HEAD counts while keeping current official Fresa-page layout bodies.',
    removedSample: removed.slice(0, 40),
    addedSample: added.slice(0, 40),
  },
  backups: {
    gitBranch: 'backup/fresa-pre-registry-recovery-20261028-143245',
    filesCopyHint: 'tmp/backups/fresa-registry-*',
  },
  successCriteriaReminder:
    'Structural uniqueness (702 unique shells) is NOT visual fidelity. Only FRESA_VISUAL_DIFF_MANIFEST pass entries count as visually verified.',
};

fs.writeFileSync(
  path.join(dataDir, 'FRESA_REGISTRY_RECONCILIATION.json'),
  `${JSON.stringify(out, null, 2)}\n`,
);

const md = `# Fresa registry reconciliation

Generated: ${out.generatedAt}

## Separate counts (do not interchange)

| Metric | Count | Meaning |
|--------|------:|---------|
| Distinct discovered names | ${out.counts.uniqueDiscoveredNames} | Fresa page / curated name set |
| Page name scrape | ${out.counts.pageNameCount} | Raw names from page HTML |
| Unique source URLs on page | ${out.counts.uniqueSourceUrlsOnPage} | Direct hrefs collected |
| PDF URLs on page | ${out.counts.uniquePdfUrlsOnPage} | \`.pdf\` hrefs |
| XLSX URLs on page | ${out.counts.uniqueXlsxUrlsOnPage} | Spreadsheet hrefs |
| Downloaded references | ${out.counts.downloadedReferences} | Inventory rows with a saved file |
| Unavailable / failed | ${out.counts.unavailableReferences} | No usable download |
| Disk PDF files | ${out.counts.diskPdfFiles} | Files under \`tmp/fresa-references/pdfs/\` |
| Fingerprint OK PDFs | ${out.counts.fingerprintOkPdfs} | Usable for visual-diff |
| Fingerprint stub PDFs | ${out.counts.fingerprintStubPdfs} | Too small / invalid |
| Unique ref fingerprints | ${out.counts.uniqueReferenceFingerprints} | Distinct reference structures |
| Registry @ HEAD | ${out.counts.registryAtHead} | Layout defs in last commit |
| Registry current | ${out.counts.registryCurrent} | Layout defs in working tree |
| Visually verified | ${out.counts.visuallyVerified} | Passed page-image diff |
| Visually failed | ${out.counts.visuallyFailed} | Failed page-image diff |
| Unverified / skipped | ${out.counts.visuallySkippedUnverified} | No ref or not yet compared |

## Why the registry changed

${out.removalAnalysis.note}

Codes still missing vs HEAD: **${removed.length}**. Codes added vs HEAD: **${added.length}**.

## Destructive scripts

\`fresa:fix-shells\`, leftover purge, and uniquify are **quarantined** (require \`FRESA_ALLOW_DESTRUCTIVE=1\`). Do not use shell uniqueness as a success metric.

## Backups

- Git branch: \`${out.backups.gitBranch}\`
- File copy: \`${out.backups.filesCopyHint}\`
`;

fs.writeFileSync(path.join(dataDir, 'FRESA_REGISTRY_RECONCILIATION.md'), md);
console.log(JSON.stringify(out.counts, null, 2));
console.log(`Wrote ${path.join(dataDir, 'FRESA_REGISTRY_RECONCILIATION.md')}`);
