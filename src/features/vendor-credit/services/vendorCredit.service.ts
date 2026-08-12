import { vendorApiClient } from '@/lib/vendorApiClient';
import { downloadVendorBlob } from '@/features/vendor-shared/downloadVendorBlob';
import { VENDOR_CREDIT_API } from '../api/vendorCredit.api';
import type { VendorAgingResult, VendorStatementResult } from '../types/vendorCredit.types';
import { normalizeAging, normalizeStatement } from '../utils/normalizeVendorCredit';

export const vendorCreditService = {
  async aging(asOf?: string): Promise<VendorAgingResult> {
    const res = await vendorApiClient.get(VENDOR_CREDIT_API.aging, {
      params: asOf ? { as_of: asOf } : undefined,
    });
    return normalizeAging(res.data);
  },

  async statement(asOf?: string): Promise<VendorStatementResult> {
    const res = await vendorApiClient.get(VENDOR_CREDIT_API.statement, {
      params: asOf ? { as_of: asOf } : undefined,
    });
    return normalizeStatement(res.data);
  },

  async downloadStatementPdf(asOf?: string): Promise<void> {
    await downloadVendorBlob(VENDOR_CREDIT_API.statementPdf, 'vendor-statement.pdf', {
      params: asOf ? { as_of: asOf } : undefined,
      accept: 'application/pdf, application/octet-stream, */*',
    });
  },
};
