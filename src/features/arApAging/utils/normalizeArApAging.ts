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

export function normalizeAgingLine(raw: unknown): AgingLine | null {
  const r = asRecord(raw);
  if (!r) return null;

  const party_id = str(r.party_id) ?? str(r.id);
  const party_name = str(r.party_name) ?? str(r.name);
  const total =
    num(r.total) ||
    num(r.total_outstanding) ||
    num(r.outstanding) ||
    num(r.balance);

  if (!party_id && !party_name && total === 0) return null;

  return {
    party_id,
    party_name,
    party_code: str(r.party_code) ?? str(r.code),
    currency_code: str(r.currency_code)?.toUpperCase(),
    current: pickBucket(r, ['current', 'bucket_current', 'not_due', 'days_0']),
    days_1_30: pickBucket(r, ['days_1_30', 'bucket_1_30', 'age_1_30', '1_30']),
    days_31_60: pickBucket(r, ['days_31_60', 'bucket_31_60', 'age_31_60', '31_60']),
    days_61_90: pickBucket(r, ['days_61_90', 'bucket_61_90', 'age_61_90', '61_90']),
    days_over_90: pickBucket(r, [
      'days_over_90',
      'over_90',
      'bucket_over_90',
      'age_over_90',
      '90_plus',
    ]),
    total:
      total ||
      pickBucket(r, ['current', 'bucket_current']) +
        pickBucket(r, ['days_1_30', 'bucket_1_30']) +
        pickBucket(r, ['days_31_60', 'bucket_31_60']) +
        pickBucket(r, ['days_61_90', 'bucket_61_90']) +
        pickBucket(r, ['days_over_90', 'over_90']),
  };
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
    (Array.isArray(envelope.data) && envelope.data) ||
    (Array.isArray(envelope.results) && envelope.results);
  if (named) return named;
  const nested = asRecord(envelope.data);
  if (nested) {
    return (
      (Array.isArray(nested.rows) && nested.rows) ||
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.parties) && nested.parties) ||
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
  const envelope = asRecord(raw);
  const as_of = str(envelope?.as_of) ?? str(envelope?.as_of_date) ?? str(envelope?.date);
  const rows = unwrapAgingRows(raw);
  const lines = rows.map(normalizeAgingLine).filter((l): l is AgingLine => Boolean(l));

  const totalsRaw = envelope?.totals ?? envelope?.summary ?? envelope?.total_row;
  const totals = totalsRaw ? normalizeAgingLine(totalsRaw) ?? undefined : undefined;

  if (!totals && lines.length) {
    const sum: AgingLine = {
      party_name: 'Totals',
      current: 0,
      days_1_30: 0,
      days_31_60: 0,
      days_61_90: 0,
      days_over_90: 0,
      total: 0,
    };
    for (const line of lines) {
      sum.current += line.current;
      sum.days_1_30 += line.days_1_30;
      sum.days_31_60 += line.days_31_60;
      sum.days_61_90 += line.days_61_90;
      sum.days_over_90 += line.days_over_90;
      sum.total += line.total;
    }
    return { as_of, lines, totals: sum };
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
