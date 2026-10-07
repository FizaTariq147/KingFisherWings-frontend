import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { resolveAnyFormatUiLayout } from '../../data/resolveAnyFormatUiLayout';
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
 * Opens the KingFisher JSON layout PDF for any registered catalog/registry report code.
 * Hydrates from invoice / quotation / job / party deep-link context when present.
 */
export function CatalogReportAutoPdf({
  code,
  invoiceId,
  context,
  autoOpen = true,
}: Props) {
  const layout = resolveAnyFormatUiLayout(code);
  const preview: InvoiceFormatPreview | undefined = layout
    ? {
        code: layout.code,
        formatNumber: layout.formatNumber || 0,
        name: layout.name || layout.code,
        samplePdfUrl: null,
        layoutKind: 'generic',
        paper: layout.paper,
        rtl: layout.rtl,
        sections: [],
      }
    : undefined;

  const resolvedContext: ReportContextIds | null = context
    ? { ...context, invoice_id: context.invoice_id || invoiceId }
    : invoiceId
      ? { invoice_id: invoiceId }
      : null;

  const { viewer, error, boundLabel } = useCatalogFormatLayoutPdf({
    autoOpen,
    preview,
    fileName: formatPdfFilename(
      `Report-${layout?.formatNumber || 'X'}-${layout?.code ?? code}`,
      'report-format',
    ),
    title: preview?.name,
    context: resolvedContext,
    formatCode: preview?.code,
  });

  if (!layout || !preview) return null;

  return (
    <CatalogFormatPdfViewerShell
      viewer={viewer}
      error={error}
      title={preview.name}
      boundLabel={boundLabel}
    />
  );
}
