import { jsPDF } from 'jspdf';
import {
  pageGeometryToJsPdfOptions,
  resolvePageGeometry,
  type PageGeometry,
  type ResolvePageGeometryInput,
} from './pageGeometry';
import {
  FREIGHTNEST_DOCUMENT_TYPOGRAPHY,
  type DocumentTypography,
} from './documentTypography';

export type GeometryFixtureOptions = {
  page?: ResolvePageGeometryInput | PageGeometry;
  /** How many pages to emit (default 2 for multi-page checks). */
  pageCount?: number;
  /** Title drawn in the header band. */
  title?: string;
  /** Footer label (branding must be org-derived in product; fixtures use a neutral label). */
  footerLabel?: string;
  typography?: DocumentTypography;
  /** Draw a sample table with repeating header text per page. */
  includeTable?: boolean;
};

function isPageGeometry(value: ResolvePageGeometryInput | PageGeometry): value is PageGeometry {
  return (
    typeof (value as PageGeometry).widthMm === 'number' &&
    typeof (value as PageGeometry).contentWidthMm === 'number'
  );
}

/**
 * Node/browser-safe PDF fixture using jsPDF + Phase 1 geometry.
 * Used for MediaBox / orientation / multi-page inspection (not format fidelity).
 */
export function createGeometryFixturePdf(options: GeometryFixtureOptions = {}): Blob {
  const geometry = options.page
    ? isPageGeometry(options.page)
      ? options.page
      : resolvePageGeometry(options.page)
    : resolvePageGeometry({ paper: 'A4', orientation: 'portrait' });

  const typography = options.typography ?? FREIGHTNEST_DOCUMENT_TYPOGRAPHY;
  const pageCount = Math.max(1, options.pageCount ?? 2);
  const title = options.title ?? 'Freightnest Phase 1 geometry fixture';
  const footerLabel = options.footerLabel ?? 'Freightnest · registered org branding only';
  const includeTable = options.includeTable !== false;

  const pdf = new jsPDF(pageGeometryToJsPdfOptions(geometry));
  const m = geometry.marginsMm;
  const contentW = geometry.contentWidthMm;
  // jsPDF built-in faces only; CSS stack (Arial/Helvetica) maps here for fixtures.
  const font = 'helvetica';

  for (let i = 0; i < pageCount; i += 1) {
    if (i > 0) pdf.addPage([geometry.widthMm, geometry.heightMm], geometry.orientation);

    // Outer page border (overflow / margin visual check)
    pdf.setDrawColor(26, 26, 26);
    pdf.setLineWidth(0.2);
    pdf.rect(m.left, m.top, contentW, geometry.contentHeightMm);

    // Header band
    pdf.setFillColor(243, 243, 243);
    pdf.rect(m.left, m.top, contentW, 10, 'F');
    pdf.setFont(font, 'bold');
    pdf.setFontSize(typography.sizesPx.title);
    pdf.setTextColor(17, 17, 17);
    pdf.text(title, m.left + 2, m.top + 6.5, {
      maxWidth: contentW - 4,
      align: 'left',
    });

    // Body
    pdf.setFont(font, 'normal');
    pdf.setFontSize(typography.sizesPx.body);
    const bodyY = m.top + 16;
    pdf.text(
      [
        `Paper: ${geometry.paper} · ${geometry.orientation}`,
        `Page box: ${geometry.widthMm.toFixed(1)}×${geometry.heightMm.toFixed(1)} mm`,
        `PDF points: ${geometry.widthPt}×${geometry.heightPt} pt`,
        `Margins mm: T${m.top} R${m.right} B${m.bottom} L${m.left}`,
        `Page ${i + 1} of ${pageCount}`,
      ].join('\n'),
      m.left + 2,
      bodyY,
      { maxWidth: contentW - 4, lineHeightFactor: typography.lineHeights.normal },
    );

    if (includeTable) {
      const tableTop = bodyY + 28;
      const colW = contentW / 4;
      const headers = ['Marks', 'Pkgs', 'Description', 'Weight'];
      const rowH = 7;
      pdf.setFillColor(243, 243, 243);
      pdf.rect(m.left, tableTop, contentW, rowH, 'F');
      pdf.setFont(font, 'bold');
      pdf.setFontSize(typography.sizesPx.label);
      headers.forEach((h, idx) => {
        pdf.text(h, m.left + idx * colW + 1.5, tableTop + 4.8);
      });
      pdf.setFont(font, 'normal');
      pdf.setFontSize(typography.sizesPx.body);
      for (let r = 0; r < 3; r += 1) {
        const y = tableTop + rowH * (r + 1);
        pdf.rect(m.left, y, contentW, rowH);
        ['ABC', String(r + 1), `Line item ${r + 1} wraps safely`, '10.0'].forEach((cell, idx) => {
          pdf.text(cell, m.left + idx * colW + 1.5, y + 4.8, {
            maxWidth: colW - 3,
          });
        });
      }
      // Column separators
      for (let c = 1; c < 4; c += 1) {
        pdf.line(m.left + c * colW, tableTop, m.left + c * colW, tableTop + rowH * 4);
      }
    }

    // Footer
    const footerY = geometry.heightMm - m.bottom - 4;
    pdf.setDrawColor(26, 26, 26);
    pdf.line(m.left, footerY - 3, m.left + contentW, footerY - 3);
    pdf.setFontSize(typography.sizesPx.caption);
    pdf.setTextColor(51, 51, 51);
    pdf.text(footerLabel, m.left + 2, footerY, { maxWidth: contentW - 20 });
    pdf.text(`${i + 1}/${pageCount}`, m.left + contentW - 2, footerY, { align: 'right' });
  }

  return pdf.output('blob');
}

/** Same blob reference for preview + download (no second layout pass). */
export function shareFixturePdfForPreviewAndDownload(blob: Blob): {
  previewBlob: Blob;
  downloadBlob: Blob;
} {
  return { previewBlob: blob, downloadBlob: blob };
}
