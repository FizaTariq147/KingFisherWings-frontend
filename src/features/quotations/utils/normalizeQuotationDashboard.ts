import { asRecord, pickNumber, pickString } from '@/features/auth/dashboard/utils/dashboardFormat';
import type { Quotation } from '../types/quotation.types';

export interface QuotationDashboardStats {
  totalPending: number;
  byStatus: Record<string, number>;
  bars: number[];
  pipelineValue: number;
  quotations: Quotation[];
  raw?: Record<string, unknown>;
}

export function normalizeQuotationDashboardStats(
  raw: unknown,
  fallbackQuotations: Quotation[] = [],
): QuotationDashboardStats {
  const data = asRecord(raw) ?? {};
  const inner = asRecord(data.data) ?? data;
  const byStatusRaw =
    asRecord(inner.by_status) ?? asRecord(inner.byStatus) ?? asRecord(inner.statuses) ?? {};
  const byStatus: Record<string, number> = {};
  for (const [key, value] of Object.entries(byStatusRaw)) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(n)) byStatus[key] = n;
  }

  const pendingStatuses = Object.keys(byStatus).filter((s) =>
    /draft|submitted|sent|review|negotiat|pending|open|approved/i.test(s),
  );
  const bars = pendingStatuses.map((s) => byStatus[s] ?? 0);
  const totalPending =
    pickNumber(inner, ['total_pending', 'totalPending', 'pending', 'open', 'total']) ??
    Object.values(byStatus).reduce((sum, n) => sum + n, 0);
  const pipelineValue =
    pickNumber(inner, [
      'pipeline_value',
      'pipelineValue',
      'pipeline',
      'total_amount',
      'totalAmount',
      'revenue',
    ]) ??
    fallbackQuotations.reduce(
      (sum, q) => sum + (q.total_amount ?? q.revenue_total ?? 0),
      0,
    );

  return {
    totalPending,
    byStatus,
    bars,
    pipelineValue,
    quotations: fallbackQuotations,
    raw: inner,
  };
}

export function pickDashboardStatLabel(row: Record<string, unknown>): string | undefined {
  return pickString(row, ['label', 'name', 'status', 'month']);
}
