export interface PortalLoginDto {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface PortalAcceptInviteDto {
  token: string;
  password: string;
  full_name?: string;
}

export interface PortalPartySummary {
  id: string;
  name: string;
  code?: string;
  [key: string]: unknown;
}

export interface PortalUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  status?: string;
  party?: PortalPartySummary | null;
  tenantSlug?: string;
  tenantId?: string;
  /** Forwarder / tenant display name from /me or login payload */
  tenantName?: string;
  /**
   * True when the customer must set their own password
   * (temporary password / first login — POST /portal/auth/change-password).
   */
  mustChangePassword?: boolean;
  /** Party KYC — from login/me (NOT_STARTED | PENDING_REVIEW | APPROVED | REJECTED). */
  verificationStatus?: string;
  /** True when party verification blocks portal use (≠ APPROVED). */
  verificationBlocking?: boolean;
  /** True only when party verification is APPROVED (can_use_portal). */
  canUsePortal?: boolean;
}

export interface PortalChangePasswordDto {
  current_password: string;
  new_password: string;
}

/** POST /portal/auth/forgot-password — emails a temporary password. */
export interface PortalForgotPasswordDto {
  tenant_slug: string;
  email: string;
}

export interface PortalLoginResult {
  user: PortalUser;
  accessToken: string;
  refreshToken: string;
}
