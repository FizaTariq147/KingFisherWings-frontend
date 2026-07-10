/** Swagger Auth DTOs and response shapes (kingfisherwings OpenAPI). */

export interface LoginDto {
  tenant_slug: string;
  email: string;
  password: string;
  remember_me?: boolean;
  device_name?: string;
}

export interface TenantLoginDto {
  /** Maps to AuthController_tenantLogin.tenant_slug */
  tenant_slug: string;
  /** Maps to AuthController_tenantLogin.password (set on Create Tenant) */
  password: string;
  remember_me?: boolean;
  device_name?: string;
  /**
   * Not part of TenantLoginDto in Swagger.
   * When set, frontend falls back to POST /auth/login after tenant-login 401
   * (provisioned TENANT_ADMIN owner user from Create Tenant).
   */
  email?: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface TenantChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SuperAdminLoginDto {
  email: string;
  password: string;
}

export interface SuperAdminSignupDto {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/** Normalized token pair after login/refresh. */
export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

/** Minimal user snapshot returned with login (before /auth/me). */
export interface AuthLoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  companyId?: string;
}

export interface AuthLoginResult extends AuthTokenPair {
  user: AuthLoginUser;
}

/** Principal from GET /auth/me — fields may be camelCase or snake_case. */
export interface AuthMeResponse {
  id?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  tenant_id?: string;
  companyId?: string;
  company_id?: string;
  role?: string | { id?: string; name?: string; slug?: string };
  permissions?: string[];
  product?: string;
  [key: string]: unknown;
}
