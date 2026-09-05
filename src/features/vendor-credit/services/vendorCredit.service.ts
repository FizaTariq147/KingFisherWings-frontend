import { VendorApiError, vendorApiClient } from '@/lib/vendorApiClient';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { statementPdfBranding } from '@/features/files/utils/pdfBranding';
import { triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';
import { generateAccountStatementPdf } from '@/features/shared/account-statement/generateAccountStatementPdf';
import { VENDOR_CREDIT_API } from '../api/vendorCredit.api';
import type { VendorAgingResult, VendorStatementResult } from '../types/vendorCredit.types';
import { composeVendorStatementFromLedgers } from '../utils/composeVendorStatementFromLedgers';
import { normalizeAging, normalizeStatement } from '../utils/normalizeVendorCredit';

export type VendorStatementPdfMeta = {
  companyName?: string;
  partyName?: string;
};

async function loadStatement(asOf?: string): Promise<VendorStatementResult> {
  const res = await vendorApiClient.get(VENDOR_CREDIT_API.statement, {
    params: asOf ? { as_of: asOf } : undefined,
  });
  const normalized = normalizeStatement(res.data);
  return composeVendorStatementFromLedgers(normalized, asOf);
}

async function buildClientStatementPdf(
  asOf: string | undefined,
  meta: VendorStatementPdfMeta,
): Promise<{ blob: Blob; asOf?: string; reference: string }> {
  const [statement, aging] = await Promise.all([
    loadStatement(asOf),
    vendorCreditService.aging(asOf).catch((): VendorAgingResult => ({ buckets: [] })),
  ]);

  const resolvedAsOf = asOf || statement.asOf || aging.asOf;
  const agingTotal = aging.total ?? statement.closingBalance;
  const agingBuckets =
    aging.buckets.length > 0
      ? aging.buckets
      : agingTotal != null
        ? [{ label: 'Open balance', amount: agingTotal }]
        : [];

  const blob = await generateAccountStatementPdf({
    title: 'Account Statement',
    subtitle: [
      'Vendor AP ledger',
      statement.invoiceCount != null ? `${statement.invoiceCount} invoice(s)` : null,
      statement.advancesUnallocated != null && statement.advancesUnallocated > 0
        ? `Advances unallocated ${statement.advancesUnallocated}`
        : null,
    ]
      .filter(Boolean)
      .join(' · '),
    partyName: meta.partyName,
    partyLabel: 'Vendor',
    asOf: resolvedAsOf,
    openingBalance: statement.openingBalance,
    closingBalance: statement.closingBalance,
    lines: statement.lines,
    agingBuckets,
    agingTotal,
  });

  const reference = `Vendor-AP-${resolvedAsOf || new Date().toISOString().slice(0, 10)}`;
  return { blob, asOf: resolvedAsOf, reference };
}

export const vendorCreditService = {
  async aging(asOf?: string): Promise<VendorAgingResult> {
    const res = await vendorApiClient.get(VENDOR_CREDIT_API.aging, {
      params: asOf ? { as_of: asOf } : undefined,
    });
    return normalizeAging(res.data);
  },

  async statement(asOf?: string): Promise<VendorStatementResult> {
    return loadStatement(asOf);
  },

  /**
   * Generate ledger body locally, then apply the same KingFisher PDF branding
   * used for quotations / invoices / HR letters (logo header + footer).
   * Never downloads `/vendor/credit/statement.pdf` (returns JSON summary).
   */
  async downloadStatementPdf(asOf?: string, meta: VendorStatementPdfMeta = {}): Promise<void> {
    const { blob, asOf: resolvedAsOf, reference } = await buildClientStatementPdf(asOf, meta);
    const typed = new Blob([await blob.arrayBuffer()], { type: 'application/pdf' });

    if (!(await blobLooksLikePdf(typed))) {
      throw new VendorApiError('Failed to generate statement PDF.', 500);
    }

    const filename = `${reference}.pdf`;
    await triggerBrandedPdfDownload(typed, filename, {
      filename,
      branding: statementPdfBranding(reference, resolvedAsOf, {
        companyName: meta.companyName,
      }),
    });
  },
};
