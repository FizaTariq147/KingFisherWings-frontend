import { PDFDocument } from 'pdf-lib';
import termsPdfUrl from '../assets/KingFisher_Terms_and_Conditions.pdf?url';

let cachedTermsBytes: ArrayBuffer | null = null;

async function loadCustomerTermsPdfBytes(): Promise<ArrayBuffer> {
  if (cachedTermsBytes) return cachedTermsBytes.slice(0);
  const res = await fetch(termsPdfUrl);
  if (!res.ok) {
    throw new Error(`Could not load KingFisher Terms & Conditions PDF (${res.status}).`);
  }
  const bytes = await res.arrayBuffer();
  cachedTermsBytes = bytes.slice(0);
  return bytes.slice(0);
}

/**
 * Append the official KingFisher Terms & Conditions PDF page(s) after the
 * primary report layout PDF. Pixel-identical to the source file — no redraw.
 */
export async function appendOfficialCustomerTermsPdf(layoutPdfBlob: Blob): Promise<Blob> {
  const layoutBytes = await layoutPdfBlob.arrayBuffer();
  const termsBytes = await loadCustomerTermsPdfBytes();

  const out = await PDFDocument.create();
  const layoutDoc = await PDFDocument.load(layoutBytes, { ignoreEncryption: true });
  const termsDoc = await PDFDocument.load(termsBytes, { ignoreEncryption: true });

  const layoutPages = await out.copyPages(layoutDoc, layoutDoc.getPageIndices());
  for (const page of layoutPages) out.addPage(page);

  const termsPages = await out.copyPages(termsDoc, termsDoc.getPageIndices());
  for (const page of termsPages) out.addPage(page);

  const merged = await out.save();
  return new Blob([new Uint8Array(merged)], { type: 'application/pdf' });
}
