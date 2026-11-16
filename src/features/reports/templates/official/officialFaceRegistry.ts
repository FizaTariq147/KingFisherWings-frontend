import type { OfficialFaceFamily } from './officialFace.types';
import { MEASURED_OFFICIAL_FACES } from './measuredFaces.generated';

const FACES = MEASURED_OFFICIAL_FACES;

const BY_CODE = new Map(FACES.map((face) => [face.code.toUpperCase(), face]));

/** HAWB stays on its five dedicated faces. The measured kit must not replace them. */
const HAWB_LOCK = new Set([
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
]);

export function listOfficialMeasuredFaces(): readonly OfficialMeasuredFace[] {
  return FACES;
}

export function getOfficialMeasuredFace(code: string): OfficialMeasuredFace | undefined {
  return BY_CODE.get(code.trim().toUpperCase());
}

export function isOfficialMeasuredNativeCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (HAWB_LOCK.has(needle)) return false;
  return BY_CODE.has(needle);
}

export function listOfficialMeasuredFacesByFamily(
  family: OfficialFaceFamily,
): OfficialMeasuredFace[] {
  return FACES.filter((face) => face.family === family);
}

export function officialMeasuredReferenceFiles(): string[] {
  return FACES.map((face) => face.referenceFile);
}
