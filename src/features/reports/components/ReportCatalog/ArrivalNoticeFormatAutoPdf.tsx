import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getArrivalNoticeFormatSpec } from '../../constants/arrivalNoticeFormatCatalog';
import { getArrivalNoticeFormatUiLayout } from '../../data/arrivalNoticeFormatUiLayouts';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import {
  CatalogFormatPdfViewerShell,
  useCatalogFormatLayoutPdf,
} from '../../hooks/useCatalogFormatLayoutPdf';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

export function ArrivalNoticeFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getArrivalNoticeFormatSpec(code);
  const layout = getArrivalNoticeFormatUiLayout(code);
  const preview: InvoiceFormatPreview | undefined =
    spec && layout
      ? {
          code: layout.code,
          formatNumber: layout.formatNumber || spec.sortOrder,
          name: layout.name || spec.name,
          samplePdfUrl: null,
          layoutKind: 'warehouse',
          paper: layout.paper,
          rtl: layout.rtl,
          sections: [],
        }
      : undefined;

  const { viewer, error, boundLabel } = useCatalogFormatLayoutPdf({
    autoOpen,
    preview,
    fileName: formatPdfFilename(
      `Arrival-${spec?.sortOrder ?? 0}-${spec?.code ?? code}`,
      'arrival-notice-format',
    ),
    title: preview?.name || spec?.name,
    context,
    formatCode: preview?.code,
  });

  if (!spec || !layout || !preview) return null;
  return (
    <CatalogFormatPdfViewerShell viewer={viewer} error={error} title={preview.name} />
  );
}
