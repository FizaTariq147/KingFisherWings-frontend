import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useInlineValidation } from '@/lib/validation';
import { jobService } from '../../services/job.service';
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

interface JobContainersPanelProps {
  jobId: string;
}

export function JobContainersPanel({ jobId }: JobContainersPanelProps) {
  const { data: containers = [], refetch } = useJobContainers(jobId);
  const { data: fill, refetch: refetchFill } = useJobContainersFill(jobId);
  const { data: cargo = [] } = useJobCargo(jobId);
  const mutations = useJobSubresourceMutations(jobId);
  const addValidation = useInlineValidation();
  const assignValidation = useInlineValidation();
  const splitValidation = useInlineValidation();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [singleFill, setSingleFill] = useState<unknown>(null);
  const [containerTypeId, setContainerTypeId] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [assignCargoId, setAssignCargoId] = useState('');
  const [assignContainerId, setAssignContainerId] = useState('');
  const [splitJson, setSplitJson] = useState(
    '[{"consignee_id":"","packages":0,"gross_weight":0}]',
  );

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
    let portions: unknown;
    try {
      portions = JSON.parse(splitJson);
    } catch {
      splitValidation.setFormError('Split portions must be valid JSON');
      return;
    }
    const ok = await splitValidation.runValidated(
      splitContainerFormSchema,
      { container_id: assignContainerId, portions },
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
        <pre className="px-4 pb-4 text-xs overflow-auto max-h-40">
          {fill ? JSON.stringify(fill, null, 2) : '—'}
        </pre>
      </Card>

      {singleFill != null && (
        <Card>
          <CardHeader>
            <CardTitle>Selected container fill</CardTitle>
          </CardHeader>
          <pre className="px-4 pb-4 text-xs overflow-auto max-h-40">
            {JSON.stringify(singleFill, null, 2)}
          </pre>
        </Card>
      )}

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
        <div className="px-4 pb-4 space-y-2">
          <select
            className={`h-9 w-full rounded-md border px-3 text-sm ${
              splitValidation.fieldError('container_id')
                ? 'border-[var(--color-danger-500)]'
                : 'border-[var(--color-neutral-200)]'
            }`}
            value={assignContainerId}
            onChange={(e) => {
              setAssignContainerId(e.target.value);
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
          <textarea
            className={`w-full min-h-[80px] rounded-md border px-3 py-2 text-xs font-mono ${
              splitValidation.fieldError('portions')
                ? 'border-[var(--color-danger-500)]'
                : 'border-[var(--color-neutral-200)]'
            }`}
            value={splitJson}
            onChange={(e) => {
              setSplitJson(e.target.value);
              splitValidation.clearField('portions');
            }}
          />
          {splitValidation.fieldError('portions') && (
            <p className="text-xs text-[var(--color-danger-500)]">
              {splitValidation.fieldError('portions')}
            </p>
          )}
          <Button type="button" onClick={() => void splitContainer()}>
            Split container
          </Button>
        </div>
      </Card>
    </div>
  );
}
