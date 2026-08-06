import type { PortalDocumentType } from '../api/portalAdmin.api';

export type PortalUserStatus = 'ACTIVE' | 'DISABLED' | string;

export interface AdminPortalUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  status: PortalUserStatus;
  partyId?: string;
  partyName?: string;
  companyId?: string;
  createdAt?: string;
  lastLoginAt?: string;
  raw?: Record<string, unknown>;
}

export interface CreatePartyPortalUserDto {
  email: string;
  full_name: string;
  phone?: string;
  password?: string;
  send_email?: boolean;
}

export interface CreatePartyPortalUserResult {
  user: AdminPortalUser;
  temporaryPassword?: string;
}

export interface ResetPortalPasswordDto {
  password?: string;
  send_email?: boolean;
}

export interface ResetPortalPasswordResult {
  temporaryPassword?: string;
  message?: string;
}

export interface PortalPermissionEntry {
  documentType: PortalDocumentType | string;
  canView: boolean;
  canDownload: boolean;
}

export interface UpsertPortalPermissionsDto {
  permissions: Array<{
    document_type: string;
    can_view: boolean;
    can_download: boolean;
  }>;
}

export interface TenantPortalUsersParams {
  party_id?: string;
  company_id?: string;
}
