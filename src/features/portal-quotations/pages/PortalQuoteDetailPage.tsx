import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Download, Calendar, Coins, Package, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { PdfReadyModal } from '@/features/files/components/PdfReadyModal';
import { QuotationStatusBadge } from '@/features/quotations/components/QuotationStatusBadge';
import { PortalQuotationDecisionPanel } from '../components/PortalQuotationDecisionPanel';
import { PortalBookingFormPanel } from '../components/PortalBookingFormPanel';
import {
  PortalCommercialFlowRail,
  usesPortalCommercialFlow,
} from '../components/PortalCommercialFlowRail';
import { PortalQuotationNegotiationPanel } from '../components/PortalQuotationNegotiationPanel';
import { usePortalQuotation } from '../hooks/usePortalQuotations';
import { portalQuotationsService } from '../services/portalQuotations.service';
import {
  canPortalCustomerRespondToQuote,
  portalQuoteShowsBookingForm,
  portalQuoteTotalAmount,
} from '../utils/portalQuotationStatus';
import { usesModeBookingFormConvertFlow } from '@/features/quotations/utils/quotationStatus';

export default function PortalQuoteDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalQuotation(id);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfPending, setPdfPending] = useState(false);
  const [pdfUnavailable, setPdfUnavailable] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [pdfReadyOpen, setPdfReadyOpen] = useState(false);
  const [pdfReadyBlob, setPdfReadyBlob] = useState<Blob | null>(null);
  const [pdfReadyFileName, setPdfReadyFileName] = useState('quotation.pdf');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Client KingFisher layout builds from quote detail — always available.
  const canTryPdf = Boolean(data);

  const openQuotePdf = (quoteId: string, name: string) => {
    setPdfError(null);
    setPdfPending(true);
    setPdfReadyBlob(null);
    setPdfReadyFileName(`${name || 'quotation'}.pdf`);
    setPdfReadyOpen(true);
    void portalQuotationsService
      .getPdfBlob(quoteId, name || 'quotation')
      .then(({ blob, fileName }) => {
        setPdfReadyBlob(blob);
        setPdfReadyFileName(fileName);
      })
      .catch((err) => {
        setPdfReadyOpen(false);
        setPdfUnavailable(true);
        setPdfError(
          err instanceof PortalApiError || err instanceof Error
            ? err.message
            : 'PDF is not ready for this quotation yet.',
        );
      })
      .finally(() => setPdfPending(false));
  };

  if (isLoading) {
    return <PortalLoadingState label="Loading quotation…" />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {error instanceof PortalApiError || error instanceof Error
            ? error.message
            : 'Quotation not found.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <button
          type="button"
          className="block text-sm underline text-[var(--color-primary)]"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  const showDownload = canTryPdf && !pdfUnavailable;
  const total = portalQuoteTotalAmount(data);
  const gatedCommercial = usesPortalCommercialFlow(data.jobType);
  const modeConvert = usesModeBookingFormConvertFlow(data.jobType);
  const canRespond = canPortalCustomerRespondToQuote(data.status, data);
  const showBookingForm = portalQuoteShowsBookingForm(data);
  const isAir = String(data.jobType ?? '')
    .toUpperCase()
    .startsWith('AIR');

  return (
    <div className="space-y-5">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back
      </button>
      <PortalPageHeader
        title={data.number}
        description={
          [data.origin, data.destination].filter(Boolean).join(' → ') ||
          data.jobType ||
          'Quotation detail'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {data.status ? <QuotationStatusBadge status={data.status} /> : null}
            {total != null ? (
              <Badge variant="neutral">
                {data.currencyCode || 'AED'}{' '}
                {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Badge>
            ) : null}
            {showDownload ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pdfPending}
                onClick={() => openQuotePdf(id || data.id, data.number || 'quotation')}
              >
                <Download size={14} aria-hidden="true" />
                {pdfPending ? 'Preparing…' : 'Download PDF'}
              </Button>
            ) : null}
          </div>
        }
      />

      {actionSuccess ? (
        <p className="text-sm text-[var(--color-success-600)]" role="status">
          {actionSuccess}
        </p>
      ) : null}

      {gatedCommercial ? (
        <PortalPanel padded className="space-y-3">
          <PortalCommercialFlowRail quote={data} formSubmitted={formSubmitted} />
          <p className="text-xs text-[var(--color-neutral-500)]">
            Follow the highlighted step: accept the quote, complete the booking form, then your
            forwarder sends the invoice
            {isAir ? ' — air export / import ops unlock after that.' : '.'}
          </p>
        </PortalPanel>
      ) : null}

      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalAnimatedGridItem>
          <PortalStatCard label="Currency" value={data.currencyCode || '—'} Icon={Coins} theme="gold" />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Valid until" value={data.validUntil || '—'} Icon={Calendar} theme="navy" />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Weight" value={data.grossWeight ?? '—'} Icon={Scale} theme="orange" />
        </PortalAnimatedGridItem>
        <PortalAnimatedGridItem>
          <PortalStatCard label="Pieces" value={data.pieces ?? '—'} Icon={Package} theme="green" />
        </PortalAnimatedGridItem>
      </PortalAnimatedGrid>

      {data.commodity || data.specialRequirements ? (
        <PortalPanel padded className="space-y-2 text-sm">
          {data.commodity ? (
            <p>
              <span className="text-[var(--color-neutral-500)]">Commodity: </span>
              {data.commodity}
            </p>
          ) : null}
          {data.specialRequirements ? (
            <p>
              <span className="text-[var(--color-neutral-500)]">Requirements: </span>
              {data.specialRequirements}
            </p>
          ) : null}
        </PortalPanel>
      ) : null}

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Charge lines</h2>
        {!data.lines?.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">
            No charge lines yet. Your forwarder will add pricing before sending the quote.
          </p>
        ) : (
          <PortalAnimatedList className="space-y-2">
            {data.lines.map((line) => (
              <PortalAnimatedListItem
                key={line.id}
                className="flex justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-2 text-sm last:border-0"
              >
                <span>{line.description}</span>
                <span className="font-medium tabular-nums">
                  {line.amount != null
                    ? `${line.currencyCode || data.currencyCode || ''} ${line.amount}`
                    : '—'}
                </span>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>

      {/* Shared commercial flow: negotiate → accept → booking form → wait for invoice */}
      {canRespond ? (
        <PortalQuotationNegotiationPanel
          quote={data}
          onSuccess={(message) => {
            setActionSuccess(message);
            void refetch();
          }}
        />
      ) : null}

      {canRespond || !gatedCommercial ? (
        <PortalQuotationDecisionPanel
          quote={data}
          onSuccess={(message) => {
            setActionSuccess(message);
          }}
        />
      ) : null}

      {showBookingForm ? (
        <PortalBookingFormPanel
          quote={data}
          onSuccess={(message) => {
            setActionSuccess(message);
          }}
          onFormCompleteChange={(complete) => {
            if (complete) setFormSubmitted(true);
          }}
        />
      ) : null}

      {gatedCommercial && formSubmitted ? (
        <PortalPanel padded className="border-sky-200 bg-sky-50/60">
          <h2 className="text-sm font-semibold text-sky-900">
            {modeConvert ? 'Next: Job created' : 'Next: Invoice (INVOICE_SENT)'}
          </h2>
          <p className="mt-1 text-sm text-sky-800">
            {modeConvert
              ? 'Booking form is complete. Your forwarder will convert this quotation to a job.'
              : `Booking form is complete (BOOKING_FORM_COMPLETE). Your forwarder will send the invoice next${
                  isAir ? ', then AIR_EXPORT or AIR_IMPORT operations begin.' : '.'
                }`}
          </p>
        </PortalPanel>
      ) : null}

      {!canRespond && !gatedCommercial ? (
        <PortalQuotationNegotiationPanel
          quote={data}
          onSuccess={(message) => {
            setActionSuccess(message);
            void refetch();
          }}
        />
      ) : null}

      {data.convertedJobNumber ? (
        <PortalPanel padded className="text-sm">
          <p>
            <span className="text-[var(--color-neutral-500)]">Converted to job: </span>
            <strong>{data.convertedJobNumber}</strong>
          </p>
        </PortalPanel>
      ) : null}

      {data.source ? (
        <p className="text-xs text-[var(--color-neutral-500)]">
          Source: {data.source.replaceAll('_', ' ')}
        </p>
      ) : null}

      {(pdfError || !showDownload) && (
        <p
          className={`text-sm ${pdfError ? 'text-[var(--color-neutral-600)]' : 'text-[var(--color-neutral-500)]'}`}
          role={pdfError ? 'status' : undefined}
        >
          {pdfError ||
            'A PDF will appear here once your forwarder generates the customer quotation PDF.'}
        </p>
      )}

      {data.packages?.length ? (
        <PortalPanel padded>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-neutral-900)]">Packages</h2>
          <div className="space-y-2 text-sm">
            {data.packages.map((pkg, index) => (
              <div
                key={pkg.id ?? index}
                className="border-b border-[var(--color-neutral-100)] pb-2 last:border-0"
              >
                {[pkg.lengthCm, pkg.widthCm, pkg.heightCm].every((v) => v != null)
                  ? `${pkg.lengthCm}×${pkg.widthCm}×${pkg.heightCm} cm`
                  : 'Package'}{' '}
                · {pkg.pieces ?? 1} pc · {pkg.grossWeightKg ?? '—'} kg
                {pkg.cbm != null ? ` · ${pkg.cbm} CBM` : ''}
              </div>
            ))}
          </div>
        </PortalPanel>
      ) : null}

      <PdfReadyModal
        open={pdfReadyOpen}
        onClose={() => {
          setPdfReadyOpen(false);
          setPdfReadyBlob(null);
        }}
        blob={pdfReadyBlob}
        title="Quotation PDF ready"
        fileName={pdfReadyFileName}
        skipBranding
        description="Your quotation PDF was created successfully."
      />
    </div>
  );
}
