import type { PartyPortalDocumentType } from '../api/party.api';

export type PartyPortalUserStatus = 'ACTIVE' | 'DISABLED' | 'INVITED' | string;

export interface PartyPortalUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  status: PartyPortalUserStatus;
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
  invite_mode?: boolean;
}

export interface CreatePartyPortalUserResult {
  user: PartyPortalUser;
  temporaryPassword?: string;
}

export interface ResetPartyPortalPasswordDto {
  password?: string;
  send_email?: boolean;
}

export interface ResetPartyPortalPasswordResult {
  temporaryPassword?: string;
  message?: string;
}

export interface PartyPortalPermissionEntry {
  documentType: PartyPortalDocumentType | string;
  canView: boolean;
  canDownload: boolean;
}

export interface UpsertPartyPortalPermissionsDto {
  permissions: Array<{
    document_type: string;
    can_view: boolean;
    can_download: boolean;
  }>;
}
