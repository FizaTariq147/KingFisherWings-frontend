/**
 * Promote reports/specs/*.json that lack a measured face into measuredFaces.generated.ts.
 * Geometry comes from the pinned specs (same source as Fresa samples). Fresa identity text is stripped.
 *
 * Run: node scripts/promote-specs-to-measured.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = path.join(root, 'reports/specs');
const FACE_FILE = path.join(
  root,
  'src/features/reports/templates/official/measuredFaces.generated.ts',
);

/** Prefer `node scripts/promote-hawb-to-measured.mjs` for HAWB (demo→fieldSlots). */
const HAWB_CODES = new Set([
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
]);

const LABEL_KEYS = [
  [/shipper/i, 'shipper'],
  [/consignee/i, 'consignee'],
  [/notify party|^notify\b/i, 'notify'],
  [/job\s*(no|number)/i, 'jobNumber'],
  [/invoice\s*(no|number)/i, 'invoiceNumber'],
  [/h\.?a\.?w\.?b|house air/i, 'hawbNo'],
  [/h\.?b\.?l|bill of lading|b\/l no/i, 'hblNo'],
  [/m\.?a\.?w\.?b/i, 'mawbNo'],
  [/reference/i, 'referenceNo'],
];

function round(n) {
  return Math.round(Number(n) * 10) / 10;
}

function familyFor(code) {
  const c = code.toUpperCase();
  if (/HBL/.test(c)) return 'hbl';
  if (/DELIVERY|PROOF_OF_DELIVERY|^DO_/.test(c)) return 'delivery_order';
  if (/ADVANCE_SHIPPING|^WMS_/.test(c)) return 'wms_asn';
  if (/ARRIVAL|CARGO_ARRIVAL/.test(c)) return 'arrival_notice';
  if (/INVOICE|PROFORMA|DEBIT_NOTE|CREDIT_NOTE|PURCHASE_INVOICE/.test(c)) return 'invoice';
  if (/VOUCHER|TRIAL_BALANCE|PROFIT_AND_LOSS|^GL_|OUTSTANDING|AGING|STATEMENT_OF_ACCOUNTS/.test(c))
    return 'accounts';
  if (/QUOTATION/.test(c)) return 'quotation';
  if (/MAWB/.test(c)) return 'mawb';
  if (/LIST_REPORT|DAILY_STATUS|JOB_LIST|SHIPMENTS_WITH|PENDING_/.test(c)) return 'my_reports';
  return 'other';
}

function parseRgb(raw, fallback = [0, 0, 0]) {
  if (!raw) return fallback;
  if (typeof raw === 'string' && raw.startsWith('#')) {
    const hex = raw.slice(1);
    if (hex.length === 6) {
      return [
        Number.parseInt(hex.slice(0, 2), 16),
        Number.parseInt(hex.slice(2, 4), 16),
        Number.parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  if (typeof raw === 'string' && raw.includes(',')) {
    const parts = raw.split(',').map((p) => Number(p.trim()));
    if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
      // Spec colors are often 0..1 floats.
      if (parts[0] <= 1 && parts[1] <= 1 && parts[2] <= 1) {
        return parts.slice(0, 3).map((n) => Math.round(n * 255));
      }
      return parts.slice(0, 3).map((n) => Math.round(n));
    }
  }
  return fallback;
}

function nearWhite(rgb) {
  return rgb[0] > 245 && rgb[1] > 245 && rgb[2] > 245;
}

function pageFromSpecPage(pageSpec, fallbackPage) {
  const width = pageSpec?.width || fallbackPage?.width || 595;
  const height = pageSpec?.height || fallbackPage?.height || 842;
  const pageArea = width * height;
  const rects = [];
  for (const rect of pageSpec?.rects || []) {
    const w = Number(rect.width) || 0;
    const h = Number(rect.height) || 0;
    if (w < 0.4 || h < 0.4) continue;
    if (w * h > pageArea * 0.9) continue;
    const fill = parseRgb(rect.fill);
    const stroke = parseRgb(rect.stroke || rect.color);
    if (rect.fill && !nearWhite(fill)) {
      const chunkyBlack = fill[0] < 40 && fill[1] < 40 && fill[2] < 40 && Math.min(w, h) > 3.5;
      if (!chunkyBlack) {
        rects.push([
          round(rect.x),
          round(rect.y),
          round(w),
          round(h),
          fill[0],
          fill[1],
          fill[2],
          1,
        ]);
      }
    }
    if (rect.stroke || (!rect.fill && rect.strokeWidth)) {
      rects.push([
        round(rect.x),
        round(rect.y),
        round(w),
        round(h),
        stroke[0],
        stroke[1],
        stroke[2],
        0,
      ]);
    }
    if (rects.length >= 520) break;
  }

  const lines = [];
  const seen = new Set();
  for (const line of pageSpec?.lines || []) {
    const x1 = round(line.x1);
    const y1 = round(line.y1);
    const x2 = round(line.x2);
    const y2 = round(line.y2);
    const key = `${x1},${y1},${x2},${y2}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const color = parseRgb(line.color);
    lines.push([
      x1,
      y1,
      x2,
      y2,
      color[0],
      color[1],
      color[2],
      round(Math.max(0.35, Math.min(line.width || 0.6, 2.2))),
    ]);
    if (lines.length >= 900) break;
  }

  const texts = [];
  for (const span of pageSpec?.spans || []) {
    const text = String(span.text || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
    if (!text || /fresa/i.test(text)) continue;
    const size = round(span.size || 8);
    const bold = /bold/i.test(span.font || '') || size >= 12 ? 1 : 0;
    texts.push([text, round(span.x), round(span.y), size, bold]);
    if (texts.length >= 420) break;
  }

  return { rects, lines, texts, width, height };
}

function brandingSlot(pages, heightPt) {
  const texts = pages[0]?.texts || [];
  const top = [...texts].sort((a, b) => b[2] - a[2]).slice(0, 8);
  const hit = top.find((run) => run[0].length > 4) || top[0];
  if (!hit) return { x: 36, y: round(heightPt - 48), size: 11 };
  return { x: Math.max(24, hit[1]), y: hit[2], size: Math.max(9, Math.min(hit[3], 14)) };
}

function fieldSlots(pages) {
  const slots = [];
  const seen = new Set();
  for (const [text, x, y, size] of pages[0]?.texts || []) {
    for (const [pattern, key] of LABEL_KEYS) {
      if (seen.has(key) || !pattern.test(text)) continue;
      seen.add(key);
      slots.push({ key, x: round(x + 70), y, size: Math.min(size || 8, 9) });
    }
  }
  return slots;
}

function faceFromSpec(code, spec) {
  const multi = Array.isArray(spec.pages) && spec.pages.length > 0 ? spec.pages : null;
  const built = [];
  if (multi) {
    for (const page of multi) {
      // Some multi-page specs nest geometry under page; others reuse top-level for page 1 only.
      const pageSpec = {
        width: page.width || spec.page?.width,
        height: page.height || spec.page?.height,
        lines: page.lines || (built.length === 0 ? spec.lines : []),
        rects: page.rects || (built.length === 0 ? spec.rects : []),
        spans: page.spans || (built.length === 0 ? spec.spans : []),
      };
      built.push(pageFromSpecPage(pageSpec, spec.page));
    }
  } else {
    built.push(
      pageFromSpecPage(
        {
          width: spec.page?.width,
          height: spec.page?.height,
          lines: spec.lines,
          rects: spec.rects,
          spans: spec.spans,
        },
        spec.page,
      ),
    );
  }

  const media = spec.page?.mediaBox;
  const rotateDeg = Number(spec.page?.rotate) || 0;
  // Geometry from extract is in mediaBox space. Prefer mediaBox size when rotated
  // so we never draw portrait coords onto a landscape canvas (Format 2 scramble).
  const widthPt =
    rotateDeg && Array.isArray(media)
      ? media[2] - media[0]
      : built[0]?.width || spec.page?.width || 595;
  const heightPt =
    rotateDeg && Array.isArray(media)
      ? media[3] - media[1]
      : built[0]?.height || spec.page?.height || 842;
  const pages = built.map(({ rects, lines, texts }) => ({ rects, lines, texts }));

  return {
    code,
    name: code.replace(/_/g, ' '),
    family: familyFor(code),
    // Keep referenceFile unique per code (tests reject shared basenames).
    referenceFile: `${code}.spec.pdf`,
    samplePdfUrl: spec.source?.url || null,
    pageCount: pages.length,
    widthPt: round(widthPt),
    heightPt: round(heightPt),
    ...(rotateDeg ? { rotateDeg } : {}),
    branding: brandingSlot(pages, heightPt),
    fieldSlots: fieldSlots(pages),
    pages,
  };
}

function loadExistingFaces() {
  const text = fs.readFileSync(FACE_FILE, 'utf8');
  const assignAt = text.indexOf('= [');
  const start = assignAt >= 0 ? assignAt + 2 : -1;
  const end = text.lastIndexOf(']');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Could not parse measuredFaces.generated.ts');
  }
  return JSON.parse(text.slice(start, end + 1));
}

const existing = loadExistingFaces();
const byCode = new Map(existing.map((face) => [face.code, face]));
const specFiles = fs
  .readdirSync(SPEC_DIR)
  .filter((name) => name.endsWith('.json') && !name.includes('dynamic') && !name.includes('schema'));

let added = 0;
let skipped = 0;
for (const file of specFiles) {
  const code = file.replace(/\.json$/i, '');
  if (HAWB_CODES.has(code)) {
    // Dedicated HAWB promoter strips demo cargo into fieldSlots.
    skipped += 1;
    continue;
  }
  if (byCode.has(code)) {
    skipped += 1;
    continue;
  }
  try {
    const spec = JSON.parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf8'));
    const face = faceFromSpec(code, spec);
    const rules = face.pages.reduce(
      (sum, page) => sum + page.rects.length + page.lines.length + page.texts.length,
      0,
    );
    if (rules < 8) {
      console.warn('skip thin', code, rules);
      skipped += 1;
      continue;
    }
    byCode.set(code, face);
    added += 1;
  } catch (error) {
    console.warn('promote failed', code, error instanceof Error ? error.message : error);
  }
}

const faces = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
fs.writeFileSync(
  FACE_FILE,
  `import type { OfficialMeasuredFace } from './officialFace.types';\n\nexport const MEASURED_OFFICIAL_FACES: OfficialMeasuredFace[] = ${JSON.stringify(faces)};\n`,
);

const byFamily = {};
for (const face of faces) byFamily[face.family] = (byFamily[face.family] || 0) + 1;
console.log(JSON.stringify({ faces: faces.length, added, skipped, byFamily }, null, 2));
