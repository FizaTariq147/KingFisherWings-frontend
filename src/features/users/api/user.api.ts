export const USER_API = {
  list: '/users',
  byId: (id: string) => `/users/${id}`,
  status: (id: string) => `/users/${id}/status`,
  restore: (id: string) => `/users/${id}/restore`,
  bulk: '/users/bulk',
  adminResetPassword: (id: string) => `/users/${id}/admin-reset-password`,
  forceLogout: (id: string) => `/users/${id}/force-logout`,
} as const;

export const USER_API_TAGS = {
  list: (tenantId: string) => ({ type: 'Users' as const, id: `LIST-${tenantId}` }),
  detail: (id: string) => ({ type: 'User' as const, id }),
};
