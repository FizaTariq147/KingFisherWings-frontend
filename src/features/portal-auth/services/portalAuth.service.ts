import { portalApiClient, type ApiEnvelope } from '@/lib/portalApiClient';
import { PORTAL_AUTH_API } from '../api/portalAuth.api';
import type { PortalAcceptInviteDto, PortalLoginDto, PortalLoginResult, PortalUser } from '../types/portalAuth.types';
import {
  normalizePortalLoginResponse,
  normalizePortalTokenPair,
  normalizePortalUser,
} from '../utils/normalizePortalAuth';

function unwrapData(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiEnvelope<unknown>).data;
  }
  return raw;
}

export const portalAuthService = {
  async login(dto: PortalLoginDto): Promise<PortalLoginResult> {
    const res = await portalApiClient.post<unknown>(PORTAL_AUTH_API.login, {
      tenant_slug: dto.tenant_slug.trim(),
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    });

    const normalized = normalizePortalLoginResponse(unwrapData(res.data) ?? res.data);
    if (!normalized?.accessToken) {
      throw new Error('Login succeeded but the server response was incomplete.');
    }

    return {
      user: normalized.user,
      accessToken: normalized.accessToken,
      refreshToken: normalized.refreshToken,
    };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await portalApiClient.post<unknown>(PORTAL_AUTH_API.refresh, {
      refresh_token: refreshToken,
    });
    const pair = normalizePortalTokenPair(unwrapData(res.data) ?? res.data);
    if (!pair) throw new Error('Refresh failed.');
    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken || refreshToken,
    };
  },

  async logout(): Promise<void> {
    await portalApiClient.post(PORTAL_AUTH_API.logout);
  },

  async me(): Promise<PortalUser> {
    const res = await portalApiClient.get<unknown>(PORTAL_AUTH_API.me);
    return normalizePortalUser(unwrapData(res.data) ?? res.data);
  },

  async acceptInvite(dto: PortalAcceptInviteDto): Promise<PortalLoginResult | void> {
    const res = await portalApiClient.post<unknown>(PORTAL_AUTH_API.acceptInvite, {
      token: dto.token.trim(),
      password: dto.password,
      full_name: dto.full_name?.trim() || undefined,
    });
    const normalized = normalizePortalLoginResponse(unwrapData(res.data) ?? res.data);
    if (normalized?.accessToken) {
      return {
        user: normalized.user,
        accessToken: normalized.accessToken,
        refreshToken: normalized.refreshToken,
      };
    }
  },
};
