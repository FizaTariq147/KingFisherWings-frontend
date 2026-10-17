import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import { useJobLookupsDropdowns } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job, JobLookupNamedOption } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function namedLabel(opt: JobLookupNamedOption): string {
  if (opt.code && opt.name) return `${opt.code} — ${opt.name}`;
  if (opt.email && opt.name && opt.email !== opt.name) {
    return `${opt.name} (${opt.email})`;
  }
  return opt.name;
}

function optionValue(opt: JobLookupNamedOption): string {
  return opt.name;
}

/** Department tab — names from GET /jobs/lookups/dropdowns; PATCH sends *_name. */
export function JobDepartmentPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const resources = useJobTabResourceMutations(job.id);
  const lookupsQuery = useJobLookupsDropdowns(true);
  const lookups = lookupsQuery.data;

  const [companyName, setCompanyName] = useState(job.company_name?.trim() || '');
  const [branchName, setBranchName] = useState(job.branch_name?.trim() || '');
  const [departmentName, setDepartmentName] = useState(
    job.department_name?.trim() || '',
  );
  const [salespersonName, setSalespersonName] = useState(
    job.salesperson_name?.trim() || '',
  );
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (job.company_name?.trim() && !isUuid(job.company_name.trim())) {
      setCompanyName(job.company_name.trim());
    }
    if (job.branch_name?.trim() && !isUuid(job.branch_name.trim())) {
      setBranchName(job.branch_name.trim());
    }
    if (job.department_name?.trim() && !isUuid(job.department_name.trim())) {
      setDepartmentName(job.department_name.trim());
    }
    if (job.salesperson_name?.trim() && !isUuid(job.salesperson_name.trim())) {
      setSalespersonName(job.salesperson_name.trim());
    }
  }, [
    job.company_name,
    job.branch_name,
    job.department_name,
    job.salesperson_name,
  ]);

  const companies = lookups?.companies ?? [];
  const branches = lookups?.branches ?? [];
  const departments = lookups?.departments ?? [];
  const salespeople = lookups?.salespeople ?? [];

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      await resources.patchDepartment.mutateAsync({
        ...(companyName.trim() ? { company_name: companyName.trim() } : {}),
        ...(branchName.trim() ? { branch_name: branchName.trim() } : {}),
        ...(departmentName.trim()
          ? { department_name: departmentName.trim() }
          : {}),
        ...(salespersonName.trim()
          ? { salesperson_name: salespersonName.trim() }
          : {}),
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
      {lookupsQuery.isLoading ? (
        <p className="text-[var(--color-neutral-400)]">Loading name dropdowns…</p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className={erpForm.label}>Company</span>
          <select
            className={erpForm.input}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {companies.map((c) => (
              <option key={`co-${optionValue(c)}`} value={optionValue(c)}>
                {namedLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={erpForm.label}>Branch</span>
          <select
            className={erpForm.input}
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {branches.map((b) => (
              <option key={`br-${optionValue(b)}`} value={optionValue(b)}>
                {namedLabel(b)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={erpForm.label}>Department</span>
          <select
            className={erpForm.input}
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {departments.map((d) => (
              <option key={`dep-${optionValue(d)}`} value={optionValue(d)}>
                {namedLabel(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-0">
          <span className={erpForm.label}>Salesperson</span>
          <select
            className={erpForm.input}
            value={salespersonName}
            onChange={(e) => setSalespersonName(e.target.value)}
            disabled={resources.patchDepartment.isPending}
          >
            <option value="">Select…</option>
            {salespeople.map((s) => (
              <option key={`sp-${optionValue(s)}-${s.email ?? ''}`} value={optionValue(s)}>
                {namedLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button
        type="button"
        size="sm"
        variant="create"
        leftIcon={<Save />}
        disabled={resources.patchDepartment.isPending}
        onClick={() => void save()}
      >
        {resources.patchDepartment.isPending ? 'Saving…' : 'Save department'}
      </Button>
    </div>
  );
}
