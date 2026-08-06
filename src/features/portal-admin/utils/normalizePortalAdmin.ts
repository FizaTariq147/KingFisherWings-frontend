import {
  asRecord,
  pickBoolean,
  pickString,
  unwrapData,
  unwrapList,
} from '@/features/portal-shared/normalize';
import type {
  AdminPortalUser,
  CreatePartyPortalUserResult,
  PortalPermissionEntry,
  ResetPortalPasswordResult,
} from '../types/portalAdmin.types';

export function normalizeAdminPortalUser(raw: unknown): AdminPortalUser | null {
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
    'Portal user';

  return {
    id: id || email,
    email,
    fullName,
    phone: pickString(record.phone, record.mobile) || undefined,
    status: pickString(record.status, record.user_status) || 'ACTIVE',
    partyId: pickString(record.party_id, record.partyId, party?.id) || undefined,
    partyName: pickString(record.party_name, record.partyName, party?.name) || undefined,
    companyId: pickString(record.company_id, record.companyId) || undefined,
    createdAt: pickString(record.created_at, record.createdAt) || undefined,
    lastLoginAt: pickString(record.last_login_at, record.lastLoginAt) || undefined,
    raw: record,
  };
}

export function normalizeAdminPortalUsers(raw: unknown): AdminPortalUser[] {
  const { items } = unwrapList(raw, ['items', 'results', 'users', 'portal_users', 'data']);
  return items.map(normalizeAdminPortalUser).filter((u): u is AdminPortalUser => Boolean(u));
}

export function normalizeCreatePortalUserResult(raw: unknown): CreatePartyPortalUserResult {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const user =
    normalizeAdminPortalUser(data.user ?? data.portal_user ?? data) ||
    ({
      id: pickString(data.id) || 'unknown',
      email: pickString(data.email),
      fullName: pickString(data.full_name, data.fullName) || 'Portal user',
      status: pickString(data.status) || 'ACTIVE',
    } satisfies AdminPortalUser);

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

export function normalizeResetPasswordResult(raw: unknown): ResetPortalPasswordResult {
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

export function normalizePortalPermission(raw: unknown): PortalPermissionEntry | null {
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

export function normalizePortalPermissions(raw: unknown): PortalPermissionEntry[] {
  const data = unwrapData(raw);
  if (Array.isArray(data)) {
    return data.map(normalizePortalPermission).filter((p): p is PortalPermissionEntry => Boolean(p));
  }
  const record = asRecord(data);
  const list =
    (Array.isArray(record?.permissions) && record.permissions) ||
    (Array.isArray(record?.items) && record.items) ||
    [];
  return list.map(normalizePortalPermission).filter((p): p is PortalPermissionEntry => Boolean(p));
}
