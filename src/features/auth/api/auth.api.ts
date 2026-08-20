/** Auth module REST paths — Swagger tag "Auth" (no /api prefix). */
export const AUTH_API = {
  login: '/auth/login',
  tenantLogin: '/auth/tenant-login',
  superAdminLogin: '/auth/super-admin/login',
  superAdminSignup: '/auth/super-admin/signup',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  logoutAll: '/auth/logout-all',
  me: '/auth/me',
  sessions: '/auth/sessions',
  revokeSession: (sessionId: string) => `/auth/sessions/${sessionId}/revoke`,
  /** AuthController_setup2fa — Generate TOTP secret + QR for the current user */
  twoFactorSetup: '/auth/2fa/setup',
  /** AuthController_enable2fa — Enable 2FA after verifying a TOTP code */
  twoFactorEnable: '/auth/2fa/enable',
  /** AuthController_disable2fa — Disable 2FA (password + optional TOTP/backup) */
  twoFactorDisable: '/auth/2fa/disable',
  changePassword: '/auth/change-password',
  tenantChangePassword: '/auth/tenant/change-password',
  /** AuthController_invite — send accept-invite email for an INVITED user */
  invite: '/auth/invite',
  /** AuthController_acceptInvite — public; set password from invite token */
  acceptInvite: '/auth/accept-invite',
} as const;
