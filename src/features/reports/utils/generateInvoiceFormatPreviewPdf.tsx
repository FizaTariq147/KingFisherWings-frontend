import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { InvoiceFormatLayoutByKind } from '../components/ReportCatalog/invoiceLayouts';
import type { InvoiceFormatPdfData } from './invoiceFormatToInvoicePdfModel';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { appendOfficialCustomerTermsPdf } from './appendOfficialCustomerTermsPdf';
import { resolveCustomerTermsBranding } from './resolveCustomerTermsBranding';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    ),
  );
}

/**
 * Render KingFisher report layout to PDF (page 1 unchanged).
 * Customer transport docs (BL draft/original, HAWB, DO, etc.) then append the
 * official KingFisher_Terms_and_Conditions.pdf page(s) — identical UI to the file.
 * Invoice, quotation, and admin list/finance/WMS formats are excluded.
 */
export async function generateInvoiceFormatPreviewPdf(
  preview: InvoiceFormatPreview,
  data: InvoiceFormatPdfData = {},
): Promise<Blob> {
  const letter =
    preview.paper === 'Letter' || preview.layoutKind === 'usa' || preview.formatNumber === 9;
  const cssWidth = letter ? 816 : 794;
  const appendTerms = shouldAppendCustomerTermsPage(preview.code);

  const host = document.createElement('div');
  host.setAttribute('data-invoice-format-pdf-capture', 'true');
  host.style.cssText = [
    'position:fixed',
    'left:-12000px',
    'top:0',
    `width:${cssWidth}px`,
    'background:#ffffff',
    'z-index:-1',
    'pointer-events:none',
  ].join(';');

  const mount = document.createElement('div');
  mount.style.cssText = 'width:100%;background:#ffffff;';
  host.appendChild(mount);
  document.body.appendChild(host);

  let root: Root | null = null;
  try {
    root = createRoot(mount);
    root.render(<InvoiceFormatLayoutByKind preview={preview} data={data} />);

    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(mount);
    await wait(80);

    const sheet = (mount.querySelector('[data-invoice-sheet]') as HTMLElement) || mount;
    if (!sheet || sheet.offsetWidth < 1 || sheet.offsetHeight < 1) {
      throw new Error(
        `Layout preview did not render for ${preview.code}. Check that the format JSON layout exists.`,
      );
    }

    // Capture the full bordered sheet as one image (no mid-box page splits).
    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: cssWidth,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: letter ? 'letter' : 'a4',
      compress: true,
    });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;

    const imgW = canvas.width;
    const imgH = canvas.height;
    if (!Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW < 1 || imgH < 1) {
      throw new Error(`PDF capture produced an empty canvas for ${preview.code}.`);
    }
    const scale = Math.min(usableW / imgW, usableH / imgH);
    if (!Number.isFinite(scale) || scale <= 0) {
      throw new Error(`Invalid PDF scale for ${preview.code}.`);
    }
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const x = margin + (usableW - drawW) / 2;
    const y = margin;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
    pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);

    const layoutBlob = pdf.output('blob');
    if (!appendTerms) return layoutBlob;

    const branding = await resolveCustomerTermsBranding();
    return appendOfficialCustomerTermsPdf(layoutBlob, branding);
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}
