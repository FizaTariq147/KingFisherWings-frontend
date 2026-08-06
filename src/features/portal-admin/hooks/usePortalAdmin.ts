import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { portalAdminService } from '../services/portalAdmin.service';
import type {
  CreatePartyPortalUserDto,
  ResetPortalPasswordDto,
  TenantPortalUsersParams,
  UpsertPortalPermissionsDto,
} from '../types/portalAdmin.types';

export const portalAdminKeys = {
  all: ['tenant', 'portal-admin'] as const,
  tenantUsers: (params: TenantPortalUsersParams) =>
    [...portalAdminKeys.all, 'tenant-users', params] as const,
  partyUsers: (partyId: string) => [...portalAdminKeys.all, 'party-users', partyId] as const,
  partyPermissions: (partyId: string) =>
    [...portalAdminKeys.all, 'party-permissions', partyId] as const,
};

export function useTenantPortalUsers(params: TenantPortalUsersParams = {}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: portalAdminKeys.tenantUsers(params),
    queryFn: () => portalAdminService.listTenantUsers(params),
    enabled: Boolean(accessToken),
  });
}

export function usePartyPortalUsers(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: portalAdminKeys.partyUsers(partyId),
    queryFn: () => portalAdminService.listPartyUsers(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}

export function usePartyPortalPermissions(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: portalAdminKeys.partyPermissions(partyId),
    queryFn: () => portalAdminService.getPartyPermissions(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}

export function useCreatePartyPortalUser(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePartyPortalUserDto) =>
      portalAdminService.createPartyUser(partyId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: portalAdminKeys.partyUsers(partyId) });
      void qc.invalidateQueries({ queryKey: portalAdminKeys.all });
    },
  });
}

export function useUpdatePartyPortalUserStatus(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) =>
      portalAdminService.updatePartyUserStatus(partyId, id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: portalAdminKeys.partyUsers(partyId) });
    },
  });
}

export function useResetPartyPortalPassword(partyId: string) {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: ResetPortalPasswordDto }) =>
      portalAdminService.resetPartyUserPassword(partyId, id, dto ?? {}),
  });
}

export function useUpsertPartyPortalPermissions(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertPortalPermissionsDto) =>
      portalAdminService.upsertPartyPermissions(partyId, dto),
    onSuccess: (data) => {
      qc.setQueryData(portalAdminKeys.partyPermissions(partyId), data);
    },
  });
}

export function useResetPartyPortalPermissions(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => portalAdminService.resetPartyPermissions(partyId),
    onSuccess: (data) => {
      qc.setQueryData(portalAdminKeys.partyPermissions(partyId), data);
    },
  });
}
