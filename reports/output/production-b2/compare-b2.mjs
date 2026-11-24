import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { inspectPdfFile, proposeImageClass } from "file:///D:/KingFisherWings-frontend/tools/reports/extract.mjs";

const root = "D:/KingFisherWings-frontend";
const outDir = path.join(root, "reports/output/production-b2");
const refs = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: "reports/references/files/invoice-report-format-1-tax-invoice-india.pdf",
  HBL_DRAFT_REPORT_FORMAT_JASPER: "reports/references/files/hbl-draft-report-fomat-jasper.pdf",
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: "reports/references/files/arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf",
};
const boxes = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: { x: 500, y: 812, maxWidth: 78, maxHeight: 22 },
  HBL_DRAFT_REPORT_FORMAT_JASPER: { x: 430, y: 808, maxWidth: 90, maxHeight: 24 },
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: { x: 430, y: 800, maxWidth: 90, maxHeight: 24 },
};
const probes = [
  "Northwind Freight LLC",
  "Harbor Steel Co",
  "Gulf Metals Trading",
  "INV-2026-0142",
  "JOB-FE-11-26-0142",
  "SHP-88421",
  "HBL-HOU-4421",
  "MBL-MAEU-9981",
  "MAERSK DENVER",
  "Houston",
  "Jebel Ali",
  "MSCU1234567",
  "Steel valves",
  "8400 KGS",
  "18.4 CBM",
  "1850.00",
  "Ocean freight",
  "First Harbor Bank",
  "FRESA",
  "fresa",
  "Powered",
  "TAX INVOICE",
  "BILL OF LADING",
  "ARRIVAL NOTICE",
];

function near(a, b, t = 0.5) { return Math.abs(a - b) <= t; }
function matchGeom(item, others, keys) {
  return others.some((other) => keys.every((key) => near(item[key], other[key], 0.5)));
}

function summarize(read) {
  const page = read.pageReads[0];
  const images = (page.images || []).map((image) => ({
    x: image.x, y: image.y, width: image.width, height: image.height,
    class: proposeImageClass(image, page.height, page.width),
    barcode: image.barcode || null,
  }));
  const fonts = {};
  for (const span of page.spans || []) fonts[span.font] = (fonts[span.font] || 0) + 1;
  return {
    pages: read.pages,
    width: read.width,
    height: read.height,
    media: page.pageBox,
    lines: page.lines.length,
    rects: page.rects.length,
    spans: page.spans.length,
    images,
    fonts,
    texts: page.spans.map((span) => ({ text: span.text, x: span.x, y: span.y, size: span.size, font: span.font, width: span.width })),
  };
}

function raster(pdf, prefix) {
  execFileSync("pdftoppm", ["-png", "-r", "150", "-f", "1", "-l", "1", pdf, prefix], { stdio: "pipe" });
  const file = `${prefix}-1.png`;
  return PNG.sync.read(fs.readFileSync(file));
}

function mask(png, pageW, pageH, box) {
  const scale = 150 / 72;
  const x0 = Math.max(0, Math.floor(box.x * scale));
  const y0 = Math.max(0, Math.floor((pageH - (box.y + box.maxHeight)) * scale));
  const x1 = Math.min(png.width, Math.ceil((box.x + box.maxWidth) * scale));
  const y1 = Math.min(png.height, Math.ceil((pageH - box.y) * scale));
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (png.width * y + x) << 2;
      png.data[i] = 255; png.data[i + 1] = 255; png.data[i + 2] = 255; png.data[i + 3] = 255;
    }
  }
  return { x0, y0, x1, y1 };
}

const report = [];
for (const [code, refRel] of Object.entries(refs)) {
  const gen = path.join(outDir, `${code}.pdf`);
  const ref = path.join(root, refRel);
  const left = summarize(await inspectPdfFile(ref));
  const right = summarize(await inspectPdfFile(gen));
  const lineKeys = ["x1", "y1", "x2", "y2"];
  const rectKeys = ["x", "y", "width", "height"];
  const refLines = left.texts.length ? (await inspectPdfFile(ref)).pageReads[0].lines : [];
  const genRead = await inspectPdfFile(gen);
  const refRead = await inspectPdfFile(ref);
  const matchedLines = refRead.pageReads[0].lines.filter((line) => matchGeom(line, genRead.pageReads[0].lines, lineKeys)).length;
  const matchedRects = refRead.pageReads[0].rects.filter((rect) => matchGeom(rect, genRead.pageReads[0].rects, rectKeys)).length;
  const shared = [];
  const used = new Set();
  for (const span of refRead.pageReads[0].spans) {
    const hit = genRead.pageReads[0].spans.find((other, index) => !used.has(index) && other.text === span.text);
    if (!hit) continue;
    used.add(genRead.pageReads[0].spans.indexOf(hit));
    shared.push({ text: span.text.slice(0, 60), dx: Math.round((hit.x - span.x) * 10) / 10, dy: Math.round((hit.y - span.y) * 10) / 10, ref: [span.x, span.y], gen: [hit.x, hit.y], size: [span.size, hit.size] });
  }
  const shifted = shared.filter((item) => Math.abs(item.dx) > 0.5 || Math.abs(item.dy) > 0.5);
  const found = {};
  const blob = genRead.pageReads[0].spans.map((span) => span.text).join("\n");
  for (const probe of probes) found[probe] = blob.includes(probe);
  const refBlob = refRead.pageReads[0].spans.map((span) => span.text).join("\n");
  const a = raster(ref, path.join(outDir, `${code}.ref`));
  const b = raster(gen, path.join(outDir, `${code}.gen`));
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  function crop(src) {
    const out = new PNG({ width, height });
    for (let y = 0; y < height; y += 1) {
      src.data.copy(out.data, y * width * 4, y * src.width * 4, y * src.width * 4 + width * 4);
    }
    return out;
  }
  const ca = crop(a); const cb = crop(b);
  const maskBox = mask(ca, left.height, left.height, boxes[code]);
  mask(cb, right.height, right.height, boxes[code]);
  const diff = new PNG({ width, height });
  const mismatches = pixelmatch(ca.data, cb.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(path.join(outDir, `${code}.diff.png`), PNG.sync.write(diff));
  report.push({
    code,
    page: { ref: [left.width, left.height, left.pages], gen: [right.width, right.height, right.pages] },
    geometry: {
      refLines: refRead.pageReads[0].lines.length,
      genLines: genRead.pageReads[0].lines.length,
      matchedLines,
      refRects: refRead.pageReads[0].rects.length,
      genRects: genRead.pageReads[0].rects.length,
      matchedRects,
    },
    images: { ref: left.images, gen: right.images },
    fonts: { ref: left.fonts, gen: right.fonts },
    sharedLabels: shared.length,
    shiftedLabels: shifted.slice(0, 25),
    shiftedCount: shifted.length,
    probes: found,
    fresaInGenerated: /fresa/i.test(blob),
    fresaInReference: /fresa/i.test(refBlob),
    raster: {
      refPx: [a.width, a.height],
      genPx: [b.width, b.height],
      compared: [width, height],
      mismatches,
      ratio: Math.round((mismatches / (width * height)) * 10000) / 10000,
      mask: maskBox,
    },
  });
  console.log(code, "pages", right.pages, "raster", report.at(-1).raster.ratio, "shifted", shifted.length, "/", shared.length);
}
fs.writeFileSync(path.join(outDir, "compare.json"), JSON.stringify(report, null, 2));
