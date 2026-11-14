import { useEffect, useMemo, useState } from 'react';
import { Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import { useJobLookupsDropdowns } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type {
  Job,
  JobDepartmentTabMeta,
  JobLookupNamedOption,
} from '../../types/job.types';
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

function displayName(value?: string | null): string {
  const v = value?.trim() || '';
  if (!v || isUuid(v)) return '';
  return v;
}

/** Map master rows → name options for PATCH *_name fields. */
function mastersToNamedOptions(
  rows: Array<Record<string, unknown>>,
): JobLookupNamedOption[] {
  const out: JobLookupNamedOption[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const name = String(
      row.name ?? row.display_name ?? row.displayName ?? row.label ?? '',
    ).trim();
    if (!name || isUuid(name) || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    const code = String(row.code ?? '').trim();
    const id = String(row.id ?? '').trim();
    out.push({
      name,
      ...(id && isUuid(id) ? { id } : {}),
      ...(code && !isUuid(code) ? { code } : {}),
    });
  }
  return out;
}

function labelForMasterId(
  rows: Array<Record<string, unknown>>,
  id: string | undefined,
): string {
  if (!id || !isUuid(id)) return '';
  const row = rows.find((r) => String(r.id ?? '') === id);
  if (!row) return '';
  return (
    String(row.name ?? row.display_name ?? row.displayName ?? row.label ?? '').trim() ||
    ''
  );
}

function mergeNamedOptions(
  primary: JobLookupNamedOption[],
  fallback: JobLookupNamedOption[],
): JobLookupNamedOption[] {
  if (!primary.length) return fallback;
  if (!fallback.length) return primary;
  const seen = new Set(primary.map((o) => o.name.toLowerCase()));
  const out = [...primary];
  for (const opt of fallback) {
    if (seen.has(opt.name.toLowerCase())) continue;
    seen.add(opt.name.toLowerCase());
    out.push(opt);
  }
  return out;
}

function readDepartmentTabMeta(
  tabData?: Record<string, unknown> | null,
): JobDepartmentTabMeta {
  if (!tabData) return {};
  const nested =
    tabData.data && typeof tabData.data === 'object' && !Array.isArray(tabData.data)
      ? (tabData.data as Record<string, unknown>)
      : tabData;
  const hintsRaw = nested.path_hints ?? tabData.path_hints;
  let path_hints: JobDepartmentTabMeta['path_hints'];
  if (hintsRaw && typeof hintsRaw === 'object' && !Array.isArray(hintsRaw)) {
    path_hints = hintsRaw as Record<string, string>;
  } else if (Array.isArray(hintsRaw)) {
    path_hints = hintsRaw.map(String);
  }
  const canPassRaw = nested.can_pass ?? nested.canPass ?? tabData.can_pass ?? tabData.canPass;
  // Explicit false hides pass; missing flag still shows UI (BE enforces authorize).
  const can_pass =
    canPassRaw === false || canPassRaw === 'false'
      ? false
      : canPassRaw === true || canPassRaw === 'true'
        ? true
        : undefined;
  return {
    ops_user_id: String(
      nested.ops_user_id ?? nested.opsUserId ?? tabData.ops_user_id ?? '',
    ).trim() || undefined,
    ops_user_name: String(
      nested.ops_user_name ?? nested.opsUserName ?? tabData.ops_user_name ?? '',
    ).trim() || undefined,
    can_pass,
    path_hints,
  };
}

/** Department tab — names from GET /jobs/lookups/dropdowns; PATCH + pass. */
export function JobDepartmentPanel({
  job,
  onChanged,
  tabData,
}: {
  job: Job;
  onChanged?: () => void;
  tabData?: Record<string, unknown> | null;
}) {
  const resources = useJobTabResourceMutations(job.id);
  const lookupsQuery = useJobLookupsDropdowns(true);
  const lookups = lookupsQuery.data;
  const tabMeta = useMemo(() => readDepartmentTabMeta(tabData), [tabData]);

  const { data: departmentMasters = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: branchMasters = [] } = useMasterOptions(
    'branches',
    MASTER_PATHS.branches,
    true,
  );

  const deptRows = departmentMasters as Array<Record<string, unknown>>;
  const branchRows = branchMasters as Array<Record<string, unknown>>;

  const resolvedDepartment =
    displayName(job.department_name) ||
    labelForMasterId(deptRows, job.department_id);
  const resolvedBranch =
    displayName(job.branch_name) || labelForMasterId(branchRows, job.branch_id);
  const resolvedCompany = displayName(job.company_name);
  const resolvedSalesperson = displayName(job.salesperson_name);
  const resolvedOpsUser =
    displayName(tabMeta.ops_user_name) ||
    displayName(job.ops_user_name) ||
    (tabMeta.ops_user_id || job.ops_user_id || '');

  const [companyName, setCompanyName] = useState(resolvedCompany);
  const [branchName, setBranchName] = useState(resolvedBranch);
  const [departmentName, setDepartmentName] = useState(resolvedDepartment);
  const [salespersonName, setSalespersonName] = useState(resolvedSalesperson);
  const [passBranchName, setPassBranchName] = useState(resolvedBranch);
  const [passDepartmentName, setPassDepartmentName] = useState(resolvedDepartment);
  const [passUserKey, setPassUserKey] = useState('');
  const [passNotes, setPassNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (resolvedCompany) setCompanyName(resolvedCompany);
    if (resolvedBranch) {
      setBranchName(resolvedBranch);
      setPassBranchName(resolvedBranch);
    }
    if (resolvedDepartment) {
      setDepartmentName(resolvedDepartment);
      setPassDepartmentName(resolvedDepartment);
    }
    if (resolvedSalesperson) setSalespersonName(resolvedSalesperson);
  }, [resolvedCompany, resolvedBranch, resolvedDepartment, resolvedSalesperson]);

  const companies = lookups?.companies ?? [];
  const salespeople = lookups?.salespeople ?? [];
  const employees = lookups?.employees ?? [];
  const branches = useMemo(
    () =>
      mergeNamedOptions(
        lookups?.branches ?? [],
        mastersToNamedOptions(branchRows),
      ),
    [lookups?.branches, branchRows],
  );
  const departments = useMemo(
    () =>
      mergeNamedOptions(
        lookups?.departments ?? [],
        mastersToNamedOptions(deptRows),
      ),
    [lookups?.departments, deptRows],
  );

  const pathHintsPass = Array.isArray(tabMeta.path_hints)
    ? tabMeta.path_hints.includes('pass')
    : Boolean(
        tabMeta.path_hints &&
          typeof tabMeta.path_hints === 'object' &&
          'pass' in tabMeta.path_hints,
      );
  // Hide only when BE explicitly denies; otherwise show (authorize on POST).
  const canPass = tabMeta.can_pass !== false || pathHintsPass;

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

  const pass = async () => {
    setError(null);
    setMsg(null);
    const branch = passBranchName.trim();
    const department = passDepartmentName.trim();
    const emp = employees.find(
      (e) =>
        (e.id && e.id === passUserKey) ||
        optionValue(e) === passUserKey ||
        `${optionValue(e)}|${e.email ?? ''}` === passUserKey,
    );
    if (!branch || !department || !passUserKey.trim()) {
      setError('Select branch, department, and assignee to pass this job.');
      return;
    }
    try {
      const branchOpt = branches.find((b) => optionValue(b) === branch);
      const deptOpt = departments.find((d) => optionValue(d) === department);
      await resources.passDepartment.mutateAsync({
        ...(branchOpt?.id && isUuid(branchOpt.id)
          ? { branch_id: branchOpt.id }
          : { branch_name: branch }),
        ...(deptOpt?.id && isUuid(deptOpt.id)
          ? { department_id: deptOpt.id }
          : { department_name: department }),
        ...(emp?.id && isUuid(emp.id)
          ? { user_id: emp.id }
          : { user_name: emp?.email || emp?.name || passUserKey.trim() }),
        ...(passNotes.trim() ? { notes: passNotes.trim() } : {}),
      });
      setMsg('Job passed to the selected department and assignee.');
      setPassNotes('');
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const busy =
    resources.patchDepartment.isPending || resources.passDepartment.isPending;

  return (
    <div className="space-y-4 text-[13px]">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      {lookupsQuery.isLoading ? (
        <p className="text-[var(--color-neutral-400)]">Loading name dropdowns…</p>
      ) : null}

      <ul className="divide-y divide-[#e8edf2] rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
        {[
          { label: 'Company', value: resolvedCompany },
          { label: 'Branch', value: resolvedBranch },
          { label: 'Department', value: resolvedDepartment },
          { label: 'Salesperson', value: resolvedSalesperson },
          { label: 'Ops assignee', value: resolvedOpsUser },
        ].map((row) => (
          <li
            key={row.label}
            className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
          >
            <span className="text-[12px] font-medium text-[#64748b]">{row.label}</span>
            <span className="break-words text-[13px] font-medium text-[#0f172a]">
              {row.value || '—'}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Edit
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className={erpForm.label}>Company</span>
            <select
              className={erpForm.input}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
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
      </div>

      <Button
        type="button"
        size="sm"
        variant="create"
        leftIcon={<Save />}
        disabled={busy}
        onClick={() => void save()}
      >
        {resources.patchDepartment.isPending ? 'Saving…' : 'Save department'}
      </Button>

      {canPass ? (
        <div className="space-y-2 border-t border-[var(--fresa-border,#C9D3DF)] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
            Pass to another department
          </p>
          <p className="text-[12px] text-[#64748b]">
            Sets org department + branch and assigns an ops user. Assignee lists handed-off
            jobs with “Assigned to me” (ops_user_id).
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className={erpForm.label}>Target branch</span>
              <select
                className={erpForm.input}
                value={passBranchName}
                onChange={(e) => setPassBranchName(e.target.value)}
                disabled={busy}
              >
                <option value="">Select…</option>
                {branches.map((b) => (
                  <option key={`pass-br-${optionValue(b)}`} value={optionValue(b)}>
                    {namedLabel(b)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className={erpForm.label}>Target department</span>
              <select
                className={erpForm.input}
                value={passDepartmentName}
                onChange={(e) => setPassDepartmentName(e.target.value)}
                disabled={busy}
              >
                <option value="">Select…</option>
                {departments.map((d) => (
                  <option key={`pass-dep-${optionValue(d)}`} value={optionValue(d)}>
                    {namedLabel(d)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={erpForm.label}>Assignee (ops user)</span>
              <select
                className={erpForm.input}
                value={passUserKey}
                onChange={(e) => setPassUserKey(e.target.value)}
                disabled={busy}
              >
                <option value="">Select…</option>
                {employees.map((e) => {
                  const key = e.id || `${optionValue(e)}|${e.email ?? ''}`;
                  return (
                    <option key={`pass-user-${key}`} value={key}>
                      {namedLabel(e)}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={erpForm.label}>Notes (optional)</span>
              <textarea
                className={erpForm.input}
                rows={2}
                value={passNotes}
                onChange={(e) => setPassNotes(e.target.value)}
                disabled={busy}
                maxLength={1000}
                placeholder="Handoff notes for audit / assignee"
              />
            </label>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<Send />}
            disabled={busy}
            onClick={() => void pass()}
          >
            {resources.passDepartment.isPending ? 'Passing…' : 'Pass job'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
