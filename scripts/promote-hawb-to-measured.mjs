/**
 * Promote the five official HAWB specs into measuredFaces.generated.ts.
 * Geometry comes from pinned Fresa extracts; demo/Fresa identity spans are
 * stripped into fieldSlots so Generate stamps live/org/catalogue data.
 *
 * Run: node scripts/promote-hawb-to-measured.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = path.join(root, 'reports/specs');
const FACE_FILE = path.join(
  root,
  'src/features/reports/templates/official/measuredFaces.generated.ts',
);

const HAWB_CODES = [
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
];

/** Demo / variable cargo — remove from static face, expose as fieldSlots. */
const DEMO_VALUE =
  /BABU|AL NASER|FRESA|176-?23456882|MAA\/DXB|1,?250\.00|EK9876|18-FEB|20-FEB|STC:|CTN\s|N\.V\.D|AS PER INV|N\.C\.V|^NIL$|^INR$|^DXB$|^PP$|AS ARRANGED|^RAM$|PAPER CUPS|DIMS IN|CHENNAI, INDIA|DUBAI INTERNATIONAL|NEELANKARAI|MAKTHOOM|UNITED ARAB|SHARJAH|PHONE:|04-233|CAE190028|GLOBAL EXPORT|GULF IMPORT|^100$|^0\.00$|TOTAL\s*:\s*\(|EMIRATES|^K$|^S$|PACKAGES ONLY|AS AGENT FOR THE CARRIER/i;

function round(n) {
  return Math.round(Number(n) * 10) / 10;
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

function classifyKey(text, x, y, widthPt, heightPt) {
  const t = String(text || '').trim();
  if (/fresa/i.test(t)) return null;
  if (/BABU|SECTOR PT|GLOBAL EXPORT/i.test(t) || (y > heightPt * 0.9 && x < widthPt * 0.45)) {
    if (/144\/|NEELANKARAI|GKM|MUTHUSAMY/i.test(t)) return 'shipper';
    if (/BABU|SECTOR|GLOBAL EXPORT/i.test(t)) return 'shipper';
  }
  if (/AL NASER|GULF IMPORT|MAKTHOOM|SHARJAH|UNITED ARAB/i.test(t)) {
    if (y > heightPt * 0.78) return 'consignee';
    if (y > heightPt * 0.65) return 'notify';
    return 'consignee';
  }
  if (/MAA\/DXB/i.test(t)) return 'hawbNo';
  if (/176-?23456882/i.test(t)) return 'mawbNo';
  if (/CAE190028|JOB-/i.test(t)) return 'jobNumber';
  if (/CHENNAI,\s*INDIA/i.test(t)) return 'departure';
  if (/DUBAI INTERNATIONAL/i.test(t)) return 'destination';
  if (/EK9876/i.test(t)) {
    // Short "EK9876" = By first Carrier; long "EK9876EK9876 20-FEB-19" = flight/date.
    if (/FEB|JAN|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{2}-[A-Z]{3}/i.test(t) || t.length > 12) {
      return 'flightDate';
    }
    return 'byCarrier';
  }
  if (/^DXB$/i.test(t)) return 'toCode';
  if (/^INR$/i.test(t)) return 'currency';
  if (/N\.V\.D/i.test(t)) return 'declaredCarriage';
  if (/AS PER INV|N\.C\.V/i.test(t)) return 'declaredCustoms';
  if (/^NIL$/i.test(t)) return 'insurance';
  if (/STC:|PAPER CUPS|DIMS IN/i.test(t)) return 'nature';
  if (/CTN/i.test(t) && !/TOTAL/i.test(t)) return 'handling';
  if (/TOTAL\s*:/i.test(t) || /PACKAGES ONLY/i.test(t)) return 'packagesLine';
  if (/^100$/i.test(t)) return 'pieces';
  if (/1,?250\.00/i.test(t)) {
    if (x < widthPt * 0.2) return 'grossWeight';
    return 'chargeableWeight';
  }
  if (/^0\.00$/i.test(t) || /AS ARRANGED/i.test(t)) return 'total';
  if (/FREIGHT PREPAID/i.test(t)) return 'accounting';
  if (/^PP$/i.test(t)) return 'prepaidMark';
  if (/EMIRATES/i.test(t) && !/AGENT/i.test(t)) return 'carrier';
  if (/18-FEB/i.test(t)) return 'executedOn';
  if (/^CHENNAI$/i.test(t)) return 'executedAt';
  if (/AS AGENT FOR THE CARRIER/i.test(t)) return 'carrierSign';
  if (/PHONE:|04-233/i.test(t)) return 'companyPhone';
  if (DEMO_VALUE.test(t)) return 'cargo';
  return null;
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
        rects.push([round(rect.x), round(rect.y), round(w), round(h), fill[0], fill[1], fill[2], 1]);
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
  const fieldSlots = [];
  const seenSlot = new Set();
  for (const span of pageSpec?.spans || []) {
    const text = String(span.text || '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
    if (!text) continue;
    const x = round(span.x);
    const y = round(span.y);
    const size = round(span.size || 8);
    const bold = /bold/i.test(span.font || '') || size >= 12 ? 1 : 0;

    if (/fresa/i.test(text)) {
      // Issued-by / agent on the right only — never invent top-left invoice letterhead.
      if (x > width * 0.45) {
        const slotId = `companyName@${x},${y}`;
        if (!seenSlot.has(slotId)) {
          seenSlot.add(slotId);
          fieldSlots.push({ key: 'companyName', x, y, size: Math.min(size || 8, 10) });
        }
      }
      continue;
    }

    const key = classifyKey(text, x, y, width, height);
    if (key) {
      const slotId = `${key}@${x},${y}`;
      if (!seenSlot.has(slotId)) {
        seenSlot.add(slotId);
        fieldSlots.push({ key, x, y, size: Math.min(size || 8, 10) });
      }
      continue;
    }
    if (DEMO_VALUE.test(text)) continue;

    texts.push([text, x, y, size, bold]);
    if (texts.length >= 420) break;
  }

  return { rects, lines, texts, fieldSlots, width, height };
}

function brandingSlot(pages, heightPt, widthPt) {
  // Issued-by / carrier band — right of shipper (never top-left over shipper).
  return {
    x: round(widthPt * 0.52),
    y: round(heightPt - 56),
    size: 10,
  };
}

function faceFromSpec(code, spec) {
  const multi = Array.isArray(spec.pages) && spec.pages.length > 0 ? spec.pages : null;
  const built = [];
  const allSlots = [];
  if (multi) {
    for (const page of multi) {
      const pageSpec = {
        width: page.width || spec.page?.width,
        height: page.height || spec.page?.height,
        lines: page.lines || (built.length === 0 ? spec.lines : []),
        rects: page.rects || (built.length === 0 ? spec.rects : []),
        spans: page.spans || (built.length === 0 ? spec.spans : []),
      };
      const one = pageFromSpecPage(pageSpec, spec.page);
      built.push(one);
      if (built.length === 1) allSlots.push(...one.fieldSlots);
    }
  } else {
    const one = pageFromSpecPage(
      {
        width: spec.page?.width,
        height: spec.page?.height,
        lines: spec.lines,
        rects: spec.rects,
        spans: spec.spans,
      },
      spec.page,
    );
    built.push(one);
    allSlots.push(...one.fieldSlots);
  }

  const media = spec.page?.mediaBox;
  const rotateDeg = Number(spec.page?.rotate) || 0;
  const widthPt =
    rotateDeg && Array.isArray(media)
      ? media[2] - media[0]
      : built[0]?.width || spec.page?.width || 595;
  const heightPt =
    rotateDeg && Array.isArray(media)
      ? media[3] - media[1]
      : built[0]?.height || spec.page?.height || 842;

  // Prefer unique field keys (first occurrence wins for stamping primary value).
  const slots = [];
  const seenKey = new Set();
  for (const slot of allSlots) {
    // Allow multiple shipper/consignee/nature lines (same key, different y).
    const multiOk = ['shipper', 'consignee', 'notify', 'nature', 'handling'].includes(slot.key);
    if (!multiOk && seenKey.has(slot.key)) continue;
    if (!multiOk) seenKey.add(slot.key);
    slots.push(slot);
  }

  return {
    code,
    name: code.replace(/_/g, ' '),
    family: 'other',
    referenceFile: `${code}.spec.pdf`,
    samplePdfUrl: null,
    pageCount: built.length,
    widthPt: round(widthPt),
    heightPt: round(heightPt),
    ...(rotateDeg ? { rotateDeg } : {}),
    branding: brandingSlot(built, heightPt, widthPt),
    fieldSlots: slots,
    pages: built.map(({ rects, lines, texts }) => ({ rects, lines, texts })),
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

const existing = loadExistingFaces().filter((face) => !HAWB_CODES.includes(face.code));
const byCode = new Map(existing.map((face) => [face.code, face]));

const summary = [];
for (const code of HAWB_CODES) {
  const file = path.join(SPEC_DIR, `${code}.json`);
  if (!fs.existsSync(file)) {
    summary.push({ code, error: 'missing spec' });
    continue;
  }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const face = faceFromSpec(code, spec);
  const rules = face.pages.reduce(
    (sum, page) => sum + page.rects.length + page.lines.length + page.texts.length,
    0,
  );
  byCode.set(code, face);
  summary.push({
    code,
    pages: face.pageCount,
    rules,
    texts: face.pages.reduce((s, p) => s + p.texts.length, 0),
    lines: face.pages.reduce((s, p) => s + p.lines.length, 0),
    slots: face.fieldSlots.length,
  });
}

const faces = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
fs.writeFileSync(
  FACE_FILE,
  `import type { OfficialMeasuredFace } from './officialFace.types';\n\nexport const MEASURED_OFFICIAL_FACES: OfficialMeasuredFace[] = ${JSON.stringify(faces)};\n`,
);

console.log(JSON.stringify({ faces: faces.length, hawb: summary }, null, 2));
