import { asRecord, pickNumber, pickString, unwrapData } from '@/features/vendor-shared/normalize';
import type {
  VendorAgingBucket,
  VendorAgingResult,
  VendorStatementLine,
  VendorStatementResult,
} from '../types/vendorCredit.types';

export function normalizeAging(raw: unknown): VendorAgingResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const bucketsRaw =
    (Array.isArray(d.buckets) && d.buckets) || (Array.isArray(d.aging) && d.aging) || [];
  let buckets: VendorAgingBucket[] = [];
  if (bucketsRaw.length) {
    buckets = bucketsRaw.map((b, i) => {
      const r = asRecord(b) ?? {};
      return {
        label: pickString(r.label, r.bucket, r.name) || `Bucket ${i + 1}`,
        amount: pickNumber(r.amount, r.balance, r.total) ?? 0,
      };
    });
  } else {
    const known = [
      ['current', 'Current'],
      ['days_1_30', '1–30'],
      ['days_31_60', '31–60'],
      ['days_61_90', '61–90'],
      ['days_90_plus', '90+'],
      ['over_90', '90+'],
    ];
    for (const [key, label] of known) {
      const n = pickNumber(d[key], d[key.replace(/_/g, '')]);
      if (n !== undefined) buckets.push({ label, amount: n });
    }
  }
  const total =
    pickNumber(d.total, d.total_outstanding, d.outstanding, d.open_balance, d.openBalance) ??
    undefined;
  return {
    asOf: pickString(d.as_of, d.asOf) || undefined,
    total,
    buckets,
  };
}

/** True when the API returned a balance summary without ledger lines. */
export function isVendorStatementSummaryOnly(raw: unknown): boolean {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!d) return false;
  const hasLines =
    (Array.isArray(d.lines) && d.lines.length > 0) ||
    (Array.isArray(d.transactions) && d.transactions.length > 0) ||
    (Array.isArray(d.items) && d.items.length > 0);
  if (hasLines) return false;
  return (
    pickNumber(d.open_balance, d.openBalance, d.invoice_count, d.invoiceCount) != null ||
    typeof d.truncated === 'boolean'
  );
}

export function normalizeStatement(raw: unknown): VendorStatementResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const linesRaw = Array.isArray(d.lines)
    ? d.lines
    : Array.isArray(d.transactions)
      ? d.transactions
      : Array.isArray(d.items)
        ? d.items
        : [];
  const lines: VendorStatementLine[] = linesRaw.map((line, i) => {
    const r = asRecord(line) ?? {};
    return {
      id: pickString(r.id) || String(i),
      date: pickString(r.date, r.txn_date, r.transaction_date) || undefined,
      type: pickString(r.type, r.doc_type) || undefined,
      reference: pickString(r.reference, r.ref, r.document_number) || undefined,
      debit: pickNumber(r.debit, r.debit_amount),
      credit: pickNumber(r.credit, r.credit_amount),
      balance: pickNumber(r.balance, r.running_balance),
      description: pickString(r.description, r.narration) || undefined,
    };
  });
  return {
    asOf: pickString(d.as_of, d.asOf) || undefined,
    openingBalance: pickNumber(d.opening_balance, d.openingBalance),
    closingBalance: pickNumber(
      d.closing_balance,
      d.closingBalance,
      d.open_balance,
      d.openBalance,
      d.balance,
    ),
    invoiceCount: pickNumber(d.invoice_count, d.invoiceCount),
    advancesUnallocated: pickNumber(d.advances_unallocated, d.advancesUnallocated),
    truncated: typeof d.truncated === 'boolean' ? d.truncated : undefined,
    lines,
  };
}
