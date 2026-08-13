import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { crmCallLogsService } from '../services/crmCallLogs.service';
import type { CallLogListParams, CreateCallLogDto } from '../types/crm.types';
const keys = { all: ['tenant', 'crm', 'call-logs'] as const, list: (p: CallLogListParams) => ['tenant', 'crm', 'call-logs', p] as const, daily: (d?: string, s?: string) => ['tenant', 'crm', 'call-logs', 'daily', d, s] as const };
export const useCrmCallLogs = (params: CallLogListParams) => { const t = useAuthStore(s => s.accessToken); return useQuery({ queryKey: keys.list(params), queryFn: () => crmCallLogsService.list(params), enabled: Boolean(t), placeholderData: keepPreviousData }); };
export const useCrmDailyCallLogs = (date?: string, salespersonId?: string, enabled = true) => { const t = useAuthStore(s => s.accessToken); return useQuery({ queryKey: keys.daily(date, salespersonId), queryFn: () => crmCallLogsService.daily(date, salespersonId), enabled: Boolean(t && enabled && date && salespersonId) }); };
export const useCreateCrmCallLog = () => { const c = useQueryClient(); return useMutation({ mutationFn: (dto: CreateCallLogDto) => crmCallLogsService.create(dto), onSuccess: () => c.invalidateQueries({ queryKey: keys.all }) }); };
