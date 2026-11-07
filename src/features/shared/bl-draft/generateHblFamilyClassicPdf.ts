import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { HBL_OFFICIAL_CATALOG } from '@/features/reports/constants/hblOfficialCatalog.generated.ts';
import { getHblFormatSpec } from '@/features/reports/constants/hblFormatCatalog';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import { sanitizeHtml2CanvasClone } from '@/features/reports/utils/html2canvasSafeColors';
import { shouldAppendCustomerTermsPage } from '@/features/reports/utils/shouldAppendCustomerTermsPage';
import { buildBlDraftClassicModel } from './generateBlDraftPdf';
import { resolveHblFamilyDocument, type HblBlFamilyVariant } from './families';

function resolveFamilyVariant(code: string): HblBlFamilyVariant {
  const needle = code.trim().toUpperCase();
  const fromSpec = getHblFormatSpec(needle)?.variant;
  const fromOfficial = HBL_OFFICIAL_CATALOG.find((r) => r.code.toUpperCase() === needle)?.variant;
  const raw = fromSpec || fromOfficial || 'combined';
  if (
    raw === 'jasper' ||
    raw === 'multimodal' ||
    raw === 'mt' ||
    raw === 'ocean' ||
    raw === 'combined'
  ) {
    return raw;
  }
  return 'combined';
}

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

/**
 * Live-entity HBL fallback when sea.hbl_* pack is not ready.
 * Renders one of five structurally distinct classic family documents — not hblBlShell.
 */
export async function generateHblFamilyClassicPdf(
  code: string,
  data: InvoiceFormatPdfData = {},
  options: { appendCustomerTerms?: boolean; preview?: unknown } = {},
): Promise<{ blob: Blob; fileName: string; variant: HblBlFamilyVariant }> {
  const variant = resolveFamilyVariant(code);
  const Document = resolveHblFamilyDocument(variant);
  const model = buildBlDraftClassicModel(options.preview, data);

  const cssWidth = 794;
  const host = document.createElement('div');
  host.setAttribute('data-hbl-family-pdf-capture', variant);
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
    root.render(createElement(Document, { model }));
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(mount);
    await wait(80);

    const sheet = (mount.querySelector('[data-bl-draft-sheet]') as HTMLElement) || mount;
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
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;
    const scale = Math.min(usableW / canvas.width, usableH / canvas.height);
    const drawW = canvas.width * scale;
    const drawH = canvas.height * scale;
    const x = margin + (usableW - drawW) / 2;
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', x, margin, drawW, drawH);
    let layoutBlob = pdf.output('blob');

    const appendTerms =
      typeof options.appendCustomerTerms === 'boolean'
        ? options.appendCustomerTerms
        : shouldAppendCustomerTermsPage(code);

    if (appendTerms) {
      layoutBlob = await appendOfficialCustomerTermsPdf(layoutBlob, {
        kind: 'bl',
        formatCode: code,
      });
    }

    const fileName = formatPdfFilename(
      `HBL-${variant}-${model.blNumber || model.jobRef || code}`,
      'hbl-format',
    );
    return { blob: layoutBlob, fileName, variant };
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}
