import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import { inspectPdfFile } from "file:///D:/KingFisherWings-frontend/tools/reports/extract.mjs";
import { MEASURED_OFFICIAL_FACES } from "file:///D:/KingFisherWings-frontend/src/features/reports/templates/official/measuredFaces.generated.ts";

const root = "D:/KingFisherWings-frontend";
const outDir = path.join(root, "reports/output/production-b2");
const refs = {
  INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA: "reports/references/files/invoice-report-format-1-tax-invoice-india.pdf",
  HBL_DRAFT_REPORT_FORMAT_JASPER: "reports/references/files/hbl-draft-report-fomat-jasper.pdf",
  ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER: "reports/references/files/arrival-notice-report-format-1-cargo-arrival-notice-jasper.pdf",
};
const want = [
  "dueDate","etd","eta","incoterm","PO-44190","20DC","SL-90821","100200300","HARBUS44","US00HARB","12-DEC-2026","12-NOV-2026","02-NOV-2026","18-NOV-2026","FOB","0.00"
];

function near(a, b, t = 0.5) { return Math.abs(a - b) <= t; }
function sameRect(a, b) {
  return near(a.x, b.x) && near(a.y, b.y) && near(a.width || a.w, b.width || b.w) && near(a.height || a.h, b.height || b.h);
}

const faces = Object.fromEntries(MEASURED_OFFICIAL_FACES.map((face) => [face.code, face]));
const notes = [];
for (const [code, rel] of Object.entries(refs)) {
  const ref = await inspectPdfFile(path.join(root, rel));
  const gen = await inspectPdfFile(path.join(outDir, `${code}.pdf`));
  const refRects = ref.pageReads[0].rects;
  const genRects = gen.pageReads[0].rects;
  const unmatched = refRects.filter((rect) => !genRects.some((other) => sameRect(rect, other)));
  const buckets = { blackFill: 0, whiteFill: 0, otherFill: 0, stroke: 0, tiny: 0 };
  for (const rect of unmatched) {
    const area = (rect.width || 0) * (rect.height || 0);
    if (area < 4) buckets.tiny += 1;
    const kind = rect.kind ?? rect.fill ? "fill" : "stroke";
    const color = String(rect.color || rect.fill || rect.stroke || "");
    if (/^#000|^0,0,0|black/i.test(color) || (rect.r === 0 && rect.g === 0 && rect.b === 0)) buckets.blackFill += 1;
    else buckets.otherFill += 1;
  }
  const face = faces[code];
  const texts = face.pages[0].texts.filter((run) => /Kindly contact|Partial Payments|After Free|of 1|TAX INVOICE|BILL OF LADING|ARRIVAL NOTICE/.test(run[0] || ""));
  const blob = gen.pageReads[0].spans.map((s) => s.text).join(" | ");
  const present = Object.fromEntries(want.map((item) => [item, blob.includes(item)]));
  const boldTitles = gen.pageReads[0].spans.filter((s) => /TAX INVOICE|BILL OF LADING|ARRIVAL NOTICE|Northwind/.test(s.text)).map((s) => ({ text: s.text, font: s.font, x: s.x, y: s.y, size: s.size }));
  const sampleTitles = ref.pageReads[0].spans.filter((s) => /TAX INVOICE|BILL OF LADING|ARRIVAL NOTICE|FRESA/.test(s.text)).slice(0, 8).map((s) => ({ text: s.text.slice(0, 40), font: s.font, x: s.x, y: s.y, size: s.size }));
  const diff = PNG.sync.read(fs.readFileSync(path.join(outDir, `${code}.diff.png`)));
  const bands = [0, 0.15, 0.4, 0.7, 0.85, 1];
  const bandCounts = [];
  for (let i = 0; i < bands.length - 1; i += 1) {
    const y0 = Math.floor(diff.height * bands[i]);
    const y1 = Math.floor(diff.height * bands[i + 1]);
    let n = 0; let area = 0;
    for (let y = y0; y < y1; y += 1) {
      for (let x = 0; x < diff.width; x += 1) {
        area += 1;
        const p = (diff.width * y + x) << 2;
        if (diff.data[p] > 20 || diff.data[p + 1] > 20) n += 1;
      }
    }
    bandCounts.push({ from: bands[i], to: bands[i + 1], mismatches: n, ratio: Math.round((n / area) * 10000) / 10000 });
  }
  notes.push({
    code,
    face: { w: face.widthPt, h: face.heightPt, rects: face.pages[0].rects.length, lines: face.pages[0].lines.length, texts: face.pages[0].texts.length },
    unmatchedRects: unmatched.length,
    sampleRectKeys: Object.keys(refRects[0] || {}),
    sampleRectExample: refRects.slice(0, 2),
    unmatchedExample: unmatched.slice(0, 6),
    buckets,
    faceHits: texts.map((run) => ({ text: String(run[0]).slice(0, 50), x: run[1], y: run[2], size: run[3], bold: run[4] })),
    present,
    boldTitles,
    sampleTitles,
    bands: bandCounts,
  });
}
fs.writeFileSync(path.join(outDir, "notes.json"), JSON.stringify(notes, null, 2));
console.log("wrote notes", notes.map((n) => [n.code, n.unmatchedRects, n.buckets]));
