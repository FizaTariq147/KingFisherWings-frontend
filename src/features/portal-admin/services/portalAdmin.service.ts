import { axiosInstance } from '@/lib/axios';
import { partyPortalService } from '@/features/parties/services/partyPortal.service';
import { PORTAL_ADMIN_API } from '../api/portalAdmin.api';
import type {
  CreatePartyPortalUserDto,
  CreatePartyPortalUserResult,
  AdminPortalUser,
  PortalPermissionEntry,
  ResetPortalPasswordDto,
  ResetPortalPasswordResult,
  TenantPortalUsersParams,
  UpsertPortalPermissionsDto,
} from '../types/portalAdmin.types';
import { normalizeAdminPortalUsers } from '../utils/normalizePortalAdmin';

/** Thin wrapper — party-scoped calls delegate to `partyPortalService`. */
export const portalAdminService = {
  async listTenantUsers(params: TenantPortalUsersParams = {}): Promise<AdminPortalUser[]> {
    const res = await axiosInstance.get(PORTAL_ADMIN_API.tenantUsers, { params });
    return normalizeAdminPortalUsers(res.data);
  },

  listPartyUsers: (partyId: string) => partyPortalService.listUsers(partyId) as Promise<AdminPortalUser[]>,

  createPartyUser: (partyId: string, dto: CreatePartyPortalUserDto) =>
    partyPortalService.createUser(partyId, dto) as Promise<CreatePartyPortalUserResult>,

  updatePartyUserStatus: (partyId: string, id: string, status: 'ACTIVE' | 'DISABLED') =>
    partyPortalService.updateUserStatus(partyId, id, status) as Promise<AdminPortalUser>,

  resetPartyUserPassword: (partyId: string, id: string, dto: ResetPortalPasswordDto = {}) =>
    partyPortalService.resetUserPassword(partyId, id, dto) as Promise<ResetPortalPasswordResult>,

  getPartyPermissions: (partyId: string) =>
    partyPortalService.getPermissions(partyId) as Promise<PortalPermissionEntry[]>,

  upsertPartyPermissions: (partyId: string, dto: UpsertPortalPermissionsDto) =>
    partyPortalService.upsertPermissions(partyId, dto) as Promise<PortalPermissionEntry[]>,

  resetPartyPermissions: (partyId: string) =>
    partyPortalService.resetPermissions(partyId) as Promise<PortalPermissionEntry[]>,
};
