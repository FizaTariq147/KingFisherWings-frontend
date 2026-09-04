export const USER_API = {
  list: '/users',
  byId: (id: string) => `/users/${id}`,
  status: (id: string) => `/users/${id}/status`,
  restore: (id: string) => `/users/${id}/restore`,
  bulk: '/users/bulk',
  adminResetPassword: (id: string) => `/users/${id}/admin-reset-password`,
  forceLogout: (id: string) => `/users/${id}/force-logout`,
  /** UsersController_changeOwnPassword — same DTO as POST /auth/change-password */
  meChangePassword: '/users/me/change-password',
  /** Tenant Admin permission catalog (modules → submodules → see/read/write). */
  permissionMatrix: '/users/permission-matrix',
  userPermissionMatrix: (id: string) => `/users/${id}/permission-matrix`,
  /** Legacy flat permissions (fallback). */
  permissions: (id: string) => `/users/${id}/permissions`,
} as const;

/** Optional role catalog — GET /roles, PUT /roles/:id/permissions. */
export const ROLE_API = {
  list: '/roles',
  permissions: (id: string) => `/roles/${id}/permissions`,
} as const;

export const USER_API_TAGS = {
  list: (tenantId: string) => ({ type: 'Users' as const, id: `LIST-${tenantId}` }),
  detail: (id: string) => ({ type: 'User' as const, id }),
};
