import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useJobPnl, useJobPnlCustomDuty } from '../../hooks/useJobs';
import { ApiDataView } from '../ApiDataView';

interface JobPnlPanelProps {
  jobId: string;
}

export function JobPnlPanel({ jobId }: JobPnlPanelProps) {
  const { data: pnl, isLoading, isError } = useJobPnl(jobId);
  const customDutyQuery = useJobPnlCustomDuty(jobId);

  if (isLoading) return <p className="text-sm text-[var(--color-neutral-400)]">Loading P&L…</p>;
  if (isError || !pnl) return <p className="text-sm text-[var(--color-danger-600)]">P&L unavailable.</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profit &amp; loss</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 grid gap-2 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-[var(--color-neutral-400)] text-xs">Revenue</p>
            <p className="font-semibold">
              {pnl.currency_code || ''} {pnl.revenue?.toLocaleString() ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-neutral-400)] text-xs">Cost</p>
            <p className="font-semibold">
              {pnl.currency_code || ''} {pnl.cost?.toLocaleString() ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-neutral-400)] text-xs">Gross profit</p>
            <p className="font-semibold">
              {pnl.currency_code || ''} {pnl.gross_profit?.toLocaleString() ?? '—'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom duty P&amp;L</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 text-sm">
          {customDutyQuery.isLoading ? (
            <p className="text-[var(--color-neutral-400)]">Loading custom duty…</p>
          ) : customDutyQuery.isError ? (
            <p className="text-[var(--color-neutral-400)]">Custom duty P&amp;L unavailable.</p>
          ) : (
            <ApiDataView
              data={customDutyQuery.data}
              emptyLabel="No custom duty data."
              maxHeightClass="max-h-48"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
