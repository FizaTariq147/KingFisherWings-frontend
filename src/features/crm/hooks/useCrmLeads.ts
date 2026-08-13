import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmLeadsService } from '../services/crmLeads.service';
import type { CreateLeadDto, LeadListParams, UpdateLeadDto } from '../types/crm.types';

export const crmLeadKeys = {
  all: ['tenant', 'crm', 'leads'] as const,
  list: (p: LeadListParams) => ['tenant', 'crm', 'leads', 'list', p] as const,
  detail: (id: string) => ['tenant', 'crm', 'leads', id] as const,
  pipeline: (salespersonId?: string) => ['tenant', 'crm', 'leads', 'pipeline', salespersonId] as const,
};
export const useCrmLeads = (params: LeadListParams) => { const token = useAuthStore(s => s.accessToken); return useQuery({ queryKey: crmLeadKeys.list(params), queryFn: () => crmLeadsService.list(params), enabled: Boolean(token), placeholderData: keepPreviousData }); };
export const useCrmLead = (id: string) => { const token = useAuthStore(s => s.accessToken); return useQuery({ queryKey: crmLeadKeys.detail(id), queryFn: () => crmLeadsService.get(id), enabled: Boolean(token && id) }); };
export const useCrmLeadPipeline = (assigned_salesperson_id?: string, enabled = true) => {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: crmLeadKeys.pipeline(assigned_salesperson_id),
    queryFn: () => crmLeadsService.pipeline(assigned_salesperson_id),
    enabled: Boolean(token && enabled && assigned_salesperson_id),
  });
};
const invalidate = (client: ReturnType<typeof useQueryClient>) => () => client.invalidateQueries({ queryKey: crmLeadKeys.all });
export const useCreateCrmLead = () => { const c = useQueryClient(); return useMutation({ mutationFn: (dto: CreateLeadDto) => crmLeadsService.create(dto), onSuccess: invalidate(c) }); };
export const useUpdateCrmLead = (id: string) => { const c = useQueryClient(); return useMutation({ mutationFn: (dto: UpdateLeadDto) => crmLeadsService.update(id, dto), onSuccess: invalidate(c) }); };
export const useDeleteCrmLead = () => { const c = useQueryClient(); return useMutation({ mutationFn: (id: string) => crmLeadsService.remove(id), onSuccess: invalidate(c) }); };
export const useConvertCrmLead = () => { const c = useQueryClient(); return useMutation({ mutationFn: ({ id, party_code }: { id: string; party_code?: string }) => crmLeadsService.convert(id, party_code), onSuccess: invalidate(c) }); };
export const useImportCrmLeads = () => { const c = useQueryClient(); return useMutation({ mutationFn: (file: File) => crmLeadsService.importCsv(file), onSuccess: invalidate(c) }); };
