/**
 * Root-cause audit: which local layouts share block signatures (render identically).
 * Writes FRESA_TEMPLATE_MAPPING.json (report → template fingerprint + reference status).
 *
 * Usage: node scripts/analyze-identical-report-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src/features/reports/data');

const invPath = path.join(dataDir, 'FRESA_REFERENCE_INVENTORY.json');
const inventory = fs.existsSync(invPath)
  ? JSON.parse(fs.readFileSync(invPath, 'utf8'))
  : { reports: [] };

const byRefName = new Map(
  (inventory.reports || []).map((r) => [String(r.name || '').toLowerCase(), r]),
);

const stores = fs
  .readdirSync(dataDir)
  .filter((f) => f.endsWith('FormatUiLayouts.json'));

const all = [];
for (const store of stores) {
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, store), 'utf8'));
  for (const row of rows) {
    const sig = blockSignature(row.blocks);
    const ref = byRefName.get(String(row.name || '').toLowerCase());
    all.push({
      code: row.code,
      name: row.name,
      store,
      formatNumber: row.formatNumber,
      signature: sig,
      blockTypes: (row.blocks || []).map((b) => b.type),
      referenceAccess: ref?.accessStatus || 'no_inventory_match',
      referencePath: ref?.downloadedPath || null,
      referenceSha256: ref?.sha256 || null,
    });
  }
}

const bySig = new Map();
for (const row of all) {
  if (!bySig.has(row.signature)) bySig.set(row.signature, []);
  bySig.get(row.signature).push(row.code);
}

const duplicateGroups = [...bySig.entries()]
  .filter(([, codes]) => codes.length > 1)
  .map(([signature, codes]) => ({
    signature,
    count: codes.length,
    codes,
    storeSamples: all.filter((r) => codes.includes(r.code)).map((r) => r.store),
  }))
  .sort((a, b) => b.count - a.count);

/** Template id = first code in sorted group (canonical). */
const codeToTemplateId = new Map();
for (const [sig, codes] of bySig) {
  const sorted = [...codes].sort();
  const templateId = `TPL_${sorted[0]}`;
  for (const c of sorted) codeToTemplateId.set(c, { templateId, signature: sig, sharedWith: sorted });
}

const mapping = {
  generatedAt: new Date().toISOString(),
  totalLayouts: all.length,
  uniqueSignatures: bySig.size,
  identicalGroups: duplicateGroups.length,
  rootCause: {
    summary:
      'Many formats share the same JsonInvoiceLayoutRenderer block pipeline. ' +
      'Uniqueness was previously faked via optional-block injection / theme swaps, ' +
      'or entire families (HAWB extras, HBL Format-23+) cloned one shell. ' +
      'Catalogue PDF path is generateInvoiceFormatPreviewPdf → InvoiceFormatLayoutByKind → JsonInvoiceLayoutRenderer.',
    sharedRenderer: 'src/features/reports/components/ReportCatalog/JsonInvoiceLayoutRenderer.tsx',
    pdfPipeline: 'src/features/reports/utils/generateInvoiceFormatPreviewPdf.tsx',
    chromeOverride: 'src/features/reports/utils/applySharedLayoutChrome.ts',
  },
  reports: all.map((r) => ({
    ...r,
    templateId: codeToTemplateId.get(r.code)?.templateId,
    sharedWith: codeToTemplateId.get(r.code)?.sharedWith || [r.code],
    verifiedAgainstReference:
      r.referenceAccess === 'downloaded' &&
      (codeToTemplateId.get(r.code)?.sharedWith || []).length === 1,
  })),
  identicalGroups: duplicateGroups,
};

fs.writeFileSync(
  path.join(dataDir, 'FRESA_TEMPLATE_MAPPING.json'),
  `${JSON.stringify(mapping, null, 2)}\n`,
  'utf8',
);

const md = [
  '# Report → template mapping (local)',
  '',
  `- Total layouts: **${mapping.totalLayouts}**`,
  `- Unique block signatures: **${mapping.uniqueSignatures}**`,
  `- Identical-structure groups: **${mapping.identicalGroups.length}**`,
  '',
  '## Root cause',
  '',
  mapping.rootCause.summary,
  '',
  `- Renderer: \`${mapping.rootCause.sharedRenderer}\``,
  `- PDF: \`${mapping.rootCause.pdfPipeline}\``,
  '',
  '## Largest identical groups',
  '',
  ...duplicateGroups.slice(0, 25).map(
    (g) => `- **${g.count}×** ${g.codes.slice(0, 8).join(', ')}${g.codes.length > 8 ? '…' : ''}`,
  ),
  '',
];
fs.writeFileSync(path.join(dataDir, 'FRESA_TEMPLATE_MAPPING.md'), md.join('\n'), 'utf8');

console.log(
  JSON.stringify(
    {
      totalLayouts: mapping.totalLayouts,
      uniqueSignatures: mapping.uniqueSignatures,
      identicalGroups: mapping.identicalGroups.length,
      topDupes: duplicateGroups.slice(0, 10).map((g) => ({ count: g.count, sample: g.codes[0] })),
    },
    null,
    2,
  ),
);
