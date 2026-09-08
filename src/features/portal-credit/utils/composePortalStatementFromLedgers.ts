import { portalCreditNotesService } from '@/features/portal-credit-notes/services/portalCreditNotes.service';
import type { PortalCreditNoteListItem } from '@/features/portal-credit-notes/types/portalCreditNotes.types';
import { portalInvoicesService } from '@/features/portal-invoices/services/portalInvoices.service';
import type { PortalInvoiceListItem } from '@/features/portal-invoices/types/portalInvoices.types';
import { portalPaymentsService } from '@/features/portal-payments/services/portalPayments.service';
import type { PortalPaymentListItem } from '@/features/portal-payments/types/portalPayments.types';
import type { PortalStatementLine, PortalStatementResult } from '../types/portalCredit.types';

type RawLine = PortalStatementLine & { sortKey: string };

const PAGE_SIZE = 100;
const MAX_PAGES = 50; // safety cap (up to 5,000 rows per source)

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
 * Build a full AR ledger from every invoice / payment / credit note page
 * (not just the first 200). Uses statement API only for opening/closing totals.
 */
export async function composePortalStatementFromLedgers(
  summary: PortalStatementResult,
  asOf?: string,
): Promise<PortalStatementResult> {
  const dateFilter = asOf ? { to_date: asOf } : {};

  const [invoiceItems, paymentItems, creditNoteItems] = await Promise.all([
    listAllPages<PortalInvoiceListItem>((page, limit) =>
      portalInvoicesService.list({ page, limit, ...dateFilter }),
    ).catch(async () => {
      const open = await portalInvoicesService.openItems().catch(() => ({ items: [] as PortalInvoiceListItem[] }));
      return open.items;
    }),
    listAllPages<PortalPaymentListItem>((page, limit) =>
      portalPaymentsService.list({ page, limit, ...dateFilter }),
    ).catch(() => [] as PortalPaymentListItem[]),
    listAllPages<PortalCreditNoteListItem>((page, limit) =>
      portalCreditNotesService.list({ page, limit, ...dateFilter }, 'credit'),
    ).catch(() => [] as PortalCreditNoteListItem[]),
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
      reference: inv.number,
      description: [
        inv.status ? `Status ${inv.status.replaceAll('_', ' ')}` : null,
        inv.dueDate ? `Due ${inv.dueDate}` : null,
        inv.paidAmount != null ? `Paid ${inv.paidAmount}` : null,
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
      description: [pay.method, pay.status, pay.direction].filter(Boolean).join(' · ') || undefined,
      debit: undefined,
      credit: pay.amount,
      sortKey: `${dateKey(pay.paymentDate)}|2|${pay.reference || pay.id}`,
    });
  }

  for (const cn of creditNoteItems) {
    if (cn.totalAmount == null) continue;
    if (asOf && cn.creditDate && cn.creditDate > asOf) continue;
    const id = `credit-note:${cn.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const isDebit = cn.kind === 'debit';
    raw.push({
      id,
      date: cn.creditDate,
      type: isDebit ? 'DEBIT_NOTE' : 'CREDIT_NOTE',
      reference: cn.number || cn.creditedInvoiceNumber,
      description: [
        cn.status ? `Status ${cn.status.replaceAll('_', ' ')}` : null,
        cn.creditedInvoiceNumber ? `Invoice ${cn.creditedInvoiceNumber}` : null,
      ]
        .filter(Boolean)
        .join(' · ') || undefined,
      debit: isDebit ? cn.totalAmount : undefined,
      credit: isDebit ? undefined : cn.totalAmount,
      sortKey: `${dateKey(cn.creditDate)}|3|${cn.number || cn.id}`,
    });
  }

  // If the statement API already returned lines, merge any that are missing from ledgers
  // (covers edge docs not listed under invoices/payments).
  for (const line of summary.lines) {
    const id = line.id?.startsWith('invoice:') || line.id?.startsWith('payment:') || line.id?.startsWith('credit-note:')
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
  const lines: PortalStatementLine[] = raw.map(({ sortKey: _sk, ...line }) => {
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
