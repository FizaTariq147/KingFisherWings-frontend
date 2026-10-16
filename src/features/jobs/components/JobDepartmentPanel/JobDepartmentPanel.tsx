import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

/** Department tab — PATCH /jobs/:id/department */
export function JobDepartmentPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const resources = useJobTabResourceMutations(job.id);
  const [branchId, setBranchId] = useState(job.branch_id || '');
  const [companyId, setCompanyId] = useState(
    String((job as { company_id?: string }).company_id ?? ''),
  );
  const [departmentId, setDepartmentId] = useState(job.department_id || '');
  const [salespersonId, setSalespersonId] = useState(job.salesperson_id || '');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      await resources.patchDepartment.mutateAsync({
        ...(isUuid(branchId.trim()) ? { branch_id: branchId.trim() } : {}),
        ...(isUuid(companyId.trim()) ? { company_id: companyId.trim() } : {}),
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
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input label="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        <Input label="Branch ID" value={branchId} onChange={(e) => setBranchId(e.target.value)} />
        <Input
          label="Department ID"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        />
        <Input
          label="Salesperson ID"
          value={salespersonId}
          onChange={(e) => setSalespersonId(e.target.value)}
        />
      </div>
      <Button
        type="button"
        size="sm"
        variant="edit"
        disabled={resources.patchDepartment.isPending}
        onClick={() => void save()}
      >
        {resources.patchDepartment.isPending ? 'Saving…' : 'Save department'}
      </Button>
    </div>
  );
}
