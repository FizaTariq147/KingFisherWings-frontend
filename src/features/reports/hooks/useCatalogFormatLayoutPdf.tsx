import { useEffect, useRef, useState } from 'react';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import type { InvoiceFormatPreview } from '../types/invoiceFormatPreview.types';
import { generateInvoiceFormatLayoutPdf } from '../utils/generateInvoiceFormatLayoutPdf';
import {
  catalogContextCacheKey,
  resolveCatalogContextPdfData,
} from '../utils/resolveCatalogContextPdfData';
import type { ReportContextIds } from '../utils/reportParameterUtils';

type UseCatalogFormatLayoutPdfArgs = {
  autoOpen?: boolean;
  preview: InvoiceFormatPreview | null | undefined;
  fileName: string;
  title?: string;
  context?: ReportContextIds | null;
  /** When set, invoice format-payload enrich is attempted. */
  formatCode?: string;
};

/**
 * Shared auto-open layout PDF preview with optional live entity hydration
 * from report catalogue deep-link context (invoice / quotation / job / party).
 */
export function useCatalogFormatLayoutPdf({
  autoOpen = true,
  preview,
  fileName,
  title,
  context,
  formatCode,
}: UseCatalogFormatLayoutPdfArgs) {
  const viewer = usePdfViewer();
  const [error, setError] = useState<string | null>(null);
  const [boundLabel, setBoundLabel] = useState<string | null>(null);
  const openedFor = useRef<string | null>(null);
  const contextKey = catalogContextCacheKey(context);
  const previewCode = preview?.code;

  useEffect(() => {
    if (!autoOpen || !preview || !previewCode) return;
    const key = `${previewCode}:${contextKey}`;
    // Allow Strict Mode remount / retry: only skip if this exact key already succeeded.
    if (openedFor.current === key) return;

    let cancelled = false;
    setError(null);
    setBoundLabel(null);

    void viewer
      .loadPreview(
        async () => {
          const data = await resolveCatalogContextPdfData(context, {
            formatCode: formatCode || previewCode,
          });
          if (!cancelled) {
            const label =
              data.invoiceNumber ||
              data.billToName ||
              (contextKey ? 'live record' : null);
            setBoundLabel(label ? `Bound to ${label}` : null);
          }
          return generateInvoiceFormatLayoutPdf(preview, data);
        },
        { fileName, title: title || preview.name },
      )
      .then(() => {
        if (!cancelled) openedFor.current = key;
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          openedFor.current = null;
          setError(err instanceof Error ? err.message : 'Could not open PDF.');
        }
      });

    return () => {
      cancelled = true;
      // Always clear so Strict Mode remount / dependency changes can reload.
      openedFor.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per code / context
  }, [autoOpen, previewCode, contextKey, fileName, formatCode]);

  return { viewer, error, preview, boundLabel };
}

export function CatalogFormatPdfViewerShell({
  viewer,
  error,
  title,
  boundLabel,
}: {
  viewer: ReturnType<typeof usePdfViewer>;
  error: string | null;
  title?: string;
  boundLabel?: string | null;
}) {
  return (
    <>
      {boundLabel ? (
        <p className="text-xs text-[var(--color-success-700)]" role="status">
          Catalogue PDF {boundLabel}
        </p>
      ) : null}
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
        title={viewer.title || title}
        loading={viewer.loading}
        error={viewer.error}
        skipBranding
      />
    </>
  );
}
