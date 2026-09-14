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
  | 'menu_vendors'
  | 'menu_accounts'
  | 'menu_nvocc'
  | 'menu_hr'
  | 'menu_warehouse'
  | 'menu_masters'
  | 'menu_reports'
  | 'menu_settings'
  | 'menu_management'
  | 'menu_sales'
  // NVOCC action permissions (backend Guards)
  | 'nvocc.read'
  | 'nvocc.manage'
  // Documentation action permissions (backend Guards)
  | 'documentation.read'
  | 'documentation.manage'
  | 'documentation.edi.read'
  | 'documentation.edi.submit'
  | 'documentation.upload'
  | 'documentation.mpci'
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
  // Customer portal admin (Parties → )
  | 'portal.manage_users'
  | 'portal.manage_permissions'
  | 'quotations.service_catalog.manage'
  | 'quotations.negotiate'
  | 'invoices.review_payment_proofs'
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
  /**
   * Assigned / default warehouse from GET /auth/me when the API provides it
   * (warehouse_id, default_warehouse_id, etc.). Used to auto-fill WMS forms.
   */
  warehouseId?: string
  /** Nested warehouse row from GET /auth/me when the API embeds code/name. */
  assignedWarehouse?: {
    id: string
    code?: string
    name?: string
  }
  /** Optional scoped warehouse list from GET /auth/me for warehouse staff. */
  allowedWarehouses?: Array<{
    id: string
    code?: string
    name?: string
  }>
  role: Role
  permissions: PermissionKey[]
  product: 'KingFisher Tech Gold' | 'KingFisher Tech Global' | 'KingFisher Tech App' | 'KingFisher Tech Analytics'
  /** Staff with a temporary password must set their own before using the app. */
  mustChangePassword?: boolean
  /**
   * Optional effective matrix summary from GET /auth/me (access per module/submodule).
   * Bridged classic codes still live in `permissions` after re-login.
   */
  permissionMatrix?: Array<{
    module: string
    submodule: string
    access: 'none' | 'read' | 'write'
  }>
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