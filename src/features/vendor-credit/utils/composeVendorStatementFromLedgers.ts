import { vendorCreditNotesService } from '@/features/vendor-credit-notes/services/vendorCreditNotes.service';
import { vendorInvoicesService } from '@/features/vendor-invoices/services/vendorInvoices.service';
import { vendorPaymentsService } from '@/features/vendor-payments/services/vendorPayments.service';
import type { VendorStatementLine, VendorStatementResult } from '../types/vendorCredit.types';

type RawLine = VendorStatementLine & { sortKey: string };

function dateKey(value?: string): string {
  if (!value) return '9999-99-99';
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value;
  return new Date(t).toISOString().slice(0, 10);
}

/**
 * Build a full AP ledger when `/vendor/credit/statement` only returns a summary
 * (`invoice_count`, `open_balance`, …) with no transaction lines.
 */
export async function composeVendorStatementFromLedgers(
  summary: VendorStatementResult,
  asOf?: string,
): Promise<VendorStatementResult> {
  if (summary.lines.length > 0) return summary;

  const listParams = {
    page: 1,
    limit: 200,
    ...(asOf ? { to_date: asOf } : {}),
  };

  const [invoiceList, payments, advances, creditNotes] = await Promise.all([
    vendorInvoicesService.list(listParams).catch(() => ({ items: [] as const })),
    vendorPaymentsService.list(listParams).catch(() => ({ items: [] as const })),
    vendorPaymentsService.listAdvances(listParams).catch(() => ({ items: [] as const })),
    vendorCreditNotesService.list({ page: 1, limit: 200 }).catch(() => ({ items: [] as const })),
  ]);

  let invoiceItems = invoiceList.items;
  if (
    invoiceItems.length === 0 &&
    (summary.invoiceCount == null || summary.invoiceCount > 0)
  ) {
    const open = await vendorInvoicesService.openItems().catch(() => ({ items: [] as const }));
    invoiceItems = open.items;
  }

  const raw: RawLine[] = [];

  for (const inv of invoiceItems) {
    const amount = inv.totalAmount ?? inv.outstandingBalance;
    if (amount == null) continue;
    raw.push({
      id: `invoice:${inv.id}`,
      date: inv.invoiceDate || inv.dueDate,
      type: 'INVOICE',
      reference: inv.number || inv.reference,
      description: [
        inv.status ? `Status ${inv.status.replaceAll('_', ' ')}` : null,
        inv.dueDate ? `Due ${inv.dueDate}` : null,
        inv.outstandingBalance != null ? `Open ${inv.outstandingBalance}` : null,
      ]
        .filter(Boolean)
        .join(' · ') || undefined,
      debit: amount,
      credit: undefined,
      sortKey: `${dateKey(inv.invoiceDate || inv.dueDate)}|1|${inv.number || inv.id}`,
    });
  }

  for (const pay of payments.items) {
    if (pay.amount == null) continue;
    raw.push({
      id: `payment:${pay.id}`,
      date: pay.paymentDate,
      type: 'PAYMENT',
      reference: pay.reference || pay.id,
      description: [pay.method, pay.status].filter(Boolean).join(' · ') || undefined,
      debit: undefined,
      credit: pay.amount,
      sortKey: `${dateKey(pay.paymentDate)}|2|${pay.reference || pay.id}`,
    });
  }

  for (const adv of advances.items) {
    if (adv.amount == null) continue;
    raw.push({
      id: `advance:${adv.id}`,
      date: adv.paymentDate,
      type: 'ADVANCE',
      reference: adv.reference || adv.id,
      description:
        adv.unallocatedAmount != null
          ? `Unallocated ${adv.unallocatedAmount}`
          : adv.status || undefined,
      debit: undefined,
      credit: adv.amount,
      sortKey: `${dateKey(adv.paymentDate)}|3|${adv.reference || adv.id}`,
    });
  }

  for (const cn of creditNotes.items) {
    if (cn.amount == null) continue;
    if (asOf && cn.creditDate && cn.creditDate > asOf) continue;
    raw.push({
      id: `credit-note:${cn.id}`,
      date: cn.creditDate,
      type: 'CREDIT_NOTE',
      reference: cn.number || cn.reference,
      description: cn.status ? `Status ${cn.status.replaceAll('_', ' ')}` : undefined,
      debit: undefined,
      credit: cn.amount,
      sortKey: `${dateKey(cn.creditDate)}|4|${cn.number || cn.id}`,
    });
  }

  raw.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let running = summary.openingBalance ?? 0;
  const lines: VendorStatementLine[] = raw.map(({ sortKey: _sk, ...line }) => {
    running += (line.debit ?? 0) - (line.credit ?? 0);
    return { ...line, balance: running };
  });

  const closingFromSummary = summary.closingBalance;
  const closingBalance =
    closingFromSummary != null
      ? closingFromSummary
      : lines.length
        ? lines[lines.length - 1]?.balance
        : summary.openingBalance;

  // If API gave open_balance but our reconstructed running total differs, prefer API closing
  // and still show reconstructed activity lines.
  if (closingFromSummary != null && lines.length) {
    lines[lines.length - 1] = {
      ...lines[lines.length - 1],
      balance: closingFromSummary,
    };
  }

  return {
    ...summary,
    asOf: asOf || summary.asOf,
    closingBalance,
    lines,
    composedFromLedgers: true,
  };
}
