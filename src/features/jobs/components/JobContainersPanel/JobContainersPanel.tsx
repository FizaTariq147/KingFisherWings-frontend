import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import {
  containerTypeSelectOptions,
  partyNameOnly,
  resolveContainerTypeName,
} from '@/features/masters/utils/containerTypeLabel';
import { useParties } from '@/features/parties/hooks/useParties';
import { AddStatusCatalogModal } from '@/features/shared/status-catalog';
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import { CONTAINER_STATUSES } from '../../constants/job.constants';
import { jobService } from '../../services/job.service';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import {
  useContainerStatusCatalog,
  useJobCargo,
  useJobContainers,
  useJobContainersFill,
} from '../../hooks/useJobs';
import type { UpdateJobContainerDto } from '../../types/job.types';
import {
  assignCargoToContainerFormSchema,
  createJobContainerSchema,
  splitContainerFormSchema,
} from '../../schemas/job.schema';
import type { JobContainer } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import {
  containerRouteKey,
  formatFillPercent,
  type ContainerFillInfo,
} from '../../utils/normalizeJobContainers';
import { ApiDataView } from '../ApiDataView';

interface JobContainersPanelProps {
  jobId: string;
  /** When set from Planned/Actual detail tabs — sent on create. */
  containerKind?: 'PLANNED' | 'ACTUAL';
}

function formatUpdatedAt(value?: string): string {
  if (!value) return '—';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value;
  return new Date(t).toLocaleString();
}

export function JobContainersPanel({
  jobId,
  containerKind = 'ACTUAL',
}: JobContainersPanelProps) {
  const { data: containers = [], refetch } = useJobContainers(jobId);
  const { data: fill = [], refetch: refetchFill } = useJobContainersFill(jobId);
  const { data: cargo = [] } = useJobCargo(jobId);
  const { data: containerTypes = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 200,
    order: 'asc',
  });
  const mutations = useJobSubresourceMutations(jobId);
  const actions = useJobActions(jobId);
  const {
    data: statusCatalog = [],
    refetch: refetchStatusCatalog,
  } = useContainerStatusCatalog();
  const [addStatusOpen, setAddStatusOpen] = useState(false);
  const statusOptions = useMemo(() => {
    if (statusCatalog.length) {
      return statusCatalog.map((row) => ({
        code: row.code,
        label: row.label || row.code.replaceAll('_', ' '),
      }));
    }
    return CONTAINER_STATUSES.map((s) => ({
      code: s,
      label: s.replaceAll('_', ' '),
    }));
  }, [statusCatalog]);
  const containerTypeOptions = useMemo(
    () => containerTypeSelectOptions(containerTypes),
    [containerTypes],
  );
  const partyOptions = useMemo(() => {
    return (partiesResult?.parties ?? [])
      .filter((p) => isUuid(p.id))
      .map((p) => ({
        value: p.id,
        label: partyNameOnly(p) || '—',
      }))
      .filter((o) => o.label && o.label !== '—');
  }, [partiesResult?.parties]);
  const addValidation = useInlineValidation();
  const assignValidation = useInlineValidation();
  const splitValidation = useInlineValidation();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [singleFill, setSingleFill] = useState<ContainerFillInfo | null>(null);
  const [fillEdit, setFillEdit] = useState<{
    containerId: string;
    cubic_capacity: string;
    max_payload: string;
    cbm: string;
    gross_weight: string;
  } | null>(null);
  const [fillSaving, setFillSaving] = useState(false);
  const [syncIncludeHouses, setSyncIncludeHouses] = useState(true);
  const [syncSubJobOnly, setSyncSubJobOnly] = useState(false);
  const [syncRollupHeader, setSyncRollupHeader] = useState(true);
  const [containerTypeId, setContainerTypeId] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [status, setStatus] = useState('EMPTY');
  const [addCubicCapacity, setAddCubicCapacity] = useState('');
  const [addMaxPayload, setAddMaxPayload] = useState('');
  const [assignCargoId, setAssignCargoId] = useState('');
  const [assignContainerId, setAssignContainerId] = useState('');
  const [splitContainerId, setSplitContainerId] = useState('');
  const [splitPortions, setSplitPortions] = useState<
    { consignee_id: string; packages: string; gross_weight: string }[]
  >([{ consignee_id: '', packages: '', gross_weight: '' }]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    container_number: string;
    seal_number: string;
    status: string;
    tare_weight: string;
    max_payload: string;
    cubic_capacity: string;
    gross_weight: string;
    vgm_weight: string;
    cbm: string;
  }>({
    container_number: '',
    seal_number: '',
    status: 'EMPTY',
    tare_weight: '',
    max_payload: '',
    cubic_capacity: '',
    gross_weight: '',
    vgm_weight: '',
    cbm: '',
  });

  const fillByContainerId = useMemo(() => {
    const map = new Map<string, ContainerFillInfo>();
    for (const row of fill) {
      if (row.container_id) map.set(row.container_id, row);
      const number = String(row.container_number ?? '').trim();
      if (number) map.set(number, row);
    }
    return map;
  }, [fill]);

  const resolveFill = (c: JobContainer) =>
    fillByContainerId.get(c.id) ||
    (c.container_number?.trim()
      ? fillByContainerId.get(c.container_number.trim())
      : undefined);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await Promise.all([refetch(), refetchFill()]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addContainer = async () => {
    const cubic = addCubicCapacity.trim() ? Number(addCubicCapacity) : undefined;
    const payload = addMaxPayload.trim() ? Number(addMaxPayload) : undefined;
    const typeRow = containerTypes.find((t) => String(t.id) === containerTypeId.trim());
    const typeCode = String(
      typeRow?.code ?? typeRow?.size ?? typeRow?.iso_size ?? '',
    ).trim();
    const number = containerNumber.trim();
    const ok = await addValidation.runValidated(
      createJobContainerSchema,
      {
        // Prefer type code / iso_size — no type UUID when code is known.
        ...(typeCode
          ? { container_type_code: typeCode, iso_size: typeCode }
          : { container_type_id: containerTypeId.trim() || undefined }),
        container_kind: containerKind,
        container_number: number || undefined,
        seal_number: sealNumber.trim() || undefined,
        status,
        cubic_capacity:
          cubic != null && Number.isFinite(cubic) ? cubic : undefined,
        max_payload:
          payload != null && Number.isFinite(payload) ? payload : undefined,
      },
      async (dto) => {
        await mutations.createContainer.mutateAsync(dto);
        setContainerTypeId('');
        setContainerNumber('');
        setSealNumber('');
        setStatus('EMPTY');
        setAddCubicCapacity('');
        setAddMaxPayload('');
        setMsg(
          containerKind === 'ACTUAL' && number
            ? 'ACTUAL container added — a linked shipment may be auto-created when numbered.'
            : 'Container added.',
        );
        await Promise.all([refetch(), refetchFill()]);
      },
    );
    if (!ok) setError(null);
  };

  const assignCargo = async () => {
    const ok = await assignValidation.runValidated(
      assignCargoToContainerFormSchema,
      {
        container_id: assignContainerId,
        cargo_id: assignCargoId,
      },
      async (dto) => {
        await mutations.assignCargo.mutateAsync({
          containerId: dto.container_id,
          dto: { cargo_id: dto.cargo_id },
        });
        setMsg('Cargo assigned.');
        await Promise.all([refetch(), refetchFill()]);
      },
    );
    if (!ok) setError(null);
  };

  const splitContainer = async () => {
    const portions = splitPortions.map((row) => ({
      consignee_id: row.consignee_id.trim() || undefined,
      packages: row.packages.trim() ? Number(row.packages) : undefined,
      gross_weight: row.gross_weight.trim() ? Number(row.gross_weight) : undefined,
    }));
    const ok = await splitValidation.runValidated(
      splitContainerFormSchema,
      { container_id: splitContainerId, portions },
      async (dto) => {
        await mutations.splitContainer.mutateAsync({
          containerId: dto.container_id,
          dto: { portions: dto.portions },
        });
        setMsg('Container split queued.');
        await Promise.all([refetch(), refetchFill()]);
      },
    );
    if (!ok) setError(null);
  };

  const startEditContainer = (c: JobContainer) => {
    setEditId(containerRouteKey(c));
    setEditDraft({
      container_number: c.container_number ?? '',
      seal_number: c.seal_number ?? '',
      status: String(c.status_code || c.status || 'EMPTY'),
      tare_weight: c.tare_weight != null ? String(c.tare_weight) : '',
      max_payload: c.max_payload != null ? String(c.max_payload) : '',
      cubic_capacity: c.cubic_capacity != null ? String(c.cubic_capacity) : '',
      gross_weight: c.gross_weight != null ? String(c.gross_weight) : '',
      vgm_weight: c.vgm_weight != null ? String(c.vgm_weight) : '',
      cbm: c.cbm != null ? String(c.cbm) : '',
    });
  };

  const saveEditContainer = (containerId: string) =>
    run(async () => {
      const toNum = (raw: string): number | undefined => {
        const t = raw.trim();
        if (!t) return undefined;
        const n = Number(t);
        return Number.isFinite(n) ? n : undefined;
      };
      // BE UpdateJobContainerDto rejects unknown props like status_code.
      const dto: UpdateJobContainerDto = {
        container_number: editDraft.container_number.trim() || undefined,
        seal_number: editDraft.seal_number.trim() || undefined,
        status: editDraft.status.trim() || 'EMPTY',
        tare_weight: toNum(editDraft.tare_weight),
        max_payload: toNum(editDraft.max_payload),
        cubic_capacity: toNum(editDraft.cubic_capacity),
        gross_weight: toNum(editDraft.gross_weight),
        vgm_weight: toNum(editDraft.vgm_weight),
        cbm: toNum(editDraft.cbm),
      };
      await mutations.updateContainer.mutateAsync({ containerId, dto });
      setEditId(null);
    }, 'Container updated.');

  const openFillEditor = async (c: JobContainer) => {
    const key = containerRouteKey(c);
    const data = await jobService.getContainerFill(jobId, key);
    setSingleFill(data);
    setFillEdit({
      containerId: key,
      cubic_capacity: String(
        data?.capacity_cbm ?? c.cubic_capacity ?? '',
      ),
      max_payload: String(data?.capacity_weight ?? c.max_payload ?? ''),
      cbm: String(data?.used_cbm ?? c.cbm ?? ''),
      gross_weight: String(data?.used_weight ?? c.gross_weight ?? ''),
    });
    if (!data) {
      throw new Error(
        'Fill % returned no data. Set capacity below, save, then refresh Fill %.',
      );
    }
  };

  const saveFillCapacity = async () => {
    if (!fillEdit) return;
    setError(null);
    setMsg(null);
    setFillSaving(true);
    try {
      const toNum = (raw: string): number | undefined => {
        const t = raw.trim();
        if (!t) return undefined;
        const n = Number(t);
        return Number.isFinite(n) ? n : undefined;
      };
      const dto = {
        cubic_capacity: toNum(fillEdit.cubic_capacity),
        max_payload: toNum(fillEdit.max_payload),
        cbm: toNum(fillEdit.cbm),
        gross_weight: toNum(fillEdit.gross_weight),
      };
      if (
        dto.cubic_capacity == null &&
        dto.max_payload == null &&
        dto.cbm == null &&
        dto.gross_weight == null
      ) {
        throw new Error('Enter at least one capacity or used value to save.');
      }
      await mutations.updateContainer.mutateAsync({
        containerId: fillEdit.containerId,
        dto,
      });
      const data = await jobService.getContainerFill(jobId, fillEdit.containerId);
      setSingleFill(data);
      if (data) {
        setFillEdit((prev) =>
          prev
            ? {
                ...prev,
                cubic_capacity: String(data.capacity_cbm ?? prev.cubic_capacity),
                max_payload: String(data.capacity_weight ?? prev.max_payload),
                cbm: String(data.used_cbm ?? prev.cbm),
                gross_weight: String(data.used_weight ?? prev.gross_weight),
              }
            : prev,
        );
      }
      setMsg('Container fill capacity saved.');
      await Promise.all([refetch(), refetchFill()]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFillSaving(false);
    }
  };

  const onContainerTypeChange = (typeId: string) => {
    setContainerTypeId(typeId);
    addValidation.clearField('container_type_id');
    addValidation.clearField('container_type_code');
    const row = containerTypes.find((t) => String(t.id) === typeId);
    if (!row) {
      setAddCubicCapacity('');
      setAddMaxPayload('');
      return;
    }
    // Prefill capacity from master (drives Fill %).
    const volume = Number(row.volume_cbm ?? row.cubic_capacity);
    const payload = Number(row.max_payload);
    setAddCubicCapacity(Number.isFinite(volume) && volume > 0 ? String(volume) : '');
    setAddMaxPayload(Number.isFinite(payload) && payload > 0 ? String(payload) : '');
  };

  const banner =
    error ||
    addValidation.formError ||
    assignValidation.formError ||
    splitValidation.formError;

  return (
    <div className="space-y-4">
      {banner && <p className="text-sm text-[var(--color-danger-600)]">{banner}</p>}
      {msg && <p className="text-sm text-[var(--color-success-700)]">{msg}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Containers</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--color-neutral-600)]">
              <input
                type="checkbox"
                checked={syncIncludeHouses}
                onChange={(e) => setSyncIncludeHouses(e.target.checked)}
              />
              Include houses
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--color-neutral-600)]">
              <input
                type="checkbox"
                checked={syncSubJobOnly}
                onChange={(e) => setSyncSubJobOnly(e.target.checked)}
              />
              Sub-job only
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--color-neutral-600)]">
              <input
                type="checkbox"
                checked={syncRollupHeader}
                onChange={(e) => setSyncRollupHeader(e.target.checked)}
              />
              Roll up header
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.syncContainersFromSubJobs.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.syncContainersFromSubJobs.mutateAsync({
                      include_houses: syncIncludeHouses,
                      is_sub_job_only: syncSubJobOnly,
                      rollup_header: syncRollupHeader,
                    }),
                  'Containers synced from sub-jobs.',
                )
              }
            >
              Sync from sub-jobs
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={actions.pushContainersToSubJobs.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.pushContainersToSubJobs.mutateAsync({
                      include_houses: syncIncludeHouses,
                      is_sub_job_only: syncSubJobOnly,
                    }),
                  'Containers pushed to sub-jobs.',
                )
              }
            >
              Push to sub-jobs
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                void run(
                  () => jobService.generateShipmentsFromContainers(jobId),
                  'Shipments generated from ACTUAL containers.',
                )
              }
            >
              Generate shipments
            </Button>
          </div>
          {containers.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No containers.</p>
          ) : (
            containers.map((c) => {
              const fillRow = resolveFill(c);
              const routeKey = containerRouteKey(c);
              const typeName = resolveContainerTypeName(
                c.container_type_id,
                containerTypes,
                c.container_type_name,
              );
              const title =
                c.container_number?.trim() ||
                (typeName !== '—' ? typeName : 'Container');
              const isEditing = editId === routeKey;
              return (
                <div
                  key={routeKey || c.id}
                  className="space-y-2 border-b border-[var(--color-neutral-100)] py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Type: {typeName} · Seal: {c.seal_number || '—'} · Status:{' '}
                      {c.status || 'EMPTY'} · Fill: {formatFillPercent(fillRow?.fill_percent)}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Updated: {formatUpdatedAt(c.updated_at)}
                      {fillRow?.message ? ` · ${fillRow.message}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(
                          () => openFillEditor(c),
                          'Fetched container fill — you can update capacity below.',
                        )
                      }
                    >
                      Fill %
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        isEditing ? setEditId(null) : startEditContainer(c)
                      }
                    >
                      {isEditing ? 'Cancel edit' : 'Edit'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(
                          () =>
                            mutations.returnContainer.mutateAsync({
                              containerId: routeKey,
                              dto: {},
                            }),
                          'Container returned.',
                        )
                      }
                    >
                      Return
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        run(
                          () => mutations.deleteContainer.mutateAsync(routeKey),
                          'Container removed.',
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  </div>
                  {isEditing ? (
                    <div className="grid gap-2 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Input
                        label="Container number"
                        value={editDraft.container_number}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            container_number: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Seal number"
                        value={editDraft.seal_number}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            seal_number: e.target.value,
                          }))
                        }
                      />
                      <label className="block space-y-1 text-xs font-medium text-[var(--color-neutral-600)]">
                        Status
                        <select
                          className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                          value={editDraft.status}
                          onChange={(e) =>
                            setEditDraft((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                        >
                          {statusOptions.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Input
                        label="Tare weight"
                        type="number"
                        value={editDraft.tare_weight}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            tare_weight: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Max payload"
                        type="number"
                        value={editDraft.max_payload}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            max_payload: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Cubic capacity"
                        type="number"
                        value={editDraft.cubic_capacity}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            cubic_capacity: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="Gross weight"
                        type="number"
                        value={editDraft.gross_weight}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            gross_weight: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="VGM weight"
                        type="number"
                        value={editDraft.vgm_weight}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            vgm_weight: e.target.value,
                          }))
                        }
                      />
                      <Input
                        label="CBM"
                        type="number"
                        value={editDraft.cbm}
                        onChange={(e) =>
                          setEditDraft((prev) => ({
                            ...prev,
                            cbm: e.target.value,
                          }))
                        }
                      />
                      <div className="sm:col-span-2 lg:col-span-3">
                        <Button
                          type="button"
                          size="sm"
                          disabled={mutations.updateContainer.isPending}
                          onClick={() => void saveEditContainer(routeKey)}
                        >
                          {mutations.updateContainer.isPending
                            ? 'Saving…'
                            : 'Save container'}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fill indicators (all)</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          {fill.length === 0 ? (
            <p className="text-sm text-[var(--color-neutral-400)]">No fill indicators.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {fill.map((row) => {
                const match =
                  containers.find((c) => c.id === row.container_id) ||
                  (row.container_number
                    ? containers.find(
                        (c) => c.container_number === row.container_number,
                      )
                    : undefined);
                const typeName = match
                  ? resolveContainerTypeName(
                      match.container_type_id,
                      containerTypes,
                      match.container_type_name,
                    )
                  : '—';
                const title =
                  row.container_number?.trim() ||
                  match?.container_number?.trim() ||
                  (typeName !== '—' ? typeName : null) ||
                  'Container';
                return (
                  <div
                    key={row.container_id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] py-1.5"
                  >
                    <span className="font-medium">{title}</span>
                    <span className="text-[var(--color-neutral-600)]">
                      Fill {formatFillPercent(row.fill_percent)}
                      {row.used_cbm != null || row.capacity_cbm != null
                        ? ` · CBM ${row.used_cbm ?? '—'} / ${row.capacity_cbm ?? '—'}`
                        : ''}
                      {row.message ? ` · ${row.message}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {singleFill != null && fillEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Selected container fill</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4 space-y-3 text-sm">
            <p>
              Fill: <strong>{formatFillPercent(singleFill.fill_percent)}</strong>
              {singleFill.message ? (
                <span className="text-[var(--color-neutral-500)]"> · {singleFill.message}</span>
              ) : null}
            </p>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Update capacity / used values, then Save. Fill % refreshes from the API.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                label="Capacity CBM"
                type="number"
                min={0}
                step="0.001"
                value={fillEdit.cubic_capacity}
                onChange={(e) =>
                  setFillEdit((prev) =>
                    prev ? { ...prev, cubic_capacity: e.target.value } : prev,
                  )
                }
              />
              <Input
                label="Max payload (kg)"
                type="number"
                min={0}
                step="0.001"
                value={fillEdit.max_payload}
                onChange={(e) =>
                  setFillEdit((prev) =>
                    prev ? { ...prev, max_payload: e.target.value } : prev,
                  )
                }
              />
              <Input
                label="Used CBM"
                type="number"
                min={0}
                step="0.001"
                value={fillEdit.cbm}
                onChange={(e) =>
                  setFillEdit((prev) => (prev ? { ...prev, cbm: e.target.value } : prev))
                }
              />
              <Input
                label="Used weight (kg)"
                type="number"
                min={0}
                step="0.001"
                value={fillEdit.gross_weight}
                onChange={(e) =>
                  setFillEdit((prev) =>
                    prev ? { ...prev, gross_weight: e.target.value } : prev,
                  )
                }
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={fillSaving || mutations.updateContainer.isPending}
                onClick={() => void saveFillCapacity()}
              >
                Save fill capacity
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={fillSaving}
                onClick={() =>
                  run(async () => {
                    const c = containers.find(
                      (row) => containerRouteKey(row) === fillEdit.containerId,
                    );
                    if (!c) throw new Error('Container not found.');
                    await openFillEditor(c);
                  }, 'Fill refreshed.')
                }
              >
                Refresh Fill %
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSingleFill(null);
                  setFillEdit(null);
                }}
              >
                Close
              </Button>
            </div>
            <ApiDataView
              data={singleFill.raw ?? singleFill}
              emptyLabel="No fill data."
              maxHeightClass="max-h-40"
            />
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Add container</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SearchableSelect
              name="container_type_id"
              label="Container type"
              required
              value={containerTypeId}
              options={containerTypeOptions}
              onChange={onContainerTypeChange}
              placeholder="Search container types from masters…"
              emptyMessage="No container types in masters. Add them under Masters → Container types."
              error={
                addValidation.fieldError('container_type_code') ||
                addValidation.fieldError('container_type_id')
              }
              allowManualUuid={false}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-[var(--color-neutral-600)]">
                Status
              </label>
              <button
                type="button"
                title="Add custom status"
                aria-label="Add custom status"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white shadow-sm hover:bg-[var(--color-primary-700)]"
                onClick={() => setAddStatusOpen(true)}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Container number"
            placeholder="Optional"
            value={containerNumber}
            error={addValidation.fieldError('container_number')}
            onChange={(e) => {
              setContainerNumber(e.target.value);
              addValidation.clearField('container_number');
            }}
          />
          <Input
            label="Seal number"
            placeholder="Optional"
            value={sealNumber}
            error={addValidation.fieldError('seal_number')}
            onChange={(e) => {
              setSealNumber(e.target.value);
              addValidation.clearField('seal_number');
            }}
          />
          <Input
            label="Cubic capacity (from type)"
            type="number"
            min={0}
            step="0.001"
            value={addCubicCapacity}
            onChange={(e) => setAddCubicCapacity(e.target.value)}
          />
          <Input
            label="Max payload (from type)"
            type="number"
            min={0}
            step="0.001"
            value={addMaxPayload}
            onChange={(e) => setAddMaxPayload(e.target.value)}
          />
          <Button
            type="button"
            disabled={mutations.createContainer.isPending}
            onClick={() => void addContainer()}
          >
            Add container
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign cargo to container</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <select
              className={`h-9 w-full rounded-md border px-3 text-sm ${
                assignValidation.fieldError('container_id')
                  ? 'border-[var(--color-danger-500)]'
                  : 'border-[var(--color-neutral-200)]'
              }`}
              value={assignContainerId}
              onChange={(e) => {
                setAssignContainerId(e.target.value);
                assignValidation.clearField('container_id');
              }}
            >
              <option value="">Select container…</option>
              {containers.map((c) => {
                const key = containerRouteKey(c);
                const typeName = resolveContainerTypeName(
                  c.container_type_id,
                  containerTypes,
                  c.container_type_name,
                );
                return (
                  <option key={key || c.id} value={key}>
                    {c.container_number?.trim() ||
                      (typeName !== '—' ? typeName : 'Container')}
                  </option>
                );
              })}
            </select>
            {assignValidation.fieldError('container_id') && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {assignValidation.fieldError('container_id')}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <select
              className={`h-9 w-full rounded-md border px-3 text-sm ${
                assignValidation.fieldError('cargo_id')
                  ? 'border-[var(--color-danger-500)]'
                  : 'border-[var(--color-neutral-200)]'
              }`}
              value={assignCargoId}
              onChange={(e) => {
                setAssignCargoId(e.target.value);
                assignValidation.clearField('cargo_id');
              }}
            >
              <option value="">Select cargo…</option>
              {cargo.map((raw) => {
                const item = raw as {
                  id: string;
                  description?: string;
                  commodity?: string;
                };
                return (
                  <option key={item.id} value={item.id}>
                    {item.description || item.commodity || 'Cargo'}
                  </option>
                );
              })}
            </select>
            {assignValidation.fieldError('cargo_id') && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {assignValidation.fieldError('cargo_id')}
              </p>
            )}
          </div>
          <Button
            type="button"
            className="sm:col-span-2 w-fit"
            onClick={() => void assignCargo()}
          >
            Assign cargo
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Split container</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">
              Container
            </label>
            <select
              className={`h-9 w-full rounded-md border px-3 text-sm ${
                splitValidation.fieldError('container_id')
                  ? 'border-[var(--color-danger-500)]'
                  : 'border-[var(--color-neutral-200)]'
              }`}
              value={splitContainerId}
              onChange={(e) => {
                setSplitContainerId(e.target.value);
                splitValidation.clearField('container_id');
              }}
            >
              <option value="">Select container…</option>
              {containers.map((c) => {
                const key = containerRouteKey(c);
                const typeName = resolveContainerTypeName(
                  c.container_type_id,
                  containerTypes,
                  c.container_type_name,
                );
                return (
                  <option key={key || c.id} value={key}>
                    {c.container_number?.trim() ||
                      (typeName !== '—' ? typeName : 'Container')}
                  </option>
                );
              })}
            </select>
            {splitValidation.fieldError('container_id') && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {splitValidation.fieldError('container_id')}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-neutral-600)]">
              Split portions
            </p>
            {splitPortions.map((row, index) => (
              <div
                key={`split-row-${index}`}
                className="grid gap-2 rounded-md border border-[var(--color-neutral-200)] bg-white p-2 sm:grid-cols-[1fr_6rem_6rem_auto]"
              >
                <div className="space-y-1">
                  {index === 0 ? (
                    <label className="text-xs font-medium text-[var(--color-neutral-600)]">
                      Consignee
                    </label>
                  ) : null}
                  <select
                    className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                    value={row.consignee_id}
                    onChange={(e) => {
                      const next = [...splitPortions];
                      next[index] = { ...next[index], consignee_id: e.target.value };
                      setSplitPortions(next);
                      splitValidation.clearField('portions');
                    }}
                  >
                    <option value="">Consignee (optional)</option>
                    {partyOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label={index === 0 ? 'Packages' : undefined}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={row.packages}
                  onChange={(e) => {
                    const next = [...splitPortions];
                    next[index] = { ...next[index], packages: e.target.value };
                    setSplitPortions(next);
                    splitValidation.clearField('portions');
                  }}
                />
                <Input
                  label={index === 0 ? 'Gross wt' : undefined}
                  type="number"
                  min={0}
                  step="0.001"
                  placeholder="0"
                  value={row.gross_weight}
                  onChange={(e) => {
                    const next = [...splitPortions];
                    next[index] = { ...next[index], gross_weight: e.target.value };
                    setSplitPortions(next);
                    splitValidation.clearField('portions');
                  }}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={splitPortions.length <= 1}
                    onClick={() =>
                      setSplitPortions((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {splitValidation.fieldError('portions') && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {splitValidation.fieldError('portions')}
              </p>
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                setSplitPortions((rows) => [
                  ...rows,
                  { consignee_id: '', packages: '', gross_weight: '' },
                ])
              }
            >
              Add portion
            </Button>
          </div>
          <Button type="button" onClick={() => void splitContainer()}>
            Split container
          </Button>
        </div>
      </Card>
      <AddStatusCatalogModal
        open={addStatusOpen}
        onClose={() => setAddStatusOpen(false)}
        entity="container-statuses"
        nested={false}
        onCreated={(code) => {
          setStatus(code);
          void refetchStatusCatalog();
        }}
      />
    </div>
  );
}
