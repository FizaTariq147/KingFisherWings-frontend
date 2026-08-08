import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import { filenameFromContentDisposition } from '@/features/portal-shared/normalize';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { PORTAL_QUOTATIONS_API } from '../api/portalQuotations.api';
import type {
  PortalQuotationDetail,
  PortalQuotationListParams,
  PortalQuotationListResult,
  PortalQuotationRequestDto,
  PortalQuotationSummary,
} from '../types/portalQuotations.types';
import {
  normalizeQuotationDetail,
  normalizeQuotationList,
  normalizeQuotationSummary,
} from '../utils/normalizePortalQuotations';

export const portalQuotationsService = {
  async summary(): Promise<PortalQuotationSummary> {
    const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.summary);
    return normalizeQuotationSummary(res.data);
  },

  async list(params: PortalQuotationListParams = {}): Promise<PortalQuotationListResult> {
    const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.list, { params });
    return normalizeQuotationList(res.data, params);
  },

  async getById(id: string): Promise<PortalQuotationDetail> {
    const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.detail(id));
    const detail = normalizeQuotationDetail(res.data);
    if (!detail) throw new Error('Quotation not found.');
    return detail;
  },

  async request(dto: PortalQuotationRequestDto): Promise<PortalQuotationDetail> {
    const res = await portalApiClient.post(PORTAL_QUOTATIONS_API.request, dto);
    const detail = normalizeQuotationDetail(res.data);
    if (detail) return detail;
    // 201 with empty/minimal body — still treat as success for navigation.
    return {
      id: 'new',
      number: 'Submitted',
      status: 'SUBMITTED',
      jobType: dto.job_type,
      currencyCode: dto.currency_code,
    };
  },

  async downloadPdf(id: string, fallbackName = 'quotation.pdf'): Promise<void> {
    try {
      const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.pdf(id), {
        responseType: 'blob',
      });
      const blob = res.data as Blob;
      const headerType =
        typeof res.headers?.['content-type'] === 'string' ? res.headers['content-type'] : '';

      // Success path can still return a JSON error blob if the gateway mishandles status.
      if (blob instanceof Blob && /json/i.test(headerType || blob.type) && blob.size < 4096) {
        const text = await blob.text();
        try {
          const parsed = JSON.parse(text) as { message?: string | string[] };
          const message = Array.isArray(parsed.message)
            ? parsed.message.map(String).join('; ')
            : parsed.message;
          throw new PortalApiError(
            message || 'Quotation PDF is not available yet.',
            404,
          );
        } catch (err) {
          if (err instanceof PortalApiError) throw err;
        }
      }

      const filename =
        filenameFromContentDisposition(
          typeof res.headers['content-disposition'] === 'string'
            ? res.headers['content-disposition']
            : undefined,
        ) || fallbackName;
      triggerBlobDownload(blob, filename);
    } catch (err) {
      if (err instanceof PortalApiError) {
        if (err.status === 404 || err.status === 500 || err.status >= 500) {
          const raw = err.message.trim().toLowerCase();
          const generic =
            !raw ||
            raw.includes('status code') ||
            raw === 'internal server error' ||
            raw === 'internal server error.' ||
            raw.includes('something went wrong');
          throw new PortalApiError(
            generic
              ? 'PDF is not ready for this quotation yet. Your forwarder needs to generate it first (ERP: Quotations → PDF).'
              : err.message,
            err.status,
          );
        }
        throw err;
      }
      throw err;
    }
  },
};
