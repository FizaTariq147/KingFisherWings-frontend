import {
  asRecord,
  pickBoolean,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  CreatePartyVendorUserResult,
  PartyVendorPermissionEntry,
  PartyVendorUser,
  ResetPartyVendorPasswordResult,
} from '../types/partyVendor.types';

export function normalizePartyVendorUser(raw: unknown): PartyVendorUser | null {
  const record = asRecord(unwrapData(raw)) ?? asRecord(raw);
  if (!record) return null;

  const party = asRecord(record.party);
  const id = pickString(record.id);
  const email = pickString(record.email);
  if (!id && !email) return null;

  const first = pickString(record.first_name, record.firstName);
  const last = pickString(record.last_name, record.lastName);
  const fullName =
    pickString(record.full_name, record.fullName, record.name, record.display_name) ||
    [first, last].filter(Boolean).join(' ') ||
    email ||
    'Vendor user';

  return {
    id: id || email,
    email,
    fullName,
    phone: pickString(record.phone, record.mobile) || undefined,
    status: pickString(record.status, record.user_status) || 'ACTIVE',
    partyId: pickString(record.party_id, record.partyId, party?.id) || undefined,
    partyName: pickString(record.party_name, record.partyName, party?.name) || undefined,
    createdAt: pickString(record.created_at, record.createdAt) || undefined,
    lastLoginAt: pickString(record.last_login_at, record.lastLoginAt) || undefined,
  };
}

export function normalizePartyVendorUsers(raw: unknown): PartyVendorUser[] {
  const { items } = unwrapList(raw, ['items', 'results', 'users', 'vendor_users', 'data']);
  return items.map(normalizePartyVendorUser).filter((u): u is PartyVendorUser => Boolean(u));
}

export function normalizeCreatePartyVendorUserResult(raw: unknown): CreatePartyVendorUserResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const user =
    normalizePartyVendorUser(data.user ?? data.vendor_user ?? data) ||
    ({
      id: pickString(data.id) || 'unknown',
      email: pickString(data.email),
      fullName: pickString(data.full_name, data.fullName) || 'Vendor user',
      status: pickString(data.status) || 'INVITED',
    } satisfies PartyVendorUser);

  return {
    user,
    temporaryPassword:
      pickString(
        data.temporary_password,
        data.temporaryPassword,
        data.temp_password,
        data.password,
        asRecord(data.credentials)?.password,
        asRecord(data.credentials)?.temporary_password,
      ) || undefined,
  };
}

export function normalizeResetPartyVendorPasswordResult(
  raw: unknown,
): ResetPartyVendorPasswordResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return {
    temporaryPassword:
      pickString(
        data.temporary_password,
        data.temporaryPassword,
        data.temp_password,
        data.password,
      ) || undefined,
    message: pickString(data.message) || undefined,
  };
}

export function normalizePartyVendorPermission(raw: unknown): PartyVendorPermissionEntry | null {
  const record = asRecord(raw);
  if (!record) return null;
  const documentType = pickString(record.document_type, record.documentType, record.type);
  if (!documentType) return null;
  return {
    documentType,
    canView: pickBoolean(record.can_view, record.canView) ?? true,
    canDownload: pickBoolean(record.can_download, record.canDownload) ?? false,
  };
}

export function normalizePartyVendorPermissions(raw: unknown): PartyVendorPermissionEntry[] {
  const data = unwrapData(raw);
  if (Array.isArray(data)) {
    return data
      .map(normalizePartyVendorPermission)
      .filter((p): p is PartyVendorPermissionEntry => Boolean(p));
  }
  const record = asRecord(data);
  const list =
    (Array.isArray(record?.permissions) && record.permissions) ||
    (Array.isArray(record?.items) && record.items) ||
    [];
  return list
    .map(normalizePartyVendorPermission)
    .filter((p): p is PartyVendorPermissionEntry => Boolean(p));
}
