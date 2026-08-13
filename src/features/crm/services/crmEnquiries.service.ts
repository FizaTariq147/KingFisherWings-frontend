import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { CreateEnquiryDto, Enquiry, EnquiryListParams, ListResult, UpdateEnquiryDto } from '../types/crm.types';
import { normalizeEnquiry, normalizeMany } from '../utils/normalizeCrm';
import { formatAxiosError, normalizeMeta, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

export const crmEnquiriesService = {
  async list(params: EnquiryListParams = {}): Promise<ListResult<Enquiry>> {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.enquiries, { params: queryParams(params) })); const raw = unwrapList(res.data, ['enquiries']); const items = normalizeMany(raw.items, normalizeEnquiry); return { items, meta: normalizeMeta(raw.meta, items.length, params) }; }
    catch (error) { throw formatAxiosError(error); }
  },
  async get(id: string) {
    try { const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.enquiry(id))); const item = normalizeEnquiry(unwrapEntity(res.data)); if (!item) throw new Error('Enquiry not found.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async create(dto: CreateEnquiryDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.enquiries, prepareCrmPayload(dto))); const item = normalizeEnquiry(unwrapEntity(res.data)); if (!item) throw new Error('Enquiry was created but not returned.'); return item; }
    catch (error) { throw formatAxiosError(error); }
  },
  async update(id: string, dto: UpdateEnquiryDto) {
    try { const res = await withGatewayRetry(() => axiosInstance.patch(CRM_API.enquiry(id), prepareCrmPayload(dto))); return normalizeEnquiry(unwrapEntity(res.data)) ?? this.get(id); }
    catch (error) { throw formatAxiosError(error); }
  },
  async convert(id: string): Promise<Record<string, unknown>> {
    try { const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.enquiryConvert(id))); return (unwrapEntity(res.data) as Record<string, unknown>) ?? {}; }
    catch (error) { throw formatAxiosError(error); }
  },
};
