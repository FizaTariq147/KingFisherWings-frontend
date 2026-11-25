/**
 * Fix measured faces whose specs have /Rotate but page size was stored as the
 * rotated viewport while geometry stayed in mediaBox space (e.g. Format 2 Tax
 * Invoice India). Draws were landscape canvas + portrait coords → scrambled PDF.
 *
 * Run: node scripts/fix-rotated-measured-faces.mjs
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

function loadFaces() {
  const text = fs.readFileSync(FACE_FILE, 'utf8');
  const start = text.indexOf('= [') + 2;
  const end = text.lastIndexOf(']');
  return JSON.parse(text.slice(start, end + 1));
}

function maxGeometryY(face) {
  let max = 0;
  for (const page of face.pages || []) {
    for (const run of page.texts || []) max = Math.max(max, Number(run[2]) || 0);
    for (const line of page.lines || []) {
      max = Math.max(max, Number(line[1]) || 0, Number(line[3]) || 0);
    }
    for (const rect of page.rects || []) {
      max = Math.max(max, (Number(rect[1]) || 0) + (Number(rect[3]) || 0));
    }
  }
  return max;
}

const faces = loadFaces();
let fixed = 0;
for (const face of faces) {
  const specPath = path.join(SPEC_DIR, `${face.code}.json`);
  if (!fs.existsSync(specPath)) continue;
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  } catch {
    continue;
  }
  const rotate = Number(spec.page?.rotate) || 0;
  const media = spec.page?.mediaBox;
  if (!rotate || !Array.isArray(media) || media.length < 4) {
    if (face.rotateDeg) {
      delete face.rotateDeg;
      fixed += 1;
    }
    continue;
  }
  const mediaW = Math.round((media[2] - media[0]) * 10) / 10;
  const mediaH = Math.round((media[3] - media[1]) * 10) / 10;
  const geoY = maxGeometryY(face);
  const needsFix =
    Math.abs(face.widthPt - mediaW) > 1 ||
    Math.abs(face.heightPt - mediaH) > 1 ||
    geoY > face.heightPt + 8 ||
    face.rotateDeg !== rotate;

  if (!needsFix) continue;

  face.widthPt = mediaW;
  face.heightPt = mediaH;
  face.rotateDeg = rotate;
  // Keep branding y inside the media page.
  if (face.branding && face.branding.y > mediaH) {
    face.branding = {
      ...face.branding,
      y: Math.max(8, mediaH - 48),
    };
  }
  fixed += 1;
  console.log(
    JSON.stringify({
      code: face.code,
      rotate,
      widthPt: face.widthPt,
      heightPt: face.heightPt,
      geoY: Math.round(geoY),
    }),
  );
}

fs.writeFileSync(
  FACE_FILE,
  `import type { OfficialMeasuredFace } from './officialFace.types';\n\nexport const MEASURED_OFFICIAL_FACES: OfficialMeasuredFace[] = ${JSON.stringify(faces)};\n`,
);

console.log(JSON.stringify({ faces: faces.length, fixed }, null, 2));
