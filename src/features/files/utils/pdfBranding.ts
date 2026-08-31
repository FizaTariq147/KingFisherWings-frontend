import { stripPdfExtension } from './pdfFilename';

export interface PdfBrandingOptions {
  title?: string;
  companyName?: string;
  logoUrl?: string;
  accentColor?: string;
  subtitle?: string;
  documentType?: string;
  documentNumber?: string;
  documentDate?: string;
  footerLine?: string;
}

const DEFAULTS = {
  companyName: 'KingFisher Wings',
  logoUrl: '/kingfisher-logo.png',
  accentColor: '#0A2942',
  title: 'Document',
  subtitle: 'KingFisher Tech Gold',
  documentType: '',
  documentNumber: '',
  documentDate: '',
  footerLine: 'KingFisher Wings - KingFisher Tech Gold',
} as const;

export type ResolvedPdfBranding = {
  title: string;
  companyName: string;
  logoUrl: string;
  accentColor: string;
  subtitle: string;
  documentType: string;
  documentNumber: string;
  documentDate: string;
  footerLine: string;
};

export function resolvePdfBranding(options?: PdfBrandingOptions): ResolvedPdfBranding {
  const documentNumber =
    stripPdfExtension(options?.documentNumber?.trim() || options?.title?.trim() || '') ||
    DEFAULTS.documentNumber;
  return {
    title: documentNumber || DEFAULTS.title,
    companyName: options?.companyName?.trim() || DEFAULTS.companyName,
    logoUrl: options?.logoUrl?.trim() || DEFAULTS.logoUrl,
    accentColor: options?.accentColor?.trim() || DEFAULTS.accentColor,
    subtitle: options?.subtitle?.trim() || DEFAULTS.subtitle,
    documentType: options?.documentType?.trim() || DEFAULTS.documentType,
    documentNumber,
    documentDate: options?.documentDate?.trim() || DEFAULTS.documentDate,
    footerLine: options?.footerLine?.trim() || DEFAULTS.footerLine,
  };
}

export function isPdfBlob(blob: Blob, filename?: string): boolean {
  if (blob.type === 'application/pdf') return true;
  if (filename?.toLowerCase().endsWith('.pdf')) return true;
  return false;
}

export function isPdfUrl(url: string, filename?: string): boolean {
  if (filename && filename.toLowerCase().endsWith('.pdf')) return true;
  return /\.pdf(?:$|[?#])/i.test(url);
}

function absoluteAssetUrl(url: string): string {
  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return new URL(url, window.location.origin).href;
}

function writeLoadingPreview(targetWindow: Window): void {
  try {
    targetWindow.document.title = 'Loading PDF…';
    targetWindow.document.body.replaceChildren();
    const paragraph = targetWindow.document.createElement('p');
    paragraph.style.cssText = 'font-family:system-ui,sans-serif;padding:1.5rem;color:#555';
    paragraph.textContent = 'Loading PDF…';
    targetWindow.document.body.append(paragraph);
  } catch {
    /* ignore */
  }
}

function navigatePreviewToUrl(targetWindow: Window, url: string, revokeMs = 300_000): void {
  try {
    targetWindow.location.replace(url);
  } catch {
    targetWindow.location.href = url;
  }
  if (url.startsWith('blob:')) {
    window.setTimeout(() => URL.revokeObjectURL(url), revokeMs);
  }
}

export function openPdfBlobInNewTab(
  blob: Blob,
  targetWindow?: Window | null,
  _filename?: string,
): void {
  const objectUrl = URL.createObjectURL(blob);
  const previewWindow =
    targetWindow && !targetWindow.closed
      ? targetWindow
      : window.open(objectUrl, '_blank', 'noopener,noreferrer');
  if (!previewWindow) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.');
  }
  if (targetWindow && !targetWindow.closed) {
    navigatePreviewToUrl(previewWindow, objectUrl);
    return;
  }
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 300_000);
}

/** Fetch PDF bytes and apply header/footer overlay (no new tab). */
export async function fetchBrandedPdfBlob(
  url: string,
  options?: PdfBrandingOptions,
): Promise<Blob> {
  const { ensureBrandedPdfBlob } = await import('./stampPdfBranding');
  const response = await fetch(absoluteAssetUrl(url));
  if (!response.ok) throw new Error('Could not load PDF.');
  const blob = await response.blob();
  return ensureBrandedPdfBlob(blob, options);
}

/** Fetch, apply header/footer overlay, and open the PDF. */
export async function openBrandedPdfUrl(url: string, options?: PdfBrandingOptions): Promise<void> {
  const preview = window.open('about:blank', '_blank', 'noopener,noreferrer');
  if (!preview) {
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.');
  }
  writeLoadingPreview(preview);

  const stamped = await fetchBrandedPdfBlob(url, options);
  openPdfBlobInNewTab(stamped, preview);
}

export function quotationPdfBranding(
  quotationNumber: string,
  documentDate?: string,
): PdfBrandingOptions {
  return {
    documentType: 'QUOTATION',
    documentNumber: quotationNumber,
    title: quotationNumber,
    documentDate,
  };
}

export function invoicePdfBranding(
  invoiceNumber: string,
  documentDate?: string,
): PdfBrandingOptions {
  return {
    documentType: 'INVOICE',
    documentNumber: invoiceNumber,
    title: invoiceNumber,
    documentDate,
  };
}

export function letterPdfBranding(
  letterReference: string,
  documentDate?: string,
): PdfBrandingOptions {
  return {
    documentType: 'HR LETTER',
    documentNumber: letterReference,
    title: letterReference,
    documentDate,
  };
}
