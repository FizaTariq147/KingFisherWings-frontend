// ── Permission keys — must match backend JWT payload exactly ──────────────
export type PermissionKey =
  | 'menu_dashboard'
  | 'menu_customers'
  | 'menu_quotations'
  | 'menu_jobs_air_export'
  | 'menu_jobs_sea_export'
  | 'menu_jobs_sea_import'
  | 'menu_documentation'
  | 'menu_finance'
  | 'menu_nvocc'
  | 'menu_hr'
  | 'menu_masters'
  | 'menu_reports'
  | 'menu_settings'

export interface Permission {
  key: PermissionKey
  label: string
}

export interface Role {
  id: string
  name: string
  slug: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  tenantId: string
  role: Role
  permissions: PermissionKey[]
  product: 'KingFisher Tech Gold' | 'KingFisher Tech Global' | 'KingFisher Tech App' | 'KingFisher Tech Analytics'
}

// Decoded JWT payload shape from NestJS backend
export interface JWTPayload {
  sub: string
  email: string
  name: string
  tenantId: string
  roleId: string
  roleName: string
  roleSlug: string
  permissions: PermissionKey[]
  product: AuthUser['product']
  iat: number
  exp: number
}