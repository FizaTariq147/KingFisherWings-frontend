import { useEffect, useState } from 'react';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { invoiceToPdfModel } from '@/features/invoices/utils/invoiceToPdfModel';
import { resolveInvoicePdfCompany } from '@/features/invoices/utils/resolveInvoicePdfCompany';
import {
  INVOICE_V2_FALLBACK_NOTICE,
} from '../../engine/invoiceV2Gate';
import { reportsV2BadgeText, REPORTS_V2_FALLBACK_NOTICE } from '../../engine/reportsV2Gate';
import { reportConformanceStatus } from '../../utils/reportConformanceStatus';
import {
  hasReportsV2Record,
  loadReportsV2Source,
  renderReportsV2,
  type ReportsV2Source,
} from '../../utils/reportsV2Source';

type Props = {
  code: string;
  invoiceId?: string;
  jobId?: string;
  partyId?: string;
};

/**
 * Opens the spec PDF for the record that was open when Formats or Reports was clicked.
 * An invoice falls back to the classic invoice. Other documents show a notice only.
 */
export function InvoiceV2Preview({ code, invoiceId, jobId, partyId }: Props) {
  const viewer = usePdfViewer();
  const [notice, setNotice] = useState<string | null>(null);
  const badge = reportsV2BadgeText(reportConformanceStatus(code));

  useEffect(() => {
    let cancelled = false;
    setNotice(null);
    const ids = { invoiceId, jobId, partyId };
    if (!hasReportsV2Record(ids)) {
      setNotice('Open a record, then choose a format. There is no record to draw.');
      return;
    }
    (async () => {
      let source: ReportsV2Source | null = null;
      try {
        source = await loadReportsV2Source(ids);
        const blob = await renderReportsV2(code, source);
        if (cancelled) return;
        viewer.showBlob(blob, { fileName: `${code}.pdf`, title: code });
      } catch {
        if (cancelled) return;
        if (!source?.invoice) {
          setNotice(source ? REPORTS_V2_FALLBACK_NOTICE : INVOICE_V2_FALLBACK_NOTICE);
          return;
        }
        try {
          const company = resolveInvoicePdfCompany({ profile: source.organization });
          const classic = await generateInvoicePdf(
            invoiceToPdfModel(source.invoice, { party: source.party, job: source.job, company }),
          );
          if (cancelled) return;
          setNotice(INVOICE_V2_FALLBACK_NOTICE);
          viewer.showBlob(classic, { fileName: 'invoice.pdf', title: 'Classic invoice' });
        } catch {
          if (!cancelled) setNotice(INVOICE_V2_FALLBACK_NOTICE);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // viewer.showBlob is stable enough for one open per code and record.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, invoiceId, jobId, partyId]);

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">{badge}</p>
      {notice ? (
        <p role="status" className="text-sm text-[var(--color-warning-700)]">
          {notice}
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
    </div>
  );
}
