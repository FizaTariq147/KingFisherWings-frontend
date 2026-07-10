import { axiosInstance } from '@/lib/axios';
import { AUTH_API } from '../api/auth.api';
import type {
  AuthLoginResult,
  AuthMeResponse,
  AuthTokenPair,
  ChangePasswordDto,
  LoginDto,
  RefreshTokenDto,
  TenantChangePasswordDto,
  TenantLoginDto,
} from '../types/auth.api.types';
import {
  normalizeAuthLoginResponse,
  normalizeTokenPair,
  summarizeAuthPayloadKeys,
} from '../utils/normalizeAuthResponse';
import { normalizeTenantSlugInput } from '../utils/normalizeTenantSlugInput';

function requireLoginResult(raw: unknown, fallbackRole: string): AuthLoginResult {
  const normalized = normalizeAuthLoginResponse(raw, fallbackRole);
  if (!normalized) {
    const keys = summarizeAuthPayloadKeys(raw);
    const mockHint =
      import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true'
        ? ' VITE_MOCK_API is on — set it to false in .env to use the real API.'
        : '';
    throw new Error(
      `Login succeeded but the server response was incomplete (no access token). Keys: ${keys}.${mockHint}`,
    );
  }
  return normalized;
}

function isUnauthorized(error: unknown): boolean {
  return (error as { response?: { status?: number } })?.response?.status === 401;
}

/**
 * ERP Auth service — Swagger tag "Auth".
 * Uses `axiosInstance` (Bearer + credentials).
 */
export const authService = {
  async loginStaff(dto: LoginDto): Promise<AuthLoginResult> {
    const { data } = await axiosInstance.post<unknown>(AUTH_API.login, {
      tenant_slug: normalizeTenantSlugInput(dto.tenant_slug),
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      remember_me: dto.remember_me ?? false,
      device_name: dto.device_name?.trim() || undefined,
    });
    return requireLoginResult(data, 'user');
  },

  /** AuthController_tenantLogin — body: tenant_slug, password, remember_me, device_name */
  async loginTenant(dto: TenantLoginDto): Promise<AuthLoginResult> {
    const body = {
      tenant_slug: normalizeTenantSlugInput(dto.tenant_slug),
      password: dto.password,
      remember_me: dto.remember_me ?? false,
      device_name: dto.device_name?.trim() || 'Web',
    };
    const { data } = await axiosInstance.post<unknown>(AUTH_API.tenantLogin, body);
    return requireLoginResult(data, 'TENANT_ADMIN');
  },

  /**
   * Tenant Admin sign-in.
   * 1) AuthController_tenantLogin — slug + password
   * 2) If that 401s and email is present — AuthController_login (provisioned TENANT_ADMIN user)
   */
  async loginTenantAdmin(dto: LoginDto): Promise<AuthLoginResult> {
    const slug = normalizeTenantSlugInput(dto.tenant_slug);
    const email = dto.email?.trim().toLowerCase() || '';

    try {
      return await this.loginTenant({
        tenant_slug: slug,
        password: dto.password,
        remember_me: dto.remember_me,
        device_name: dto.device_name,
      });
    } catch (tenantError) {
      if (!isUnauthorized(tenantError) || !email) throw tenantError;
    }

    try {
      const result = await this.loginStaff({
        ...dto,
        tenant_slug: slug,
        email,
      });
      return {
        ...result,
        user: { ...result.user, role: result.user.role || 'TENANT_ADMIN' },
      };
    } catch (staffError) {
      if (!isUnauthorized(staffError)) throw staffError;
    }

    throw new Error(
      `Incorrect credentials for slug "${slug}". ` +
        `Tried POST /auth/tenant-login (slug + password)` +
        (email ? ` and POST /auth/login (slug + ${email} + password)` : '') +
        `. Create a new tenant and copy the credentials card, or use SuperAdmin at /superadmin/login.`,
    );
  },

  /** Used after SuperAdmin creates a tenant — confirms tenant-login accepts the password. */
  async verifyTenantCredentials(input: {
    tenant_slug: string;
    email?: string;
    password: string;
  }): Promise<{ ok: true; via: 'staff' | 'tenant' } | { ok: false; message: string }> {
    const device_name = 'post-create-verify';
    try {
      await this.loginTenant({
        tenant_slug: input.tenant_slug,
        password: input.password,
        remember_me: false,
        device_name,
      });
      return { ok: true, via: 'tenant' };
    } catch (tenantError) {
      if (!isUnauthorized(tenantError)) {
        const message =
          tenantError instanceof Error ? tenantError.message : 'Tenant login verify failed';
        return { ok: false, message };
      }
    }

    if (!input.email?.trim()) {
      return {
        ok: false,
        message: 'Tenant-login rejected these credentials (slug + password).',
      };
    }

    try {
      await this.loginStaff({
        tenant_slug: input.tenant_slug,
        email: input.email,
        password: input.password,
        remember_me: false,
        device_name,
      });
      return { ok: true, via: 'staff' };
    } catch (staffError) {
      const message =
        staffError instanceof Error ? staffError.message : 'Staff login verify failed';
      return { ok: false, message };
    }
  },

  async refresh(dto: RefreshTokenDto): Promise<AuthTokenPair> {
    const { data } = await axiosInstance.post<unknown>(AUTH_API.refresh, {
      refresh_token: dto.refresh_token,
    });
    const pair = normalizeTokenPair(data);
    if (!pair) {
      throw new Error('Refresh succeeded but no access token was returned.');
    }
    return pair;
  },

  async logout(): Promise<void> {
    await axiosInstance.post(AUTH_API.logout);
  },

  async logoutAll(): Promise<void> {
    await axiosInstance.post(AUTH_API.logoutAll);
  },

  async me(): Promise<AuthMeResponse> {
    const { data } = await axiosInstance.get<unknown>(AUTH_API.me);
    if (data && typeof data === 'object' && 'data' in data) {
      const envelope = data as { data: unknown };
      if (envelope.data && typeof envelope.data === 'object') {
        return envelope.data as AuthMeResponse;
      }
    }
    return (data ?? {}) as AuthMeResponse;
  },

  async listSessions(): Promise<unknown> {
    const { data } = await axiosInstance.get<unknown>(AUTH_API.sessions);
    return data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await axiosInstance.post(AUTH_API.revokeSession(sessionId));
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await axiosInstance.post(AUTH_API.changePassword, dto);
  },

  async changeTenantPassword(dto: TenantChangePasswordDto): Promise<void> {
    await axiosInstance.post(AUTH_API.tenantChangePassword, dto);
  },
};
