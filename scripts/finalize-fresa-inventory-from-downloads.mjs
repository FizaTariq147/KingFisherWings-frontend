/**
 * Build FRESA_REFERENCE_INVENTORY.json from downloaded PDFs + page HTML
 * (safe if long discovery run was interrupted before writing inventory).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pdfDir = path.join(root, 'tmp/fresa-references/pdfs');
const pageHtmlPath = path.join(root, 'tmp/fresa-references/page.html');
const dataDir = path.join(root, 'src/features/reports/data');

const localByName = new Map();
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'))) {
  const rows = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  for (const row of rows) {
    const key = String(row.name || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    if (key && !localByName.has(key)) {
      localByName.set(key, { ...row, store: f });
    }
  }
}

function matchLocal(name) {
  const key = name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (localByName.has(key)) return localByName.get(key);
  for (const [k, row] of localByName) {
    if (k.includes(key) || key.includes(k)) return row;
  }
  return null;
}

const files = fs.existsSync(pdfDir)
  ? fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
  : [];

const reports = [];
for (const file of files) {
  const abs = path.join(pdfDir, file);
  const buf = fs.readFileSync(abs);
  const name = file
    .replace(/\.pdf$/i, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const isPdf = buf.slice(0, 5).toString() === '%PDF-';
  const stub = !isPdf || buf.length < 8192;
  let pageCount = null;
  if (!stub) {
    try {
      pageCount = (await PDFDocument.load(buf, { ignoreEncryption: true })).getPageCount();
    } catch {
      pageCount = null;
    }
  }
  const matched = matchLocal(name);
  reports.push({
    name,
    file,
    downloadedPath: `tmp/fresa-references/pdfs/${file}`,
    accessStatus: stub ? 'unverified_stub_or_tiny' : 'downloaded',
    byteSize: buf.length,
    pageCount,
    sha256: createHash('sha256').update(buf).digest('hex'),
    localCode: matched?.code || null,
    localStore: matched?.store || null,
    localBlockSignature: matched ? blockSignature(matched.blocks) : null,
    implementationStatus: matched ? 'has_local_layout' : 'missing_local_layout',
    referenceVerified: !stub,
  });
}

const pageNames = [];
if (fs.existsSync(pageHtmlPath)) {
  const html = fs.readFileSync(pageHtmlPath, 'utf8');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n');
  const keep =
    /Report|Invoice|Format|Notice|Quotation|Manifest|HAWB|HBL|MAWB|ASN|WMS|Voucher|Aging|Trial|Outstanding/i;
  const seen = new Set();
  for (const line of text.split(/\n+/).map((l) => l.replace(/\s+/g, ' ').trim())) {
    if (line.length < 8 || line.length > 140) continue;
    if (!keep.test(line)) continue;
    const k = line.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    pageNames.push(line);
  }
}

const downloadedNames = new Set(reports.map((r) => r.name.toLowerCase()));
const unresolved = pageNames
  .filter((n) => ![...downloadedNames].some((d) => d.includes(n.toLowerCase()) || n.toLowerCase().includes(d)))
  .map((name) => ({
    name,
    accessStatus: 'unavailable',
    error: 'No downloaded PDF matched this page name after discovery pass',
    referenceVerified: false,
    implementationStatus: matchLocal(name) ? 'has_local_layout_unverified' : 'missing_local_layout',
    localCode: matchLocal(name)?.code || null,
  }));

const inventory = {
  sourceUrl: 'https://fresatechnologies.com/sample-report-formats/',
  discoveredAt: new Date().toISOString(),
  note: 'Finalized from on-disk PDF downloads (+ page HTML names). List reports on Fresa are often XLSX — recorded as unresolved PDF.',
  pageNameCount: pageNames.length,
  reports: [...reports, ...unresolved],
  summary: {
    downloadedOk: reports.filter((r) => r.accessStatus === 'downloaded').length,
    stubs: reports.filter((r) => r.accessStatus === 'unverified_stub_or_tiny').length,
    unresolvedPageNames: unresolved.length,
    matchedLocal: reports.filter((r) => r.localCode).length,
    missingLocal: reports.filter((r) => !r.localCode).length,
  },
};

fs.writeFileSync(
  path.join(dataDir, 'FRESA_REFERENCE_INVENTORY.json'),
  `${JSON.stringify(inventory, null, 2)}\n`,
  'utf8',
);

const md = [
  '# Fresa reference inventory (finalized from downloads)',
  '',
  `- Downloaded OK: **${inventory.summary.downloadedOk}**`,
  `- Tiny/stub (unverified): **${inventory.summary.stubs}**`,
  `- Page names without PDF match: **${inventory.summary.unresolvedPageNames}**`,
  `- Matched local layout: **${inventory.summary.matchedLocal}**`,
  `- Missing local layout: **${inventory.summary.missingLocal}**`,
  '',
  '## Unresolved / unverified (do not invent)',
  '',
  ...[...reports.filter((r) => !r.referenceVerified), ...unresolved]
    .slice(0, 80)
    .map((r) => `- ${r.name} — ${r.accessStatus}${r.error ? ` (${r.error})` : ''}`),
  '',
];
fs.writeFileSync(path.join(dataDir, 'FRESA_REFERENCE_INVENTORY.md'), md.join('\n'), 'utf8');
console.log(JSON.stringify(inventory.summary, null, 2));
