import { useEffect, useRef, useState } from 'react';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getOpsListFormatSpec } from '../../constants/opsListFormatCatalog';
import { getOpsListFormatUiLayout } from '../../data/opsListFormatUiLayouts';
import { generateInvoiceFormatLayoutPdf } from '../../utils/generateInvoiceFormatLayoutPdf';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';

type Props = {
  code: string;
  autoOpen?: boolean;
};

export function OpsListFormatAutoPdf({ code, autoOpen = true }: Props) {
  const spec = getOpsListFormatSpec(code);
  const layout = getOpsListFormatUiLayout(code);
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!autoOpen || !layout) return;
    if (openedFor.current === layout.code) return;
    openedFor.current = layout.code;

    const preview: InvoiceFormatPreview = {
      code: layout.code,
      formatNumber: layout.formatNumber || spec?.sortOrder || 0,
      name: layout.name || spec?.name || layout.code,
      samplePdfUrl: null,
      layoutKind: 'warehouse',
      paper: layout.paper,
      rtl: layout.rtl,
      sections: [],
    };

    const fileName = formatPdfFilename(`OpsList-${layout.formatNumber}-${layout.code}`, 'ops-list');
    let cancelled = false;
    setError(null);

    void viewer
      .loadPreview(async () => generateInvoiceFormatLayoutPdf(preview, {}), {
        fileName,
        title: preview.name,
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open PDF.');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per code
  }, [code, autoOpen, spec?.code, layout?.code]);

  if (!layout) return null;

  return (
    <>
      {error ? (
        <p role="alert" className="text-sm text-[var(--color-danger-600)]">
          {error}
        </p>
      ) : null}
      <PdfViewerModal
        open={viewer.open}
        onClose={viewer.close}
        src={viewer.src}
        blob={viewer.blob}
        fileName={viewer.fileName}
        title={viewer.title || spec?.name || layout.name}
        loading={viewer.loading}
        error={viewer.error}
        skipBranding
      />
    </>
  );
}
