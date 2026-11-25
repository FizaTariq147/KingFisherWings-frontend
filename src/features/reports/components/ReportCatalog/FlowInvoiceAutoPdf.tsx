import { useEffect, useRef, useState } from 'react';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { isClientFlowInvoiceCode, flowInvoiceOptions } from '../../flow/invoiceFlowOptions';
import { loadInvoiceFlowRecord } from '../../flow/loadInvoiceFlowRecord';
import { renderInvoiceFlowPdf } from '../../flow/renderInvoiceFlowPdf';
import type { ReportContextIds } from '../../utils/reportParameterUtils';
import { catalogContextCacheKey } from '../../utils/resolveCatalogContextPdfData';

type Props = {
  code: string;
  context?: ReportContextIds | null;
  autoOpen?: boolean;
};

/**
 * Auto-opens a client flow PDF (invoice / quotation) without Bind / Activate.
 */
export function FlowInvoiceAutoPdf({ code, context, autoOpen = true }: Props) {
  const canOpen = isClientFlowInvoiceCode(code);
  const options = flowInvoiceOptions(code);
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const [boundLabel, setBoundLabel] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);
  const contextKey = catalogContextCacheKey(context);

  useEffect(() => {
    if (!autoOpen || !canOpen) return;
    const key = `${code}:${contextKey}`;
    if (openedFor.current === key) return;

    let cancelled = false;
    setError(null);
    setBoundLabel(null);

    void viewer
      .loadPreview(
        async () => {
          const record = await loadInvoiceFlowRecord(context ?? {});
          if (!cancelled) {
            const hasEntity = Boolean(
              context?.invoice_id || context?.quotation_id || context?.job_id,
            );
            setBoundLabel(
              hasEntity
                ? `flow · ${options?.catalogName || code}`
                : `flow template · ${options?.catalogName || code}`,
            );
          }
          return renderInvoiceFlowPdf(record, code);
        },
        {
          fileName: formatPdfFilename(`Flow-${code}`, 'report-format'),
          title: options?.catalogName || code,
        },
      )
      .then(() => {
        if (!cancelled) openedFor.current = key;
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          openedFor.current = null;
          setError(err instanceof Error ? err.message : 'Could not open flow PDF.');
        }
      });

    return () => {
      cancelled = true;
      openedFor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per code / context
  }, [autoOpen, canOpen, code, contextKey]);

  if (!canOpen) return null;

  return (
    <>
      {boundLabel ? (
        <p className="text-xs text-[var(--color-success-700)]" role="status">
          {boundLabel}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-danger-700)]" role="alert">
          {error}
        </p>
      ) : null}
      <PdfViewerModal
        open={viewer.open}
        onClose={viewer.close}
        src={viewer.src}
        blob={viewer.blob}
        fileName={viewer.fileName}
        title={viewer.title || options?.catalogName || code}
        loading={viewer.loading}
        error={viewer.error}
        skipBranding
      />
    </>
  );
}
