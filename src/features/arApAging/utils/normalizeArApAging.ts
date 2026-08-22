import type { AgingLine, StatementLine } from '../types/arApAging.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function num(value: unknown): number {
  if (value == null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function pickBucket(r: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (key in r) return num(r[key]);
  }
  return 0;
}

const AGING_BUCKET_KEYS = [
  'current',
  'days_1_30',
  'days_31_60',
  'days_61_90',
  'days_over_90',
] as const;

function labelToBucketKey(label: string): (typeof AGING_BUCKET_KEYS)[number] | null {
  const normalized = label.toLowerCase().replace(/\s+/g, '');
  if (/^current|notdue|0/.test(normalized)) return 'current';
  if (/1.?30|1–30|1-30/.test(normalized)) return 'days_1_30';
  if (/31.?60|31–60|31-60/.test(normalized)) return 'days_31_60';
  if (/61.?90|61–90|61-90/.test(normalized)) return 'days_61_90';
  if (/90|over/.test(normalized)) return 'days_over_90';
  return null;
}

const EMPTY_AGING_TOTALS: AgingLine = {
  current: 0,
  days_1_30: 0,
  days_31_60: 0,
  days_61_90: 0,
  days_over_90: 0,
  total: 0,
};

function agingLineFromBucketsArray(raw: unknown): AgingLine | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  const line: AgingLine = { ...EMPTY_AGING_TOTALS };
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    const amount = num(r.amount) || num(r.balance) || num(r.total) || num(r.value);
    const key =
      (str(r.key) as (typeof AGING_BUCKET_KEYS)[number] | undefined) ??
      labelToBucketKey(str(r.label) ?? str(r.bucket) ?? str(r.name) ?? '');
    if (key && AGING_BUCKET_KEYS.includes(key)) {
      line[key] += amount;
    }
  }
  const bucketSum = AGING_BUCKET_KEYS.reduce((sum, key) => sum + line[key], 0);
  if (bucketSum <= 0) return null;
  line.total = bucketSum;
  return line;
}

function agingLineFromRecord(r: Record<string, unknown>): AgingLine | null {
  const bucketsArray = Array.isArray(r.buckets)
    ? agingLineFromBucketsArray(r.buckets)
    : Array.isArray(r.aging)
      ? agingLineFromBucketsArray(r.aging)
      : null;
  const nestedAmounts = asRecord(r.amounts);
  const nestedLine =
    bucketsArray ?? (nestedAmounts ? agingLineFromRecord(nestedAmounts) : null);

  const party_id = str(r.party_id) ?? str(r.id);
  const party_name = str(r.party_name) ?? str(r.name);
  const current = pickBucket(r, [
    'current',
    'bucket_current',
    'not_due',
    'days_0',
    'current_amount',
    'amount_current',
  ]);
  const days_1_30 = pickBucket(r, [
    'days_1_30',
    'days1_30',
    'bucket_1_30',
    'age_1_30',
    '1_30',
    'amount_1_30',
  ]);
  const days_31_60 = pickBucket(r, [
    'days_31_60',
    'days31_60',
    'bucket_31_60',
    'age_31_60',
    '31_60',
    'amount_31_60',
  ]);
  const days_61_90 = pickBucket(r, [
    'days_61_90',
    'days61_90',
    'bucket_61_90',
    'age_61_90',
    '61_90',
    'amount_61_90',
  ]);
  const days_over_90 = pickBucket(r, [
    'days_over_90',
    'days90_plus',
    'over_90',
    'bucket_over_90',
    'age_over_90',
    '90_plus',
    'days_90_plus',
    'amount_over_90',
  ]);
  const bucketSum =
    (nestedLine?.current ?? current) +
    (nestedLine?.days_1_30 ?? days_1_30) +
    (nestedLine?.days_31_60 ?? days_31_60) +
    (nestedLine?.days_61_90 ?? days_61_90) +
    (nestedLine?.days_over_90 ?? days_over_90);
  const total =
    num(r.total) ||
    num(r.total_outstanding) ||
    num(r.outstanding) ||
    num(r.balance) ||
    nestedLine?.total ||
    bucketSum;

  if (!party_id && !party_name && total === 0 && bucketSum === 0) return null;

  return {
    party_id,
    party_name,
    party_code: str(r.party_code) ?? str(r.code),
    currency_code: str(r.currency_code)?.toUpperCase(),
    current: nestedLine?.current ?? current,
    days_1_30: nestedLine?.days_1_30 ?? days_1_30,
    days_31_60: nestedLine?.days_31_60 ?? days_31_60,
    days_61_90: nestedLine?.days_61_90 ?? days_61_90,
    days_over_90: nestedLine?.days_over_90 ?? days_over_90,
    total,
  };
}

export function normalizeAgingLine(raw: unknown): AgingLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  return agingLineFromRecord(r);
}

/** Sum bucket totals from API totals row or party lines. */
export function computeAgingTotals(
  report?: Pick<{ lines: AgingLine[]; totals?: AgingLine }, 'lines' | 'totals'>,
): AgingLine {
  if (!report) return { ...EMPTY_AGING_TOTALS };

  const fromLines = report.lines.length
    ? report.lines.reduce(
        (acc, line) => ({
          current: acc.current + line.current,
          days_1_30: acc.days_1_30 + line.days_1_30,
          days_31_60: acc.days_31_60 + line.days_31_60,
          days_61_90: acc.days_61_90 + line.days_61_90,
          days_over_90: acc.days_over_90 + line.days_over_90,
          total: acc.total + (line.total || 0),
        }),
        { ...EMPTY_AGING_TOTALS },
      )
    : null;

  const lineBucketSum = fromLines
    ? fromLines.current +
      fromLines.days_1_30 +
      fromLines.days_31_60 +
      fromLines.days_61_90 +
      fromLines.days_over_90
    : 0;

  if (fromLines && lineBucketSum > 0) {
    const headerTotal = report.totals?.total ?? 0;
    return {
      ...fromLines,
      total: Math.max(fromLines.total, headerTotal, lineBucketSum),
      currency_code:
        report.totals?.currency_code ??
        report.lines.find((line) => line.currency_code)?.currency_code,
    };
  }

  if (report.totals) {
    const t = report.totals;
    const bucketSum =
      t.current + t.days_1_30 + t.days_31_60 + t.days_61_90 + t.days_over_90;
    return {
      ...t,
      total: t.total || bucketSum,
    };
  }

  if (fromLines) return fromLines;

  return { ...EMPTY_AGING_TOTALS };
}

/** Bucket values for charts; falls back to a single segment when only total exists. */
export function resolveAgingBucketValues(totals: AgingLine): number[] {
  const values = AGING_BUCKET_KEYS.map((key) => Number(totals[key] ?? 0));
  const bucketSum = values.reduce((sum, value) => sum + value, 0);
  const total = totals.total || bucketSum;
  if (bucketSum <= 0 && total > 0) return [total, 0, 0, 0, 0];
  return values;
}

function unwrapAgingPayload(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (!envelope) return raw;
  const nested = asRecord(envelope.data);
  if (
    nested &&
    (nested.lines ||
      nested.rows ||
      nested.parties ||
      nested.totals ||
      nested.summary ||
      nested.current != null ||
      nested.total_outstanding != null ||
      Array.isArray(nested.buckets))
  ) {
    return {
      ...nested,
      as_of: nested.as_of ?? envelope.as_of,
    };
  }
  return raw;
}

function bucketOnlyTotals(raw: unknown): AgingLine | undefined {
  const line = normalizeAgingLine(raw);
  if (!line) return undefined;
  const bucketSum =
    line.current + line.days_1_30 + line.days_31_60 + line.days_61_90 + line.days_over_90;
  if (bucketSum <= 0 && line.total <= 0) return undefined;
  return line;
}

function unwrapAgingRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named =
    (Array.isArray(envelope.rows) && envelope.rows) ||
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.parties) && envelope.parties) ||
    (Array.isArray(envelope.lines) && envelope.lines) ||
    (Array.isArray(envelope.customers) && envelope.customers) ||
    (Array.isArray(envelope.data) && envelope.data) ||
    (Array.isArray(envelope.results) && envelope.results);
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      (Array.isArray(nested.rows) && nested.rows) ||
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.parties) && nested.parties) ||
      (Array.isArray(nested.customers) && nested.customers) ||
      (Array.isArray(nested.lines) && nested.lines) ||
      []
    );
  }
  return [];
}

export function normalizeAgingReport(raw: unknown): {
  as_of?: string;
  lines: AgingLine[];
  totals?: AgingLine;
} {
  const payload = unwrapAgingPayload(raw);
  const envelope = asRecord(payload);
  const as_of = str(envelope?.as_of) ?? str(envelope?.as_of_date) ?? str(envelope?.date);
  const rows = unwrapAgingRows(payload);
  const lines = rows.map(normalizeAgingLine).filter((l): l is AgingLine => Boolean(l));

  const totalsRaw =
    envelope?.totals ?? envelope?.summary ?? envelope?.total_row ?? envelope?.grand_total;
  let totals = totalsRaw ? normalizeAgingLine(totalsRaw) ?? undefined : undefined;

  if (!totals) {
    totals =
      agingLineFromBucketsArray(envelope?.buckets) ??
      agingLineFromBucketsArray(envelope?.aging) ??
      bucketOnlyTotals(envelope) ??
      bucketOnlyTotals(asRecord(envelope?.data)) ??
      undefined;
  }

  if (!totals && lines.length) {
    totals = computeAgingTotals({ lines });
    totals.party_name = 'Totals';
  }

  return { as_of, lines, totals: totals ?? undefined };
}

export function normalizeStatementLine(raw: unknown): StatementLine | null {
  const r = asRecord(raw);
  if (!r) return null;
  return {
    id: str(r.id),
    date: str(r.date) ?? str(r.transaction_date) ?? str(r.doc_date),
    type: str(r.type) ?? str(r.document_type),
    reference: str(r.reference) ?? str(r.reference_number) ?? str(r.number),
    description: str(r.description) ?? str(r.narration) ?? str(r.remarks),
    debit: num(r.debit) || num(r.debit_amount),
    credit: num(r.credit) || num(r.credit_amount),
    balance: num(r.balance) || num(r.running_balance),
    document_id: str(r.document_id) ?? str(r.invoice_id) ?? str(r.payment_id),
    document_number: str(r.document_number) ?? str(r.invoice_number) ?? str(r.payment_number),
    ...r,
  };
}

function unwrapStatementLines(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  const envelope = asRecord(raw);
  if (!envelope) return [];
  const named =
    (Array.isArray(envelope.lines) && envelope.lines) ||
    (Array.isArray(envelope.items) && envelope.items) ||
    (Array.isArray(envelope.transactions) && envelope.transactions) ||
    (Array.isArray(envelope.entries) && envelope.entries) ||
    (Array.isArray(envelope.data) && envelope.data);
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      (Array.isArray(nested.lines) && nested.lines) ||
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.transactions) && nested.transactions) ||
      []
    );
  }
  return [];
}

export function normalizeStatementReport(raw: unknown, partyId?: string) {
  const envelope = asRecord(raw);
  const nested = asRecord(envelope?.data);
  const root = nested ?? envelope ?? {};

  return {
    party_id: str(root.party_id) ?? partyId,
    party_name: str(root.party_name) ?? str(root.name),
    as_of: str(root.as_of) ?? str(root.as_of_date),
    opening_balance: num(root.opening_balance),
    closing_balance: num(root.closing_balance) || num(root.balance),
    currency_code: str(root.currency_code)?.toUpperCase(),
    lines: unwrapStatementLines(raw)
      .map(normalizeStatementLine)
      .filter((l): l is StatementLine => Boolean(l)),
    raw,
  };
}
