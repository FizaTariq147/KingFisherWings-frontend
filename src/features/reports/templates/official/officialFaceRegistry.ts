import type { OfficialFaceFamily } from './officialFace.types';
import { MEASURED_OFFICIAL_FACES } from './measuredFaces.generated';

const FACES = MEASURED_OFFICIAL_FACES;

const BY_CODE = new Map(FACES.map((face) => [face.code.toUpperCase(), face]));

/**
 * Official HAWB codes are now promoted into measuredFaces (vector redraw from
 * pinned specs). html2canvas faces remain as fallback when a measured face is
 * missing or generation fails.
 */
export function listOfficialMeasuredFaces(): readonly OfficialMeasuredFace[] {
  return FACES;
}

export function getOfficialMeasuredFace(code: string): OfficialMeasuredFace | undefined {
  return BY_CODE.get(code.trim().toUpperCase());
}

export function isOfficialMeasuredNativeCode(code: string): boolean {
  return BY_CODE.has(code.trim().toUpperCase());
}

export function listOfficialMeasuredFacesByFamily(
  family: OfficialFaceFamily,
): OfficialMeasuredFace[] {
  return FACES.filter((face) => face.family === family);
}

export function officialMeasuredReferenceFiles(): string[] {
  return FACES.map((face) => face.referenceFile);
}
