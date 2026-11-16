import { PDFDocument } from 'pdf-lib';
import type { PageGeometry } from './pageGeometry';

export type InspectedPdfPage = {
  index: number;
  widthPt: number;
  heightPt: number;
  orientation: 'portrait' | 'landscape' | 'square';
};

export type InspectedPdf = {
  pageCount: number;
  pages: InspectedPdfPage[];
};

const PT_TOLERANCE = 1.5;

function orientationOf(widthPt: number, heightPt: number): InspectedPdfPage['orientation'] {
  if (Math.abs(widthPt - heightPt) < PT_TOLERANCE) return 'square';
  return widthPt > heightPt ? 'landscape' : 'portrait';
}

/** Inspect a PDF blob/bytes for page count and MediaBox sizes (actual PDF, not CSS). */
export async function inspectPdfBytes(bytes: ArrayBuffer | Uint8Array): Promise<InspectedPdf> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const pages: InspectedPdfPage[] = [];
  for (let i = 0; i < pageCount; i += 1) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      index: i,
      widthPt: width,
      heightPt: height,
      orientation: orientationOf(width, height),
    });
  }
  return { pageCount, pages };
}

export async function inspectPdfBlob(blob: Blob): Promise<InspectedPdf> {
  const buf = await blob.arrayBuffer();
  return inspectPdfBytes(buf);
}

export function pagesMatchGeometry(
  inspected: InspectedPdf,
  geometry: PageGeometry,
  tolerancePt: number = PT_TOLERANCE,
): boolean {
  if (inspected.pageCount < 1) return false;
  return inspected.pages.every(
    (p) =>
      Math.abs(p.widthPt - geometry.widthPt) <= tolerancePt &&
      Math.abs(p.heightPt - geometry.heightPt) <= tolerancePt,
  );
}

/**
 * Preview and download must share one blob pipeline.
 * Returns true when both ArrayBuffers are byte-identical.
 */
export async function pdfBlobsAreIdentical(a: Blob, b: Blob): Promise<boolean> {
  if (a.size !== b.size) return false;
  const [ab, bb] = await Promise.all([a.arrayBuffer(), b.arrayBuffer()]);
  const ua = new Uint8Array(ab);
  const ub = new Uint8Array(bb);
  if (ua.length !== ub.length) return false;
  for (let i = 0; i < ua.length; i += 1) {
    if (ua[i] !== ub[i]) return false;
  }
  return true;
}
