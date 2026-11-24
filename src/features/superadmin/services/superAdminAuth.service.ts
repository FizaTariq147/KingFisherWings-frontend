import { superAdminApiClient, type ApiEnvelope } from '../../../lib/superAdminApiClient';
import { AUTH_API } from '../../auth/api/auth.api';
import { normalizeAuthLoginResponse, normalizeTokenPair } from '../../auth/utils/normalizeAuthResponse';
import type { SuperAdminSignupDto } from '../../auth/types/auth.api.types';
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

/** Password step succeeded — tokens are issued only after verify-otp. */
export interface SuperAdminOtpChallenge {
  requires_otp: true;
  challenge_id: string;
  expires_in?: number;
  message?: string;
}

export type SuperAdminLoginResult = SuperAdminLoginResponse | SuperAdminOtpChallenge;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapPayload(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function coerceOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
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

function parseOtpChallenge(payload: unknown): SuperAdminOtpChallenge | null {
  const root = asRecord(payload) ?? {};
  const nested = asRecord(root.data) ?? root;
  const requiresOtp =
    nested.requires_otp === true ||
    nested.requiresOtp === true ||
    root.requires_otp === true ||
    root.requiresOtp === true;
  const challengeId = pickString(
    nested.challenge_id,
    nested.challengeId,
    root.challenge_id,
    root.challengeId,
  );
  if (!requiresOtp && !challengeId) return null;
  if (!challengeId) return null;
  return {
    requires_otp: true,
    challenge_id: challengeId,
    expires_in: coerceOptionalNumber(
      nested.expires_in ?? nested.expiresIn ?? root.expires_in ?? root.expiresIn,
    ),
    message: pickString(nested.message, root.message) || undefined,
  };
}

function parseLoginTokens(payload: unknown): SuperAdminLoginResponse {
  const normalized = normalizeAuthLoginResponse(payload, 'SUPER_ADMIN');
  if (!normalized) {
    throw new Error('Login succeeded but the server response was incomplete.');
  }
  return {
    user: toSuperAdminUser(normalized.user),
    access_token: normalized.accessToken,
    refresh_token: normalized.refreshToken,
  };
}

export function isSuperAdminOtpChallenge(
  value: SuperAdminLoginResult,
): value is SuperAdminOtpChallenge {
  return (value as SuperAdminOtpChallenge).requires_otp === true;
}

export const superAdminAuthService = {
  /**
   * POST /auth/super-admin/login — password step.
   * New BE returns OTP challenge (no tokens). Legacy may still return tokens.
   */
  async login(dto: SuperAdminLoginDto): Promise<SuperAdminLoginResult> {
    const res = await superAdminApiClient.post<unknown>(AUTH_API.superAdminLogin, dto);
    const payload = unwrapPayload(res.data);

    const challenge = parseOtpChallenge(payload) ?? parseOtpChallenge(res.data);
    if (challenge) return challenge;

    return parseLoginTokens(payload);
  },

  /** POST /auth/super-admin/login/verify-otp — issue SA JWTs. */
  async verifyOtp(dto: {
    challenge_id: string;
    otp: string;
  }): Promise<SuperAdminLoginResponse> {
    const res = await superAdminApiClient.post<unknown>(AUTH_API.superAdminVerifyOtp, {
      challenge_id: dto.challenge_id,
      otp: dto.otp.trim(),
    });
    return parseLoginTokens(unwrapPayload(res.data));
  },

  /** POST /auth/super-admin/login/resend-otp — rate-limited. */
  async resendOtp(challengeId: string): Promise<{ expires_in?: number; message?: string }> {
    const res = await superAdminApiClient.post<unknown>(AUTH_API.superAdminResendOtp, {
      challenge_id: challengeId,
    });
    const payload = asRecord(unwrapPayload(res.data)) ?? asRecord(res.data) ?? {};
    return {
      expires_in: coerceOptionalNumber(payload.expires_in ?? payload.expiresIn),
      message: pickString(payload.message) || undefined,
    };
  },

  /** POST /auth/super-admin/signup — never auto-issues tokens; sign in with OTP next. */
  async signup(dto: SuperAdminSignupDto): Promise<void> {
    await superAdminApiClient.post(AUTH_API.superAdminSignup, {
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      first_name: dto.first_name.trim(),
      last_name: dto.last_name.trim(),
    });
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
