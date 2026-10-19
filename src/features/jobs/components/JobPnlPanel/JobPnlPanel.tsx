import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useJobPnl, useJobPnlCustomDuty } from '../../hooks/useJobs';
import type { JobPnl } from '../../types/job.types';
import { ApiDataView } from '../ApiDataView';

interface JobPnlPanelProps {
  jobId: string;
}

function money(value: number | undefined, currency?: string): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const prefix = currency ? `${currency} ` : '';
  return `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function lineLabel(row: Record<string, unknown>): string {
  return String(
    row.description ??
      row.charge ??
      row.charge_name ??
      row.chargeName ??
      row.name ??
      row.charge_code ??
      'Line',
  );
}

function lineAmount(row: Record<string, unknown>): number | undefined {
  const n = Number(
    row.amount ??
      row.sale_amount ??
      row.cost_amount ??
      row.line_total ??
      row.local_amount ??
      row.fcy_amount,
  );
  return Number.isFinite(n) ? n : undefined;
}

function PnlLinesTable({
  title,
  rows,
  currency,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
  currency?: string;
}) {
  if (!rows.length) {
    return (
      <p className="text-xs text-[var(--color-neutral-400)]">No {title.toLowerCase()}.</p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
      <table className="min-w-full text-left text-[12px]">
        <thead className="bg-[var(--fresa-page-bg,#F4F6F9)] text-[var(--color-neutral-600)]">
          <tr>
            <th className="px-2 py-1.5 font-medium">{title}</th>
            <th className="px-2 py-1.5 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={String(row.id ?? `${title}-${idx}`)}
              className="border-t border-[var(--color-neutral-100)]"
            >
              <td className="px-2 py-1.5">{lineLabel(row)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {money(lineAmount(row), currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function JobPnlSummary({ pnl }: { pnl: JobPnl }) {
  const revenueLines =
    pnl.revenue_lines?.length
      ? pnl.revenue_lines
      : (pnl.lines ?? []).filter((row) => {
          const side = String(row.side ?? row.line_side ?? '').toLowerCase();
          return side.includes('rev') || side.includes('sale') || row.sale_amount != null;
        });
  const costLines =
    pnl.cost_lines?.length
      ? pnl.cost_lines
      : (pnl.lines ?? []).filter((row) => {
          const side = String(row.side ?? row.line_side ?? '').toLowerCase();
          return side.includes('cost') || side.includes('purchase') || row.cost_amount != null;
        });
  const flatFallback =
    !revenueLines.length && !costLines.length ? (pnl.lines ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3 text-sm">
        <div>
          <p className="text-[var(--color-neutral-400)] text-xs">Revenue</p>
          <p className="font-semibold">{money(pnl.revenue, pnl.currency_code)}</p>
        </div>
        <div>
          <p className="text-[var(--color-neutral-400)] text-xs">Cost</p>
          <p className="font-semibold">{money(pnl.cost, pnl.currency_code)}</p>
        </div>
        <div>
          <p className="text-[var(--color-neutral-400)] text-xs">Gross profit</p>
          <p className="font-semibold">
            {money(pnl.gross_profit, pnl.currency_code)}
          </p>
        </div>
      </div>
      {revenueLines.length || costLines.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <PnlLinesTable
            title="Revenue lines"
            rows={revenueLines}
            currency={pnl.currency_code}
          />
          <PnlLinesTable
            title="Cost lines"
            rows={costLines}
            currency={pnl.currency_code}
          />
        </div>
      ) : flatFallback.length ? (
        <PnlLinesTable
          title="P&L lines"
          rows={flatFallback}
          currency={pnl.currency_code}
        />
      ) : (
        <p className="text-xs text-[var(--color-neutral-400)]">
          No line breakdown yet — totals above reflect dual-sided sale/cost amounts.
        </p>
      )}
    </div>
  );
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
        <div className="px-4 pb-4">
          <JobPnlSummary pnl={pnl} />
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
