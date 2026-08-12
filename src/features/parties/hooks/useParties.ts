import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { partyService } from '../services/party.service';
import type {
  CreatePartyAddressDto,
  CreatePartyContactDto,
  CreatePartyDto,
  PartyListParams,
  UpdateCreditStatusDto,
  UpdatePartyAddressDto,
  UpdatePartyContactDto,
  UpdatePartyDto,
} from '../types/party.types';

export const partyKeys = {
  all: ['tenant', 'parties'] as const,
  list: (params: PartyListParams) => [...partyKeys.all, 'list', params] as const,
  detail: (id: string) => [...partyKeys.all, 'detail', id] as const,
  history: (id: string) => [...partyKeys.all, 'history', id] as const,
};

export function useParties(params: PartyListParams) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyKeys.list(params),
    queryFn: () => partyService.list(params),
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useParty(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyKeys.detail(id),
    queryFn: () => partyService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

function useInvalidateParties() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: partyKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(detailId) });
    }
  };
}

export function useCreateParty() {
  const invalidate = useInvalidateParties();
  return useMutation({
    mutationFn: (dto: CreatePartyDto) => partyService.create(dto),
    onSuccess: (party) => invalidate(party.id),
  });
}

export function useUpdateParty(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePartyDto) => partyService.update(id, dto),
    onSuccess: (party) => {
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
      queryClient.setQueryData(partyKeys.detail(id), party);
    },
  });
}

export function useDeleteParty() {
  const invalidate = useInvalidateParties();
  return useMutation({
    mutationFn: (id: string) => partyService.softDelete(id),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useSetPartyActive() {
  const invalidate = useInvalidateParties();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      partyService.setActive(id, is_active),
    onSuccess: (_data, { id }) => invalidate(id),
  });
}

export function useUpdatePartyCreditStatus() {
  const invalidate = useInvalidateParties();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCreditStatusDto }) =>
      partyService.updateCreditStatus(id, dto),
    onSuccess: (_data, { id }) => invalidate(id),
  });
}

export function usePartyContactMutations(partyId: string) {
  const invalidate = useInvalidateParties();
  const add = useMutation({
    mutationFn: (dto: CreatePartyContactDto) => partyService.addContact(partyId, dto),
    onSuccess: () => invalidate(partyId),
  });
  const update = useMutation({
    mutationFn: ({ contactId, dto }: { contactId: string; dto: UpdatePartyContactDto }) =>
      partyService.updateContact(partyId, contactId, dto),
    onSuccess: () => invalidate(partyId),
  });
  const remove = useMutation({
    mutationFn: (contactId: string) => partyService.removeContact(partyId, contactId),
    onSuccess: () => invalidate(partyId),
  });
  return { add, update, remove };
}

export function usePartyAddressMutations(partyId: string) {
  const invalidate = useInvalidateParties();
  const add = useMutation({
    mutationFn: (dto: CreatePartyAddressDto) => partyService.addAddress(partyId, dto),
    onSuccess: () => invalidate(partyId),
  });
  const update = useMutation({
    mutationFn: ({ addressId, dto }: { addressId: string; dto: UpdatePartyAddressDto }) =>
      partyService.updateAddress(partyId, addressId, dto),
    onSuccess: () => invalidate(partyId),
  });
  const remove = useMutation({
    mutationFn: (addressId: string) => partyService.removeAddress(partyId, addressId),
    onSuccess: () => invalidate(partyId),
  });
  return { add, update, remove };
}

export function useImportParties() {
  const invalidate = useInvalidateParties();
  return useMutation({
    mutationFn: (file: File) => partyService.importCsv(file),
    onSuccess: () => invalidate(),
  });
}

export function useExportPartiesCsv() {
  return useMutation({
    mutationFn: (params: PartyListParams) => partyService.exportCsv(params),
  });
}

export function usePartyHistory(partyId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: partyKeys.history(partyId),
    queryFn: () => partyService.getHistory(partyId),
    enabled: Boolean(accessToken) && isUuid(partyId),
  });
}
