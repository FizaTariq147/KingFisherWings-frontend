import {
  asRecord,
  pickNumber,
  pickString,
  unwrapData,
} from '@/features/portal-shared/normalize';
import type {
  PortalAgingBucket,
  PortalAgingResult,
  PortalCreditSummary,
  PortalPendingJobCharge,
  PortalStatementLine,
  PortalStatementResult,
} from '../types/portalCredit.types';

export function normalizeCreditSummary(raw: unknown): PortalCreditSummary {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    creditLimit: pickNumber(d.credit_limit, d.creditLimit, d.limit),
    used: pickNumber(d.used, d.used_credit, d.usedCredit, d.outstanding, d.open_balance),
    available: pickNumber(d.available, d.available_credit, d.availableCredit),
    currencyCode: pickString(d.currency_code, d.currencyCode) || undefined,
    creditStatus: pickString(d.credit_status, d.creditStatus, d.status) || undefined,
    creditDays: pickNumber(d.credit_days, d.creditDays),
  };
}

export function normalizeAging(raw: unknown): PortalAgingResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const bucketsRaw =
    (Array.isArray(d.buckets) && d.buckets) || (Array.isArray(d.aging) && d.aging) || [];
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
    total: pickNumber(
      d.total,
      d.total_outstanding,
      d.outstanding,
      d.open_balance,
      d.openBalance,
    ),
    buckets,
  };
}

export function normalizeStatement(raw: unknown): PortalStatementResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const linesRaw = Array.isArray(d.lines)
    ? d.lines
    : Array.isArray(d.transactions)
      ? d.transactions
      : Array.isArray(d.items)
        ? d.items
        : [];
  const lines: PortalStatementLine[] = linesRaw.map((line, i) => {
    const r = asRecord(line) ?? {};
    const paymentStatus = pickString(
      r.payment_status,
      r.paymentStatus,
      r.ar_status,
      r.arStatus,
    );
    return {
      id: pickString(r.id) || String(i),
      date: pickString(r.date, r.txn_date, r.transaction_date) || undefined,
      type: pickString(r.type, r.doc_type) || undefined,
      reference: pickString(r.reference, r.ref, r.document_number, r.invoice_number) || undefined,
      debit: pickNumber(r.debit, r.debit_amount, r.invoice_amount),
      credit: pickNumber(r.credit, r.credit_amount, r.payment_amount),
      balance: pickNumber(r.balance, r.running_balance),
      description: pickString(r.description, r.narration) || undefined,
      paymentStatus: paymentStatus?.toUpperCase(),
    };
  });

  const summary = asRecord(d.summary);
  const pendingRaw =
    (Array.isArray(d.pending_job_charges) && d.pending_job_charges) ||
    (Array.isArray(d.pendingJobCharges) && d.pendingJobCharges) ||
    (Array.isArray(summary?.pending_job_charges) && summary.pending_job_charges) ||
    [];
  const pendingJobCharges: PortalPendingJobCharge[] = [];
  for (const row of pendingRaw) {
    const r = asRecord(row) ?? {};
    const chargeId = pickString(r.charge_id, r.chargeId, r.job_charge_id, r.id) || '';
    if (!chargeId) continue;
    pendingJobCharges.push({
      chargeId,
      jobId: pickString(r.job_id, r.jobId) || undefined,
      jobNumber: pickString(r.job_number, r.jobNumber) || undefined,
      description:
        pickString(r.description, r.charge_description, r.charge_name, r.name) ||
        undefined,
      saleAmount: pickNumber(
        r.sale_amount,
        r.saleAmount,
        r.cost_amount,
        r.costAmount,
        r.amount,
      ),
      currencyCode:
        pickString(r.currency_code, r.currencyCode, r.currency)?.toUpperCase() ||
        undefined,
      needsInvoice:
        r.needs_invoice === true ||
        r.needsInvoice === true ||
        !pickString(r.invoice_id, r.invoiceId),
    });
  }

  const invoiced = pickNumber(
    d.invoice_balance,
    summary?.invoice_balance,
    d.invoiced,
    summary?.invoiced,
    d.invoiced_total,
  );
  const pendingCosting =
    pickNumber(d.pending_costing, summary?.pending_costing, d.pending_costing_total) ??
    (pendingJobCharges.length
      ? pendingJobCharges.reduce((s, c) => s + (c.saleAmount ?? 0), 0)
      : undefined);
  const paid = pickNumber(d.paid, summary?.paid, d.paid_total, summary?.receipts_total);
  const openingBalance = pickNumber(d.opening_balance, d.openingBalance);
  const balance =
    pickNumber(d.open_balance, summary?.open_balance, d.balance, summary?.balance, d.closing_balance) ??
    (invoiced != null || pendingCosting != null || openingBalance != null
      ? (openingBalance ?? 0) + (invoiced ?? 0) + (pendingCosting ?? 0)
      : undefined);

  return {
    asOf: pickString(d.as_of, d.asOf) || undefined,
    openingBalance: openingBalance,
    closingBalance: pickNumber(
      d.closing_balance,
      d.closingBalance,
      d.open_balance,
      d.openBalance,
      balance,
      d.outstanding,
    ),
    invoiced,
    pendingCosting,
    paid,
    balance,
    invoiceCount: pickNumber(d.invoice_count, d.invoiceCount),
    currencyCode: pickString(d.currency_code, d.currencyCode) || undefined,
    truncated: typeof d.truncated === 'boolean' ? d.truncated : undefined,
    pendingJobCharges: pendingJobCharges.length ? pendingJobCharges : undefined,
    lines,
  };
}
