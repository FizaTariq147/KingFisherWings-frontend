import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { QuotationConfirmModal } from '../components/QuotationConfirmModal';
import { QuotationEmailModal } from '../components/QuotationEmailModal';
import { QuotationLinesEditor } from '../components/QuotationLinesEditor';
import { QuotationNegotiationPanel } from '../components/QuotationNegotiationPanel';
import { QuotationOverviewPanel } from '../components/QuotationOverviewPanel';
import { QuotationPdfModal } from '../components/QuotationPdfModal';
import { QuotationStatusBadge } from '../components/QuotationStatusBadge';
import { QuotationTotalsSummary } from '../components/QuotationTotalsSummary';
import { STATUS_LABELS, type LostReason } from '../constants/quotation.constants';
import { QuotationVendorPassPanel } from '../components/QuotationVendorPassPanel';
import {
  useQuotationActions,
  useQuotationPdf,
} from '../hooks/useQuotationActions';
import { useQuotationConfirmState } from '../hooks/useQuotationConfirmState';
import { useQuotationNegotiation } from '../hooks/useQuotationNegotiation';
import { useDeleteQuotation, useQuotation, useQuotationRevisions } from '../hooks/useQuotations';
import { useQuotationResolvedLabels } from '../hooks/useQuotationResolvedLabels';
import { getErrorMessage } from '../utils/getErrorMessage';
import { isAirQuoteJobType } from '@/features/jobs/constants/airWorkflow';
import { NvoccSeaExportFlowRail } from '@/features/nvocc/components/NvoccSeaExportFlowRail';
import {
  isNvoccQuoteJobType,
  quotationStatusToSeaExportStage,
  type SeaExportStageId,
} from '@/features/nvocc/constants/seaExportWorkflow';
import { nvoccBookingService } from '@/features/nvocc/services/nvocc.service';
import { useNvoccBookingForm } from '@/features/nvocc/hooks/useNvocc';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { readPortalBookingFormDraft } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import {
  isAwaitingCustomerDecision,
  resolveCustomerFacingQuoteStatus,
} from '../utils/customerQuoteDecision';
import { quotationDisplayNumber } from '../utils/normalizeQuotation';
import { recalculateQuotationTotals } from '../utils/recalculateQuotationTotals';
import {
  canArchiveQuotation,
  canConvertQuotationToJob,
  canStartAirOpsJobFromQuote,
  canStaffInternallyApprove,
  canStaffMarkCustomerDecision,
  canStaffSendToCustomer,
  coerceQuotationStatus,
  isQuotationDraftEditable,
  isQuotationLinesEditable,
  usesGatedFreightQuoteFlow,
  usesModeBookingFormConvertFlow,
} from '../utils/quotationStatus';

function statusTone(
  status: string,
): 'emerald' | 'amber' | 'rose' | 'slate' {
  const s = coerceQuotationStatus(status);
  if (s === 'APPROVED' || s === 'CONVERTED') return 'emerald';
  if (s === 'INTERNALLY_APPROVED') return 'emerald';
  if (s === 'DISAPPROVED' || s === 'REJECTED') return 'rose';
  if (s === 'EXPIRED' || s === 'SENT' || s === 'SUBMITTED' || s === 'CUSTOMER_REVIEW' || s === 'NEGOTIATING') {
    return 'amber';
  }
  return 'slate';
}

export default function QuotationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: quotation, isLoading, isError, error, refetch } = useQuotation(id);
  const { data: revisions = [] } = useQuotationRevisions(id, Boolean(id));
  const actions = useQuotationActions(id);
  const remove = useDeleteQuotation();
  const { data: pdfInfo, refetch: refetchPdf } = useQuotationPdf(id, Boolean(id));
  const { confirm, requestConfirm, closeConfirm } = useQuotationConfirmState();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const autoFulfillAttempted = useRef<string | null>(null);

  // Surface partial costing failures from create wizard (apply-tariff / lines).
  useEffect(() => {
    const state = location.state as { costingWarnings?: string[] } | null;
    const warnings = state?.costingWarnings;
    if (!warnings?.length) return;
    setActionError(`Quotation created, but some costing steps failed: ${warnings.join(' · ')}`);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const negotiationEnabled =
    Boolean(id) &&
    Boolean(quotation) &&
    (isAwaitingCustomerDecision(quotation.api_status ?? quotation.status) ||
      [
        'APPROVED',
        'REJECTED',
        'DISAPPROVED',
        'WON',
        'LOST',
        'CUSTOMER_REVIEW',
        'SENT',
        'NEGOTIATING',
      ].includes(coerceQuotationStatus(quotation.api_status ?? quotation.status)));
  const { data: negotiationTimeline } = useQuotationNegotiation(id, negotiationEnabled);

  const lines = quotation?.lines ?? [];
  const totals = useMemo(
    () =>
      recalculateQuotationTotals(lines, {
        discount_percent: quotation?.discount_percent,
        discount_amount: quotation?.discount_amount,
      }),
    [lines, quotation?.discount_percent, quotation?.discount_amount],
  );

  const isNvoccQuote = Boolean(quotation && isNvoccQuoteJobType(quotation.job_type));
  const isModeBookingConvert = Boolean(
    quotation && usesModeBookingFormConvertFlow(quotation.job_type),
  );
  const portalBookingQuery = useCustomerPortalBookingForm(
    {
      quotationId: id,
      quoteNumber: quotation?.quotation_number || quotation?.quote_no,
      jobTypePrefix: isNvoccQuote
        ? 'NVOCC'
        : isModeBookingConvert
          ? String(quotation?.job_type ?? '').toUpperCase().split('_')[0]
          : undefined,
    },
    (isNvoccQuote || isModeBookingConvert) && Boolean(id),
  );
  const linkedBookingQuery = useQuery({
    queryKey: [
      'nvocc',
      'booking-for-quotation',
      id,
      quotation?.booking_id || '',
      quotation?.quotation_number || quotation?.quote_no || '',
    ],
    queryFn: () =>
      nvoccBookingService.findLinkedToQuotation({
        bookingId: quotation?.booking_id,
        quotationId: id,
        quoteNumber: quotation?.quotation_number || quotation?.quote_no,
        customerId: quotation?.customer_id,
      }),
    enabled: isNvoccQuote && Boolean(id) && Boolean(quotation),
    staleTime: 15_000,
    retry: 1,
  });
  const linkedBooking = linkedBookingQuery.data;
  const linkedBookingFormQuery = useNvoccBookingForm(
    linkedBooking?.id || '',
    Boolean(linkedBooking?.id),
  );

  const status = useMemo(() => {
    if (!quotation) return 'DRAFT' as const;
    const resolved =
      resolveCustomerFacingQuoteStatus(
        quotation.id,
        quotation.api_status ?? quotation.status,
        quotation as unknown as Record<string, unknown>,
        {
          useMemory: true,
          negotiationEvents: negotiationTimeline?.events,
        },
      ) ?? coerceQuotationStatus(quotation.status);

    const linkedJobId = quotation.job_id || linkedBooking?.job_id;
    // Booking-form modes keep APPROVED until /booking-form/complete marks CONVERTED.
    if (
      linkedJobId &&
      (resolved === 'APPROVED' || resolved === 'WON') &&
      !usesModeBookingFormConvertFlow(quotation.job_type)
    ) {
      return 'CONVERTED' as const;
    }
    return resolved;
  }, [quotation, negotiationTimeline?.events, linkedBooking?.job_id]);

  // Persist APPROVED → CONVERTED once the booking (or quote) has a job.
  // Skip for mode booking-form flows — convert happens after form /complete.
  useEffect(() => {
    const jobId = quotation?.job_id || linkedBooking?.job_id;
    if (!id || !quotation || !jobId) return;
    if (usesModeBookingFormConvertFlow(quotation.job_type)) return;
    const apiStatus = coerceQuotationStatus(quotation.api_status ?? quotation.status);
    if (apiStatus === 'CONVERTED' && quotation.job_id === jobId) return;
    if (apiStatus !== 'APPROVED' && apiStatus !== 'WON' && apiStatus !== 'CONVERTED') return;
    let cancelled = false;
    void (async () => {
      try {
        const { quotationService } = await import('../services/quotation.service');
        await quotationService.markConvertedWithJob(id, jobId);
        if (!cancelled) void refetch();
      } catch {
        /* non-fatal */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    id,
    quotation?.id,
    quotation?.job_id,
    quotation?.job_type,
    quotation?.api_status,
    quotation?.status,
    linkedBooking?.job_id,
    refetch,
  ]);

  const seaExportStage = useMemo((): SeaExportStageId => {
    return quotationStatusToSeaExportStage(status, {
      hasJob: Boolean(quotation?.job_id || linkedBooking?.job_id),
      hasInvoice: Boolean(quotation?.invoice_id),
      bookingStatus: linkedBooking?.booking_status,
      formComplete:
        linkedBookingFormQuery.data?.mark_complete === true ||
        portalBookingQuery.data?.mark_complete === true,
    });
  }, [
    status,
    quotation?.job_id,
    quotation?.invoice_id,
    linkedBooking?.job_id,
    linkedBooking?.booking_status,
    linkedBookingFormQuery.data?.mark_complete,
    portalBookingQuery.data?.mark_complete,
  ]);

  const bookingHref = linkedBooking?.id
    ? `/nvocc/bookings/${linkedBooking.id}`
    : '/nvocc/booking-list';

  const seaExportHelp = useMemo(() => {
    if (linkedBooking?.booking_status) {
      const gate = linkedBooking.booking_status;
      const life = linkedBooking.lifecycle_status;
      if (seaExportStage === 'cro-container') {
        return {
          text: `Live booking gate: ${gate}${life ? ` · lifecycle ${life}` : ''}. Convert to job / Issue CRO on the booking Ops tab.`,
          href: bookingHref,
          linkLabel: 'Open NVOCC booking',
        };
      }
      if (seaExportStage === 'invoice') {
        return {
          text: `Live booking gate: ${gate}${life ? ` · lifecycle ${life}` : ''}. Invoice next — retry send invoice on the booking if needed.`,
          href: bookingHref,
          linkLabel: 'Open NVOCC booking',
        };
      }
      return {
        text: `Live booking gate: ${gate}${life ? ` · lifecycle ${life}` : ''}. Mark complete → invoice → convert on the booking.`,
        href: bookingHref,
        linkLabel: 'Open NVOCC booking',
      };
    }
    if (seaExportStage === 'cro-container' || seaExportStage === 'invoice') {
      return {
        text: 'Quote is past booking-form on the workflow rail. Open NVOCC Bookings to finish convert / CRO (link the booking if the rail still lags).',
        href: '/nvocc/booking-list',
        linkLabel: 'NVOCC Bookings',
      };
    }
    if (status === 'CONVERTED' || seaExportStage === 'cro-container') {
      return {
        text: 'Quotation converted to job — continue CRO / allocate on the NVOCC booking or job Ops tab.',
        href: bookingHref,
        linkLabel: linkedBooking?.id ? 'Open NVOCC booking' : 'NVOCC Bookings',
      };
    }
    if (status === 'APPROVED' || status === 'WON') {
      return {
        text: 'Customer approved — continue Stage 1–2 on the linked NVOCC booking (booking form → invoice → convert). This quote does not auto-create a job.',
        href: bookingHref,
        linkLabel: linkedBooking?.id ? 'Open NVOCC booking' : 'NVOCC Bookings',
      };
    }
    return {
      text: 'After customer approve, continue Stage 1–2 on NVOCC Bookings: booking form → send invoice → CRO / container.',
      href: '/nvocc/booking-list',
      linkLabel: 'NVOCC Bookings',
    };
  }, [linkedBooking, seaExportStage, status, bookingHref]);

  // Customer Approved → auto job+invoice for **standard** modes only.
  // NVOCC / Air: never auto-convert and never auto-create a job shell.
  // Booking-form modes: convert only after customer portal booking form is complete.
  useEffect(() => {
    if (!quotation || !id) return;
    if (status !== 'APPROVED') return;
    if (
      usesGatedFreightQuoteFlow(quotation.job_type) ||
      isAirQuoteJobType(quotation.job_type) ||
      isNvoccQuoteJobType(quotation.job_type)
    ) {
      return;
    }
    if (actions.fulfillApproved.isPending || pending) return;

    if (usesModeBookingFormConvertFlow(quotation.job_type)) {
      if (quotation.job_id) return;
      const formDone =
        portalBookingQuery.data?.mark_complete === true ||
        readPortalBookingFormDraft(id)?.mark_complete === true;
      if (!formDone) {
        setActionMessage(
          'Approved — waiting for the customer to complete the portal booking form before converting to a job.',
        );
        return;
      }
      if (autoFulfillAttempted.current === id) return;
      autoFulfillAttempted.current = id;
      setActionError(null);
      void actions.fulfillApproved
        .mutateAsync()
        .then((result) => {
          const jobId =
            result && typeof result === 'object' && 'job_id' in result
              ? String((result as { job_id?: string }).job_id ?? '')
              : '';
          const invoiceId =
            result && typeof result === 'object' && 'invoice_id' in result
              ? String((result as { invoice_id?: string }).invoice_id ?? '')
              : '';
          if (jobId || invoiceId) {
            setActionMessage(
              invoiceId
                ? 'Customer booking form received — job and draft invoice created.'
                : 'Customer booking form received — quotation converted to job.',
            );
            if (jobId) {
              navigate(
                jobDetailPath({
                  id: String(jobId),
                  job_type: quotation.job_type,
                }),
              );
            }
          } else {
            autoFulfillAttempted.current = null;
            setActionMessage(
              'Customer booking form is on file — convert will retry when you refresh.',
            );
          }
          void refetch();
        })
        .catch((err) => {
          autoFulfillAttempted.current = null;
          setActionError(
            getErrorMessage(err) ||
              'Could not convert after customer booking form. Refresh once the form is submitted.',
          );
        });
      return;
    }

    if (quotation.job_id && quotation.invoice_id) return;
    if (autoFulfillAttempted.current === id) return;

    autoFulfillAttempted.current = id;
    setActionError(null);
    void actions.fulfillApproved
      .mutateAsync()
      .then((result) => {
        const jobId =
          result && typeof result === 'object' && 'job_id' in result
            ? String((result as { job_id?: string }).job_id ?? '')
            : '';
        const invoiceId =
          result && typeof result === 'object' && 'invoice_id' in result
            ? String((result as { invoice_id?: string }).invoice_id ?? '')
            : '';
        if (jobId || invoiceId) {
          setActionMessage(
            invoiceId
              ? 'Quote approved — job and draft customer invoice created automatically.'
              : 'Quote approved — job created. Draft invoice may still be pending.',
          );
        }
        void refetch();
      })
      .catch((err) => {
        autoFulfillAttempted.current = null;
        setActionError(
          getErrorMessage(err) ||
            'Could not auto-create job/invoice from approved quote. Use Convert to job.',
        );
      });
  }, [
    actions.fulfillApproved,
    id,
    navigate,
    pending,
    portalBookingQuery.data?.mark_complete,
    quotation,
    refetch,
    status,
  ]);

  // Same-tab: customer submitted portal booking form → retry convert.
  useEffect(() => {
    if (!id || !usesModeBookingFormConvertFlow(quotation?.job_type)) return;
    const onFormComplete = (ev: Event) => {
      const detail = (ev as CustomEvent<{ quotationId?: string }>).detail;
      if (detail?.quotationId && detail.quotationId !== id) return;
      autoFulfillAttempted.current = null;
      void refetch();
      void portalBookingQuery.refetch();
    };
    window.addEventListener('kfw-customer-booking-form-complete', onFormComplete);
    return () => window.removeEventListener('kfw-customer-booking-form-complete', onFormComplete);
  }, [id, portalBookingQuery, quotation?.job_type, refetch]);

  const { customerLabel } = useQuotationResolvedLabels(quotation ?? {
    id: '',
    customer_id: '',
    status: 'DRAFT',
    job_type: 'SEA_EXPORT',
    currency_code: 'USD',
  });

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  if (isError || !quotation) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Quotation not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  /** Full quotation form edit / submit — drafts only */
  const editable = isQuotationDraftEditable(status);
  /** Charge lines can be updated while preparing / negotiating the offer */
  const linesEditable = isQuotationLinesEditable(status);
  const title = quotationDisplayNumber(quotation);

  const run = async (fn: () => Promise<unknown>, successMsg?: string) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      const result = await fn();
      closeConfirm();
      if (result && typeof result === 'object' && 'id' in result) {
        const q = result as { id: string; status?: string; job_id?: string; invoice_id?: string };
        if (q.id !== id && coerceQuotationStatus(q.status || 'DRAFT') === 'DRAFT') {
          navigate(`/quotations/${q.id}`);
          return;
        }
        // convert-to-job may return { job, invoice } or quotation with job_id
        const jobId =
          q.job_id ||
          (result as { job?: { id?: string } }).job?.id;
        const invoiceId =
          q.invoice_id ||
          (result as { invoice?: { id?: string } }).invoice?.id;
        // NVOCC/Air: never treat approve as convert (even if backend already linked a job).
        if (jobId && usesGatedFreightQuoteFlow(quotation.job_type)) {
          setActionMessage(successMsg || 'Approved only — continue the gated ops flow.');
          void refetch();
          return;
        }
        // Booking-form modes: stay APPROVED until customer portal form → convert.
        if (jobId && usesModeBookingFormConvertFlow(quotation.job_type)) {
          setActionMessage(
            successMsg ||
              'Approved — waiting for the customer portal booking form, then the quotation converts to a job.',
          );
          void refetch();
          return;
        }
        if (jobId) {
          setActionMessage(
            invoiceId
              ? 'Converted to job and draft customer invoice created.'
              : successMsg || 'Converted to job.',
          );
          navigate(
            jobDetailPath({
              id: String(jobId),
              job_type: quotation.job_type,
            }),
          );
          return;
        }
      }
      setActionMessage(successMsg || 'Action completed.');
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    ...(editable
      ? [{ label: 'Edit', onClick: () => navigate(`/quotations/${id}/edit`), variant: 'secondary' as const }]
      : []),
    { label: 'Duplicate', onClick: () => requestConfirm('duplicate', quotation), variant: 'secondary' as const },
    ...(editable
      ? [{ label: 'Submit', onClick: () => requestConfirm('submit', quotation), variant: 'primary' as const }]
      : []),
    ...(canStaffInternallyApprove(status)
      ? [
          {
            label: 'Internally approve',
            onClick: () => requestConfirm('approve', quotation),
            variant: 'primary' as const,
          },
          { label: 'Reject', onClick: () => requestConfirm('reject', quotation), variant: 'danger' as const },
        ]
      : []),
    ...(canStaffSendToCustomer(status)
      ? [{ label: 'Send', onClick: () => requestConfirm('send', quotation), variant: 'primary' as const }]
      : []),
    ...(canStaffMarkCustomerDecision(status)
      ? [
          {
            label: 'Mark approved',
            onClick: () => requestConfirm('mark-won', quotation),
            variant: 'primary' as const,
          },
          {
            label: 'Mark rejected',
            onClick: () => requestConfirm('mark-lost', quotation),
            variant: 'danger' as const,
          },
        ]
      : []),
    ...(canConvertQuotationToJob(status, quotation.job_type)
      ? [
          {
            label: 'Convert to job',
            onClick: () => requestConfirm('convert', quotation),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(canStartAirOpsJobFromQuote(status, quotation.job_type, quotation.job_id)
      ? [
          {
            label: 'Start air ops job',
            onClick: () => requestConfirm('start-air-ops', quotation),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(usesModeBookingFormConvertFlow(quotation.job_type) &&
    status === 'CONVERTED' &&
    quotation.job_id
      ? [
          {
            label: 'Open job',
            onClick: () =>
              navigate(
                jobDetailPath({
                  id: quotation.job_id!,
                  job_type: quotation.job_type,
                }),
              ),
            variant: 'primary' as const,
          },
        ]
      : []),
    ...(isNvoccQuoteJobType(quotation.job_type) && status === 'APPROVED'
      ? [
          {
            label: 'Continue on NVOCC bookings',
            onClick: () => navigate('/nvocc/booking-list'),
            variant: 'primary' as const,
          },
        ]
      : []),
    { label: 'PDF', onClick: () => setPdfOpen(true), variant: 'secondary' as const },
    {
      label: 'Reports',
      onClick: () => navigate(`/reports/catalog?context=quotation&quotation_id=${encodeURIComponent(id)}`),
      variant: 'secondary' as const,
    },
    { label: 'Email', onClick: () => setEmailOpen(true), variant: 'secondary' as const },
    ...(canArchiveQuotation(status)
      ? [{ label: 'Archive', onClick: () => requestConfirm('archive', quotation), variant: 'danger' as const }]
      : []),
    ...(status === 'DRAFT'
      ? [{ label: 'Delete', onClick: () => requestConfirm('delete', quotation), variant: 'danger' as const }]
      : []),
    ...(canStaffSendToCustomer(status) || status === 'SENT'
      ? [{ label: 'Expire', onClick: () => requestConfirm('expire', quotation), variant: 'danger' as const }]
      : []),
  ];

  return (
    <>
            {(actionError || actionMessage) && (
        <div className="mb-3 space-y-2">
          {actionError && (
            <div
              role="alert"
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'var(--color-danger-100)',
                borderColor: '#FECACA',
                color: 'var(--color-danger-700)',
              }}
            >
              {actionError}
            </div>
          )}
          {actionMessage && (
            <div
              role="status"
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                background: 'var(--color-success-100)',
                borderColor: '#BBF7D0',
                color: 'var(--color-success-700)',
              }}
            >
              {actionMessage}
            </div>
          )}
        </div>
      )}

      {id ? <QuotationVendorPassPanel quotationId={id} /> : null}

      {quotation && quotation.job_type === 'CUSTOMS_CLEARANCE' ? (
        <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50/80 p-4 text-sm text-teal-900">
          <p className="font-medium">Customs Clearance quote</p>
          <p className="mt-1 text-teal-800/90">
            Customer accepts → Convert to job → open the job under Customs Clearance Ops (docs →
            classify → file → duty → clear → invoice → close).{' '}
            <Link className="underline" to="/customs-clearance">
              CC hub
            </Link>
            {quotation.job_id ? (
              <>
                {' · '}
                <Link
                  className="underline"
                  to={`/jobs/customs-clearance/${quotation.job_id}`}
                >
                  Open linked job
                </Link>
              </>
            ) : null}
          </p>
        </div>
      ) : null}

            {quotation && isNvoccQuoteJobType(quotation.job_type) ? (
        <div className="mb-3 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <NvoccSeaExportFlowRail
            current={seaExportStage}
            done={(() => {
              const order: SeaExportStageId[] = [
                'customer-request',
                'cs-receive',
                'quote-sent',
                'customer-accept',
                'booking-form',
                'invoice',
                'cro-container',
              ];
              const idx = order.indexOf(seaExportStage);
              const map: Partial<Record<SeaExportStageId, boolean>> = {};
              order.forEach((stageId, i) => {
                if (i < idx) map[stageId] = true;
              });
              return map;
            })()}
            band="1-2"
          />
          <p className="text-sm text-gray-600">
            {seaExportHelp.text}{' '}
            <Link className="underline text-[var(--color-primary-600)]" to={seaExportHelp.href}>
              {seaExportHelp.linkLabel}
            </Link>
            {linkedBookingQuery.isFetching ? (
              <span className="ml-2 text-xs text-gray-400">Syncing booking…</span>
            ) : null}
          </p>
          {quotation.job_id || linkedBooking?.job_id ? (
            <button
              type="button"
              className="text-sm underline text-[var(--color-primary-600)]"
              onClick={() =>
                navigate(
                  jobDetailPath({
                    id: (quotation.job_id || linkedBooking?.job_id)!,
                    job_type: quotation.job_type,
                  }),
                )
              }
            >
              Open linked job (Stage 3–4)
            </button>
          ) : null}
        </div>
      ) : null}

      {quotation && isAirQuoteJobType(quotation.job_type) ? (
        <div
          role="note"
          className="mb-3 rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-primary-50, #EFF6FF)',
            borderColor: 'var(--color-primary-200, #BFDBFE)',
            color: 'var(--color-neutral-700)',
          }}
        >
          Air freight: after approve there is <strong>no auto job / no invoice</strong>. Customer
          completes the <strong>booking form in the portal</strong> (BOOKING_FORM_COMPLETE), then
          staff sends invoice. Use <strong>Start air ops job</strong> when Ops APIs need a job
          shell. Gate order: CS triage → quote sent → customer accept → booking form → invoice →
          export/import ops.
          {quotation.job_id ? (
            <>
              {' '}
              <button
                type="button"
                className="underline text-[var(--color-primary-600)]"
                onClick={() =>
                  navigate(
                    jobDetailPath({
                      id: quotation.job_id!,
                      job_type: quotation.job_type,
                    }),
                  )
                }
              >
                Open linked job
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <DetailPageTemplate
        title={title}
        subtitle={customerLabel}
        statusLabel={STATUS_LABELS[status] ?? status}
        statusTone={statusTone(status)}
        onBack={() => navigate('/quotations/all')}
        backLabel="All quotations"
        actions={headerActions}
        actionsDisabled={pending}
        sidebar={
          <div className="space-y-4">
            <QuotationStatusBadge status={status} />
            <QuotationTotalsSummary
              currencyCode={quotation.currency_code}
              totals={totals}
              serverTotal={quotation.total_amount}
              hasChargeLines={lines.length > 0}
            />
            {revisions.length > 1 && (
              <div className="text-xs text-[var(--color-neutral-500)] space-y-1">
                <p className="font-medium text-[var(--color-neutral-700)]">Revisions</p>
                {revisions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`block underline ${r.id === id ? 'font-semibold' : ''}`}
                    onClick={() => navigate(`/quotations/${r.id}`)}
                  >
                    {quotationDisplayNumber(r)} · {r.status}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            content: <QuotationOverviewPanel quotation={quotation} />,
          },
          {
            key: 'charges',
            label: 'Charges',
            content: (
              <QuotationLinesEditor
                quotationId={id}
                lines={lines}
                currencyCode={quotation.currency_code}
                editable={linesEditable}
              />
            ),
          },
          {
            key: 'negotiation',
            label: 'Negotiation',
            content: (
              <QuotationNegotiationPanel
                quotationId={id}
                status={status}
                currencyCode={quotation.currency_code}
                lines={lines}
                pricingFromQuote={quotation.negotiation_pricing}
                revenueTotal={quotation.revenue_total ?? quotation.total_amount}
                onUpdated={() => void refetch()}
              />
            ),
          },
          {
            key: 'history',
            label: 'History',
            content: (
              <div className="space-y-2 text-sm">
                {(quotation.status_history ?? []).length === 0 ? (
                  <p className="text-[var(--color-neutral-400)]">No status history.</p>
                ) : (
                  (quotation.status_history ?? []).map((h, i) => (
                    <div
                      key={h.id ?? i}
                      className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
                    >
                      <div className="font-medium">
                        {h.from_status || '—'} → {h.to_status || h.status || '—'}
                      </div>
                      <div className="text-xs text-[var(--color-neutral-400)]">
                        {h.created_at || ''} {h.comments ? `· ${h.comments}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
          {
            key: 'approvals',
            label: 'Approvals',
            content: (
              <div className="space-y-2 text-sm">
                {(quotation.approvals ?? []).length === 0 ? (
                  <p className="text-[var(--color-neutral-400)]">No approval records.</p>
                ) : (
                  (quotation.approvals ?? []).map((a, i) => (
                    <div
                      key={a.id ?? i}
                      className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
                    >
                      <div className="font-medium">
                        {a.decision || a.status || 'Decision'}
                        {a.approver_name ? ` · ${a.approver_name}` : ''}
                      </div>
                      <div className="text-xs text-[var(--color-neutral-400)]">
                        {a.decided_at || a.created_at || ''}
                        {a.comments ? ` · ${a.comments}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />

      {confirm && (
        <QuotationConfirmModal
          open
          kind={confirm.kind}
          quotation={confirm.quotation}
          isPending={pending}
          onClose={closeConfirm}
          onConfirm={(extra) => {
            const kind = confirm.kind;
            if (kind === 'submit') return run(() => actions.submit.mutateAsync(), 'Submitted.');
            if (kind === 'approve')
              return run(
                () => actions.approve.mutateAsync({ comments: extra?.comments }),
                'Approved.',
              );
            if (kind === 'reject')
              return run(
                () => actions.reject.mutateAsync({ comments: extra?.comments }),
                'Rejected.',
              );
            if (kind === 'send') return run(() => actions.send.mutateAsync(), 'Sent.');
            if (kind === 'mark-won')
              return run(
                () => actions.markWon.mutateAsync(),
                usesGatedFreightQuoteFlow(quotation.job_type)
                  ? isNvoccQuoteJobType(quotation.job_type)
                    ? 'Approved only — no job created. Customer fills booking form in portal, then send invoice on NVOCC Bookings → CRO.'
                    : 'Approved only — no job created. Customer fills booking form in portal, then send invoice on Air Ops (Start air ops job if needed).'
                  : usesModeBookingFormConvertFlow(quotation.job_type)
                    ? 'Approved only — waiting for the customer to complete the portal booking form, then the quotation converts to a job.'
                    : 'Approved — job and draft customer invoice created.',
              );
            if (kind === 'mark-lost' && extra?.reason)
              return run(
                () =>
                  actions.markLost.mutateAsync({
                    reason: extra.reason as LostReason,
                    notes: extra.notes,
                  }),
                'Marked lost.',
              );
            if (kind === 'duplicate')
              return run(() => actions.duplicate.mutateAsync(), 'Duplicated.');
            if (kind === 'start-air-ops')
              return run(async () => {
                const q = await actions.createOpsJobWithoutInvoice.mutateAsync();
                const jobId =
                  q && typeof q === 'object' && 'job_id' in q
                    ? String((q as { job_id?: string }).job_id ?? '')
                    : '';
                if (jobId) {
                  navigate(
                    jobDetailPath({
                      id: jobId,
                      job_type: (q as { job_type?: string }).job_type ?? quotation.job_type,
                    }),
                  );
                }
                return q;
              }, 'Air job created — wait for customer booking form, then send invoice on Ops.');
            if (kind === 'convert')
              return run(async () => {
                const q = await actions.convertToJob.mutateAsync();
                const jobId =
                  q && typeof q === 'object' && 'job_id' in q
                    ? String((q as { job_id?: string }).job_id ?? '')
                    : '';
                if (jobId) {
                  navigate(
                    jobDetailPath({
                      id: jobId,
                      job_type: (q as { job_type?: string }).job_type ?? quotation.job_type,
                    }),
                  );
                  return q;
                }
                return q;
              }, 'Converted to job and draft customer invoice created.');
            if (kind === 'archive') return run(() => actions.archive.mutateAsync(), 'Archived.');
            if (kind === 'expire') return run(() => actions.expire.mutateAsync(), 'Expired.');
            if (kind === 'delete')
              return run(async () => {
                await remove.mutateAsync(id);
                navigate('/quotations/all');
              }, 'Deleted.');
            return undefined;
          }}
        />
      )}

      <QuotationPdfModal
        quotationId={id}
        quotationNumber={title}
        quotationDate={quotation.quotation_date}
        quotation={quotation}
        open={pdfOpen}
        isPending={actions.generatePdf.isPending || actions.storeClientPdf.isPending}
        pdfInfo={pdfInfo}
        error={null}
        onClose={() => setPdfOpen(false)}
        onGenerate={async (mode, opts) => {
          setActionError(null);
          const info = await actions.storeClientPdf.mutateAsync({
            mode,
            blob: opts.blob,
            fileName: opts.fileName,
          });
          setActionMessage('Quotation PDF generated and stored for customer portal.');
          try {
            await refetchPdf();
          } catch {
            /* status polling in the modal covers in-progress generation */
          }
          return info;
        }}
      />

      <QuotationEmailModal
        open={emailOpen}
        isPending={actions.sendEmail.isPending}
        defaultTo={quotation.contact_email || ''}
        onClose={() => setEmailOpen(false)}
        onSend={async (dto) => {
          setActionError(null);
          try {
            await actions.sendEmail.mutateAsync(dto);
            setActionMessage('Email sent.');
            setEmailOpen(false);
          } catch (err) {
            setActionError(getErrorMessage(err));
            // Modal shows the error; do not rethrow.
          }
        }}
      />
    </>
  );
}
