import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  FileText,
  PauseCircle,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { OperationTypeBadge } from '@/components/erp/OperationTypeBadge';
import { DetailPageTemplate } from '@/components/templates/DetailPageTemplate';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { buildFclContinuumSteps } from '@/features/shared/continuum/buildFclContinuumSteps';
import { FclContinuumRail } from '@/features/shared/continuum/FclContinuumRail';
import { FavouriteToggle } from '@/features/favourites/components/FavouriteToggle';
import { OpsContinuumRail } from '@/features/ops-activity';
import { GenerateEdiPanel } from '@/features/shared/edi/GenerateEdiPanel';
import { EntitySectionFilesPanel } from '@/features/shared/section-attachments';
import { erpForm } from '@/lib/erpForm';
import { JobDetailApiTabPanel } from '../components/JobDetailApiTabPanel';
import {
  JobActionPanelContent,
  JOB_ACTION_BUTTON_STYLE,
} from '../components/JobActionPanelContent';
import { JobConfirmModal } from '../components/JobConfirmModal';
import {
  defaultJobDetailTabKey,
  isJobActionPanelKey,
  isJobDetailTabKey,
  jobActionPanelLabel,
  jobDetailTabLabel,
  normalizeJobDetailTabKey,
  resolveJobActionPanels,
  resolveJobDetailTabs,
  type JobActionPanelKey,
} from '../utils/jobDetailTabs';
import {
  JOB_REOPENABLE_STATUSES,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  JOB_SEGMENTS,
  type JobSegmentKey,
  type JobStatus,
} from '../constants/job.constants';
import { useJobActions } from '../hooks/useJobActions';
import { useJobConfirmState } from '../hooks/useJobConfirmState';
import { useCrmEnquiry } from '@/features/crm/hooks/useCrmEnquiries';
import { useQuotation } from '@/features/quotations/hooks/useQuotations';
import { useShipment } from '@/features/shipments/hooks/useShipments';
import { useJobResolvedLabels } from '../hooks/useJobResolvedLabels';
import {
  useJob,
  useJobEdiSubmissions,
  useJobEdiTypes,
  useJobHouseJobs,
  useJobStatusOptions,
} from '../hooks/useJobs';
import { getErrorMessage } from '../utils/getErrorMessage';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import {
  jobDetailPath,
  jobDisplayNumber,
  jobEditable,
  jobRoutePrefix,
  segmentForJobType,
  segmentFromPath,
} from '../utils/jobRoute';
import { isUuid } from '@/lib/isUuid';

function statusTone(status: string): 'emerald' | 'amber' | 'rose' | 'slate' {
  if (status === 'COMPLETED' || status === 'DELIVERED') return 'emerald';
  if (status === 'CANCELLED') return 'rose';
  if (status === 'IN_PROGRESS' || status === 'DOCS_PENDING') return 'amber';
  return 'slate';
}

/** Prefer a human label; never surface a bare UUID. */
function displayValue(value?: string | number | null): string {
  if (value == null || value === '') return '';
  const raw = String(value).trim();
  if (!raw || isUuid(raw)) return '';
  return raw;
}

function formatDetailDate(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.trim();
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
  const shown = displayValue(value);
  const text = shown || (href ? 'View' : '—');
  return (
    <div className="min-w-0">
      <div className={erpForm.label}>{label}</div>
      <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[13px] text-[#0f172a]">
        {href ? (
          <Link
            className="truncate font-medium text-[var(--color-primary-700)] hover:underline"
            to={href}
          >
            {text}
          </Link>
        ) : (
          <span className="truncate">{text}</span>
        )}
      </div>
    </div>
  );
}

/** Only render when the customer/ops value is present (or a continuum link exists). */
function OptionalFresaField({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | number | null;
  href?: string;
}) {
  const shown = displayValue(value);
  if (!shown && !href) return null;
  return <FresaReadonlyField label={label} value={shown || undefined} href={href} />;
}

export default function JobDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const segment = (segmentFromPath(pathname) ?? 'air-export') as JobSegmentKey;
  const prefix = jobRoutePrefix(segment);
  const segmentLabel = JOB_SEGMENTS[segment].label;

  const { data: job, isLoading, isError, error, refetch } = useJob(id);
  const { data: houseJobs = [] } = useJobHouseJobs(id, Boolean(job && !job.parent_job_id));
  const actions = useJobActions(id);
  const [ediOpen, setEdiOpen] = useState(false);
  const jobEdiTypesQuery = useJobEdiTypes(id, ediOpen);
  const jobEdiSubmissionsQuery = useJobEdiSubmissions(id, ediOpen);

  // After shipment→job, continuum numbers may live on the linked shipment (or quote/enquiry)
  // even when GET /jobs/:id only returns IDs.
  const needsShipmentLink = Boolean(
    job?.shipment_id &&
      isUuid(job.shipment_id) &&
      (!displayValue(job.shipment_number) ||
        !displayValue(job.enquiry_number) ||
        !displayValue(job.quotation_number) ||
        !job.enquiry_id ||
        !job.quotation_id),
  );
  const linkedShipmentQuery = useShipment(needsShipmentLink ? job!.shipment_id! : '');
  const linkedShipment = linkedShipmentQuery.data;

  const resolvedEnquiryId =
    (job?.enquiry_id && isUuid(job.enquiry_id) ? job.enquiry_id : undefined) ||
    (linkedShipment?.enquiry_id && isUuid(linkedShipment.enquiry_id)
      ? linkedShipment.enquiry_id
      : undefined);
  const resolvedQuotationId =
    (job?.quotation_id && isUuid(job.quotation_id) ? job.quotation_id : undefined) ||
    (linkedShipment?.quotation_id && isUuid(linkedShipment.quotation_id)
      ? linkedShipment.quotation_id
      : undefined);
  const resolvedShipmentId =
    job?.shipment_id && isUuid(job.shipment_id) ? job.shipment_id : undefined;

  const needsEnquiryLink = Boolean(
    resolvedEnquiryId && !displayValue(job?.enquiry_number) && !displayValue(linkedShipment?.enquiry_number),
  );
  const needsQuotationLink = Boolean(
    resolvedQuotationId &&
      !displayValue(job?.quotation_number) &&
      !displayValue(linkedShipment?.quotation_number),
  );
  const linkedEnquiryQuery = useCrmEnquiry(needsEnquiryLink ? resolvedEnquiryId! : '');
  const linkedQuotationQuery = useQuotation(needsQuotationLink ? resolvedQuotationId! : '');

  const enquiryNumber =
    displayValue(job?.enquiry_number) ||
    displayValue(linkedShipment?.enquiry_number) ||
    displayValue(linkedEnquiryQuery.data?.enquiry_number) ||
    '';
  const quotationNumber =
    displayValue(job?.quotation_number) ||
    displayValue(linkedShipment?.quotation_number) ||
    displayValue(linkedQuotationQuery.data?.quotation_number) ||
    displayValue(linkedQuotationQuery.data?.quote_no) ||
    '';
  const shipmentNumber =
    displayValue(job?.shipment_number) ||
    displayValue(linkedShipment?.shipment_number) ||
    displayValue(linkedShipment?.reference) ||
    '';
  const { confirm, requestConfirm, closeConfirm } = useJobConfirmState();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [changeStatusValue, setChangeStatusValue] = useState('IN_PROGRESS');
  const [changeStatusReason, setChangeStatusReason] = useState('');
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenStatus, setReopenStatus] = useState('IN_PROGRESS');
  const [reopenReason, setReopenReason] = useState('');
  const [closedOverridesOpen, setClosedOverridesOpen] = useState(false);
  const [closedDeliveryDate, setClosedDeliveryDate] = useState('');
  const [closedDoRemarks, setClosedDoRemarks] = useState('');
  const [closedReturnToTerminal, setClosedReturnToTerminal] = useState('');
  const [closedLoadOnboard, setClosedLoadOnboard] = useState('');
  const [closedCommodityNote, setClosedCommodityNote] = useState('');
  const [closedOverrideReason, setClosedOverrideReason] = useState('');
  const [stopOpen, setStopOpen] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [actionPanel, setActionPanel] = useState<JobActionPanelKey | null>(null);
  const statusOptionsQuery = useJobStatusOptions(
    id,
    Boolean(id) && job?.actions?.can_status_options !== false,
  );

  // Keep URL segment aligned with job_type (e.g. converted ROAD_FREIGHT → /jobs/road-freight/:id).
  useEffect(() => {
    if (!job?.id || !isUuid(job.id)) return;
    const expected = segmentForJobType(canonicalizeJobType(job.job_type));
    const current = segmentFromPath(pathname);
    if (current === expected) return;
    const target = jobDetailPath(job);
    if (target !== pathname) {
      navigate(target, { replace: true, state: location.state });
    }
  }, [job, pathname, navigate, location.state]);

  // Surface partial costing failures from create wizard (POST /jobs/:id/charges).
  const costingWarnings = (location.state as { costingWarnings?: string[] } | null)?.costingWarnings;
  const costingWarningMessage = costingWarnings?.length
    ? `Job created, but some charge lines failed: ${costingWarnings.join(' · ')}`
    : null;
  useEffect(() => {
    if (!costingWarnings?.length) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [costingWarnings, location.pathname, navigate]);

  const {
    shipperLabel,
    consigneeLabel,
    originLabel,
    destinationLabel,
    branchLabel,
    departmentLabel,
    agentLabel,
    salespersonLabel,
    vesselLabel,
    shippingLineLabel,
    airlineLabel,
  } = useJobResolvedLabels(
    job ?? {
      id: '',
      job_type: 'AIR_EXPORT',
      status: 'DRAFT',
      shipper_id: '',
    },
  );

  const highlightInvoiceId = useMemo(() => {
    const state = location.state as { invoiceId?: string } | null;
    const fromState = state?.invoiceId;
    if (fromState && isUuid(fromState)) return fromState;
    const fromQuery = new URLSearchParams(location.search).get('invoice_id');
    return fromQuery && isUuid(fromQuery) ? fromQuery : undefined;
  }, [location.search, location.state]);

  /** Map legacy tab query aliases → API detail tabs or Actions panels. */
  const requestedTab = useMemo(() => {
    const fromQuery = new URLSearchParams(location.search).get('tab');
    const fromState = (location.state as { openTab?: string } | null)?.openTab;
    return (fromQuery || fromState || '').trim();
  }, [location.search, location.state]);

  useEffect(() => {
    if (!requestedTab) {
      if (highlightInvoiceId) setActionPanel('invoices');
      return;
    }
    const legacy: Record<string, string> = {
      overview: 'info',
      info: 'info',
      information: 'info',
      ops: 'booking_form',
      party: 'organization',
      charges: 'costing',
    };
    const mapped = legacy[requestedTab.toLowerCase()] || requestedTab;
    if (isJobActionPanelKey(mapped)) {
      setActionPanel(mapped);
      return;
    }
    if (isJobDetailTabKey(mapped)) {
      setActionPanel(null);
    }
  }, [requestedTab, highlightInvoiceId]);

  const defaultTab = useMemo(() => {
    if (!job) return undefined;
    const available = resolveJobDetailTabs(job);
    const availableKeys = new Set([
      ...available.map((t) => t.key),
      'section-files',
      'section_files',
    ]);
    const pick = (key: string | undefined) =>
      key && availableKeys.has(key) ? key : defaultJobDetailTabKey(job);

    if (requestedTab) {
      const legacy: Record<string, string> = {
        overview: 'info',
        info: 'info',
        information: 'info',
        showall: 'show_all',
        show_all: 'show_all',
        ops: 'booking_form',
        party: 'organization',
        charges: 'costing',
        'section-files': 'section-files',
        section_files: 'section-files',
      };
      const mapped = legacy[requestedTab.toLowerCase()] || requestedTab;
      // Action keys open as popup — keep Show All (or API default) underneath.
      if (isJobActionPanelKey(mapped)) {
        return pick(defaultJobDetailTabKey(job));
      }
      if (mapped === 'section-files' || mapped === 'section_files') {
        return 'section-files';
      }
      if (isJobDetailTabKey(mapped)) {
        return pick(normalizeJobDetailTabKey(mapped));
      }
    }
    // Opening a job always lands on Show All when the API returns that tab.
    return pick(defaultJobDetailTabKey(job));
  }, [job, requestedTab]);

  /** API detail tabs + frontend Section files hub (same as quotation). */
  const tabs = useMemo(() => {
    if (!job) return [];
    const overviewJob = {
      ...job,
      enquiry_id: resolvedEnquiryId || job.enquiry_id,
      quotation_id: resolvedQuotationId || job.quotation_id,
      shipment_id: resolvedShipmentId || job.shipment_id,
      enquiry_number: enquiryNumber || job.enquiry_number,
      quotation_number: quotationNumber || job.quotation_number,
      shipment_number: shipmentNumber || job.shipment_number,
    };

    const resolved = resolveJobDetailTabs(job);
    const siblingTabKeys = resolved.map((t) => t.key);
    const apiTabs = resolved.map((t) => ({
      key: t.key,
      label: t.label || jobDetailTabLabel(t.key),
      content: (
        <JobDetailApiTabPanel
          tabKey={t.key}
          job={overviewJob}
          onChanged={() => refetch()}
          siblingTabKeys={siblingTabKeys}
        />
      ),
    }));
    return [
      ...apiTabs,
      {
        key: 'section-files',
        label: 'Section files',
        content: (
          <EntitySectionFilesPanel
            entity="jobs"
            entityId={job.id}
            title="Section files"
          />
        ),
      },
    ];
  }, [
    job,
    refetch,
    resolvedEnquiryId,
    resolvedQuotationId,
    resolvedShipmentId,
    enquiryNumber,
    quotationNumber,
    shipmentNumber,
  ]);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (isError || !job) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(error) || 'Job not found.'}
        </p>
        <button type="button" className="text-sm underline" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const editable =
    job.actions?.can_edit === false ? false : jobEditable(job.status);
  const canDelete =
    job.actions?.can_delete === true ||
    (job.actions?.can_delete !== false &&
      (job.status === 'COMPLETED' || job.status === 'CANCELLED'));
  const fclActions = job.actions;
  const canChangeStatus = fclActions?.can_change_status !== false;
  const canStop =
    fclActions?.can_stop !== false &&
    editable &&
    job.status !== 'ON_HOLD' &&
    job.status !== 'COMPLETED' &&
    job.status !== 'CANCELLED';
  const canReopen =
    fclActions?.can_reopen === true ||
    (fclActions?.can_reopen !== false &&
      JOB_REOPENABLE_STATUSES.includes(job.status as JobStatus));
  const isClosedJob =
    job.status === 'COMPLETED' ||
    job.status === 'DELIVERED' ||
    Boolean((job as { is_closed?: boolean }).is_closed);
  const canEditClosedDelivery =
    isClosedJob &&
    (fclActions?.can_edit_closed_delivery === true ||
      fclActions?.can_edit_closed_delivery !== false);
  const canClose = fclActions?.can_close !== false && editable;
  const canCancel = fclActions?.can_cancel !== false && editable;
  const canCopy = fclActions?.can_copy !== false;
  const actionPanels = resolveJobActionPanels(job, {
    houseJobsCount: houseJobs.length,
  });
  const statusCatalog = (() => {
    if (fclActions?.allowed_statuses?.length) {
      return fclActions.allowed_statuses.map((s) => ({
        value: s,
        label: JOB_STATUS_LABELS[s as JobStatus] ?? s,
      }));
    }
    if (statusOptionsQuery.data?.length) return statusOptionsQuery.data;
    return JOB_STATUSES.map((s) => ({
      value: s,
      label: JOB_STATUS_LABELS[s] ?? s,
    }));
  })();

  const run = async (fn: () => Promise<unknown>, successMsg: string, navigateAway?: boolean) => {
    setActionError(null);
    setActionMessage(null);
    setPending(true);
    try {
      const result = await fn();
      closeConfirm();
      if (navigateAway) {
        navigate(prefix);
        return;
      }
      const warnings =
        result &&
        typeof result === 'object' &&
        Array.isArray((result as { warnings?: unknown }).warnings)
          ? ((result as { warnings: string[] }).warnings)
          : undefined;
      setActionMessage(
        warnings?.length ? `${successMsg} Warnings: ${warnings.join(' · ')}` : successMsg,
      );
      refetch();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  const headerActions = [
    {
      label: 'Create',
      icon: <Plus />,
      onClick: () => navigate(`${prefix}/new`),
      variant: 'create' as const,
    },
    ...(editable
      ? [
          {
            label: 'Edit',
            icon: <Pencil />,
            onClick: () => navigate(`${prefix}/${id}/edit`),
            variant: 'edit' as const,
          },
        ]
      : []),
    {
      label: 'Reports',
      icon: <FileText />,
      onClick: () => navigate(`/reports/catalog?context=job&job_id=${encodeURIComponent(id)}`),
      variant: 'report' as const,
    },
  ];

  const continuumSteps = buildFclContinuumSteps({
    partyId: job.shipper_id || job.billing_party_id,
    enquiryId: resolvedEnquiryId,
    quotationId: resolvedQuotationId,
    verified: true,
    approved: true,
    shipmentId: resolvedShipmentId,
    jobId: job.id,
    jobHref: jobDetailPath(job),
  });

  const enquiryHref = resolvedEnquiryId ? `/sales/enquiries/${resolvedEnquiryId}` : undefined;
  const quotationHref = resolvedQuotationId ? `/quotations/${resolvedQuotationId}` : undefined;
  const shipmentHref = resolvedShipmentId
    ? `/operations/shipments/${resolvedShipmentId}`
    : undefined;

  return (
    <>
      <OpsContinuumRail
        entityType="JOB"
        entityId={job.id}
        pathHints={['ops_continuum']}
        opsContinuum={job.ops_continuum}
        actions={job.actions as Record<string, unknown> | undefined}
        links={{
          enquiryId: resolvedEnquiryId,
          quotationId: resolvedQuotationId,
          shipmentId: resolvedShipmentId,
          jobId: job.id,
        }}
      />
      <DetailPageTemplate
        reserveContinuumRail
        eyebrow="Job details"
        title={jobDisplayNumber(job)}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <OperationTypeBadge code={job.job_type} />
            {shipperLabel && shipperLabel !== '—' ? <span>{shipperLabel}</span> : null}
          </span>
        }
        statusLabel={JOB_STATUS_LABELS[job.status] ?? job.status}
        statusTone={statusTone(job.status)}
        tabs={tabs}
        defaultTab={defaultTab}
        actions={headerActions}
        actionsDisabled={pending || actions.cancel.isPending || actions.close.isPending}
        onBack={() => navigate(prefix)}
        backLabel={`${segmentLabel} jobs`}
        banner={
          (actionError || costingWarningMessage || actionMessage) ? (
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
                  {actionMessage}
                </div>
              )}
            </div>
          ) : null
        }
        detailTitle="Job detail"
        detailSection={
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            <FresaReadonlyField label="Job No" value={jobDisplayNumber(job)} />
            <FresaReadonlyField
              label="Client"
              value={shipperLabel}
              href={
                job.shipper_id && isUuid(job.shipper_id) ? `/parties/${job.shipper_id}` : undefined
              }
            />
            <OptionalFresaField label="Consignee" value={consigneeLabel !== '—' ? consigneeLabel : undefined} />
            <FresaReadonlyField
              label="Department"
              value={
                departmentLabel !== '—'
                  ? departmentLabel
                  : job.job_type?.replaceAll('_', ' ')
              }
            />
            <OptionalFresaField label="Branch" value={branchLabel !== '—' ? branchLabel : undefined} />
            <FresaReadonlyField label="Status" value={JOB_STATUS_LABELS[job.status] ?? job.status} />
            {enquiryHref ? (
              <FresaReadonlyField
                label="Enquiry No"
                value={enquiryNumber || 'View enquiry'}
                href={enquiryHref}
              />
            ) : null}
            {quotationHref ? (
              <FresaReadonlyField
                label="Quotation No"
                value={quotationNumber || 'View quotation'}
                href={quotationHref}
              />
            ) : null}
            {shipmentHref ? (
              <FresaReadonlyField
                label="Shipment No"
                value={shipmentNumber || 'View shipment'}
                href={shipmentHref}
              />
            ) : null}
            <OptionalFresaField label="POL" value={originLabel !== '—' ? originLabel : undefined} />
            <OptionalFresaField
              label="POD"
              value={destinationLabel !== '—' ? destinationLabel : undefined}
            />
            <OptionalFresaField label="ETD" value={formatDetailDate(job.etd) || job.etd} />
            <OptionalFresaField label="ETA" value={formatDetailDate(job.eta) || job.eta} />
            <OptionalFresaField label="Incoterms" value={job.incoterms} />
            <OptionalFresaField label="Commodity" value={job.commodity} />
            <OptionalFresaField
              label="Commodity description"
              value={job.commodity_description}
            />
            <OptionalFresaField label="Currency" value={job.currency_code} />
            <OptionalFresaField
              label={
                job.client_reference_type?.trim()
                  ? `Client ref (${job.client_reference_type})`
                  : 'Client ref'
              }
              value={job.client_reference_no}
            />
            <OptionalFresaField
              label="Agent"
              value={agentLabel !== '—' ? agentLabel : undefined}
            />
            <OptionalFresaField
              label="Salesperson"
              value={salespersonLabel !== '—' ? salespersonLabel : undefined}
            />
            <OptionalFresaField label="HS code" value={job.hs_code} />
            <OptionalFresaField label="Pieces" value={job.pieces} />
            <OptionalFresaField label="Gross weight" value={job.gross_weight} />
            <OptionalFresaField label="Chargeable weight" value={job.chargeable_weight} />
            <OptionalFresaField label="Volume (CBM)" value={job.volume_cbm} />
            <OptionalFresaField label="Container count" value={job.container_count} />
            <OptionalFresaField
              label="Dangerous goods"
              value={
                job.is_dg
                  ? `Yes${job.dg_class ? ` (${job.dg_class})` : ''}`
                  : undefined
              }
            />
            <OptionalFresaField
              label="Airline"
              value={airlineLabel !== '—' ? airlineLabel : undefined}
            />
            <OptionalFresaField label="HAWB" value={job.air_details?.hawb_number} />
            <OptionalFresaField label="MAWB" value={job.air_details?.mawb_number} />
            <OptionalFresaField label="Flight" value={job.air_details?.flight_number} />
            <OptionalFresaField
              label="Shipping line"
              value={shippingLineLabel !== '—' ? shippingLineLabel : undefined}
            />
            <OptionalFresaField
              label="Vessel"
              value={vesselLabel !== '—' ? vesselLabel : undefined}
            />
            <OptionalFresaField
              label="Voyage"
              value={
                job.sea_fcl_details?.voyage_number || job.sea_lcl_details?.voyage_number
              }
            />
            <OptionalFresaField
              label="HBL"
              value={job.sea_fcl_details?.hbl_number || job.sea_lcl_details?.hbl_number}
            />
            <OptionalFresaField
              label="MBL"
              value={job.sea_fcl_details?.mbl_number || job.sea_lcl_details?.mbl_number}
            />
            <OptionalFresaField
              label="Carrier booking ref"
              value={
                job.sea_fcl_details?.carrier_booking_ref ||
                job.sea_lcl_details?.carrier_booking_ref
              }
            />
            <OptionalFresaField label="Customer remarks" value={job.customer_remarks} />
            <OptionalFresaField label="Notes" value={job.notes} />
            <OptionalFresaField label="Job date" value={formatDetailDate(job.job_date) || job.job_date} />
            <OptionalFresaField label="Service scope" value={job.service_scope} />
            <OptionalFresaField label="Cargo category" value={job.cargo_category} />
            <OptionalFresaField label="Origin door" value={job.origin_door_address} />
            <OptionalFresaField label="Dest door" value={job.dest_door_address} />
          </div>
        }
        afterDetail={
          <>
            <div className="flex flex-wrap items-center gap-2">
              <FclContinuumRail steps={continuumSteps} />
              <FavouriteToggle
                kind="job"
                targetKey={job.id}
                label={jobDisplayNumber(job)}
              />
            </div>
            <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-[13px]">
              <span className="font-semibold text-[var(--fresa-header-text,#0A2942)]">Related: </span>
              {enquiryHref ? (
                <Link
                  className="mr-3 font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                  to={enquiryHref}
                >
                  Enquiry{enquiryNumber ? ` ${enquiryNumber}` : ''}
                </Link>
              ) : null}
              {quotationHref ? (
                <Link
                  className="mr-3 font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                  to={quotationHref}
                >
                  Quotation{quotationNumber ? ` ${quotationNumber}` : ''}
                </Link>
              ) : null}
              {shipmentHref ? (
                <Link
                  className="mr-3 font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                  to={shipmentHref}
                >
                  Shipment{shipmentNumber ? ` ${shipmentNumber}` : ''}
                </Link>
              ) : null}
              {!enquiryHref && !quotationHref && !shipmentHref ? (
                <span className="text-[#64748b]">No linked continuum records</span>
              ) : null}
              <span className="text-[#64748b]"> · {job.job_type?.replaceAll('_', ' ')}</span>
            </div>
          </>
        }
        toolbarLabel="Actions"
        toolbar={
          <>
            {canChangeStatus ? (
              <Button
                size="sm"
                type="button"
                variant="warning"
                leftIcon={<RefreshCw />}
                disabled={pending || actions.changeStatus.isPending}
                onClick={() => {
                  setChangeStatusValue(job.status || 'IN_PROGRESS');
                  setChangeStatusReason('');
                  setChangeStatusOpen(true);
                }}
              >
                Change Status
              </Button>
            ) : null}
            {canStop ? (
              <Button
                size="sm"
                type="button"
                variant="warning"
                leftIcon={<PauseCircle />}
                disabled={pending || actions.stop.isPending}
                onClick={() => {
                  setStopReason('');
                  setStopOpen(true);
                }}
              >
                Stop / On hold
              </Button>
            ) : null}
            {canReopen ? (
              <Button
                size="sm"
                type="button"
                variant="report"
                leftIcon={<RotateCcw />}
                disabled={pending || actions.reopen.isPending}
                onClick={() => {
                  setReopenStatus('IN_PROGRESS');
                  setReopenReason('');
                  setReopenOpen(true);
                }}
              >
                Reopen
              </Button>
            ) : null}
            {canEditClosedDelivery ? (
              <Button
                size="sm"
                type="button"
                variant="create"
                leftIcon={<Pencil />}
                disabled={pending || actions.patchClosedOverrides.isPending}
                onClick={() => {
                  setClosedDeliveryDate('');
                  setClosedDoRemarks('');
                  setClosedReturnToTerminal('');
                  setClosedLoadOnboard('');
                  setClosedCommodityNote('');
                  setClosedOverrideReason('');
                  setClosedOverridesOpen(true);
                }}
              >
                Closed overrides
              </Button>
            ) : null}
            <Button
              size="sm"
              type="button"
              variant="report"
              leftIcon={<Radio />}
              disabled={pending}
              onClick={() => setEdiOpen(true)}
            >
              Generate EDI
            </Button>
            {(job.path_hints?.includes('job_not_invoiced_do') ||
              job.path_hints?.includes('job_finance_report') ||
              !job.path_hints?.length) && (
              <Button
                size="sm"
                type="button"
                variant="report"
                leftIcon={<FileText />}
                onClick={() => navigate('/operations/reports')}
              >
                Ops reports
              </Button>
            )}
            {canClose ? (
              <Button
                size="sm"
                type="button"
                variant="success"
                leftIcon={<CheckCircle2 />}
                disabled={pending || actions.close.isPending}
                onClick={() => requestConfirm('close', job)}
              >
                Close job
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                size="sm"
                type="button"
                variant="danger"
                leftIcon={<X />}
                disabled={pending || actions.cancel.isPending}
                onClick={() => requestConfirm('cancel', job)}
              >
                Cancel job
              </Button>
            ) : null}
            {canCopy ? (
              <Button
                size="sm"
                type="button"
                variant="success"
                leftIcon={<Copy />}
                disabled={pending || actions.copy.isPending}
                onClick={() =>
                  void run(async () => {
                    const copied = await actions.copy.mutateAsync();
                    if (copied?.id && isUuid(copied.id)) {
                      navigate(jobDetailPath(copied));
                    }
                    return copied;
                  }, 'Job copied.')
                }
              >
                Copy
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                size="sm"
                type="button"
                variant="danger"
                leftIcon={<Trash2 />}
                disabled={pending}
                onClick={() => requestConfirm('delete', job)}
              >
                Delete
              </Button>
            ) : null}
            {actionPanels.map((key) => (
              <Button
                key={key}
                size="sm"
                type="button"
                variant="secondary"
                style={{
                  ...JOB_ACTION_BUTTON_STYLE[key],
                  borderWidth: 1,
                  borderStyle: 'solid',
                }}
                onClick={() => setActionPanel(key)}
              >
                {key === 'house'
                  ? `House jobs (${houseJobs.length})`
                  : jobActionPanelLabel(key)}
              </Button>
            ))}
          </>
        }
      />

      {actionPanel ? (
        <Modal
          open
          size="xl"
          title={
            actionPanel === 'house'
              ? `House jobs (${houseJobs.length})`
              : jobActionPanelLabel(actionPanel)
          }
          onClose={() => setActionPanel(null)}
          footer={
            <Button type="button" size="sm" variant="secondary" onClick={() => setActionPanel(null)}>
              Close
            </Button>
          }
        >
          <JobActionPanelContent
            panel={actionPanel}
            job={job}
            jobId={id}
            houseJobs={houseJobs}
            highlightInvoiceId={highlightInvoiceId}
            lifecycleLinks={{
              enquiryId: resolvedEnquiryId,
              quotationId: resolvedQuotationId,
              shipmentId: resolvedShipmentId,
              jobId: job.id,
            }}
            onOpenHouse={(houseId) => {
              setActionPanel(null);
              navigate(`${prefix}/${houseId}`);
            }}
          />
        </Modal>
      ) : null}

      {confirm && (
        <JobConfirmModal
          open
          action={confirm.action}
          job={confirm.job}
          isPending={pending}
          onClose={closeConfirm}
          onConfirm={() => {
            if (confirm.action === 'cancel') {
              return run(() => actions.cancel.mutateAsync(), 'Job cancelled.');
            }
            if (confirm.action === 'close') {
              return run(() => actions.close.mutateAsync(), 'Job closed.');
            }
            return run(() => actions.remove.mutateAsync(), 'Job deleted.', true);
          }}
        />
      )}

      {changeStatusOpen ? (
        <Modal
          open
          onClose={() => !pending && setChangeStatusOpen(false)}
          title="Change job status"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => setChangeStatusOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="warning"
                leftIcon={<RefreshCw />}
                disabled={pending || !changeStatusValue}
                onClick={() =>
                  void run(async () => {
                    const result = await actions.changeStatus.mutateAsync({
                      status: changeStatusValue,
                      ...(changeStatusReason.trim()
                        ? { reason: changeStatusReason.trim() }
                        : {}),
                    });
                    setChangeStatusOpen(false);
                    return result;
                  }, `Status changed to ${changeStatusValue}.`)
                }
              >
                {pending ? 'Saving…' : 'Save status'}
              </Button>
            </div>
          }
        >
          <p className="mb-3 text-[13px] text-[#475569]">
            Any catalog status can be set anytime (no transition graph). Warnings may be returned.
          </p>
          <label className="mb-3 block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Status</span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={changeStatusValue}
              onChange={(e) => setChangeStatusValue(e.target.value)}
            >
              {statusCatalog.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.group ? `${opt.group}: ${opt.label}` : opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Reason (optional)</span>
            <input
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={changeStatusReason}
              onChange={(e) => setChangeStatusReason(e.target.value)}
              maxLength={500}
            />
          </label>
        </Modal>
      ) : null}

      {closedOverridesOpen ? (
        <Modal
          open
          onClose={() => !pending && setClosedOverridesOpen(false)}
          title="Closed job overrides"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => setClosedOverridesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="edit"
                disabled={pending}
                onClick={() =>
                  void run(async () => {
                    await actions.patchClosedOverrides.mutateAsync({
                      ...(closedDeliveryDate.trim()
                        ? { delivery_date: closedDeliveryDate.trim() }
                        : {}),
                      ...(closedDoRemarks.trim()
                        ? { do_remarks: closedDoRemarks.trim() }
                        : {}),
                      ...(closedReturnToTerminal.trim()
                        ? { return_to_terminal: closedReturnToTerminal.trim() }
                        : {}),
                      ...(closedLoadOnboard.trim()
                        ? { load_onboard: closedLoadOnboard.trim() }
                        : {}),
                      ...(closedCommodityNote.trim()
                        ? { commodity_note: closedCommodityNote.trim() }
                        : {}),
                      ...(closedOverrideReason.trim()
                        ? { reason: closedOverrideReason.trim() }
                        : {}),
                    });
                    setClosedOverridesOpen(false);
                  }, 'Closed overrides saved.')
                }
              >
                {pending ? 'Saving…' : 'Save overrides'}
              </Button>
            </div>
          }
        >
          <p className="mb-3 text-[12px] text-[#64748b]">
            Allowlisted fields only while the job remains closed (delivery dates, DO remarks,
            return-to-terminal, load-onboard, commodity note).
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[13px]">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">
                Delivery date
              </span>
              <input
                type="date"
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={closedDeliveryDate}
                onChange={(e) => setClosedDeliveryDate(e.target.value)}
              />
            </label>
            <label className="block text-[13px] sm:col-span-2">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">DO remarks</span>
              <input
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={closedDoRemarks}
                onChange={(e) => setClosedDoRemarks(e.target.value)}
              />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">
                Return to terminal
              </span>
              <input
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={closedReturnToTerminal}
                onChange={(e) => setClosedReturnToTerminal(e.target.value)}
              />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">Load onboard</span>
              <input
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={closedLoadOnboard}
                onChange={(e) => setClosedLoadOnboard(e.target.value)}
              />
            </label>
            <label className="block text-[13px] sm:col-span-2">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">
                Commodity note
              </span>
              <input
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={closedCommodityNote}
                onChange={(e) => setClosedCommodityNote(e.target.value)}
              />
            </label>
            <label className="block text-[13px] sm:col-span-2">
              <span className="mb-1 block text-[12px] font-medium text-[#334155]">
                Reason (optional)
              </span>
              <input
                className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
                value={closedOverrideReason}
                onChange={(e) => setClosedOverrideReason(e.target.value)}
                maxLength={500}
              />
            </label>
          </div>
        </Modal>
      ) : null}

      {reopenOpen ? (
        <Modal
          open
          onClose={() => !pending && setReopenOpen(false)}
          title="Reopen job"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => setReopenOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="report"
                leftIcon={<RotateCcw />}
                disabled={pending}
                onClick={() =>
                  void run(async () => {
                    await actions.reopen.mutateAsync({
                      status: reopenStatus,
                      ...(reopenReason.trim() ? { reason: reopenReason.trim() } : {}),
                    });
                    setReopenOpen(false);
                  }, 'Job reopened.')
                }
              >
                {pending ? 'Reopening…' : 'Reopen'}
              </Button>
            </div>
          }
        >
          <label className="mb-3 block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Target status</span>
            <select
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={reopenStatus}
              onChange={(e) => setReopenStatus(e.target.value)}
            >
              {statusCatalog
                .filter((o) => !['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(o.value))
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Reason (optional)</span>
            <input
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              maxLength={500}
            />
          </label>
        </Modal>
      ) : null}

      {stopOpen ? (
        <Modal
          open
          onClose={() => !pending && setStopOpen(false)}
          title="Stop job (ON_HOLD)"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => setStopOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                variant="edit"
                leftIcon={<PauseCircle />}
                disabled={pending}
                onClick={() =>
                  void run(async () => {
                    await actions.stop.mutateAsync({
                      ...(stopReason.trim() ? { reason: stopReason.trim() } : {}),
                    });
                    setStopOpen(false);
                  }, 'Job put on hold.')
                }
              >
                {pending ? 'Stopping…' : 'Stop'}
              </Button>
            </div>
          }
        >
          <label className="block text-[13px]">
            <span className="mb-1 block text-[12px] font-medium text-[#334155]">Reason (optional)</span>
            <input
              className="h-8 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 text-[13px]"
              value={stopReason}
              onChange={(e) => setStopReason(e.target.value)}
              maxLength={500}
            />
          </label>
        </Modal>
      ) : null}

      {ediOpen ? (
        <Modal
          open
          onClose={() =>
            !actions.generateJobEdi.isPending &&
            !actions.downloadJobEdiSubmission.isPending &&
            setEdiOpen(false)
          }
          title="Generate EDI"
          size="lg"
          footer={
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setEdiOpen(false)}
              >
                Close
              </Button>
            </div>
          }
        >
          <GenerateEdiPanel
            typesRaw={jobEdiTypesQuery.data}
            typesLoading={jobEdiTypesQuery.isLoading}
            submissionsRaw={jobEdiSubmissionsQuery.data}
            submissionsLoading={jobEdiSubmissionsQuery.isLoading}
            generatePending={actions.generateJobEdi.isPending}
            downloadPending={actions.downloadJobEdiSubmission.isPending}
            onGenerate={(edi_type) =>
              actions.generateJobEdi.mutateAsync({ edi_type })
            }
            onDownload={(submissionId) =>
              actions.downloadJobEdiSubmission.mutateAsync(submissionId)
            }
            onChanged={() => {
              void jobEdiSubmissionsQuery.refetch();
              void refetch();
            }}
          />
        </Modal>
      ) : null}
    </>
  );
}
