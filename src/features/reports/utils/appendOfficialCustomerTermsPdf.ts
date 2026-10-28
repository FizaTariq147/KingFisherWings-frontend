import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { safePdfText } from '@/features/files/utils/sanitizePdfText';
import termsPdfUrl from '../assets/KingFisher_Terms_and_Conditions.pdf?url';
import type { CustomerTermsBranding } from './resolveCustomerTermsBranding';

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

async function loadLogoBytes(logoUrl: string): Promise<ArrayBuffer | null> {
  try {
    const absolute =
      logoUrl.startsWith('data:') || logoUrl.startsWith('blob:') || /^https?:\/\//i.test(logoUrl)
        ? logoUrl
        : new URL(logoUrl, window.location.origin).href;
    const res = await fetch(absolute);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Overlay Page-1 logo + backend company footer onto official T&C page(s).
 * Leaves the legal body copy unchanged.
 */
async function brandTermsPages(
  out: PDFDocument,
  pageIndices: number[],
  branding: CustomerTermsBranding,
): Promise<void> {
  const logoBytes = await loadLogoBytes(branding.logoUrl);
  let embeddedLogo:
    | Awaited<ReturnType<PDFDocument['embedPng']>>
    | Awaited<ReturnType<PDFDocument['embedJpg']>>
    | null = null;

  if (logoBytes) {
    try {
      embeddedLogo = await out.embedPng(logoBytes);
    } catch {
      try {
        embeddedLogo = await out.embedJpg(logoBytes);
      } catch {
        embeddedLogo = null;
      }
    }
  }

  const font = await out.embedFont(StandardFonts.HelveticaBold);
  const company = safePdfText(branding.companyName, 'KingFisher Wings Group');
  const navy = rgb(0.039, 0.161, 0.259); // #0A2942
  const white = rgb(1, 1, 1);

  for (const index of pageIndices) {
    const page = out.getPage(index);
    const { width, height } = page.getSize();

    // Official T&C header: logo sits left; title/modes stay on the right (≥ ~350pt).
    if (embeddedLogo) {
      const maxW = 170;
      const maxH = 58;
      const scale = Math.min(maxW / embeddedLogo.width, maxH / embeddedLogo.height);
      const drawW = embeddedLogo.width * scale;
      const drawH = embeddedLogo.height * scale;
      const logoX = 28;
      const logoY = height - 18 - drawH;

      page.drawRectangle({
        x: 18,
        y: height - 88,
        width: 210,
        height: 78,
        color: white,
      });
      page.drawImage(embeddedLogo, {
        x: logoX,
        y: logoY,
        width: drawW,
        height: drawH,
      });
    }

    // Official footer left: "K I N G F I S H E R W I N G S G R O U P" @ y≈21.4
    if (company) {
      const footerY = 14;
      const coverW = Math.min(310, width * 0.52);
      page.drawRectangle({
        x: 18,
        y: 8,
        width: coverW,
        height: 22,
        color: white,
      });
      const size = 8;
      const text = company.toUpperCase();
      const fitted =
        font.widthOfTextAtSize(text, size) <= coverW - 12
          ? text
          : (() => {
              let clipped = text;
              while (
                clipped.length > 1 &&
                font.widthOfTextAtSize(`${clipped}…`, size) > coverW - 12
              ) {
                clipped = clipped.slice(0, -1);
              }
              return `${clipped}…`;
            })();
      page.drawText(fitted, {
        x: 28,
        y: footerY,
        size,
        font,
        color: navy,
      });
    }
  }
}

/**
 * Append the official KingFisher Terms & Conditions PDF page(s) after the
 * primary report layout PDF. Body copy stays identical; logo matches Page 1
 * and footer company name comes from organization profile when provided.
 */
export async function appendOfficialCustomerTermsPdf(
  layoutPdfBlob: Blob,
  branding?: CustomerTermsBranding,
): Promise<Blob> {
  const layoutBytes = await layoutPdfBlob.arrayBuffer();
  const termsBytes = await loadCustomerTermsPdfBytes();

  const out = await PDFDocument.create();
  const layoutDoc = await PDFDocument.load(layoutBytes, { ignoreEncryption: true });
  const termsDoc = await PDFDocument.load(termsBytes, { ignoreEncryption: true });

  const layoutPages = await out.copyPages(layoutDoc, layoutDoc.getPageIndices());
  for (const page of layoutPages) out.addPage(page);

  const termsStart = out.getPageCount();
  const termsPages = await out.copyPages(termsDoc, termsDoc.getPageIndices());
  for (const page of termsPages) out.addPage(page);
  const termsEnd = out.getPageCount();

  if (branding && termsEnd > termsStart) {
    const indices = Array.from({ length: termsEnd - termsStart }, (_, i) => termsStart + i);
    await brandTermsPages(out, indices, branding);
  }

  const merged = await out.save();
  return new Blob([new Uint8Array(merged)], { type: 'application/pdf' });
}
