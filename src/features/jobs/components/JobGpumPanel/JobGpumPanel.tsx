import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobGpum, useJobLookupsDropdowns } from '../../hooks/useJobs';
import type { JobGpumLineDto, JobLookupNamedOption } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

const emptyLine = (): JobGpumLineDto => ({ employee_name: '', gp_percent: 0 });

function employeeOptionLabel(opt: JobLookupNamedOption): string {
  if (opt.email && opt.name && opt.email !== opt.name) {
    return `${opt.name} (${opt.email})`;
  }
  return opt.name || opt.email || '';
}

export function JobGpumPanel({ jobId, onChanged }: { jobId: string; onChanged?: () => void }) {
  const query = useJobGpum(jobId);
  const lookupsQuery = useJobLookupsDropdowns(true);
  const actions = useJobActions(jobId);
  const [rows, setRows] = useState<JobGpumLineDto[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const allocations = query.data?.allocations;
    if (!allocations?.length) return;
    setRows(
      allocations.map((r) => ({
        employee_name: r.employee_name,
        gp_percent: r.gp_percent,
      })),
    );
  }, [query.data]);

  const employees = useMemo(() => {
    const fromGpum = query.data?.employees ?? [];
    const fromLookups = lookupsQuery.data?.employees ?? [];
    const byKey = new Map<string, JobLookupNamedOption>();
    for (const opt of [...fromGpum, ...fromLookups]) {
      const key = (opt.name || opt.email || '').trim().toLowerCase();
      if (!key) continue;
      if (!byKey.has(key)) byKey.set(key, opt);
    }
    return Array.from(byKey.values()).sort((a, b) =>
      employeeOptionLabel(a).localeCompare(employeeOptionLabel(b)),
    );
  }, [query.data?.employees, lookupsQuery.data?.employees]);

  const total = rows.reduce((sum, r) => sum + (Number(r.gp_percent) || 0), 0);

  const save = async () => {
    setError(null);
    setMsg(null);
    const allocations = rows
      .map((r) => ({
        employee_name: r.employee_name.trim(),
        gp_percent: Number(r.gp_percent),
      }))
      .filter((r) => r.employee_name);
    if (!allocations.length) {
      setError('Add at least one employee allocation.');
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
        Gross profit user mix — pick employee name/email (no UUIDs). Allocations must total 100%
        (currently {total.toFixed(1)}%).
      </p>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-[var(--color-neutral-600)]">
                Employee
              </span>
              <select
                className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-3 text-sm"
                value={row.employee_name}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((r, i) =>
                      i === index ? { ...r, employee_name: e.target.value } : r,
                    ),
                  )
                }
              >
                <option value="">Select…</option>
                {employees.map((opt) => {
                  const value = opt.name || opt.email || '';
                  return (
                    <option key={`${value}-${opt.email ?? ''}`} value={value}>
                      {employeeOptionLabel(opt)}
                    </option>
                  );
                })}
              </select>
            </label>
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
        <Button
          type="button"
          size="sm"
          variant="create"
          onClick={() => setRows((p) => [...p, emptyLine()])}
        >
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
