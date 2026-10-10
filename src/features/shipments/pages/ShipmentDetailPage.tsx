import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OperationTypeBadge, StatusBadge } from '@/components/erp';
import { Button } from '@/components/ui/Button';
import { FormPageHeader } from '@/components/ui/FormPageHeader';
import { Modal } from '@/components/ui/Modal';
import { jobDetailPath } from '@/features/jobs/utils/jobRoute';
import { buildFclContinuumSteps } from '@/features/shared/continuum/buildFclContinuumSteps';
import { FclContinuumRail } from '@/features/shared/continuum/FclContinuumRail';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import { cn } from '@/lib/utils';
import { SHIPMENT_DETAIL_TABS, SHIPMENT_ROUTE_PREFIX } from '../api/shipment.api';
import { ShipmentTabPanel } from '../components/ShipmentTabPanel';
import {
  useChangeShipmentBlStatus,
  useChangeShipmentDepartment,
  useChangeShipmentStatus,
  useCopyShipment,
  useGenerateShipmentJob,
  useShipment,
  useShipmentCreateSubmaster,
  useShipmentKpi,
  useShipmentTracking,
  useSplitShipment,
} from '../hooks/useShipments';
import {
  SHIPMENT_BL_STATUSES,
  SHIPMENT_STATUSES,
  type Shipment,
} from '../types/shipment.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { shipmentDisplayNumber } from '../utils/normalizeShipment';

function FieldRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] text-[#0f172a]">{value}</dd>
    </div>
  );
}

function defaultTabs(shipment: Shipment): { key: string; label: string }[] {
  if (shipment.tabs?.length) {
    return shipment.tabs.map((t) => ({
      key: t.key,
      label: t.label || t.key.replace(/[-_]/g, ' '),
    }));
  }
  return SHIPMENT_DETAIL_TABS.map((key) => ({
    key,
    label: key.replace(/-/g, ' '),
  }));
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
  const query = useShipment(id);
  const generateJob = useGenerateShipmentJob(id);
  const copyShipment = useCopyShipment(id);
  const splitShipment = useSplitShipment(id);
  const changeStatus = useChangeShipmentStatus(id);
  const changeBlStatus = useChangeShipmentBlStatus(id);
  const changeDepartment = useChangeShipmentDepartment(id);
  const createSubmaster = useShipmentCreateSubmaster(id);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<ConfirmKind | null>(null);
  const [statusValue, setStatusValue] = useState('');
  const [blStatusValue, setBlStatusValue] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [activeTab, setActiveTab] = useState<string>('information');
  const [showKpi, setShowKpi] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const kpiQuery = useShipmentKpi(id, showKpi);
  const trackingQuery = useShipmentTracking(id, showTracking);

  const shipment = query.data;
  const tabs = useMemo(() => (shipment ? defaultTabs(shipment) : []), [shipment]);
  const effectiveTab = tabs.some((t) => t.key === activeTab)
    ? activeTab
    : tabs[0]?.key ?? 'information';

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
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-danger-700)]">
          {getErrorMessage(query.error) || 'Shipment not found.'}
        </p>
        <Button type="button" variant="secondary" onClick={() => query.refetch()}>
          Retry
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate(SHIPMENT_ROUTE_PREFIX)}>
          Back to shipments
        </Button>
      </div>
    );
  }

  const jobType = shipment.job_type || shipment.service_type || 'SEA_FCL_EXPORT';
  const hasJob = Boolean(shipment.job_id && isUuid(shipment.job_id));
  const actions = shipment.actions;
  const canGenerateJob =
    !hasJob && (actions == null ? true : actions.can_generate_job === true);
  const canCopy = actions?.can_copy !== false;
  const canChangeStatus = actions?.can_change_status !== false;
  const canChangeBl = actions?.can_change_bl_status === true || actions?.can_change_bl_status == null;
  const canChangeDepartment = actions?.can_change_department !== false;
  const canSplit = actions?.can_split === true;
  const canSubmaster = actions?.can_create_submaster === true;
  const canKpi = actions?.can_kpi !== false;
  const canTracking = actions?.can_tracking !== false;

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

  return (
    <div className="space-y-2.5">
      <FormPageHeader
        title={shipmentDisplayNumber(shipment)}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            <OperationTypeBadge code={jobType} />
            <StatusBadge status={shipment.status} />
            {shipment.bl_status ? <StatusBadge status={shipment.bl_status} label={`BL: ${shipment.bl_status}`} /> : null}
          </span>
        }
        backTo={SHIPMENT_ROUTE_PREFIX}
        backLabel="Shipments"
      />

      {/* Action toolbar — only show actions allowed / relevant */}
      <div className={erpForm.toolbar}>
        {hasJob ? (
          <Button
            size="sm"
            type="button"
            onClick={() =>
              navigate(jobDetailPath({ id: shipment.job_id!, job_type: jobType }))
            }
          >
            Open Job
          </Button>
        ) : canGenerateJob ? (
          <Button
            size="sm"
            type="button"
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
            variant="secondary"
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
            variant="secondary"
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
            variant="secondary"
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
            variant="secondary"
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
            variant="secondary"
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
            variant="secondary"
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
            variant="secondary"
            onClick={() => setShowKpi((v) => !v)}
          >
            {showKpi ? 'Hide KPI' : 'KPI'}
          </Button>
        )}
        {canTracking && (
          <Button
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => setShowTracking((v) => !v)}
          >
            {showTracking ? 'Hide Tracking' : 'Track & Trace'}
          </Button>
        )}
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

      {/* Compact operational header */}
      <section className={erpForm.section}>
        <div className={erpForm.sectionHeader}>Shipment information</div>
        <dl className={`${erpForm.sectionBody} ${erpForm.grid3}`}>
          <FieldRow label="Customer" value={shipment.party_name || shipment.customer_name} />
          <FieldRow label="Department" value={shipment.department_name} />
          <FieldRow label="Branch" value={shipment.branch_name} />
          <FieldRow label="Currency" value={shipment.currency_code} />
          <FieldRow label="Incoterms" value={shipment.incoterms} />
          <FieldRow label="Freight terms" value={shipment.freight_payment_type} />
          <FieldRow label="POR" value={shipment.por || shipment.place_of_receipt} />
          <FieldRow label="POL" value={shipment.pol || shipment.origin_port_name || shipment.origin_port_id} />
          <FieldRow label="POD" value={shipment.pod || shipment.dest_port_name || shipment.dest_port_id} />
          <FieldRow label="POF / Delivery" value={shipment.pof || shipment.place_of_delivery} />
          <FieldRow label="ETD" value={shipment.etd} />
          <FieldRow label="ETA" value={shipment.eta} />
          <FieldRow label="MBL" value={shipment.mbl_number} />
          <FieldRow label="HBL" value={shipment.hbl_number} />
          <FieldRow label="Vessel / Voyage" value={[shipment.vessel_name, shipment.voyage_number].filter(Boolean).join(' / ') || undefined} />
          <FieldRow label="Carrier" value={shipment.carrier_name} />
          <FieldRow label="Commodity" value={shipment.commodity} />
          <FieldRow label="Containers" value={shipment.container_count} />
        </dl>
      </section>

      {/* Related records */}
      <section className="rounded-sm border border-[#d0d7de] bg-white px-3 py-2 text-[13px]">
        <span className="font-semibold text-[#0A2942]">Related: </span>
        {shipment.party_id && isUuid(shipment.party_id) && (
          <Link className="mr-3 text-[var(--color-primary-700)] hover:underline" to={`/parties/${shipment.party_id}`}>
            Party
          </Link>
        )}
        {shipment.enquiry_id && isUuid(shipment.enquiry_id) && (
          <Link className="mr-3 text-[var(--color-primary-700)] hover:underline" to={`/sales/enquiries/${shipment.enquiry_id}`}>
            Enquiry {shipment.enquiry_number || shipment.enquiry_id.slice(0, 8)}
          </Link>
        )}
        {shipment.quotation_id && isUuid(shipment.quotation_id) && (
          <Link className="mr-3 text-[var(--color-primary-700)] hover:underline" to={`/quotations/${shipment.quotation_id}`}>
            Quotation {shipment.quotation_number || shipment.quotation_id.slice(0, 8)}
          </Link>
        )}
        {shipment.job_id && isUuid(shipment.job_id) && (
          <Link
            className="mr-3 text-[var(--color-primary-700)] hover:underline"
            to={jobDetailPath({ id: shipment.job_id, job_type: jobType })}
          >
            Job {shipment.job_number || shipment.job_id.slice(0, 8)}
          </Link>
        )}
      </section>

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

      {/* Lazy tabs */}
      <section className={erpForm.section}>
        <div className="flex gap-0 overflow-x-auto border-b border-[#d0d7de] bg-[#f8fafc]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2 text-[12px] font-medium capitalize transition-colors',
                effectiveTab === tab.key
                  ? 'border-[var(--color-primary-700)] bg-white text-[var(--color-primary-700)]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {effectiveTab ? (
          <ShipmentTabPanel shipmentId={shipment.id} tabKey={effectiveTab} />
        ) : null}
      </section>

      {/* Confirm dialogs */}
      {confirmKind === 'generate-job' && (
        <ConfirmModal
          title="Generate job?"
          body="Creates a job from this shipment via the backend."
          pending={generateJob.isPending}
          confirmLabel="Generate job"
          onClose={() => setConfirmKind(null)}
          onConfirm={() =>
            void run(async () => {
              const result = await generateJob.mutateAsync();
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
              navigate(`${SHIPMENT_ROUTE_PREFIX}/${copied.id}`);
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
              navigate(`${SHIPMENT_ROUTE_PREFIX}/${created.id}`);
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
              navigate(`${SHIPMENT_ROUTE_PREFIX}/${created.id}`);
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
              <Button type="button" variant="secondary" disabled={changeStatus.isPending} onClick={() => setConfirmKind(null)}>
                Back
              </Button>
              <Button
                type="button"
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
              <Button type="button" variant="secondary" disabled={changeBlStatus.isPending} onClick={() => setConfirmKind(null)}>
                Back
              </Button>
              <Button
                type="button"
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
                variant="secondary"
                disabled={changeDepartment.isPending}
                onClick={() => setConfirmKind(null)}
              >
                Back
              </Button>
              <Button
                type="button"
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
  body: string;
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
          <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>
            Back
          </Button>
          <Button type="button" disabled={pending} onClick={onConfirm}>
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-[13px] text-[#475569]">{body}</p>
    </Modal>
  );
}
