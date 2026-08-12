import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { PARTY_API } from '../api/party.api';
import type {
  CreatePartyVendorUserDto,
  CreatePartyVendorUserResult,
  PartyVendorPermissionEntry,
  PartyVendorUser,
  ResetPartyVendorPasswordDto,
  ResetPartyVendorPasswordResult,
  UpsertPartyVendorPermissionsDto,
} from '../types/partyVendor.types';
import {
  normalizeCreatePartyVendorUserResult,
  normalizePartyVendorPermissions,
  normalizePartyVendorUser,
  normalizePartyVendorUsers,
  normalizeResetPartyVendorPasswordResult,
} from '../utils/normalizePartyVendor';

function bodyOf<T>(res: { data: unknown }): T {
  const raw = res.data;
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiEnvelope<T>).data;
  }
  return raw as T;
}

export const partyVendorService = {
  async listUsers(partyId: string): Promise<PartyVendorUser[]> {
    const res = await axiosInstance.get(PARTY_API.vendorUsers(partyId));
    return normalizePartyVendorUsers(res.data);
  },

  async createUser(
    partyId: string,
    dto: Omit<CreatePartyVendorUserDto, 'party_id'> & { party_id?: string },
  ): Promise<CreatePartyVendorUserResult> {
    const res = await axiosInstance.post(PARTY_API.vendorUsers(partyId), {
      party_id: dto.party_id || partyId,
      email: dto.email.trim().toLowerCase(),
      full_name: dto.full_name.trim(),
      phone: dto.phone?.trim() || undefined,
      password: dto.password?.trim() || undefined,
      send_email: dto.send_email,
      invite_mode: dto.invite_mode,
    });
    return normalizeCreatePartyVendorUserResult(bodyOf(res) ?? res.data);
  },

  async updateUserStatus(
    partyId: string,
    id: string,
    status: 'ACTIVE' | 'DISABLED' | 'INVITED',
  ): Promise<PartyVendorUser> {
    const res = await axiosInstance.patch(PARTY_API.vendorUserStatus(partyId, id), { status });
    const user = normalizePartyVendorUser(bodyOf(res) ?? res.data);
    if (!user) throw new Error('Status update succeeded but response was empty.');
    return user;
  },

  async resetUserPassword(
    partyId: string,
    id: string,
    dto: ResetPartyVendorPasswordDto = {},
  ): Promise<ResetPartyVendorPasswordResult> {
    const res = await axiosInstance.post(PARTY_API.vendorUserResetPassword(partyId, id), dto);
    return normalizeResetPartyVendorPasswordResult(bodyOf(res) ?? res.data);
  },

  async resendInvite(partyId: string, id: string): Promise<{ message?: string }> {
    const res = await axiosInstance.post(PARTY_API.vendorUserResendInvite(partyId, id));
    const raw = bodyOf<{ message?: string }>(res) ?? (res.data as { message?: string });
    return {
      message:
        raw && typeof raw === 'object' && 'message' in raw
          ? String((raw as { message?: string }).message || 'Invite resent.')
          : 'Invite resent.',
    };
  },

  async getPermissions(partyId: string): Promise<PartyVendorPermissionEntry[]> {
    const res = await axiosInstance.get(PARTY_API.vendorPermissions(partyId));
    return normalizePartyVendorPermissions(res.data);
  },

  async upsertPermissions(
    partyId: string,
    dto: UpsertPartyVendorPermissionsDto,
  ): Promise<PartyVendorPermissionEntry[]> {
    const res = await axiosInstance.put(PARTY_API.vendorPermissions(partyId), dto);
    return normalizePartyVendorPermissions(res.data);
  },
};
