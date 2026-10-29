import { createRoot, type Root } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { InvoiceFormatLayoutByKind } from '../components/ReportCatalog/invoiceLayouts';
import type { InvoiceFormatPdfData } from './invoiceFormatToInvoicePdfModel';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { appendOfficialCustomerTermsPdf } from './appendOfficialCustomerTermsPdf';
import { resolveCustomerTermsKind } from './resolveCustomerTermsKind';
import { resolveCustomerTermsBranding } from './resolveCustomerTermsBranding';
import {
  SHARED_LAYOUT_CHROME,
  type SharedLayoutChrome,
} from './applySharedLayoutChrome';
import { sanitizeHtml2CanvasClone } from './html2canvasSafeColors';
import { resolveReportPaperGeometry } from './reportPaperGeometry';
import { resolveAnyFormatUiLayout } from '../data/resolveAnyFormatUiLayout';

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

export type GenerateInvoiceFormatPreviewPdfOptions = {
  /**
   * Override T&C append for this call only.
   * When omitted, BL → BL Terms PDF and airway bill → Airway Terms PDF.
   */
  appendCustomerTerms?: boolean;
};

/**
 * Render KingFisher report layout to PDF (page 1 = layout sheet).
 * Bill of Lading formats append `BL_Terms_and_Conditions.pdf`;
 * HAWB/MAWB/AWB formats append `Airway_Terms_and_Conditions.pdf`.
 * All other formats get layout pages only.
 */
export async function generateInvoiceFormatPreviewPdf(
  preview: InvoiceFormatPreview,
  data: InvoiceFormatPdfData = {},
  options: GenerateInvoiceFormatPreviewPdfOptions = {},
): Promise<Blob> {
  const layout = resolveAnyFormatUiLayout(preview.code);
  const orientation =
    preview.orientation ||
    layout?.orientation ||
    (preview.layoutKind === 'usa' || preview.formatNumber === 9 ? 'portrait' : undefined);
  const paper =
    preview.paper ||
    layout?.paper ||
    (preview.layoutKind === 'usa' || preview.formatNumber === 9 ? 'Letter' : 'A4');
  const geom = resolveReportPaperGeometry(paper, orientation);

  const appendTerms = shouldAppendCustomerTermsPage(preview.code, {
    override: options.appendCustomerTerms,
  });

  const host = document.createElement('div');
  host.setAttribute('data-invoice-format-pdf-capture', 'true');
  host.style.cssText = [
    'position:fixed',
    'left:-12000px',
    'top:0',
    `width:${geom.cssWidth}px`,
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
    // Shared header/footer chrome from org profile (same for every format).
    let chrome: SharedLayoutChrome = SHARED_LAYOUT_CHROME;
    try {
      const termsBrand = await resolveCustomerTermsBranding();
      if (termsBrand.companyName?.trim()) {
        chrome = { ...SHARED_LAYOUT_CHROME, company: termsBrand.companyName.trim() };
      }
    } catch {
      /* keep default chrome */
    }
    const liveData = {
      ...data,
      companyName: data.companyName || chrome.company,
    };

    // Ensure layout orientation/paper reach the renderer even when preview omits them.
    const capturePreview: InvoiceFormatPreview = {
      ...preview,
      paper: geom.paper,
      orientation: geom.orientation,
      appendCustomerTerms:
        typeof options.appendCustomerTerms === 'boolean'
          ? options.appendCustomerTerms
          : preview.appendCustomerTerms ?? layout?.appendCustomerTerms,
    };

    root = createRoot(mount);
    root.render(
      <InvoiceFormatLayoutByKind preview={capturePreview} data={liveData} chrome={chrome} />,
    );

    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    await waitForImages(mount);
    await wait(80);

    const sheet = (mount.querySelector('[data-invoice-sheet]') as HTMLElement) || mount;
    if (!sheet || sheet.offsetWidth < 1 || sheet.offsetHeight < 1) {
      throw new Error(
        `Layout preview did not render for ${preview.code}. Check that the format JSON layout exists.`,
      );
    }

    // Capture body and footer as SEPARATE canvases, then compose in jsPDF.
    // html2canvas 1.x frequently paints the flex-pinned colorful footer over the
    // last body lines when both are in one capture — dual capture avoids that.
    const footerEl = sheet.querySelector('[data-invoice-footer="sample"]') as HTMLElement | null;
    const spacerEl = sheet.querySelector(
      '[data-invoice-footer-spacer="true"]',
    ) as HTMLElement | null;
    const bodyEl = (sheet.querySelector('[data-invoice-body="true"]') as HTMLElement) || sheet;

    const prevFooterDisplay = footerEl?.style.display ?? '';
    const prevSpacerDisplay = spacerEl?.style.display ?? '';
    const prevSheetMinH = sheet.style.minHeight;
    const prevSheetH = sheet.style.height;
    const prevSheetDisplay = sheet.style.display;
    const prevBodyDisplay = bodyEl.style.display;

    const h2cOpts = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff' as string,
      logging: false,
      foreignObjectRendering: false,
      onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
        sanitizeHtml2CanvasClone(clonedDoc, clonedElement);
      },
    };

    // 1) Body-only capture (hide footer + spacer).
    if (footerEl) footerEl.style.display = 'none';
    if (spacerEl) spacerEl.style.display = 'none';
    sheet.style.display = 'block';
    sheet.style.minHeight = '0';
    sheet.style.height = 'auto';
    bodyEl.style.display = 'block';
    await wait(16);
    sanitizeHtml2CanvasClone(document, bodyEl);
    const bodyCanvas = await html2canvas(bodyEl, {
      ...h2cOpts,
      width: geom.cssWidth,
      windowWidth: geom.cssWidth,
    });

    // 2) Footer-only capture in an isolated host so flex/minHeight on the sheet
    // cannot inflate or clip the measured footer band.
    let footerCanvas: HTMLCanvasElement | null = null;
    let footerDomCssH = 0;
    let footerIsolate: HTMLDivElement | null = null;
    let footerHome: { parent: Node; next: ChildNode | null } | null = null;
    if (footerEl) {
      footerHome = { parent: footerEl.parentNode!, next: footerEl.nextSibling };
      footerIsolate = document.createElement('div');
      footerIsolate.setAttribute('data-invoice-footer-isolate', 'true');
      footerIsolate.style.cssText = [
        'position:fixed',
        'left:-14000px',
        'top:0',
        `width:${geom.cssWidth}px`,
        'background:#ffffff',
        'z-index:-1',
        'pointer-events:none',
      ].join(';');
      footerEl.style.display = 'block';
      footerEl.style.position = 'static';
      footerEl.style.flex = 'none';
      footerEl.style.width = `${geom.cssWidth}px`;
      footerEl.style.minHeight = '0';
      footerEl.style.height = 'auto';
      footerIsolate.appendChild(footerEl);
      document.body.appendChild(footerIsolate);
      await wait(16);
      footerDomCssH = Math.max(footerEl.offsetHeight, footerEl.scrollHeight, 1);
      sanitizeHtml2CanvasClone(document, footerEl);
      footerCanvas = await html2canvas(footerEl, {
        ...h2cOpts,
        width: geom.cssWidth,
        windowWidth: geom.cssWidth,
        height: footerDomCssH,
        windowHeight: footerDomCssH,
      });
    }

    // Restore preview layout styles.
    if (footerEl && footerHome) {
      footerHome.parent.insertBefore(footerEl, footerHome.next);
    }
    footerIsolate?.remove();
    sheet.style.display = prevSheetDisplay;
    sheet.style.minHeight = prevSheetMinH;
    sheet.style.height = prevSheetH;
    bodyEl.style.display = prevBodyDisplay;
    if (footerEl) footerEl.style.display = prevFooterDisplay;
    if (spacerEl) spacerEl.style.display = prevSpacerDisplay;

    const pdf = new jsPDF({
      orientation: geom.jsPdfOrientation,
      unit: 'pt',
      format: geom.jsPdfFormat,
      compress: true,
    });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const imgW = bodyCanvas.width;
    const bodyImgH = bodyCanvas.height;
    if (!Number.isFinite(imgW) || !Number.isFinite(bodyImgH) || imgW < 1 || bodyImgH < 1) {
      throw new Error(`PDF capture produced an empty body canvas for ${preview.code}.`);
    }

    const bodyScale = pageW / imgW;
    if (!Number.isFinite(bodyScale) || bodyScale <= 0) {
      throw new Error(`Invalid PDF scale for ${preview.code}.`);
    }
    const drawW = pageW;
    const jpegQuality = 0.93;
    const ptPerCssPx = pageW / geom.cssWidth;
    const footerImgH = footerCanvas?.height ?? 0;
    const footerCanvasScale =
      footerCanvas && footerCanvas.width > 0 ? pageW / footerCanvas.width : bodyScale;
    // Prefer the larger of canvas vs DOM so we never reserve less than the real bar.
    const footerImageDrawH = footerImgH > 0 ? footerImgH * footerCanvasScale : 0;
    const footerDomDrawH = footerDomCssH > 0 ? footerDomCssH * ptPerCssPx : 0;
    // Never reserve less than a real bar (~28pt) or last lines sit flush on the footer.
    const footerDrawH =
      footerImageDrawH > 0 || footerDomDrawH > 0
        ? Math.max(footerImageDrawH, footerDomDrawH, 28)
        : 0;
    // Clearance between last body ink and the footer band (pt). 10pt still looked
    // like overlap on dense invoices; 20pt keeps a visible white strip.
    const gapPt = footerDrawH > 0 ? 24 : 0;
    const footerBandPt = footerDrawH + gapPt;
    const contentPageH = Math.max(8, pageH - footerBandPt);
    const contentPageSrcH = Math.max(1, Math.floor(contentPageH / bodyScale));
    // Search up to ~1.5 lines for a clean (near-white) break so we don't bisect
    // text flush against the footer — that reads as "footer overlap".
    const breakSearchPx = Math.max(24, Math.round(18 / bodyScale));

    const rowInkRatio = (src: HTMLCanvasElement, y: number): number => {
      const ctx = src.getContext('2d');
      if (!ctx || y < 0 || y >= src.height) return 0;
      const row = ctx.getImageData(0, y, src.width, 1).data;
      let ink = 0;
      const step = 16; // sample every 4px (RGBA)
      for (let i = 0; i < row.length; i += step) {
        if ((row[i]! + row[i + 1]! + row[i + 2]!) / 3 < 245) ink += 1;
      }
      return ink / (row.length / step);
    };

    const findCleanSliceHeight = (fromY: number, maxH: number): number => {
      if (fromY + maxH >= bodyImgH) return Math.min(maxH, bodyImgH - fromY);
      const idealEnd = fromY + maxH;
      const searchStart = Math.max(fromY + Math.floor(maxH * 0.7), idealEnd - breakSearchPx);
      let best = maxH;
      let bestScore = Number.POSITIVE_INFINITY;
      for (let end = idealEnd; end >= searchStart; end -= 1) {
        const ink = rowInkRatio(bodyCanvas, end - 1);
        if (ink < 0.01) return end - fromY;
        if (ink < bestScore) {
          bestScore = ink;
          best = end - fromY;
        }
      }
      return best;
    };

    const drawCanvas = (
      src: HTMLCanvasElement,
      srcY: number,
      srcH: number,
      destY: number,
      destH: number,
    ) => {
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = src.width;
      sliceCanvas.height = Math.max(1, Math.ceil(srcH));
      const ctx = sliceCanvas.getContext('2d');
      if (!ctx) throw new Error(`PDF page slice failed for ${preview.code}.`);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(src, 0, srcY, src.width, srcH, 0, 0, src.width, srcH);
      pdf.addImage(
        sliceCanvas.toDataURL('image/jpeg', jpegQuality),
        'JPEG',
        0,
        destY,
        drawW,
        destH,
      );
    };

    const stampFooter = () => {
      if (!footerCanvas || footerImgH < 1 || footerImageDrawH < 1) return;
      // Bottom-align the captured footer inside the reserved band (never stretch,
      // never draw past pageH).
      const destY = Math.max(0, pageH - footerImageDrawH);
      drawCanvas(footerCanvas, 0, footerImgH, destY, footerImageDrawH);
    };

    // Always clip body to the content band — the old single-page full-bleed
    // addImage could paint last rows into the footer zone when heights were tight.
    let srcY = 0;
    let pageIndex = 0;
    while (srcY < bodyImgH) {
      const maxSlice = Math.min(contentPageSrcH, bodyImgH - srcY);
      const sliceH = findCleanSliceHeight(srcY, maxSlice);
      if (pageIndex > 0) pdf.addPage();
      drawCanvas(bodyCanvas, srcY, sliceH, 0, sliceH * bodyScale);
      stampFooter();
      srcY += sliceH;
      pageIndex += 1;
      if (sliceH < 1) break;
    }

    const layoutBlob = pdf.output('blob');
    if (!appendTerms) return layoutBlob;

    const termsKind = resolveCustomerTermsKind(preview.code);
    if (!termsKind) return layoutBlob;

    return appendOfficialCustomerTermsPdf(layoutBlob, {
      kind: termsKind,
      formatCode: preview.code,
    });
  } finally {
    try {
      root?.unmount();
    } catch {
      /* ignore */
    }
    host.remove();
  }
}
