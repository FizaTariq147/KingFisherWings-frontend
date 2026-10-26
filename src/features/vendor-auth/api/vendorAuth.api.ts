export const VENDOR_AUTH_API = {
  login: '/vendor/auth/login',
  acceptInvite: '/vendor/auth/accept-invite',
  refresh: '/vendor/auth/refresh',
  logout: '/vendor/auth/logout',
  me: '/vendor/auth/me',
  /** Mirror of POST /portal/auth/change-password — required after temporary password login. */
  changePassword: '/vendor/auth/change-password',
  /** Emails a temporary password; user must change it after sign-in. */
  forgotPassword: '/vendor/auth/forgot-password',
} as const;

export const VENDOR_CHANGE_PASSWORD_PATH = '/vendor/change-password';
