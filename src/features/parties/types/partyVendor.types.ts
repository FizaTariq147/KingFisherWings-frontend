import type { PartyVendorDocumentType } from '../api/party.api';

export type PartyVendorUserStatus = 'ACTIVE' | 'DISABLED' | 'INVITED' | string;

export interface PartyVendorUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  status: PartyVendorUserStatus;
  partyId?: string;
  partyName?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface CreatePartyVendorUserDto {
  party_id: string;
  email: string;
  full_name: string;
  phone?: string;
  password?: string;
  send_email?: boolean;
  invite_mode?: boolean;
}

export interface CreatePartyVendorUserResult {
  user: PartyVendorUser;
  temporaryPassword?: string;
}

export interface ResetPartyVendorPasswordDto {
  password?: string;
  send_email?: boolean;
}

export interface ResetPartyVendorPasswordResult {
  temporaryPassword?: string;
  message?: string;
}

export interface PartyVendorPermissionEntry {
  documentType: PartyVendorDocumentType | string;
  canView: boolean;
  canDownload: boolean;
}

export interface UpsertPartyVendorPermissionsDto {
  permissions: Array<{
    document_type: string;
    can_view: boolean;
    can_download: boolean;
  }>;
}
