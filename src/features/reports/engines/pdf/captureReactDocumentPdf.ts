import { createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { sanitizeHtml2CanvasClone } from '../../utils/html2canvasSafeColors';

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

export type CaptureReactDocumentPdfOptions = {
  /** mm */
  widthMm?: number;
  heightMm?: number;
  landscape?: boolean;
};

/**
 * Shared html2canvas capture for template-v2 React documents.
 * Product print remains backend Puppeteer; this is catalogue/preview fidelity.
 */
export async function captureReactDocumentPdf(
  element: ReactElement,
  options: CaptureReactDocumentPdfOptions = {},
): Promise<Blob> {
  const landscape = Boolean(options.landscape);
  const widthMm = options.widthMm ?? (landscape ? 297 : 210);
  const heightMm = options.heightMm ?? (landscape ? 210 : 297);

  const host = document.createElement('div');
  host.setAttribute('data-report-template-v2-capture', 'true');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = `${widthMm}mm`;
  host.style.background = '#fff';
  document.body.appendChild(host);

  let root: Root | null = null;
  try {
    root = createRoot(host);
    root.render(element);
    await wait(80);
    await waitForImages(host);

    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => sanitizeHtml2CanvasClone(doc),
    });

    const pdf = new jsPDF({
      orientation: landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 2) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

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

/** Helper when callers have a component + props. */
export async function captureComponentPdf<P extends object>(
  Component: (props: P) => ReactElement | null,
  props: P,
  options?: CaptureReactDocumentPdfOptions,
): Promise<Blob> {
  return captureReactDocumentPdf(createElement(Component, props), options);
}
