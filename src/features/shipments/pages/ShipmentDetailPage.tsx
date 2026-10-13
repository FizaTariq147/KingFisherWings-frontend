import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart2,
  Briefcase,
  Building2,
  Check,
  Copy,
  ExternalLink,
  FileCheck,
  FileText,
  Layers,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Split,
  X,
} from 'lucide-react';
import { OperationTypeBadge, StatusBadge } from '@/components/erp';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { appType } from '@/lib/erpTypography';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { buildFclContinuumSteps } from '@/features/shared/continuum/buildFclContinuumSteps';
import { FclContinuumRail } from '@/features/shared/continuum/FclContinuumRail';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import { cn } from '@/lib/utils';
import {
  isShipmentShowAllTab,
  SHIPMENT_DETAIL_TABS,
  SHIPMENT_SHOW_ALL_TAB,
} from '../api/shipment.api';
import { ShipmentTabPanel } from '../components/ShipmentTabPanel';
import { useShipmentPaths } from '../hooks/useShipmentPaths';
import { useShipmentResolvedLabels } from '../hooks/useShipmentResolvedLabels';
import {
  useChangeShipmentBlStatus,
  useChangeShipmentDepartment,
  useChangeShipmentStatus,
  useCopyShipment,
  useGenerateShipmentJob,
  useQueueShipmentBookingConfirmation,
  useShipment,
  useShipmentCreateSubmaster,
  useShipmentKpi,
  useShipmentTracking,
  useSplitShipment,
  useUpdateShipment,
} from '../hooks/useShipments';
import { useShipmentsPermissions } from '../hooks/useShipmentsPermissions';
import {
  SHIPMENT_BL_STATUSES,
  SHIPMENT_STATUSES,
  type Shipment,
} from '../types/shipment.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { shipmentDisplayNumber } from '../utils/normalizeShipment';

function displayValue(value?: string | number | null): string | undefined {
  if (value == null || value === '') return undefined;
  const text = String(value).trim();
  if (!text || isUuid(text)) return undefined;
  return text;
}

/** Fresa-style label + readonly box (matches shipment detail screenshots). */
function FresaReadonlyField({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | number | null;
  href?: string;
}) {
  const shown = displayValue(value) ?? '—';
  return (
    <div className="min-w-0">
      <div className={erpForm.label}>{label}</div>
      <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[13px] text-[#0f172a]">
        {href && shown !== '—' ? (
          <Link className="truncate font-medium text-[var(--color-primary-700)] hover:underline" to={href}>
            {shown}
          </Link>
        ) : (
          <span className="truncate">{shown}</span>
        )}
      </div>
    </div>
  );
}

function tabLabel(key: string, label?: string): string {
  if (isShipmentShowAllTab(key) || (label && isShipmentShowAllTab(label))) return 'Show All';
  const norm = key.trim().toLowerCase().replace(/_/g, '-');
  const labelNorm = (label || '').trim().toLowerCase().replace(/_/g, '-');
  if (norm === 'information' || norm === 'info') return 'Info';
  /** Continuum term is Party (backend tab key may still be organization). */
  if (
    norm === 'organization' ||
    norm === 'organisation' ||
    labelNorm === 'organization' ||
    labelNorm === 'organisation'
  ) {
    return 'Party';
  }
  if (norm === 'planned-containers' || norm === 'planned-consignment') return 'Planned containers';
  if (norm === 'actual-containers' || norm === 'actual-consignment') return 'Actual containers';
  return (label || key).trim().replace(/[-_]/g, ' ');
}

/** Always expose Show All first; keep backend tabs (deduped) then known defaults. */
function defaultTabs(shipment: Shipment): { key: string; label: string }[] {
  const fromApi = (shipment.tabs ?? []).map((t) => ({
    key: t.key,
    label: tabLabel(t.key, t.label),
  }));
  const fallback = SHIPMENT_DETAIL_TABS.map((key) => ({
    key,
    label: tabLabel(key),
  }));
  const merged = [...fromApi, ...fallback];
  const seen = new Set<string>();
  const tabs: { key: string; label: string }[] = [
    { key: SHIPMENT_SHOW_ALL_TAB, label: 'Show All' },
  ];
  seen.add(SHIPMENT_SHOW_ALL_TAB);
  for (const t of merged) {
    const norm = t.key.trim().toLowerCase().replace(/_/g, '-');
    if (isShipmentShowAllTab(t.key) || seen.has(norm) || seen.has(t.key)) continue;
    seen.add(norm);
    seen.add(t.key);
    tabs.push({ key: t.key, label: t.label });
  }
  return tabs;
}

type ConfirmKind =
  | 'generate-job'
  | 'copy'
  | 'split'
  | 'create-submaster'
  | 'change-status'
  | 'change-bl-status'
  | 'change-department';

export default function ShipmentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const paths = useShipmentPaths();
  const perms = useShipmentsPermissions();
  const query = useShipment(id);
  const generateJob = useGenerateShipmentJob(id);
  const copyShipment = useCopyShipment(id);
  const updateShipment = useUpdateShipment(id);
  const queueBookingConfirmation = useQueueShipmentBookingConfirmation(id);
  const splitShipment = useSplitShipment(id);
  const changeStatus = useChangeShipmentStatus(id);
  const changeBlStatus = useChangeShipmentBlStatus(id);
  const changeDepartment = useChangeShipmentDepartment(id);
  const createSubmaster = useShipmentCreateSubmaster(id);

  const infoRef = useRef<HTMLElement>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [statusValue, setStatusValue] = useState('');
  const [blStatusValue, setBlStatusValue] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [activeTab, setActiveTab] = useState<string>(SHIPMENT_SHOW_ALL_TAB);
  const [showKpi, setShowKpi] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [generateJobMode, setGenerateJobMode] = useState<'HOUSE' | 'DIRECT'>('HOUSE');
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({
    commodity: '',
    cargo_details: '',
    incoterms: '',
    freight_payment_type: '',
    currency_code: '',
    mbl_number: '',
    hbl_number: '',
    vessel_name: '',
    voyage_number: '',
  });
  const [reportPending, setReportPending] = useState(false);
  const pendingStartEdit = useRef(
    Boolean((location.state as { startEdit?: boolean } | null)?.startEdit),
  );

  const kpiQuery = useShipmentKpi(id, showKpi);
  const trackingQuery = useShipmentTracking(id, showTracking);

  const shipment = query.data;
  const labels = useShipmentResolvedLabels(shipment);
  const tabs = useMemo(() => (shipment ? defaultTabs(shipment) : []), [shipment]);
  const effectiveTab = tabs.some((t) => t.key === activeTab)
    ? activeTab
    : tabs[0]?.key ?? 'information';

  useEffect(() => {
    if (!(location.state as { startEdit?: boolean } | null)?.startEdit) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!pendingStartEdit.current || !query.data || !perms.canWriteUpdate) return;
    pendingStartEdit.current = false;
    const s = query.data;
    setEditDraft({
      commodity: displayValue(s.commodity) || '',
      cargo_details: displayValue(s.cargo_details) || '',
      incoterms: displayValue(s.incoterms) || '',
      freight_payment_type: displayValue(s.freight_payment_type) || '',
      currency_code: displayValue(s.currency_code) || '',
      mbl_number: displayValue(s.mbl_number) || '',
      hbl_number: displayValue(s.hbl_number) || '',
      vessel_name: displayValue(s.vessel_name) || '',
      voyage_number: displayValue(s.voyage_number) || '',
    });
    setEditing(true);
    window.requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [query.data, perms.canWriteUpdate]);

  if (!perms.canReadApi) {
    return (
      <div className="space-y-3 p-2">
        <p className="text-sm text-[var(--color-danger-700)]">
          Missing permission: shipments.view
        </p>
        <Button
          type="button"
          variant="back"
          leftIcon={<ArrowLeft />}
          onClick={() => navigate(paths.list)}
        >
          Back to shipments
        </Button>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="space-y-2 p-2" aria-busy>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 animate-pulse rounded-sm bg-[#eef2f6]" />
        ))}
      </div>
    );
  }

  if (query.isError || !shipment) {
    const errMsg = getErrorMessage(query.error) || 'Shipment not found.';
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-700)]">{errMsg}</p>
        <Button type="button" variant="secondary" leftIcon={<RefreshCw />} onClick={() => query.refetch()}>
          Retry
        </Button>
        <Button
          type="button"
          variant="back"
          leftIcon={<ArrowLeft />}
          onClick={() => navigate(paths.list)}
        >
          Back to shipments
        </Button>
      </div>
    );
  }

  const jobType = shipment.job_type || shipment.service_type || 'SEA_FCL_EXPORT';
  const hasJob = Boolean(shipment.job_id && isUuid(shipment.job_id));
  const actions = shipment.actions;
  const canGenerateJob =
    perms.canWriteGenerate &&
    !hasJob &&
    (actions == null ? true : actions.can_generate_job === true);
  const canCopy = perms.canWriteCreate && actions?.can_copy !== false;
  const canChangeStatus = perms.canWriteUpdate && actions?.can_change_status !== false;
  const canChangeBl =
    perms.canWriteUpdate &&
    (actions?.can_change_bl_status === true || actions?.can_change_bl_status == null);
  const canChangeDepartment =
    perms.canWriteUpdate && actions?.can_change_department !== false;
  const canSplit = perms.canWriteUpdate && actions?.can_split === true;
  const canSubmaster = perms.canWriteGenerate && actions?.can_create_submaster === true;
  const canKpi = perms.canView && actions?.can_kpi !== false;
  const canTracking = perms.canView && actions?.can_tracking !== false;

  const statusOptions = actions?.allowed_statuses?.length
    ? actions.allowed_statuses
    : [...SHIPMENT_STATUSES];
  const blOptions = actions?.allowed_bl_statuses?.length
    ? actions.allowed_bl_statuses
    : [...SHIPMENT_BL_STATUSES];

  const continuum = buildFclContinuumSteps({
    partyId: shipment.party_id || shipment.customer_id,
    enquiryId: shipment.enquiry_id,
    quotationId: shipment.quotation_id,
    verified: true,
    approved: true,
    shipmentId: shipment.id,
    jobId: shipment.job_id,
    jobHref: shipment.job_id
      ? jobDetailPath({ id: shipment.job_id, job_type: jobType })
      : undefined,
  });

  const anyPending =
    generateJob.isPending ||
    copyShipment.isPending ||
    updateShipment.isPending ||
    queueBookingConfirmation.isPending ||
    splitShipment.isPending ||
    changeStatus.isPending ||
    changeBlStatus.isPending ||
    changeDepartment.isPending ||
    createSubmaster.isPending;

  const run = async (fn: () => Promise<void>) => {
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
      await query.refetch();
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setConfirmKind(null);
    }
  };

  const startEdit = () => {
    if (!perms.canWriteUpdate) {
      setActionError('Missing permission: shipments.update');
      return;
    }
    setEditDraft({
      commodity: displayValue(shipment.commodity) || '',
      cargo_details: displayValue(shipment.cargo_details) || '',
      incoterms: displayValue(shipment.incoterms) || '',
      freight_payment_type: displayValue(shipment.freight_payment_type) || '',
      currency_code: displayValue(shipment.currency_code) || '',
      mbl_number: displayValue(shipment.mbl_number) || '',
      hbl_number: displayValue(shipment.hbl_number) || '',
      vessel_name: displayValue(shipment.vessel_name) || '',
      voyage_number: displayValue(shipment.voyage_number) || '',
    });
    setEditing(true);
    setActionError(null);
    window.requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const saveEdit = async () => {
    setActionError(null);
    setActionMessage(null);
    try {
      await updateShipment.mutateAsync({
        commodity: editDraft.commodity.trim() || undefined,
        // OpenAPI UpdateShipmentDto uses `notes` (not cargo_details)
        notes: editDraft.cargo_details.trim() || undefined,
        incoterms: editDraft.incoterms.trim() || undefined,
        freight_payment_type: editDraft.freight_payment_type.trim() || undefined,
        hbl_number: editDraft.hbl_number.trim() || undefined,
        vessel_name: editDraft.vessel_name.trim() || undefined,
        voyage_number: editDraft.voyage_number.trim() || undefined,
      });
      setEditing(false);
      setActionMessage('Shipment updated.');
      await query.refetch();
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };

  const onReport = async () => {
    setReportPending(true);
    setActionError(null);
    setActionMessage(null);
    try {
      if (hasJob) {
        await queueBookingConfirmation.mutateAsync();
        setActionMessage('Booking confirmation PDF queued (POST /shipments/:id/documents/booking-confirmation).');
      } else {
        navigate(
          `/reports/catalog?family=shipment&context=shipment&shipment_id=${encodeURIComponent(id)}`,
        );
      }
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setReportPending(false);
    }
  };

  const jobHref =
    hasJob && shipment.job_id
      ? jobDetailPath({ id: shipment.job_id, job_type: jobType })
      : undefined;

  return (
    <div className="space-y-2.5 bg-[var(--fresa-page-bg,#F4F6F9)] -mx-1 px-1 pb-4">
      {/* ── Fresa main chrome: title + Create / Edit / Report / Back ── */}
      <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              Shipment details
            </p>
            <h1 className={`mt-0.5 ${appType.pageTitle}`}>{shipmentDisplayNumber(shipment)}</h1>
            <p className={`${appType.pageSubtitle} mt-1`}>
              <span className="inline-flex flex-wrap items-center gap-2">
                <OperationTypeBadge code={jobType} />
                <StatusBadge status={shipment.status} />
                {shipment.bl_status ? (
                  <StatusBadge status={shipment.bl_status} label={`BL: ${shipment.bl_status}`} />
                ) : null}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
            <Button
              size="sm"
              type="button"
              variant="create"
              leftIcon={<Plus />}
              disabled={!perms.canWriteCreate}
              onClick={() => navigate(paths.create)}
            >
              Create
            </Button>
            {editing ? (
              <>
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  leftIcon={<X />}
                  disabled={updateShipment.isPending}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant="success"
                  leftIcon={<Save />}
                  disabled={updateShipment.isPending}
                  onClick={() => void saveEdit()}
                >
                  {updateShipment.isPending ? 'Saving…' : 'Save'}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                type="button"
                variant="edit"
                leftIcon={<Pencil />}
                disabled={!perms.canWriteUpdate || anyPending}
                onClick={startEdit}
              >
                Edit
              </Button>
            )}
            <Button
              size="sm"
              type="button"
              variant="report"
              leftIcon={<FileText />}
              disabled={reportPending || anyPending}
              onClick={() => void onReport()}
            >
              {reportPending ? 'Report…' : 'Report'}
            </Button>
            <Button
              size="sm"
              type="button"
              variant="back"
              leftIcon={<ArrowLeft />}
              onClick={() => navigate(paths.list)}
            >
              Back
            </Button>
          </div>
        </div>
      </div>

      <FclContinuumRail steps={continuum} />

      {actionError && (
        <div role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div role="status" className="rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
          {actionMessage}
        </div>
      )}

      {/* ── Shipment detail (key fields) ── */}
      <section ref={infoRef} className={erpForm.section}>
        <div className={erpForm.sectionHeader}>Shipment detail</div>
        <div className={`${erpForm.sectionBody} grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3`}>
          <FresaReadonlyField label="Shipment No" value={shipmentDisplayNumber(shipment)} />
          <FresaReadonlyField
            label="Job No"
            value={displayValue(shipment.job_number) || (hasJob ? 'View job' : undefined)}
            href={jobHref}
          />
          <FresaReadonlyField label="Client" value={labels.customerLabel} />
          <FresaReadonlyField label="Department" value={labels.departmentLabel} />
          <FresaReadonlyField label="Branch" value={labels.branchLabel} />
          <FresaReadonlyField label="Status" value={shipment.status} />
          <FresaReadonlyField label="BL Status" value={shipment.bl_status} />
          <FresaReadonlyField label="POL" value={labels.originLabel} />
          <FresaReadonlyField label="POD" value={labels.destLabel} />
          <FresaReadonlyField label="ETD" value={shipment.etd} />
          <FresaReadonlyField label="ETA" value={shipment.eta} />
          <FresaReadonlyField label="Carrier" value={shipment.carrier_name} />
          {shipment.enquiry_id && isUuid(shipment.enquiry_id) ? (
            <FresaReadonlyField
              label="Enquiry No"
              value={displayValue(shipment.enquiry_number) || 'View enquiry'}
              href={`/sales/enquiries/${shipment.enquiry_id}`}
            />
          ) : null}
          {shipment.quotation_id && isUuid(shipment.quotation_id) ? (
            <FresaReadonlyField
              label="Quotation No"
              value={displayValue(shipment.quotation_number) || 'View quotation'}
              href={`/quotations/${shipment.quotation_id}`}
            />
          ) : null}
          <FresaReadonlyField label="MBL" value={shipment.mbl_number} />
          <FresaReadonlyField label="HBL" value={shipment.hbl_number} />
        </div>
        {editing ? (
          <div className={`border-t border-[var(--fresa-border,#C9D3DF)] ${erpForm.sectionBody} grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3`}>
            {(
              [
                ['commodity', 'Commodity'],
                ['cargo_details', 'Cargo details'],
                ['incoterms', 'Incoterms'],
                ['freight_payment_type', 'Freight terms'],
                ['currency_code', 'Currency'],
                ['mbl_number', 'MBL'],
                ['hbl_number', 'HBL'],
                ['vessel_name', 'Vessel'],
                ['voyage_number', 'Voyage'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className={erpForm.label}>{label}</span>
                <input
                  className={erpForm.input}
                  value={editDraft[key]}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
        ) : null}
      </section>

      {/* ── Actions toolbar (below Shipment detail) ── */}
      <div className={erpForm.toolbar}>
        <p className="mr-1 w-full text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)] sm:mr-2 sm:w-auto">
          Actions
        </p>
        {hasJob ? (
          <Button
            size="sm"
            type="button"
            variant="success"
            leftIcon={<ExternalLink />}
            onClick={() => navigate(jobHref!)}
          >
            Open Job
          </Button>
        ) : canGenerateJob ? (
          <Button
            size="sm"
            type="button"
            variant="success"
            leftIcon={<Briefcase />}
            disabled={anyPending}
            onClick={() => setConfirmKind('generate-job')}
          >
            Generate Job
          </Button>
        ) : null}
        {canChangeStatus && (
          <Button
            size="sm"
            type="button"
            variant="warning"
            leftIcon={<RefreshCw />}
            disabled={anyPending}
            onClick={() => {
              setStatusValue(shipment.status || statusOptions[0] || 'BOOKED');
              setConfirmKind('change-status');
            }}
          >
            Change Status
          </Button>
        )}
        {canChangeBl && (
          <Button
            size="sm"
            type="button"
            variant="primary"
            leftIcon={<FileCheck />}
            disabled={anyPending}
            onClick={() => {
              setBlStatusValue(shipment.bl_status || blOptions[0] || 'DRAFT');
              setConfirmKind('change-bl-status');
            }}
          >
            Change BL Status
          </Button>
        )}
        {canChangeDepartment && (
          <Button
            size="sm"
            type="button"
            variant="report"
            leftIcon={<Building2 />}
            disabled={anyPending}
            onClick={() => {
              setDepartmentId(shipment.department_id || '');
              setConfirmKind('change-department');
            }}
          >
            Change Department
          </Button>
        )}
        {canCopy && (
          <Button
            size="sm"
            type="button"
            variant="edit"
            leftIcon={<Copy />}
            disabled={anyPending}
            onClick={() => setConfirmKind('copy')}
          >
            Copy
          </Button>
        )}
        {canSplit && (
          <Button
            size="sm"
            type="button"
            variant="warning"
            leftIcon={<Split />}
            disabled={anyPending}
            onClick={() => setConfirmKind('split')}
          >
            Split
          </Button>
        )}
        {canSubmaster && (
          <Button
            size="sm"
            type="button"
            variant="create"
            leftIcon={<Layers />}
            disabled={anyPending}
            onClick={() => setConfirmKind('create-submaster')}
          >
            Create Submaster
          </Button>
        )}
        {canKpi && (
          <Button
            size="sm"
            type="button"
            variant="primary"
            leftIcon={<BarChart2 />}
            onClick={() => setShowKpi((v) => !v)}
          >
            {showKpi ? 'Hide KPI' : 'KPI'}
          </Button>
        )}
        {canTracking && (
          <Button
            size="sm"
            type="button"
            variant="report"
            leftIcon={<MapPin />}
            onClick={() => setShowTracking((v) => !v)}
          >
            {showTracking ? 'Hide Tracking' : 'Track & Trace'}
          </Button>
        )}
      </div>

      {showKpi && (
        <section className={erpForm.section}>
          <div className={erpForm.sectionHeader}>KPI</div>
          <div className={erpForm.sectionBody}>
            {kpiQuery.isLoading ? (
              <p className="text-[13px] text-[#64748b]">Loading KPI…</p>
            ) : kpiQuery.isError ? (
              <p className="text-[13px] text-red-700">{getErrorMessage(kpiQuery.error)}</p>
            ) : (
              <pre className="overflow-x-auto text-[12px] text-[#334155]">
                {JSON.stringify(kpiQuery.data ?? {}, null, 2)}
              </pre>
            )}
          </div>
        </section>
      )}

      {showTracking && (
        <section className={erpForm.section}>
          <div className={erpForm.sectionHeader}>Track & Trace</div>
          <div className={erpForm.sectionBody}>
            {trackingQuery.isLoading ? (
              <p className="text-[13px] text-[#64748b]">Loading tracking…</p>
            ) : trackingQuery.isError ? (
              <p className="text-[13px] text-red-700">{getErrorMessage(trackingQuery.error)}</p>
            ) : (
              <pre className="overflow-x-auto text-[12px] text-[#334155]">
                {JSON.stringify(trackingQuery.data ?? {}, null, 2)}
              </pre>
            )}
          </div>
        </section>
      )}

      {/* ── Fresa special tabs: Show All | Info | Party | … ── */}
      <section className={erpForm.section}>
        <div className="kf-tabs-scroll flex gap-0 overflow-x-auto border-b border-[var(--color-sidebar-bg,#0A2942)] bg-[var(--color-sidebar-bg,#0A2942)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 border-b-2 px-3.5 py-2.5 text-[12px] font-semibold capitalize transition-colors',
                effectiveTab === tab.key
                  ? 'border-white bg-white/15 text-white'
                  : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {effectiveTab ? (
          <ShipmentTabPanel
            shipmentId={shipment.id}
            tabKey={effectiveTab}
            siblingTabKeys={tabs.map((t) => t.key)}
          />
        ) : null}
      </section>

      {/* Confirm dialogs */}
      {confirmKind === 'generate-job' && (
        <ConfirmModal
          title="Generate job from shipment?"
          body={
            <div className="space-y-3 text-sm">
              <p className="text-[13px] text-[#475569]">
                Choose how to generate the job (Fresa: house or direct), then confirm.
              </p>
              <label className="flex flex-col gap-1">
                <span className={erpForm.label}>Job mode</span>
                <select
                  className={erpForm.input}
                  value={generateJobMode}
                  onChange={(e) =>
                    setGenerateJobMode(e.target.value as 'HOUSE' | 'DIRECT')
                  }
                >
                  <option value="HOUSE">Generate job with house</option>
                  <option value="DIRECT">Generate job with direct</option>
                </select>
              </label>
            </div>
          }
          pending={generateJob.isPending}
          confirmLabel="Finish"
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            void run(async () => {
              const result = await generateJob.mutateAsync({ mode: generateJobMode });
              setActionMessage('Job generated.');
              if (result.job_id && isUuid(result.job_id)) {
                navigate(
                  jobDetailPath({
                    id: result.job_id,
                    job_type: result.job_type || result.service_type || jobType,
                  }),
                );
              }
            })
          }
        />
      )}

      {confirmKind === 'copy' && (
        <ConfirmModal
          title="Copy shipment?"
          body="Creates a copy of this shipment via the backend."
          pending={copyShipment.isPending}
          confirmLabel="Copy"
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            void run(async () => {
              const copied = await copyShipment.mutateAsync();
              setActionMessage('Shipment copied.');
              navigate(paths.detail(copied.id));
            })
          }
        />
      )}

      {confirmKind === 'split' && (
        <ConfirmModal
          title="Split shipment?"
          body="Splits this shipment using the backend split API (charges omitted → copy all revenue lines)."
          pending={splitShipment.isPending}
          confirmLabel="Split"
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            void run(async () => {
              const created = await splitShipment.mutateAsync({});
              setActionMessage('Shipment split.');
              navigate(paths.detail(created.id));
            })
          }
        />
      )}

      {confirmKind === 'create-submaster' && (
        <ConfirmModal
          title="Create submaster?"
          body="Creates a submaster shipment via the backend."
          pending={createSubmaster.isPending}
          confirmLabel="Create"
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            void run(async () => {
              const created = await createSubmaster.mutateAsync();
              setActionMessage('Submaster created.');
              navigate(paths.detail(created.id));
            })
          }
        />
      )}

      {confirmKind === 'change-status' && (
        <Modal
          open
          onClose={() => !changeStatus.isPending && setConfirmKind(null)}
          title="Change shipment status"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="back"
                leftIcon={<ArrowLeft />}
                disabled={changeStatus.isPending}
                onClick={() => setConfirmKind(null)}
              >
                Back
              </Button>
              <Button
                type="button"
                leftIcon={<Save />}
                disabled={changeStatus.isPending || !statusValue}
                onClick={() =>
                  void run(async () => {
                    await changeStatus.mutateAsync({ status: statusValue });
                    setActionMessage('Status updated.');
                  })
                }
              >
                {changeStatus.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          }
        >
          <label className="block text-[13px]">
            <span className={erpForm.label}>Status</span>
            <select
              className={erpForm.input}
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </Modal>
      )}

      {confirmKind === 'change-bl-status' && (
        <Modal
          open
          onClose={() => !changeBlStatus.isPending && setConfirmKind(null)}
          title="Change BL status"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="back"
                leftIcon={<ArrowLeft />}
                disabled={changeBlStatus.isPending}
                onClick={() => setConfirmKind(null)}
              >
                Back
              </Button>
              <Button
                type="button"
                leftIcon={<Save />}
                disabled={changeBlStatus.isPending || !blStatusValue}
                onClick={() =>
                  void run(async () => {
                    await changeBlStatus.mutateAsync({ bl_status: blStatusValue });
                    setActionMessage('BL status updated.');
                  })
                }
              >
                {changeBlStatus.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          }
        >
          <label className="block text-[13px]">
            <span className={erpForm.label}>BL status</span>
            <select
              className={erpForm.input}
              value={blStatusValue}
              onChange={(e) => setBlStatusValue(e.target.value)}
            >
              {blOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </Modal>
      )}

      {confirmKind === 'change-department' && (
        <Modal
          open
          onClose={() => !changeDepartment.isPending && setConfirmKind(null)}
          title="Change department"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="back"
                leftIcon={<ArrowLeft />}
                disabled={changeDepartment.isPending}
                onClick={() => setConfirmKind(null)}
              >
                Back
              </Button>
              <Button
                type="button"
                leftIcon={<Save />}
                disabled={changeDepartment.isPending || !departmentId.trim()}
                onClick={() =>
                  void run(async () => {
                    await changeDepartment.mutateAsync({
                      department_id: departmentId.trim(),
                    });
                    setActionMessage('Department updated.');
                  })
                }
              >
                {changeDepartment.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          }
        >
          <label className="block text-[13px]">
            <span className={erpForm.label}>Department ID (UUID)</span>
            <input
              className={erpForm.input}
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              placeholder="Department UUID from masters"
            />
          </label>
        </Modal>
      )}
    </div>
  );
}

function ConfirmModal({
  title,
  body,
  pending,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string;
  body: ReactNode;
  pending: boolean;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open
      onClose={() => !pending && onClose()}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="back" leftIcon={<ArrowLeft />} disabled={pending} onClick={onClose}>
            Back
          </Button>
          <Button type="button" leftIcon={<Check />} disabled={pending} onClick={onConfirm}>
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </div>
      }
    >
      {typeof body === 'string' ? (
        <p className="text-[13px] text-[#475569]">{body}</p>
      ) : (
        body
      )}
    </Modal>
  );
}
