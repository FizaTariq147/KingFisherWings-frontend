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
  changePassword: '/auth/change-password',
  tenantChangePassword: '/auth/tenant/change-password',
} as const;
