import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import JsBarcode from 'jsbarcode';
import { inspectPdfFile } from '../../../tools/reports/extract.mjs';

function code128BitString(value) {
  const target = {};
  JsBarcode(target, value, { format: 'CODE128', displayValue: false, margin: 0, width: 2, height: 10 });
  return (target.encodings || []).map((item) => item.data || '').join('');
}

const root = path.resolve('D:/KingFisherWings-frontend');
const outDir = path.join(root, 'reports/output/production-b2');
const refs = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf',
  HBL_DRAFT_REPORT_FORMAT_JASPER: 'reports/references/files/hbl-draft-report-fomat-jasper.pdf',
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER:
    'reports/references/files/arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf',
};
const boxes = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: { x: 27.4, y: 784.6, maxWidth: 82, maxHeight: 40 },
  HBL_DRAFT_REPORT_FORMAT_JASPER: { x: 360, y: 627, maxWidth: 155, maxHeight: 75 },
  // Painted Kingfisher mark. The 552 pt letterhead allowance is not masked.
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: { x: 21, y: 742.7, maxWidth: 195.8, maxHeight: 77 },
};
const payloads = {
  HBL_DRAFT_REPORT_FORMAT_JASPER: { value: 'HBL-HOU-4421', x: 380, y: 795, width: 194, height: 17 },
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: { value: 'SHP-88421', x: 350, y: 211, width: 220, height: 35 },
};

function raster(pdf, prefix) {
  execFileSync('pdftoppm', ['-png', '-r', '150', '-f', '1', '-l', '1', pdf, prefix], { stdio: 'pipe' });
  return PNG.sync.read(fs.readFileSync(`${prefix}-1.png`));
}

function mask(png, pageH, box) {
  const scale = 150 / 72;
  const x0 = Math.max(0, Math.floor(box.x * scale));
  const y0 = Math.max(0, Math.floor((pageH - (box.y + box.maxHeight)) * scale));
  const x1 = Math.min(png.width, Math.ceil((box.x + box.maxWidth) * scale));
  const y1 = Math.min(png.height, Math.ceil((pageH - box.y) * scale));
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (png.width * y + x) << 2;
      png.data[i] = 255;
      png.data[i + 1] = 255;
      png.data[i + 2] = 255;
      png.data[i + 3] = 255;
    }
  }
  return { x0, y0, x1, y1 };
}

function crop(src, width, height) {
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    src.data.copy(out.data, y * width * 4, y * src.width * 4, y * src.width * 4 + width * 4);
  }
  return out;
}

const report = [];
for (const [code, refRel] of Object.entries(refs)) {
  const genPath = path.join(outDir, `${code}.pdf`);
  const ref = await inspectPdfFile(path.join(root, refRel));
  const gen = await inspectPdfFile(genPath);
  const a = raster(path.join(root, refRel), path.join(outDir, `${code}.ref`));
  const b = raster(genPath, path.join(outDir, `${code}.gen`));
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const ca = crop(a, width, height);
  const cb = crop(b, width, height);
  const maskBox = mask(ca, ref.height, boxes[code]);
  mask(cb, gen.height, boxes[code]);
  const diff = new PNG({ width, height });
  const mismatches = pixelmatch(ca.data, cb.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(path.join(outDir, `${code}.diff.png`), PNG.sync.write(diff));
  const payload = payloads[code];
  let barcode = null;
  if (payload) {
    const bars = gen.pageReads[0].rects
      .filter((rect) => Math.abs(rect.y - payload.y) < 0.6 && Math.abs(rect.height - payload.height) < 0.6 && String(rect.fill || '').startsWith('0.000'))
      .sort((left, right) => left.x - right.x);
    const bits = code128BitString(payload.value);
    const padded = `${'0'.repeat(10)}${bits}${'0'.repeat(10)}`;
    const moduleWidth = payload.width / padded.length;
    barcode = {
      bars: bars.length,
      firstX: bars[0] ? Math.round(bars[0].x * 10) / 10 : null,
      lastX: bars.length ? Math.round((bars.at(-1).x + bars.at(-1).width) * 10) / 10 : null,
      expectedSpan: [payload.x, Math.round((payload.x + payload.width) * 10) / 10],
      moduleWidth: Math.round(moduleWidth * 1000) / 1000,
      bits: padded.length,
    };
  }
  const text = gen.pageReads[0].spans.map((span) => span.text).join('\n');
  report.push({
    code,
    page: { ref: [ref.width, ref.height, ref.pages], gen: [gen.width, gen.height, gen.pages] },
    logo: gen.pageReads[0].images,
    sampleImages: ref.pageReads[0].images,
    barcode,
    fresa: /fresa/i.test(text),
    raster: {
      px: [a.width, a.height, b.width, b.height],
      mismatches,
      ratio: Math.round((mismatches / (width * height)) * 10000) / 10000,
      mask: maskBox,
    },
  });
  console.log(code, report.at(-1).raster.ratio, 'logo', JSON.stringify(gen.pageReads[0].images));
}
fs.writeFileSync(path.join(outDir, 'compare-after.json'), JSON.stringify(report, null, 2));
