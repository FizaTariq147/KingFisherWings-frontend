import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { partyKeys } from './useParties';
import { partyPortalService } from '../services/partyPortal.service';
import type {
  CreatePartyPortalUserDto,
  ResetPartyPortalPasswordDto,
  UpsertPartyPortalPermissionsDto,
} from '../types/partyPortal.types';

export const partyPortalKeys = {
  users: (partyId: string) => [...partyKeys.all, 'portal-users', partyId] as const,
  permissions: (partyId: string) => [...partyKeys.all, 'portal-permissions', partyId] as const,
};

export function usePartyPortalUsers(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyPortalKeys.users(partyId),
    queryFn: () => partyPortalService.listUsers(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}

export function usePartyPortalPermissions(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyPortalKeys.permissions(partyId),
    queryFn: () => partyPortalService.getPermissions(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}

export function useCreatePartyPortalUser(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePartyPortalUserDto) => partyPortalService.createUser(partyId, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partyPortalKeys.users(partyId) });
      void qc.invalidateQueries({ queryKey: partyKeys.detail(partyId) });
    },
  });
}

export function useUpdatePartyPortalUserStatus(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' | 'INVITED' }) =>
      partyPortalService.updateUserStatus(partyId, id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: partyPortalKeys.users(partyId) });
    },
  });
}

export function useResetPartyPortalPassword(partyId: string) {
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: ResetPartyPortalPasswordDto }) =>
      partyPortalService.resetUserPassword(partyId, id, dto ?? {}),
  });
}

export function useResendPartyPortalInvite(partyId: string) {
  return useMutation({
    mutationFn: (id: string) => partyPortalService.resendInvite(partyId, id),
  });
}

export function useUpsertPartyPortalPermissions(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertPartyPortalPermissionsDto) =>
      partyPortalService.upsertPermissions(partyId, dto),
    onSuccess: (data) => {
      qc.setQueryData(partyPortalKeys.permissions(partyId), data);
    },
  });
}

export function useResetPartyPortalPermissions(partyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => partyPortalService.resetPermissions(partyId),
    onSuccess: (data) => {
      qc.setQueryData(partyPortalKeys.permissions(partyId), data);
    },
  });
}
