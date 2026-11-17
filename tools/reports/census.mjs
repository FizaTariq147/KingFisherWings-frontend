/**
 * Extraction-only census of the pinned PDFs, plus the label inventory.
 * Run: node tools/reports/census.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { countFeatures, readOperators } from './read-operators.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const RULES = [
  [/invoice\s*no|bill\s*no/, 'invoice.number', false],
  [/invoice\s*date|^date$/, 'invoice.date', false],
  [/due\s*date/, 'invoice.dueDate', true],
  [/bill\s*t/, 'party.billTo', false],
  [/shipper/, 'party.shipper', false],
  [/consignee/, 'party.consignee', false],
  [/notify/, 'party.notify', false],
  [/gst|cgst|sgst|igst|\btax\b/, 'invoice.tax', false],
  [/grand\s*total|^total$/, 'invoice.total', false],
  [/\bmawb\b/, 'shipment.mawb', false],
  [/\bhawb\b|\bhbl\b/, 'shipment.hbl', false],
  [/\bmbl\b/, 'shipment.mbl', false],
  [/port of loading|\bpol\b/, 'shipment.pol', false],
  [/port of discharge|\bpod\b/, 'shipment.pod', false],
  [/place of receipt/, 'shipment.placeOfReceipt', false],
  [/place of delivery/, 'shipment.placeOfDelivery', false],
  [/final dest/, 'shipment.finalDestination', false],
  [/vessel/, 'shipment.vessel', false],
  [/voyage/, 'shipment.voyage', false],
  [/\betd\b/, 'shipment.etd', false],
  [/\beta\b/, 'shipment.eta', false],
  [/carrier|airline|shipping line/, 'shipment.carrier', false],
  [/freight/, 'shipment.freightTerms', false],
  [/shipment\s*no/, 'shipment.number', true],
  [/reference/, 'shipment.referenceNo', true],
  [/\bigm\b/, 'shipment.igmNo', true],
  [/job\s*no/, 'job.number', false],
  [/gross\s*weight/, 'cargo.grossWeight', false],
  [/net\s*weight/, 'cargo.netWeight', false],
  [/measurement|\bcbm\b/, 'cargo.measurement', false],
  [/container/, 'cargo.containerNo', false],
  [/seal/, 'cargo.sealNo', false],
  [/description|goods|narration|marks/, 'cargo.description', false],
  [/pieces|packages|pkgs/, 'cargo.pieces', false],
  [/currency/, 'invoice.currency', false],
  [/amount/, 'invoice.amount', false],
  [/^rate$|ex\.?\s*rate/, 'charge.rate', true],
  [/qty|quantity/, 'charge.quantity', true],
  [/charge/, 'charge.description', true],
  [/phone|tel\b/, 'company.phone', false],
  [/e-?mail/, 'company.email', false],
  [/address/, 'company.address', false],
  [/web|www/, 'company.website', true],
  [/opening/, 'ledger.openingBalance', true],
  [/debit/, 'ledger.debit', true],
  [/credit/, 'ledger.credit', true],
  [/closing/, 'ledger.closingBalance', true],
  [/account/, 'ledger.accountName', true],
  [/^user\b/, 'document.user', true],
  [/page\b/, 'document.pageNumber', true],
];

function csv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalizeLabel(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function looksLikeValue(text) {
  const value = String(text || '').trim();
  if (!value || value.length < 2) return false;
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(value)) return true;
  if (/^[0-9][0-9,.\s/-]*$/.test(value) && /\d/.test(value)) return true;
  if (/@/.test(value)) return true;
  if (value === value.toUpperCase() && value.length > 18 && /[A-Z]/.test(value)) return true;
  return false;
}

function nearestLabel(span, spans) {
  const left = spans
    .filter((other) => other !== span && !looksLikeValue(other.text) && Math.abs(other.y - span.y) <= 2 && other.x < span.x)
    .sort((a, b) => b.x - a.x)[0];
  if (left) return { text: left.text, side: 'left' };
  const above = spans
    .filter((other) => other !== span && !looksLikeValue(other.text) && other.y > span.y && other.x < span.x + span.width && other.x + other.width > span.x)
    .sort((a, b) => a.y - b.y)[0];
  return above ? { text: above.text, side: 'above' } : null;
}

function familiesByCode() {
  const source = fs.readFileSync(path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'), 'utf8');
  const map = new Map();
  for (const block of source.split('\n  {\n')) {
    const code = block.match(/"code": "([^"]+)"/)?.[1];
    const family = block.match(/"family": "([^"]+)"/)?.[1];
    if (code && family) map.set(code, family);
  }
  return map;
}

function isValueLabel(label) {
  if (!label || label.length < 2) return true;
  if (/^(inr|aed|usd|eur|gbp|sar|qar|omr|bhd|kwd|sgd|myr|cny|jpy|aud|cad|chf|hkd|nzd|zar|lkr|bdt|pkr|thb|idr|php)$/.test(label)) return true;
  if (/^\d+( \d+)*$/.test(label)) return true;
  if (/^[0-9]+[.,][0-9., ]+$/.test(label)) return true;
  return false;
}

function propose(label, family) {
  const hit = RULES.find(([pattern]) => pattern.test(label));
  if (hit) return { path: hit[1], fresh: hit[2] };
  const slug = label.replace(/\s+/g, '_').slice(0, 40) || 'field';
  return { path: `${family || 'other'}.${slug}`, fresh: true };
}

const manifest = fs.readFileSync(path.join(root, 'reports/references/manifest.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
const pdfs = manifest.map((line) => {
  const [code, , , , fileType, localPath] = line.split(',');
  return { code, fileType, localPath };
}).filter((row) => row.fileType === 'pdf' && row.localPath);

const familyOf = familiesByCode();
const labels = new Map();
const censusRows = ['code,file,pages,curves,shading,images,cmyk,opacity,dash,text_render_modes,tj,tc,tw,tz,fonts'];
let failed = 0;

for (const row of pdfs) {
  const filePath = path.join(root, row.localPath);
  if (!fs.existsSync(filePath)) {
    failed += 1;
    continue;
  }
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
    const totals = { curves: 0, shading: 0, images: 0, cmyk: 0, opacity: 0, dash: 0, textRenderModes: 0, tj: 0, tc: 0, tw: 0, tz: 0 };
    const fonts = new Set();
    for (let index = 1; index <= doc.numPages; index += 1) {
      const page = await doc.getPage(index);
      const view = page.getViewport({ scale: 1 });
      const ops = await page.getOperatorList();
      const features = countFeatures(ops);
      for (const key of Object.keys(totals)) totals[key] += features[key] || 0;
      const read = readOperators(ops, page, { width: view.width, height: view.height });
      for (const name of read.fontNames.keys()) fonts.add(name);
      const family = familyOf.get(row.code) || 'other';
      for (const span of read.spans) {
        if (!looksLikeValue(span.text)) continue;
        const found = nearestLabel(span, read.spans);
        if (!found) continue;
        const key = normalizeLabel(found.text);
        if (!key || isValueLabel(key)) continue;
        const item = labels.get(key) || { frequency: 0, families: new Map(), codes: new Set(), side: found.side };
        item.frequency += 1;
        item.families.set(family, (item.families.get(family) || 0) + 1);
        if (item.codes.size < 8) item.codes.add(row.code);
        labels.set(key, item);
      }
    }
    censusRows.push([row.code, row.localPath, doc.numPages, totals.curves, totals.shading, totals.images, totals.cmyk, totals.opacity, totals.dash, totals.textRenderModes, totals.tj, totals.tc, totals.tw, totals.tz, [...fonts].join('|')].map(csv).join(','));
    await doc.destroy();
  } catch (error) {
    failed += 1;
    censusRows.push([row.code, row.localPath, 0, 'error', String(error.message || error), '', '', '', '', '', '', '', '', '', ''].map(csv).join(','));
  }
  if (censusRows.length % 25 === 0) process.stdout.write(`census ${censusRows.length - 1}/${pdfs.length}\n`);
}

const ranked = [...labels.entries()].sort((a, b) => b[1].frequency - a[1].frequency);
const inventory = ['normalized_label,frequency,families,sample_codes,side'];
const proposals = ['normalized_label,frequency,families,proposed_path,new_field'];
const newFields = new Map();
for (const [label, item] of ranked) {
  const families = [...item.families.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => `${name}:${count}`).join('|');
  inventory.push([label, item.frequency, families, [...item.codes].join('|'), item.side].map(csv).join(','));
}
for (const [label, item] of ranked.slice(0, 300)) {
  const topFamily = [...item.families.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'other';
  const families = [...item.families.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => `${name}:${count}`).join('|');
  const proposed = propose(label, topFamily);
  if (proposed.fresh) newFields.set(proposed.path, (newFields.get(proposed.path) || 0) + 1);
  proposals.push([label, item.frequency, families, proposed.path, proposed.fresh ? 'yes' : 'no'].map(csv).join(','));
}

fs.writeFileSync(path.join(root, 'reports/capability-census.csv'), `${censusRows.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'reports/label-inventory.csv'), `${inventory.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'reports/binding-proposals.csv'), `${proposals.join('\n')}\n`);
const proposalMap = new Map(ranked.slice(0, 300).map(([label, item]) => {
  const topFamily = [...item.families.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'other';
  return [label, propose(label, topFamily)];
}));

const pilotDir = path.join(root, 'reports/specs');
const unresolved = [['code', 'span', 'text', 'label', 'reason']];
const resolved = [['code', 'span', 'text', 'label', 'path', 'new_field']];
for (const file of fs.readdirSync(pilotDir).filter((name) => name.endsWith('.json'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(pilotDir, file), 'utf8'));
  for (const page of spec.pages || []) {
    const spans = [...page.spans, ...(page.table?.rows || []).flat().filter(Boolean)];
    for (const span of spans) {
      if (span.role && span.role !== 'dynamic') continue;
      if (!span.role && !looksLikeValue(span.text)) continue;
      const found = nearestLabel(span, spans);
      const key = found ? normalizeLabel(found.text) : '';
      const proposed = key ? proposalMap.get(key) : null;
      if (!found) unresolved.push([spec.code, span.id, span.text, '', 'no static label to the left or above'].map(csv).join(','));
      else if (!proposed) unresolved.push([spec.code, span.id, span.text, found.text, 'label is outside the top 300 proposals'].map(csv).join(','));
      else resolved.push([spec.code, span.id, span.text, found.text, proposed.path, proposed.fresh ? 'yes' : 'no'].map(csv).join(','));
    }
  }
}
fs.writeFileSync(path.join(root, 'reports/output/pilot-bindings-resolved.csv'), `${resolved.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'reports/output/pilot-bindings-unresolved.csv'), `${unresolved.join('\n')}\n`);
const featureTotals = censusRows.slice(1).reduce((sum, line) => {
  const cells = line.split(',');
  if (cells[3] === 'error') return sum;
  sum.curves += Number(cells[3]) || 0;
  sum.shading += Number(cells[4]) || 0;
  sum.images += Number(cells[5]) || 0;
  sum.cmyk += Number(cells[6]) || 0;
  sum.opacity += Number(cells[7]) || 0;
  sum.dash += Number(cells[8]) || 0;
  sum.textRenderModes += Number(cells[9]) || 0;
  sum.tj += Number(cells[10]) || 0;
  sum.files += 1;
  return sum;
}, { curves: 0, shading: 0, images: 0, cmyk: 0, opacity: 0, dash: 0, textRenderModes: 0, tj: 0, files: 0 });
console.log(JSON.stringify({
  pdfs: pdfs.length,
  failed,
  labels: labels.size,
  proposals: Math.min(300, ranked.length),
  newFields: newFields.size,
  resolved: resolved.length - 1,
  unresolved: unresolved.length - 1,
  featureTotals,
}, null, 2));
