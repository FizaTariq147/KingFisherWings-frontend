import { portalApiClient, PortalApiError } from '@/lib/portalApiClient';
import { formatPdfFilename } from '@/features/files/utils/pdfFilename';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { fetchPortalBlob } from '@/features/portal-shared/downloadPortalBlob';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { generateQuotationPdf } from '@/features/quotations/utils/generateQuotationPdf';
import { PORTAL_BOOKINGS_API, PORTAL_QUOTATIONS_API } from '../api/portalQuotations.api';
import { PORTAL_SHIPMENTS_API } from '@/features/portal-shipments/api/portalShipments.api';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import type {
  PortalQuotationDetail,
  PortalQuotationListParams,
  PortalQuotationListResult,
  PortalQuotationRejectDto,
  PortalQuotationRequestDto,
  PortalQuotationEstimateDto,
  PortalCostingOptionsDto,
  PortalQuotationCounterOfferDto,
  PortalQuotationEstimateResult,
  PortalServiceCatalogItem,
  PortalQuotationSummary,
  PortalBookingForm,
  PortalBookingFormUpsertDto,
} from '../types/portalQuotations.types';
import {
  normalizeQuotationDetail,
  normalizeQuotationList,
  normalizeQuotationSummary,
  normalizePortalBookingForm,
} from '../utils/normalizePortalQuotations';
import {
  formatBookingFormMessageBody,
  readPortalBookingFormDraft,
  writePortalBookingFormDraft,
} from '../utils/portalBookingFormStorage';
import { portalMessagesService } from '@/features/portal-messages/services/portalMessages.service';
import { isUuid } from '@/lib/isUuid';
import {
  normalizePortalEstimate,
  normalizePortalServiceCatalog,
  normalizePortalCostingOptions,
  filterPortalServiceCatalogByJobType,
} from '../utils/normalizePortalQuotationExtended';
import { applyPortalCustomerDecisionStatus } from '../utils/portalQuotationStatus';
import { portalDetailToQuotationPdfModel } from '../utils/portalDetailToQuotationPdfModel';
import { rememberCustomerQuoteDecision } from '@/features/quotations/utils/customerQuoteDecision';
import { normalizeNegotiationTimeline } from '@/features/quotations/utils/normalizeQuotationExtended';
import type { NegotiationTimeline } from '@/features/quotations/types/quotationExtended.types';
import type { ApiPeriodQuery } from '@/lib/apiPeriod';
import { periodQueryParams } from '@/lib/apiPeriod';
import { asRecord, pickString, unwrapData } from '@/features/portal-shared/normalize';

/** NVOCC → /portal/bookings/:id ; Air → /portal/shipments/:id (OpenAPI air compliance). */
function resolveComplianceTarget(opts: {
  bookingId?: string;
  quotationId: string;
  jobId?: string;
  isAir?: boolean;
  jobType?: string;
}): { kind: 'booking' | 'shipment'; id: string } | null {
  const air =
    Boolean(opts.isAir) ||
    isAirJobType(opts.jobType) ||
    String(opts.jobType ?? '')
      .toUpperCase()
      .startsWith('AIR');
  if (air) {
    const shipmentId = opts.jobId?.trim() || '';
    if (shipmentId && isUuid(shipmentId)) return { kind: 'shipment', id: shipmentId };
    return null;
  }
  const bookingId = opts.bookingId?.trim() || '';
  if (bookingId && isUuid(bookingId)) return { kind: 'booking', id: bookingId };
  return null;
}

function compliancePaths(kind: 'booking' | 'shipment') {
  return kind === 'shipment'
    ? {
        form: PORTAL_SHIPMENTS_API.complianceForm,
        submit: PORTAL_SHIPMENTS_API.complianceFormSubmit,
        document: PORTAL_SHIPMENTS_API.complianceDocument,
      }
    : {
        form: PORTAL_BOOKINGS_API.complianceForm,
        submit: PORTAL_BOOKINGS_API.complianceFormSubmit,
        document: PORTAL_BOOKINGS_API.complianceDocument,
      };
}

function extractLinkedIdFromUnknown(raw: unknown): string | undefined {
  const data = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  return (
    pickString(
      data.booking_id,
      data.bookingId,
      data.nvocc_booking_id,
      data.nvoccBookingId,
      data.job_id,
      data.jobId,
      data.shipment_id,
      data.shipmentId,
      data.id,
      asRecord(data.booking)?.id,
      asRecord(data.job)?.id,
      asRecord(data.shipment)?.id,
    ) || undefined
  );
}

function isComplianceNotFoundError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  const status =
    error instanceof PortalApiError
      ? error.status
      : (error as { response?: { status?: number } })?.response?.status ?? 0;
  return (
    status === 404 ||
    /booking not found/i.test(msg) ||
    /shipment not found/i.test(msg) ||
    /job not found/i.test(msg) ||
    /compliance form/i.test(msg)
  );
}

export const portalQuotationsService = {
  async summary(period?: ApiPeriodQuery): Promise<PortalQuotationSummary> {
    const res = await portalApiClient.get(PORTAL_QUOTATIONS_API.summary, {
      params: periodQueryParams(period),
    });
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
    let fresh = await this.getById(id);
    const jt = String(fresh.jobType ?? fresh.raw?.job_type ?? '').toUpperCase();
    const isAir = isAirJobType(jt) || jt.startsWith('AIR');

    let bookingId = fresh.bookingId;
    let jobId = fresh.jobId;

    if (isAir) {
      // POST /portal/shipments/:id/accept → CUSTOMER_ACCEPTED (unlocks compliance form).
      const unlockCandidates = [jobId, id].filter(
        (v, i, arr): v is string => Boolean(v) && isUuid(v) && arr.indexOf(v) === i,
      );
      for (const candidate of unlockCandidates) {
        try {
          const res = await portalApiClient.post(PORTAL_SHIPMENTS_API.accept(candidate));
          const fromBody = extractLinkedIdFromUnknown(res.data);
          if (fromBody && isUuid(fromBody)) jobId = fromBody;
          else if (!jobId) jobId = candidate;
          break;
        } catch {
          /* try next candidate */
        }
      }
    } else {
      // Unlock NVOCC compliance form when a real booking id is known.
      const unlockCandidates = [bookingId, id].filter(
        (v, i, arr): v is string => Boolean(v) && isUuid(v) && arr.indexOf(v) === i,
      );
      for (const candidate of unlockCandidates) {
        try {
          const res = await portalApiClient.post(PORTAL_BOOKINGS_API.accept(candidate));
          const fromBody = extractLinkedIdFromUnknown(res.data);
          if (fromBody && isUuid(fromBody)) bookingId = fromBody;
          else if (!bookingId) bookingId = candidate;
          break;
        } catch {
          /* try next candidate */
        }
      }
    }

    // Re-fetch in case accept attached booking_id / job_id on the quotation.
    try {
      fresh = await this.getById(id);
      if (fresh.bookingId) bookingId = fresh.bookingId;
      if (fresh.jobId) jobId = fresh.jobId;
    } catch {
      /* keep prior */
    }
    const closed = applyPortalCustomerDecisionStatus(
      {
        ...fresh,
        ...(bookingId ? { bookingId } : {}),
        ...(jobId ? { jobId } : {}),
      },
      'accept',
    );
    rememberCustomerQuoteDecision(id, 'APPROVED');
    return {
      ...closed,
      bookingId: bookingId || closed.bookingId,
      jobId: jobId || closed.jobId,
      raw: {
        ...(closed.raw ?? {}),
        portal_decision_server_status: fresh.status,
        portal_booking_id: bookingId,
        portal_shipment_id: jobId,
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

  async costingOptions(dto: PortalCostingOptionsDto): Promise<PortalServiceCatalogItem[]> {
    const res = await portalApiClient.post(PORTAL_QUOTATIONS_API.costingOptions, dto);
    const items = normalizePortalCostingOptions(res.data);
    // Options are already scoped by job_type/currency/lane in the request body.
    return filterPortalServiceCatalogByJobType(items, dto.job_type, {
      allowMissingJobType: true,
    });
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

  async getPdfBlob(
    id: string,
    quotationNumber = 'quotation',
  ): Promise<{ blob: Blob; fileName: string }> {
    const filename = formatPdfFilename(quotationNumber, 'quotation');

    const throwFriendly = (err: unknown): never => {
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
              ? 'PDF could not be prepared for this quotation. Please try again or contact your forwarder.'
              : err.message,
            err.status,
          );
        }
        throw err;
      }
      throw err;
    };

    // Prefer live KingFisher layout from quote detail (same generator as admin).
    try {
      const detail = await this.getById(id);
      const user = usePortalAuthStore.getState().user;
      const quotation = portalDetailToQuotationPdfModel(detail, {
        customerName: user?.party?.name || user?.fullName || detail.number,
        contactName: user?.fullName,
        contactEmail: user?.email,
        contactPhone: user?.phone,
      });
      const blob = await generateQuotationPdf({
        quotation,
        company: {
          name: user?.tenantName || 'KingFisher Wings Group',
          tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
          phone: '+971 55 5355 286',
          email: 'info@kingfisherwingsgroup.com',
          website: 'www.kingfisherwingsgroup.com',
        },
        generatedBy: user?.email || user?.fullName,
        confirmNote: 'Please confirm the quote.',
      });
      return {
        blob,
        fileName: formatPdfFilename(detail.number || quotationNumber, 'quotation'),
      };
    } catch (clientErr) {
      // Fall back to admin-stored PDF only when live layout cannot be built.
      try {
        const detail = await this.getById(id).catch(() => undefined);
        if (detail?.pdfUrl) {
          const result = await fetchPortalBlob(detail.pdfUrl, filename, {
            accept: 'application/pdf, application/octet-stream, */*',
          });
          if (await blobLooksLikePdf(result.blob)) {
            return { blob: result.blob, fileName: result.filename };
          }
        }
      } catch {
        /* continue */
      }

      try {
        const result = await fetchPortalBlob(PORTAL_QUOTATIONS_API.pdf(id), filename, {
          accept: 'application/pdf, application/octet-stream, */*',
        });
        if (!(await blobLooksLikePdf(result.blob))) {
          throw new PortalApiError(
            'Download was expected to be a PDF but the server returned a non-PDF response.',
            400,
          );
        }
        return { blob: result.blob, fileName: result.filename };
      } catch (err) {
        if (clientErr instanceof Error && clientErr.message) {
          throw new PortalApiError(clientErr.message, 400);
        }
        throwFriendly(err);
      }
    }
  },

  async downloadPdf(id: string, quotationNumber = 'quotation'): Promise<void> {
    const { blob, fileName } = await this.getPdfBlob(id, quotationNumber);
    triggerBlobDownload(blob, fileName);
  },

  /**
   * Customer compliance booking form (8-step) — shared commercial gate.
   * NVOCC: GET/PUT /portal/bookings/{id}/compliance-form (+ submit)
   * Air:   GET/PUT /portal/shipments/{id}/compliance-form (+ submit)
   * Same UpsertNvoccBookingFormDto body per OpenAPI.
   */
  async getBookingForm(opts: {
    quotationId: string;
    bookingId?: string;
    jobId?: string;
    isAir?: boolean;
    quoteNumber?: string;
    jobType?: string;
  }): Promise<PortalBookingForm> {
    const target = resolveComplianceTarget(opts);
    if (!target) {
      return (
        readPortalBookingFormDraft(opts.quotationId) ?? {
          quotation_id: opts.quotationId,
          mark_complete: false,
        }
      );
    }
    const paths = compliancePaths(target.kind);
    try {
      const res = await portalApiClient.get(paths.form(target.id));
      const form = normalizePortalBookingForm(res.data);
      const parties = form.parties ?? [];
      writePortalBookingFormDraft(
        opts.quotationId,
        {
          pol: form.pol || '',
          pod: form.pod || '',
          commodity: form.commodity || '',
          date_of_request: form.date_of_request,
          voyage_ref: form.voyage_ref,
          client_booking_no: form.client_booking_no,
          gross_weight_kg: form.gross_weight_kg,
          net_weight_kg: form.net_weight_kg,
          shipper_owned_container: form.shipper_owned_container,
          is_dg: form.is_dg,
          teu_count: form.teu_count,
          hs_code: form.hs_code,
          final_use: form.final_use,
          activity_sector: form.activity_sector,
          insurance_details: form.insurance_details,
          lc_bank_details: form.lc_bank_details,
          attach_commercial_invoice: form.attach_commercial_invoice,
          attach_correspondence: form.attach_correspondence,
          attach_cod_form: form.attach_cod_form,
          attach_licence: form.attach_licence,
          booking_agent_line: form.booking_agent_line,
          agent_requester_name: form.agent_requester_name,
          sq_bl_booking_reference: form.sq_bl_booking_reference,
          request_details: form.request_details,
          consent_accepted: form.consent_accepted,
          mark_complete: form.mark_complete,
          parties,
        },
        { quoteNumber: opts.quoteNumber, jobType: opts.jobType },
      );
      return { ...form, quotation_id: opts.quotationId };
    } catch (error) {
      if (isComplianceNotFoundError(error)) {
        return (
          readPortalBookingFormDraft(opts.quotationId) ?? {
            quotation_id: opts.quotationId,
            mark_complete: false,
          }
        );
      }
      throw error;
    }
  },

  async updateBookingForm(
    opts: {
      quotationId: string;
      bookingId?: string;
      jobId?: string;
      isAir?: boolean;
      quoteNumber?: string;
      jobType?: string;
    },
    dto: PortalBookingFormUpsertDto,
  ): Promise<PortalBookingForm> {
    let target = resolveComplianceTarget(opts);

    // Refresh quote once to discover booking / shipment id before messages fallback.
    if (!target) {
      try {
        const fresh = await this.getById(opts.quotationId);
        target = resolveComplianceTarget({
          bookingId: fresh.bookingId ?? opts.bookingId,
          jobId: fresh.jobId ?? opts.jobId,
          quotationId: opts.quotationId,
          isAir: opts.isAir,
          jobType: opts.jobType ?? fresh.jobType,
        });
      } catch {
        /* continue */
      }
    }

    const saveViaMessages = async (): Promise<PortalBookingForm> => {
      const quoteLabel = opts.quoteNumber?.trim() || opts.quotationId.slice(0, 8);
      const subject = dto.mark_complete
        ? `[Customer booking form] ${quoteLabel} — ready for BOOKING_FORM_COMPLETE`
        : `[Customer booking form draft] ${quoteLabel}`;
      const body = formatBookingFormMessageBody({
        quotationId: opts.quotationId,
        quoteNumber: opts.quoteNumber,
        jobType: opts.jobType,
        jobId: opts.jobId,
        dto,
      });
      await portalMessagesService.create({
        subject: subject.slice(0, 200),
        body,
        job_id: opts.jobId && isUuid(opts.jobId) ? opts.jobId : undefined,
      });
      return writePortalBookingFormDraft(opts.quotationId, dto, {
        quoteNumber: opts.quoteNumber,
        jobType: opts.jobType,
      });
    };

    if (!target) {
      return saveViaMessages();
    }

    const paths = compliancePaths(target.kind);
    try {
      if (dto.mark_complete) {
        const submitBody = {
          ...dto,
          consent_accepted: Boolean(dto.consent_accepted),
          mark_complete: true,
        };
        await portalApiClient.post(paths.submit(target.id), submitBody);
        return writePortalBookingFormDraft(
          opts.quotationId,
          { ...dto, mark_complete: true },
          { quoteNumber: opts.quoteNumber, jobType: opts.jobType },
        );
      }

      await portalApiClient.put(paths.form(target.id), {
        ...dto,
        mark_complete: false,
      });
      return writePortalBookingFormDraft(
        opts.quotationId,
        { ...dto, mark_complete: false },
        { quoteNumber: opts.quoteNumber, jobType: opts.jobType },
      );
    } catch (error) {
      if (isComplianceNotFoundError(error)) {
        return saveViaMessages();
      }
      throw error;
    }
  },

  async uploadComplianceDocument(
    opts: {
      bookingId?: string;
      quotationId: string;
      jobId?: string;
      isAir?: boolean;
      jobType?: string;
    },
    kind: 'commercial_invoice' | 'correspondence' | 'cod_form' | 'licence',
    file: File,
  ): Promise<void> {
    const target = resolveComplianceTarget(opts);
    if (!target) {
      throw new PortalApiError(
        opts.isAir || isAirJobType(opts.jobType)
          ? 'No air shipment/job is linked to this quote yet. Ask your forwarder to start the air job, then try again.'
          : 'No NVOCC booking is linked to this quote yet. Ask your forwarder to create the booking, then try again.',
        404,
      );
    }
    const form = new FormData();
    form.append('file', file);
    const paths = compliancePaths(target.kind);
    await portalApiClient.post(paths.document(target.id, kind), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
