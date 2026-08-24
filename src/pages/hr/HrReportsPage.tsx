import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { hrService } from '@/features/hr/services/hr.service';
import { ReportsPageBackLink } from '@/features/reports/components/ReportsPageBackLink';

function asRows(raw: unknown[]): Record<string, string>[] {
  return raw.map((item, index) => {
    if (!item || typeof item !== 'object') return { id: String(index), value: String(item) };
    const record = item as Record<string, unknown>;
    const out: Record<string, string> = { id: String(record.id ?? index) };
    for (const [key, value] of Object.entries(record)) {
      if (value == null) continue;
      if (typeof value === 'object') continue;
      out[key] = String(value);
    }
    return out;
  });
}

function SimpleTable({ rows }: { rows: Record<string, string>[] }) {
  const columns = useMemo(() => {
    const keys = new Set<string>();
    rows.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));
    keys.delete('id');
    return Array.from(keys).slice(0, 8);
  }, [rows]);

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 py-6">No rows.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((col) => (
              <th key={col} className="text-left px-3 py-2 font-semibold text-[#0A2942]">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 whitespace-nowrap">{row[col] || '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HrReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [days, setDays] = useState(90);
  const [absentDate, setAbsentDate] = useState(today);

  const expiry = useQuery({
    queryKey: ['hr', 'document-expiry', days],
    queryFn: () => hrService.documentExpiryReport(days),
  });
  const absent = useQuery({
    queryKey: ['hr', 'absent-report', absentDate],
    queryFn: () => hrService.absentReport(absentDate),
  });
  const missing = useQuery({
    queryKey: ['hr', 'timesheets-missing'],
    queryFn: () => hrService.timesheetsMissingReport(),
  });

  return (
    <div className="space-y-4">
      <ReportsPageBackLink fallbackTo="/hr" fallbackLabel="Back to HR" />
      <h1 className="text-sm font-semibold text-gray-800">Reports - HR</h1>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Document expiry</h2>
          <label className="text-sm flex items-center gap-2">
            Within days
            <input
              type="number"
              min={1}
              max={365}
              className="w-20 border rounded px-2 py-1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 90)}
            />
          </label>
        </div>
        {expiry.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {expiry.isError && (
          <p className="text-sm text-red-600">
            {expiry.error instanceof Error ? expiry.error.message : 'Could not load report.'}
          </p>
        )}
        {expiry.data && <SimpleTable rows={asRows(expiry.data)} />}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Absent report</h2>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={absentDate}
            onChange={(e) => setAbsentDate(e.target.value)}
          />
        </div>
        {absent.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {absent.isError && (
          <p className="text-sm text-red-600">
            {absent.error instanceof Error ? absent.error.message : 'Could not load report.'}
          </p>
        )}
        {absent.data && <SimpleTable rows={asRows(absent.data)} />}
      </Card>

      <Card>
        <h2 className="font-medium mb-3">Missing timesheets</h2>
        {missing.isLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {missing.isError && (
          <p className="text-sm text-red-600">
            {missing.error instanceof Error ? missing.error.message : 'Could not load report.'}
          </p>
        )}
        {missing.data && <SimpleTable rows={asRows(missing.data)} />}
      </Card>
    </div>
  );
}
