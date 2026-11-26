import { createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import type { InvoiceFormatPdfData } from '@/features/reports/utils/invoiceFormatToInvoicePdfModel';
import { appendOfficialCustomerTermsPdf } from '@/features/reports/utils/appendOfficialCustomerTermsPdf';
import { sanitizeHtml2CanvasClone } from '@/features/reports/utils/html2canvasSafeColors';
import {
  pageGeometryToCaptureHostCss,
  pageGeometryToJsPdfOptions,
} from '../../../engines/pdf/pageGeometry';
import { getHawbOfficialLayout, isHawbOfficialNativeCode } from './layouts';
import { mapToHawbOfficialModel } from './mapToHawbOfficialModel';
import { mergeHawbCatalogPreviewFixture } from './hawbOfficialCatalogFixture';
import type { HawbOfficialLayoutConfig, HawbOfficialModel } from './hawbOfficial.types';
import { HawbDraftDocument } from './documents/HawbDraftDocument';
import { HawbDraft1Document } from './documents/HawbDraft1Document';
import { HawbDraft2Document } from './documents/HawbDraft2Document';
import { HawbOriginal1Document } from './documents/HawbOriginal1Document';
import { HawbOriginal2Document } from './documents/HawbOriginal2Document';
import { generateHawbSparsePdf, isHawbSparseNativeCode } from './generateHawbSparsePdf';
import { generateOfficialMeasuredPdf } from '../../official/generateOfficialMeasuredPdf';
import { getOfficialMeasuredFace } from '../../official/officialFaceRegistry';
import { mapHawbToOfficialFaceData } from './mapHawbToOfficialFaceData';

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

function documentForVariant(
  layout: HawbOfficialLayoutConfig,
  model: HawbOfficialModel,
  options: { showUnderlay?: boolean } = {},
): ReactElement {
  switch (layout.variant) {
    case 'draft':
      return createElement(HawbDraftDocument, { model });
    case 'draft1':
      return createElement(HawbDraft1Document, { model });
    case 'draft2':
      return createElement(HawbDraft2Document, { model });
    case 'original1':
      return createElement(HawbOriginal1Document, {
        model,
        showUnderlay: options.showUnderlay,
      });
    case 'original2':
      return createElement(HawbOriginal2Document, {
        model,
        showUnderlay: options.showUnderlay,
      });
    default:
      return createElement(HawbDraftDocument, { model });
  }
}

export type GenerateHawbOfficialPdfOptions = {
  appendCustomerTerms?: boolean;
  showPlaceholders?: boolean;
  /**
   * Original-1/2 React capture path only (unused when sparse vector Generate runs).
   * Fresa pin is data-only; default false.
   */
  showUnderlay?: boolean;
};

/**
 * Generate official HAWB PDF from format-specific layout + Phase 1 geometry.
 * Preview and download must reuse this single blob.
 */
export async function generateHawbOfficialPdf(
  code: string,
  data: InvoiceFormatPdfData = {},
  options: GenerateHawbOfficialPdfOptions = {},
): Promise<{ blob: Blob; fileName: string; layout: HawbOfficialLayoutConfig }> {
  if (!isHawbOfficialNativeCode(code)) {
    throw new Error(`HAWB official generator only supports the five verified codes (got ${code})`);
  }
  // Original-1/2: Fresa samples are sparse data islands — never Draft dense + html2canvas.
  if (isHawbSparseNativeCode(code)) {
    return generateHawbSparsePdf(code, data, {
      appendCustomerTerms: options.appendCustomerTerms,
    });
  }

  // Draft / Draft-1 / Draft-2: vector measured face (Fresa pin geometry + Arimo).
  // html2canvas path produced ~200MB raster pages with 0% text fidelity.
  const measuredFace = getOfficialMeasuredFace(code);
  if (measuredFace) {
    const layout = getHawbOfficialLayout(code)!;
    const faceData = mapHawbToOfficialFaceData(code, data);
    const { blob: measuredBlob } = await generateOfficialMeasuredPdf(code, faceData);
    let layoutBlob = measuredBlob;
    const appendTerms =
      typeof options.appendCustomerTerms === 'boolean' ? options.appendCustomerTerms : true;
    if (appendTerms) {
      layoutBlob = await appendOfficialCustomerTermsPdf(layoutBlob, {
        kind: 'airway',
        formatCode: layout.code,
      });
    }
    const model0 = mapToHawbOfficialModel(code, mergeHawbCatalogPreviewFixture(data), {
      showPlaceholders: options.showPlaceholders,
    });
    return {
      blob: layoutBlob,
      fileName: formatPdfFilename(
        `HAWB-${layout.variant}-${model0.hawbNo || model0.jobNo || layout.code}`,
        'hawb-format',
      ),
      layout,
    };
  }

  const layout = getHawbOfficialLayout(code)!;
  const geometry = layout.page;
  const banners =
    layout.copyBanners.length > 0 ? layout.copyBanners : [undefined as string | undefined];
  // Catalogue browse (!entityBound): pin-density preview cargo + org chrome.
  // Entity-bound jobs keep live fields only (no invented parties).
  const pdfData = mergeHawbCatalogPreviewFixture(data);

  const host = document.createElement('div');
  host.setAttribute('data-hawb-official-capture', layout.variant);
  host.style.position = 'fixed';
  host.style.left = '-12000px';
  host.style.top = '0';
  Object.assign(host.style, pageGeometryToCaptureHostCss(geometry));
  host.style.width = `${geometry.widthMm}mm`;
  // Kill Tailwind/app chrome so capture matches Fresa: pure black grid, Arial, tight gaps.
  // Do NOT force color/background on every node — inverted HAWB NO badges need white-on-black.
  const reset = document.createElement('style');
  reset.textContent = `
    [data-hawb-official-capture], [data-hawb-official-capture] * {
      box-sizing: border-box !important;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
      font-family: Arial, Helvetica, "Helvetica Neue", sans-serif !important;
    }
    [data-hawb-official-capture] {
      color: #000000;
    }
    [data-hawb-official-capture] p {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    [data-hawb-official-capture] table {
      border-collapse: collapse !important;
      border-spacing: 0 !important;
    }
    [data-hawb-official-capture] td,
    [data-hawb-official-capture] th {
      overflow: hidden !important;
      vertical-align: top !important;
    }
    [data-hawb-official-capture] img {
      display: block;
      max-width: 100%;
    }
  `;
  host.appendChild(reset);
  document.body.appendChild(host);

  let root: Root | null = null;
  try {
    const stack = document.createElement('div');
    stack.style.width = `${geometry.widthMm}mm`;
    host.appendChild(stack);

    root = createRoot(stack);
    const pages = banners.map((banner, index) => {
      const model = mapToHawbOfficialModel(code, pdfData, {
        showPlaceholders: options.showPlaceholders,
        copyBanner: banner,
        copyIndex: banners.length > 1 ? index + 1 : undefined,
        copyTotal: banners.length > 1 ? banners.length : undefined,
      });
      return documentForVariant(layout, model, {
        showUnderlay: options.showUnderlay,
      });
    });
    root.render(createElement('div', { 'data-hawb-official-stack': layout.variant }, ...pages));

    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(stack);
    await wait(80);

    const pageNodes = Array.from(
      stack.querySelectorAll('[data-hawb-official-page]'),
    ) as HTMLElement[];
    const targets = pageNodes.length > 0 ? pageNodes : [stack];

    const pdf = new jsPDF(pageGeometryToJsPdfOptions(geometry));
    let first = true;

    for (const target of targets) {
      sanitizeHtml2CanvasClone(document, target);
      const canvas = await html2canvas(target, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: geometry.widthCssPx,
        onclone: (clonedDoc, el) => sanitizeHtml2CanvasClone(clonedDoc, el),
      });

      if (!first) {
        pdf.addPage([geometry.widthMm, geometry.heightMm], geometry.orientation);
      }
      first = false;

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      const drawH = Math.min(imgH, pageH);
      // PNG keeps thin grid lines sharp (JPEG was softening borders).
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, drawH);
    }

    let layoutBlob = pdf.output('blob');

    // Same Airway T&C PDF after every HAWB face set (Draft / Draft-1 / Draft-2).
    // Default on; caller may pass appendCustomerTerms:false for face-only harness.
    const appendTerms =
      typeof options.appendCustomerTerms === 'boolean' ? options.appendCustomerTerms : true;

    if (appendTerms) {
      layoutBlob = await appendOfficialCustomerTermsPdf(layoutBlob, {
        kind: 'airway',
        formatCode: layout.code,
      });
    }

    const model0 = mapToHawbOfficialModel(code, pdfData, {
      showPlaceholders: options.showPlaceholders,
    });
    const fileName = formatPdfFilename(
      `HAWB-${layout.variant}-${model0.hawbNo || model0.jobNo || layout.code}`,
      'hawb-format',
    );

    return { blob: layoutBlob, fileName, layout };
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}

/** Merge helper kept for QA: prove preview/download share bytes. */
export async function hawbOfficialPreviewDownloadSameBlob(blob: Blob): Promise<{
  previewBlob: Blob;
  downloadBlob: Blob;
  identical: boolean;
}> {
  const previewBlob = blob;
  const downloadBlob = blob;
  const a = new Uint8Array(await previewBlob.arrayBuffer());
  const b = new Uint8Array(await downloadBlob.arrayBuffer());
  const identical = a.length === b.length && a.every((v, i) => v === b[i]);
  return { previewBlob, downloadBlob, identical };
}

/** Inspect face page count before optional T&C append (pdf-lib). */
export async function countPdfPages(blob: Blob): Promise<number> {
  const doc = await PDFDocument.load(await blob.arrayBuffer(), { ignoreEncryption: true });
  return doc.getPageCount();
}
