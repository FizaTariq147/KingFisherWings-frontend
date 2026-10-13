import { axiosInstance } from '@/lib/axios';
import { vendorApiClient } from '@/lib/vendorApiClient';
import { withGatewayRetry } from '@/lib/wakeApi';
import { asList, unwrap } from '@/features/online-payments/utils/billingApiHelpers';
import {
  VENDOR_PAYOUTS_ADMIN_API,
  VENDOR_PORTAL_PAYOUTS_API,
} from '../api/vendorPayouts.api';

export const vendorPortalPayoutsService = {
  async list(params?: Record<string, unknown>) {
    const res = await vendorApiClient.get(VENDOR_PORTAL_PAYOUTS_API.list, { params });
    return asList(res.data);
  },

  async getById(id: string, params?: Record<string, unknown>) {
    const res = await vendorApiClient.get(VENDOR_PORTAL_PAYOUTS_API.detail(id), { params });
    return unwrap(res.data);
  },

  async getAccount(params?: Record<string, unknown>) {
    const res = await vendorApiClient.get(VENDOR_PORTAL_PAYOUTS_API.account, { params });
    return unwrap(res.data);
  },

  async createAccountOnboardingLink(body: Record<string, unknown> = {}) {
    const res = await vendorApiClient.post(
      VENDOR_PORTAL_PAYOUTS_API.accountOnboardingLink,
      body,
    );
    return unwrap(res.data);
  },
};

export const vendorPayoutsAdminService = {
  async list(params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(VENDOR_PAYOUTS_ADMIN_API.list, { params }),
    );
    return asList(res.data);
  },

  async getById(id: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(VENDOR_PAYOUTS_ADMIN_API.detail(id), { params }),
    );
    return unwrap(res.data);
  },

  async getAccount(partyId: string, params?: Record<string, unknown>) {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(VENDOR_PAYOUTS_ADMIN_API.account(partyId), { params }),
    );
    return unwrap(res.data);
  },

  async createAccountOnboardingLink(partyId: string, body: Record<string, unknown> = {}) {
    const res = await withGatewayRetry(() =>
      axiosInstance.post(VENDOR_PAYOUTS_ADMIN_API.accountOnboardingLink(partyId), body),
    );
    return unwrap(res.data);
  },
};
