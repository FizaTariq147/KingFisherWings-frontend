import { asRecord, pickNumber, pickString, unwrapData } from '@/features/portal-shared/normalize';
import { isUuid } from '@/lib/isUuid';
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
  for (const key of ['items', 'results', 'entries', 'rows', 'history', 'data']) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

/** Prefer human-readable codes; skip bare UUIDs. */
function pickDisplayCode(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (isUuid(trimmed)) continue;
    return trimmed;
  }
  return '';
}

function nestedRecord(
  record: Record<string, unknown>,
  ...keys: string[]
): Record<string, unknown> | null {
  for (const key of keys) {
    const nested = asRecord(record[key]);
    if (nested) return nested;
  }
  return null;
}

function normalizeItem(raw: unknown): PartyTransactionItem | null {
  // Bare UUID / code string from history arrays — not useful as a list row
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || isUuid(trimmed)) return null;
    return { reference: trimmed };
  }
  if (!raw || typeof raw !== 'object') return null;

  const record = asRecord(raw);
  if (!record) return null;

  const job = nestedRecord(record, 'job', 'shipment', 'booking');
  const quote = nestedRecord(record, 'quotation', 'quote', 'quotes');
  const invoice = nestedRecord(record, 'invoice', 'credit_note', 'creditNote');
  const payment = nestedRecord(
    record,
    'payment',
    'payment_request',
    'paymentRequest',
    'receipt',
  );

  const id = pickString(record.id, record.uuid) || undefined;

  const reference =
    pickDisplayCode(
      record.job_number,
      record.jobNumber,
      record.job_no,
      record.jobNo,
      record.job_name,
      record.jobName,
      record.quotation_number,
      record.quotationNumber,
      record.quote_number,
      record.quoteNumber,
      record.quote_no,
      record.quoteNo,
      record.invoice_number,
      record.invoiceNumber,
      record.invoice_no,
      record.invoiceNo,
      record.payment_number,
      record.paymentNumber,
      record.payment_no,
      record.paymentNo,
      record.request_number,
      record.requestNumber,
      record.request_no,
      record.document_number,
      record.documentNumber,
      record.document_no,
      record.documentNo,
      record.number,
      record.code,
      record.display_name,
      record.displayName,
      record.name,
      record.label,
      record.title,
      record.summary,
      record.description,
      record.reference,
      record.ref,
      job?.job_number,
      job?.jobNumber,
      job?.job_no,
      job?.job_name,
      job?.jobName,
      job?.name,
      job?.number,
      job?.code,
      quote?.quotation_number,
      quote?.quotationNumber,
      quote?.quote_number,
      quote?.quote_no,
      quote?.number,
      quote?.code,
      invoice?.invoice_number,
      invoice?.invoiceNumber,
      invoice?.invoice_no,
      invoice?.number,
      invoice?.code,
      payment?.payment_number,
      payment?.payment_no,
      payment?.request_number,
      payment?.request_no,
      payment?.number,
      payment?.code,
      payment?.reference,
    ) || undefined;

  // If the only "reference" left is a UUID-shaped field, leave blank so UI does not flash raw ids
  const status = pickString(
    record.status,
    job?.status,
    quote?.status,
    invoice?.status,
    payment?.status,
  ) || undefined;

  const date =
    pickString(
      record.date,
      record.document_date,
      record.documentDate,
      record.invoice_date,
      record.invoiceDate,
      record.occurred_at,
      record.occurredAt,
      record.created_at,
      record.createdAt,
      job?.created_at,
      quote?.created_at,
      invoice?.invoice_date,
      invoice?.created_at,
      payment?.created_at,
    ) || undefined;

  const amount = pickNumber(
    record.amount,
    record.total,
    record.grand_total,
    record.grandTotal,
    record.balance,
    record.outstanding,
    invoice?.grand_total,
    invoice?.total,
    invoice?.amount,
    payment?.amount,
    quote?.total,
    job?.total,
  );

  // Skip rows that are nothing but an id (no code, status, date, or amount)
  if (!reference && !status && !date && amount == null) {
    return null;
  }

  return {
    id,
    reference,
    status,
    date,
    amount,
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
    // Arrays of bare UUIDs → count only, no ID rows
    const bareIds = raw.filter((item) => typeof item === 'string' && isUuid(item.trim()));
    if (bareIds.length > 0 && bareIds.length === raw.length) {
      return { count: bareIds.length, items: [] };
    }
    const items = raw.map(normalizeItem).filter((item): item is PartyTransactionItem => Boolean(item));
    const amount = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return {
      count: Math.max(items.length, bareIds.length || 0) || items.length,
      amount: amount || undefined,
      items,
    };
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

type BucketKey = 'quotes' | 'jobs' | 'invoices' | 'payments';

function classifyHistoryType(
  type: string | undefined,
  reference: string | undefined,
  entityHint?: string,
): BucketKey | null {
  const hay = `${type ?? ''} ${reference ?? ''} ${entityHint ?? ''}`.toLowerCase();
  if (!hay.trim()) return null;
  if (/(quote|quotation)/.test(hay)) return 'quotes';
  if (/(job|booking|shipment)/.test(hay)) return 'jobs';
  if (/(invoice|credit.?note|bill)/.test(hay)) return 'invoices';
  if (/(payment|receipt|remittance|collection)/.test(hay)) return 'payments';
  return null;
}

function bucketsFromHistoryList(list: unknown[]): {
  quotes: PartyTransactionBucket;
  jobs: PartyTransactionBucket;
  invoices: PartyTransactionBucket;
  payments: PartyTransactionBucket;
} {
  const buckets: Record<BucketKey, PartyTransactionItem[]> = {
    quotes: [],
    jobs: [],
    invoices: [],
    payments: [],
  };

  for (const raw of list) {
    const record = asRecord(raw);
    if (!record) continue;
    const type = pickString(record.type, record.kind, record.category, record.entity_type, record.entityType) || undefined;
    const item = normalizeItem(raw);
    if (!item) continue;
    const key = classifyHistoryType(type, item.reference, pickString(record.entity, record.resource));
    if (!key) continue;
    buckets[key].push(item);
  }

  const toBucket = (items: PartyTransactionItem[]): PartyTransactionBucket => {
    const amount = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return { count: items.length, amount: amount || undefined, items };
  };

  return {
    quotes: toBucket(buckets.quotes),
    jobs: toBucket(buckets.jobs),
    invoices: toBucket(buckets.invoices),
    payments: toBucket(buckets.payments),
  };
}

function hasExplicitBuckets(record: Record<string, unknown>): boolean {
  return (
    record.quotes != null ||
    record.quotations != null ||
    record.jobs != null ||
    record.invoices != null ||
    record.payments != null ||
    record.payment_requests != null ||
    record.paymentRequests != null
  );
}

export function normalizePartyTransactionSummary(
  raw: unknown,
  available = true,
): PartyTransactionSummary {
  const data = unwrapData(raw);

  // Flat history list from GET /parties/{id}/history
  if (Array.isArray(data)) {
    const fromList = bucketsFromHistoryList(data);
    return {
      available,
      ...fromList,
    };
  }

  const record = asRecord(data) ?? asRecord(raw) ?? {};

  // Nested history payload: { history: [...], open_balance?, ... }
  if (!hasExplicitBuckets(record)) {
    const list = asList(
      record.history ?? record.items ?? record.results ?? record.entries ?? record.rows,
    );
    if (list.length > 0 || record.history != null) {
      const fromList = bucketsFromHistoryList(list);
      return {
        available,
        party_id: pickString(record.party_id, record.partyId) || undefined,
        party_name: pickString(record.party_name, record.partyName, record.name) || undefined,
        currency_code:
          pickString(record.currency_code, record.currencyCode, record.currency) || undefined,
        ...fromList,
        open_balance: pickNumber(
          record.open_balance,
          record.openBalance,
          record.outstanding,
          record.balance,
          record.ar_balance,
        ),
      };
    }
  }

  return {
    available,
    party_id: pickString(record.party_id, record.partyId) || undefined,
    party_name: pickString(record.party_name, record.partyName, record.name) || undefined,
    currency_code: pickString(record.currency_code, record.currencyCode, record.currency) || undefined,
    quotes: normalizeBucket(record.quotes ?? record.quotations, [
      record.quotes_count,
      record.quotations_count,
      record.quote_count,
    ]),
    jobs: normalizeBucket(record.jobs, [record.jobs_count, record.job_count]),
    invoices: normalizeBucket(record.invoices, [record.invoices_count, record.invoice_count]),
    payments: normalizeBucket(record.payments ?? record.payment_requests ?? record.paymentRequests, [
      record.payments_count,
      record.payment_count,
      record.payment_requests_count,
    ]),
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
    sent: record?.sent === false || record?.success === false ? false : true,
    message: message || 'Summary sent.',
  };
}
