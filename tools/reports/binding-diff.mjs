/**
 * Compare live-path filled values for all 26 v2 invoice codes:
 * before = reports/invoice-v2 @ 8cb2709c, after = current tree.
 * Writes reports/invoice-v2/binding-diff.md
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const beforeSha = '8cb2709c';
const livePath = path.join(root, 'reports/output/invoice-v2/batch-live.json');
const live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
const real = live.invoices.filter((row) => row.invoice?.invoice_number && !String(row.id || '').startsWith('syn-') && !String(row.id || '').startsWith('extra-'));
const applicability = JSON.parse(fs.readFileSync(path.join(root, 'reports/invoice-v2-applicability.json'), 'utf8'));
const codes = Object.keys(applicability).filter((code) => /INVOICE|PROFORMA|PURCHASE_INVOICE/.test(code)).sort();

function syntheticRecords() {
  function money(lines, extra = {}) {
    const subtotal = lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unit_price), 0);
    const tax = lines.reduce((sum, line) => sum + Number(line.tax_amount || 0), 0);
    const discount = extra.discount || 0;
    const rounding = extra.rounding || 0;
    const total = Math.round((subtotal + tax - discount + rounding) * 100) / 100;
    return {
      id: extra.id,
      invoice: {
        invoice_number: extra.id,
        invoice_date: '2026-01-15',
        currency_code: extra.currency || 'USD',
        exchange_rate: extra.exchange_rate || '1',
        subtotal,
        tax_total: tax,
        discount,
        rounding_amount: rounding,
        total_amount: total,
        status: 'CREATED',
        lines: lines.map((line, index) => ({
          description: `SYN Line ${index + 1}`,
          charge_code_name: `SYN Line ${index + 1}`,
          quantity: line[0],
          unit_price: line[1],
          tax_amount: line[2],
          line_total: line[0] * line[1] + line[2],
          is_taxable: line[2] > 0,
        })),
      },
      job: {},
      party: { name: 'Synthetic Party', address: '1 Test St', vat_number: 'SYN-GST' },
    };
  }
  return [
    money([[1, 100, 0], [2, 50, 0]], { id: 'syn-01', currency: 'USD' }),
    money([[1, 80, 8], [1, 20, 2]], { id: 'syn-02', currency: 'AED' }),
    money([[3, 40, 0]], { id: 'syn-03', currency: 'EUR' }),
    money([[1, 200, 10], [1, 50, 2.5], [2, 25, 2.5]], { id: 'syn-04', currency: 'AED', discount: 40 }),
    money([[1, 120, 0], [1, 30, 0]], { id: 'syn-05', currency: 'GBP' }),
    money([[2, 60, 12], [1, 25, 2.5], [1, 10, 1]], { id: 'syn-06', currency: 'USD', discount: 15 }),
    money([[1, 75, 7.5]], { id: 'syn-07', currency: 'SGD' }),
    money([[4, 15, 0], [1, 90, 0]], { id: 'syn-08', currency: 'USD' }),
    money([[1, 250, 25], [1, 40, 4]], { id: 'syn-09', currency: 'AED' }),
    money([[2, 33, 0], [2, 17, 0], [1, 9, 0]], { id: 'syn-10', currency: 'USD' }),
    money([[1, 500, 0]], { id: 'syn-11', currency: 'USD', exchange_rate: '3.67' }),
    money([[1, 90, 18], [1, 30, 6], [1, 12, 2.4], [1, 8, 1.6]], { id: 'syn-12', currency: 'GBP', discount: 20 }),
    money([[5, 10, 5]], { id: 'syn-13', currency: 'EUR' }),
    money([[1, 60, 0], [1, 60, 0], [1, 60, 0]], { id: 'syn-14', currency: 'USD' }),
    money([[1, 2000, 300], [4, 125, 75], [1, 60, 9]], { id: 'syn-15', currency: 'PKR', discount: 100, rounding: 0.05 }),
  ];
}

function recordBundle(row) {
  return {
    invoice: row.invoice,
    job: row.job || {},
    party: row.party || {},
    organization: live.organization || {},
    bank: live.bank,
    session: {
      createdBy: row.invoice?.created_by_email || row.invoice?.created_by || '',
      printedAt: '2026-11-20T12:00:00.000Z',
    },
  };
}

async function snapshot(fillInvoiceSpans) {
  const out = {};
  const records = [
    ...real.map((row) => ({ key: row.invoice.invoice_number, bundle: recordBundle(row) })),
    ...syntheticRecords().map((row) => ({ key: row.id, bundle: recordBundle(row) })),
  ];
  for (const code of codes) {
    const specPath = path.join(root, 'reports/specs', `${code}.json`);
    if (!fs.existsSync(specPath)) continue;
    out[code] = {};
    for (const { key, bundle } of records) {
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
      try {
        const filled = fillInvoiceSpans(spec, bundle);
        out[code][key] = filled.values || {};
      } catch (error) {
        out[code][key] = { __error: String(error.message || error) };
      }
    }
  }
  return out;
}

function nearestLabelGuess(spec, spanId) {
  const spans = (spec.pages || []).flatMap((page) => page.spans || []);
  const span = spans.find((item) => item.id === spanId) || spans.find((item) => spanId.endsWith(item.id));
  if (!span) return spanId;
  const colon = spans
    .filter((other) => other.role === 'static' && Math.abs(other.y - span.y) <= 2 && String(other.text || '').trim() === ':' && other.x < span.x)
    .sort((a, b) => (span.x - a.x) - (span.x - b.x))[0];
  if (colon) {
    const parts = spans
      .filter((other) => other.role === 'static' && Math.abs(other.y - span.y) <= 2 && other.x < colon.x && colon.x - other.x < 140)
      .sort((a, b) => a.x - b.x)
      .map((other) => other.text);
    if (parts.length) return parts.join(' ');
  }
  const left = spans
    .filter((other) => other.role === 'static' && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => (span.x - (b.x + (b.width || 0))) - (span.x - (a.x + (a.width || 0))))[0];
  return left?.text || spanId;
}

function flagSwap(label, oldValue, newValue, recordValue) {
  const key = String(label || '').toLowerCase();
  const notes = [];
  if (/hbl/.test(key) && /mbl/i.test(String(newValue)) && !/hbl/i.test(String(newValue))) {
    notes.push('possible HBL slot received MBL-like value');
  }
  if (/mbl/.test(key) && /hbl/i.test(String(newValue)) && !/mbl/i.test(String(newValue))) {
    notes.push('possible MBL slot received HBL-like value');
  }
  if (/shipper/.test(key) && /consignee/i.test(String(newValue))) notes.push('possible shipper/consignee swap');
  if (/consignee/.test(key) && /shipper/i.test(String(newValue))) notes.push('possible consignee/shipper swap');
  if (/bill to|bill-to/.test(key) && /shipper/i.test(String(newValue))) notes.push('possible bill-to/shipper swap');
  void oldValue;
  void recordValue;
  return notes;
}

// Same depth as tools/reports so invoice-bindings root (../..) still resolves.
const beforeDir = path.join(root, 'tools/before-bindings');
fs.rmSync(beforeDir, { recursive: true, force: true });
fs.mkdirSync(beforeDir, { recursive: true });
for (const file of ['invoice-bindings.mjs', 'invoice-rows.mjs', 'amount-words.mjs', 'allowlist.mjs']) {
  const source = execFileSync('git', ['show', `${beforeSha}:tools/reports/${file}`], { cwd: root });
  fs.writeFileSync(path.join(beforeDir, file), source);
}

const beforeMod = await import(pathToFileURL(path.join(beforeDir, 'invoice-bindings.mjs')).href);
const afterMod = await import(pathToFileURL(path.join(root, 'tools/reports/invoice-bindings.mjs')).href);

const before = await snapshot(beforeMod.fillInvoiceSpans);
const after = await snapshot(afterMod.fillInvoiceSpans);

const changes = [];
const flagged = [];
for (const code of Object.keys(after)) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  for (const recordKey of Object.keys(after[code] || {})) {
    const oldValues = before[code]?.[recordKey] || {};
    const newValues = after[code][recordKey] || {};
    const ids = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    const bundle = [...real.map((row) => ({ key: row.invoice.invoice_number, bundle: recordBundle(row) })),
      ...syntheticRecords().map((row) => ({ key: row.id, bundle: recordBundle(row) }))]
      .find((item) => item.key === recordKey)?.bundle;
    for (const id of ids) {
      const oldValue = String(oldValues[id] ?? '');
      const newValue = String(newValues[id] ?? '');
      if (oldValue === newValue) continue;
      const label = nearestLabelGuess(spec, id);
      const recordValue = '';
      const flags = flagSwap(label, oldValue, newValue, recordValue);
      // Heuristic: if label says HBL and new equals known MBL path value on record.
      if (/hbl/i.test(label) && bundle) {
        const mbl = bundle.job?.sea_fcl_details?.mbl_number || bundle.invoice?.shipment?.mbl_number || '';
        const hbl = bundle.job?.sea_fcl_details?.hbl_number || bundle.invoice?.shipment?.hbl_number || '';
        if (mbl && newValue.includes(mbl) && (!hbl || !newValue.includes(hbl))) {
          flags.push('HBL label now shows MBL value');
        }
      }
      if (/shipper/i.test(label) && bundle?.job?.consignee_name && newValue === bundle.job.consignee_name) {
        flags.push('shipper label shows consignee value');
      }
      if (/consignee/i.test(label) && bundle?.job?.shipper_name && newValue === bundle.job.shipper_name) {
        flags.push('consignee label shows shipper value');
      }
      if (/bill to|bill-to/i.test(label) && bundle?.job?.shipper_name && newValue === bundle.job.shipper_name && newValue !== (bundle.party?.name || '')) {
        flags.push('bill-to label shows shipper value');
      }
      const row = {
        code,
        record: recordKey,
        span: id,
        label: String(label).replace(/\s+/g, ' ').trim(),
        oldValue,
        newValue,
        flagged: flags,
      };
      changes.push(row);
      if (flags.length) flagged.push(row);
    }
  }
}

const lines = [
  '# Invoice v2 live-path binding diff',
  '',
  `Before: \`origin/reports/invoice-v2\` @ \`${beforeSha}\`. After: current \`reports/integration\` tree.`,
  `Codes: ${Object.keys(after).length}. Records per code: ${real.length} real + ${syntheticRecords().length} synthetic.`,
  `Changed fields: ${changes.length}. Flagged label swaps: ${flagged.length}.`,
  '',
  '## Flagged label swaps',
  '',
];
if (!flagged.length) {
  lines.push('None.');
} else {
  lines.push('| Code | Record | Span | Label | Old | New | Flags |', '|---|---|---|---|---|---|---|');
  for (const row of flagged) {
    lines.push(`| ${row.code} | ${row.record} | ${row.span} | ${row.label} | ${JSON.stringify(row.oldValue)} | ${JSON.stringify(row.newValue)} | ${row.flagged.join('; ')} |`);
  }
}
lines.push('', '## All changed fields', '');
lines.push('| Code | Record | Span | Label | Old | New |', '|---|---|---|---|---|---|');
for (const row of changes.slice(0, 2000)) {
  lines.push(`| ${row.code} | ${row.record} | ${row.span} | ${row.label} | ${JSON.stringify(row.oldValue)} | ${JSON.stringify(row.newValue)} |`);
}
if (changes.length > 2000) lines.push('', `_Truncated to 2000 of ${changes.length} changes._`);

const outPath = path.join(root, 'reports/invoice-v2/binding-diff.md');
fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'reports/invoice-v2/binding-diff.json'), `${JSON.stringify({
  beforeSha,
  codes: Object.keys(after).length,
  changeCount: changes.length,
  flaggedCount: flagged.length,
  flagged,
  changes: changes.slice(0, 5000),
}, null, 2)}\n`);
console.log(JSON.stringify({
  outPath,
  codes: Object.keys(after).length,
  changeCount: changes.length,
  flaggedCount: flagged.length,
  flaggedSample: flagged.slice(0, 20),
}, null, 2));
