import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { CreateFollowUpDto, FollowUp, FollowUpListParams, ListResult, PatchFollowUpDto } from '../types/crm.types';
import { normalizeFollowUp, normalizeMany } from '../utils/normalizeCrm';
import { formatAxiosError, normalizeMeta, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export const crmFollowUpsService = {
  async list(params: FollowUpListParams = {}): Promise<ListResult<FollowUp>> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.followUps, { params: queryParams(params) })); const raw = unwrapList(res.data, ['follow_ups', 'followUps']); const items = normalizeMany(raw.items, normalizeFollowUp); return { items, meta: normalizeMeta(raw.meta, items.length, params) }; }
    catch (error) { throw formatAxiosError(error); }
  },
  async create(dto: CreateFollowUpDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.followUps, prepareCrmPayload(dto))); const item = normalizeFollowUp(unwrapEntity(res.data)); if (!item) throw new Error('Follow-up was created but not returned.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async update(id: string, dto: PatchFollowUpDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.patch(CRM_API.followUp(id), prepareCrmPayload(dto))); return normalizeFollowUp(unwrapEntity(res.data)); }
    catch (error) { throw formatAxiosError(error); }
  },
  async calendar(from?: string, to?: string): Promise<FollowUp[]> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.followUpCalendar, { params: queryParams({ from, to }) })); return normalizeMany(unwrapList(res.data, ['follow_ups', 'events']).items, normalizeFollowUp); }
    catch (error) { throw formatAxiosError(error); }
  },
};
