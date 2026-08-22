import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Invoice } from '@/features/invoices/types/invoice.types';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from '@/features/invoices/constants/invoice.constants';
import type { AgingReportResult } from '@/features/arApAging/types/arApAging.types';
import { computeAgingTotals, resolveAgingBucketValues } from '@/features/arApAging/utils/normalizeArApAging';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';
import { formatMoney, formatShortDate } from '../utils/dashboardFormat';
import { cn } from '@/lib/utils';

function invoiceTone(status: InvoiceStatus): string {
  if (status === 'PAID') return 'text-[var(--color-success-500)]';
  if (status === 'PARTIALLY_PAID' || status === 'SENT' || status === 'POSTED') {
    return 'text-[var(--color-warning-500)]';
  }
  if (status === 'CANCELLED' || status === 'VOID') return 'text-[var(--color-danger-500)]';
  return 'text-[var(--color-neutral-500)]';
}

export function RecentInvoicesPanel({
  invoices,
  isLoading,
  isError,
}: {
  invoices: Invoice[];
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <DashCard>
      <DashCardHeader
        title="Recent invoices"
        action={
          <Link to="/invoices" className="text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline">
            View all
          </Link>
        }
      />
      {isLoading ? (
        <div className="space-y-2">
          <DashSkeleton className="h-10" />
          <DashSkeleton className="h-10" />
        </div>
      ) : isError ? (
        <DashEmpty>Unable to load invoices.</DashEmpty>
      ) : invoices.length === 0 ? (
        <DashEmpty>No invoices created recently.</DashEmpty>
      ) : (
        <ul className="space-y-3">
          {invoices.slice(0, 3).map((inv) => (
            <li key={inv.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/invoices/${inv.id}`}
                  className="text-sm font-semibold text-[var(--color-neutral-900)] hover:underline"
                >
                  {invoiceDisplayNumber(inv)}
                </Link>
                <p className="truncate text-[11px] text-[var(--color-neutral-500)]">{inv.party_name || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatMoney(inv.total_amount, inv.currency_code)}</p>
                <p className={cn('text-[11px] font-medium', invoiceTone(inv.status))}>
                  {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashCard>
  );
}

const BUCKETS: { key: keyof NonNullable<AgingReportResult['totals']>; label: string; color: string }[] = [
  { key: 'current', label: 'Current', color: '#0A2942' },
  { key: 'days_1_30', label: '1–30', color: '#2C557A' },
  { key: 'days_31_60', label: '31–60', color: '#FF751F' },
  { key: 'days_61_90', label: '61–90', color: '#C7590F' },
  { key: 'days_over_90', label: '90+', color: '#C6303E' },
];

const CHART_HEIGHT_PX = 96;
const DONUT_SIZE_PX = 136;
const DONUT_STROKE_PX = 18;

function AgingDonutChart({
  values,
  total,
  currency,
}: {
  values: number[];
  total: number;
  currency?: string;
}) {
  const chartTotal = total > 0 ? total : values.reduce((sum, value) => sum + value, 0);
  const radius = (DONUT_SIZE_PX - DONUT_STROKE_PX) / 2;
  const center = DONUT_SIZE_PX / 2;
  const circumference = 2 * Math.PI * radius;
  const hasSegments = values.some((value) => value > 0);
  let cumulative = 0;

  return (
    <div className="relative mx-auto shrink-0" style={{ width: DONUT_SIZE_PX, height: DONUT_SIZE_PX }}>
      <svg width={DONUT_SIZE_PX} height={DONUT_SIZE_PX} className="-rotate-90" aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-neutral-100)"
          strokeWidth={DONUT_STROKE_PX}
        />
        {hasSegments ? (
          values.map((value, index) => {
            if (value <= 0 || chartTotal <= 0) return null;
            const dash = (value / chartTotal) * circumference;
            const segment = (
              <circle
                key={BUCKETS[index].key}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={BUCKETS[index].color}
                strokeWidth={DONUT_STROKE_PX}
                strokeDasharray={`${dash} ${Math.max(circumference - dash, 0)}`}
                strokeDashoffset={-cumulative}
              />
            );
            cumulative += dash;
            return segment;
          })
        ) : chartTotal > 0 ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={BUCKETS[0].color}
            strokeWidth={DONUT_STROKE_PX}
            strokeDasharray={`${circumference} 0`}
          />
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
        <span className="text-base font-semibold tabular-nums leading-tight text-[var(--color-neutral-900)]">
          {formatMoney(chartTotal, currency)}
        </span>
        <span className="mt-0.5 text-[10px] font-medium text-[var(--color-neutral-500)]">
          Total outstanding
        </span>
      </div>
    </div>
  );
}

function AgingStackBar({ values, total }: { values: number[]; total: number }) {
  if (total <= 0) {
    return <div className="h-5 w-full rounded-full bg-[var(--color-neutral-100)]" />;
  }
  return (
    <div className="flex h-5 w-full overflow-hidden rounded-full bg-[var(--color-neutral-100)] shadow-inner">
      {values.map((value, index) => {
        const pct = (value / total) * 100;
        if (pct <= 0) return null;
        return (
          <span
            key={BUCKETS[index].key}
            className="h-full min-w-[2px]"
            style={{ width: `${pct}%`, background: BUCKETS[index].color }}
            title={`${BUCKETS[index].label}: ${formatMoney(value)}`}
          />
        );
      })}
    </div>
  );
}

function AgingColumnChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const hasData = values.some((v) => v > 0);

  return (
    <div className="flex h-[112px] w-full items-end gap-2">
      {values.map((value, index) => {
        const heightPx = hasData
          ? Math.max(14, Math.round((value / max) * CHART_HEIGHT_PX))
          : 10;
        return (
          <div key={BUCKETS[index].key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold tabular-nums text-[var(--color-neutral-600)]">
              {value > 0 ? compactAgingMoney(value) : '—'}
            </span>
            <span
              className="w-full rounded-t-md transition-[height] duration-300"
              style={{
                height: `${heightPx}px`,
                background: BUCKETS[index].color,
                opacity: value > 0 ? 1 : 0.22,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Compact money for tight chart labels (e.g. 12.4K). */
function compactAgingMoney(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return String(Math.round(amount));
}

export function ReceivablesAgingPanel({
  report,
  isLoading,
  isError,
  isFetching,
  onRefresh,
}: {
  report?: AgingReportResult;
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
}) {
  const totals = useMemo(() => computeAgingTotals(report), [report]);
  const values = useMemo(() => resolveAgingBucketValues(totals), [totals]);
  const over90 = Number(totals.days_over_90 ?? 0);
  const total = Number(totals.total ?? values.reduce((a, b) => a + b, 0));
  const overPct = total ? Math.round((over90 / total) * 100) : 0;
  const currency =
    report?.totals?.currency_code ??
    report?.lines.find((line) => line.currency_code)?.currency_code;
  const hasData = total > 0;
  const asOfLabel = report?.as_of ? formatShortDate(report.as_of) : null;

  return (
    <DashCard>
      <DashCardHeader
        title="Receivables ageing"
        subtitle={
          asOfLabel ? `AR outstanding · as of ${asOfLabel}` : 'AR outstanding · aging buckets'
        }
        action={
          <div className="flex items-center gap-2">
            {hasData && over90 > 0 ? (
              <span className="rounded-full bg-[var(--color-danger-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-danger-600)]">
                {overPct}% 90+
              </span>
            ) : null}
            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isFetching}
                className="rounded-md p-1 text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--color-neutral-600)] disabled:opacity-50"
                aria-label="Refresh receivables ageing"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
              </button>
            ) : null}
            <Link
              to="/gl/ar/aging"
              className="text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline"
            >
              Full report
            </Link>
          </div>
        }
      />
      {isLoading ? (
        <DashSkeleton className="h-24" />
      ) : isError ? (
        <DashEmpty>
          Unable to load AR aging.
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="mt-2 block text-[11px] font-semibold text-[var(--color-primary-600)] hover:underline"
            >
              Retry
            </button>
          ) : null}
        </DashEmpty>
      ) : !hasData ? (
        <DashEmpty>No receivables aging data.</DashEmpty>
      ) : (
        <div className="space-y-4 rounded-xl bg-[var(--color-neutral-50)] p-4">
          <AgingDonutChart values={values} total={total} currency={currency} />

          <AgingStackBar values={values} total={total} />

          <AgingColumnChart values={values} />

          <div className="grid grid-cols-5 gap-1">
            {BUCKETS.map((b, index) => (
              <div key={b.key} className="flex min-w-0 flex-col items-center gap-1 text-center">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: b.color }}
                  aria-hidden
                />
                <span className="text-[10px] font-medium text-[var(--color-neutral-500)]">{b.label}</span>
                <span className="text-[10px] font-semibold tabular-nums text-[var(--color-neutral-700)]">
                  {values[index] > 0 ? formatMoney(values[index], currency) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashCard>
  );
}
