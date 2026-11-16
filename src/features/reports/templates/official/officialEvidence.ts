import { PDFDocument } from 'pdf-lib';
import { isFresaIdentityText } from './officialBranding';
import { listOfficialMeasuredFaces } from './officialFaceRegistry';
import type { OfficialFaceFamily, OfficialMeasuredFace } from './officialFace.types';

export type OfficialEvidenceSummary = {
  faces: number;
  byFamily: Record<string, number>;
  uniqueReferenceFiles: number;
  duplicateReferenceFiles: string[];
};

/** Inventory check used before a visual raster pass. */
export function summarizeOfficialFaceEvidence(
  faces: readonly OfficialMeasuredFace[] = listOfficialMeasuredFaces(),
): OfficialEvidenceSummary {
  const byFamily: Record<string, number> = {};
  const seen = new Map<string, string>();
  const duplicateReferenceFiles: string[] = [];
  for (const face of faces) {
    byFamily[face.family] = (byFamily[face.family] || 0) + 1;
    const prior = seen.get(face.referenceFile);
    if (prior && prior !== face.code) duplicateReferenceFiles.push(face.referenceFile);
    else seen.set(face.referenceFile, face.code);
    for (const page of face.pages) {
      for (const [text] of page.texts) {
        if (isFresaIdentityText(text)) {
          throw new Error(`${face.code} measured text still names Fresa`);
        }
      }
    }
  }
  return {
    faces: faces.length,
    byFamily,
    uniqueReferenceFiles: seen.size,
    duplicateReferenceFiles,
  };
}

export function officialFacesForFamily(family: OfficialFaceFamily): OfficialMeasuredFace[] {
  return listOfficialMeasuredFaces().filter((face) => face.family === family);
}

/** Page box of a generated blob must match the measured sample page. */
export async function generatedPageMatchesFace(
  blob: Blob,
  face: OfficialMeasuredFace,
): Promise<boolean> {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  if (doc.getPageCount() < 1) return false;
  const { width, height } = doc.getPage(0).getSize();
  return Math.abs(width - face.widthPt) < 1.5 && Math.abs(height - face.heightPt) < 1.5;
}
