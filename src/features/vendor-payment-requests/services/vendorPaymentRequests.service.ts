import { vendorApiClient } from '@/lib/vendorApiClient';
import { VENDOR_PAYMENT_REQUESTS_API } from '../api/vendorPaymentRequests.api';
import type {
  VendorPaymentRequestListParams,
  VendorPaymentRequestListResult,
} from '../types/vendorPaymentRequests.types';
import { normalizePaymentRequestList } from '../utils/normalizeVendorPaymentRequests';

export const vendorPaymentRequestsService = {
  async list(params: VendorPaymentRequestListParams = {}): Promise<VendorPaymentRequestListResult> {
    const res = await vendorApiClient.get(VENDOR_PAYMENT_REQUESTS_API.list, { params });
    return normalizePaymentRequestList(res.data, params);
  },
};
