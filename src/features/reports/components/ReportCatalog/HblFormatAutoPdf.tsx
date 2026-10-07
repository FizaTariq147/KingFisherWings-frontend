import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getHblFormatSpec } from '../../constants/hblFormatCatalog';
import { getHblFormatUiLayout } from '../../data/hblFormatUiLayouts';
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

export function HblFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getHblFormatSpec(code);
  const layout = getHblFormatUiLayout(code);
  const preview: InvoiceFormatPreview | undefined = layout
    ? {
        code: layout.code,
        formatNumber: layout.formatNumber || spec?.sortOrder || 0,
        name: layout.name || spec?.name || layout.code,
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
      `HBL-${layout?.formatNumber ?? 0}-${layout?.code ?? code}`,
      'hbl-format',
    ),
    title: preview?.name || spec?.name,
    context,
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
