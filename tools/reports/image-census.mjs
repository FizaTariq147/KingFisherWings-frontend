/**
 * Image census over every in-scope PDF: box, page fraction, class.
 * Reclassifies from existing specs when present; otherwise extracts.
 * Run: node tools/reports/image-census.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSpec, proposeImageClass } from './extract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_OF_SCOPE = new Set(['BARCODE_AWB_REPORT_FORMAT', 'STANDARD_INVOICE_RPM_REF_79']);
const OUT_CSV = path.join(root, 'reports/image-census.csv');
const OUT_OTHER = path.join(root, 'reports/image-census-other.md');
const OUT_SUMMARY = path.join(root, 'reports/image-census-summary.md');

function csv(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function pageArea(page) {
  return Math.max(page.width || 595, 1) * Math.max(page.height || 842, 1);
}

function imagesFromSpec(spec) {
  const pages = spec.pages?.length ? spec.pages : [spec];
  const rows = [];
  pages.forEach((page, pageIndex) => {
    const width = page.width || spec.page?.width || 595;
    const height = page.height || spec.page?.height || 842;
    const area = Math.max(width, 1) * Math.max(height, 1);
    for (const image of page.images || []) {
      const cls = proposeImageClass(image, height, width);
      const fraction = (Math.max(image.width, 0) * Math.max(image.height, 0)) / area;
      rows.push({
        code: spec.code,
        page: pageIndex + 1,
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height,
        fraction: Number(fraction.toFixed(6)),
        class: cls,
        previousClass: image.proposedClass || '',
      });
    }
  });
  return rows;
}

const census = fs.readFileSync(path.join(root, 'reports/capability-census.csv'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.split(',')[0])
  .filter((code) => code && !OUT_OF_SCOPE.has(code));

const all = [];
const classCounts = new Map();
const otherDocs = new Set();
let index = 0;

for (const code of census) {
  index += 1;
  const specPath = path.join(root, 'reports/specs', `${code}.json`);
  let rows = [];
  try {
    if (fs.existsSync(specPath)) {
      const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
      rows = imagesFromSpec(spec);
    } else {
      const extracted = await extractSpec(code);
      rows = imagesFromSpec(extracted);
    }
  } catch (error) {
    console.error(JSON.stringify({ n: index, code, error: String(error.message || error) }));
    continue;
  }
  for (const row of rows) {
    all.push(row);
    classCounts.set(row.class, (classCounts.get(row.class) || 0) + 1);
    if (row.class === 'other') otherDocs.add(row.code);
  }
  if (index % 50 === 0 || index === census.length) {
    console.log(JSON.stringify({ n: index, of: census.length, images: all.length, otherDocs: otherDocs.size }));
  }
}

const header = 'code,page,x,y,width,height,page_fraction,class,previous_class\n';
fs.writeFileSync(OUT_CSV, header + all.map((row) => [
  row.code, row.page, row.x, row.y, row.width, row.height, row.fraction, row.class, row.previousClass,
].map(csv).join(',')).join('\n') + (all.length ? '\n' : ''));

const formBackground = [...new Set(all.filter((row) => row.class === 'form_background').map((row) => row.code))].sort();
const summary = [
  '# Image census',
  '',
  `Documents scanned: ${census.length}`,
  `Images: ${all.length}`,
  '',
  '## Class counts',
  '',
  ...[...classCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => `- ${name}: ${count}`),
  '',
  `## form_background documents (${formBackground.length})`,
  '',
  ...formBackground.map((code) => `- ${code}`),
  '',
  `## Documents with an \`other\` image (${otherDocs.size})`,
  '',
  ...[...otherDocs].sort().map((code) => `- ${code}`),
  '',
];
fs.writeFileSync(OUT_SUMMARY, `${summary.join('\n')}\n`);
fs.writeFileSync(OUT_OTHER, [
  '# Documents containing an `other` image',
  '',
  ...[...otherDocs].sort().map((code) => `- ${code}`),
  '',
].join('\n'));

console.log(JSON.stringify({
  documents: census.length,
  images: all.length,
  classCounts: Object.fromEntries(classCounts),
  formBackground: formBackground.length,
  otherDocs: otherDocs.size,
  csv: OUT_CSV,
}));
