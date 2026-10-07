import { vendorApiClient, type VendorApiEnvelope } from '@/lib/vendorApiClient';
import { VENDOR_AUTH_API } from '../api/vendorAuth.api';
import type {
  VendorAcceptInviteDto,
  VendorChangePasswordDto,
  VendorLoginDto,
  VendorLoginResult,
  VendorUser,
} from '../types/vendorAuth.types';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import {
  mergeVendorUserProfile,
  normalizeVendorLogin,
  normalizeVendorTokenPair,
  normalizeVendorUser,
} from '../utils/normalizeVendorAuth';

function unwrapData(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as VendorApiEnvelope<unknown>).data;
  }
  return raw;
}

export const vendorAuthService = {
  async login(dto: VendorLoginDto): Promise<VendorLoginResult> {
    const res = await vendorApiClient.post<unknown>(VENDOR_AUTH_API.login, {
      tenant_slug: dto.tenant_slug.trim(),
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    });

    const normalized = normalizeVendorLogin(unwrapData(res.data) ?? res.data);
    if (!normalized?.accessToken) {
      throw new Error('Login succeeded but the server response was incomplete.');
    }

    return normalized;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await vendorApiClient.post<unknown>(VENDOR_AUTH_API.refresh, {
      refresh_token: refreshToken,
    });
    const pair = normalizeVendorTokenPair(unwrapData(res.data) ?? res.data);
    if (!pair) throw new Error('Refresh failed.');
    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken || refreshToken,
    };
  },

  async logout(): Promise<void> {
    await vendorApiClient.post(VENDOR_AUTH_API.logout);
  },

  async me(): Promise<VendorUser> {
    const res = await vendorApiClient.get<unknown>(VENDOR_AUTH_API.me);
    const next = normalizeVendorUser(unwrapData(res.data) ?? res.data);
    if (!next) throw new Error('Could not load vendor profile.');
    const prior = useVendorAuthStore.getState().user;
    return mergeVendorUserProfile(prior, next);
  },

  /** POST /vendor/auth/change-password — required when must_change_password is true. */
  async changePassword(dto: VendorChangePasswordDto): Promise<void> {
    await vendorApiClient.post(VENDOR_AUTH_API.changePassword, {
      current_password: dto.current_password,
      new_password: dto.new_password,
    });
  },

  async acceptInvite(dto: VendorAcceptInviteDto): Promise<VendorLoginResult | void> {
    const res = await vendorApiClient.post<unknown>(VENDOR_AUTH_API.acceptInvite, {
      token: dto.token.trim(),
      password: dto.password,
      full_name: dto.full_name?.trim() || undefined,
    });
    const normalized = normalizeVendorLogin(unwrapData(res.data) ?? res.data);
    if (normalized?.accessToken) return normalized;
  },
};
