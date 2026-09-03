import { asRecord, pickNumber, pickString, unwrapData } from '@/features/portal-shared/normalize';
import type {
  PartyTransactionBucket,
  PartyTransactionItem,
  PartyTransactionSummary,
  SendPartyTransactionSummaryResult,
} from '../types/partyTransactionSummary.types';

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ['items', 'results', 'entries', 'rows', 'data']) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

function normalizeItem(raw: unknown): PartyTransactionItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = asRecord(raw);
  if (!record) return null;
  return {
    id: pickString(record.id, record.uuid) || undefined,
    reference:
      pickString(
        record.reference,
        record.ref,
        record.number,
        record.document_no,
        record.documentNo,
        record.quote_no,
        record.job_no,
        record.invoice_no,
      ) || undefined,
    status: pickString(record.status) || undefined,
    date:
      pickString(
        record.date,
        record.document_date,
        record.documentDate,
        record.created_at,
        record.createdAt,
      ) || undefined,
    amount: pickNumber(
      record.amount,
      record.total,
      record.grand_total,
      record.grandTotal,
      record.balance,
    ),
  };
}

function emptyBucket(): PartyTransactionBucket {
  return { count: 0, items: [] };
}

function normalizeBucket(raw: unknown, fallbackCountKeys: unknown[] = []): PartyTransactionBucket {
  if (raw == null) {
    const count = pickNumber(...fallbackCountKeys);
    return { count: count ?? 0, items: [] };
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return { count: raw, items: [] };
  }
  if (Array.isArray(raw)) {
    const items = raw.map(normalizeItem).filter((item): item is PartyTransactionItem => Boolean(item));
    const amount = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return { count: items.length, amount: amount || undefined, items };
  }

  const record = asRecord(raw);
  if (!record) {
    const count = pickNumber(...fallbackCountKeys);
    return { count: count ?? 0, items: [] };
  }

  const items = asList(record.items ?? record.results ?? record.entries ?? record.rows)
    .map(normalizeItem)
    .filter((item): item is PartyTransactionItem => Boolean(item));

  const count =
    pickNumber(record.count, record.total, record.total_count, record.qty) ??
    pickNumber(...fallbackCountKeys) ??
    items.length;
  const amount = pickNumber(
    record.amount,
    record.total_amount,
    record.totalAmount,
    record.value,
    record.sum,
  );

  return {
    count,
    amount,
    items,
  };
}

export function normalizePartyTransactionSummary(
  raw: unknown,
  available = true,
): PartyTransactionSummary {
  const data = unwrapData(raw);
  const record = asRecord(data) ?? asRecord(raw) ?? {};

  return {
    available,
    party_id: pickString(record.party_id, record.partyId, record.id) || undefined,
    party_name: pickString(record.party_name, record.partyName, record.name) || undefined,
    currency_code: pickString(record.currency_code, record.currencyCode, record.currency) || undefined,
    quotes: normalizeBucket(record.quotes ?? record.quotations, [
      record.quotes_count,
      record.quotations_count,
      record.quote_count,
    ]),
    jobs: normalizeBucket(record.jobs, [record.jobs_count, record.job_count]),
    invoices: normalizeBucket(record.invoices, [record.invoices_count, record.invoice_count]),
    payments: normalizeBucket(record.payments, [record.payments_count, record.payment_count]),
    open_balance: pickNumber(
      record.open_balance,
      record.openBalance,
      record.outstanding,
      record.balance,
      record.ar_balance,
    ),
  };
}

export function emptyPartyTransactionSummary(): PartyTransactionSummary {
  return {
    available: false,
    quotes: emptyBucket(),
    jobs: emptyBucket(),
    invoices: emptyBucket(),
    payments: emptyBucket(),
  };
}

export function normalizeSendTransactionSummaryResult(
  raw: unknown,
): SendPartyTransactionSummaryResult {
  const data = unwrapData(raw);
  const record = asRecord(data) ?? asRecord(raw);
  const message = record
    ? pickString(record.message, record.status)
    : typeof data === 'string'
      ? data
      : '';
  return {
    sent: record?.sent === false ? false : true,
    message: message || 'Summary sent.',
  };
}
