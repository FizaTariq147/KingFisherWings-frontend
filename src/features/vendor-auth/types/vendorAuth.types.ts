export interface VendorParty {
  id: string;
  name: string;
  code?: string;
}

export interface VendorUser {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  tenantSlug?: string;
  tenantName?: string;
  party?: VendorParty;
  status?: string;
  /**
   * True when the vendor must set their own password
   * (temporary password / first login — POST /vendor/auth/change-password).
   */
  mustChangePassword?: boolean;
}

export interface VendorChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface VendorLoginDto {
  tenant_slug: string;
  email: string;
  password: string;
}

export interface VendorAcceptInviteDto {
  token: string;
  password: string;
  full_name?: string;
}

export interface VendorLoginResult {
  accessToken: string;
  refreshToken: string;
  user: VendorUser;
}
