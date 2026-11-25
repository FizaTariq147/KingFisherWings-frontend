import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { resolveAnyFormatUiLayout } from '../../data/resolveAnyFormatUiLayout';
import { getOfficialMeasuredFace } from '../../templates/official/officialFaceRegistry';
import { hasCatalogLayoutPdf } from '../../utils/generateCatalogLayoutPdf';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  CatalogFormatPdfViewerShell,
  useCatalogFormatLayoutPdf,
} from '../../hooks/useCatalogFormatLayoutPdf';

type Props = {
  code: string;
  /** @deprecated Prefer `context.invoice_id`. Kept for callers. */
  invoiceId?: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * Opens Freightnest PDF for any registered / measured catalogue code.
 * Prefers measured Fresa geometry when available; JSON shell is fallback only.
 */
export function CatalogReportAutoPdf({
  code,
  invoiceId,
  context,
  autoOpen = true,
}: Props) {
  const layout = resolveAnyFormatUiLayout(code);
  const measured = getOfficialMeasuredFace(code);
  const canOpen = Boolean(layout || measured || hasCatalogLayoutPdf(code));

  const preview: InvoiceFormatPreview | undefined = layout
    ? {
        code: layout.code,
        formatNumber: layout.formatNumber || 0,
        name: layout.name || layout.code,
        samplePdfUrl: null,
        layoutKind: 'generic',
        paper: layout.paper,
        orientation: layout.orientation,
        appendCustomerTerms: layout.appendCustomerTerms,
        rtl: layout.rtl,
        sections: [],
      }
    : measured || canOpen
      ? {
          code,
          formatNumber: 0,
          name: measured?.name || code,
          samplePdfUrl: measured?.samplePdfUrl || null,
          layoutKind: 'generic',
          paper: 'A4',
          rtl: false,
          sections: [],
        }
      : undefined;

  const resolvedContext: ReportContextIds | null = context
    ? { ...context, invoice_id: context.invoice_id || invoiceId }
    : invoiceId
      ? { invoice_id: invoiceId }
      : null;

  const { viewer, error, boundLabel } = useCatalogFormatLayoutPdf({
    autoOpen: autoOpen && Boolean(preview),
    preview,
    fileName: formatPdfFilename(
      `Report-${layout?.formatNumber || 'X'}-${preview?.code ?? code}`,
      'report-format',
    ),
    title: preview?.name,
    context: resolvedContext,
    formatCode: preview?.code,
  });

  if (!preview) return null;

  return (
    <CatalogFormatPdfViewerShell
      viewer={viewer}
      error={error}
      title={preview.name}
      boundLabel={boundLabel}
    />
  );
}
