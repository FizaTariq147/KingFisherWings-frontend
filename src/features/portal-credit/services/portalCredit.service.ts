import { portalApiClient } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_CREDIT_API } from '../api/portalCredit.api';
import type { PortalAgingResult, PortalCreditSummary, PortalStatementResult } from '../types/portalCredit.types';
import { normalizeAging, normalizeCreditSummary, normalizeStatement } from '../utils/normalizePortalCredit';

export const portalCreditService = {
  async summary(): Promise<PortalCreditSummary> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.summary);
    return normalizeCreditSummary(res.data);
  },
  async aging(asOf?: string): Promise<PortalAgingResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.aging, { params: asOf ? { as_of: asOf } : undefined });
    return normalizeAging(res.data);
  },
  async statement(asOf?: string): Promise<PortalStatementResult> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.statement, { params: asOf ? { as_of: asOf } : undefined });
    return normalizeStatement(res.data);
  },
  async downloadStatementPdf(asOf?: string): Promise<void> {
    const res = await portalApiClient.get(PORTAL_CREDIT_API.statementPdf, {
      params: asOf ? { as_of: asOf } : undefined,
      responseType: 'blob',
    });
    const filename = filenameFromContentDisposition(
      typeof res.headers['content-disposition'] === 'string' ? res.headers['content-disposition'] : undefined,
    ) || 'statement.pdf';
    triggerBlobDownload(res.data as Blob, filename);
  },
};
