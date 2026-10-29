import { useMemo, useState } from 'react';
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
import { isUuid } from '@/lib/isUuid';
import { useInlineValidation } from '@/lib/validation';
import {
  CONTAINER_STATUSES,
  type ContainerStatus,
} from '../../constants/job.constants';
import { jobService } from '../../services/job.service';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import {
  useJobCargo,
  useJobContainers,
  useJobContainersFill,
} from '../../hooks/useJobs';
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
}

function formatUpdatedAt(value?: string): string {
  if (!value) return '—';
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return value;
  return new Date(t).toLocaleString();
}

export function JobContainersPanel({ jobId }: JobContainersPanelProps) {
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
  const [status, setStatus] = useState<ContainerStatus>('EMPTY');
  const [addCubicCapacity, setAddCubicCapacity] = useState('');
  const [addMaxPayload, setAddMaxPayload] = useState('');
  const [assignCargoId, setAssignCargoId] = useState('');
  const [assignContainerId, setAssignContainerId] = useState('');
  const [splitContainerId, setSplitContainerId] = useState('');
  const [splitPortions, setSplitPortions] = useState<
    { consignee_id: string; packages: string; gross_weight: string }[]
  >([{ consignee_id: '', packages: '', gross_weight: '' }]);

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
    const ok = await addValidation.runValidated(
      createJobContainerSchema,
      {
        // Prefer type code / iso_size — no type UUID when code is known.
        ...(typeCode
          ? { container_type_code: typeCode, iso_size: typeCode }
          : { container_type_id: containerTypeId.trim() || undefined }),
        container_number: containerNumber.trim() || undefined,
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
        setMsg('Container added.');
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

  const touchContainer = (c: JobContainer) =>
    run(async () => {
      const dto: {
        container_number?: string;
        seal_number?: string;
        status?: ContainerStatus;
      } = {};
      if (c.container_number) dto.container_number = c.container_number;
      if (c.seal_number) dto.seal_number = c.seal_number;
      // Always include status so PATCH is never empty when number/seal are missing.
      dto.status = c.status ?? 'EMPTY';
      await mutations.updateContainer.mutateAsync({
        containerId: containerRouteKey(c),
        dto,
      });
    }, 'Container touched (updated).');

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
              return (
                <div
                  key={routeKey || c.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] py-2"
                >
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
                      onClick={() => void touchContainer(c)}
                    >
                      Touch update
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
              {fill.map((row) => (
                <div
                  key={row.container_id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] py-1.5"
                >
                  <span className="font-medium">
                    {row.container_number || row.container_id.slice(0, 8)}
                  </span>
                  <span className="text-[var(--color-neutral-600)]">
                    Fill {formatFillPercent(row.fill_percent)}
                    {row.used_cbm != null || row.capacity_cbm != null
                      ? ` · CBM ${row.used_cbm ?? '—'} / ${row.capacity_cbm ?? '—'}`
                      : ''}
                    {row.message ? ` · ${row.message}` : ''}
                  </span>
                </div>
              ))}
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
            <label className="text-xs font-medium text-[var(--color-neutral-600)]">
              Status
            </label>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as ContainerStatus)}
            >
              {CONTAINER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
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
    </div>
  );
}
