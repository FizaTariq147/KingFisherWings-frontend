import { jsPDF } from 'jspdf';
import {
  pageGeometryToJsPdfOptions,
} from '../../../engines/pdf/pageGeometry';
import type { HawbOfficialLayoutConfig, HawbOfficialModel } from './hawbOfficial.types';
import { getHawbOfficialLayout } from './layouts';
import { mapToHawbOfficialModel } from './mapToHawbOfficialModel';
import type { InvoiceFormatPdfData } from '../../../utils/invoiceFormatToInvoicePdfModel';

/**
 * Node-safe structural evidence PDF from the same layout configs as production React faces.
 * Used for MediaBox / orientation / multi-page / distinctness inspection in CI.
 * Not a second production layout — production uses generateHawbOfficialPdf (React capture).
 */
export function createHawbOfficialEvidencePdf(
  code: string,
  data: InvoiceFormatPdfData = {},
): { blob: Blob; layout: HawbOfficialLayoutConfig } {
  const layout = getHawbOfficialLayout(code);
  if (!layout) throw new Error(`Unknown official HAWB code: ${code}`);

  const banners = layout.copyBanners.length > 0 ? layout.copyBanners : ['FACE'];
  const pdf = new jsPDF(pageGeometryToJsPdfOptions(layout.page));
  const g = layout.page;
  const m = g.marginsMm;

  banners.forEach((banner, index) => {
    if (index > 0) pdf.addPage([g.widthMm, g.heightMm], g.orientation);
    const model = mapToHawbOfficialModel(code, data, {
      showPlaceholders: !data.entityBound,
      copyBanner: banner === 'FACE' ? undefined : banner,
      copyIndex: banners.length > 1 ? index + 1 : undefined,
      copyTotal: banners.length > 1 ? banners.length : undefined,
    });
    drawEvidencePage(pdf, layout, model, m.left, m.top, g.contentWidthMm, g.contentHeightMm);
  });

  return { blob: pdf.output('blob'), layout };
}

function drawEvidencePage(
  pdf: jsPDF,
  layout: HawbOfficialLayoutConfig,
  model: HawbOfficialModel,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  pdf.setDrawColor(16, 16, 16);
  pdf.setLineWidth(0.3);
  // Preprinted originals are data overlays — no outer form border (Phase 2.1 QA).
  if (!layout.sparseOverlay) {
    pdf.rect(x, y, w, h);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(layout.statusRibbon, x + 2, y + 5);
  pdf.setFontSize(8);
  pdf.text(model.copyBanner || layout.titleMode, x + 2, y + 10);
  pdf.text(`HAWB ${model.hawbNo || '—'}`, x + w - 2, y + 5, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text(
    [
      `code=${layout.code}`,
      `variant=${layout.variant}`,
      `MediaBox=${Math.round(layout.page.widthPt)}×${Math.round(layout.page.heightPt)}pt`,
      `sparse=${layout.sparseOverlay} notify=${layout.showNotify} preprinted=${layout.preprinted}`,
      `title=${layout.titleMode}`,
      `company=${model.companyName || '(org profile)'}`,
    ].join('\n'),
    x + 2,
    y + 16,
    { maxWidth: w - 4, lineHeightFactor: 1.35 },
  );

  if (layout.sparseOverlay) {
    // Sparse islands
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text(model.shipperLines.join('\n') || '', x + 4, y + 40, { maxWidth: w * 0.45 });
    pdf.text(model.consigneeLines.join('\n') || '', x + 4, y + 55, { maxWidth: w * 0.45 });
    pdf.text(model.departure || '', x + 4, y + 72);
    pdf.text([model.toCode, model.flightDate].filter(Boolean).join(' '), x + 4, y + 78);
    pdf.text(model.hawbNo || '', x + w - 4, y + h - 8, { align: 'right' });
  } else {
    // Dense grid sketch
    const rowH = 8;
    const cols = 4;
    const colW = w / cols;
    for (let r = 0; r < 6; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        pdf.rect(x + c * colW, y + 38 + r * rowH, colW, rowH);
      }
    }
    pdf.setFontSize(6);
    pdf.text("Shipper's Name and Address", x + 1, y + 41);
    pdf.text(model.shipperLines[0] || '', x + 1, y + 44, { maxWidth: colW * 2 - 2 });
    pdf.text(layout.showNotify ? 'Notify Party' : "Issuing Carrier's Agent", x + colW * 2 + 1, y + 49);
    if (layout.showNotify) {
      pdf.text(model.notifyLines[0] || '', x + colW * 2 + 1, y + 52, { maxWidth: colW * 2 - 2 });
    }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(layout.titleMode, x + colW * 2 + colW / 2, y + 70, { align: 'center' });

    // Cargo table header
    const headers = ['Pcs', 'Gross', 'kg', 'Class', 'Chg Wt', 'Rate', 'Total', 'Nature'];
    const tw = w / headers.length;
    const ty = y + 95;
    headers.forEach((hLabel, i) => {
      pdf.rect(x + i * tw, ty, tw, 6);
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(hLabel, x + i * tw + 0.8, ty + 4);
    });
    pdf.rect(x, ty + 6, w, 14);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.text(model.natureOfGoods || model.pieces || '', x + 1, ty + 12, { maxWidth: w - 2 });

    // Signature band
    pdf.rect(x, y + h - 22, w / 2, 18);
    pdf.rect(x + w / 2, y + h - 22, w / 2, 18);
    pdf.setFontSize(5);
    pdf.text('Signature of Shipper or his Agent', x + 1, y + h - 18);
    pdf.text('Signature of Issuing Carrier or its Agent', x + w / 2 + 1, y + h - 18);
    pdf.text(model.companyName || '', x + w / 2 + 1, y + h - 10);
  }
}
