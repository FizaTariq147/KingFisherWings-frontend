/**
 * Backend logo upload paths (multipart field name: `file`).
 * See docs/BACKEND_BRAND_LOGO.md for contract.
 */
export const BRAND_LOGO_API = {
  /** Tenant-admin / staff org branding */
  organizationLogo: '/organization/logo',
  /** Super-admin tenant branding */
  tenantLogo: (tenantId: string) => `/tenants/${encodeURIComponent(tenantId)}/logo`,
} as const;
