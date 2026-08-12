import { axiosInstance } from '@/lib/axios';
import { VENDOR_ADMIN_DISPUTES_API } from '../api/vendorAdminDisputes.api';
import type {
  AdminVendorDispute,
  ReviewVendorDisputeDto,
} from '../types/vendorAdminDisputes.types';
import {
  normalizeAdminVendorDispute,
  normalizeAdminVendorDisputes,
} from '../utils/normalizeVendorAdminDisputes';

const staffGetConfig = { withCredentials: false as const };

export const vendorAdminDisputesService = {
  async list(): Promise<AdminVendorDispute[]> {
    const res = await axiosInstance.get(VENDOR_ADMIN_DISPUTES_API.list, staffGetConfig);
    return normalizeAdminVendorDisputes(res.data);
  },

  async getById(id: string): Promise<AdminVendorDispute> {
    const res = await axiosInstance.get(VENDOR_ADMIN_DISPUTES_API.detail(id), staffGetConfig);
    const item = normalizeAdminVendorDispute(res.data?.data ?? res.data);
    if (!item) throw new Error('Dispute not found.');
    return item;
  },

  async review(id: string, dto: ReviewVendorDisputeDto): Promise<void> {
    await axiosInstance.patch(VENDOR_ADMIN_DISPUTES_API.review(id), dto, staffGetConfig);
  },
};
