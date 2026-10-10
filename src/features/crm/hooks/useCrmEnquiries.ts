import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmEnquiriesService } from '../services/crmEnquiries.service';
import type { CreateEnquiryDto, EnquiryListParams, UpdateEnquiryDto } from '../types/crm.types';

const keys = {
  all: ['tenant', 'crm', 'enquiries'] as const,
  list: (p: EnquiryListParams) => ['tenant', 'crm', 'enquiries', p] as const,
  detail: (id: string) => ['tenant', 'crm', 'enquiries', id] as const,
};

export const crmEnquiryKeys = keys;

export const useCrmEnquiries = (params: EnquiryListParams) => {
  const t = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: keys.list(params),
    queryFn: () => crmEnquiriesService.list(params),
    enabled: Boolean(t),
    placeholderData: keepPreviousData,
  });
};

export const useCrmEnquiry = (id: string) => {
  const t = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => crmEnquiriesService.getDetail(id),
    enabled: Boolean(t && id),
  });
};

const invalidate = (c: ReturnType<typeof useQueryClient>) => () =>
  c.invalidateQueries({ queryKey: keys.all });

export const useCreateCrmEnquiry = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEnquiryDto) => crmEnquiriesService.create(dto),
    onSuccess: invalidate(c),
  });
};

export const useUpdateCrmEnquiry = (id: string) => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateEnquiryDto) => crmEnquiriesService.update(id, dto),
    onSuccess: invalidate(c),
  });
};

export const useConvertCrmEnquiry = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmEnquiriesService.convert(id),
    onSuccess: invalidate(c),
  });
};

export const useGenerateCrmEnquiryQuotation = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmEnquiriesService.generateQuotation(id),
    onSuccess: invalidate(c),
  });
};

export const useGenerateCrmEnquiryShipment = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmEnquiriesService.generateShipment(id),
    onSuccess: invalidate(c),
  });
};

export const useGenerateCrmEnquiryJob = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmEnquiriesService.generateJob(id),
    onSuccess: invalidate(c),
  });
};

export const useCopyCrmEnquiry = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmEnquiriesService.copy(id),
    onSuccess: invalidate(c),
  });
};

export const useCancelCrmEnquiry = () => {
  const c = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => crmEnquiriesService.cancel(id),
    onSuccess: invalidate(c),
  });
};
