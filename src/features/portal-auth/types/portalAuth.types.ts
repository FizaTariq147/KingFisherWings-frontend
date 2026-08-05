export interface PortalLoginDto {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface PortalPartySummary {
  id: string;
  name: string;
  code?: string;
  [key: string]: unknown;
}

export interface PortalUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  status?: string;
  party?: PortalPartySummary | null;
  tenantSlug?: string;
  tenantId?: string;
  /** Forwarder / tenant display name from /me or login payload */
  tenantName?: string;
}

export interface PortalLoginResult {
  user: PortalUser;
  accessToken: string;
  refreshToken: string;
}
