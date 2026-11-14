/**
 * Compare local report catalogues vs FRESA_REFERENCE_* inventories.
 * Run: node scripts/report-official-format-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const qa = path.join(root, 'src/features/reports/qa');

const inv = JSON.parse(fs.readFileSync(path.join(qa, 'FRESA_REFERENCE_INVENTORY.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(qa, 'FRESA_REFERENCE_MAPPING.json'), 'utf8'));
const pdfVal = JSON.parse(fs.readFileSync(path.join(qa, 'FRESA_PDF_VALIDATION.json'), 'utf8'));
const matrix = JSON.parse(fs.readFileSync(path.join(qa, 'FRESA_REPORT_FAMILY_MATRIX.json'), 'utf8'));

function extractCodesFromTs(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, 'utf8');
  return [...text.matchAll(/"code"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
}

function extractRegistryCodes() {
  const p = path.join(root, 'src/features/reports/data/fresaReportRegistry.json');
  const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  const arr = Array.isArray(raw) ? raw : raw.entries || raw.reports || [];
  return arr.map((e) => String(e.code || '').trim()).filter(Boolean);
}

const OFFICIAL_HAWB = new Set([
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
]);

const familyOf = (code) => {
  const c = code.toUpperCase();
  if (c.startsWith('HAWB_') || c.includes('HOUSE_AIR')) return 'HAWB';
  if (c.startsWith('MAWB_') || c.includes('MASTER_AIR')) return 'MAWB';
  if (c.includes('HBL') || c.startsWith('FG_HBL')) return 'HBL';
  if (c.includes('ARRIVAL_NOTICE')) return 'Arrival Notice';
  if (c.includes('DELIVERY_ORDER')) return 'Delivery order';
  if (c.includes('ASN') || c.includes('WMS_')) return 'WMS – ASN';
  if (c.includes('INVOICE') || c.includes('PROFORMA') || c.includes('DEBIT_NOTE')) return 'Invoice Formats';
  if (c.includes('OUTSTANDING') || c.includes('LEDGER') || c.includes('VOUCHER') || c.includes('PROFIT'))
    return 'Accounts other Formats';
  if (c.includes('MANIFEST')) return 'Manifests';
  return 'Other Reports';
};

const pdfByRef = new Map();
for (const e of pdfVal.entries || []) {
  pdfByRef.set(e.referenceId, e);
}

const mapByCode = new Map();
for (const m of map.mappings || []) {
  const code = String(m.freightnestCode || m.code || '').toUpperCase();
  if (!code) continue;
  if (!mapByCode.has(code)) mapByCode.set(code, []);
  mapByCode.get(code).push(m);
}

const officialBySection = {};
for (const e of inv.entries || []) {
  const s = e.catalogueSection || 'unknown';
  officialBySection[s] = (officialBySection[s] || 0) + 1;
}

const localSources = {
  hawbLayouts: extractCodesFromTs(
    path.join(root, 'src/features/reports/data/hawbFormatUiLayouts.generated.ts'),
  ),
  hblLayouts: extractCodesFromTs(
    path.join(root, 'src/features/reports/data/hblFormatUiLayouts.generated.ts'),
  ),
  invoiceLayouts: extractCodesFromTs(
    path.join(root, 'src/features/reports/data/invoiceFormatUiLayouts.generated.ts'),
  ),
  registry: extractRegistryCodes(),
};

// Expand HAWB local = registry HAWB_* + layouts
const hawbLocal = new Set([
  ...localSources.registry.filter((c) => c.startsWith('HAWB_')),
  ...localSources.hawbLayouts.filter((c) => c.startsWith('HAWB_')),
]);

function classify(code) {
  const maps = mapByCode.get(code.toUpperCase()) || [];
  const m = maps[0];
  if (!m) {
    if (code.startsWith('HAWB_') && !OFFICIAL_HAWB.has(code)) {
      return {
        status: 'unverified',
        reason: 'HAWB code not in official 5-entry Fresa HAWB set; sample likely shared fallback',
      };
    }
    return { status: 'unverified', reason: 'No FRESA_REFERENCE_MAPPING entry' };
  }
  const pdf = pdfByRef.get(m.referenceId);
  const conf = String(m.confidence || m.mappingConfidence || m.mappingStatus || '').toLowerCase();
  if (conf.includes('ambiguous') || m.ambiguous) {
    return { status: 'ambiguous', reason: 'Mapping marked ambiguous', referenceId: m.referenceId };
  }
  if (maps.length > 1) {
    return {
      status: 'duplicate',
      reason: `Multiple mapping rows (${maps.length})`,
      referenceId: m.referenceId,
    };
  }
  if (!pdf || pdf.validPdf === false) {
    return {
      status: 'official_reference_unavailable',
      reason: 'Official mapping exists but PDF invalid/missing',
      referenceId: m.referenceId,
    };
  }
  if (pdf.likelyBlankOrStub) {
    return {
      status: 'official_reference_unavailable',
      reason: 'Reference PDF classified as blank/stub',
      referenceId: m.referenceId,
    };
  }
  if (pdf.verificationStatus && String(pdf.verificationStatus).includes('broken')) {
    return {
      status: 'official_reference_unavailable',
      reason: pdf.verificationStatus,
      referenceId: m.referenceId,
    };
  }
  return {
    status: 'official_verified',
    reason: 'Mapped + valid local PDF',
    referenceId: m.referenceId,
    fresaName: m.fresaName,
  };
}

const hawbRows = [...hawbLocal].sort().map((code) => {
  const c = classify(code);
  const official = OFFICIAL_HAWB.has(code);
  let recommendedAction = 'mark_unverified_hide_from_primary_catalogue';
  if (official && c.status === 'official_verified') recommendedAction = 'keep_and_use';
  else if (official && c.status === 'official_reference_unavailable')
    recommendedAction = 'keep_mark_reference_unavailable';
  else if (!official && code.match(/^HAWB_DRAFT_REPORT_FORMAT_\d+$/))
    recommendedAction = 'hide_from_user_catalogue_preserve_code';
  else if (!official) recommendedAction = 'hide_from_user_catalogue_preserve_code';
  return {
    reportCode: code,
    family: 'HAWB',
    officialCatalogueMatch: official,
    ...c,
    recommendedAction,
  };
});

// Broader: sample of registry by family
const familyCounts = {};
for (const code of localSources.registry) {
  const f = familyOf(code);
  familyCounts[f] = familyCounts[f] || { localRegistry: 0, mapped: 0, verified: 0, unverified: 0 };
  familyCounts[f].localRegistry++;
  const c = classify(code);
  if (mapByCode.has(code.toUpperCase())) familyCounts[f].mapped++;
  if (c.status === 'official_verified') familyCounts[f].verified++;
  else if (c.status === 'unverified' || c.status === 'unsupported') familyCounts[f].unverified++;
}

// Duplicate URL groups from inventory
const urlGroups = {};
for (const e of inv.entries || []) {
  const u = e.sampleUrl || '';
  if (!u) continue;
  urlGroups[u] = urlGroups[u] || [];
  urlGroups[u].push({
    referenceId: e.referenceId,
    fresaName: e.fresaName,
    section: e.catalogueSection,
  });
}
const duplicateUrls = Object.entries(urlGroups)
  .filter(([, rows]) => rows.length > 1)
  .map(([url, rows]) => ({ url, count: rows.length, entries: rows }));

// Official codes missing locally (by mapping freightnestCode)
const mappedCodes = new Set([...(map.mappings || []).map((m) => String(m.freightnestCode || '').toUpperCase())]);
const registrySet = new Set(localSources.registry.map((c) => c.toUpperCase()));
const officialMissingLocally = [...mappedCodes].filter((c) => c && !registrySet.has(c)).slice(0, 200);

const out = {
  generatedAt: new Date().toISOString(),
  sourceUrl: inv.sourceUrl,
  officialInventory: {
    totalEntries: (inv.entries || []).length,
    bySection: officialBySection,
    summary: {
      withDirectPdfUrl: inv.withDirectPdfUrl,
      urlVerifiedLocal: inv.urlVerifiedLocal,
      broken: inv.broken,
      ambiguous: inv.ambiguous,
      duplicateUrl: inv.duplicateUrl,
      mapped: inv.mapped,
      unmapped: inv.unmapped,
    },
  },
  localCounts: {
    registryTotal: localSources.registry.length,
    hawbLayouts: localSources.hawbLayouts.length,
    hblLayouts: localSources.hblLayouts.length,
    invoiceLayouts: localSources.invoiceLayouts.length,
    hawbLocalDistinct: hawbLocal.size,
    officialHawbDistinct: OFFICIAL_HAWB.size,
  },
  familyMatrixNote: matrix.summary || matrix.notes || null,
  familyCounts,
  hawbDiscrepancy: {
    officialFresaHawbCodes: [...OFFICIAL_HAWB],
    localHawbCodes: [...hawbLocal].sort(),
    note: 'Official catalogue lists 4 numbered HAWB drafts/originals (+ base draft = 5 CDN PDFs). Shipment Freight Manifest is NOT HAWB.',
    rows: hawbRows,
  },
  duplicateSampleUrls: {
    count: duplicateUrls.length,
    top: duplicateUrls.slice(0, 40),
  },
  officialMappedMissingFromRegistry: {
    count: officialMissingLocally.length,
    sample: officialMissingLocally.slice(0, 50),
  },
  classificationLegend: [
    'official_verified',
    'official_reference_unavailable',
    'ambiguous',
    'unverified',
    'duplicate',
    'unsupported',
  ],
};

const outPath = path.join(qa, 'REPORT_OFFICIAL_FORMAT_AUDIT.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

const dupPath = path.join(qa, 'REPORT_FORMAT_DUPLICATE_AUDIT.json');
const dupOut = {
  generatedAt: out.generatedAt,
  policy: 'Non-destructive. No merges/deletes without approval.',
  duplicateSampleUrlGroups: duplicateUrls,
  hawbFallbackDuplicates: hawbRows.filter((r) => !r.officialCatalogueMatch),
  multipleLocalIdsSameOfficial: hawbRows
    .filter((r) => r.officialCatalogueMatch)
    .map((r) => ({
      officialCode: r.reportCode,
      note: 'Canonical official HAWB entry — extras Format-3+ share sample PDF',
    })),
};
fs.writeFileSync(dupPath, JSON.stringify(dupOut, null, 2));

console.log(JSON.stringify({
  wrote: [outPath, dupPath],
  hawbLocal: hawbLocal.size,
  hawbOfficial: OFFICIAL_HAWB.size,
  hawbUnverified: hawbRows.filter((r) => r.status === 'unverified').length,
  duplicateUrlGroups: duplicateUrls.length,
  registry: localSources.registry.length,
  officialEntries: (inv.entries || []).length,
}, null, 2));
