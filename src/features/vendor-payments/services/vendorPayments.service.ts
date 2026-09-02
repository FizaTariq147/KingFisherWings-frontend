import { vendorApiClient } from '@/lib/vendorApiClient';
import { normalizeFinancePaymentsSummary } from '@/features/payment-proofs/utils/normalizePaymentProof';
import type { FinanceOpenItemsSummary } from '@/features/payment-proofs/types/paymentProof.types';
import { downloadVendorBlob } from '@/features/vendor-shared/downloadVendorBlob';
import { VENDOR_ADVANCES_API, VENDOR_PAYMENTS_API } from '../api/vendorPayments.api';
import type {
  VendorPaymentListParams,
  VendorPaymentListResult,
} from '../types/vendorPayments.types';
import { normalizePaymentList } from '../utils/normalizeVendorPayments';

export const vendorPaymentsService = {
  async list(params: VendorPaymentListParams = {}): Promise<VendorPaymentListResult> {
    const res = await vendorApiClient.get(VENDOR_PAYMENTS_API.list, { params });
    return normalizePaymentList(res.data, params, ['items', 'results', 'payments', 'data']);
  },

  async summary(): Promise<FinanceOpenItemsSummary> {
    const res = await vendorApiClient.get(VENDOR_PAYMENTS_API.summary);
    return normalizeFinancePaymentsSummary(res.data);
  },

  async downloadRemittance(id: string, fallbackName = 'remittance.pdf'): Promise<void> {
    await downloadVendorBlob(VENDOR_PAYMENTS_API.remittance(id), fallbackName, {
      accept: 'application/pdf, application/octet-stream, */*',
    });
  },

  async listAdvances(params: VendorPaymentListParams = {}): Promise<VendorPaymentListResult> {
    const res = await vendorApiClient.get(VENDOR_ADVANCES_API.list, { params });
    return normalizePaymentList(res.data, params, ['items', 'results', 'advances', 'payments', 'data']);
  },
};
