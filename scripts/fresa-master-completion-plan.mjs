/**
 * Family-based completion matrix + plan (planning only — no layout edits).
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'tmp/fresa-references/FREIGHTNEST_REFERENCE_MAPPING.json'), 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'tmp/fresa-references/FRESA_REFERENCE_INVENTORY.json'), 'utf8'));
const phase3 = JSON.parse(fs.readFileSync(path.join(root, 'tmp/fresa-references/PHASE3_VISUAL_RESULTS.json'), 'utf8'));

const p3ByCode = Object.fromEntries((phase3.reports || []).map((r) => [r.formatCode, r]));

/** Reports touched / verified in Phase 4 batches 1–13 (preserve existing work). */
const PHASE4_STATUS = {
  ADVANCE_SHIPPING_NOTE: {
    status: 'phase4_polished',
    family: 'ASN_WMS_META_TABLE',
    batch: 'B1-B2,B6-B7',
    remaining: 'Meta/table micro-density; demo≠sample; disclaimer',
  },
  ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM: {
    status: 'regression_control',
    family: 'ARRIVAL_NOTICE_SEA_FCL',
    batch: 'control',
    remaining: 'Not primary polished; use as regression only',
  },
  HBL_DRAFT_REPORT_FORMAT_11: {
    status: 'phase4_polished',
    family: 'HBL_COMBINED_TRANSPORT_SHELL',
    batch: 'B3-B5',
    remaining: 'Cargo well whitespace; do NOT roll hblBlShell to siblings',
  },
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: {
    status: 'phase4_polished',
    family: 'INV_INDIA_GST_WIDE',
    batch: 'B8-B9',
    remaining: 'Tax/amount micro-density; charge Total row = sample data',
  },
  INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA: {
    status: 'phase4_polished',
    family: 'INV_INDIA_LANDSCAPE_METATRIPLE',
    batch: 'B10-B11',
    remaining: 'Meta/charge density; Total row sample-only',
  },
  INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE: {
    status: 'phase4_polished',
    family: 'INV_SUMMARY_SIMPLE_CHARGE',
    batch: 'B12',
    remaining: 'Demo UAE vs India sample; wire-transfer narrative',
  },
  INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE: {
    status: 'phase4_polished',
    family: 'INV_STANDARD_RULES_VAT',
    batch: 'B13',
    remaining: 'Meta field membership polish; wire terms; demo≠sample',
  },
  INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE: {
    status: 'regression_control',
    family: 'INV_STANDARD_TWOCOL_FIELDGRID',
    batch: 'control',
    remaining: 'TwoColumn capture score noise; not primary target',
  },
  INVOICE_REPORT_FORMAT_11_STANDARD_INVOICE_LAND: {
    status: 'regression_control',
    family: 'INV_STANDARD_LAND_TWOCOL',
    batch: 'control',
    remaining: 'Score sensitivity to TwoColumn inline grid',
  },
  JOB_HOUSES_RECORD_LIST_REPORT_FORMAT: {
    status: 'regression_control',
    family: 'OPS_LIST_ORANGE_CHARGE',
    batch: 'control',
    remaining: 'Ops-list family not polished',
  },
};

function sigPrefix(sig, n = 5) {
  return String(sig || '')
    .split('>')
    .slice(0, n)
    .join('>');
}

function proposeFamily(row) {
  const code = row.localCode || '';
  const sig = row.localBlockSignature || '';
  const cat = row.category || 'other';
  const name = (row.referenceName || '').toLowerCase();
  const p5 = sigPrefix(sig, 5);
  const p6 = sigPrefix(sig, 6);

  if (PHASE4_STATUS[code]?.family) return PHASE4_STATUS[code].family;

  // Evidence-backed / signature-heuristic families (must be validated against PDF before mass apply).
  if (sig.includes('hblBlShell') || (code.includes('HBL_DRAFT') && sig.includes('hblCargoTable'))) {
    if (sig.includes('partyNotifyGrid') && sig.includes('hblFreightSignature')) {
      if (name.includes('multi') || name.includes('mtd') || p5.includes('fieldGrid:c2')) {
        return 'HBL_OPEN_SHELL_C2_UNVERIFIED'; // Batch 5: NOT same as Format-11
      }
      if (p5.includes('fieldGrid:c3')) return 'HBL_OPEN_SHELL_C3_UNVERIFIED';
      return 'HBL_OPEN_SHELL_UNVERIFIED';
    }
  }
  if (code.startsWith('HAWB') || sig.includes('hawbRouteGrid')) return 'HAWB_ROUTE_SHELL';
  if (code.startsWith('MAWB')) return 'MAWB_IATA_COPYSET_SPECIAL'; // Phase 3.1: multi-copy, not 1:1 shell

  if (cat === 'invoice' || code.includes('INVOICE')) {
    if (sig.includes('metaTriple') || (name.includes('tax invoice india') && name.includes('format 2'))) {
      return 'INV_INDIA_LANDSCAPE_METATRIPLE';
    }
    if (name.includes('tax invoice india') || sig.includes('indiaSummary') || (sig.includes('chargeTable') && name.includes('india'))) {
      if (name.includes('format 1') || code.includes('FORMAT_1_TAX')) return 'INV_INDIA_GST_WIDE';
      return 'INV_INDIA_TAX_UNVERIFIED';
    }
    if (sig.includes('summaryHero') || name.includes('summary invoice')) return 'INV_SUMMARY_SIMPLE_CHARGE';
    if (sig.includes('subtotalBar:tax') || sig.includes('subtotalBar')) return 'INV_STANDARD_SUBTOTAL_BAR';
    if (sig.includes('twoColumn') && sig.includes('fieldGrid:c2') && sig.includes('chargeTable')) {
      return 'INV_STANDARD_TWOCOL_FIELDGRID';
    }
    if (sig.includes('twoColumn') && sig.includes('fieldGrid:c3')) return 'INV_STANDARD_TWOCOL_FIELDGRID_C3';
    if (sig.includes('partyTriple') && sig.includes('chargeTable')) return 'INV_PARTYTRIPLE_CHARGE';
    if (sig.includes('ksa') || name.includes('arabic') || name.includes('ksa')) return 'INV_KSA_ARABIC';
    if (name.includes('usa') || sig.includes('usaNumberedFields')) return 'INV_USA_NUMBERED';
    if (name.includes('singapore')) return 'INV_SINGAPORE_GST';
    if (name.includes('fcy')) return 'INV_FCY';
    if (name.includes('warehouse')) return 'INV_WAREHOUSE';
    if (name.includes('debit') || name.includes('proforma')) return 'INV_DEBIT_OR_PROFORMA';
    return 'INV_GENERIC_JSON';
  }

  if (cat === 'arrival_notice' || name.includes('arrival')) {
    if (name.includes('vietnam') || name.includes('fcl')) return 'ARRIVAL_NOTICE_SEA_FCL';
    if (name.includes('without charges')) return 'ARRIVAL_NOTICE_WITHOUT_CHARGES';
    if (name.includes('usa')) return 'ARRIVAL_NOTICE_USA';
    if (name.includes('air')) return 'ARRIVAL_NOTICE_AIR';
    return 'ARRIVAL_NOTICE_GENERIC';
  }

  if (cat === 'delivery_order' || name.includes('delivery order') || name.includes('d.o')) {
    if (sig.includes('deliveryOrderRelease')) return 'DO_RELEASE_SHELL';
    return 'DO_GENERIC';
  }

  if (cat === 'ops_list' || name.includes('list report') || p5.includes('chargeTable:orange')) {
    return 'OPS_LIST_ORANGE_CHARGE';
  }

  if (cat === 'accounts' || name.includes('aging') || name.includes('voucher') || name.includes('trial balance') || name.includes('gl ')) {
    if (name.includes('aging')) return 'ACCOUNTS_AGING';
    if (name.includes('voucher')) return 'ACCOUNTS_VOUCHER';
    return 'ACCOUNTS_GENERIC';
  }

  if (cat === 'quotation' || name.includes('quotation')) return 'QUOTATION';

  if (code.includes('ASN') || name.includes('advance shipping')) return 'ASN_WMS_META_TABLE';

  if (sig.includes('letterBody')) return 'LETTER_BODY';
  if (sig.includes('wireBox')) return 'WIRE_BOX_ACCOUNTS';

  return `${cat.toUpperCase()}_UNCLASSIFIED`;
}

function confidenceLabel(row) {
  if (row.matchStatus === 'matched' && (row.matchScore ?? 0) >= 0.95) return 'high';
  if (row.matchStatus === 'matched') return 'medium';
  if (row.matchStatus === 'ambiguous') return 'low';
  if (row.matchStatus === 'missing') return 'n/a_missing_layout';
  return 'n/a_no_reference';
}

function implementationStatus(row, family) {
  const code = row.localCode || '';
  if (PHASE4_STATUS[code]) return PHASE4_STATUS[code].status;
  if (row.matchStatus === 'unsupported_no_reference') return 'blocked_no_reference';
  if (row.matchStatus === 'missing') return 'missing_local_layout';
  if (row.matchStatus === 'ambiguous') return 'ambiguous_mapping';
  if (family.includes('UNVERIFIED') || family.includes('UNCLASSIFIED')) return 'matched_unverified_family';
  if (family === 'MAWB_IATA_COPYSET_SPECIAL') return 'special_product_gap';
  return 'matched_needs_family_validate';
}

function remainingIssues(row, family, status) {
  if (PHASE4_STATUS[row.localCode || '']) return PHASE4_STATUS[row.localCode].remaining;
  if (status === 'blocked_no_reference') return 'No usable Fresa PDF on disk / unavailable download';
  if (status === 'missing_local_layout') return 'Downloaded or listed reference has no Freightnest JSON layout yet';
  if (status === 'ambiguous_mapping') return 'Name collision / multiple local candidates — resolve mapping before layout work';
  if (status === 'special_product_gap') return 'Reference is multi-copy IATA set; Freightnest is single-sheet — product decision required';
  if (family.includes('HBL_OPEN_SHELL')) {
    return 'Local signature clusters ≠ Fresa visual family (Batch 5); need per-PDF family (MTD/Ocean/Jasper) before reuse';
  }
  if (family.startsWith('INV_')) {
    return 'Validate orientation, title band, meta packing, charge columns, tax/totals vs PDF before applying sibling JSON';
  }
  return 'Validate reference PDF structure; prefer family JSON + opt-in chrome over one-off edits';
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const invByName = new Map(inventory.reports.map((r) => [r.name, r]));
const invByCode = new Map(inventory.reports.filter((r) => r.localCode).map((r) => [r.localCode, r]));

const rows = [];
for (const m of mapping.mappings) {
  const family = proposeFamily(m);
  const status = implementationStatus(m, family);
  const inv =
    (m.localCode && invByCode.get(m.localCode)) ||
    invByName.get(m.referenceName) ||
    null;
  const p3 = m.localCode ? p3ByCode[m.localCode] : null;
  const refPath = m.referencePath || inv?.downloadedPath || '';
  const refAvail =
    m.referenceAccess === 'downloaded' || inv?.accessStatus === 'downloaded'
      ? 'downloaded'
      : m.matchStatus === 'unsupported_no_reference' || inv?.accessStatus === 'unavailable'
        ? 'unavailable'
        : m.referenceAccess || inv?.accessStatus || 'unknown';

  rows.push({
    fresa_report_name: m.referenceName,
    category: m.category || '',
    reference_availability: refAvail,
    reference_path: refPath,
    match_status: m.matchStatus,
    match_score: m.matchScore ?? '',
    match_confidence: confidenceLabel(m),
    match_reason: m.matchReason || '',
    freightnest_code: m.localCode || '',
    freightnest_store: m.localStore || '',
    local_block_signature: m.localBlockSignature || '',
    signature_prefix_5: sigPrefix(m.localBlockSignature, 5),
    proposed_layout_family: family,
    implementation_status: status,
    phase4_batch: PHASE4_STATUS[m.localCode || '']?.batch || '',
    phase3_similarity:
      p3?.metrics?.meanSimilarity != null ? Number(p3.metrics.meanSimilarity).toFixed(4) : '',
    remaining_visual_issues: remainingIssues(m, family, status),
    notes: (m.notes || []).join('; '),
  });
}

const headers = Object.keys(rows[0]);
const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\n') + '\n';
fs.writeFileSync(path.join(root, 'tmp/fresa-references/MASTER_COMPLETION_MATRIX.csv'), csv);

// Aggregate for plan
const byStatus = {};
const byFamily = {};
const byCat = {};
for (const r of rows) {
  byStatus[r.implementation_status] = (byStatus[r.implementation_status] || 0) + 1;
  byFamily[r.proposed_layout_family] = (byFamily[r.proposed_layout_family] || 0) + 1;
  byCat[r.category] = (byCat[r.category] || 0) + 1;
}

const familyRank = Object.entries(byFamily).sort((a, b) => b[1] - a[1]);
const matchedDownloadable = rows.filter(
  (r) => r.match_status === 'matched' && r.reference_availability === 'downloaded',
);

fs.writeFileSync(
  path.join(root, 'tmp/fresa-references/MASTER_COMPLETION_PLAN_STATS.json'),
  JSON.stringify(
    {
      total: rows.length,
      byStatus,
      byCat,
      familyRank,
      matchedDownloadable: matchedDownloadable.length,
      phase4Polished: rows.filter((r) => r.implementation_status === 'phase4_polished').length,
    },
    null,
    2,
  ),
);

console.log(JSON.stringify({ total: rows.length, byStatus, topFamilies: familyRank.slice(0, 20) }, null, 2));
