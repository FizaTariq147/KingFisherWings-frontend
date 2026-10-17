import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { withGatewayRetry } from '@/lib/wakeApi';
import { openBlobInNewTab, triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { CRM_API } from '../api/crm.api';
import type { CreateEnquiryDto, Enquiry, EnquiryListParams, ListResult, UpdateEnquiryDto } from '../types/crm.types';
import { normalizeEnquiry, normalizeMany } from '../utils/normalizeCrm';
import { asRecord, formatAxiosError, normalizeMeta, queryParams, unwrapEntity, unwrapList } from '../utils/crmUnwrap';
import { enrichEnquiriesWithDisplayNames } from '@/features/customers/utils/resolveCustomerDisplayNames';
import { prepareCrmPayload } from '../utils/prepareCrmPayload';

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

function extractRelatedLabel(raw: unknown, ...keys: string[]): string | undefined {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return undefined;
  for (const key of keys) {
    const direct = data[key];
    if (typeof direct === 'string' && direct.trim()) return direct.trim();
    const nested = asRecord(direct);
    if (nested) {
      for (const nestedKey of [
        'quotation_number',
        'quotationNumber',
        'quote_no',
        'quoteNo',
        'shipment_number',
        'shipmentNumber',
        'shipment_no',
        'job_number',
        'jobNumber',
        'job_no',
        'number',
        'reference',
      ]) {
        const v = nested[nestedKey];
        if (typeof v === 'string' && v.trim()) return v.trim();
      }
    }
  }
  return undefined;
}

/** Flatten GET /crm/enquiries/:id/detail when API nests enquiry + actions/sections. */
function flattenEnquiryDetailPayload(raw: unknown): unknown {
  const entity = unwrapEntity(raw);
  const record = asRecord(entity);
  if (!record) return entity;

  const nestedEnquiry =
    asRecord(record.enquiry) ??
    asRecord(record.Enquiry) ??
    asRecord(record.sheet) ??
    asRecord(record.data);

  if (!nestedEnquiry) return entity;

  const actions =
    record.actions ??
    record.action_flags ??
    record.actionFlags ??
    nestedEnquiry.actions ??
    nestedEnquiry.action_flags;

  const quotation = asRecord(record.quotation) ?? asRecord(nestedEnquiry.quotation);
  const shipment = asRecord(record.shipment) ?? asRecord(nestedEnquiry.shipment);
  const job = asRecord(record.job) ?? asRecord(nestedEnquiry.job);

  return {
    ...nestedEnquiry,
    ...(actions ? { actions } : {}),
    quotation_id:
      nestedEnquiry.quotation_id ??
      nestedEnquiry.quotationId ??
      record.quotation_id ??
      record.quotationId ??
      quotation?.id,
    quotation_number:
      nestedEnquiry.quotation_number ??
      nestedEnquiry.quotationNumber ??
      nestedEnquiry.quote_no ??
      record.quotation_number ??
      quotation?.quotation_number ??
      quotation?.quote_no ??
      quotation?.number,
    shipment_id:
      nestedEnquiry.shipment_id ??
      nestedEnquiry.shipmentId ??
      record.shipment_id ??
      record.shipmentId ??
      shipment?.id,
    shipment_number:
      nestedEnquiry.shipment_number ??
      nestedEnquiry.shipmentNo ??
      record.shipment_number ??
      shipment?.shipment_number ??
      shipment?.number,
    job_id:
      nestedEnquiry.job_id ?? nestedEnquiry.jobId ?? record.job_id ?? record.jobId ?? job?.id,
    job_number:
      nestedEnquiry.job_number ??
      nestedEnquiry.jobNo ??
      record.job_number ??
      job?.job_number ??
      job?.number,
  };
}

export type EnquiryActionResult = Record<string, unknown> & {
  quotation_id?: string;
  quotation_number?: string;
  shipment_id?: string;
  shipment_number?: string;
  job_id?: string;
  job_number?: string;
  id?: string;
};

export type CancelEnquiryDto = {
  cancel_reason: string;
};

export const crmEnquiriesService = {
  async list(params: EnquiryListParams = {}): Promise<ListResult<Enquiry>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(CRM_API.enquiries, { params: queryParams(params) }),
      );
      const raw = unwrapList(res.data, ['enquiries']);
      const items = await enrichEnquiriesWithDisplayNames(
        normalizeMany(raw.items, normalizeEnquiry),
      );
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
      const item = normalizeEnquiry(flattenEnquiryDetailPayload(res.data));
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
      const entity = (asRecord(unwrapEntity(res.data)) as Record<string, unknown>) ?? {};
      const quotation_id =
        extractRelatedId(res.data, 'quotation_id', 'quotationId', 'quotation') ??
        extractRelatedId(entity, 'quotation_id', 'quotationId', 'quotation');
      const quotation_number =
        extractRelatedLabel(res.data, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo', 'quotation') ??
        extractRelatedLabel(entity, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo', 'quotation');
      return {
        ...entity,
        ...(quotation_id ? { quotation_id } : {}),
        ...(quotation_number ? { quotation_number } : {}),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateQuotation(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryGenerateQuotation(id)),
      );
      const entity = (asRecord(unwrapEntity(res.data)) as Record<string, unknown>) ?? {};
      const quotation_id =
        extractRelatedId(res.data, 'quotation_id', 'quotationId', 'quotation') ??
        extractRelatedId(entity, 'quotation_id', 'quotationId', 'quotation');
      const quotation_number =
        extractRelatedLabel(res.data, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo', 'quotation') ??
        extractRelatedLabel(entity, 'quotation_number', 'quotationNumber', 'quote_no', 'quoteNo', 'quotation');
      return {
        ...entity,
        ...(quotation_id ? { quotation_id } : {}),
        ...(quotation_number ? { quotation_number } : {}),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateShipment(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryGenerateShipment(id)),
      );
      const entity = (asRecord(unwrapEntity(res.data)) as Record<string, unknown>) ?? {};
      const shipment_id =
        extractRelatedId(res.data, 'shipment_id', 'shipmentId', 'shipment') ??
        extractRelatedId(entity, 'shipment_id', 'shipmentId', 'shipment');
      const shipment_number =
        extractRelatedLabel(res.data, 'shipment_number', 'shipmentNumber', 'shipment_no', 'shipmentNo', 'shipment') ??
        extractRelatedLabel(entity, 'shipment_number', 'shipmentNumber', 'shipment_no', 'shipmentNo', 'shipment');
      return {
        ...entity,
        ...(shipment_id ? { shipment_id } : {}),
        ...(shipment_number ? { shipment_number } : {}),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async generateJob(id: string): Promise<EnquiryActionResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryGenerateJob(id)),
      );
      const entity = (asRecord(unwrapEntity(res.data)) as Record<string, unknown>) ?? {};
      const job_id =
        extractRelatedId(res.data, 'job_id', 'jobId', 'job') ??
        extractRelatedId(entity, 'job_id', 'jobId', 'job');
      const job_number =
        extractRelatedLabel(res.data, 'job_number', 'jobNumber', 'job_no', 'jobNo', 'job') ??
        extractRelatedLabel(entity, 'job_number', 'jobNumber', 'job_no', 'jobNo', 'job');
      return {
        ...entity,
        ...(job_id ? { job_id } : {}),
        ...(job_number ? { job_number } : {}),
      };
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

  /** OpenAPI CancelEnquiryDto — `cancel_reason` required. */
  async cancel(id: string, dto: CancelEnquiryDto): Promise<Enquiry> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(CRM_API.enquiryCancel(id), {
          cancel_reason: dto.cancel_reason.trim(),
        }),
      );
      const item = normalizeEnquiry(unwrapEntity(res.data));
      if (!item) return this.get(id);
      return item;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * OpenAPI GET /crm/enquiries/:id/pdf — PDF or report data pack.
   * Opens PDF in a new tab when binary; falls back to print for JSON packs.
   */
  async openReport(id: string, enquiryNumber?: string): Promise<void> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(CRM_API.enquiryPdf(id), {
          responseType: 'blob',
          headers: { Accept: 'application/pdf, application/json, */*' },
        }),
      );
      const blob = res.data as Blob;
      const contentType = String(res.headers['content-type'] ?? blob.type ?? '');
      const filename = `enquiry-${enquiryNumber || id.slice(0, 8)}.pdf`;

      if (contentType.includes('application/pdf') || (await blobLooksLikePdf(blob))) {
        await openBlobInNewTab(blob, null, { filename });
        return;
      }

      const text = await blob.text();
      try {
        const json = JSON.parse(text) as unknown;
        const record = asRecord(json) ?? asRecord(asRecord(json)?.data);
        const b64 =
          (typeof record?.pdf_base64 === 'string' && record.pdf_base64) ||
          (typeof record?.pdfBase64 === 'string' && record.pdfBase64) ||
          (typeof record?.content === 'string' && record.content) ||
          '';
        if (b64) {
          const cleaned = b64.replace(/^data:application\/pdf;base64,/, '');
          const binary = atob(cleaned);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
          const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
          await openBlobInNewTab(pdfBlob, null, { filename });
          return;
        }
        // JSON data pack — open printable view
        const w = window.open('', '_blank', 'noopener,noreferrer');
        if (!w) {
          triggerBlobDownload(new Blob([text], { type: 'application/json' }), filename.replace(/\.pdf$/, '.json'));
          return;
        }
        w.document.title = filename.replace(/\.pdf$/, '');
        w.document.body.replaceChildren();
        const pre = w.document.createElement('pre');
        pre.style.cssText = 'font:12px/1.4 ui-monospace,monospace;padding:16px;white-space:pre-wrap';
        pre.textContent = JSON.stringify(json, null, 2);
        w.document.body.append(pre);
        w.focus();
        w.print();
        return;
      } catch {
        triggerBlobDownload(blob, filename.replace(/\.pdf$/, '.bin'));
      }
    } catch (error) {
      // Alias endpoint if /pdf fails
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405) {
        try {
          const res = await withGatewayRetry(() =>
            axiosInstance.get(CRM_API.enquiryReport(id), {
              responseType: 'blob',
              headers: { Accept: 'application/pdf, application/json, */*' },
            }),
          );
          const blob = res.data as Blob;
          if (await blobLooksLikePdf(blob)) {
            await openBlobInNewTab(blob, null, {
              filename: `enquiry-${enquiryNumber || id.slice(0, 8)}.pdf`,
            });
            return;
          }
        } catch (aliasError) {
          throw formatAxiosError(aliasError);
        }
      }
      throw formatAxiosError(error);
    }
  },

  /** GET /crm/enquiries/reports/open — NEW / QUOTED open enquiries. */
  async fetchOpenEnquiriesReport(params?: Record<string, string | number>): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(CRM_API.enquiriesReportOpen, { params }),
      );
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
