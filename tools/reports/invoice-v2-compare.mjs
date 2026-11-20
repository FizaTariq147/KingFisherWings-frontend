/**
 * Classic | v2 | Fresa reference sheets for the downloaded invoices.
 * Reads reports/output/invoice-v2/live.json. Does not commit that file.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { fillInvoiceSpans } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';

const root = process.cwd();
const dir = path.join(root, 'reports/output/invoice-v2');
const code = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';
const live = JSON.parse(fs.readFileSync(path.join(dir, 'live.json'), 'utf8'));
const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));

function referencePdf() {
  const mapped = fs.readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8');
  const line = mapped.split(/\r?\n/).find((row) => row.startsWith(`${code},`));
  const file = line?.match(/reports\/references\/files\/[^,]+/)?.[0];
  if (!file) throw new Error('No Fresa reference for the invoice spec');
  return path.join(root, file);
}

function raster(pdf, destPrefix) {
  execFileSync('pdftoppm', ['-png', '-r', '72', '-f', '1', '-l', '1', '-singlefile', pdf, destPrefix], { stdio: 'ignore' });
  return `${destPrefix}.png`;
}

function sheet(paths, dest) {
  const images = paths.map((file) => PNG.sync.read(fs.readFileSync(file)));
  const height = Math.max(...images.map((image) => image.height));
  const gap = 8;
  const width = images.reduce((sum, image) => sum + image.width, 0) + gap * (images.length - 1);
  const out = new PNG({ width, height });
  out.data.fill(255);
  let x = 0;
  for (const image of images) {
    for (let y = 0; y < image.height; y += 1) {
      image.data.copy(out.data, (y * width + x) * 4, y * image.width * 4, (y * image.width + image.width) * 4);
    }
    x += image.width + gap;
  }
  fs.writeFileSync(dest, PNG.sync.write(out));
}

function pdfText(pdf) {
  return execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' });
}

function containsAmount(text, amount) {
  const value = Number(String(amount).replace(/,/g, ''));
  if (!Number.isFinite(value)) return false;
  const compact = text.replace(/,/g, '');
  const body = value.toFixed(2);
  if (compact.includes(body)) return true;
  if (body.endsWith('.00')) {
    const whole = body.slice(0, -3);
    return new RegExp(`(?:^|\\D)${whole}(?:\\D|$)`).test(compact);
  }
  return false;
}

const classicReady = live.invoices.every((row) => fs.existsSync(path.join(dir, 'classic', `${row.id}.pdf`)));
if (!classicReady) {
  execFileSync(
    process.execPath,
    [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--project', 'unit', 'src/features/reports/engine/writeClassicInvoices.test.ts'],
    { cwd: root, stdio: 'inherit', env: { ...process.env, LIVE_INVOICE_DIR: dir, TZ: 'UTC' } },
  );
}

const reference = referencePdf();
const compareDir = path.join(dir, 'compare');
fs.mkdirSync(compareDir, { recursive: true });
fs.mkdirSync(path.join(dir, 'v2'), { recursive: true });
const org = live.organization || {};
const organization = {
  name: org.display_name || org.name || '',
  display_name: org.display_name || org.name || '',
  address: org.address || '',
  city: org.city || '',
  country_code: org.country_code || '',
  phone: org.phone || '',
  email: org.email || '',
  website: org.website || '',
};

const results = [];
const fieldLines = ['# Blank and unresolved fields', '', 'Columns are classic PDF, v2 PDF, Fresa reference.', ''];
for (const row of live.invoices) {
  const record = { invoice: row.invoice, job: row.job, party: row.party, organization };
  const filled = fillInvoiceSpans(spec, record);
  const v2Path = path.join(dir, 'v2', `${row.id}.pdf`);
  await renderSpec(code, {
    values: filled.values,
    organization: {
      name: organization.name,
      address: [organization.address, organization.city, organization.country_code].filter(Boolean).join(', '),
      phone: organization.phone,
      email: organization.email,
      website: organization.website,
    },
    outputPath: v2Path,
  });
  const classicPath = path.join(dir, 'classic', `${row.id}.pdf`);
  const classicPng = raster(classicPath, path.join(compareDir, `.${row.id}-classic`));
  const v2Png = raster(v2Path, path.join(compareDir, `.${row.id}-v2`));
  const refPng = raster(reference, path.join(compareDir, `.${row.id}-ref`));
  const png = path.join(compareDir, `${row.id}.png`);
  sheet([classicPng, v2Png, refPng], png);
  for (const file of [classicPng, v2Png, refPng]) fs.rmSync(file, { force: true });

  const classicText = pdfText(classicPath);
  const v2Text = pdfText(v2Path);
  const checks = [
    ['subtotal', filled.totals.subtotal],
    ['tax', filled.totals.tax],
    ['grand total', filled.totals.total],
    ...filled.totals.lines.map((amount, index) => [`line ${index + 1}`, amount]),
  ].map(([label, amount]) => ({
    label,
    amount,
    classic: containsAmount(classicText, amount),
    v2: containsAmount(v2Text, amount),
  }));
  results.push({
    id: row.id,
    number: row.invoice.invoice_number || row.id,
    png: path.relative(root, png).replaceAll('\\', '/'),
    blanks: filled.blanks.length,
    checks,
    match: checks.every((check) => check.classic && check.v2),
  });
  fieldLines.push(`## ${row.invoice.invoice_number || row.id}`);
  fieldLines.push('');
  fieldLines.push('| Label | Binding | Why it is blank |');
  fieldLines.push('|---|---|---|');
  const seen = new Set();
  for (const blank of filled.blanks) {
    const key = `${blank.label}|${blank.binding}|${blank.why}`;
    if (seen.has(key)) continue;
    seen.add(key);
    fieldLines.push(`| ${String(blank.label).replaceAll('|', '/')} | ${blank.binding} | ${blank.why} |`);
  }
  if (!filled.blanks.length) fieldLines.push('| | | |');
  fieldLines.push('');
  fieldLines.push('| Figure | Classic PDF | v2 PDF |');
  fieldLines.push('|---|---|---|');
  for (const check of checks) {
    fieldLines.push(`| ${check.label} ${check.amount} | ${check.classic ? 'matches' : 'missing'} | ${check.v2 ? 'matches' : 'missing'} |`);
  }
  fieldLines.push('');
}
fs.writeFileSync(path.join(compareDir, 'fields.md'), `${fieldLines.join('\n')}\n`);
fs.writeFileSync(path.join(compareDir, 'reconciliation.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map((row) => ({
  number: row.number,
  png: row.png,
  match: row.match,
  blanks: row.blanks,
  failed: row.checks.filter((check) => !check.classic || !check.v2),
})), null, 2));
