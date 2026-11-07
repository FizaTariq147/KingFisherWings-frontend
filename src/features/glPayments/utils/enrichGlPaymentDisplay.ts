import { isUuid } from '@/lib/isUuid';
import { chartOfAccountService } from '@/features/chartOfAccounts/services/chartOfAccount.service';
import { chartOfAccountDisplayLabel } from '@/features/chartOfAccounts/utils/normalizeChartOfAccount';
import { invoiceService } from '@/features/invoices/services/invoice.service';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
import { organizationService } from '@/features/organization/services/organization.service';
import { partyService } from '@/features/parties/services/party.service';
import { voucherService } from '@/features/vouchers/services/voucher.service';
import { voucherDisplayNumber } from '@/features/vouchers/utils/normalizeVoucher';
import type { GlPayment, PaymentAllocation } from '../types/glPayment.types';

function humanLabel(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isUuid(trimmed)) return undefined;
  return trimmed;
}

function bankDisplayName(account: {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
}): string | undefined {
  const bank = humanLabel(account.bank_name);
  const name = humanLabel(account.account_name);
  const number = humanLabel(account.account_number);
  if (bank && name) return `${bank} — ${name}`;
  if (bank && number) return `${bank} — ${number}`;
  return bank || name || number;
}

async function mapById<T>(
  ids: string[],
  load: (id: string) => Promise<T | undefined>,
): Promise<Map<string, T>> {
  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const value = await load(id);
        return [id, value] as const;
      } catch {
        return [id, undefined] as const;
      }
    }),
  );
  const map = new Map<string, T>();
  for (const [id, value] of entries) {
    if (value !== undefined) map.set(id, value);
  }
  return map;
}

/**
 * Resolve party / GL account / bank / voucher / invoice labels when the API
 * only returns UUIDs on payment list and detail payloads.
 */
export async function enrichGlPaymentsDisplay(payments: GlPayment[]): Promise<GlPayment[]> {
  if (!payments.length) return payments;

  const partyIds = [
    ...new Set(
      payments
        .filter((p) => !humanLabel(p.party_name) && p.party_id && isUuid(p.party_id))
        .map((p) => p.party_id),
    ),
  ];
  const glAccountIds = [
    ...new Set(
      payments
        .filter(
          (p) =>
            (!humanLabel(p.gl_account_code) || !humanLabel(p.gl_account_name)) &&
            p.gl_account_id &&
            isUuid(p.gl_account_id),
        )
        .map((p) => p.gl_account_id as string),
    ),
  ];
  const bankAccountIds = [
    ...new Set(
      payments
        .filter(
          (p) =>
            !humanLabel(p.bank_account_name) &&
            p.bank_account_id &&
            isUuid(p.bank_account_id),
        )
        .map((p) => p.bank_account_id as string),
    ),
  ];
  const voucherIds = [
    ...new Set(
      payments
        .filter(
          (p) =>
            !humanLabel(p.voucher_number) && p.voucher_id && isUuid(p.voucher_id),
        )
        .map((p) => p.voucher_id as string),
    ),
  ];
  const invoiceIds = [
    ...new Set(
      payments.flatMap((p) =>
        (p.allocations ?? [])
          .filter(
            (a) =>
              !humanLabel(a.invoice_number) && a.invoice_id && isUuid(a.invoice_id),
          )
          .map((a) => a.invoice_id),
      ),
    ),
  ];

  const [partyById, glById, bankById, voucherById, invoiceById] = await Promise.all([
    mapById(partyIds, async (id) => {
      const party = await partyService.getById(id);
      return humanLabel(party.name) ?? humanLabel(party.code);
    }),
    mapById(glAccountIds, async (id) => {
      const account = await chartOfAccountService.getById(id);
      return {
        code: humanLabel(account.account_code),
        name: humanLabel(account.account_name),
        label: humanLabel(chartOfAccountDisplayLabel(account)),
      };
    }),
    mapById(bankAccountIds, async (id) => {
      const account = await organizationService.getBankAccount(id);
      return bankDisplayName(account);
    }),
    mapById(voucherIds, async (id) => {
      const voucher = await voucherService.getById(id);
      return humanLabel(voucherDisplayNumber(voucher)) ?? humanLabel(voucher.voucher_number);
    }),
    mapById(invoiceIds, async (id) => {
      const invoice = await invoiceService.getById(id);
      return humanLabel(invoiceDisplayNumber(invoice)) ?? humanLabel(invoice.invoice_number);
    }),
  ]);

  return payments.map((payment) => {
    const gl = payment.gl_account_id ? glById.get(payment.gl_account_id) : undefined;
    const partyName =
      humanLabel(payment.party_name) ||
      (payment.party_id ? partyById.get(payment.party_id) : undefined);
    const glCode = humanLabel(payment.gl_account_code) || gl?.code;
    const glName = humanLabel(payment.gl_account_name) || gl?.name;
    const bankName =
      humanLabel(payment.bank_account_name) ||
      (payment.bank_account_id ? bankById.get(payment.bank_account_id) : undefined);
    const voucherNumber =
      humanLabel(payment.voucher_number) ||
      (payment.voucher_id ? voucherById.get(payment.voucher_id) : undefined);

    const allocations = payment.allocations?.map((row): PaymentAllocation => {
      const invoiceNumber =
        humanLabel(row.invoice_number) ||
        (row.invoice_id ? invoiceById.get(row.invoice_id) : undefined);
      if (invoiceNumber === row.invoice_number) return row;
      return { ...row, invoice_number: invoiceNumber || row.invoice_number };
    });

    const unchanged =
      partyName === payment.party_name &&
      glCode === payment.gl_account_code &&
      glName === payment.gl_account_name &&
      bankName === payment.bank_account_name &&
      voucherNumber === payment.voucher_number &&
      allocations === payment.allocations;

    if (unchanged) return payment;

    return {
      ...payment,
      party_name: partyName || payment.party_name,
      gl_account_code: glCode || payment.gl_account_code,
      gl_account_name: glName || payment.gl_account_name,
      bank_account_name: bankName || payment.bank_account_name,
      voucher_number: voucherNumber || payment.voucher_number,
      reference_number: humanLabel(payment.reference_number),
      allocations: allocations ?? payment.allocations,
    };
  });
}
