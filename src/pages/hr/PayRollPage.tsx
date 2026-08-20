import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { DollarSign, Copy, FileCheck, Upload, Plus, Search, ChevronDown, Maximize2, Heart } from 'lucide-react';
import { SelectInput, DateInput } from '../../components/widgets/FilterField';
import { hrService } from '../../features/hr/services/hr.service';
import { axiosInstance } from '@/lib/axios';
import { HR_API } from '../../features/hr/api/hr.api';

export default function PayRollPage() {
  const [actionError, setActionError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: runs = [], isLoading, isError, error } = useQuery({
    queryKey: ['hr', 'payroll-runs'],
    queryFn: () => hrService.listPayrollRuns(),
  });
  const createRun = useMutation({
    mutationFn: () => {
      const now = new Date();
      return hrService.createPayrollRun({
        payroll_year: now.getFullYear(),
        payroll_month: now.getMonth() + 1,
        currency_code: 'AED',
      });
    },
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-runs'] });
    },
    onError: (err) => {
      setActionError(err instanceof Error ? err.message : 'Could not create payroll run.');
    },
  });

  const downloadWps = async () => {
    const run = runs[0];
    if (!run) {
      setActionError('Create a payroll run first.');
      return;
    }
    try {
      const { data } = await axiosInstance.get(HR_API.payrollRunWpsExport(run.id), {
        responseType: 'blob',
      });
      const blob = data instanceof Blob ? data : new Blob([data]);
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `wps-${run.year}-${run.month}.xlsx`;
      a.click();
      URL.revokeObjectURL(href);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'WPS export failed.');
    }
  };

  const visible = runs;

  return (
    <div className="space-y-3">
      <PageBackLink to="/hr" label="Back to HR" />
      <div className="bg-white border border-gray-200 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-wrap gap-2">
          <h2 className="text-[17px] font-medium text-gray-800">Pay Roll List</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => createRun.mutate()}
              disabled={createRun.isPending}
              className="flex items-center gap-1.5 bg-green-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity disabled:opacity-50"
            >
              <DollarSign size={14} />
              {createRun.isPending ? 'Creating…' : 'Prepare Payroll'}
            </button>
            <button className="flex items-center gap-1.5 bg-orange-500 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Copy size={14} />
              Copy Payroll
            </button>
            <button
              type="button"
              onClick={() => void downloadWps()}
              className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
            >
              <FileCheck size={14} />
              Generate WPS
            </button>
            <button className="flex items-center gap-1.5 bg-purple-400 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Upload size={14} />
              Upload Payroll
            </button>
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
              <Plus size={14} />
              Create
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="p-5 flex flex-wrap items-start gap-x-8 gap-y-3">
          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Employee Name</span>
            <div className="w-64">
              <SelectInput options={['Select']} />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Salary Month</span>
            <div className="w-40">
              <SelectInput options={['--Select--']} />
            </div>
          </label>

          <label className="flex items-start gap-3">
            <span className="text-sm text-gray-700 pt-2">Salary Date</span>
            <div className="w-40">
              <DateInput value="" />
            </div>
          </label>
        </div>

        {/* Search toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-white">
              <Search size={13} />
              <ChevronDown size={12} />
            </button>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            />
            <button className="bg-gray-100 border border-gray-300 hover:bg-gray-200 text-sm px-4 py-1.5 rounded text-gray-700 transition-colors">
              Search
            </button>
            <button className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-600 bg-white">
              Options
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-[#0A2942] hover:opacity-90 text-white text-sm px-5 py-1.5 rounded transition-opacity">
              <span className="text-[#FF751F]">➜</span>
              Submit
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {actionError && (
          <p className="px-5 py-2 text-sm text-red-600">{actionError}</p>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center h-56 text-sm text-gray-500">Loading payroll runs…</div>
        ) : isError ? (
          <div className="flex items-center justify-center h-56 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Could not load payroll runs.'}
          </div>
        ) : visible.length === 0 ? (
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
              {visible.map((run) => (
                <tr key={run.id} className="border-b border-gray-100">
                  <td className="px-4 py-2">{run.year}</td>
                  <td className="px-4 py-2">{run.month}</td>
                  <td className="px-4 py-2">{run.status}</td>
                  <td className="px-4 py-2">{run.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Legend footnote */}
        <div className="px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            *CL - Casual Leave *SL - Sick Leave *PL - Privilege leaves
          </p>
        </div>
      </div>

      {/* Floating Favorites button */}
      <div className="mt-4">
        <button className="flex items-center gap-1.5 bg-purple-700 hover:opacity-90 text-white text-sm px-4 py-2 rounded transition-opacity">
          <Heart size={14} />
          Favorites
        </button>
      </div>
    </div>
  );
}