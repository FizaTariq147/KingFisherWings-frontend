import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useJobPnl } from '../../hooks/useJobs';

interface JobPnlPanelProps {
  jobId: string;
}

export function JobPnlPanel({ jobId }: JobPnlPanelProps) {
  const { data: pnl, isLoading, isError } = useJobPnl(jobId);

  if (isLoading) return <p className="text-sm text-[var(--color-neutral-400)]">Loading P&L…</p>;
  if (isError || !pnl) return <p className="text-sm text-[var(--color-danger-600)]">P&L unavailable.</p>;

  return (
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
  );
}
