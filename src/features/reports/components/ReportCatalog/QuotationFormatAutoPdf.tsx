import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getQuotationFormatSpec } from '../../constants/quotationFormatCatalog';
import { getQuotationFormatUiLayout } from '../../data/quotationFormatUiLayouts';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  CatalogFormatPdfViewerShell,
  useCatalogFormatLayoutPdf,
} from '../../hooks/useCatalogFormatLayoutPdf';

type Props = {
  code: string;
  quotationId?: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * Opens KingFisher quotation layout PDF on select.
 * Live quotation / related entity fields are merged from context or quotationId.
 */
export function QuotationFormatAutoPdf({
  code,
  quotationId,
  context,
  autoOpen = true,
}: Props) {
  const spec = getQuotationFormatSpec(code);
  const layout = getQuotationFormatUiLayout(code);
  const preview: InvoiceFormatPreview | undefined = layout
    ? {
        code: layout.code,
        formatNumber: layout.formatNumber || spec?.sortOrder || 0,
        name: layout.name || spec?.name || layout.code,
        samplePdfUrl: null,
        layoutKind: 'generic',
        paper: layout.paper,
        rtl: layout.rtl,
        sections: [],
      }
    : undefined;

  const resolvedContext: ReportContextIds | null = context
    ? { ...context, quotation_id: context.quotation_id || quotationId }
    : quotationId
      ? { quotation_id: quotationId }
      : null;

  const { viewer, error, boundLabel } = useCatalogFormatLayoutPdf({
    autoOpen,
    preview,
    fileName: formatPdfFilename(
      `Quotation-${layout?.formatNumber ?? 0}-${layout?.code ?? code}`,
      'quotation-format',
    ),
    title: preview?.name || spec?.name,
    context: resolvedContext,
    formatCode: preview?.code,
  });

  if (!layout || !preview) return null;

  return (
    <CatalogFormatPdfViewerShell
      viewer={viewer}
      error={error}
      title={preview.name || spec?.name}
      boundLabel={boundLabel}
    />
  );
}
