import { superAdminApiClient, type ApiEnvelope } from '../../../lib/superAdminApiClient';
import { AUTH_API } from '../../auth/api/auth.api';
import { normalizeAuthLoginResponse, normalizeTokenPair } from '../../auth/utils/normalizeAuthResponse';
import type { SuperAdminUser } from '../store/superAdminAuthStore';

export interface SuperAdminLoginDto {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  user: SuperAdminUser;
  access_token: string;
  refresh_token: string;
}

function toSuperAdminUser(raw: {
  id: string;
  name: string;
  email: string;
}): SuperAdminUser {
  const parts = raw.name.split(/\s+/).filter(Boolean);
  return {
    id: raw.id,
    email: raw.email,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

export const superAdminAuthService = {
  async login(dto: SuperAdminLoginDto): Promise<SuperAdminLoginResponse> {
    const res = await superAdminApiClient.post<unknown>(AUTH_API.superAdminLogin, dto);
    const payload =
      res.data && typeof res.data === 'object' && 'data' in (res.data as object)
        ? (res.data as ApiEnvelope<unknown>).data
        : res.data;

    const normalized = normalizeAuthLoginResponse(payload, 'SUPER_ADMIN');
    if (!normalized) {
      throw new Error('Login succeeded but the server response was incomplete.');
    }

    return {
      user: toSuperAdminUser(normalized.user),
      access_token: normalized.accessToken,
      refresh_token: normalized.refreshToken,
    };
  },

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const res = await superAdminApiClient.post<unknown>(AUTH_API.refresh, {
      refresh_token: refreshToken,
    });
    const payload =
      res.data && typeof res.data === 'object' && 'data' in (res.data as object)
        ? (res.data as ApiEnvelope<unknown>).data
        : res.data;
    const pair = normalizeTokenPair(payload);
    if (!pair) throw new Error('Refresh failed.');
    return {
      access_token: pair.accessToken,
      refresh_token: pair.refreshToken || refreshToken,
    };
  },

  async logout(): Promise<void> {
    await superAdminApiClient.post(AUTH_API.logout);
  },
};
