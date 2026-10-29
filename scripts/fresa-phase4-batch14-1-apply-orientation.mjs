/**
 * Phase 4 Batch 14.1 — Apply evidence-backed JSON orientation:landscape
 * for the 21 codes from PHASE4_BATCH14_ORIENTATION_AUDIT recommended list.
 * No renderer / shared component / unrelated layout edits.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const audit = JSON.parse(
  fs.readFileSync(path.join(root, 'tmp/fresa-references/PHASE4_BATCH14_ORIENTATION_AUDIT.json'), 'utf8'),
);

const INTENDED = [
  'AR_AGING_SUMMARY_REPORT_FORMAT',
  'BARCODE_AWB_REPORT_FORMAT',
  'CARGO_MANIFEST_AIR_JASPER_REPORT_FORMAT',
  'CARGO_MANIFEST_AIR_LC_JASPER_REPORT_FORMAT',
  'CARGO_MANIFEST_REPORT_FORMAT',
  'CONTAINER_LOAD_PLAN_REPORT_FORMAT',
  'CONTAINER_OUTTURN_REPORT_FORMAT',
  'DAILY_STATUS_REPORT_FORMAT_1',
  'DAILY_STATUS_REPORT_FORMAT_2',
  'FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT',
  'FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT',
  'GL_REPORT_VOUCHER_REPORT_FORMAT',
  'IMPORT_CARGO_MANIFEST_REPORT_FORMAT',
  'IMPORT_TALLY_SHEET_REPORT_FORMAT',
  'OUTSTANDING_LETTER_REPORT_FORMAT_2_OUTSTANDING_LETTER_JASPER',
  'PROFIT_AND_LOSS_REPORT_FORMAT_1_LANDSCAPE',
  'PROFIT_AND_LOSS_REPORT_FORMAT_3_SUMMARY_PERIODWISE',
  'SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT',
  'STUFFING_REPORT_JASPER_REPORT_FORMAT',
  'TERMINAL_DEPARTURE_REPORT_TDR_REPORT_FORMAT',
  'TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT',
];

const EXCLUDED = new Set(['INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA']);

const STORES = {
  'accountsFormatUiLayouts.json': {
    json: 'src/features/reports/data/accountsFormatUiLayouts.json',
    gen: 'src/features/reports/data/accountsFormatUiLayouts.generated.ts',
    exportName: 'ACCOUNTS_FORMAT_UI_LAYOUTS',
    banner: '/** Auto-generated Accounts formats — permanent JSON store. */\n',
  },
  'otherReportsFormatUiLayouts.json': {
    json: 'src/features/reports/data/otherReportsFormatUiLayouts.json',
    gen: 'src/features/reports/data/otherReportsFormatUiLayouts.generated.ts',
    exportName: 'OTHER_REPORTS_FORMAT_UI_LAYOUTS',
    banner: '/** Permanent JSON UI layouts — Fresa sky-blue themes. */\n',
  },
};

const recommendByCode = Object.fromEntries(
  (audit.recommendedCorrectionBatch || []).map((r) => [r.freightnest_code, r]),
);

const results = [];
const dirtyStores = new Map(); // storeKey -> { meta, layouts }

for (const code of INTENDED) {
  const evidence = recommendByCode[code];
  if (!evidence) {
    results.push({
      code,
      action: 'skipped',
      reason: 'Not in Batch 14 recommendedCorrectionBatch — no safe evidence',
    });
    continue;
  }
  if (EXCLUDED.has(code)) {
    results.push({ code, action: 'skipped', reason: 'Explicit exclusion' });
    continue;
  }
  if (evidence.expected !== 'landscape') {
    results.push({
      code,
      action: 'skipped',
      reason: `Audit expected ${evidence.expected}, not landscape`,
    });
    continue;
  }

  const storeKey = evidence.freightnest_store;
  const meta = STORES[storeKey];
  if (!meta) {
    results.push({
      code,
      action: 'skipped',
      reason: `Unexpected store ${storeKey}`,
      reference_path: evidence.reference_path,
    });
    continue;
  }

  if (!dirtyStores.has(storeKey)) {
    const layouts = JSON.parse(fs.readFileSync(path.join(root, meta.json), 'utf8'));
    dirtyStores.set(storeKey, { meta, layouts });
  }
  const { layouts } = dirtyStores.get(storeKey);
  const row = layouts.find((r) => r.code === code);
  if (!row) {
    results.push({
      code,
      action: 'skipped',
      reason: `Code not found in ${storeKey}`,
      reference_path: evidence.reference_path,
      store: storeKey,
    });
    continue;
  }

  const previous = row.orientation === 'landscape' ? 'landscape' : 'portrait';
  if (previous === 'landscape') {
    results.push({
      code,
      action: 'already_correct',
      previous,
      next: 'landscape',
      store: storeKey,
      reference_path: evidence.reference_path,
      rotate: evidence.rotate,
      evidence: evidence.evidence,
    });
    continue;
  }

  row.orientation = 'landscape';
  results.push({
    code,
    action: 'changed',
    previous,
    next: 'landscape',
    store: storeKey,
    reference_path: evidence.reference_path,
    rotate: evidence.rotate,
    evidence: evidence.evidence,
  });
}

for (const [storeKey, { meta, layouts }] of dirtyStores) {
  const changed = results.some((r) => r.store === storeKey && r.action === 'changed');
  if (!changed) continue;
  fs.writeFileSync(path.join(root, meta.json), `${JSON.stringify(layouts, null, 2)}\n`);
  const body = `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n${meta.banner}export const ${meta.exportName}: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`;
  fs.writeFileSync(path.join(root, meta.gen), body);
}

// Guard: portrait regression configs must still lack landscape (or remain portrait)
const PORTRAIT_GUARDS = [
  {
    code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    file: 'src/features/reports/data/invoiceFormatUiLayouts.json',
  },
  {
    code: 'INVOICE_REPORT_FORMAT_3_SUMMARY_INVOICE',
    file: 'src/features/reports/data/invoiceFormatUiLayouts.json',
  },
  {
    code: 'INVOICE_REPORT_FORMAT_4_SUMMARY_INVOICE_WITH_TAX',
    file: 'src/features/reports/data/invoiceFormatUiLayouts.json',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_4',
    file: 'src/features/reports/data/arrivalNoticeFormatUiLayouts.json',
  },
  {
    code: 'HBL_DRAFT_REPORT_FORMAT_11',
    file: 'src/features/reports/data/hblFormatUiLayouts.json',
  },
];

const guards = [];
for (const g of PORTRAIT_GUARDS) {
  const layouts = JSON.parse(fs.readFileSync(path.join(root, g.file), 'utf8'));
  const row = layouts.find((r) => r.code === g.code);
  const orient = row?.orientation === 'landscape' ? 'landscape' : 'portrait';
  guards.push({
    code: g.code,
    file: g.file,
    orientation: orient,
    ok: orient === 'portrait',
  });
}

const inv2 = JSON.parse(
  fs.readFileSync(path.join(root, 'src/features/reports/data/invoiceFormatUiLayouts.json'), 'utf8'),
).find((r) => r.code === 'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA');

const out = {
  generatedAt: new Date().toISOString(),
  intendedCount: INTENDED.length,
  changed: results.filter((r) => r.action === 'changed').length,
  alreadyCorrect: results.filter((r) => r.action === 'already_correct').length,
  skipped: results.filter((r) => r.action === 'skipped').length,
  filesTouched: [...dirtyStores.keys()].filter((k) =>
    results.some((r) => r.store === k && r.action === 'changed'),
  ),
  results,
  portraitGuards: guards,
  invoiceFormat2StillLandscape: inv2?.orientation === 'landscape',
};

fs.writeFileSync(
  path.join(root, 'tmp/fresa-references/PHASE4_BATCH14_1_APPLY.json'),
  JSON.stringify(out, null, 2),
);

console.log(JSON.stringify(out, null, 2));
