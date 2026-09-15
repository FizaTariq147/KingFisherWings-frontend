import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { InvoiceFormatLayoutByKind } from '../components/ReportCatalog/invoiceLayouts';
import type { InvoiceFormatPdfData } from './invoiceFormatToInvoicePdfModel';

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
 * Render KingFisher invoice layout to a single PDF page.
 * Scales content to fit so the page border box is never split across pages.
 */
export async function generateInvoiceFormatPreviewPdf(
  preview: InvoiceFormatPreview,
  data: InvoiceFormatPdfData = {},
): Promise<Blob> {
  const letter =
    preview.paper === 'Letter' || preview.layoutKind === 'usa' || preview.formatNumber === 9;
  const cssWidth = letter ? 816 : 794;

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
    const scale = Math.min(usableW / imgW, usableH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    // Top-align; footer already sits at bottom of the sheet image.
    const x = margin + (usableW - drawW) / 2;
    const y = margin;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
    pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);

    return pdf.output('blob');
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}
