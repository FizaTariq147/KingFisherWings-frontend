import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { CreateLeadDto, Lead, LeadListParams, ListResult, UpdateLeadDto } from '../types/crm.types';
import { normalizeLead, normalizeMany } from '../utils/normalizeCrm';
import { formatAxiosError, normalizeMeta, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export const crmLeadsService = {
  async list(params: LeadListParams = {}): Promise<ListResult<Lead>> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.leads, { params: queryParams(params) }));
      const raw = unwrapList(res.data, ['leads']); const items = normalizeMany(raw.items, normalizeLead);
      return { items, meta: normalizeMeta(raw.meta, items.length, params) };
    } catch (error) { throw formatAxiosError(error); }
  },
  async get(id: string) {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.lead(id))); const item = normalizeLead(unwrapEntity(res.data)); if (!item) throw new Error('Lead not found.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async create(dto: CreateLeadDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.leads, prepareCrmPayload(dto))); const item = normalizeLead(unwrapEntity(res.data)); if (!item) throw new Error('Lead was created but not returned.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async update(id: string, dto: UpdateLeadDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.patch(CRM_API.lead(id), prepareCrmPayload(dto))); return normalizeLead(unwrapEntity(res.data)) ?? this.get(id); }
    catch (error) { throw formatAxiosError(error); }
  },
  async remove(id: string) { try { await withGatewayRetry(() => axiosInstance.delete(CRM_API.lead(id))); } catch (error) { throw formatAxiosError(error); } },
  async convert(id: string, party_code?: string): Promise<Record<string, unknown>> {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.leadConvert(id), prepareCrmPayload({ party_code }))); return (unwrapEntity(res.data) as Record<string, unknown>) ?? {}; }
    catch (error) { throw formatAxiosError(error); }
  },
  async importCsv(file: File) {
    try { const form = new FormData(); form.append('file', file); const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.leadImport, form)); return unwrapEntity(res.data); }
    catch (error) { throw formatAxiosError(error); }
  },
  async pipeline(assigned_salesperson_id?: string) {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.leadPipeline, { params: queryParams({ assigned_salesperson_id }) })); return unwrapEntity(res.data); }
    catch (error) { throw formatAxiosError(error); }
  },
};
