import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { getInvoiceFormatUiLayout } from '../../data/invoiceFormatUiLayouts';
import { getAccountsFormatUiLayout } from '../../data/accountsFormatUiLayouts';
import { getWmsFormatUiLayout } from '../../data/wmsFormatUiLayouts';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  CatalogFormatPdfViewerShell,
  useCatalogFormatLayoutPdf,
} from '../../hooks/useCatalogFormatLayoutPdf';

type Props = {
  code: string;
  invoiceId?: string;
  /** Full catalogue deep-link context (preferred when present). */
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

function previewFromLayout(code: string): InvoiceFormatPreview | undefined {
  const layout =
    getInvoiceFormatUiLayout(code) ??
    getAccountsFormatUiLayout(code) ??
    getWmsFormatUiLayout(code);
  if (!layout) return undefined;
  return {
    code: layout.code,
    formatNumber: layout.formatNumber,
    name: layout.name,
    samplePdfUrl: null,
    layoutKind: 'generic',
    paper: layout.paper,
    rtl: layout.rtl,
    sections: [],
  };
}

/**
 * Opens KingFisher layout PDF on select (JSON layout + KF logo).
 * Live invoice / related entity fields are merged from context or invoiceId.
 */
export function InvoiceFormatAutoPdf({
  code,
  invoiceId,
  context,
  autoOpen = true,
}: Props) {
  const preview = getInvoiceFormatPreview(code) ?? previewFromLayout(code);
  const resolvedContext: ReportContextIds | null = context
    ? { ...context, invoice_id: context.invoice_id || invoiceId }
    : invoiceId
      ? { invoice_id: invoiceId }
      : null;

  const { viewer, error, boundLabel } = useCatalogFormatLayoutPdf({
    autoOpen,
    preview,
    fileName: formatPdfFilename(
      `Format-${preview?.formatNumber ?? 0}-${preview?.code ?? code}`,
      'invoice-format',
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
