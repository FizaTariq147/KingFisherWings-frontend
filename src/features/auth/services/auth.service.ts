import { axiosInstance } from '@/lib/axios';
import { USER_API } from '@/features/users/api/user.api';
import { AUTH_API } from '../api/auth.api';
import type {
  AcceptInviteDto,
  AuthLoginResult,
  AuthMeResponse,
  AuthTokenPair,
  ChangePasswordDto,
  InviteUserDto,
  LoginDto,
  RefreshTokenDto,
  TenantChangePasswordDto,
  TenantLoginDto,
  UpdateMeDto,
} from '../types/auth.api.types';
import {
  normalizeAuthLoginResponse,
  normalizeTokenPair,
  summarizeAuthPayloadKeys,
} from '../utils/normalizeAuthResponse';
import { normalizeActiveSessions, pickCurrentSessionId } from '../utils/normalizeSessions';
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
 * ERP Auth — Swagger tag "Auth"
 * https://kingfisherwings-backend.onrender.com/docs
 *
 * Hierarchy:
 *   SuperAdmin → Company → Tenant → Tenant Admin → Users (staff)
 *   - Tenant Admin: POST /auth/tenant-login (slug + password)
 *   - Users/staff:  POST /auth/login (slug + email + password)
 */
export const authService = {
  /** AuthController_login — Staff / employee users */
  async loginStaff(dto: LoginDto): Promise<AuthLoginResult> {
    // Match Swagger Try-it-out: only required fields + optional flags when set.
    // Extra cookies / long User-Agent device_name have caused API 500s that Swagger does not hit.
    const body: LoginDto = {
      tenant_slug: normalizeTenantSlugInput(dto.tenant_slug),
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    };
    if (dto.remember_me != null) body.remember_me = dto.remember_me;
    if (dto.device_name?.trim()) body.device_name = dto.device_name.trim().slice(0, 64);
    if (dto.mac_address?.trim()) body.mac_address = dto.mac_address.trim();

    const { data } = await axiosInstance.post<unknown>(AUTH_API.login, body, {
      withCredentials: false,
    });
    return requireLoginResult(data, '');
  },

  /** AuthController_tenantLogin — Tenant Admin (workspace owner) */
  async loginTenant(dto: TenantLoginDto): Promise<AuthLoginResult> {
    const body: TenantLoginDto = {
      tenant_slug: normalizeTenantSlugInput(dto.tenant_slug),
      password: dto.password,
    };
    if (dto.remember_me != null) body.remember_me = dto.remember_me;
    if (dto.device_name?.trim()) body.device_name = dto.device_name.trim().slice(0, 64);

    const { data } = await axiosInstance.post<unknown>(AUTH_API.tenantLogin, body, {
      withCredentials: false,
    });
    return requireLoginResult(data, 'TENANT_ADMIN');
  },

  /** Post-create check for tenant-login credentials only. */
  async verifyTenantCredentials(input: {
    tenant_slug: string;
    password: string;
  }): Promise<{ ok: true; via: 'tenant' } | { ok: false; message: string }> {
    try {
      await this.loginTenant({
        tenant_slug: input.tenant_slug,
        password: input.password,
        remember_me: false,
        device_name: 'post-create-verify',
      });
      return { ok: true, via: 'tenant' };
    } catch (err) {
      if (!isUnauthorized(err)) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Tenant login verify failed',
        };
      }
      return {
        ok: false,
        message: 'Tenant-login rejected these credentials (slug + password).',
      };
    }
  },

  /** Post-create check for staff /auth/login credentials. */
  async verifyStaffCredentials(input: {
    tenant_slug: string;
    email: string;
    password: string;
  }): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      await this.loginStaff({
        tenant_slug: input.tenant_slug,
        email: input.email,
        password: input.password,
        remember_me: false,
        device_name: 'post-create-verify',
      });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Staff login verify failed',
      };
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

  /**
   * PATCH /auth/me — used for preferred_country_code when the backend supports it.
   * Not documented under Auth OpenAPI; clients must tolerate 404/405.
   */
  async updateMe(dto: UpdateMeDto): Promise<AuthMeResponse> {
    const body: UpdateMeDto = {};
    if ('preferred_country_code' in dto) {
      const cc = String(dto.preferred_country_code ?? '').trim().toUpperCase();
      body.preferred_country_code = cc || null;
    }
    const { data } = await axiosInstance.patch<unknown>(AUTH_API.me, body);
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

  /**
   * Resolve the current device session id from GET /auth/sessions.
   * Prefer this over JWT `jti` — revoke expects the sessions-table id.
   */
  async resolveCurrentSessionId(): Promise<string> {
    const raw = await this.listSessions();
    return pickCurrentSessionId(normalizeActiveSessions(raw));
  },

  /** POST /auth/sessions/{sessionId}/revoke */
  async revokeSession(sessionId: string): Promise<void> {
    const id = sessionId.trim();
    if (!id) {
      throw new Error('Missing session id for revoke.');
    }
    // Do not encodeUUID path segments — axios path is already a full relative URL.
    await axiosInstance.post(AUTH_API.revokeSession(id));
  },

  /**
   * Revoke the current browser session.
   * 1) Resolve id from GET /auth/sessions
   * 2) POST /auth/sessions/{id}/revoke
   * 3) Fall back to POST /auth/logout (Swagger: "Revoke the current session")
   */
  async revokeCurrentSession(preferredSessionId?: string | null): Promise<void> {
    let sessionId = preferredSessionId?.trim() || '';

    try {
      const resolved = await this.resolveCurrentSessionId();
      if (resolved) sessionId = resolved;
    } catch {
      // Keep preferred / JWT session id if list fails.
    }

    if (sessionId) {
      try {
        await this.revokeSession(sessionId);
        return;
      } catch (error) {
        // Fall through to logout — expired/unauthorized tokens or unknown ids.
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status !== 404 && status !== 400 && status !== 401 && status !== 403) {
          throw error;
        }
      }
    }

    try {
      await this.logout();
    } catch {
      // Caller clears local auth regardless.
    }
  },

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    const body = {
      current_password: dto.current_password,
      new_password: dto.new_password,
      confirm_password: dto.confirm_password,
    };
    try {
      await axiosInstance.post(AUTH_API.changePassword, body);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        await axiosInstance.post(USER_API.meChangePassword, body);
        return;
      }
      throw error;
    }
  },

  /** AuthController_invite — Bearer; existing INVITED user */
  async inviteUser(dto: InviteUserDto): Promise<void> {
    const body: InviteUserDto = { user_id: dto.user_id.trim() };
    if (dto.email?.trim()) body.email = dto.email.trim().toLowerCase();
    await axiosInstance.post(AUTH_API.invite, body);
  },

  /** AuthController_acceptInvite — public */
  async acceptInvite(dto: AcceptInviteDto): Promise<void> {
    const body: AcceptInviteDto = {
      token: dto.token.trim(),
      password: dto.password,
    };
    if (dto.first_name?.trim()) body.first_name = dto.first_name.trim();
    if (dto.last_name?.trim()) body.last_name = dto.last_name.trim();
    await axiosInstance.post(AUTH_API.acceptInvite, body, { withCredentials: false });
  },

  /** AuthController_tenantChangePassword — Tenant Admin workspace password */
  async changeTenantPassword(dto: TenantChangePasswordDto): Promise<void> {
    await axiosInstance.post(AUTH_API.tenantChangePassword, {
      current_password: dto.current_password,
      new_password: dto.new_password,
      confirm_password: dto.confirm_password,
    });
  },
};
