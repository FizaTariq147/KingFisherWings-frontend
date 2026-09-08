import { vendorCreditNotesService } from '@/features/vendor-credit-notes/services/vendorCreditNotes.service';
import type { VendorCreditNoteListItem } from '@/features/vendor-credit-notes/types/vendorCreditNotes.types';
import { vendorInvoicesService } from '@/features/vendor-invoices/services/vendorInvoices.service';
import type { VendorInvoiceListItem } from '@/features/vendor-invoices/types/vendorInvoices.types';
import { vendorPaymentsService } from '@/features/vendor-payments/services/vendorPayments.service';
import type { VendorPaymentListItem } from '@/features/vendor-payments/types/vendorPayments.types';
import type { VendorStatementLine, VendorStatementResult } from '../types/vendorCredit.types';

type RawLine = VendorStatementLine & { sortKey: string };

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

function dateKey(value?: string): string {
  if (!value) return '9999-99-99';
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value;
  return new Date(t).toISOString().slice(0, 10);
}

async function listAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<{ items: T[]; meta: { totalPages: number } }>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages && page <= MAX_PAGES) {
    const result = await fetchPage(page, PAGE_SIZE);
    all.push(...result.items);
    totalPages = Math.max(1, result.meta.totalPages || 1);
    if (!result.items.length) break;
    page += 1;
  }
  return all;
}

/**
 * Build a full AP ledger from every invoice / payment / advance / credit-note page.
 */
export async function composeVendorStatementFromLedgers(
  summary: VendorStatementResult,
  asOf?: string,
): Promise<VendorStatementResult> {
  const dateFilter = asOf ? { to_date: asOf } : {};

  const [invoiceItems, paymentItems, advanceItems, creditNoteItems] = await Promise.all([
    listAllPages<VendorInvoiceListItem>((page, limit) =>
      vendorInvoicesService.list({ page, limit, ...dateFilter }),
    ).catch(async () => {
      const open = await vendorInvoicesService.openItems().catch(() => ({ items: [] as VendorInvoiceListItem[] }));
      return open.items;
    }),
    listAllPages<VendorPaymentListItem>((page, limit) =>
      vendorPaymentsService.list({ page, limit, ...dateFilter }),
    ).catch(() => [] as VendorPaymentListItem[]),
    listAllPages<VendorPaymentListItem>((page, limit) =>
      vendorPaymentsService.listAdvances({ page, limit, ...dateFilter }),
    ).catch(() => [] as VendorPaymentListItem[]),
    listAllPages<VendorCreditNoteListItem>((page, limit) =>
      vendorCreditNotesService.list({ page, limit }),
    ).catch(() => [] as VendorCreditNoteListItem[]),
  ]);

  const raw: RawLine[] = [];
  const seen = new Set<string>();

  for (const inv of invoiceItems) {
    const amount = inv.totalAmount ?? inv.outstandingBalance;
    if (amount == null) continue;
    if (asOf && inv.invoiceDate && inv.invoiceDate > asOf) continue;
    const id = `invoice:${inv.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    raw.push({
      id,
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

  for (const pay of paymentItems) {
    if (pay.amount == null) continue;
    if (asOf && pay.paymentDate && pay.paymentDate > asOf) continue;
    const id = `payment:${pay.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    raw.push({
      id,
      date: pay.paymentDate,
      type: 'PAYMENT',
      reference: pay.reference || pay.id,
      description: [pay.method, pay.status].filter(Boolean).join(' · ') || undefined,
      debit: undefined,
      credit: pay.amount,
      sortKey: `${dateKey(pay.paymentDate)}|2|${pay.reference || pay.id}`,
    });
  }

  for (const adv of advanceItems) {
    if (adv.amount == null) continue;
    if (asOf && adv.paymentDate && adv.paymentDate > asOf) continue;
    const id = `advance:${adv.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    raw.push({
      id,
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

  for (const cn of creditNoteItems) {
    if (cn.amount == null) continue;
    if (asOf && cn.creditDate && cn.creditDate > asOf) continue;
    const id = `credit-note:${cn.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    raw.push({
      id,
      date: cn.creditDate,
      type: 'CREDIT_NOTE',
      reference: cn.number || cn.reference,
      description: cn.status ? `Status ${cn.status.replaceAll('_', ' ')}` : undefined,
      debit: undefined,
      credit: cn.amount,
      sortKey: `${dateKey(cn.creditDate)}|4|${cn.number || cn.id}`,
    });
  }

  for (const line of summary.lines) {
    const id =
      line.id?.startsWith('invoice:') ||
      line.id?.startsWith('payment:') ||
      line.id?.startsWith('advance:') ||
      line.id?.startsWith('credit-note:')
        ? line.id
        : `api:${line.id}`;
    if (seen.has(id) || seen.has(line.id)) continue;
    seen.add(id);
    raw.push({
      ...line,
      id,
      sortKey: `${dateKey(line.date)}|9|${line.reference || line.id}`,
    });
  }

  raw.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  let running = summary.openingBalance ?? 0;
  const lines: VendorStatementLine[] = raw.map(({ sortKey: _sk, ...line }) => {
    running += (line.debit ?? 0) - (line.credit ?? 0);
    return { ...line, balance: running };
  });

  const closingBalance =
    summary.closingBalance != null
      ? summary.closingBalance
      : lines.length
        ? lines[lines.length - 1]?.balance
        : summary.openingBalance;

  if (summary.closingBalance != null && lines.length) {
    lines[lines.length - 1] = {
      ...lines[lines.length - 1],
      balance: summary.closingBalance,
    };
  }

  return {
    ...summary,
    asOf: asOf || summary.asOf,
    closingBalance,
    invoiceCount: summary.invoiceCount ?? invoiceItems.length,
    lines,
    composedFromLedgers: true,
  };
}
