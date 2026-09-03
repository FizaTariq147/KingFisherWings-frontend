import { vendorApiClient } from '@/lib/vendorApiClient';
import { VENDOR_PAYMENT_REQUESTS_API } from '../api/vendorPaymentRequests.api';
import type {
  VendorPaymentRequest,
  VendorPaymentRequestListParams,
  VendorPaymentRequestListResult,
} from '../types/vendorPaymentRequests.types';
import {
  normalizePaymentRequestDetail,
  normalizePaymentRequestList,
} from '../utils/normalizeVendorPaymentRequests';

export const vendorPaymentRequestsService = {
  async list(params: VendorPaymentRequestListParams = {}): Promise<VendorPaymentRequestListResult> {
    const res = await vendorApiClient.get(VENDOR_PAYMENT_REQUESTS_API.list, { params });
    return normalizePaymentRequestList(res.data, params);
  },

  async getById(id: string): Promise<VendorPaymentRequest> {
    const res = await vendorApiClient.get(VENDOR_PAYMENT_REQUESTS_API.detail(id));
    const detail = normalizePaymentRequestDetail(res.data);
    if (!detail) throw new Error('Payment request not found.');
    return detail;
  },
};
