import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import { ACCOUNTS_FORMAT_UI_LAYOUTS } from './accountsFormatUiLayouts.generated.ts';

/** Permanent JSON UI layouts for Accounts / Finance formats. */
export const ACCOUNTS_FORMAT_UI_LAYOUT_LIST: InvoiceFormatUiLayout[] = ACCOUNTS_FORMAT_UI_LAYOUTS;

const byCode = new Map(
  ACCOUNTS_FORMAT_UI_LAYOUT_LIST.map((row) => [row.code.toUpperCase(), row]),
);

export function getAccountsFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const needle = code.trim().toUpperCase();
  if (!needle) return undefined;
  return byCode.get(needle);
}

export function hasAccountsFormatUiLayout(code: string): boolean {
  return Boolean(getAccountsFormatUiLayout(code));
}

export function listAccountsFormatUiLayouts(): InvoiceFormatUiLayout[] {
  return ACCOUNTS_FORMAT_UI_LAYOUT_LIST;
}
