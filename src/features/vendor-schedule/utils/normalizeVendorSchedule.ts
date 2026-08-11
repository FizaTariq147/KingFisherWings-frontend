import {
  asRecord,
  pickNumber,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/vendor-shared/normalize';
import type { VendorScheduleItem, VendorScheduleResult } from '../types/vendorSchedule.types';

function normalizeItem(raw: unknown): VendorScheduleItem | null {
  const r = asRecord(raw);
  if (!r) return null;
  const id = pickString(r.id);
  if (!id) return null;
  const overdueFlag = r.overdue === true || String(r.status || '').toUpperCase() === 'OVERDUE';
  return {
    id,
    number: pickString(r.invoice_number, r.number, r.pi_number, r.ref) || id,
    dueDate: pickString(r.due_date, r.dueDate) || undefined,
    status: pickString(r.status) || undefined,
    amount: pickNumber(r.total_amount, r.amount, r.total),
    outstanding: pickNumber(r.outstanding_balance, r.outstanding, r.balance),
    currencyCode: pickString(r.currency_code, r.currencyCode, r.currency) || undefined,
    overdue: overdueFlag,
  };
}

export function normalizeSchedule(raw: unknown): VendorScheduleResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const { items } = unwrapList(raw, ['items', 'results', 'invoices', 'schedule', 'data']);
  const normalized = items
    .map(normalizeItem)
    .filter((x): x is VendorScheduleItem => Boolean(x));
  const overdueCount =
    pickNumber(data.overdue_count, data.overdueCount) ??
    normalized.filter((i) => i.overdue).length;
  const dueCount = pickNumber(data.due_count, data.dueCount, data.open_count) ?? normalized.length;
  return {
    items: normalized,
    dueCount,
    overdueCount,
    outstandingTotal: pickNumber(data.outstanding_total, data.outstandingTotal, data.total),
  };
}
