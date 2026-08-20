/** Swagger Auth DTOs — https://kingfisherwings-backend.onrender.com/docs (tag: Auth) */

/** POST /auth/login — Staff login: tenant slug + email + password */
export interface LoginDto {
  tenant_slug: string;
  email: string;
  password: string;
  remember_me?: boolean;
  device_name?: string;
  /** Optional when MAC allow-list is configured. */
  mac_address?: string;
  /** TOTP code when two-factor authentication is enabled. */
  totp_code?: string;
  /** One-time backup code as alternative to TOTP. */
  backup_code?: string;
}

/** POST /auth/tenant-login — Tenant admin: tenant slug + tenant password (no email) */
export interface TenantLoginDto {
  tenant_slug: string;
  password: string;
  remember_me?: boolean;
  device_name?: string;
  /** TOTP code when two-factor authentication is enabled on the tenant admin account. */
  totp_code?: string;
  /** One-time backup code as alternative to TOTP. */
  backup_code?: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface TenantChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SuperAdminLoginDto {
  email: string;
  password: string;
}

export interface SuperAdminSignupDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/** Normalized token pair after login/refresh. */
export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  /** Present when API/JWT includes a session id for revoke. */
  sessionId?: string;
}

/** Minimal user snapshot returned with login (before /auth/me). */
export interface AuthLoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  companyId?: string;
  /** True when API requires changing the temporary password after first login. */
  mustChangePassword?: boolean;
  /** True when TOTP 2FA is enrolled for this principal. */
  twoFactorEnabled?: boolean;
}

export interface AuthLoginResult extends AuthTokenPair {
  user: AuthLoginUser;
}

/** Principal from GET /auth/me — fields may be camelCase or snake_case. */
export interface AuthMeResponse {
  id?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  tenant_id?: string;
  companyId?: string;
  company_id?: string;
  role?: string | { id?: string; name?: string; slug?: string };
  permissions?: string[];
  product?: string;
  preferred_country_code?: string | null;
  preferredCountryCode?: string | null;
  [key: string]: unknown;
}

export interface UpdateMeDto {
  preferred_country_code?: string | null;
}

/** POST /auth/2fa/enable — TotpVerifyDto */
export interface TotpVerifyDto {
  code: string;
}

/** POST /auth/2fa/disable — DisableTwoFactorDto */
export interface DisableTwoFactorDto {
  password: string;
  /** TOTP or backup code if 2FA is already on. */
  code?: string;
}

/** POST /auth/2fa/setup — response fields vary; all optional. */
export interface TwoFactorSetupResult {
  secret?: string;
  qrCodeDataUrl?: string;
  otpauthUrl?: string;
  backupCodes?: string[];
}

/** POST /auth/invite — InviteUserDto */
export interface InviteUserDto {
  user_id: string;
  email?: string;
}

/** POST /auth/accept-invite — AcceptInviteDto */
export interface AcceptInviteDto {
  token: string;
  password: string;
  first_name?: string;
  last_name?: string;
}
