import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import { sanitizeHtml2CanvasClone } from '@/features/reports/utils/html2canvasSafeColors';
import { HBL_JASPER_PILOT_CONFIG } from './hblJasperPilot.config';
import { HblJasperPilotDocument } from './HblJasperPilotDocument';
import { mapToHblJasperPilotModel } from './mapToHblJasperPilotModel';

async function wait(ms: number): Promise<void> {
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

export type GenerateHblJasperPilotPdfOptions = {
  appendCustomerTerms?: boolean;
  preview?: unknown;
  showPlaceholders?: boolean;
};

/**
 * Generate the Phase-3 Jasper pilot PDF from config-driven React composition.
 * Page size matches FRESA-REF-0001 (A4 portrait 595×842 pt).
 */
export async function generateHblJasperPilotPdf(
  data: InvoiceFormatPdfData = {},
  options: GenerateHblJasperPilotPdfOptions = {},
): Promise<{ blob: Blob; fileName: string }> {
  const config = HBL_JASPER_PILOT_CONFIG;
  const model = mapToHblJasperPilotModel(data, {
    preview: options.preview,
    showPlaceholders: options.showPlaceholders,
  });

  const cssWidth = config.page.widthCssPx;
  const host = document.createElement('div');
  host.setAttribute('data-hbl-jasper-pilot-pdf-capture', 'true');
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
    root.render(createElement(HblJasperPilotDocument, { model, config }));
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(mount);
    await wait(80);

    const sheet =
      (mount.querySelector('[data-hbl-jasper-pilot]') as HTMLElement) ||
      (mount.querySelector('[data-bl-draft-sheet]') as HTMLElement) ||
      mount;
    sanitizeHtml2CanvasClone(document, sheet);
    const canvas = await html2canvas(sheet, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: cssWidth,
      foreignObjectRendering: false,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeHtml2CanvasClone(clonedDoc, clonedElement);
      },
    });

    const pdf = new jsPDF({
      orientation: config.page.orientation,
      unit: 'pt',
      format: [config.page.widthPt, config.page.heightPt],
      compress: true,
    });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const m = config.page.marginsPt;
    const usableW = pageW - m.left - m.right;
    const usableH = pageH - m.top - m.bottom;
    const scale = Math.min(usableW / canvas.width, usableH / canvas.height);
    const drawW = canvas.width * scale;
    const drawH = canvas.height * scale;
    const x = m.left + (usableW - drawW) / 2;
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, m.top, drawW, drawH);

    // Avoid overflow onto a second page for this single-page reference form.
    if (config.page.pageBreak === 'avoid' && drawH > usableH) {
      // Already fitted via Math.min scale — no extra pages.
    }

    let layoutBlob = pdf.output('blob');

    const appendTerms =
      typeof options.appendCustomerTerms === 'boolean'
        ? options.appendCustomerTerms
        : config.appendCustomerTerms;

    if (appendTerms) {
      layoutBlob = await appendOfficialCustomerTermsPdf(layoutBlob, {
        kind: 'bl',
        formatCode: config.code,
      });
    }

    const fileName = formatPdfFilename(
      `HBL-Jasper-${model.blNumber || model.jobRef || config.code}`,
      'hbl-format',
    );
    return { blob: layoutBlob, fileName };
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}
