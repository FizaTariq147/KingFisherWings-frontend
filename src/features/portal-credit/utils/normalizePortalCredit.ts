import {
  asRecord,
  pickNumber,
  pickString,
  unwrapData
} from '@/features/portal-shared/normalize';
import type {
  PortalAgingBucket, PortalAgingResult, PortalCreditSummary, PortalStatementLine, PortalStatementResult,
} from '../types/portalCredit.types';

export function normalizeCreditSummary(raw: unknown): PortalCreditSummary {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    creditLimit: pickNumber(d.credit_limit, d.creditLimit, d.limit),
    used: pickNumber(d.used, d.used_credit, d.usedCredit, d.outstanding),
    available: pickNumber(d.available, d.available_credit, d.availableCredit),
    currencyCode: pickString(d.currency_code, d.currencyCode) || undefined,
    creditStatus: pickString(d.credit_status, d.creditStatus, d.status) || undefined,
    creditDays: pickNumber(d.credit_days, d.creditDays),
  };
}

export function normalizeAging(raw: unknown): PortalAgingResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const bucketsRaw =
    (Array.isArray(d.buckets) && d.buckets) ||
    (Array.isArray(d.aging) && d.aging) ||
    [];
  let buckets: PortalAgingBucket[] = [];
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
  return {
    asOf: pickString(d.as_of, d.asOf) || undefined,
    total: pickNumber(d.total, d.total_outstanding),
    buckets,
  };
}

export function normalizeStatement(raw: unknown): PortalStatementResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const linesRaw = Array.isArray(d.lines) ? d.lines : Array.isArray(d.transactions) ? d.transactions : Array.isArray(d.items) ? d.items : [];
  const lines: PortalStatementLine[] = linesRaw.map((line, i) => {
    const r = asRecord(line) ?? {};
    return {
      id: pickString(r.id) || String(i),
      date: pickString(r.date, r.txn_date, r.transaction_date) || undefined,
      type: pickString(r.type, r.doc_type, d.document_type) || undefined,
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
    closingBalance: pickNumber(d.closing_balance, d.closingBalance),
    lines,
  };
}
