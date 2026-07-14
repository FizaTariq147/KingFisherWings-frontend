import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { jobService } from '../../services/job.service';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import {
  useJobCargo,
  useJobContainers,
  useJobContainersFill,
} from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface JobContainersPanelProps {
  jobId: string;
}

export function JobContainersPanel({ jobId }: JobContainersPanelProps) {
  const { data: containers = [], refetch } = useJobContainers(jobId);
  const { data: fill, refetch: refetchFill } = useJobContainersFill(jobId);
  const { data: cargo = [] } = useJobCargo(jobId);
  const mutations = useJobSubresourceMutations(jobId);
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

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-[var(--color-danger-600)]">{error}</p>}
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
                container_type_id?: string;
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
            onChange={(e) => setContainerTypeId(e.target.value)}
          />
          <Input
            placeholder="Container number"
            value={containerNumber}
            onChange={(e) => setContainerNumber(e.target.value)}
          />
          <Input
            placeholder="Seal number"
            value={sealNumber}
            onChange={(e) => setSealNumber(e.target.value)}
          />
          <Button
            type="button"
            disabled={!containerTypeId || mutations.createContainer.isPending}
            onClick={() =>
              run(async () => {
                await mutations.createContainer.mutateAsync({
                  container_type_id: containerTypeId,
                  container_number: containerNumber || undefined,
                  seal_number: sealNumber || undefined,
                });
                setContainerTypeId('');
                setContainerNumber('');
                setSealNumber('');
              }, 'Container added.')
            }
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
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={assignContainerId}
            onChange={(e) => setAssignContainerId(e.target.value)}
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
          <select
            className="h-9 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={assignCargoId}
            onChange={(e) => setAssignCargoId(e.target.value)}
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
          <Button
            type="button"
            className="sm:col-span-2 w-fit"
            disabled={!assignContainerId || !assignCargoId}
            onClick={() =>
              run(
                () =>
                  mutations.assignCargo.mutateAsync({
                    containerId: assignContainerId,
                    dto: { cargo_id: assignCargoId },
                  }),
                'Cargo assigned.',
              )
            }
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
            className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
            value={assignContainerId}
            onChange={(e) => setAssignContainerId(e.target.value)}
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
          <textarea
            className="w-full min-h-[80px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-xs font-mono"
            value={splitJson}
            onChange={(e) => setSplitJson(e.target.value)}
          />
          <Button
            type="button"
            disabled={!assignContainerId}
            onClick={() =>
              run(async () => {
                const portions = JSON.parse(splitJson) as Array<{
                  consignee_id: string;
                  packages?: number;
                  gross_weight?: number;
                }>;
                await mutations.splitContainer.mutateAsync({
                  containerId: assignContainerId,
                  dto: { portions },
                });
              }, 'Container split queued.')
            }
          >
            Split container
          </Button>
        </div>
      </Card>
    </div>
  );
}
