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
  | 'menu_accounts'
  | 'menu_nvocc'
  | 'menu_hr'
  | 'menu_masters'
  | 'menu_reports'
  | 'menu_settings'
  // GL action permissions (backend Guards)
  | 'gl.manage_coa'
  | 'gl.view_coa'
  | 'gl.manage_vouchers'
  | 'gl.view_vouchers'
  | 'gl.manage_payments'
  | 'gl.view_payments'
  | 'gl.manage_cheques'
  | 'gl.view_cheques'
  | 'gl.manage_bank_recon'
  | 'gl.view_reports'
  | 'gl.view_mis'
  | (string & {})

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
  companyId?: string
  role: Role
  permissions: PermissionKey[]
  product: 'KingFisher Tech Gold' | 'KingFisher Tech Global' | 'KingFisher Tech App' | 'KingFisher Tech Analytics'
  /** Staff with a temporary password must set their own before using the app. */
  mustChangePassword?: boolean
}

// Decoded JWT payload shape from NestJS backend
export interface JWTPayload {
  sub: string
  email: string
  name: string
  tenantId: string
  companyId?: string
  roleId: string
  roleName: string
  roleSlug: string
  permissions: PermissionKey[]
  product: AuthUser['product']
  iat: number
  exp: number
}