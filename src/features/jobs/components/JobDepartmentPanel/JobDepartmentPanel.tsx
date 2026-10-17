import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useUsers } from '@/features/users/hooks/useUsers';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import { useJobResolvedLabels } from '../../hooks/useJobResolvedLabels';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function optionLabel(row: Record<string, unknown>): string {
  const code = String(row.code ?? '').trim();
  const name = String(
    row.name ?? row.display_name ?? row.displayName ?? row.full_name ?? row.fullName ?? '',
  ).trim();
  if (code && name && !isUuid(name)) return `${code} — ${name}`;
  if (name && !isUuid(name)) return name;
  if (code && !isUuid(code)) return code;
  return String(row.id ?? '');
}

function userOptionLabel(u: {
  id: string;
  full_name?: string;
  name?: string;
  email?: string;
}): string {
  const name = (u.full_name || u.name || '').trim();
  if (name && !isUuid(name)) return name;
  const email = (u.email || '').trim();
  if (email) return email;
  return u.id;
}

/** Department tab — names for display; PATCH /jobs/:id/department still sends IDs. */
export function JobDepartmentPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const labels = useJobResolvedLabels(job);
  const resources = useJobTabResourceMutations(job.id);
  const { data: branches = [] } = useMasterOptions(
    'branches',
    MASTER_PATHS.branches,
    true,
  );
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
    true,
  );
  const usersQuery = useUsers({ page: 1, limit: 100 });
  const salespeople = usersQuery.data?.users ?? [];

  const [branchId, setBranchId] = useState(job.branch_id || '');
  const [departmentId, setDepartmentId] = useState(job.department_id || '');
  const [salespersonId, setSalespersonId] = useState(job.salesperson_id || '');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const companyLabel =
    job.company_name?.trim() && !isUuid(job.company_name.trim())
      ? job.company_name.trim()
      : '—';

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      await resources.patchDepartment.mutateAsync({
        ...(isUuid(job.company_id || '') ? { company_id: job.company_id } : {}),
        ...(isUuid(branchId.trim()) ? { branch_id: branchId.trim() } : {}),
        ...(isUuid(departmentId.trim()) ? { department_id: departmentId.trim() } : {}),
        ...(isUuid(salespersonId.trim()) ? { salesperson_id: salespersonId.trim() } : {}),
      });
      setMsg('Department updated.');
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4 text-[13px]">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <div className={erpForm.label}>Company</div>
          <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[#0f172a]">
            {companyLabel}
          </div>
        </div>
        <div className="min-w-0">
          <div className={erpForm.label}>Current branch</div>
          <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[#0f172a]">
            {labels.branchLabel || '—'}
          </div>
        </div>
        <div className="min-w-0">
          <div className={erpForm.label}>Current department</div>
          <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[#0f172a]">
            {labels.departmentLabel || '—'}
          </div>
        </div>
        <div className="min-w-0">
          <div className={erpForm.label}>Current salesperson</div>
          <div className="flex h-8 items-center truncate rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] px-2.5 text-[#0f172a]">
            {labels.salespersonLabel || '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className={erpForm.label}>Branch</span>
          <select
            className={erpForm.input}
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {branches
              .filter((b) => isUuid(String(b.id)))
              .map((b) => (
                <option key={String(b.id)} value={String(b.id)}>
                  {optionLabel(b as Record<string, unknown>)}
                </option>
              ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={erpForm.label}>Department</span>
          <select
            className={erpForm.input}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {departments
              .filter((d) => isUuid(String(d.id)))
              .map((d) => (
                <option key={String(d.id)} value={String(d.id)}>
                  {optionLabel(d as Record<string, unknown>)}
                </option>
              ))}
          </select>
        </label>
        <label className="block min-w-0 sm:col-span-2">
          <span className={erpForm.label}>Salesperson</span>
          <select
            className={erpForm.input}
            value={salespersonId}
            onChange={(e) => setSalespersonId(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {salespeople
              .filter((u) => isUuid(String(u.id)))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {userOptionLabel(u)}
                </option>
              ))}
          </select>
        </label>
      </div>

      <Button
        type="button"
        size="sm"
        variant="edit"
        leftIcon={<Save />}
        disabled={resources.patchDepartment.isPending}
        onClick={() => void save()}
      >
        {resources.patchDepartment.isPending ? 'Saving…' : 'Save department'}
      </Button>
    </div>
  );
}
