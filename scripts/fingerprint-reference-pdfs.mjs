/**
 * Phase 2 helper — fingerprint downloaded reference PDFs (page count, size, stub detection).
 * Groups by coarse visual fingerprint; marks tiny/non-PDF stubs as unverified.
 *
 * Usage: node scripts/fingerprint-reference-pdfs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pdfDir = path.join(root, 'tmp/fresa-references/pdfs');
const invPath = path.join(root, 'src/features/reports/data/FRESA_REFERENCE_INVENTORY.json');
const outPath = path.join(root, 'src/features/reports/data/FRESA_REFERENCE_FINGERPRINTS.json');

if (!fs.existsSync(pdfDir)) {
  console.error('No pdfs dir — run discover-fresa-sample-reports.mjs first');
  process.exit(1);
}

const inventory = fs.existsSync(invPath)
  ? JSON.parse(fs.readFileSync(invPath, 'utf8'))
  : { reports: [] };

const byPath = new Map(
  (inventory.reports || [])
    .filter((r) => r.downloadedPath)
    .map((r) => [r.downloadedPath.replace(/\\/g, '/'), r]),
);

const files = fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
const rows = [];

for (const file of files) {
  const abs = path.join(pdfDir, file);
  const buf = fs.readFileSync(abs);
  const rel = `tmp/fresa-references/pdfs/${file}`;
  const inv = byPath.get(rel);
  const head = buf.slice(0, 8).toString('utf8');
  const isPdf = head.startsWith('%PDF');
  let pageCount = null;
  let parseError = null;
  if (isPdf && buf.length >= 8192) {
    try {
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      pageCount = doc.getPageCount();
    } catch (err) {
      parseError = err instanceof Error ? err.message : String(err);
    }
  }
  const stub = !isPdf || buf.length < 8192;
  const fingerprint = createHash('sha256')
    .update(`${pageCount || 0}|${buf.length}|${buf.slice(0, 2048)}`)
    .digest('hex')
    .slice(0, 16);

  rows.push({
    file,
    path: rel,
    name: inv?.name || file.replace(/\.pdf$/i, ''),
    localCode: inv?.localCode || null,
    byteSize: buf.length,
    isPdf,
    stub,
    pageCount,
    parseError,
    fingerprint,
    referenceStatus: stub
      ? 'unverified_stub_or_tiny'
      : parseError
        ? 'downloaded_parse_failed'
        : 'downloaded_ok',
  });
}

const byFp = new Map();
for (const r of rows) {
  if (r.stub) continue;
  if (!byFp.has(r.fingerprint)) byFp.set(r.fingerprint, []);
  byFp.get(r.fingerprint).push(r.file);
}

const out = {
  generatedAt: new Date().toISOString(),
  totalFiles: rows.length,
  ok: rows.filter((r) => r.referenceStatus === 'downloaded_ok').length,
  stubs: rows.filter((r) => r.stub).length,
  parseFailed: rows.filter((r) => r.referenceStatus === 'downloaded_parse_failed').length,
  uniqueFingerprints: byFp.size,
  identicalReferenceGroups: [...byFp.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([fingerprint, files]) => ({ fingerprint, files })),
  files: rows.sort((a, b) => a.file.localeCompare(b.file)),
};

fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(
  JSON.stringify(
    {
      totalFiles: out.totalFiles,
      ok: out.ok,
      stubs: out.stubs,
      parseFailed: out.parseFailed,
      uniqueFingerprints: out.uniqueFingerprints,
      identicalReferenceGroups: out.identicalReferenceGroups.length,
    },
    null,
    2,
  ),
);
