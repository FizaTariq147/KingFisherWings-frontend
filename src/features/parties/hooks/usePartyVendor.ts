import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { partyKeys } from './useParties';
import { partyVendorService } from '../services/partyVendor.service';
import type {
  CreatePartyVendorUserDto,
  ResetPartyVendorPasswordDto,
  UpsertPartyVendorPermissionsDto,
} from '../types/partyVendor.types';

export const partyVendorKeys = {
  users: (partyId: string) => [...partyKeys.all, 'vendor-users', partyId] as const,
  permissions: (partyId: string) => [...partyKeys.all, 'vendor-permissions', partyId] as const,
  tenantUsers: (partyId?: string) => ['vendor-users', 'tenant', partyId || 'all'] as const,
};

export function usePartyVendorUsers(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyVendorKeys.users(partyId),
    queryFn: () => partyVendorService.listUsers(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}

export function usePartyVendorPermissions(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyVendorKeys.permissions(partyId),
    queryFn: () => partyVendorService.getPermissions(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}

export function useCreatePartyVendorUser(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: Omit<CreatePartyVendorUserDto, 'party_id'> & { party_id?: string }) =>
      partyVendorService.createUser(partyId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partyVendorKeys.users(partyId) });
      void qc.invalidateQueries({ queryKey: partyKeys.detail(partyId) });
      void qc.invalidateQueries({ queryKey: ['vendor-users'] });
    },
  });
}

export function useUpdatePartyVendorUserStatus(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' | 'INVITED' }) =>
      partyVendorService.updateUserStatus(partyId, id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partyVendorKeys.users(partyId) });
      void qc.invalidateQueries({ queryKey: ['vendor-users'] });
    },
  });
}

export function useResetPartyVendorPassword(partyId: string) {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: ResetPartyVendorPasswordDto }) =>
      partyVendorService.resetUserPassword(partyId, id, dto ?? {}),
  });
}

export function useResendPartyVendorInvite(partyId: string) {
  return useMutation({
    mutationFn: (id: string) => partyVendorService.resendInvite(partyId, id),
  });
}

export function useUpsertPartyVendorPermissions(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertPartyVendorPermissionsDto) =>
      partyVendorService.upsertPermissions(partyId, dto),
    onSuccess: (data) => {
      qc.setQueryData(partyVendorKeys.permissions(partyId), data);
    },
  });
}
