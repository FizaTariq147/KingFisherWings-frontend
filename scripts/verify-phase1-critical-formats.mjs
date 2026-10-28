/**
 * Structural verification for phase-1 critical Fresa formats (no browser PDF).
 * Usage: node scripts/verify-phase1-critical-formats.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const data = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  'src/features/reports/data',
);

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(data, name), 'utf8'));
}

function sig(layout) {
  return (layout.blocks || [])
    .map((b) => b.type + (b.title ? `:${b.title}` : b.text ? `:${b.text.slice(0, 24)}` : ''))
    .join('>');
}

const invoice = load('invoiceFormatUiLayouts.json');
const hbl = load('hblFormatUiLayouts.json');
const hawb = load('hawbFormatUiLayouts.json');
const arrival = load('arrivalNoticeFormatUiLayouts.json');
const delivery = load('deliveryOrderFormatUiLayouts.json');
const quotation = load('quotationFormatUiLayouts.json');

const checks = [];

function ok(label, pass, detail = '') {
  checks.push({ label, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
}

const inv21 = new Map();
for (const l of invoice) {
  const m = String(l.code).match(/INVOICE_REPORT_FORMAT_(\d+)/);
  if (!m) continue;
  const n = Number(m[1]);
  if (n >= 1 && n <= 21) inv21.set(n, l);
}
ok('Invoice Formats 1–21 present', inv21.size === 21, `count=${inv21.size}`);
ok(
  'Invoice 1–21 unique signatures',
  new Set([...inv21.values()].map(sig)).size === 21,
  `unique=${new Set([...inv21.values()].map(sig)).size}`,
);

const fg = hbl.find((l) => l.code === 'FG_HBL_HKG');
ok('FG_HBL_HKG uses hblCargoTable', fg?.blocks?.some((b) => b.type === 'hblCargoTable'));
ok('FG_HBL_HKG uses partyNotifyGrid', fg?.blocks?.some((b) => b.type === 'partyNotifyGrid'));
ok(
  'FG_HBL_HKG not chargeTable body',
  !fg?.blocks?.some((b) => b.type === 'chargeTable'),
);

const hawb1 = hawb.find((l) => l.code === 'HAWB_DRAFT_REPORT_FORMAT_1');
ok('HAWB_DRAFT_REPORT_FORMAT_1 hawbRouteGrid', hawb1?.blocks?.some((b) => b.type === 'hawbRouteGrid'));
ok('HAWB store restored', hawb.length >= 30, `count=${hawb.length}`);

const can1 = arrival.find((l) => l.code === 'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1');
ok(
  'CARGO_ARRIVAL_NOTICE_REPORT_FORMAT_1 arrivalChargesOptional',
  can1?.blocks?.some((b) => b.type === 'arrivalChargesOptional'),
);

const do1 = delivery.find((l) => l.code === 'DELIVERY_ORDER_REPORT_FORMAT_1');
ok(
  'DELIVERY_ORDER_REPORT_FORMAT_1 deliveryOrderRelease',
  do1?.blocks?.some((b) => b.type === 'deliveryOrderRelease'),
);

const q3 = quotation.find((l) => l.code === 'QUOTATION_REPORT_FORMAT_3');
ok('Quotation Format-3 air hawbRouteGrid', q3?.blocks?.some((b) => b.type === 'hawbRouteGrid'));
ok(
  'Quotation 15 unique signatures',
  new Set(quotation.map(sig)).size === quotation.length,
  `unique=${new Set(quotation.map(sig)).size}/${quotation.length}`,
);

const familySigs = [sig(fg), sig(hawb1), sig(can1), sig(do1), sig(inv21.get(1)), sig(q3)];
ok(
  'Critical families structurally distinct from each other',
  new Set(familySigs).size === familySigs.length,
);

const failed = checks.filter((c) => !c.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
