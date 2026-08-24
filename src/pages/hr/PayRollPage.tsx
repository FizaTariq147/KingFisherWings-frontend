import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { DollarSign, Copy, FileCheck, Upload, Plus, Search, Heart } from 'lucide-react';
import { hrService } from '../../features/hr/services/hr.service';
import type { PayrollRunRecord } from '../../features/hr/types/hr.types';
import {
  createPayrollRunSchema,
  parseWithFieldErrors,
  payrollGlSettingSchema,
  payslipEmailSchema,
  type FieldErrors,
} from '../../features/hr/schemas/hr.schema';
import { useAuthStore } from '@/store/authStore';
import { companyIdFromAccessToken } from '@/lib/tenantFromAuth';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';

function formatGratuity(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { result: String(value ?? '—') };
  }
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry == null) continue;
    if (typeof entry === 'object') {
      out[key] = JSON.stringify(entry);
    } else {
      out[key] = String(entry);
    }
  }
  return out;
}

export default function PayRollPage() {
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [glOpen, setGlOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [payYear, setPayYear] = useState(String(new Date().getFullYear()));
  const [payMonth, setPayMonth] = useState(String(new Date().getMonth() + 1));
  const [payCurrency, setPayCurrency] = useState('AED');
  const [payCompanyId, setPayCompanyId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [payslipEmployeeId, setPayslipEmployeeId] = useState('');
  const [gratuityEmployeeId, setGratuityEmployeeId] = useState('');
  const [gratuityAsOf, setGratuityAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [gratuityResult, setGratuityResult] = useState<Record<string, string> | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [glCompanyId, setGlCompanyId] = useState('');
  const [glSalaryExpense, setGlSalaryExpense] = useState('');
  const [glPayable, setGlPayable] = useState('');
  const [glDeduction, setGlDeduction] = useState('');
  const [glBonusPercent, setGlBonusPercent] = useState('');
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const sessionCompanyId = useAuthStore((s) => s.user?.companyId) || companyIdFromAccessToken(accessToken);

  const resolveCreateCompanyId = () => payCompanyId.trim() || sessionCompanyId || '';

  const { data: companies = [], isLoading: companiesLoading } = useTenantCompanies(createOpen);

  useEffect(() => {
    if (!createOpen || companies.length === 0) return;
    setPayCompanyId((current) => {
      if (current && companies.some((company) => company.id === current)) return current;
      if (sessionCompanyId && companies.some((company) => company.id === sessionCompanyId)) {
        return sessionCompanyId;
      }
      return companies.length === 1 ? companies[0]!.id : current;
    });
  }, [createOpen, companies, sessionCompanyId]);

  const { data: runs = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'payroll-runs'],
    queryFn: () => hrService.listPayrollRuns(),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'payroll'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const selected = useMemo(
    () => runs.find((run) => run.id === selectedId) ?? runs[0] ?? null,
    [runs, selectedId],
  );

  const { data: runDetail, isFetching: detailLoading } = useQuery({
    queryKey: ['hr', 'payroll-run', selected?.id],
    queryFn: () => hrService.getPayrollRun(selected!.id),
    enabled: Boolean(selected?.id),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-runs'] });
    if (selected?.id) {
      void queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-run', selected.id] });
    }
  };

  const createRun = useMutation({
    mutationFn: (dto: {
      payroll_year: number;
      payroll_month: number;
      currency_code: string;
      company_id?: string;
    }) => hrService.createPayrollRun(dto),
    onSuccess: (run) => {
      setActionError(null);
      setActionMessage('Payroll run created.');
      setCreateOpen(false);
      if (run?.id) setSelectedId(run.id);
      void refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not create payroll run.'),
  });

  const runAction = async (fn: (run: PayrollRunRecord) => Promise<void>, success: string, fallback: string) => {
    if (!selected) {
      setActionError('Select or create a payroll run first.');
      return;
    }
    try {
      setActionError(null);
      setActionMessage(null);
      await fn(selected);
      setActionMessage(success);
      void refresh();
    } catch (err) {
      setActionMessage(null);
      setActionError(err instanceof Error ? err.message : fallback);
    }
  };

  const submitCreate = () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(createPayrollRunSchema, {
      payroll_year: Number(payYear),
      payroll_month: Number(payMonth),
      currency_code: payCurrency.trim() || 'AED',
      company_id: resolveCreateCompanyId() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    const duplicate = runs.some(
      (run) =>
        Number(run.year) === parsed.data.payroll_year &&
        Number(run.month) === parsed.data.payroll_month,
    );
    if (duplicate) {
      setActionError(
        `A payroll run already exists for ${parsed.data.payroll_month}/${parsed.data.payroll_year}. Select it from the list or choose another month.`,
      );
      return;
    }
    if (!resolveCreateCompanyId()) {
      setActionError(
        companies.length === 0
          ? 'No company profile found for your tenant. Ask your Tenant Admin to set up a company first.'
          : 'Select a company for this payroll run.',
      );
      return;
    }
    setFieldErrors({});
    createRun.mutate({
      payroll_year: parsed.data.payroll_year,
      payroll_month: parsed.data.payroll_month,
      currency_code: parsed.data.currency_code,
      company_id: resolveCreateCompanyId(),
    });
  };

  const submitGlSettings = async () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(payrollGlSettingSchema, {
      company_id: glCompanyId,
      salary_expense_account_id: glSalaryExpense,
      payroll_payable_account_id: glPayable,
      deduction_account_id: glDeduction,
      bonus_percent_per_score_point: glBonusPercent ? Number(glBonusPercent) : undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    try {
      await hrService.savePayrollGlSettings({
        company_id: parsed.data.company_id,
        salary_expense_account_id: parsed.data.salary_expense_account_id,
        payroll_payable_account_id: parsed.data.payroll_payable_account_id,
        deduction_account_id: parsed.data.deduction_account_id,
        bonus_percent_per_score_point: parsed.data.bonus_percent_per_score_point,
      });
      setGlOpen(false);
      setActionMessage('GL settings saved.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save GL settings.');
    }
  };

  const submitEmailPayslip = async () => {
    if (!selected || !payslipEmployeeId) {
      setActionError('Select a payroll run and employee.');
      return;
    }
    setActionError(null);
    const parsed = parseWithFieldErrors(payslipEmailSchema, {
      subject: emailSubject.trim() || undefined,
      body: emailBody.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    try {
      await hrService.emailPayslip(selected.id, payslipEmployeeId, parsed.data);
      setEmailOpen(false);
      setEmailSubject('');
      setEmailBody('');
      setActionMessage('Payslip email queued.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not email payslip.');
    }
  };

  const lookupGratuity = async () => {
    if (!gratuityEmployeeId) {
      setActionError('Select an employee for gratuity lookup.');
      return;
    }
    try {
      setActionError(null);
      const [queryResult, pathResult] = await Promise.allSettled([
        hrService.getGratuity(gratuityEmployeeId, gratuityAsOf),
        hrService.getEmployeeGratuity(gratuityEmployeeId, gratuityAsOf),
      ]);
      const primary =
        queryResult.status === 'fulfilled' ? queryResult.value : pathResult.status === 'fulfilled' ? pathResult.value : null;
      if (!primary) {
        const err =
          queryResult.status === 'rejected'
            ? queryResult.reason
            : pathResult.status === 'rejected'
              ? pathResult.reason
              : new Error('Gratuity lookup failed.');
        throw err instanceof Error ? err : new Error('Gratuity lookup failed.');
      }
      setGratuityResult(formatGratuity(primary));
      setActionMessage('Gratuity calculated.');
    } catch (err) {
      setGratuityResult(null);
      setActionError(err instanceof Error ? err.message : 'Gratuity lookup failed.');
    }
  };

  const now = new Date();
  const openCreateModal = (year: number, month: number, currency: string) => {
    setPayYear(String(year));
    setPayMonth(String(month));
    setPayCurrency(currency);
    setPayCompanyId(sessionCompanyId || '');
    setFieldErrors({});
    setCreateOpen(true);
  };

  const prepare = () => {
    openCreateModal(now.getFullYear(), now.getMonth() + 1, 'AED');
  };

  const copy = () => {
    const month = selected ? Number(selected.month) : now.getMonth() + 1;
    const year = selected ? Number(selected.year) : now.getFullYear();
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    openCreateModal(nextYear, nextMonth, selected?.currency ?? 'AED');
  };

  const exportTimesheets = async () => {
    if (!selected) {
      setActionError('Select a payroll run first.');
      return;
    }
    try {
      setActionError(null);
      await hrService.exportTimesheetsToPayroll(Number(selected.year), Number(selected.month));
      setActionMessage('Timesheets exported to payroll.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Timesheet export failed.');
    }
  };

  const exportOt = async () => {
    if (!selected) {
      setActionError('Select a payroll run first.');
      return;
    }
    try {
      setActionError(null);
      await hrService.exportTimesheetsPayrollOt(Number(selected.year), Number(selected.month));
      setActionMessage('Overtime exported to payroll.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'OT export failed.');
    }
  };

  const lines = runDetail?.lines ?? [];

  return (
    <div className="space-y-3">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-wrap gap-2">
          <h2 className="text-[17px] font-medium text-gray-800">Pay Roll List</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={prepare}
              disabled={createRun.isPending}
              className="flex items-center gap-1.5 bg-green-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity disabled:opacity-50"
            >
              <DollarSign size={14} />
              Prepare Payroll
            </button>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 bg-orange-500 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Copy size={14} />
              Copy Payroll
            </button>
            <button
              type="button"
              onClick={() => setGlOpen(true)}
              className="flex items-center gap-1.5 bg-slate-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              GL Settings
            </button>
            <button
              type="button"
              onClick={() =>
                void runAction(
                  (run) => hrService.downloadWps(run.id, run.year, run.month),
                  'WPS file downloaded.',
                  'WPS export failed.',
                )
              }
              className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <FileCheck size={14} />
              Generate WPS
            </button>
            <button
              type="button"
              onClick={() =>
                void runAction(
                  (run) => hrService.downloadWpsSif(run.id, run.year, run.month),
                  'WPS SIF downloaded.',
                  'WPS SIF export failed.',
                )
              }
              className="flex items-center gap-1.5 bg-purple-400 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Upload size={14} />
              WPS SIF
            </button>
            <button
              type="button"
              onClick={prepare}
              className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        {selected && (
          <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-200">
            <span className="text-sm text-gray-600 self-center mr-2">
              Run {selected.year}-{String(selected.month).padStart(2, '0')} · {selected.status}
            </span>
            <button
              type="button"
              onClick={() =>
                void runAction((run) => hrService.generatePayrollFull(run.id), 'Payroll generated.', 'Generate failed.')
              }
              className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
            >
              Generate (full)
            </button>
            <button
              type="button"
              onClick={() =>
                void runAction((run) => hrService.generatePayroll(run.id), 'Payroll lines generated.', 'Generate lines failed.')
              }
              className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
            >
              Generate lines
            </button>
            <button
              type="button"
              onClick={() => void runAction((run) => hrService.finalizePayroll(run.id), 'Payroll finalized.', 'Finalize failed.')}
              className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
            >
              Finalize
            </button>
            <button
              type="button"
              onClick={() => void runAction((run) => hrService.postPayrollGl(run.id), 'GL posted.', 'GL post failed.')}
              className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
            >
              Post GL
            </button>
            <button type="button" onClick={() => void exportTimesheets()} className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50">
              Export timesheets
            </button>
            <button type="button" onClick={() => void exportOt()} className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50">
              Export OT
            </button>
          </div>
        )}

        {actionError && <p className="px-5 py-2 text-sm text-red-600">{actionError}</p>}
        {actionMessage && !actionError && <p className="px-5 py-2 text-sm text-green-700">{actionMessage}</p>}

        {isLoading ? (
          <div className="flex items-center justify-center h-56 text-sm text-gray-500">Loading payroll runs…</div>
        ) : isError ? (
          <div className="flex items-center justify-center h-56 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Could not load payroll runs.'}
          </div>
        ) : runs.length === 0 ? (
          <div className="flex items-center justify-center h-56">
            <Search size={40} className="text-gray-300" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Year', 'Month', 'Status', 'Currency'].map((col) => (
                  <th key={col} className="text-left font-semibold text-[#0A2942] px-4 py-2.5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className={`border-b border-gray-100 cursor-pointer ${
                    selected?.id === run.id ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedId(run.id)}
                >
                  <td className="px-4 py-2">{run.year}</td>
                  <td className="px-4 py-2">{run.month}</td>
                  <td className="px-4 py-2">{run.status}</td>
                  <td className="px-4 py-2">{run.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#0A2942]">Run detail</h3>
            {detailLoading ? (
              <p className="text-sm text-gray-500">Loading run detail…</p>
            ) : lines.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Employee</th>
                    <th className="text-right py-2">Gross</th>
                    <th className="text-right py-2">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id ?? line.employee_id} className="border-b border-gray-100">
                      <td className="py-2">{line.employee_name || line.employee_id}</td>
                      <td className="py-2 text-right">{line.gross_pay.toLocaleString()}</td>
                      <td className="py-2 text-right">{line.net_pay.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-500">No payroll lines yet. Generate payroll to populate lines.</p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#0A2942]">Payslips</h3>
            <label className="block text-sm">
              <span className="block text-xs text-gray-600 mb-1">Employee</span>
              <select
                className="w-full h-9 border rounded px-3"
                value={payslipEmployeeId}
                onChange={(e) => setPayslipEmployeeId(e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name || `${emp.firstName} ${emp.lastName}`.trim()} ({emp.code})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={!payslipEmployeeId}
                onClick={() =>
                  void runAction(
                    (run) => hrService.generatePayslip(run.id, payslipEmployeeId),
                    'Payslip generated.',
                    'Payslip generation failed.',
                  )
                }
              >
                Generate payslip
              </Button>
              <Button size="sm" variant="secondary" disabled={!payslipEmployeeId} onClick={() => setEmailOpen(true)}>
                Email payslip
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-5 space-y-3 lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0A2942]">Gratuity lookup</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <label className="block text-sm min-w-[200px]">
                <span className="block text-xs text-gray-600 mb-1">Employee</span>
                <select
                  className="w-full h-9 border rounded px-3"
                  value={gratuityEmployeeId}
                  onChange={(e) => setGratuityEmployeeId(e.target.value)}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name || `${emp.firstName} ${emp.lastName}`.trim()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="block text-xs text-gray-600 mb-1">As of</span>
                <input
                  type="date"
                  className="h-9 border rounded px-3"
                  value={gratuityAsOf}
                  onChange={(e) => setGratuityAsOf(e.target.value)}
                />
              </label>
              <Button size="sm" onClick={() => void lookupGratuity()}>
                Calculate gratuity
              </Button>
            </div>
            {gratuityResult && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mt-2">
                {Object.entries(gratuityResult).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2 border-b border-gray-100 py-1">
                    <dt className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</dt>
                    <dd className="font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create payroll run"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={createRun.isPending || companiesLoading || companies.length === 0}
              onClick={submitCreate}
            >
              {createRun.isPending ? 'Creating…' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Year *</span>
            <input
              type="number"
              className={`w-full h-9 border rounded px-3 ${fieldErrors.payroll_year ? 'border-red-400' : ''}`}
              value={payYear}
              onChange={(e) => setPayYear(e.target.value)}
            />
            {fieldErrors.payroll_year ? <span className="text-xs text-red-600">{fieldErrors.payroll_year}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Month *</span>
            <select
              className={`w-full h-9 border rounded px-3 ${fieldErrors.payroll_month ? 'border-red-400' : ''}`}
              value={payMonth}
              onChange={(e) => setPayMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {fieldErrors.payroll_month ? <span className="text-xs text-red-600">{fieldErrors.payroll_month}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Currency</span>
            <input
              className={`w-full h-9 border rounded px-3 uppercase ${fieldErrors.currency_code ? 'border-red-400' : ''}`}
              maxLength={3}
              value={payCurrency}
              onChange={(e) => setPayCurrency(e.target.value.toUpperCase())}
            />
            {fieldErrors.currency_code ? <span className="text-xs text-red-600">{fieldErrors.currency_code}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Company *</span>
            {companiesLoading ? (
              <p className="text-sm text-gray-500 py-2">Loading companies…</p>
            ) : companies.length === 0 ? (
              <p className="text-sm text-amber-700 py-2">
                No company found for your tenant. Ask your Tenant Admin to set up a company profile.
              </p>
            ) : (
              <select
                className={`w-full h-9 border rounded px-3 ${fieldErrors.company_id ? 'border-red-400' : ''}`}
                value={payCompanyId}
                onChange={(e) => setPayCompanyId(e.target.value)}
              >
                <option value="">Select company…</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.code ? `${company.name} (${company.code})` : company.name}
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.company_id ? <span className="text-xs text-red-600">{fieldErrors.company_id}</span> : null}
          </label>
        </div>
      </Modal>

      <Modal
        open={glOpen}
        onClose={() => setGlOpen(false)}
        title="Payroll GL settings"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGlOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitGlSettings()}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          {(
            [
              ['company_id', 'Company ID (UUID)', glCompanyId, setGlCompanyId],
              ['salary_expense_account_id', 'Salary expense account ID', glSalaryExpense, setGlSalaryExpense],
              ['payroll_payable_account_id', 'Payroll payable account ID', glPayable, setGlPayable],
              ['deduction_account_id', 'Deduction account ID', glDeduction, setGlDeduction],
            ] as const
          ).map(([key, label, value, setter]) => (
            <label key={key} className="block text-sm">
              <span className="block text-xs text-gray-600 mb-1">{label} *</span>
              <input
                className={`w-full h-9 border rounded px-3 ${fieldErrors[key] ? 'border-red-400' : ''}`}
                value={value}
                onChange={(e) => setter(e.target.value)}
              />
              {fieldErrors[key] ? <span className="text-xs text-red-600">{fieldErrors[key]}</span> : null}
            </label>
          ))}
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Bonus % per score point</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="w-full h-9 border rounded px-3"
              value={glBonusPercent}
              onChange={(e) => setGlBonusPercent(e.target.value)}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Email payslip"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEmailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitEmailPayslip()}>Send</Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Subject (optional)</span>
            <input
              className={`w-full h-9 border rounded px-3 ${fieldErrors.subject ? 'border-red-400' : ''}`}
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
            {fieldErrors.subject ? <span className="text-xs text-red-600">{fieldErrors.subject}</span> : null}
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Body (optional)</span>
            <textarea
              className={`w-full border rounded px-3 py-2 min-h-[100px] ${fieldErrors.body ? 'border-red-400' : ''}`}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
            {fieldErrors.body ? <span className="text-xs text-red-600">{fieldErrors.body}</span> : null}
          </label>
        </div>
      </Modal>
    </div>
  );
}
