import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
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
import { getErrorMessage } from '../../utils/getErrorMessage';
import { ApiDataView } from '../ApiDataView';

interface JobContainersPanelProps {
  jobId: string;
}

export function JobContainersPanel({ jobId }: JobContainersPanelProps) {
  const { data: containers = [], refetch } = useJobContainers(jobId);
  const { data: fill, refetch: refetchFill } = useJobContainersFill(jobId);
  const { data: cargo = [] } = useJobCargo(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const actions = useJobActions(jobId);
  const addValidation = useInlineValidation();
  const assignValidation = useInlineValidation();
  const splitValidation = useInlineValidation();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [singleFill, setSingleFill] = useState<unknown>(null);
  const [syncIncludeHouses, setSyncIncludeHouses] = useState(true);
  const [syncSubJobOnly, setSyncSubJobOnly] = useState(false);
  const [syncRollupHeader, setSyncRollupHeader] = useState(true);
  const [containerTypeId, setContainerTypeId] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [assignCargoId, setAssignCargoId] = useState('');
  const [assignContainerId, setAssignContainerId] = useState('');
  const [splitContainerId, setSplitContainerId] = useState('');
  const [splitPortions, setSplitPortions] = useState<
    { consignee_id: string; packages: string; gross_weight: string }[]
  >([{ consignee_id: '', packages: '', gross_weight: '' }]);

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
    const ok = await addValidation.runValidated(
      createJobContainerSchema,
      {
        container_type_id: containerTypeId.trim(),
        container_number: containerNumber.trim() || undefined,
        seal_number: sealNumber.trim() || undefined,
      },
      async (dto) => {
        await mutations.createContainer.mutateAsync(dto);
        setContainerTypeId('');
        setContainerNumber('');
        setSealNumber('');
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
            containers.map((raw) => {
              const c = raw as {
                id: string;
                container_number?: string;
                seal_number?: string;
                status?: string;
              };
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-neutral-100)] py-2"
                >
                  <div>
                    <p className="font-medium">{c.container_number || c.id.slice(0, 8)}</p>
                    <p className="text-xs text-[var(--color-neutral-400)]">
                      Seal: {c.seal_number || '—'} · Status: {c.status || '—'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(async () => {
                          const data = await jobService.getContainerFill(jobId, c.id);
                          setSingleFill(data);
                        }, 'Fetched container fill.')
                      }
                    >
                      Fill %
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        run(
                          () =>
                            mutations.updateContainer.mutateAsync({
                              containerId: c.id,
                              dto: {
                                seal_number: c.seal_number,
                                container_number: c.container_number,
                              },
                            }),
                          'Container updated.',
                        )
                      }
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
                              containerId: c.id,
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
                          () => mutations.deleteContainer.mutateAsync(c.id),
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
          <ApiDataView data={fill} emptyLabel="No fill indicators." maxHeightClass="max-h-40" />
        </div>
      </Card>

      {singleFill != null ? (
        <Card>
          <CardHeader>
            <CardTitle>Selected container fill</CardTitle>
          </CardHeader>
          <div className="px-4 pb-4">
            <ApiDataView
              data={singleFill}
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
          <Input
            placeholder="Container type UUID *"
            value={containerTypeId}
            error={addValidation.fieldError('container_type_id')}
            onChange={(e) => {
              setContainerTypeId(e.target.value);
              addValidation.clearField('container_type_id');
            }}
          />
          <Input
            placeholder="Container number"
            value={containerNumber}
            error={addValidation.fieldError('container_number')}
            onChange={(e) => {
              setContainerNumber(e.target.value);
              addValidation.clearField('container_number');
            }}
          />
          <Input
            placeholder="Seal number"
            value={sealNumber}
            error={addValidation.fieldError('seal_number')}
            onChange={(e) => {
              setSealNumber(e.target.value);
              addValidation.clearField('seal_number');
            }}
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
              {containers.map((raw) => {
                const c = raw as { id: string; container_number?: string };
                return (
                  <option key={c.id} value={c.id}>
                    {c.container_number || c.id.slice(0, 8)}
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
                const c = raw as { id: string; description?: string };
                return (
                  <option key={c.id} value={c.id}>
                    {c.description || c.id.slice(0, 8)}
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
              {containers.map((raw) => {
                const c = raw as { id: string; container_number?: string };
                return (
                  <option key={c.id} value={c.id}>
                    {c.container_number || c.id.slice(0, 8)}
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
                <Input
                  label={index === 0 ? 'Consignee ID' : undefined}
                  placeholder="Consignee UUID (optional)"
                  value={row.consignee_id}
                  onChange={(e) => {
                    const next = [...splitPortions];
                    next[index] = { ...next[index], consignee_id: e.target.value };
                    setSplitPortions(next);
                    splitValidation.clearField('portions');
                  }}
                />
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
