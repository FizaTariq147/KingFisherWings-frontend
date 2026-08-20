import { Link } from 'react-router-dom';
import type { Invoice } from '@/features/invoices/types/invoice.types';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { INVOICE_STATUS_LABELS, type InvoiceStatus } from '@/features/invoices/constants/invoice.constants';
import type { AgingReportResult } from '@/features/arApAging/types/arApAging.types';
import { DashCard, DashCardHeader, DashEmpty, DashSkeleton } from './DashCard';
import { formatMoney } from '../utils/dashboardFormat';
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

export function ReceivablesAgingPanel({
  report,
  isLoading,
  isError,
}: {
  report?: AgingReportResult;
  isLoading: boolean;
  isError: boolean;
}) {
  const totals = report?.totals;
  const values = BUCKETS.map((b) => Number(totals?.[b.key] ?? 0));
  const max = Math.max(...values, 1);
  const over90 = Number(totals?.days_over_90 ?? 0);
  const total = Number(totals?.total ?? values.reduce((a, b) => a + b, 0));
  const overPct = total ? Math.round((over90 / total) * 100) : 0;

  return (
    <DashCard>
      <DashCardHeader
        title="Receivables ageing"
        subtitle="AR outstanding · aging buckets"
        action={
          <span className="rounded-full bg-[var(--color-danger-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-danger-600)]">
            {overPct}% 90+
          </span>
        }
      />
      {isLoading ? (
        <DashSkeleton className="h-24" />
      ) : isError ? (
        <DashEmpty>Unable to load AR aging.</DashEmpty>
      ) : !totals && !(report?.lines.length) ? (
        <DashEmpty>No receivables aging data.</DashEmpty>
      ) : (
        <>
          <div className="flex h-24 items-end gap-3">
            {BUCKETS.map((b, i) => (
              <div key={b.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-[var(--color-neutral-600)]">
                  {values[i] ? formatMoney(values[i]) : ''}
                </span>
                <span
                  className="w-full max-w-8 rounded-t-md"
                  style={{
                    height: `${Math.max(8, Math.round((values[i] / max) * 100))}%`,
                    background: b.color,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-[var(--color-neutral-400)]">
            {BUCKETS.map((b) => (
              <span key={b.key} className="flex-1 text-center">
                {b.label}
              </span>
            ))}
          </div>
        </>
      )}
    </DashCard>
  );
}
