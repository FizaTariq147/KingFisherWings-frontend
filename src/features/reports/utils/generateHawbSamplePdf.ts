import { getHawbFormatSpec } from '../constants/hawbFormatCatalog';
import { appendOfficialCustomerTermsPdf } from './appendOfficialCustomerTermsPdf';
import { fetchFresaSamplePdfBytes } from './fetchFresaSamplePdfBytes';
import {
  resolveReportOrgChrome,
  type ReportOrgChrome,
} from './resolveReportOrgChrome';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export type GenerateHawbSamplePdfOptions = {
  skipOrgStamp?: boolean;
  chrome?: ReportOrgChrome;
  appendCustomerTerms?: boolean;
};

async function embedLogoImage(
  doc: PDFDocument,
  logoUrl: string,
): Promise<{ image: Awaited<ReturnType<PDFDocument['embedPng']>>; width: number; height: number } | null> {
  try {
    const res = await fetch(logoUrl, { credentials: 'omit', mode: 'cors' });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    const u8 = new Uint8Array(bytes);
    const isPng = u8[0] === 0x89 && u8[1] === 0x50;
    const image = isPng ? await doc.embedPng(u8) : await doc.embedJpg(u8);
    const maxH = 28;
    const maxW = 90;
    const scale = Math.min(maxW / image.width, maxH / image.height, 1);
    return { image, width: image.width * scale, height: image.height * scale };
  } catch {
    return null;
  }
}

async function stampOrgChromeOnSample(
  sampleBytes: ArrayBuffer,
  chrome: ReportOrgChrome,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(sampleBytes, { ignoreEncryption: true });
  const pages = doc.getPages();
  if (!pages.length) return new Uint8Array(sampleBytes);

  const page = pages[0];
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontSm = await doc.embedFont(StandardFonts.Helvetica);
  const logo = chrome.logoUrl ? await embedLogoImage(doc, chrome.logoUrl) : null;
  const pad = 10;
  const boxW = 130;
  const boxH = logo ? logo.height + 22 : 28;
  const x = width - boxW - pad;
  const y = height - boxH - pad;

  page.drawRectangle({
    x,
    y,
    width: boxW,
    height: boxH,
    color: rgb(1, 1, 1),
    opacity: 0.92,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.5,
  });

  let cursorY = y + boxH - 6;
  if (logo) {
    page.drawImage(logo.image, {
      x: x + (boxW - logo.width) / 2,
      y: cursorY - logo.height,
      width: logo.width,
      height: logo.height,
    });
    cursorY -= logo.height + 4;
  }

  const name = (chrome.company || 'KingFisher Wings').slice(0, 42);
  const nameSize = 7;
  const nameWidth = font.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: x + Math.max(4, (boxW - nameWidth) / 2),
    y: Math.max(y + 4, cursorY - nameSize),
    size: nameSize,
    font,
    color: rgb(0.06, 0.16, 0.26),
  });
  page.drawText('Issued via Freightnest', {
    x: x + 6,
    y: y + 3,
    size: 5.5,
    font: fontSm,
    color: rgb(0.4, 0.4, 0.4),
  });

  return doc.save();
}

/**
 * Catalogue browse for HAWB: official Fresa sample PDF + org stamp + Airway T&C.
 * Not the shared hawbAwbShell / html2canvas path.
 */
export async function generateHawbSamplePdf(
  code: string,
  options: GenerateHawbSamplePdfOptions = {},
): Promise<{ blob: Blob; samplePdfUrl: string }> {
  const spec = getHawbFormatSpec(code);
  const samplePdfUrl = (spec?.samplePdfUrl || '').trim();
  if (!samplePdfUrl) {
    throw new Error(`No official Fresa HAWB sample URL for ${code}.`);
  }

  const sampleBytes = await fetchFresaSamplePdfBytes(samplePdfUrl);
  const chrome = options.chrome ?? (await resolveReportOrgChrome());

  let layoutBytes: Uint8Array = new Uint8Array(sampleBytes);
  if (!options.skipOrgStamp) {
    layoutBytes = await stampOrgChromeOnSample(sampleBytes, chrome);
  }

  let blob = new Blob([new Uint8Array(layoutBytes)], { type: 'application/pdf' });

  const appendTerms =
    typeof options.appendCustomerTerms === 'boolean'
      ? options.appendCustomerTerms
      : shouldAppendCustomerTermsPage(code);

  if (appendTerms) {
    blob = await appendOfficialCustomerTermsPdf(blob, {
      kind: 'airway',
      formatCode: code,
    });
  }

  return { blob, samplePdfUrl };
}

export function hasHawbSamplePdf(code: string): boolean {
  return Boolean(getHawbFormatSpec(code)?.samplePdfUrl);
}
