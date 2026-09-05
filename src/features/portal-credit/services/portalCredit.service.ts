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
import {
  normalizeAging,
  normalizeCreditSummary,
  normalizeStatement,
} from '../utils/normalizePortalCredit';

export type PortalStatementPdfMeta = {
  companyName?: string;
  partyName?: string;
};

async function buildClientStatementPdf(
  asOf: string | undefined,
  meta: PortalStatementPdfMeta,
): Promise<{ blob: Blob; asOf?: string; reference: string }> {
  const [statement, aging] = await Promise.all([
    portalCreditService.statement(asOf),
    portalCreditService.aging(asOf).catch((): PortalAgingResult => ({ buckets: [] })),
  ]);
  const resolvedAsOf = asOf || statement.asOf || aging.asOf;
  const blob = await generateAccountStatementPdf({
    title: 'Account Statement',
    subtitle: 'Customer AR ledger',
    partyName: meta.partyName,
    partyLabel: 'Customer',
    asOf: resolvedAsOf,
    openingBalance: statement.openingBalance,
    closingBalance: statement.closingBalance,
    lines: statement.lines,
    agingBuckets: aging.buckets,
    agingTotal: aging.total,
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
    const res = await portalApiClient.get(PORTAL_CREDIT_API.statement, {
      params: asOf ? { as_of: asOf } : undefined,
    });
    return normalizeStatement(res.data);
  },
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
