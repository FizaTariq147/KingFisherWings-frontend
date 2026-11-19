/**
 * Render every invoice v2 spec with an empty record and an empty organization.
 * Fail when a painted string is neither an allowlisted label nor a value we filled.
 *
 *   npm run report:leak-check
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { isAllowlisted } from './allowlist.mjs';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';

const root = process.cwd();
const codeSource = fs.readFileSync(path.join(root, 'src/features/reports/engine/invoiceV2Codes.ts'), 'utf8');
const codes = [...codeSource.matchAll(/'([A-Z][A-Z0-9_]+)'/g)].map((match) => match[1]);
const record = {
  invoice: { lines: [], subtotal: 0, tax_total: 0, total_amount: 0 },
  job: {},
  party: {},
  organization: {},
};
const organization = { name: '', address: '', phone: '', email: '', website: '' };
const report = [];
let leakCount = 0;

for (const code of codes) {
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  if (!fs.existsSync(specPath)) {
    report.push({ code, error: 'missing spec' });
    leakCount += 1;
    continue;
  }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const filled = fillInvoiceSpans(spec, record);
  const supplied = new Set(Object.values(filled.values).map((value) => String(value).replace(/\s+/g, ' ').trim()).filter(Boolean));
  const painted = [];
  const outPath = path.join(os.tmpdir(), `leak-${code}.pdf`);
  await renderSpec(code, {
    spec,
    values: filled.values,
    organization,
    painted,
    quietArtifacts: true,
    outputPath: outPath,
  });
  fs.rmSync(outPath, { force: true });
  const leaks = [...new Set(painted.filter((text) => text && !isAllowlisted(text) && !supplied.has(text)))];
  const pages = spec.pages?.length ? spec.pages : [spec];
  const suppressed = [];
  for (const page of pages) {
    for (const span of page.spans || []) {
      const text = String(span.text || '').replace(/\s+/g, ' ').trim();
      if (!text || isAllowlisted(text)) continue;
      if (span.role === 'static' || (span.role === 'dynamic' && !supplied.has(text))) suppressed.push(text);
    }
  }
  leakCount += leaks.length;
  report.push({ code, leaks, suppressed: [...new Set(suppressed)].length, examples: [...new Set(suppressed)].slice(0, 8) });
}

const out = path.join(root, 'reports/output/invoice-v2/leak-check.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
const summary = report.map((row) => ({ code: row.code, leaks: row.leaks?.length ?? row.error, suppressed: row.suppressed }));
console.log(JSON.stringify({ codes: codes.length, leakCount, summary }, null, 2));
if (leakCount) process.exit(1);
