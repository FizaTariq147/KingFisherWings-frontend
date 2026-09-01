import { useState } from 'react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/widgets/FilterField';
import { DocumentationListState } from '@/features/documentation/components/DocumentationUi';
import { useAirCargoTracking } from '@/features/documentation/hooks/useDocumentation';
import {
  extractReportMetrics,
  extractReportRows,
  formatReportCell,
  formatReportLabel,
} from '@/features/documentation/utils/normalizeDocumentation';

export default function AirCargoTrackingPage() {
  const [mawb, setMawb] = useState('');
  const [applied, setApplied] = useState('');
  const query = useAirCargoTracking({ mawb_number: applied }, Boolean(applied));
  const metrics = extractReportMetrics(query.data);
  const rows = extractReportRows(query.data);

  return (
    <div className="space-y-3">
      <PageBackLink to="/documentation" label="Back to Documentation" />
      <div className="rounded-md border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="text-[17px] font-medium text-gray-800">Air Cargo Tracking</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 p-5">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            MAWB No.
            <TextInput value={mawb} onChange={(e) => setMawb(e.target.value)} className="w-52" />
          </label>
          <Button type="button" disabled={!mawb.trim()} onClick={() => setApplied(mawb.trim())}>
            Track
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Track results</h3>
        <DocumentationListState
          loading={query.isLoading}
          error={query.error}
          empty={!applied || (!query.isLoading && !query.error && metrics.length === 0 && rows.length === 0)}
          emptyMessage={applied ? 'No tracking data for this MAWB.' : 'Enter a MAWB number and click Track.'}
        />
        {metrics.length > 0 ? (
          <dl className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.key} className="rounded border border-gray-200 bg-gray-50 px-3 py-2">
                <dt className="text-xs uppercase text-gray-500">{m.label}</dt>
                <dd className="text-sm font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  {Object.keys(rows[0] ?? {}).map((col) => (
                    <th key={col} className="py-2 pr-4">{formatReportLabel(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Object.keys(rows[0] ?? {}).map((col) => (
                      <td key={col} className="py-2 pr-4">{formatReportCell(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
