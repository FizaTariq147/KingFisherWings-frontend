/**
 * Fail if a classic Generate PDF file changed, or if a fixed fixture raster
 * differs from the stored 150 dpi snapshot.
 *
 *   node tools/reports/guard-classic.mjs
 *   node tools/reports/guard-classic.mjs --init
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const listFile = path.join(root, 'docs/reports/CLASSIC_FILES.md');
const snapDir = path.join(root, 'reports/classic-snapshots');
const hashFile = path.join(snapDir, 'hashes.json');
const workDir = path.join(snapDir, 'work');
const kinds = ['invoice', 'quotation', 'credit-note', 'debit-note'];

function classicFiles() {
  const text = fs.readFileSync(listFile, 'utf8');
  const files = [...text.matchAll(/`(src\/[^`]+)`/g)].map((match) => match[1].replace(/\\/g, '/'));
  // The markdown list uses leading "- src/..." without backticks as well.
  const bare = [...text.matchAll(/^- (src\/\S+)/gm)].map((match) => match[1].replace(/\\/g, '/'));
  return [...new Set([...files, ...bare])];
}

function hashFiles(files) {
  const hashes = {};
  for (const relative of files) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) throw new Error(`Missing classic file ${relative}`);
    hashes[relative] = createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
  }
  return hashes;
}

function renderFixtures() {
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });
  execFileSync(
    process.execPath,
    [path.join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--project', 'unit', 'src/features/invoices/utils/classicPdfFixtures.test.ts'],
    {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, CLASSIC_FIXTURE_DIR: workDir, TZ: 'UTC' },
    },
  );
}

function raster(pdfName) {
  const prefix = path.join(workDir, pdfName.replace(/\.pdf$/, ''));
  execFileSync('pdftoppm', ['-png', '-r', '150', path.join(workDir, pdfName), prefix], { stdio: 'ignore' });
  return fs.readdirSync(workDir).filter((name) => name.startsWith(`${path.basename(prefix)}-`) && name.endsWith('.png')).sort();
}

function samePng(leftPath, rightPath) {
  const left = PNG.sync.read(fs.readFileSync(leftPath));
  const right = PNG.sync.read(fs.readFileSync(rightPath));
  if (left.width !== right.width || left.height !== right.height) return false;
  const diff = Buffer.alloc(left.width * left.height * 4);
  const mismatches = pixelmatch(left.data, right.data, diff, left.width, left.height, { threshold: 0 });
  return mismatches === 0;
}

const init = process.argv.includes('--init');
const files = classicFiles();
if (!files.length) throw new Error('CLASSIC_FILES.md has no src paths');
const hashes = hashFiles(files);
renderFixtures();
const pages = {};
for (const kind of kinds) {
  const pdf = `${kind}.pdf`;
  if (!fs.existsSync(path.join(workDir, pdf))) throw new Error(`Fixture PDF missing: ${pdf}`);
  pages[kind] = raster(pdf);
}

if (init || !fs.existsSync(hashFile)) {
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(hashFile, `${JSON.stringify(hashes, null, 2)}\n`);
  for (const kind of kinds) {
    pages[kind].forEach((name, index) => {
      const target = path.join(snapDir, `${kind}-${index + 1}.png`);
      fs.copyFileSync(path.join(workDir, name), target);
    });
  }
  console.log(JSON.stringify({ wrote: snapDir, files: files.length, pages }));
  process.exit(0);
}

const stored = JSON.parse(fs.readFileSync(hashFile, 'utf8'));
const hashFailures = [];
for (const relative of files) {
  if (stored[relative] !== hashes[relative]) hashFailures.push(relative);
}
for (const relative of Object.keys(stored)) {
  if (!files.includes(relative)) hashFailures.push(`removed ${relative}`);
}
const rasterFailures = [];
for (const kind of kinds) {
  pages[kind].forEach((name, index) => {
    const storedPng = path.join(snapDir, `${kind}-${index + 1}.png`);
    if (!fs.existsSync(storedPng) || !samePng(path.join(workDir, name), storedPng)) {
      rasterFailures.push(`${kind} page ${index + 1}`);
    }
  });
  const extras = fs.readdirSync(snapDir).filter((name) => name.startsWith(`${kind}-`) && name.endsWith('.png'));
  if (extras.length !== pages[kind].length) rasterFailures.push(`${kind} page count ${pages[kind].length} vs ${extras.length}`);
}
if (hashFailures.length || rasterFailures.length) {
  console.error(JSON.stringify({ hashFailures, rasterFailures }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, files: files.length, pages: Object.fromEntries(kinds.map((kind) => [kind, pages[kind].length])) }));
