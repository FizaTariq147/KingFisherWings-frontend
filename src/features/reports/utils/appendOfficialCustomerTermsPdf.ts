import { PDFDocument } from 'pdf-lib';
import blTermsPdfUrl from '../assets/BL_Terms_and_Conditions.pdf?url';
import airwayTermsPdfUrl from '../assets/Airway_Terms_and_Conditions.pdf?url';
import {
  resolveCustomerTermsKind,
  type CustomerTermsKind,
} from './resolveCustomerTermsKind';

const TERMS_URL_BY_KIND: Record<CustomerTermsKind, string> = {
  bl: blTermsPdfUrl,
  airway: airwayTermsPdfUrl,
};

const cachedTermsBytes: Partial<Record<CustomerTermsKind, ArrayBuffer>> = {};

async function loadTermsPdfBytes(kind: CustomerTermsKind): Promise<ArrayBuffer> {
  const cached = cachedTermsBytes[kind];
  if (cached) return cached.slice(0);

  const res = await fetch(TERMS_URL_BY_KIND[kind]);
  if (!res.ok) {
    const label = kind === 'bl' ? 'BL' : 'Airway';
    throw new Error(`Could not load ${label} Terms & Conditions PDF (${res.status}).`);
  }
  const bytes = await res.arrayBuffer();
  cachedTermsBytes[kind] = bytes.slice(0);
  return bytes.slice(0);
}

export type AppendOfficialCustomerTermsOptions = {
  /** Explicit kind; when omitted, derived from `formatCode`. */
  kind?: CustomerTermsKind;
  /** Catalogue / job format code used to pick BL vs Airway PDF. */
  formatCode?: string;
};

/**
 * Append the official BL or Airway Terms & Conditions PDF after the primary
 * report layout. Legal pages are copied as-is (no logo/footer overlays).
 */
export async function appendOfficialCustomerTermsPdf(
  layoutPdfBlob: Blob,
  options: AppendOfficialCustomerTermsOptions = {},
): Promise<Blob> {
  const kind =
    options.kind ??
    (options.formatCode ? resolveCustomerTermsKind(options.formatCode) : null);

  if (!kind) {
    throw new Error(
      `No BL/Airway Terms & Conditions mapping for format "${options.formatCode ?? ''}".`,
    );
  }

  const layoutBytes = await layoutPdfBlob.arrayBuffer();
  const termsBytes = await loadTermsPdfBytes(kind);

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
