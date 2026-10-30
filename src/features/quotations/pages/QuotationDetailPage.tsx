import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  CheckCircle2,
  Copy,
  FileCheck,
  FileText,
  Pencil,
  Plane,
  Plus,
  Send,
  Ship,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { OperationTypeBadge } from '@/components/erp/OperationTypeBadge';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { erpForm } from '@/lib/erpForm';
import { QuotationConfirmModal } from '../components/QuotationConfirmModal';
import { QuotationEmailModal } from '../components/QuotationEmailModal';
import { QuotationLinesEditor } from '../components/QuotationLinesEditor';
import { QuotationNegotiationPanel } from '../components/QuotationNegotiationPanel';
import { QuotationBlDraftPanel } from '../components/QuotationBlDraftPanel';
import { QuotationBookingFormPanel } from '../components/QuotationBookingFormPanel';
import { QuotationOverviewPanel } from '../components/QuotationOverviewPanel';
import { QuotationPdfModal } from '../components/QuotationPdfModal';
import { QuotationStatusBadge } from '../components/QuotationStatusBadge';
import { QuotationTotalsSummary } from '../components/QuotationTotalsSummary';
import {
  QUOTATION_STATUSES,
  STATUS_LABELS,
  type LostReason,
} from '../constants/quotation.constants';
import { QuotationVendorPassModal } from '../components/QuotationVendorPassPanel';
import {
  useQuotationActions,
  useQuotationPdf,
} from '../hooks/useQuotationActions';
import { useQuotationConfirmState } from '../hooks/useQuotationConfirmState';
import { useQuotationNegotiation } from '../hooks/useQuotationNegotiation';
import {
  useDeleteQuotation,
  useQuotation,
  useQuotationRevisions,
  useQuotationStatusOptions,
} from '../hooks/useQuotations';
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
import { buildFclContinuumSteps } from '@/features/shared/continuum/buildFclContinuumSteps';
import { FclContinuumRail } from '@/features/shared/continuum/FclContinuumRail';
import { FavouriteToggle } from '@/features/favourites/components/FavouriteToggle';
import { OpsContinuumRail } from '@/features/ops-activity';
import { EntitySectionFilesPanel } from '@/features/shared/section-attachments';
import { AddStatusCatalogModal } from '@/features/shared/status-catalog';
import { buildCatalogHref } from '@/features/reports/utils/moduleCatalogFamily';
import { isUuid } from '@/lib/isUuid';
import {
  isAwaitingCustomerDecision,
  resolveCustomerFacingQuoteStatus,
} from '../utils/customerQuoteDecision';
import { ensureQuotationEmailPdf } from '../utils/ensureQuotationEmailPdf';
import { quotationDisplayNumber } from '../utils/normalizeQuotation';
import { recalculateQuotationTotals } from '../utils/recalculateQuotationTotals';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import {
  canArchiveQuotation,
  canConvertQuotationToJob,
  canShowQuotationBlDraft,
  canStartAirOpsJobFromQuote,
  canStaffInternallyApprove,
  canStaffSendToCustomer,
  coerceQuotationStatus,
  isQuotationDraftEditable,
  isQuotationLinesEditable,
  usesGatedFreightQuoteFlow,
  usesModeBookingFormConvertFlow,
} from '../utils/quotationStatus';
import { useShipmentsPermissions } from '@/features/shipments/hooks/useShipmentsPermissions';

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

function FresaReadonlyField({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | number | null;
  href?: string;
}) {
  const raw = value == null || value === '' ? '' : String(value).trim();
  const shown = !raw || isUuid(raw) ? '' : raw;
  const text = shown || (href ? 'View' : '—');
  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-[13px] leading-5">
      <span className="shrink-0 font-semibold text-[var(--fresa-header-text,#0A2942)]">
        {label}:
      </span>
      {href ? (
        <Link
          className="min-w-0 truncate font-medium text-[var(--color-primary-700)] hover:underline"
          to={href}
        >
          {text}
        </Link>
      ) : (
        <span className="min-w-0 truncate text-[#0f172a]">{text}</span>
      )}
    </div>
  );
}

export default function QuotationDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: quotation, isLoading, isError, error, refetch } = useQuotation(id);
  const { data: revisions = [] } = useQuotationRevisions(id, Boolean(id));
  const { data: companies = [] } = useTenantCompanies(Boolean(id));
  const actions = useQuotationActions(id);
  const shipmentPerms = useShipmentsPermissions();
  const remove = useDeleteQuotation();
  const { data: pdfInfo, refetch: refetchPdf } = useQuotationPdf(id, Boolean(id));
  const { confirm, requestConfirm, closeConfirm } = useQuotationConfirmState();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  /** Switch DetailPageTemplate tab (e.g. BL Draft action → bl_draft tab). */
  const [focusTab, setFocusTab] = useState<string | undefined>(undefined);
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [changeStatusValue, setChangeStatusValue] = useState('VERIFIED');
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const statusOptionsQuery = useQuotationStatusOptions(changeStatusOpen || addStatusOpen);
  const [vendorPassOpen, setVendorPassOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{
    kind: 'shipment' | 'job';
    id: string;
    label: string;
    href: string;
  } | null>(null);

  // Surface partial costing failures from create wizard (apply-tariff / lines).
  const costingWarnings = (location.state as { costingWarnings?: string[] } | null)?.costingWarnings;
  const costingWarningMessage = costingWarnings?.length
    ? `Quotation created, but some costing steps failed: ${costingWarnings.join(' · ')}`
    : null;
  useEffect(() => {
    if (!costingWarnings?.length) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [costingWarnings, location.pathname, navigate]);

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

  const lines = useMemo(() => quotation?.lines ?? [], [quotation?.lines]);
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
  }, [id, quotation, linkedBooking?.job_id, refetch]);

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

  // APPROVED only — staff continuum Generate Shipment → Generate Job (no auto create).

  const { customerLabel, originLabel, destinationLabel } = useQuotationResolvedLabels(
    quotation ?? {
      id: '',
      customer_id: '',
      status: 'DRAFT',
      job_type: 'SEA_EXPORT',
      currency_code: 'USD',
    },
  );

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

  const run = async (
    fn: () => Promise<unknown>,
    successMsg?: string,
    opts?: { skipBookingFormJobGate?: boolean; stayOnPage?: boolean },
  ) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      const result = await fn();
      closeConfirm();
      if (result && typeof result === 'object' && 'id' in result) {
        const q = result as {
          id: string;
          status?: string;
          job_id?: string;
          job_number?: string;
          invoice_id?: string;
          shipment_id?: string;
          shipment_number?: string;
        };
        // Fresa continuum: stay on quotation; show Shipment No link (do not auto-navigate).
        if (
          opts?.stayOnPage &&
          opts?.skipBookingFormJobGate &&
          q.shipment_id &&
          isUuid(q.shipment_id)
        ) {
          setActionMessage(
            successMsg || 'Shipment has been successfully created.',
          );
          setGeneratedLink({
            kind: 'shipment',
            id: q.shipment_id,
            label: q.shipment_number?.trim() || q.shipment_id.slice(0, 8),
            href: `/operations/shipments/${q.shipment_id}`,
          });
          void refetch();
          return;
        }
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
        // Fresa generate-job: stay on quotation; show Job No link.
        if (jobId && opts?.stayOnPage && opts?.skipBookingFormJobGate) {
          setActionMessage(successMsg || 'Job has been successfully generated.');
          setGeneratedLink({
            kind: 'job',
            id: String(jobId),
            label: q.job_number?.trim() || String(jobId).slice(0, 8),
            href: jobDetailPath({
              id: String(jobId),
              job_type: quotation.job_type,
            }),
          });
          void refetch();
          return;
        }
        if (jobId && opts?.skipBookingFormJobGate && !opts?.stayOnPage) {
          setActionMessage(successMsg || 'Job generated.');
          navigate(
            jobDetailPath({
              id: String(jobId),
              job_type: quotation.job_type,
            }),
          );
          return;
        }
        // NVOCC/Air: never treat approve as convert (even if backend already linked a job).
        if (jobId && usesGatedFreightQuoteFlow(quotation.job_type)) {
          setActionMessage(successMsg || 'Approved only — continue the gated ops flow.');
          void refetch();
          return;
        }
        // Booking-form modes: stay APPROVED until staff continuum Generate Shipment → Job.
        if (jobId && usesModeBookingFormConvertFlow(quotation.job_type)) {
          setActionMessage(
            successMsg ||
              'Approved — use Generate Shipment, then Generate Job when the continuum allows.',
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

  const fclActions = quotation.actions;
  const hasShipment = Boolean(quotation.shipment_id && isUuid(quotation.shipment_id));
  const hasJob = Boolean(quotation.job_id && isUuid(quotation.job_id));
  const canVerify = fclActions?.can_verify === true;
  const canApproveVerified = fclActions?.can_approve_verified === true;
  /**
   * Backend gates Generate Shipment / Job on APPROVED (not VERIFIED).
   * Show buttons only when actions.can_generate_* is explicitly true.
   */
  const canGenerateShipment =
    shipmentPerms.canWriteCreate &&
    !hasShipment &&
    fclActions?.can_generate_shipment === true;
  /** Continuum: Shipment first, then Generate Job when API allows. */
  const canGenerateJobFromQuote =
    !hasJob && fclActions?.can_generate_job === true;

  /** Top-right Fresa chrome (Back is DetailPageTemplate onBack). */
  const headerActions = [
    {
      label: 'Create',
      icon: <Plus />,
      onClick: () => navigate('/quotations/new'),
      variant: 'create' as const,
    },
    ...(editable
      ? [
          {
            label: 'Edit',
            icon: <Pencil />,
            onClick: () => navigate(`/quotations/${id}/edit`),
            variant: 'edit' as const,
          },
        ]
      : []),
    {
      label: 'Report',
      icon: <FileText />,
      onClick: () =>
        navigate(
          buildCatalogHref({
            family: 'quotation',
            context: 'quotation',
            quotation_id: id,
            job_id: quotation.job_id,
            shipment_id: quotation.shipment_id,
          }),
        ),
      variant: 'report' as const,
    },
  ];

  const continuumSteps = buildFclContinuumSteps({
    partyId: quotation.customer_id,
    enquiryId: quotation.enquiry_id,
    quotationId: quotation.id,
    quotationStatus: status,
    verified: Boolean(fclActions?.can_approve_verified) || undefined,
    shipmentId: quotation.shipment_id,
    jobId: quotation.job_id,
    // View Job only when CONVERTED (provisional job_id must not open the link).
    jobHref:
      quotation.job_id &&
      String(status ?? '').toUpperCase().replace(/[\s-]+/g, '_') === 'CONVERTED'
        ? jobDetailPath({ id: quotation.job_id, job_type: quotation.job_type })
        : undefined,
  });

  const enquiryHref =
    quotation.enquiry_id && isUuid(quotation.enquiry_id)
      ? `/sales/enquiries/${quotation.enquiry_id}`
      : undefined;
  const shipmentHref =
    generatedLink?.kind === 'shipment'
      ? generatedLink.href
      : hasShipment && quotation.shipment_id
        ? `/operations/shipments/${quotation.shipment_id}`
        : undefined;
  const isConvertedStatus =
    String(status ?? '').toUpperCase().replace(/[\s-]+/g, '_') === 'CONVERTED';
  const jobHref =
    generatedLink?.kind === 'job'
      ? generatedLink.href
      : hasJob && quotation.job_id && isConvertedStatus
        ? jobDetailPath({ id: quotation.job_id, job_type: quotation.job_type })
        : undefined;

  return (
    <>
      <OpsContinuumRail
        entityType="QUOTATION"
        entityId={quotation.id}
        pathHints={['ops_continuum']}
        opsContinuum={quotation.ops_continuum}
        actions={quotation.actions as Record<string, unknown> | undefined}
        links={{
          enquiryId: quotation.enquiry_id,
          quotationId: quotation.id,
          shipmentId: quotation.shipment_id,
          jobId: quotation.job_id,
        }}
      />
      <DetailPageTemplate
        reserveContinuumRail
        defaultTab={focusTab}
        eyebrow="Quotation details"
        title={title}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <OperationTypeBadge code={quotation.job_type} />
            {customerLabel && customerLabel !== '—' ? <span>{customerLabel}</span> : null}
          </span>
        }
        statusLabel={STATUS_LABELS[status] ?? status}
        statusTone={statusTone(status)}
        backTo={'/quotations/all'}
        backLabel="All quotations"
        actions={headerActions}
        actionsDisabled={pending}
        banner={
          <>
            {(actionError || costingWarningMessage || actionMessage) && (
              <div className="space-y-2">
                {(actionError || costingWarningMessage) && (
                  <div
                    role="alert"
                    className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
                  >
                    {actionError || costingWarningMessage}
                  </div>
                )}
                {actionMessage && (
                  <div
                    role="status"
                    className="rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700"
                  >
                    <p>{actionMessage}</p>
                    {generatedLink?.kind === 'shipment' ? (
                      <p className="mt-1">
                        Shipment No:{' '}
                        <Link className="font-semibold underline" to={generatedLink.href}>
                          {generatedLink.label}
                        </Link>
                      </p>
                    ) : null}
                    {generatedLink?.kind === 'job' ? (
                      <p className="mt-1">
                        Job No:{' '}
                        <Link className="font-semibold underline" to={generatedLink.href}>
                          {generatedLink.label}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            )}
            {quotation.job_type === 'CUSTOMS_CLEARANCE' ? (
              <div className="rounded-lg border border-teal-200 bg-teal-50/80 p-4 text-sm text-teal-900">
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
                      <Link className="underline" to={`/jobs/customs-clearance/${quotation.job_id}`}>
                        Open linked job
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
            ) : null}
            {isNvoccQuoteJobType(quotation.job_type) ? (
              <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
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
            {isAirQuoteJobType(quotation.job_type) ? (
              <div
                role="note"
                className="rounded-lg border px-3 py-2 text-sm"
                style={{
                  background: 'var(--color-primary-50, #EFF6FF)',
                  borderColor: 'var(--color-primary-200, #BFDBFE)',
                  color: 'var(--color-neutral-700)',
                }}
              >
                Air freight: customer accept sets <strong>APPROVED only</strong> (no auto shipment/job).
                Customer completes the <strong>booking form in the portal</strong>, then staff sends
                invoice. Prefer continuum <strong>Generate Shipment → Generate Job</strong>, or{' '}
                <strong>Start air ops job</strong> when Ops APIs need a shell. Gate order: CS triage →
                quote sent → customer accept → booking form → invoice → export/import ops.
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
          </>
        }
        detailTitle="Quotation detail"
        detailSection={
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            <FresaReadonlyField label="Quotation No" value={title} />
            <FresaReadonlyField
              label="Client"
              value={customerLabel}
              href={
                quotation.customer_id && isUuid(quotation.customer_id)
                  ? `/parties/${quotation.customer_id}`
                  : undefined
              }
            />
            <FresaReadonlyField
              label="Department"
              value={quotation.department_name || quotation.job_type?.replaceAll('_', ' ')}
            />
            <FresaReadonlyField label="Status" value={STATUS_LABELS[status] ?? status} />
            <FresaReadonlyField label="Quotation date" value={quotation.quotation_date} />
            <FresaReadonlyField label="Currency" value={quotation.currency_code} />
            <FresaReadonlyField label="Enquiry No" value={enquiryHref ? 'View enquiry' : undefined} href={enquiryHref} />
            <FresaReadonlyField
              label="Shipment No"
              value={
                generatedLink?.kind === 'shipment'
                  ? generatedLink.label
                  : quotation.shipment_number || (shipmentHref ? 'View shipment' : undefined)
              }
              href={shipmentHref}
            />
            <FresaReadonlyField
              label="Job No"
              value={
                generatedLink?.kind === 'job'
                  ? generatedLink.label
                  : quotation.job_number || (jobHref ? 'View job' : undefined)
              }
              href={jobHref}
            />
            <FresaReadonlyField label="Incoterms" value={quotation.incoterm} />
            <FresaReadonlyField label="Commodity" value={quotation.commodity} />
            <FresaReadonlyField label="POL" value={originLabel} />
            <FresaReadonlyField label="POD" value={destinationLabel} />
            <FresaReadonlyField label="Carrier" value={quotation.carrier_name} />
            <FresaReadonlyField label="Valid until" value={quotation.valid_until} />
          </div>
        }
        afterDetail={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <FclContinuumRail steps={continuumSteps} />
              <FavouriteToggle
                kind="quotation"
                targetKey={quotation.id}
                label={title}
              />
            </div>
            <div className="rounded-sm bg-white px-3 py-2 text-[13px]">
              <span className="font-semibold text-[var(--fresa-header-text,#0A2942)]">Related: </span>
              {enquiryHref ? (
                <Link className="mr-3 text-[var(--fresa-action,#0A2942)] hover:underline" to={enquiryHref}>
                  Enquiry
                </Link>
              ) : null}
              {shipmentHref ? (
                <Link className="mr-3 text-[var(--fresa-action,#0A2942)] hover:underline" to={shipmentHref}>
                  Shipment No:{' '}
                  {generatedLink?.kind === 'shipment'
                    ? generatedLink.label
                    : quotation.shipment_number?.trim() || quotation.shipment_id?.slice(0, 8)}
                </Link>
              ) : null}
              {jobHref ? (
                <Link className="mr-3 text-[var(--fresa-action,#0A2942)] hover:underline" to={jobHref}>
                  Job No:{' '}
                  {generatedLink?.kind === 'job'
                    ? generatedLink.label
                    : quotation.job_number?.trim() || quotation.job_id?.slice(0, 8)}
                </Link>
              ) : null}
            </div>
          </>
        }
        toolbar={
          <>
            {quotation.actions?.can_change_status !== false ? (
              <Button
                size="sm"
                type="button"
                variant="warning"
                leftIcon={<CheckCircle2 />}
                disabled={pending}
                onClick={() => {
                  setChangeStatusValue(
                    canApproveVerified ? 'APPROVED' : canVerify ? 'VERIFIED' : 'APPROVED',
                  );
                  setChangeStatusOpen(true);
                }}
              >
                Change Quote Status
              </Button>
            ) : null}
            {canGenerateShipment ? (
              <Button
                size="sm"
                type="button"
                variant="report"
                leftIcon={<Ship />}
                disabled={pending}
                onClick={() => requestConfirm('generate-shipment', quotation)}
              >
                Generate Shipment
              </Button>
            ) : null}
            {canGenerateJobFromQuote ? (
              <Button
                size="sm"
                type="button"
                variant="success"
                leftIcon={<Briefcase />}
                disabled={pending}
                onClick={() => requestConfirm('generate-job', quotation)}
              >
                Generate Job
              </Button>
            ) : null}
            <Button
              size="sm"
              type="button"
              variant="create"
              leftIcon={<Copy />}
              disabled={pending}
              onClick={() =>
                requestConfirm(
                  quotation.actions?.can_copy === false ? 'duplicate' : 'copy',
                  quotation,
                )
              }
            >
              {quotation.actions?.can_copy === false ? 'Duplicate' : 'Copy'}
            </Button>
            <Button
              size="sm"
              type="button"
              variant="success"
              leftIcon={<Send />}
              disabled={pending}
              onClick={() => setVendorPassOpen(true)}
            >
              Send to vendor
            </Button>
            {editable ? (
              <Button
                size="sm"
                type="button"
                variant="create"
                leftIcon={<Send />}
                disabled={pending}
                onClick={() => requestConfirm('submit', quotation)}
              >
                Submit
              </Button>
            ) : null}
            {canVerify ? (
              <Button
                size="sm"
                type="button"
                variant="warning"
                leftIcon={<CheckCircle2 />}
                disabled={pending}
                onClick={() => requestConfirm('verify', quotation)}
              >
                Verify
              </Button>
            ) : null}
            {canApproveVerified ? (
              <Button
                size="sm"
                type="button"
                variant="success"
                leftIcon={<ThumbsUp />}
                disabled={pending}
                onClick={() => requestConfirm('approve-verified', quotation)}
              >
                Approve verified
              </Button>
            ) : null}
            {canStaffInternallyApprove(status) && !canApproveVerified ? (
              <>
                <Button
                  size="sm"
                  type="button"
                  variant="success"
                  leftIcon={<ThumbsUp />}
                  disabled={pending}
                  onClick={() => requestConfirm('approve', quotation)}
                >
                  Internally approve
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="danger"
                  leftIcon={<ThumbsDown />}
                  disabled={pending}
                  onClick={() => requestConfirm('reject', quotation)}
                >
                  Reject
                </Button>
              </>
            ) : null}
            {quotation.actions?.can_send === true ||
            (quotation.actions?.can_send !== false && canStaffSendToCustomer(status)) ? (
              <Button
                size="sm"
                type="button"
                variant="report"
                leftIcon={<Send />}
                disabled={pending}
                onClick={() => requestConfirm('send', quotation)}
              >
                Send
              </Button>
            ) : null}
            {canConvertQuotationToJob(status, quotation.job_type, quotation.actions) &&
            !canGenerateJobFromQuote ? (
              <Button
                size="sm"
                type="button"
                variant="warning"
                leftIcon={<Briefcase />}
                disabled={pending}
                onClick={() => requestConfirm('convert', quotation)}
              >
                Convert to job
              </Button>
            ) : null}
            {canStartAirOpsJobFromQuote(status, quotation.job_type, quotation.job_id) ? (
              <Button
                size="sm"
                type="button"
                variant="success"
                leftIcon={<Plane />}
                disabled={pending}
                onClick={() => requestConfirm('start-air-ops', quotation)}
              >
                Start air ops job
              </Button>
            ) : null}
            {isNvoccQuoteJobType(quotation.job_type) && status === 'APPROVED' ? (
              <Button
                size="sm"
                type="button"
                variant="report"
                leftIcon={<Ship />}
                disabled={pending}
                onClick={() => navigate('/nvocc/booking-list')}
              >
                Continue on NVOCC bookings
              </Button>
            ) : null}
            {quotation.actions?.can_download_pdf !== false ||
            quotation.actions?.can_generate_pdf !== false ? (
              <Button
                size="sm"
                type="button"
                variant="report"
                leftIcon={<FileText />}
                disabled={pending}
                onClick={() => setPdfOpen(true)}
                title={
                  quotation.actions?.can_download_pdf === false
                    ? 'Generate quotation PDF'
                    : 'Generate / download quotation PDF'
                }
              >
                {quotation.actions?.can_download_pdf === false &&
                quotation.actions?.can_generate_pdf !== false
                  ? 'Generate PDF'
                  : 'Download PDF'}
              </Button>
            ) : null}
            {canShowQuotationBlDraft(quotation.job_type, quotation.actions) ? (
              <Button
                size="sm"
                type="button"
                variant="create"
                leftIcon={<FileCheck />}
                disabled={pending}
                onClick={() => setFocusTab('bl_draft')}
                title="Preview / generate HBL draft from booking-form fields (same as shipment BL Entry)"
              >
                BL Draft
              </Button>
            ) : null}
            <Button
              size="sm"
              type="button"
              variant="create"
              leftIcon={<Send />}
              disabled={pending}
              onClick={() => setEmailOpen(true)}
            >
              Email
            </Button>
            {canArchiveQuotation(status) ? (
              <Button
                size="sm"
                type="button"
                variant="danger"
                leftIcon={<X />}
                disabled={pending}
                onClick={() => requestConfirm('archive', quotation)}
              >
                Archive
              </Button>
            ) : null}
            {status === 'DRAFT' ? (
              <Button
                size="sm"
                type="button"
                variant="danger"
                leftIcon={<X />}
                disabled={pending}
                onClick={() => requestConfirm('delete', quotation)}
              >
                Delete
              </Button>
            ) : null}
            {canStaffSendToCustomer(status) || status === 'SENT' ? (
              <Button
                size="sm"
                type="button"
                variant="danger"
                leftIcon={<X />}
                disabled={pending}
                onClick={() => requestConfirm('expire', quotation)}
              >
                Expire
              </Button>
            ) : null}
          </>
        }
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
            key: 'section-files',
            label: 'Section files',
            content: (
              <EntitySectionFilesPanel
                entity="quotations"
                entityId={quotation.id}
                title="Section files"
              />
            ),
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
                actionsFlags={quotation.actions}
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
                  (quotation.status_history ?? []).map((h, i) => {
                    const actorName =
                      h.changed_by_name ||
                      h.performed_by_name ||
                      (typeof h.actor === 'string'
                        ? h.actor
                        : h.actor && typeof h.actor === 'object'
                          ? h.actor.name
                          : undefined);
                    return (
                    <div
                      key={h.id ?? i}
                      className="rounded-md border border-[var(--color-neutral-200)] px-3 py-2"
                    >
                      <div className="font-medium">
                        {h.from_status || '—'} → {h.to_status || h.status || '—'}
                      </div>
                      <div className="text-xs text-[var(--color-neutral-400)]">
                        {h.created_at || ''}
                        {actorName ? ` · ${actorName}` : ''}
                        {h.comments ? ` · ${h.comments}` : ''}
                      </div>
                    </div>
                    );
                  })
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
          ...(quotation.actions?.can_booking_form !== false &&
          (usesModeBookingFormConvertFlow(quotation.job_type) ||
            Boolean(quotation.job_id) ||
            quotation.actions?.can_booking_form === true)
            ? [
                {
                  key: 'booking_form',
                  label: 'Booking form',
                  content: <QuotationBookingFormPanel quotation={quotation} />,
                },
              ]
            : []),
          ...(canShowQuotationBlDraft(quotation.job_type, quotation.actions)
            ? [
                {
                  key: 'bl_draft',
                  label: 'BL Draft',
                  content: <QuotationBlDraftPanel quotation={quotation} />,
                },
              ]
            : []),
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
                  : 'Approved only — no shipment/job created. Next: Generate Shipment → confirm/approve → Generate Job.',
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
            if (kind === 'copy')
              return run(async () => {
                const copied = await actions.copy.mutateAsync();
                if (copied?.id) navigate(`/quotations/${copied.id}`);
              }, 'Quotation copied.');
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
            if (kind === 'verify')
              return run(() => actions.verify.mutateAsync(), 'Quotation verified.');
            if (kind === 'approve-verified')
              return run(
                () => actions.approveVerified.mutateAsync(),
                'Verified quotation approved.',
              );
            if (kind === 'generate-shipment')
              return run(
                () => actions.generateShipment.mutateAsync(),
                'Shipment has been successfully created.',
                { skipBookingFormJobGate: true, stayOnPage: true },
              );
            if (kind === 'generate-job')
              return run(
                () => actions.generateJob.mutateAsync(),
                'Job has been successfully generated.',
                { skipBookingFormJobGate: true, stayOnPage: true },
              );
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

      <QuotationVendorPassModal
        open={vendorPassOpen}
        quotationId={id}
        onClose={() => setVendorPassOpen(false)}
        onSuccess={(msg) => {
          setActionError(null);
          setActionMessage(msg);
        }}
      />

      {changeStatusOpen && (
        <Modal
          open
          onClose={() => !pending && setChangeStatusOpen(false)}
          title="Change Quote Status"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                leftIcon={<X />}
                disabled={pending}
                onClick={() => setChangeStatusOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                leftIcon={<CheckCircle2 />}
                disabled={pending || !changeStatusValue}
                onClick={() =>
                  void run(async () => {
                    await actions.changeStatus.mutateAsync({
                      status: changeStatusValue,
                    });
                    setChangeStatusOpen(false);
                  }, `Status changed to ${changeStatusValue}.`)
                }
              >
                {pending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          }
        >
          <p className="mb-3 text-[13px] text-[#475569]">
            Fresa flow: set status to <strong>VERIFIED</strong>, then <strong>APPROVED</strong>, then
            Generate Shipment.
          </p>
          <label className="block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Status</span>
            <div className="flex items-center gap-2">
              <select
                className="h-8 min-w-0 flex-1 rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={changeStatusValue}
                onChange={(e) => setChangeStatusValue(e.target.value)}
              >
                {(statusOptionsQuery.data?.length
                  ? statusOptionsQuery.data
                  : [
                      { value: 'VERIFIED', label: 'VERIFIED' },
                      { value: 'APPROVED', label: 'APPROVED' },
                      { value: 'SUBMITTED', label: 'SUBMITTED' },
                      { value: 'INTERNALLY_APPROVED', label: 'INTERNALLY_APPROVED' },
                      { value: 'SENT', label: 'SENT' },
                      { value: 'REJECTED', label: 'REJECTED' },
                      { value: 'EXPIRED', label: 'EXPIRED' },
                    ]
                ).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                    {s.is_custom ? ' (custom)' : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                title="Add custom status"
                aria-label="Add custom status"
                onClick={() => setAddStatusOpen(true)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </label>
        </Modal>
      )}

      <AddStatusCatalogModal
        open={addStatusOpen}
        nested
        entity="quotations"
        onClose={() => setAddStatusOpen(false)}
        onCreated={(code) => {
          setChangeStatusValue(code);
          void statusOptionsQuery.refetch();
        }}
      />

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
        isPending={actions.sendEmail.isPending || actions.storeClientPdf.isPending}
        defaultTo={quotation.contact_email || ''}
        onClose={() => setEmailOpen(false)}
        onSend={async (dto) => {
          setActionError(null);
          try {
            const companyMatch =
              companies.find(
                (c) => c.id && quotation.company_id && c.id === quotation.company_id,
              ) || companies[0];
            const pdf = await ensureQuotationEmailPdf({
              quotation,
              mode: dto.pdf_mode === 'INTERNAL' ? 'INTERNAL' : 'CUSTOMER',
              companyName: companyMatch?.name,
            });
            // SMTP: attach client KingFisher PDF (multipart / pdf_base64 per live OpenAPI).
            const result = await actions.sendEmail.mutateAsync({
              dto,
              pdfBlob: pdf.blob,
              fileName: pdf.fileName,
            });
            const { formatShareEmailSuccess } = await import('@/features/shared/share-email');
            setActionMessage(
              formatShareEmailSuccess(
                (result as { success?: boolean; pdf_attached?: boolean; message?: string }) || {},
              ) || 'Quotation email sent.',
            );
            setEmailOpen(false);
            try {
              await refetchPdf();
            } catch {
              /* optional */
            }
          } catch (err) {
            setActionError(getErrorMessage(err));
            // Modal shows the error; do not rethrow.
          }
        }}
      />
    </>
  );
}
