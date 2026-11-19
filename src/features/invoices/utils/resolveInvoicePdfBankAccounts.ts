import { organizationService } from '@/features/organization/services/organization.service';
import type { TenantBankAccount } from '@/features/organization/types/organization.types';
import type { InvoicePdfBankAccount } from './generateInvoicePdf';

/** Map org bank accounts into the classic tax-invoice PDF bank block. */
export function toInvoicePdfBankAccounts(
  accounts: TenantBankAccount[],
): InvoicePdfBankAccount[] {
  const active = accounts.filter((a) => a.is_active !== false);
  const ranked = [...active].sort((a, b) => {
    if (a.is_default === b.is_default) return 0;
    return a.is_default ? -1 : 1;
  });
  const out: InvoicePdfBankAccount[] = [];
  for (const a of ranked) {
    const bankName = a.bank_name?.trim() || '';
    const accountName = a.account_name?.trim() || '';
    const accountNumber = a.account_number?.trim() || '';
    const iban = a.iban?.trim() || '';
    const swiftCode = a.swift_code?.trim() || '';
    const currencyCode = a.currency_code?.trim().toUpperCase() || '';
    if (!bankName && !accountName && !accountNumber && !iban && !swiftCode) continue;
    out.push({
      bankName: bankName || undefined,
      accountName: accountName || undefined,
      accountNumber: accountNumber || undefined,
      iban: iban || undefined,
      swiftCode: swiftCode || undefined,
      currencyCode: currencyCode || undefined,
      isDefault: a.is_default === true,
    });
  }
  return out;
}

/**
 * Load active organization bank accounts for the KingFisher invoice PDF.
 * Prefers default accounts first; returns [] when none are on file.
 */
export async function resolveInvoicePdfBankAccountsAsync(): Promise<
  InvoicePdfBankAccount[]
> {
  try {
    const listed = await organizationService.listBankAccounts({
      limit: 20,
      is_active: true,
    });
    return toInvoicePdfBankAccounts(listed.accounts);
  } catch {
    return [];
  }
}
