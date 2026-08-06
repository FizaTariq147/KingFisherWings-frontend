import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { PARTY_API } from '../api/party.api';
import type {
  CreatePartyPortalUserDto,
  CreatePartyPortalUserResult,
  PartyPortalPermissionEntry,
  PartyPortalUser,
  ResetPartyPortalPasswordDto,
  ResetPartyPortalPasswordResult,
  UpsertPartyPortalPermissionsDto,
} from '../types/partyPortal.types';
import {
  normalizeCreatePartyPortalUserResult,
  normalizePartyPortalPermissions,
  normalizePartyPortalUser,
  normalizePartyPortalUsers,
  normalizeResetPartyPortalPasswordResult,
} from '../utils/normalizePartyPortal';

function bodyOf<T>(res: { data: unknown }): T {
  const raw = res.data;
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiEnvelope<T>).data;
  }
  return raw as T;
}

/** Parties portal-user + document-rights APIs (docs#/Parties). */
export const partyPortalService = {
  async listUsers(partyId: string): Promise<PartyPortalUser[]> {
    const res = await axiosInstance.get(PARTY_API.portalUsers(partyId));
    return normalizePartyPortalUsers(res.data);
  },

  async createUser(
    partyId: string,
    dto: CreatePartyPortalUserDto,
  ): Promise<CreatePartyPortalUserResult> {
    const res = await axiosInstance.post(PARTY_API.portalUsers(partyId), dto);
    return normalizeCreatePartyPortalUserResult(bodyOf(res) ?? res.data);
  },

  async updateUserStatus(
    partyId: string,
    id: string,
    status: 'ACTIVE' | 'DISABLED',
  ): Promise<PartyPortalUser> {
    const res = await axiosInstance.patch(PARTY_API.portalUserStatus(partyId, id), { status });
    const user = normalizePartyPortalUser(bodyOf(res) ?? res.data);
    if (!user) throw new Error('Status update succeeded but response was empty.');
    return user;
  },

  async resetUserPassword(
    partyId: string,
    id: string,
    dto: ResetPartyPortalPasswordDto = {},
  ): Promise<ResetPartyPortalPasswordResult> {
    const res = await axiosInstance.post(PARTY_API.portalUserResetPassword(partyId, id), dto);
    return normalizeResetPartyPortalPasswordResult(bodyOf(res) ?? res.data);
  },

  async getPermissions(partyId: string): Promise<PartyPortalPermissionEntry[]> {
    const res = await axiosInstance.get(PARTY_API.portalPermissions(partyId));
    return normalizePartyPortalPermissions(res.data);
  },

  async upsertPermissions(
    partyId: string,
    dto: UpsertPartyPortalPermissionsDto,
  ): Promise<PartyPortalPermissionEntry[]> {
    const res = await axiosInstance.put(PARTY_API.portalPermissions(partyId), dto);
    return normalizePartyPortalPermissions(res.data);
  },

  async resetPermissions(partyId: string): Promise<PartyPortalPermissionEntry[]> {
    const res = await axiosInstance.post(PARTY_API.portalPermissionsReset(partyId));
    return normalizePartyPortalPermissions(res.data);
  },
};
