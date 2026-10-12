import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobGpum } from '../../hooks/useJobs';
import type { JobGpumLineDto } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

const emptyLine = (): JobGpumLineDto => ({ user_id: '', gp_percent: 0 });

export function JobGpumPanel({ jobId, onChanged }: { jobId: string; onChanged?: () => void }) {
  const query = useJobGpum(jobId);
  const actions = useJobActions(jobId);
  const [rows, setRows] = useState<JobGpumLineDto[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data?.length) return;
    setRows(
      query.data.map((r) => ({
        user_id: r.user_id,
        gp_percent: r.gp_percent,
      })),
    );
  }, [query.data]);

  const total = rows.reduce((sum, r) => sum + (Number(r.gp_percent) || 0), 0);

  const save = async () => {
    setError(null);
    setMsg(null);
    const allocations = rows
      .map((r) => ({
        user_id: r.user_id.trim(),
        gp_percent: Number(r.gp_percent),
      }))
      .filter((r) => r.user_id);
    if (!allocations.length) {
      setError('Add at least one user allocation.');
      return;
    }
    if (Math.abs(allocations.reduce((s, r) => s + r.gp_percent, 0) - 100) > 0.01) {
      setError('GPUM allocations must total 100%.');
      return;
    }
    try {
      await actions.putGpum.mutateAsync({ allocations });
      setMsg('GPUM saved.');
      onChanged?.();
      void query.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      {query.isLoading ? (
        <p className="text-[var(--color-neutral-400)]">Loading GPUM…</p>
      ) : null}
      <p className="text-[12px] text-[var(--color-neutral-500)]">
        Gross profit user mix — allocations must total 100% (currently {total.toFixed(1)}%).
      </p>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              label="User id"
              value={row.user_id}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r, i) => (i === index ? { ...r, user_id: e.target.value } : r)),
                )
              }
            />
            <Input
              label="GP %"
              type="number"
              value={String(row.gp_percent)}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r, i) =>
                    i === index ? { ...r, gp_percent: Number(e.target.value) || 0 } : r,
                  ),
                )
              }
            />
            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={rows.length <= 1}
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="create" onClick={() => setRows((p) => [...p, emptyLine()])}>
          Add row
        </Button>
        <Button
          type="button"
          size="sm"
          variant="success"
          disabled={actions.putGpum.isPending}
          onClick={() => void save()}
        >
          {actions.putGpum.isPending ? 'Saving…' : 'Save GPUM'}
        </Button>
      </div>
    </div>
  );
}
