import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { quotationPdfBranding } from '@/features/files/utils/pdfBranding';
import { downloadPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { PORTAL_QUOTATIONS_API } from '../api/portalQuotations.api';
import type {
  PortalQuotationDetail,
  PortalQuotationListParams,
  PortalQuotationListResult,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
  PortalQuotationEstimateDto,
  PortalQuotationCounterOfferDto,
  PortalQuotationEstimateResult,
  PortalServiceCatalogItem,
  PortalQuotationSummary,
} from '../types/portalQuotations.types';
import {
  normalizeQuotationDetail,
  normalizeQuotationList,
  normalizeQuotationSummary,
} from '../utils/normalizePortalQuotations';
import {
  normalizePortalEstimate,
  normalizePortalServiceCatalog,
  filterPortalServiceCatalogByJobType,
} from '../utils/normalizePortalQuotationExtended';
import { applyPortalCustomerDecisionStatus } from '../utils/portalQuotationStatus';
import { rememberCustomerQuoteDecision } from '@/features/quotations/utils/customerQuoteDecision';
import { normalizeNegotiationTimeline } from '@/features/quotations/utils/normalizeQuotationExtended';
import type { NegotiationTimeline } from '@/features/quotations/types/quotationExtended.types';

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

  async accept(id: string, dto: { message?: string } = {}): Promise<PortalQuotationDetail> {
    // OpenAPI PortalQuotationAcceptDto — optional message; send {} so validators get a JSON body.
    await portalApiClient.post(PORTAL_QUOTATIONS_API.accept(id), dto);
    // Always re-fetch: POST often echoes the prior open status.
    const fresh = await this.getById(id);
    const closed = applyPortalCustomerDecisionStatus(fresh, 'accept');
    rememberCustomerQuoteDecision(id, 'APPROVED');
    return {
      ...closed,
      raw: {
        ...(closed.raw ?? {}),
        portal_decision_server_status: fresh.status,
      },
    };
  },

  async reject(id: string, dto: PortalQuotationRejectDto): Promise<PortalQuotationDetail> {
    // OpenAPI: marks quote DISAPPROVED (UI coerces/shows as Rejected).
    await portalApiClient.post(PORTAL_QUOTATIONS_API.reject(id), dto);
    // Always re-fetch: POST 201 body often still has SENT / CUSTOMER_REVIEW / NEGOTIATING.
    const fresh = await this.getById(id);
    const closed = applyPortalCustomerDecisionStatus(fresh, 'reject');
    rememberCustomerQuoteDecision(id, 'REJECTED');
    return {
      ...closed,
      raw: {
        ...(closed.raw ?? {}),
        portal_decision_server_status: fresh.status,
      },
    };
  },

  async serviceCatalog(jobType: string): Promise<PortalServiceCatalogItem[]> {
    const trimmed = jobType.trim();
    if (!trimmed) {
      throw new PortalApiError('job_type is required for the portal service catalog.', 400);
    }
    const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.serviceCatalog, {
      params: { job_type: trimmed },
    });
    const items = normalizePortalServiceCatalog(res.data);
    return filterPortalServiceCatalogByJobType(items, trimmed);
  },

  async estimate(dto: PortalQuotationEstimateDto): Promise<PortalQuotationEstimateResult> {
    const res = await portalApiClient.post(PORTAL_QUOTATIONS_API.estimate, dto);
    return normalizePortalEstimate(res.data);
  },

  async counterOffer(id: string, dto: PortalQuotationCounterOfferDto): Promise<PortalQuotationDetail> {
    const res = await portalApiClient.post(PORTAL_QUOTATIONS_API.counterOffer(id), dto);
    const detail = normalizeQuotationDetail(res.data);
    if (detail) return detail;
    return this.getById(id);
  },

  async negotiation(id: string): Promise<NegotiationTimeline> {
    const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.negotiation(id));
    return normalizeNegotiationTimeline(res.data);
  },

  async downloadPdf(
    id: string,
    quotationNumber = 'quotation',
  ): Promise<void> {
    const filename = formatPdfFilename(quotationNumber, 'quotation');
    try {
      await downloadPortalBlob(PORTAL_QUOTATIONS_API.pdf(id), filename, {
        accept: 'application/pdf, application/octet-stream, */*',
        branding: quotationPdfBranding(quotationNumber),
      });
    } catch (err) {
      if (err instanceof PortalApiError) {
        if (err.status === 404 || err.status >= 500) {
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
