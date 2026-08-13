import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmFollowUpsService } from '../services/crmFollowUps.service';
import type { CreateFollowUpDto, FollowUpListParams, PatchFollowUpDto } from '../types/crm.types';

const keys = {
  all: ['tenant', 'crm', 'follow-ups'] as const,
  list: (p: FollowUpListParams) => ['tenant', 'crm', 'follow-ups', p] as const,
  calendar: (from?: string, to?: string) => ['tenant', 'crm', 'follow-ups', 'calendar', from, to] as const,
};

export const useCrmFollowUps = (params: FollowUpListParams) => {
  const t = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => crmFollowUpsService.list(params),
    enabled: Boolean(t),
    placeholderData: keepPreviousData,
  });
};

export const useCrmFollowUpCalendar = (from?: string, to?: string, enabled = true) => {
  const t = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: keys.calendar(from, to),
    queryFn: () => crmFollowUpsService.calendar(from, to),
    enabled: Boolean(t && enabled && from && to),
  });
};

export const useCreateCrmFollowUp = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFollowUpDto) => crmFollowUpsService.create(dto),
    onSuccess: () => c.invalidateQueries({ queryKey: keys.all }),
  });
};

export const usePatchCrmFollowUp = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: PatchFollowUpDto }) =>
      crmFollowUpsService.update(id, dto),
    onSuccess: () => c.invalidateQueries({ queryKey: keys.all }),
  });
};
