import { useEffect, useRef, useState } from 'react';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { resolveAnyFormatUiLayout } from '../../data/resolveAnyFormatUiLayout';
import { generateInvoiceFormatLayoutPdf } from '../../utils/generateInvoiceFormatLayoutPdf';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';

type Props = {
  code: string;
  /** Optional live invoice merge (invoice formats only). */
  invoiceId?: string;
  autoOpen?: boolean;
};

/**
 * Opens the KingFisher JSON layout PDF for any registered catalog/registry report code.
 */
export function CatalogReportAutoPdf({ code, invoiceId, autoOpen = true }: Props) {
  const layout = resolveAnyFormatUiLayout(code);
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!autoOpen || !layout) return;
    const key = `${layout.code}:${invoiceId || ''}`;
    if (openedFor.current === key) return;
    openedFor.current = key;

    const preview: InvoiceFormatPreview = {
      code: layout.code,
      formatNumber: layout.formatNumber || 0,
      name: layout.name || layout.code,
      samplePdfUrl: null,
      layoutKind: 'generic',
      paper: layout.paper,
      rtl: layout.rtl,
      sections: [],
    };

    const fileName = formatPdfFilename(
      `Report-${layout.formatNumber || 'X'}-${layout.code}`,
      'report-format',
    );
    let cancelled = false;
    setError(null);

    void viewer
      .loadPreview(async () => {
        // Invoice live merge stays on InvoiceFormatAutoPdf; this path is layout demo.
        void invoiceId;
        return generateInvoiceFormatLayoutPdf(preview, {});
      }, {
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
  }, [code, autoOpen, layout?.code, invoiceId]);

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
        title={viewer.title || layout.name}
        loading={viewer.loading}
        error={viewer.error}
        skipBranding
      />
    </>
  );
}
