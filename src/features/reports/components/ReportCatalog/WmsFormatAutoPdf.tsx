import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getWmsFormatSpec } from '../../constants/wmsFormatCatalog';
import { getWmsFormatUiLayout } from '../../data/wmsFormatUiLayouts';
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

export function WmsFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getWmsFormatSpec(code);
  const layout = getWmsFormatUiLayout(code);
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
      `WMS-${spec?.sortOrder ?? 0}-${spec?.code ?? code}`,
      'wms-format',
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
