import { vendorApiClient } from '@/lib/vendorApiClient';
import { VENDOR_TDS_API } from '../api/vendorTds.api';
import type { VendorTdsResult } from '../types/vendorTds.types';
import { normalizeTds } from '../utils/normalizeVendorTds';

export const vendorTdsService = {
  async get(): Promise<VendorTdsResult> {
    const res = await vendorApiClient.get(VENDOR_TDS_API.list);
    return normalizeTds(res.data);
  },
};
