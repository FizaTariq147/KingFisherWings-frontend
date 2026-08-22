import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Upload, Search, Heart } from 'lucide-react';
import { hrService } from '../../features/hr/services/hr.service';
import { SALARY_COMPONENT_CODES, labelEnum } from '../../features/hr/constants/hr.constants';
import {
  parseWithFieldErrors,
  salaryComponentSchema,
  type FieldErrors,
} from '../../features/hr/schemas/hr.schema';

export default function SalaryLedgerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState('50');
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<(typeof SALARY_COMPONENT_CODES)[number]>('BASIC');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const now = new Date();
  const { data: components = [], isLoading, isError, error: loadError } = useQuery({
    queryKey: ['hr', 'salary-components'],
    queryFn: () => hrService.listSalaryComponents(),
  });

  const seed = useMutation({
    mutationFn: () => hrService.seedSalaryComponents(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hr', 'salary-components'] }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Seed failed.'),
  });

  const save = useMutation({
    mutationFn: (payload: { code: (typeof SALARY_COMPONENT_CODES)[number]; name: string; is_earning: boolean }) =>
      hrService.upsertSalaryComponent(payload),
    onSuccess: () => {
      setOpen(false);
      setName('');
      setFieldErrors({});
      void queryClient.invalidateQueries({ queryKey: ['hr', 'salary-components'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save component.'),
  });

  const submitComponent = () => {
    setError(null);
    const parsed = parseWithFieldErrors(salaryComponentSchema, {
      code,
      name: name.trim() || labelEnum(code),
      is_earning: true,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setError(parsed.message);
      return;
    }
    setFieldErrors({});
    save.mutate({
      code: parsed.data.code,
      name: parsed.data.name,
      is_earning: parsed.data.is_earning,
    });
  };

  const exportPayroll = useMutation({
    mutationFn: () => hrService.exportTimesheetsToPayroll(now.getFullYear(), now.getMonth() + 1),
    onError: (err) => setError(err instanceof Error ? err.message : 'Timesheet export failed.'),
  });

  const exportOt = useMutation({
    mutationFn: () => hrService.exportTimesheetsPayrollOt(now.getFullYear(), now.getMonth() + 1),
    onError: (err) => setError(err instanceof Error ? err.message : 'OT export failed.'),
  });

  const filtered = components.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${item.code} ${item.name}`.toLowerCase().includes(q);
  }).slice(0, Number(rows) || 50);

  return (
    <div className="space-y-3">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-[17px] font-medium text-gray-800">Salary Ledger List</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportPayroll.mutate()}
              className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Upload size={14} />
              {exportPayroll.isPending ? 'Exporting…' : 'Export timesheets'}
            </button>
            <button
              type="button"
              onClick={() => exportOt.mutate()}
              className="flex items-center gap-1.5 bg-purple-500 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <Upload size={14} />
              {exportOt.isPending ? 'Exporting…' : 'Export OT'}
            </button>
            <Button size="sm" variant="secondary" onClick={() => seed.mutate()} disabled={seed.isPending}>
              {seed.isPending ? 'Seeding…' : 'Seed components'}
            </Button>
            <Button size="sm" onClick={() => { setError(null); setFieldErrors({}); setOpen(true); }}>
              Add component
            </Button>
          </div>
        </div>

        {error && <p className="px-5 pt-3 text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <span className="text-sm text-gray-500 ml-2">Rows</span>
            <select
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option>5</option>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-56 text-sm text-gray-500">Loading salary components…</div>
        ) : isError ? (
          <div className="flex items-center justify-center h-56 text-sm text-red-600">
            {loadError instanceof Error ? loadError.message : 'Could not load salary components.'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-56">
            <Search size={40} className="text-gray-300" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Code', 'Name', 'Type', 'Order'].map((col) => (
                  <th key={col} className="text-left font-semibold text-[#0A2942] px-4 py-2.5">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="px-4 py-2">{item.code}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.is_earning ? 'Earning' : 'Deduction'}</td>
                  <td className="px-4 py-2">{item.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4">
        <button type="button" className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Salary component"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={save.isPending} onClick={submitComponent}>
              {save.isPending ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Code</span>
            <select className="w-full h-9 border rounded px-3" value={code} onChange={(e) => setCode(e.target.value as typeof code)}>
              {SALARY_COMPONENT_CODES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="block text-xs text-gray-600 mb-1">Name *</span>
            <input
              className={`w-full h-9 border rounded px-3 ${fieldErrors.name ? 'border-red-400' : ''}`}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={labelEnum(code)}
            />
            {fieldErrors.name ? (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.name}</span>
            ) : null}
          </label>
        </div>
      </Modal>
    </div>
  );
}
