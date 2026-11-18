/**
 * Build 10 before/after crop sheets across families for the Track A report.
 * Uses Poppler pdftoppm on reference vs rendered PDFs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const root = process.cwd();
const outDir = path.join(root, 'reports/output/track-a/crops');
fs.mkdirSync(outDir, { recursive: true });

const families = [
  { code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA', family: 'invoice' },
  { code: 'HBL_DRAFT_REPORT_FORMAT_JASPER', family: 'hbl' },
  { code: 'HBL_DRAFT_REPORT_FORMAT_122', family: 'hbl-formbg' },
  { code: 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER', family: 'arrival' },
  { code: 'AIR_QUOTATION_REPORT_FORMAT', family: 'quotation' },
  { code: 'ADVANCE_SHIPPING_NOTE', family: 'asn' },
  { code: 'DAILY_STATUS_REPORT_FORMAT_1', family: 'status' },
  { code: 'CONTAINER_OUTTURN_REPORT_FORMAT', family: 'manifest' },
  { code: 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC', family: 'arabic' },
  { code: 'CARTING_CONFIRMATION_REPORT_FORMAT', family: 'confirmation' },
];

function codeToFile(code) {
  const mapped = fs.readFileSync('reports/references/code-map.csv', 'utf8');
  const line = mapped.split(/\r?\n/).find((row) => row.startsWith(`${code},`));
  return line?.match(/reports\/references\/files\/[^,]+/)?.[0];
}

function crop(png, box) {
  const image = PNG.sync.read(fs.readFileSync(png));
  const x0 = Math.max(0, Math.floor(box.x0));
  const y0 = Math.max(0, Math.floor(box.y0));
  const x1 = Math.min(image.width, Math.ceil(box.x1));
  const y1 = Math.min(image.height, Math.ceil(box.y1));
  const width = Math.max(1, x1 - x0);
  const height = Math.max(1, y1 - y0);
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = ((y0 + y) * image.width + (x0 + x)) * 4;
      const dst = (y * width + x) * 4;
      out.data[dst] = image.data[src];
      out.data[dst + 1] = image.data[src + 1];
      out.data[dst + 2] = image.data[src + 2];
      out.data[dst + 3] = 255;
    }
  }
  return out;
}

function sideBySide(left, right) {
  const gap = 8;
  const width = left.width + right.width + gap;
  const height = Math.max(left.height, right.height);
  const out = new PNG({ width, height });
  out.data.fill(255);
  for (const [image, ox] of [[left, 0], [right, left.width + gap]]) {
    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const src = (y * image.width + x) * 4;
        const dst = (y * width + ox + x) * 4;
        out.data[dst] = image.data[src];
        out.data[dst + 1] = image.data[src + 1];
        out.data[dst + 2] = image.data[src + 2];
        out.data[dst + 3] = 255;
      }
    }
  }
  return out;
}

const rows = [];
for (const item of families) {
  const ref = codeToFile(item.code);
  const rendered = path.join('reports/output', `${item.code}.pdf`);
  if (!ref || !fs.existsSync(rendered)) {
    rows.push({ ...item, ok: false, reason: 'missing pdf' });
    continue;
  }
  const dir = path.join(outDir, item.code);
  fs.mkdirSync(dir, { recursive: true });
  const refPrefix = path.join(dir, 'ref');
  const outPrefix = path.join(dir, 'out');
  execFileSync('pdftoppm', ['-png', '-r', '72', '-f', '1', '-l', '1', ref, refPrefix]);
  execFileSync('pdftoppm', ['-png', '-r', '72', '-f', '1', '-l', '1', rendered, outPrefix]);
  const refPng = fs.readdirSync(dir).find((name) => name.startsWith('ref') && name.endsWith('.png'));
  const outPng = fs.readdirSync(dir).find((name) => name.startsWith('out') && name.endsWith('.png'));
  const refImage = path.join(dir, refPng);
  const outImage = path.join(dir, outPng);
  const meta = PNG.sync.read(fs.readFileSync(refImage));
  const box = { x0: 0, y0: 0, x1: Math.min(meta.width, 420), y1: Math.min(meta.height, 280) };
  const sheet = sideBySide(crop(refImage, box), crop(outImage, box));
  const sheetPath = path.join(outDir, `${item.family}__${item.code}.png`);
  fs.writeFileSync(sheetPath, PNG.sync.write(sheet));
  rows.push({ ...item, ok: true, sheet: sheetPath.replace(/\\/g, '/') });
  console.log(JSON.stringify(rows.at(-1)));
}
fs.writeFileSync(path.join(outDir, 'index.json'), `${JSON.stringify(rows, null, 2)}\n`);
