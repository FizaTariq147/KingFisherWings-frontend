export const PORTAL_AUTH_API = {
  login: '/portal/auth/login',
  refresh: '/portal/auth/refresh',
  logout: '/portal/auth/logout',
  me: '/portal/auth/me',
  acceptInvite: '/portal/auth/accept-invite',
  changePassword: '/portal/auth/change-password',
} as const;

export const PORTAL_CHANGE_PASSWORD_PATH = '/portal/change-password';
