import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { hrService } from '@/features/hr/services/hr.service';
import { LOAN_STATUSES, labelEnum } from '@/features/hr/constants/hr.constants';
import {
  createLoanSchema,
  parseWithFieldErrors,
  type FieldErrors,
} from '@/features/hr/schemas/hr.schema';
import type { LoanRecord } from '@/features/hr/types/hr.types';

export default function LoansPage() {
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState<(typeof LOAN_STATUSES)[number]>('PENDING');
  const [createOpen, setCreateOpen] = useState(false);
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [tenureMonths, setTenureMonths] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loanEmployeeId, setLoanEmployeeId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleRows, setScheduleRows] = useState<Record<string, string>[]>([]);

  const { data: employees = [] } = useQuery({
    queryKey: ['hr', 'employees', 'loans'],
    queryFn: () => hrService.listEmployees({ limit: 100, status: 'ACTIVE' }),
  });

  const { data: loans = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'loans', employeeId, status],
    queryFn: () => hrService.listLoans(employeeId, status),
    enabled: Boolean(employeeId),
  });

  const { data: outstanding = [] } = useQuery({
    queryKey: ['hr', 'loans-outstanding'],
    queryFn: () => hrService.loansOutstandingReport(),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['hr', 'loans'] });
    void queryClient.invalidateQueries({ queryKey: ['hr', 'loans-outstanding'] });
  };

  const createLoan = useMutation({
    mutationFn: (payload: {
      employee_id: string;
      principal: number;
      interest_rate?: number;
      tenure_months: number;
      purpose?: string;
    }) => hrService.createLoan(payload),
    onSuccess: () => {
      setCreateOpen(false);
      setPrincipal('');
      setTenureMonths('');
      setPurpose('');
      setFieldErrors({});
      refresh();
    },
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not create loan.'),
  });

  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      action === 'approve' ? hrService.approveLoan(id) : hrService.rejectLoan(id),
    onSuccess: refresh,
    onError: (err) => setActionError(err instanceof Error ? err.message : 'Could not update loan.'),
  });

  const submitLoan = () => {
    setActionError(null);
    const parsed = parseWithFieldErrors(createLoanSchema, {
      employee_id: loanEmployeeId,
      principal: Number(principal),
      interest_rate: interestRate ? Number(interestRate) : undefined,
      tenure_months: Number(tenureMonths),
      purpose: purpose.trim() || undefined,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setActionError(parsed.message);
      return;
    }
    setFieldErrors({});
    createLoan.mutate({
      employee_id: parsed.data.employee_id,
      principal: parsed.data.principal!,
      interest_rate: parsed.data.interest_rate,
      tenure_months: parsed.data.tenure_months!,
      purpose: parsed.data.purpose,
    });
  };

  const viewSchedule = async (loan: LoanRecord) => {
    try {
      setActionError(null);
      const rows = await hrService.getLoanSchedule(loan.id);
      setScheduleRows(
        rows.map((item, index) => {
          if (!item || typeof item !== 'object') return { id: String(index), value: String(item) };
          const record = item as Record<string, unknown>;
          const out: Record<string, string> = { id: String(record.id ?? index) };
          for (const [key, value] of Object.entries(record)) {
            if (value != null && typeof value !== 'object') out[key] = String(value);
          }
          return out;
        }),
      );
      setScheduleId(loan.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not load schedule.');
    }
  };

  const outstandingRows = useMemo(
    () =>
      outstanding.map((item, index) => {
        if (!item || typeof item !== 'object') return { id: String(index), value: String(item) };
        const record = item as Record<string, unknown>;
        const out: Record<string, string> = { id: String(record.id ?? index) };
        for (const [key, value] of Object.entries(record)) {
          if (value != null && typeof value !== 'object') out[key] = String(value);
        }
        return out;
      }),
    [outstanding],
  );

  return (
    <div className="space-y-4">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-gray-800">Employee Loans</h1>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus size={14} className="mr-1" />
          New loan
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-md p-4 flex flex-wrap gap-3">
        <label className="text-sm flex flex-col gap-1">
          Employee
          <select
            className="border rounded px-2 py-1.5 min-w-[200px]"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          >
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.code || emp.id.slice(0, 8)})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex flex-col gap-1">
          Status
          <select
            className="border rounded px-2 py-1.5"
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof LOAN_STATUSES)[number])}
          >
            {LOAN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelEnum(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {!employeeId ? (
        <p className="text-sm text-gray-500">Select an employee to view loans.</p>
      ) : isLoading ? (
        <p className="text-sm text-gray-500">Loading loans…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{error instanceof Error ? error.message : 'Could not load loans.'}</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {['Employee', 'Principal', 'Rate %', 'Tenure', 'Purpose', 'Status', 'Actions'].map((col) => (
                  <th key={col} className="text-left px-4 py-2 font-semibold text-[#0A2942]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-gray-500 text-center">
                    No loans for this filter.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-gray-100">
                    <td className="px-4 py-2">{loan.employee}</td>
                    <td className="px-4 py-2">{loan.principal.toLocaleString()}</td>
                    <td className="px-4 py-2">{loan.interest_rate}</td>
                    <td className="px-4 py-2">{loan.tenure_months} mo</td>
                    <td className="px-4 py-2">{loan.purpose || '—'}</td>
                    <td className="px-4 py-2">{labelEnum(loan.status)}</td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      {loan.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            className="text-xs text-green-700 hover:underline"
                            onClick={() => review.mutate({ id: loan.id, action: 'approve' })}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-700 hover:underline"
                            onClick={() => review.mutate({ id: loan.id, action: 'reject' })}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => void viewSchedule(loan)}
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {outstandingRows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <h2 className="font-medium mb-3">Outstanding loans report</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(outstandingRows[0] ?? {})
                    .filter((k) => k !== 'id')
                    .slice(0, 8)
                    .map((col) => (
                      <th key={col} className="text-left px-3 py-2 font-semibold text-[#0A2942]">
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {outstandingRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    {Object.keys(outstandingRows[0] ?? {})
                      .filter((k) => k !== 'id')
                      .slice(0, 8)
                      .map((col) => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap">
                          {row[col] || '—'}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New employee loan">
        <div className="space-y-3">
          <label className="text-sm block">
            Employee
            <select
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={loanEmployeeId}
              onChange={(e) => setLoanEmployeeId(e.target.value)}
            >
              <option value="">Select…</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            {fieldErrors.employee_id && (
              <span className="text-red-600 text-xs">{fieldErrors.employee_id}</span>
            )}
          </label>
          <label className="text-sm block">
            Principal (AED)
            <input
              type="number"
              min={1}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
            {fieldErrors.principal && <span className="text-red-600 text-xs">{fieldErrors.principal}</span>}
          </label>
          <label className="text-sm block">
            Interest rate (%)
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </label>
          <label className="text-sm block">
            Tenure (months)
            <input
              type="number"
              min={1}
              className="mt-1 w-full border rounded px-2 py-1.5"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(e.target.value)}
            />
            {fieldErrors.tenure_months && (
              <span className="text-red-600 text-xs">{fieldErrors.tenure_months}</span>
            )}
          </label>
          <label className="text-sm block">
            Purpose
            <textarea
              className="mt-1 w-full border rounded px-2 py-1.5"
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitLoan} disabled={createLoan.isPending}>
              {createLoan.isPending ? 'Saving…' : 'Create loan'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(scheduleId)} onClose={() => setScheduleId(null)} title="Loan repayment schedule">
        {scheduleRows.length === 0 ? (
          <p className="text-sm text-gray-500">No schedule rows.</p>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(scheduleRows[0] ?? {})
                    .filter((k) => k !== 'id')
                    .map((col) => (
                      <th key={col} className="text-left px-2 py-1 font-semibold">
                        {col}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row) => (
                  <tr key={row.id} className="border-b">
                    {Object.keys(scheduleRows[0] ?? {})
                      .filter((k) => k !== 'id')
                      .map((col) => (
                        <td key={col} className="px-2 py-1 whitespace-nowrap">
                          {row[col] || '—'}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
