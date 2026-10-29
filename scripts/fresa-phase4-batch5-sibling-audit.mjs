/**
 * Batch 5: audit HBL draft siblings vs Format-11 hblBlShell using Phase 2 mapping
 * and PDF text fingerprints — no name-only inference.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const ROOT = process.cwd();
const mapping = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tmp/fresa-references/FREIGHTNEST_REFERENCE_MAPPING.json'), 'utf8'),
);
const layouts = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/features/reports/data/hblFormatUiLayouts.json'), 'utf8'),
);

const TARGET_SIG_OPEN =
  'companyHeader>formatBadge>docTitle>partyNotifyGrid>fieldGrid:c3>hblCargoTable>hblFreightSignature>termsBank>colorfulFooter';
const TARGET_SIG_B4 =
  'companyHeader>hblBlShell>hblFreightSignature>colorfulFooter';

function blockSig(l) {
  return l.blocks
    .map((b) => {
      if (b.type === 'fieldGrid') return `fieldGrid:c${b.cols || 2}`;
      if (b.type === 'hblFreightSignature' && b.variant) return `hblFreightSignature:${b.variant}`;
      if (b.type === 'colorfulFooter' && b.variant) return `colorfulFooter:${b.variant}`;
      return b.type;
    })
    .join('>');
}

function normSig(s) {
  return s
    .replace(/:blClosing|:plain|:simple/g, '')
    .replace(/>termsBank/g, '');
}

const hbl11 = layouts.find((l) => l.code === 'HBL_DRAFT_REPORT_FORMAT_11');
const openSiblings = layouts.filter((l) => {
  if (!String(l.code).startsWith('HBL_DRAFT')) return false;
  if (l.code === 'HBL_DRAFT_REPORT_FORMAT_11') return false;
  const s = normSig(blockSig(l));
  return (
    s === normSig(TARGET_SIG_OPEN) ||
    s === 'companyHeader>formatBadge>docTitle>partyNotifyGrid>fieldGrid:c3>hblCargoTable>hblFreightSignature>colorfulFooter'
  );
});

const markers = [
  'Bill of Lading FOR COMBINED',
  'BILL OF LADING FOR COMBINED',
  'SHIPPER',
  'CONSIGNEE OR ORDER',
  'NOTIFY ADDRESS',
  'APPLICATION FOR DELIVERY',
  'OCEAN VESSEL',
  'VOYAGE NUMBER',
  'PLACE OF RECEIPT',
  'PORT OF LOADING',
  'PORT OF DISCHARGE',
  'PLACE OF DELIVERY',
  'FREIGHT CHARGES',
  'NO. OF ORIGINAL',
  'Container Nos',
  'Gross Weight',
  'As Agents for the carrier',
  'ABOVE PARTICULARS AS DECLARED',
  'RECEIVED the goods',
  'HOUSE BILL OF LADING',
  'Format-',
];

async function fingerprint(pdfPath) {
  if (!fs.existsSync(pdfPath)) return { missing: true };
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const tc = await page.getTextContent();
  const text = tc.items.map((i) => i.str).join(' ');
  const upper = text.toUpperCase();
  const hits = {};
  for (const m of markers) hits[m] = upper.includes(m.toUpperCase());
  // Logo / header cue: company name near top (y high)
  const items = tc.items.map((it) => ({
    str: it.str,
    x: it.transform[4],
    y: it.transform[5],
  }));
  const top = items.filter((i) => i.y > 700).map((i) => i.str).join(' ');
  const hasCombinedTitle = /BILL OF LADING\s+FOR COMBINED/i.test(text);
  const hasHouseDraftTitle = /HOUSE BILL OF LADING/i.test(text);
  const hasConsigneeOrOrder = /CONSIGNEE OR ORDER/i.test(text);
  const hasAppDelivery = /APPLICATION FOR DELIVERY/i.test(text);
  const hasOceanVessel = /OCEAN VESSEL/i.test(text);
  const hasAgents = /As Agents for the carrier/i.test(text);
  const hasAboveParticulars = /ABOVE PARTICULARS AS DECLARED/i.test(text);
  const hasFourCargoCue =
    /Container Nos,\s*Seal Nos/i.test(text) || /Container Nos, Seal Nos/i.test(text);
  const pageCount = doc.numPages;
  return {
    missing: false,
    pageCount,
    hasCombinedTitle,
    hasHouseDraftTitle,
    hasConsigneeOrOrder,
    hasAppDelivery,
    hasOceanVessel,
    hasAgents,
    hasAboveParticulars,
    hasFourCargoCue,
    topSnippet: top.slice(0, 120).replace(/\s+/g, ' '),
    hits,
  };
}

function classify(fp) {
  if (!fp || fp.missing) return 'incompatible_or_unverified';
  const core =
    fp.hasCombinedTitle &&
    fp.hasConsigneeOrOrder &&
    fp.hasAppDelivery &&
    fp.hasOceanVessel &&
    fp.hasAgents &&
    fp.hasAboveParticulars;
  if (core && fp.hasFourCargoCue) return 'compatible';
  if (core || (fp.hasCombinedTitle && fp.hasConsigneeOrOrder && fp.hasOceanVessel)) {
    return 'partially_compatible';
  }
  if (fp.hasHouseDraftTitle && !fp.hasCombinedTitle) return 'incompatible_or_unverified';
  return 'incompatible_or_unverified';
}

const byLocal = new Map();
for (const m of mapping.mappings || []) {
  if (!m.localCode?.startsWith?.('HBL_DRAFT') && !String(m.localCode || '').includes('HBL_DRAFT')) {
    continue;
  }
  const list = byLocal.get(m.localCode) || [];
  list.push(m);
  byLocal.set(m.localCode, list);
}

const results = [];

// Always include Format-11 as reference baseline
const m11 = (byLocal.get('HBL_DRAFT_REPORT_FORMAT_11') || [])[0];
const fp11 = await fingerprint(path.join(ROOT, m11?.referencePath || 'tmp/fresa-references/pdfs/hbl-draft-report-format-11.pdf'));
results.push({
  code: 'HBL_DRAFT_REPORT_FORMAT_11',
  role: 'canonical',
  localSig: blockSig(hbl11),
  matchStatus: m11?.matchStatus,
  matchScore: m11?.matchScore,
  matchReason: m11?.matchReason,
  referencePath: m11?.referencePath,
  referenceName: m11?.referenceName,
  fp: fp11,
  class: 'compatible',
});

// Sample open-shell siblings that have mapped PDFs — prefer formats with downloaded refs
const candidates = openSiblings
  .map((l) => {
    const maps = byLocal.get(l.code) || [];
    const best = maps.find((m) => m.matchStatus === 'matched' && m.referenceAccess === 'downloaded') || maps[0];
    return { layout: l, map: best };
  })
  .filter((c) => c.map);

// Also include any HBL_DRAFT with downloaded matched PDF even if sig differs slightly
const extraMapped = [...byLocal.entries()]
  .filter(([code, maps]) => {
    if (code === 'HBL_DRAFT_REPORT_FORMAT_11') return false;
    if (!code.startsWith('HBL_DRAFT')) return false;
    return maps.some((m) => m.matchStatus === 'matched' && m.referencePath?.endsWith('.pdf'));
  })
  .map(([code, maps]) => {
    const layout = layouts.find((l) => l.code === code);
    const best =
      maps.find((m) => m.matchStatus === 'matched' && m.referenceAccess === 'downloaded') || maps[0];
    return { layout, map: best };
  })
  .filter((c) => c.layout);

const seen = new Set(['HBL_DRAFT_REPORT_FORMAT_11']);
const queue = [];
for (const c of [...candidates, ...extraMapped]) {
  if (seen.has(c.layout.code)) continue;
  seen.add(c.layout.code);
  queue.push(c);
}

// Prioritize numeric formats that have local PDF files present
const withPdf = [];
const withoutPdf = [];
for (const c of queue) {
  const p = c.map.referencePath ? path.join(ROOT, c.map.referencePath) : '';
  if (p && fs.existsSync(p)) withPdf.push(c);
  else withoutPdf.push(c);
}

// Cap PDF inspections to keep batch focused: all available draft format PDFs on disk for open siblings + key formats
const inspectList = withPdf.sort((a, b) => a.layout.code.localeCompare(b.layout.code));

for (const c of inspectList) {
  const fp = await fingerprint(path.join(ROOT, c.map.referencePath));
  results.push({
    code: c.layout.code,
    role: 'sibling',
    localSig: blockSig(c.layout),
    openShellSibling: openSiblings.some((s) => s.code === c.layout.code),
    matchStatus: c.map.matchStatus,
    matchScore: c.map.matchScore,
    matchReason: c.map.matchReason,
    referencePath: c.map.referencePath,
    referenceName: c.map.referenceName,
    referenceAccess: c.map.referenceAccess,
    fp,
    class: classify(fp),
  });
}

for (const c of withoutPdf.slice(0, 30)) {
  results.push({
    code: c.layout.code,
    role: 'sibling',
    localSig: blockSig(c.layout),
    openShellSibling: openSiblings.some((s) => s.code === c.layout.code),
    matchStatus: c.map?.matchStatus,
    matchScore: c.map?.matchScore,
    matchReason: c.map?.matchReason,
    referencePath: c.map?.referencePath,
    referenceName: c.map?.referenceName,
    referenceAccess: c.map?.referenceAccess,
    fp: { missing: true },
    class: 'incompatible_or_unverified',
  });
}

const summary = {
  openShellSiblingCount: openSiblings.length,
  inspectedWithPdf: inspectList.length,
  classes: {
    compatible: results.filter((r) => r.class === 'compatible').length,
    partially_compatible: results.filter((r) => r.class === 'partially_compatible').length,
    incompatible_or_unverified: results.filter((r) => r.class === 'incompatible_or_unverified').length,
  },
  compatibleCodes: results.filter((r) => r.class === 'compatible' && r.role === 'sibling').map((r) => r.code),
  partialCodes: results.filter((r) => r.class === 'partially_compatible').map((r) => r.code),
};

const out = {
  generatedAt: new Date().toISOString(),
  phase: '4-batch5-sibling-audit',
  format11Fingerprint: fp11,
  openShellSiblingCodes: openSiblings.map((s) => s.code),
  summary,
  results,
};

fs.writeFileSync(
  path.join(ROOT, 'tmp/fresa-references/PHASE4_BATCH5_SIBLING_AUDIT.json'),
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
console.log('\nCompatible siblings:', summary.compatibleCodes.join(', ') || '(none)');
console.log('Partial:', summary.partialCodes.join(', ') || '(none)');
console.log('Inspected with PDF:', inspectList.map((c) => c.layout.code).join(', '));
