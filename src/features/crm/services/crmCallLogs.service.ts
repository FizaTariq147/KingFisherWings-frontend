import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { CallLog, CallLogListParams, CreateCallLogDto, ListResult } from '../types/crm.types';
import { normalizeCallLog, normalizeMany } from '../utils/normalizeCrm';
import { formatAxiosError, normalizeMeta, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export const crmCallLogsService = {
  async list(params: CallLogListParams = {}): Promise<ListResult<CallLog>> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.callLogs, { params: queryParams(params) })); const raw = unwrapList(res.data, ['call_logs', 'callLogs']); const items = normalizeMany(raw.items, normalizeCallLog); return { items, meta: normalizeMeta(raw.meta, items.length, params) }; }
    catch (error) { throw formatAxiosError(error); }
  },
  async create(dto: CreateCallLogDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.callLogs, prepareCrmPayload(dto))); const item = normalizeCallLog(unwrapEntity(res.data)); if (!item) throw new Error('Call log was created but not returned.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async daily(date?: string, salesperson_id?: string): Promise<CallLog[]> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.dailyCallLogs, { params: queryParams({ date, salesperson_id }) })); return normalizeMany(unwrapList(res.data, ['call_logs', 'callLogs']).items, normalizeCallLog); }
    catch (error) { throw formatAxiosError(error); }
  },
};
