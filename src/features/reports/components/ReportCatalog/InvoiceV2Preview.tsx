import { useEffect, useState } from 'react';
import { PdfViewerModal } from '@/features/files/components/PdfViewerModal';
import { usePdfViewer } from '@/features/files/hooks/usePdfViewer';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { invoiceToPdfModel } from '@/features/invoices/utils/invoiceToPdfModel';
import { resolveInvoicePdfCompany } from '@/features/invoices/utils/resolveInvoicePdfCompany';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { fetchOrganizationLogoBytes } from '@/features/organization/utils/embedOrganizationPdfLogo';
import { jobService } from '@/features/jobs/services/job.service';
import { organizationService } from '@/features/organization/services/organization.service';
import { partyService } from '@/features/parties/services/party.service';
import { isUuid } from '@/lib/isUuid';
import {
  INVOICE_V2_FALLBACK_NOTICE,
  renderInvoiceV2InBrowser,
} from '../../engine/invoiceV2Gate';
import { invoiceV2BadgeText } from '../../engine/invoiceV2Codes';
import { isInvoiceFlowCode } from '../../flow/invoiceFlowCode';
import { renderInvoiceFlowPdf } from '../../flow/renderInvoiceFlowPdf';
import { reportConformanceStatus } from '../../utils/reportConformanceStatus';

type Props = {
  code: string;
  invoiceId?: string;
};

/**
 * Opens the spec PDF for the invoice that was open when Formats or Reports was clicked.
 */
export function InvoiceV2Preview({ code, invoiceId }: Props) {
  const viewer = usePdfViewer();
  const [notice, setNotice] = useState<string | null>(null);
  const badge = invoiceV2BadgeText(reportConformanceStatus(code));

  useEffect(() => {
    let cancelled = false;
    setNotice(null);
    if (!invoiceId || !isUuid(invoiceId)) {
      setNotice('Open an invoice, then choose a format. There is no record to draw.');
      return;
    }
    (async () => {
      let invoice: Awaited<ReturnType<typeof invoiceService.getById>> | null = null;
      let job: Awaited<ReturnType<typeof jobService.getById>> | null = null;
      let party: Awaited<ReturnType<typeof partyService.getById>> | null = null;
      let organization: OrganizationProfile | null = null;
      try {
        invoice = await invoiceService.getById(invoiceId);
        const loaded = await Promise.all([
          invoice.job_id && isUuid(invoice.job_id) ? jobService.getById(invoice.job_id).catch(() => null) : null,
          invoice.party_id && isUuid(invoice.party_id) ? partyService.getById(invoice.party_id).catch(() => null) : null,
          organizationService.getProfile().catch(() => null),
        ]);
        job = loaded[0];
        party = loaded[1];
        organization = loaded[2] as OrganizationProfile | null;
        const profile = organization as { logo_url?: string; logoUrl?: string } | null;
        const logoBytes = await fetchOrganizationLogoBytes(profile?.logo_url || profile?.logoUrl || null);
        let logoBase64: string | undefined;
        if (logoBytes) {
          const view = new Uint8Array(logoBytes);
          let binary = '';
          for (let index = 0; index < view.length; index += 0x8000) {
            binary += String.fromCharCode(...view.subarray(index, index + 0x8000));
          }
          logoBase64 = btoa(binary);
        }
        const blob = isInvoiceFlowCode(code)
          ? await renderInvoiceFlowPdf({
              invoice: invoice as unknown as Record<string, unknown>,
              job: job as unknown as Record<string, unknown> | null,
              party: party as unknown as Record<string, unknown> | null,
              organization: organization as unknown as Record<string, unknown> | null,
              logoBase64,
            })
          : await renderInvoiceV2InBrowser({ code, invoice, job, party, organization, logoBase64 });
        if (cancelled) return;
        viewer.showBlob(blob, { fileName: `${code}.pdf`, title: code });
      } catch {
        if (cancelled || !invoice) {
          if (!cancelled) setNotice(INVOICE_V2_FALLBACK_NOTICE);
          return;
        }
        try {
          const company = resolveInvoicePdfCompany({ profile: organization });
          const classic = await generateInvoicePdf(invoiceToPdfModel(invoice, { party, job, company }));
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
    // viewer.showBlob is stable enough for one open per code and invoice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, invoiceId]);

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
