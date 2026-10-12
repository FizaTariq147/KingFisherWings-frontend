import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  FileText,
  PauseCircle,
  Pencil,
  Plus,
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
import { erpForm } from '@/lib/erpForm';
import { JobBillsOfLadingPanel } from '../components/JobBillsOfLadingPanel';
import { JobCargoPanel } from '../components/JobCargoPanel';
import { JobChargesPanel } from '../components/JobChargesPanel';
import { JobConfirmModal } from '../components/JobConfirmModal';
import { JobContainersPanel } from '../components/JobContainersPanel';
import { JobDimensionsPanel } from '../components/JobDimensionsPanel/JobDimensionsPanel';
import { JobDocumentsPanel } from '../components/JobDocumentsPanel';
import { JobGpumPanel } from '../components/JobGpumPanel/JobGpumPanel';
import { JobInvoicesPanel } from '../components/JobInvoicesPanel';
import { JobSeaScansPanel } from '../components/JobSeaScansPanel';
import { JobLogisticsPanel } from '../components/JobLogisticsPanel';
import { JobMilestonesPanel } from '../components/JobMilestonesPanel';
import { JobNotesPanel } from '../components/JobNotesPanel';
import { JobOpsPanel } from '../components/JobOpsPanel';
import { JobPartyPanel } from '../components/JobPartyPanel/JobPartyPanel';
import { JobOverviewPanel } from '../components/JobOverviewPanel';
import { JobBarcodePanel } from '../components/JobBarcodePanel';
import { JobPnlPanel } from '../components/JobPnlPanel';
import { JobStuffingPanel } from '../components/JobStuffingPanel';
import { JobVendorOffersPanel } from '@/features/vendor-job-offers/components/JobVendorOffersPanel';
import { CcChecklistPanel } from '@/features/customs-clearance/components/CcChecklistPanel';
import { CcDeclarationPanel } from '@/features/customs-clearance/components/CcDeclarationPanel';
import { CcDetailsPanel } from '@/features/customs-clearance/components/CcDetailsPanel';
import { CcFinancePanel } from '@/features/customs-clearance/components/CcFinancePanel';
import { CcLinesPanel } from '@/features/customs-clearance/components/CcLinesPanel';
import { CcQueriesPanel } from '@/features/customs-clearance/components/CcQueriesPanel';
import { isCcJobType } from '@/features/customs-clearance/constants/ccWorkflow';
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
import { useJobResolvedLabels } from '../hooks/useJobResolvedLabels';
import { useJob, useJobHouseJobs, useJobStatusOptions } from '../hooks/useJobs';
import { getErrorMessage } from '../utils/getErrorMessage';
import { jobShouldOpenOpsTab } from '../hooks/useStaffBookingForm';
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

function isSeaFcl(jobType: string): boolean {
  return jobType === 'SEA_FCL_EXPORT' || jobType === 'SEA_FCL_IMPORT';
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
  const [stopOpen, setStopOpen] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const statusOptionsQuery = useJobStatusOptions(id, Boolean(id));

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

  const defaultTab = useMemo(() => {
    const fromQuery = new URLSearchParams(location.search).get('tab');
    if (fromQuery) return fromQuery;
    const state = location.state as { openTab?: string } | null;
    if (state?.openTab) return state.openTab;
    // After quote convert: open Ops for modes with staff booking / air forms.
    if (job && jobShouldOpenOpsTab(job.job_type)) return 'ops';
    return undefined;
  }, [location.search, location.state, job]);

  const tabs = useMemo(() => {
    if (!job) return [];
    const sea = isSeaFcl(job.job_type);
    const isCc = isCcJobType(job.job_type);
    return [
      {
        key: 'overview',
        label: 'Overview',
        content: (
          <div className="space-y-4">
            <JobOverviewPanel job={job} />
            <JobBarcodePanel job={job} />
          </div>
        ),
      },
      { key: 'ops', label: 'Ops / Mode', content: <JobOpsPanel job={job} /> },
      {
        key: 'party',
        label: 'Party',
        content: <JobPartyPanel job={job} onChanged={() => refetch()} />,
      },
      {
        key: 'dimensions',
        label: 'Dimensions',
        content: <JobDimensionsPanel job={job} onChanged={() => refetch()} />,
      },
      {
        key: 'gpum',
        label: 'GPUM',
        content: <JobGpumPanel jobId={id} onChanged={() => refetch()} />,
      },
      ...(isCc
        ? [
            { key: 'cc-details', label: 'CC Details', content: <CcDetailsPanel jobId={id} /> },
            { key: 'cc-lines', label: 'CC Lines', content: <CcLinesPanel jobId={id} /> },
            {
              key: 'cc-checklist',
              label: 'Checklist',
              content: <CcChecklistPanel jobId={id} />,
            },
            {
              key: 'cc-declaration',
              label: 'Declaration',
              content: <CcDeclarationPanel jobId={id} />,
            },
            { key: 'cc-queries', label: 'Queries', content: <CcQueriesPanel jobId={id} /> },
            { key: 'cc-finance', label: 'CC Finance', content: <CcFinancePanel jobId={id} /> },
          ]
        : []),
      ...(sea
        ? [
            { key: 'containers', label: 'Containers', content: <JobContainersPanel jobId={id} /> },
            { key: 'cargo', label: 'Cargo', content: <JobCargoPanel jobId={id} /> },
            { key: 'bl', label: 'Bills of lading', content: <JobBillsOfLadingPanel jobId={id} /> },
            { key: 'stuffing', label: 'Stuffing', content: <JobStuffingPanel jobId={id} /> },
          ]
        : []),
      ...(job.job_type.includes('SEA') || job.job_type.includes('NVOCC')
        ? [{ key: 'sea-scans', label: 'Sea scans', content: <JobSeaScansPanel jobId={id} /> }]
        : []),
      {
        key: 'charges',
        label: 'Charges',
        content: <JobChargesPanel job={job} onChanged={() => refetch()} />,
      },
      {
        key: 'invoices',
        label: 'Invoices',
        content: <JobInvoicesPanel jobId={id} job={job} highlightInvoiceId={highlightInvoiceId} />,
      },
      { key: 'pnl', label: 'P&L', content: <JobPnlPanel jobId={id} /> },
      { key: 'milestones', label: 'Milestones', content: <JobMilestonesPanel jobId={id} /> },
      { key: 'notes', label: 'Notes', content: <JobNotesPanel jobId={id} /> },
      {
        key: 'vendor-offers',
        label: 'Vendor offers',
        content: <JobVendorOffersPanel jobId={id} currencyCode={job.currency_code} />,
      },
      { key: 'documents', label: 'Documents', content: <JobDocumentsPanel jobId={id} jobType={job.job_type} /> },
      {
        key: 'logistics',
        label: 'Logistics',
        content: <JobLogisticsPanel jobId={id} jobType={job.job_type} />,
      },
      ...(houseJobs.length
        ? [
            {
              key: 'house',
              label: `House jobs (${houseJobs.length})`,
              content: (
                <ul className="space-y-2 text-sm">
                  {houseJobs.map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        className="underline text-[var(--color-primary-600)]"
                        onClick={() => navigate(`${prefix}/${h.id}`)}
                      >
                        {jobDisplayNumber(h)}
                      </button>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]
        : []),
    ];
  }, [job, id, houseJobs, prefix, navigate, refetch, highlightInvoiceId]);

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

  const editable = jobEditable(job.status);
  const canDelete = job.status === 'COMPLETED' || job.status === 'CANCELLED';
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
  const canClose = fclActions?.can_close !== false && editable;
  const canCancel = fclActions?.can_cancel !== false && editable;
  const statusCatalog =
    statusOptionsQuery.data?.length
      ? statusOptionsQuery.data
      : JOB_STATUSES.map((s) => ({
          value: s,
          label: JOB_STATUS_LABELS[s] ?? s,
        }));

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
    enquiryId: job.enquiry_id,
    quotationId: job.quotation_id,
    verified: true,
    approved: true,
    shipmentId: job.shipment_id,
    jobId: job.id,
    jobHref: jobDetailPath(job),
  });

  const enquiryHref =
    job.enquiry_id && isUuid(job.enquiry_id) ? `/sales/enquiries/${job.enquiry_id}` : undefined;
  const quotationHref =
    job.quotation_id && isUuid(job.quotation_id) ? `/quotations/${job.quotation_id}` : undefined;
  const shipmentHref =
    job.shipment_id && isUuid(job.shipment_id)
      ? `/operations/shipments/${job.shipment_id}`
      : undefined;

  return (
    <>
      <DetailPageTemplate
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
                    {actionMessage}
                  </div>
                )}
              </div>
            )}
            <FclContinuumRail steps={continuumSteps} />
            <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-[13px]">
              <span className="font-semibold text-[var(--fresa-header-text,#0A2942)]">Related: </span>
              {enquiryHref ? (
                <Link
                  className="mr-3 font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                  to={enquiryHref}
                >
                  Enquiry
                </Link>
              ) : null}
              {quotationHref ? (
                <Link
                  className="mr-3 font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                  to={quotationHref}
                >
                  Quotation
                </Link>
              ) : null}
              {shipmentHref ? (
                <Link
                  className="mr-3 font-medium text-[var(--fresa-action,#0A2942)] hover:underline"
                  to={shipmentHref}
                >
                  Shipment
                </Link>
              ) : null}
              {!enquiryHref && !quotationHref && !shipmentHref ? (
                <span className="text-[#64748b]">No linked continuum records</span>
              ) : null}
              <span className="text-[#64748b]"> · {job.job_type?.replaceAll('_', ' ')}</span>
            </div>
          </>
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
            <FresaReadonlyField label="Consignee" value={consigneeLabel} />
            <FresaReadonlyField label="Department" value={job.job_type?.replaceAll('_', ' ')} />
            <FresaReadonlyField label="Branch" value={branchLabel} />
            <FresaReadonlyField label="Status" value={JOB_STATUS_LABELS[job.status] ?? job.status} />
            <FresaReadonlyField label="Enquiry No" value={enquiryHref ? 'View enquiry' : undefined} href={enquiryHref} />
            <FresaReadonlyField
              label="Quotation No"
              value={quotationHref ? 'View quotation' : undefined}
              href={quotationHref}
            />
            <FresaReadonlyField
              label="Shipment No"
              value={shipmentHref ? 'View shipment' : undefined}
              href={shipmentHref}
            />
            <FresaReadonlyField label="POL" value={originLabel} />
            <FresaReadonlyField label="POD" value={destinationLabel} />
            <FresaReadonlyField label="Incoterms" value={job.incoterms} />
            <FresaReadonlyField label="Commodity" value={job.commodity} />
            <FresaReadonlyField label="Currency" value={job.currency_code} />
          </div>
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
                variant="edit"
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
            {!canChangeStatus &&
            !canStop &&
            !canReopen &&
            !canClose &&
            !canCancel &&
            !canDelete ? (
              <span className="text-[12px] text-[var(--color-neutral-500)]">
                No actions available for this job status.
              </span>
            ) : null}
          </>
        }
      />
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
    </>
  );
}
