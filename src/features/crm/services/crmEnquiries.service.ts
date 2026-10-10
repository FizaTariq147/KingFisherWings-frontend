import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { CRM_API } from '../api/crm.api';
import type { CreateEnquiryDto, Enquiry, EnquiryListParams, ListResult, UpdateEnquiryDto } from '../types/crm.types';
import { normalizeEnquiry, normalizeMany } from '../utils/normalizeCrm';
import { formatAxiosError, normalizeMeta, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Dig a related entity id out of generate-* / convert responses. */
function extractRelatedId(raw: unknown, ...keys: string[]): string | undefined {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return undefined;
  for (const key of keys) {
    const direct = data[key];
    if (typeof direct === 'string' && isUuid(direct)) return direct;
    const nested = asRecord(direct);
    if (nested) {
      const id = nested.id;
      if (typeof id === 'string' && isUuid(id)) return id;
    }
  }
  const topId = data.id;
  if (typeof topId === 'string' && isUuid(topId)) return topId;
  return undefined;
}

export type EnquiryActionResult = Record<string, unknown> & {
  quotation_id?: string;
  shipment_id?: string;
  job_id?: string;
  id?: string;
};

export const crmEnquiriesService = {
  async list(params: EnquiryListParams = {}): Promise<ListResult<Enquiry>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(CRM_API.enquiries, { params: queryParams(params) }),
      );
      const raw = unwrapList(res.data, ['enquiries']);
      const items = normalizeMany(raw.items, normalizeEnquiry);
      return { items, meta: normalizeMeta(raw.meta, items.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async get(id: string) {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.enquiry(id)));
      const item = normalizeEnquiry(unwrapEntity(res.data));
      if (!item) throw new Error('Enquiry not found.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** Prefer enriched detail when available; fall back to GET /:id. */
  async getDetail(id: string) {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(CRM_API.enquiryDetail(id)));
      const item = normalizeEnquiry(unwrapEntity(res.data));
      if (!item) throw new Error('Enquiry not found.');
      return item;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405) return this.get(id);
      throw formatAxiosError(error);
    }
  },

  async create(dto: CreateEnquiryDto) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiries, prepareCrmPayload(dto)),
      );
      const item = normalizeEnquiry(unwrapEntity(res.data));
      if (!item) throw new Error('Enquiry was created but not returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateEnquiryDto) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(CRM_API.enquiry(id), prepareCrmPayload(dto)),
      );
      return normalizeEnquiry(unwrapEntity(res.data)) ?? this.get(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async convert(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.enquiryConvert(id)));
      const entity = (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
      const quotation_id =
        extractRelatedId(res.data, 'quotation_id', 'quotationId', 'quotation') ??
        extractRelatedId(entity, 'quotation_id', 'quotationId', 'quotation');
      return { ...entity, ...(quotation_id ? { quotation_id } : {}) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateQuotation(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryGenerateQuotation(id)),
      );
      const entity = (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
      const quotation_id =
        extractRelatedId(res.data, 'quotation_id', 'quotationId', 'quotation') ??
        extractRelatedId(entity, 'quotation_id', 'quotationId', 'quotation');
      return { ...entity, ...(quotation_id ? { quotation_id } : {}) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateShipment(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryGenerateShipment(id)),
      );
      const entity = (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
      const shipment_id =
        extractRelatedId(res.data, 'shipment_id', 'shipmentId', 'shipment') ??
        extractRelatedId(entity, 'shipment_id', 'shipmentId', 'shipment');
      return { ...entity, ...(shipment_id ? { shipment_id } : {}) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateJob(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryGenerateJob(id)),
      );
      const entity = (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
      const job_id =
        extractRelatedId(res.data, 'job_id', 'jobId', 'job') ??
        extractRelatedId(entity, 'job_id', 'jobId', 'job');
      return { ...entity, ...(job_id ? { job_id } : {}) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async copy(id: string): Promise<Enquiry> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.enquiryCopy(id)));
      const item = normalizeEnquiry(unwrapEntity(res.data));
      if (!item) throw new Error('Enquiry was copied but not returned.');
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async cancel(id: string): Promise<Enquiry> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.post(CRM_API.enquiryCancel(id)));
      const item = normalizeEnquiry(unwrapEntity(res.data));
      if (!item) return this.get(id);
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
