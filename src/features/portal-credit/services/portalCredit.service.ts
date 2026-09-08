import { PortalApiError, portalApiClient } from '@/lib/portalApiClient';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { statementPdfBranding } from '@/features/files/utils/pdfBranding';
import { triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';
import { generateAccountStatementPdf } from '@/features/shared/account-statement/generateAccountStatementPdf';
import { PORTAL_CREDIT_API } from '../api/portalCredit.api';
import type {
  PortalAgingResult,
  PortalCreditSummary,
  PortalStatementResult,
} from '../types/portalCredit.types';
import { composePortalStatementFromLedgers } from '../utils/composePortalStatementFromLedgers';
import {
  normalizeAging,
  normalizeCreditSummary,
  normalizeStatement,
} from '../utils/normalizePortalCredit';

export type PortalStatementPdfMeta = {
  companyName?: string;
  partyName?: string;
};

async function loadStatement(asOf?: string): Promise<PortalStatementResult> {
  const res = await portalApiClient.get(PORTAL_CREDIT_API.statement, {
    params: asOf ? { as_of: asOf } : undefined,
  });
  const normalized = normalizeStatement(res.data);
  return composePortalStatementFromLedgers(normalized, asOf);
}

async function buildClientStatementPdf(
  asOf: string | undefined,
  meta: PortalStatementPdfMeta,
): Promise<{ blob: Blob; asOf?: string; reference: string }> {
  const [statement, aging, summary] = await Promise.all([
    loadStatement(asOf),
    portalCreditService.aging(asOf).catch((): PortalAgingResult => ({ buckets: [] })),
    portalCreditService.summary().catch((): PortalCreditSummary => ({})),
  ]);

  const resolvedAsOf = asOf || statement.asOf || aging.asOf;
  const agingTotal = aging.total ?? statement.closingBalance ?? summary.used;
  const agingBuckets =
    aging.buckets.length > 0
      ? aging.buckets
      : agingTotal != null
        ? [{ label: 'Open balance', amount: agingTotal }]
        : [];
  const currency = statement.currencyCode || summary.currencyCode;

  const blob = await generateAccountStatementPdf({
    title: 'Account Statement',
    subtitle: [
      'Customer AR ledger — full history',
      `${statement.lines.length} transaction(s)`,
      statement.invoiceCount != null ? `${statement.invoiceCount} invoice(s)` : null,
      currency ? currency : null,
    ]
      .filter(Boolean)
      .join(' · '),
    partyName: meta.partyName,
    partyLabel: 'Customer',
    asOf: resolvedAsOf,
    currencyCode: currency,
    openingBalance: statement.openingBalance,
    closingBalance: statement.closingBalance ?? agingTotal,
    lines: statement.lines,
    agingBuckets,
    agingTotal,
  });

  const reference = `AR-Statement-${resolvedAsOf || new Date().toISOString().slice(0, 10)}`;
  return { blob, asOf: resolvedAsOf, reference };
}

export const portalCreditService = {
  async summary(): Promise<PortalCreditSummary> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.summary);
    return normalizeCreditSummary(res.data);
  },

  async aging(asOf?: string): Promise<PortalAgingResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.aging, {
      params: asOf ? { as_of: asOf } : undefined,
    });
    return normalizeAging(res.data);
  },

  async statement(asOf?: string): Promise<PortalStatementResult> {
    return loadStatement(asOf);
  },

  /**
   * Always generate ledger PDF in the browser with system branding.
   * Live `/portal/credit/statement.pdf` often returns JSON / empty — never download it.
   */
  async downloadStatementPdf(asOf?: string, meta: PortalStatementPdfMeta = {}): Promise<void> {
    const { blob, asOf: resolvedAsOf, reference } = await buildClientStatementPdf(asOf, meta);
    const typed = new Blob([await blob.arrayBuffer()], { type: 'application/pdf' });

    if (!(await blobLooksLikePdf(typed))) {
      throw new PortalApiError('Failed to generate statement PDF.', 500);
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
