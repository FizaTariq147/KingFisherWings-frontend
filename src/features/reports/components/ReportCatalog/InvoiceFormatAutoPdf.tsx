import { useEffect, useRef, useState } from 'react';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { getInvoiceFormatPreview } from '../../data/invoiceFormatPreviews';
import { getInvoiceFormatUiLayout } from '../../data/invoiceFormatUiLayouts';
import { getAccountsFormatUiLayout } from '../../data/accountsFormatUiLayouts';
import { getWmsFormatUiLayout } from '../../data/wmsFormatUiLayouts';
import type { InvoiceFormatPreview } from '../../types/invoiceFormatPreview.types';
import {
  generateInvoiceFormatLayoutPdf,
  invoiceRecordToFormatPdfData,
} from '../../utils/generateInvoiceFormatLayoutPdf';
import { invoiceService } from '@/features/invoices/services/invoice.service';

type Props = {
  code: string;
  invoiceId?: string;
  autoOpen?: boolean;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

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
 * Live invoice fields are merged when invoiceId is present.
 */
export function InvoiceFormatAutoPdf({ code, invoiceId, autoOpen = true }: Props) {
  const preview = getInvoiceFormatPreview(code) ?? previewFromLayout(code);
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!autoOpen || !preview) return;
    if (openedFor.current === `${preview.code}:${invoiceId || ''}`) return;
    openedFor.current = `${preview.code}:${invoiceId || ''}`;

    const fileName = formatPdfFilename(
      `Format-${preview.formatNumber}-${preview.code}`,
      'invoice-format',
    );
    const title = preview.name;

    let cancelled = false;
    setError(null);

    void viewer
      .loadPreview(async () => {
        let data = {};
        if (invoiceId && isUuid(invoiceId)) {
          try {
            const invoice = await invoiceService.getById(invoiceId);
            data = invoiceRecordToFormatPdfData(invoice);
          } catch {
            /* keep layout demo defaults */
          }
          // Optional enrich from GET /invoices/:id/format-payload — additive only.
          try {
            const payload = await invoiceService.getFormatPayload(invoiceId, preview.code);
            if (payload && typeof payload === 'object') {
              data = { ...data, ...payload };
            }
          } catch {
            /* endpoint may be absent; preview still works */
          }
        }
        return generateInvoiceFormatLayoutPdf(preview, data);
      }, { fileName, title })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open PDF.');
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per code / invoice
  }, [preview?.code, invoiceId, autoOpen]);

  if (!preview) return null;

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
        title={viewer.title}
        loading={viewer.loading}
        error={viewer.error}
        skipBranding
      />
    </>
  );
}
