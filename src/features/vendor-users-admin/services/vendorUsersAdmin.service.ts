import { axiosInstance } from '@/lib/axios';
import {
  normalizePartyVendorUsers,
} from '@/features/parties/utils/normalizePartyVendor';
import type { PartyVendorUser } from '@/features/parties/types/partyVendor.types';
import { VENDOR_USERS_ADMIN_API } from '../api/vendorUsersAdmin.api';

export const vendorUsersAdminService = {
  async list(partyId?: string): Promise<PartyVendorUser[]> {
    const res = await axiosInstance.get(VENDOR_USERS_ADMIN_API.list, {
      params: partyId ? { party_id: partyId } : undefined,
      withCredentials: false,
    });
    return normalizePartyVendorUsers(res.data);
  },
};
