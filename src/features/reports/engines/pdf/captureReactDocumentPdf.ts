import { createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { sanitizeHtml2CanvasClone } from '../../utils/html2canvasSafeColors';
import {
  pageGeometryToCaptureHostCss,
  pageGeometryToJsPdfOptions,
  resolvePageGeometry,
  type PageGeometry,
  type ResolvePageGeometryInput,
} from './pageGeometry';

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

function isPageGeometry(value: ResolvePageGeometryInput | PageGeometry): value is PageGeometry {
  return (
    typeof (value as PageGeometry).widthMm === 'number' &&
    typeof (value as PageGeometry).contentWidthMm === 'number'
  );
}

export type CaptureReactDocumentPdfOptions = {
  /** mm — legacy; prefer `page`. */
  widthMm?: number;
  heightMm?: number;
  landscape?: boolean;
  /** Phase 1 shared page geometry (preferred). */
  page?: ResolvePageGeometryInput | PageGeometry;
};

/**
 * Resolve capture page box from Phase 1 geometry or legacy width/height flags.
 * Zero host margins: template documents own their padding.
 */
export function resolveCapturePageGeometry(
  options: CaptureReactDocumentPdfOptions = {},
): PageGeometry {
  if (options.page) {
    return isPageGeometry(options.page)
      ? options.page
      : resolvePageGeometry(options.page);
  }

  if (options.widthMm != null && options.heightMm != null) {
    return resolvePageGeometry({
      paper: 'Custom',
      orientation: options.landscape ? 'landscape' : 'portrait',
      widthMm: options.widthMm,
      heightMm: options.heightMm,
      marginsMm: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  }

  return resolvePageGeometry({
    paper: 'A4',
    orientation: options.landscape ? 'landscape' : 'portrait',
    marginsMm: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

/**
 * Shared html2canvas capture for template-v2 React documents.
 * Product print remains backend Puppeteer; this is catalogue/preview fidelity.
 * Preview and download callers must reuse this single blob (no second layout).
 */
export async function captureReactDocumentPdf(
  element: ReactElement,
  options: CaptureReactDocumentPdfOptions = {},
): Promise<Blob> {
  const geometry = resolveCapturePageGeometry(options);
  const hostCss = pageGeometryToCaptureHostCss(geometry);

  const host = document.createElement('div');
  host.setAttribute('data-report-template-v2-capture', 'true');
  host.setAttribute('data-fn-page-paper', geometry.paper);
  host.setAttribute('data-fn-page-orientation', geometry.orientation);
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  Object.assign(host.style, hostCss);
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

    const pdf = new jsPDF(pageGeometryToJsPdfOptions(geometry));

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
      pdf.addPage([geometry.widthMm, geometry.heightMm], geometry.orientation);
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
