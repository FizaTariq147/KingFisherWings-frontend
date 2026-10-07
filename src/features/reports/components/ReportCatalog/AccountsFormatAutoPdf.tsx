import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getAccountsFormatSpec } from '../../constants/accountsFormatCatalog';
import { getAccountsFormatUiLayout } from '../../data/accountsFormatUiLayouts';
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

export function AccountsFormatAutoPdf({ code, context, autoOpen = true }: Props) {
  const spec = getAccountsFormatSpec(code);
  const layout = getAccountsFormatUiLayout(code);
  const preview: InvoiceFormatPreview | undefined =
    spec && layout
      ? {
          code: layout.code,
          formatNumber: layout.formatNumber || spec.sortOrder,
          name: layout.name || spec.name,
          samplePdfUrl: null,
          layoutKind: 'generic',
          paper: layout.paper,
          rtl: layout.rtl,
          sections: [],
        }
      : undefined;

  const { viewer, error, boundLabel } = useCatalogFormatLayoutPdf({
    autoOpen,
    preview,
    fileName: formatPdfFilename(
      `Accounts-${spec?.sortOrder ?? 0}-${spec?.code ?? code}`,
      'accounts-format',
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
