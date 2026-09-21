import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import { isUuid } from '@/lib/isUuid';
import { extractAxiosErrorDetail } from '@/lib/extractAxiosErrorDetail';
import { resolveSessionCompanyIdAsync } from '@/lib/resolveSessionCompanyId';
import {
  buildJobCreateCandidatesAsync,
  JOB_POST_AXIOS_CONFIG,
} from '@/features/jobs/utils/buildJobCreateCandidates';
import { ensureJobBranchReady } from '@/features/jobs/utils/ensureJobBranchReady';
import { normalizeJob, unwrapEntity as unwrapJobEntity } from '@/features/jobs/utils/normalizeJob';
import { ensureJobNumberFormatReady } from '@/features/organization/utils/ensureJobNumberFormat';
import { JOB_API } from '@/features/jobs/api/job.api';
import type { CreateJobDto, GenerateJobDocumentDto, SendPreAlertDto } from '@/features/jobs/types/job.types';
import type { JobType } from '@/features/jobs/constants/job.constants';
import { partyService } from '@/features/parties/services/party.service';
import { NVOCC_API } from '../api/nvocc.api';
import type {
  AssignLoadListContainerDto,
  ConvertNvoccBookingToJobDto,
  CopyNvoccVoyageDto,
  CreateNvoccBookingDto,
  CreateNvoccContainerRequestDto,
  CreateNvoccEnquiryDto,
  CreateNvoccTariffDto,
  CreateNvoccVoyageDto,
  ListResult,
  MarkNvoccEnquiryLostDto,
  NvoccBooking,
  NvoccBookingForm,
  NvoccBookingListParams,
  NvoccContainerRequest,
  NvoccEnquiry,
  NvoccEnquiryListParams,
  NvoccLoadListItem,
  NvoccTariff,
  NvoccTariffListParams,
  NvoccTariffLookupParams,
  NvoccTradeLaneReportParams,
  NvoccUtilizationReportParams,
  NvoccVoyage,
  NvoccVoyageListParams,
  NvoccWorkflowActionDto,
  RecordNvoccMblReceivedDto,
  SendCutoffReminderDto,
  SendNvoccRateDto,
  UpdateNvoccBookingDto,
  UpdateNvoccBookingFormDto,
  UpdateNvoccEnquiryDto,
  UpdateNvoccLoadListItemDto,
  UpdateNvoccTariffDto,
  UpdateNvoccVoyageDto,
} from '../types/nvocc.types';
import {
  isNvoccBookingLifecycleConfirmed,
  normalizeMany,
  normalizeNvoccBooking,
  normalizeNvoccBookingForm,
  normalizeNvoccContainerRequest,
  normalizeNvoccEnquiry,
  normalizeNvoccLoadListItem,
  normalizeNvoccTariff,
  normalizeNvoccVoyage,
} from '../utils/normalizeNvocc';
import {
  formatNvoccError,
  normalizeMeta,
  nvoccListQueryParams,
  prepareNvoccPayload,
  queryParams,
  unwrapEntity,
  unwrapList,
} from '../utils/nvoccUnwrap';

async function listResource<T>(
  path: string,
  params: object,
  normalizer: (raw: unknown) => T | null,
  listKeys: string[] = [],
): Promise<ListResult<T>> {
  const res = await withGatewayRetry(() => axiosInstance.get(path, { params: nvoccListQueryParams(params) }));
  const raw = unwrapList(res.data, listKeys);
  const items = normalizeMany(raw.items, normalizer);
  return { items, meta: normalizeMeta(raw.meta, items.length, {}) };
}

async function getResource<T>(
  path: string,
  normalizer: (raw: unknown) => T | null,
  notFoundMessage: string,
): Promise<T> {
  const res = await withGatewayRetry(() => axiosInstance.get(path));
  const item = normalizer(unwrapEntity(res.data));
  if (!item) throw new Error(notFoundMessage);
  return item;
}

async function mutateResource(
  method: 'post' | 'put' | 'patch' | 'delete',
  path: string,
  body?: object,
): Promise<unknown> {
  const res = await withGatewayRetry(() => {
    if (method === 'delete') return axiosInstance.delete(path);
    if (method === 'patch') return axiosInstance.patch(path, body);
    if (method === 'put') return axiosInstance.put(path, body);
    return axiosInstance.post(path, body);
  });
  return unwrapEntity(res.data);
}

/** Resolve a party UUID to use as job shipper when the booking row has none. */
async function resolveShipperIdForBooking(booking: NvoccBooking): Promise<string | undefined> {
  if (booking.shipper_id && isUuid(booking.shipper_id)) return booking.shipper_id;

  if (booking.enquiry_id && isUuid(booking.enquiry_id)) {
    try {
      const enquiry = await nvoccEnquiryService.get(booking.enquiry_id);
      if (enquiry.customer_id && isUuid(enquiry.customer_id)) return enquiry.customer_id;
    } catch {
      /* continue */
    }
  }

  try {
    const form = await nvoccBookingService.getBookingForm(booking.id);
    const shipperParty = form.parties?.find((p) => p.party_kind === 'SHIPPER');
    const name = shipperParty?.full_name?.trim();
    if (name) {
      try {
        const listed = await partyService.list({
          page: 1,
          limit: 25,
          search: name,
          party_type: 'CUSTOMER',
          order: 'asc',
        });
        const lower = name.toLowerCase();
        const match =
          listed.parties.find((p) => p.name.trim().toLowerCase() === lower) ||
          listed.parties.find((p) => p.name.trim().toLowerCase().includes(lower)) ||
          listed.parties[0];
        if (match?.id && isUuid(match.id)) return match.id;
      } catch {
        /* create below */
      }

      const code = `NV${booking.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
      const country =
        shipperParty?.country && /^[A-Za-z]{2}$/.test(shipperParty.country.trim())
          ? shipperParty.country.trim().toUpperCase()
          : 'AE';
      const partyPayload = {
        party_type: 'CUSTOMER' as const,
        code,
        name,
        address: shipperParty?.address?.trim() || undefined,
        city: shipperParty?.city?.trim() || undefined,
        country_code: country,
        is_active: true,
        notes: `Auto-created from NVOCC booking form ${booking.booking_number || booking.id}`,
      };
      try {
        const created = await partyService.create(partyPayload);
        if (created.id && isUuid(created.id)) return created.id;
      } catch {
        const created = await partyService.create({
          ...partyPayload,
          code: `NV${Date.now().toString(36).toUpperCase().slice(-8)}`,
        });
        if (created.id && isUuid(created.id)) return created.id;
      }
    }
  } catch {
    /* continue */
  }

  try {
    const listed = await partyService.list({
      page: 1,
      limit: 5,
      party_type: 'CUSTOMER',
      order: 'asc',
    });
    const first = listed.parties.find((p) => p.id && isUuid(p.id));
    if (first?.id) return first.id;
  } catch {
    /* ignore */
  }

  return undefined;
}

export const nvoccTariffService = {
  async list(params: NvoccTariffListParams = {}): Promise<ListResult<NvoccTariff>> {
    try {
      return await listResource(NVOCC_API.tariffs.list, params, normalizeNvoccTariff, ['tariffs']);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async lookup(params: NvoccTariffLookupParams = {}): Promise<NvoccTariff[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.tariffs.lookup, { params: queryParams(params) }),
      );
      const raw = unwrapList(res.data, ['tariffs']);
      return normalizeMany(raw.items, normalizeNvoccTariff);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async get(id: string): Promise<NvoccTariff> {
    try {
      return await getResource(NVOCC_API.tariffs.byId(id), normalizeNvoccTariff, 'Tariff not found.');
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async create(dto: CreateNvoccTariffDto): Promise<NvoccTariff> {
    try {
      const raw = await mutateResource('post', NVOCC_API.tariffs.create, prepareNvoccPayload(dto));
      const item = normalizeNvoccTariff(raw);
      if (!item) throw new Error('Tariff was created but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async update(id: string, dto: UpdateNvoccTariffDto): Promise<NvoccTariff> {
    try {
      const raw = await mutateResource('patch', NVOCC_API.tariffs.byId(id), prepareNvoccPayload(dto));
      return normalizeNvoccTariff(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await mutateResource('delete', NVOCC_API.tariffs.byId(id));
    } catch (error) {
      throw formatNvoccError(error);
    }
  },
};

export const nvoccVoyageService = {
  async list(params: NvoccVoyageListParams = {}): Promise<ListResult<NvoccVoyage>> {
    try {
      return await listResource(NVOCC_API.voyages.list, params, normalizeNvoccVoyage, ['voyages']);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async get(id: string): Promise<NvoccVoyage> {
    try {
      return await getResource(NVOCC_API.voyages.byId(id), normalizeNvoccVoyage, 'Voyage not found.');
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async create(dto: CreateNvoccVoyageDto): Promise<NvoccVoyage> {
    try {
      const raw = await mutateResource('post', NVOCC_API.voyages.create, prepareNvoccPayload(dto));
      const item = normalizeNvoccVoyage(raw);
      if (!item) throw new Error('Voyage was created but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async update(id: string, dto: UpdateNvoccVoyageDto): Promise<NvoccVoyage> {
    try {
      const raw = await mutateResource('patch', NVOCC_API.voyages.byId(id), prepareNvoccPayload(dto));
      return normalizeNvoccVoyage(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await mutateResource('delete', NVOCC_API.voyages.byId(id));
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async publish(id: string): Promise<NvoccVoyage> {
    try {
      const raw = await mutateResource('post', NVOCC_API.voyages.publish(id));
      return normalizeNvoccVoyage(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async close(id: string): Promise<NvoccVoyage> {
    try {
      const raw = await mutateResource('post', NVOCC_API.voyages.close(id));
      return normalizeNvoccVoyage(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async markSailed(id: string): Promise<NvoccVoyage> {
    try {
      const raw = await mutateResource('post', NVOCC_API.voyages.markSailed(id));
      return normalizeNvoccVoyage(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async copy(id: string, dto: CopyNvoccVoyageDto = {}): Promise<NvoccVoyage> {
    try {
      const raw = await mutateResource('post', NVOCC_API.voyages.copy(id), prepareNvoccPayload(dto));
      const item = normalizeNvoccVoyage(raw);
      if (!item) throw new Error('Voyage copy did not return a record.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async loadList(voyageId: string): Promise<NvoccLoadListItem[]> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(NVOCC_API.voyages.loadList(voyageId)));
      const raw = unwrapList(res.data, ['items', 'load_list']);
      return normalizeMany(raw.items, normalizeNvoccLoadListItem);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async loadListWeightCheck(voyageId: string): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.voyages.loadListWeightCheck(voyageId)),
      );
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async updateLoadListItem(
    voyageId: string,
    itemId: string,
    dto: UpdateNvoccLoadListItemDto,
  ): Promise<NvoccLoadListItem> {
    try {
      const raw = await mutateResource(
        'patch',
        NVOCC_API.voyages.loadListItem(voyageId, itemId),
        prepareNvoccPayload(dto),
      );
      const item = normalizeNvoccLoadListItem(raw);
      if (!item) throw new Error('Load list item was updated but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async assignContainer(
    voyageId: string,
    itemId: string,
    dto: AssignLoadListContainerDto,
  ): Promise<NvoccLoadListItem> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.voyages.assignContainer(voyageId, itemId),
        prepareNvoccPayload(dto),
      );
      const item = normalizeNvoccLoadListItem(raw);
      if (!item) throw new Error('Container assignment did not return a record.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async loadListPdf(voyageId: string): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(NVOCC_API.voyages.loadListPdf(voyageId), undefined, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async pnl(voyageId: string): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(NVOCC_API.voyages.pnl(voyageId)));
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },
};

export const nvoccEnquiryService = {
  async list(params: NvoccEnquiryListParams = {}): Promise<ListResult<NvoccEnquiry>> {
    try {
      return await listResource(NVOCC_API.enquiries.list, params, normalizeNvoccEnquiry, ['enquiries']);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async analytics(params: Record<string, string | undefined> = {}): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.enquiries.analytics, { params: queryParams(params) }),
      );
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async get(id: string): Promise<NvoccEnquiry> {
    try {
      return await getResource(NVOCC_API.enquiries.byId(id), normalizeNvoccEnquiry, 'Enquiry not found.');
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async create(dto: CreateNvoccEnquiryDto): Promise<NvoccEnquiry> {
    try {
      const raw = await mutateResource('post', NVOCC_API.enquiries.create, prepareNvoccPayload(dto));
      const item = normalizeNvoccEnquiry(raw);
      if (!item) throw new Error('Enquiry was created but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async update(id: string, dto: UpdateNvoccEnquiryDto): Promise<NvoccEnquiry> {
    try {
      const raw = await mutateResource('patch', NVOCC_API.enquiries.byId(id), prepareNvoccPayload(dto));
      return normalizeNvoccEnquiry(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await mutateResource('delete', NVOCC_API.enquiries.byId(id));
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async sendRate(id: string, dto: SendNvoccRateDto): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource('post', NVOCC_API.enquiries.sendRate(id), prepareNvoccPayload(dto));
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async markLost(id: string, dto: MarkNvoccEnquiryLostDto): Promise<NvoccEnquiry> {
    try {
      const raw = await mutateResource('post', NVOCC_API.enquiries.markLost(id), prepareNvoccPayload(dto));
      return normalizeNvoccEnquiry(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async convertToBooking(id: string): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource('post', NVOCC_API.enquiries.convertToBooking(id));
      const item = normalizeNvoccBooking(raw);
      if (!item) throw new Error('Booking was created but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },
};

export const nvoccBookingService = {
  async list(params: NvoccBookingListParams = {}): Promise<ListResult<NvoccBooking>> {
    try {
      return await listResource(NVOCC_API.bookings.list, params, normalizeNvoccBooking, ['bookings']);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async get(id: string): Promise<NvoccBooking> {
    try {
      return await getResource(NVOCC_API.bookings.byId(id), normalizeNvoccBooking, 'Booking not found.');
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  /**
   * Resolve the NVOCC booking that continues a quotation through Stage 1–2 gates.
   * Used by quotation detail so the flowchart tracks live booking progress (not stuck on APPROVED).
   */
  async findLinkedToQuotation(opts: {
    bookingId?: string;
    quotationId?: string;
    quoteNumber?: string;
    customerId?: string;
  }): Promise<NvoccBooking | null> {
    const { readRememberedBookingIdForQuote, rememberQuoteBookingLink } = await import(
      '../utils/quoteBookingLink'
    );
    const remembered = readRememberedBookingIdForQuote({
      quotationId: opts.quotationId,
      quoteNumber: opts.quoteNumber,
    });
    const directIds = [opts.bookingId, remembered].filter(
      (v): v is string => Boolean(v && isUuid(v)),
    );

    for (const bookingId of directIds) {
      try {
        const booking = await this.get(bookingId);
        rememberQuoteBookingLink({
          quotationId: opts.quotationId,
          quoteNumber: opts.quoteNumber,
          bookingId: booking.id,
        });
        return booking;
      } catch {
        /* try next */
      }
    }

    const quoteNumber = opts.quoteNumber?.trim();
    const quotationId = opts.quotationId?.trim();
    const needles = [quoteNumber, quotationId]
      .filter((v): v is string => Boolean(v))
      .map((v) => v.toUpperCase());

    const scoreBooking = (b: NvoccBooking) => {
      const s = String(b.booking_status ?? '').toUpperCase();
      if (b.job_id) return 60;
      if (s.includes('INVOICE')) return 50;
      if (s.includes('BOOKING_FORM')) return 40;
      if (s.includes('CUSTOMER')) return 30;
      if (s.includes('QUOTE_SENT')) return 20;
      if (s.includes('CS_')) return 10;
      return 1;
    };

    const matchesNeedle = (hay: string) => {
      const h = hay.toUpperCase();
      return needles.some((n) => n && h.includes(n));
    };

    // 1) List bookings (search is unreliable on some backends) — prefer shipper filter.
    let candidates: NvoccBooking[] = [];
    try {
      if (quoteNumber) {
        const bySearch = await this.list({ search: quoteNumber });
        candidates = bySearch.items;
      }
    } catch {
      /* ignore */
    }
    try {
      const listed = await this.list(
        opts.customerId && isUuid(opts.customerId)
          ? { shipper_id: opts.customerId }
          : {},
      );
      const seen = new Set(candidates.map((b) => b.id));
      for (const b of listed.items) {
        if (!seen.has(b.id)) candidates.push(b);
      }
    } catch {
      /* ignore */
    }

    // 2) Rank by form reference / text match, then commercial progress.
    type Ranked = { booking: NvoccBooking; rank: number };
    const ranked: Ranked[] = [];
    const formChecks = candidates.slice(0, 25);
    await Promise.all(
      formChecks.map(async (booking) => {
        let rank = scoreBooking(booking);
        const textHay = `${booking.booking_number || ''} ${booking.shipper_ref || ''} ${booking.commodity || ''}`;
        if (matchesNeedle(textHay)) rank += 100;
        try {
          const form = await this.getBookingForm(booking.id);
          const formHay = [
            form.sq_bl_booking_reference,
            form.request_details,
            form.client_booking_no,
            form.voyage_ref,
            String(form.quotation_id ?? ''),
            String(form.booking_id ?? ''),
          ]
            .filter(Boolean)
            .join(' ');
          if (matchesNeedle(formHay)) rank += 200;
          if (form.mark_complete === true) rank += 15;
        } catch {
          /* form may 404 */
        }
        ranked.push({ booking, rank });
      }),
    );

    ranked.sort((a, b) => b.rank - a.rank);
    const best = ranked.find((r) => r.rank >= 100) ?? (needles.length ? null : ranked[0]);
    // Only accept a customer-list fallback when it is clearly advanced (invoice+) so we
    // do not attach an unrelated draft booking to the quote rail.
    const fallback =
      best ??
      ranked.find((r) => scoreBooking(r.booking) >= 40) ??
      null;
    if (fallback) {
      rememberQuoteBookingLink({
        quotationId: opts.quotationId,
        quoteNumber: opts.quoteNumber,
        bookingId: fallback.booking.id,
      });
      return fallback.booking;
    }

    return null;
  },

  async create(dto: CreateNvoccBookingDto): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource('post', NVOCC_API.bookings.create, prepareNvoccPayload(dto));
      const item = normalizeNvoccBooking(raw);
      if (!item) throw new Error('Booking was created but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async update(id: string, dto: UpdateNvoccBookingDto): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource('patch', NVOCC_API.bookings.byId(id), prepareNvoccPayload(dto));
      return normalizeNvoccBooking(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await mutateResource('delete', NVOCC_API.bookings.byId(id));
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async confirm(id: string): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource('post', NVOCC_API.bookings.confirm(id));
      return normalizeNvoccBooking(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async cancel(id: string): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource('post', NVOCC_API.bookings.cancel(id));
      return normalizeNvoccBooking(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async convertToJob(id: string, dto: ConvertNvoccBookingToJobDto = {}): Promise<Record<string, unknown>> {
    try {
      let booking = await this.get(id);
      if (booking.job_id && isUuid(booking.job_id)) {
        const { rememberBookingJobLink } = await import('../utils/bookingJobLink');
        rememberBookingJobLink({
          bookingId: id,
          jobId: booking.job_id,
          jobType: booking.job_type,
        });
        try {
          const { readRememberedQuoteForBooking } = await import('../utils/quoteBookingLink');
          const { quotationService } = await import(
            '@/features/quotations/services/quotation.service'
          );
          const remembered = readRememberedQuoteForBooking(id);
          if (remembered?.quotationId && isUuid(remembered.quotationId)) {
            await quotationService.markConvertedWithJob(
              remembered.quotationId,
              booking.job_id,
            );
          }
        } catch {
          /* non-fatal */
        }
        return {
          id: booking.job_id,
          job_id: booking.job_id,
          job_type: booking.job_type ?? 'NVOCC_EXPORT',
          already_linked: true,
        };
      }

      // Session link from a prior fallback convert — treat as already converted.
      {
        const { readRememberedJobForBooking, rememberBookingJobLink } = await import(
          '../utils/bookingJobLink'
        );
        const remembered = readRememberedJobForBooking(id);
        if (remembered?.jobId && isUuid(remembered.jobId)) {
          rememberBookingJobLink({
            bookingId: id,
            jobId: remembered.jobId,
            jobType: remembered.jobType || booking.job_type,
          });
          try {
            const { readRememberedQuoteForBooking } = await import('../utils/quoteBookingLink');
            const { quotationService } = await import(
              '@/features/quotations/services/quotation.service'
            );
            const quoteLink = readRememberedQuoteForBooking(id);
            if (quoteLink?.quotationId && isUuid(quoteLink.quotationId)) {
              await quotationService.markConvertedWithJob(
                quoteLink.quotationId,
                remembered.jobId,
              );
            }
          } catch {
            /* non-fatal */
          }
          return {
            id: remembered.jobId,
            job_id: remembered.jobId,
            job_type: remembered.jobType || booking.job_type || 'NVOCC_EXPORT',
            already_linked: true,
            from_session: true,
          };
        }
      }

      // Entity lifecycle (DRAFT → CONFIRMED) is separate from commercial gate (INVOICE_SENT).
      // Backend: "Only confirmed bookings can be converted to a job."
      const ensureConfirmed = async () => {
        if (isNvoccBookingLifecycleConfirmed(booking.lifecycle_status)) return;
        try {
          booking = await this.confirm(id);
        } catch (confirmErr) {
          const detail = extractAxiosErrorDetail(confirmErr).toLowerCase();
          if (
            detail.includes('only draft') ||
            detail.includes('already') ||
            detail.includes('confirmed')
          ) {
            booking = await this.get(id).catch(() => booking);
            return;
          }
          throw new Error(
            `Confirm booking failed before convert (lifecycle: ${booking.lifecycle_status || 'DRAFT'}, gate: ${booking.booking_status || '—'}). ` +
              `Confirm needs a voyage with free space. ${extractAxiosErrorDetail(confirmErr)}`,
          );
        }
      };

      await ensureConfirmed();

      const companyId =
        (dto.company_id && isUuid(dto.company_id) ? dto.company_id : undefined) ||
        (await resolveSessionCompanyIdAsync());

      if (!companyId || !isUuid(companyId)) {
        throw new Error(
          'Convert to job needs a company. Ensure your user is linked to a company, then retry.',
        );
      }

      await ensureJobNumberFormatReady();
      const branchId =
        (dto.branch_id && isUuid(dto.branch_id) ? dto.branch_id : undefined) ||
        (await ensureJobBranchReady(companyId));

      // Gated bookings often lack shipper_id — resolve from enquiry / form / parties, then patch.
      let shipperId =
        booking.shipper_id && isUuid(booking.shipper_id) ? booking.shipper_id : undefined;
      if (!shipperId) {
        shipperId = await resolveShipperIdForBooking(booking);
        if (shipperId) {
          try {
            booking = await this.update(id, { shipper_id: shipperId });
            shipperId =
              booking.shipper_id && isUuid(booking.shipper_id) ? booking.shipper_id : shipperId;
          } catch {
            /* still use resolved id for fallback create */
          }
        }
      }

      const rememberAndLinkJob = async (
        jobId: string,
        jobType?: string,
      ): Promise<Record<string, unknown>> => {
        const { rememberBookingJobLink } = await import('../utils/bookingJobLink');
        rememberBookingJobLink({
          bookingId: id,
          jobId,
          jobType: jobType || booking.job_type || 'NVOCC_EXPORT',
        });

        // Official convert attaches job_id; fallback / empty convert responses often do not.
        // Try several PATCH shapes so GET booking reflects CONVERTED / linked job.
        const patchBodies: Record<string, unknown>[] = [
          { job_id: jobId },
          { jobId },
          { linked_job_id: jobId },
          {
            shipper_ref: [booking.shipper_ref, `JOB:${jobId}`].filter(Boolean).join(' ').slice(0, 120),
          },
        ];
        for (const body of patchBodies) {
          try {
            const updated = await mutateResource(
              'patch',
              NVOCC_API.bookings.byId(id),
              prepareNvoccPayload(body),
            );
            const normalized = normalizeNvoccBooking(updated);
            if (normalized?.job_id && isUuid(normalized.job_id)) {
              booking = normalized;
              break;
            }
            // Refetch — some APIs accept patch but omit job_id in response body.
            booking = await this.get(id).catch(() => booking);
            if (booking.job_id && isUuid(booking.job_id)) break;
          } catch {
            /* try next shape */
          }
        }

        await markLinkedQuotationConverted(jobId);

        return {
          id: jobId,
          job_id: jobId,
          job_type: jobType || booking.job_type || 'NVOCC_EXPORT',
          booking_id: id,
          booking_status: booking.booking_status,
          lifecycle_status: booking.lifecycle_status,
        };
      };

      const markLinkedQuotationConverted = async (jobId: string) => {
        try {
          const { readRememberedQuoteForBooking } = await import(
            '../utils/quoteBookingLink'
          );
          const { quotationService } = await import(
            '@/features/quotations/services/quotation.service'
          );
          const remembered = readRememberedQuoteForBooking(id);
          let quotationId = remembered?.quotationId;
          if (!quotationId || !isUuid(quotationId)) {
            // Form / shipper-ref may carry quote number — resolve via list.
            const quoteNumber =
              remembered?.quoteNumber ||
              booking.shipper_ref ||
              booking.booking_number;
            if (quoteNumber) {
              const listed = await quotationService.list({
                page: 1,
                limit: 20,
                search: String(quoteNumber),
                order: 'desc',
                ...(booking.shipper_id && isUuid(booking.shipper_id)
                  ? { customer_id: booking.shipper_id }
                  : {}),
              });
              const match =
                listed.quotations.find(
                  (q) =>
                    q.quotation_number === quoteNumber ||
                    q.quote_no === quoteNumber ||
                    String(q.quotation_number ?? '')
                      .toUpperCase()
                      .includes(String(quoteNumber).toUpperCase()),
                ) ?? listed.quotations[0];
              quotationId = match?.id;
            }
          }
          if (!quotationId && booking.shipper_id && isUuid(booking.shipper_id)) {
            const linked = await quotationService.findLinkedToJob(jobId, {
              customerId: booking.shipper_id,
              jobType: booking.job_type,
            });
            quotationId = linked?.id;
          }
          if (quotationId && isUuid(quotationId)) {
            await quotationService.markConvertedWithJob(quotationId, jobId);
          }
        } catch {
          /* non-fatal — UI still shows Converted via booking job link / memory */
        }
      };

      const extractJobPayload = (raw: unknown): Record<string, unknown> | null => {
        if (!raw || typeof raw !== 'object') return null;
        const record = raw as Record<string, unknown>;
        const nested =
          record.job && typeof record.job === 'object'
            ? (record.job as Record<string, unknown>)
            : record.data && typeof record.data === 'object'
              ? (record.data as Record<string, unknown>)
              : record;
        const jobId =
          (typeof nested.id === 'string' && isUuid(nested.id) ? nested.id : undefined) ||
          (typeof nested.job_id === 'string' && isUuid(nested.job_id) ? nested.job_id : undefined) ||
          (typeof record.job_id === 'string' && isUuid(record.job_id) ? record.job_id : undefined) ||
          (typeof record.id === 'string' && isUuid(record.id) ? record.id : undefined);
        if (!jobId) return null;
        return {
          ...nested,
          ...record,
          id: jobId,
          job_id: jobId,
          job_type:
            nested.job_type ||
            record.job_type ||
            booking.job_type ||
            'NVOCC_EXPORT',
        };
      };

      const body: ConvertNvoccBookingToJobDto = {
        ...dto,
        company_id: companyId,
        branch_id: branchId,
      };

      const postConvert = (payload: object) =>
        mutateResource(
          'post',
          NVOCC_API.bookings.convertToJob(id),
          prepareNvoccPayload(payload),
        );

      const tryConvertEndpoints = async (): Promise<Record<string, unknown> | null> => {
        // Prefer empty body first — many OpenAPI convert DTOs are empty / whitelist-strict.
        const attempts: object[] = [{}, prepareNvoccPayload(body), body];
        let lastErr: unknown;
        for (const payload of attempts) {
          try {
            const raw = await postConvert(payload);
            const extracted = extractJobPayload(raw);
            if (extracted?.job_id && typeof extracted.job_id === 'string') {
              return await rememberAndLinkJob(
                extracted.job_id,
                typeof extracted.job_type === 'string' ? extracted.job_type : undefined,
              );
            }
            // Convert may return booking with job_id attached.
            booking = await this.get(id).catch(() => booking);
            if (booking.job_id && isUuid(booking.job_id)) {
              return await rememberAndLinkJob(booking.job_id, booking.job_type);
            }
            // 2xx with no job id — treat as soft failure and fall through.
            lastErr = new Error(
              'Convert-to-job returned success but no job id. Creating job via fallback.',
            );
          } catch (err) {
            lastErr = err;
            const detail = extractAxiosErrorDetail(err).toLowerCase();
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (
              status === 400 &&
              (detail.includes('only confirmed') ||
                detail.includes('must be confirmed') ||
                detail.includes('not confirmed'))
            ) {
              await ensureConfirmed();
              continue;
            }
            // Unknown property on body — next attempt uses emptier payload.
            if (
              status === 400 &&
              (detail.includes('should not exist') || detail.includes('whitelist'))
            ) {
              continue;
            }
          }
        }
        if (lastErr) throw lastErr;
        return null;
      };

      const createFallbackJob = async (priorError: unknown): Promise<Record<string, unknown>> => {
        if (!shipperId || !isUuid(shipperId)) {
          shipperId = await resolveShipperIdForBooking(booking);
        }
        if (!shipperId || !isUuid(shipperId)) {
          throw new Error(
            `Convert to job failed and fallback could not resolve a shipper. ` +
              `Add a SHIPPER name on the booking form (or link a Customer party), then retry. ` +
              `Gate: ${booking.booking_status || '—'}; lifecycle: ${booking.lifecycle_status || '—'}. ` +
              `${extractAxiosErrorDetail(priorError)}`,
          );
        }

        const jobType = (booking.job_type || 'NVOCC_EXPORT') as JobType;
        const createDto: CreateJobDto = {
          job_type: jobType,
          shipper_id: shipperId,
          company_id: companyId,
          branch_id: branchId,
          consignee_id: booking.consignee_id,
          commodity: booking.commodity,
          hs_code: booking.hs_code,
          pieces: booking.pieces,
          gross_weight: booking.gross_weight,
          container_type_id: booking.container_type_id,
          container_count: booking.container_count,
          is_dg: booking.is_dg,
          incoterms: booking.incoterms,
          notes: `Created as fallback from NVOCC booking ${booking.booking_number || booking.id}`,
        };

        const candidates = await buildJobCreateCandidatesAsync(createDto, companyId, branchId);
        let lastCreateError = extractAxiosErrorDetail(priorError);
        for (const candidate of candidates) {
          try {
            const res = await withGatewayRetry(() =>
              axiosInstance.post(JOB_API.list, candidate, JOB_POST_AXIOS_CONFIG),
            );
            const job = normalizeJob(unwrapJobEntity(res.data));
            if (job?.id) {
              return await rememberAndLinkJob(job.id, job.job_type ?? jobType);
            }
          } catch (createErr) {
            lastCreateError = extractAxiosErrorDetail(createErr);
          }
        }

        throw new Error(
          `Convert to job failed and fallback POST /jobs also failed. ${lastCreateError}`,
        );
      };

      try {
        const converted = await tryConvertEndpoints();
        if (converted) return converted;
        return await createFallbackJob(
          new Error('Convert-to-job returned no job id after confirmed booking.'),
        );
      } catch (convertErr) {
        const convertStatus = (convertErr as { response?: { status?: number } })?.response?.status;
        const convertDetail = extractAxiosErrorDetail(convertErr).toLowerCase();

        if (
          convertStatus === 400 &&
          (convertDetail.includes('only confirmed') ||
            convertDetail.includes('must be confirmed') ||
            convertDetail.includes('not confirmed'))
        ) {
          await ensureConfirmed();
          try {
            const converted = await tryConvertEndpoints();
            if (converted) return converted;
          } catch {
            /* fallback below */
          }
        }

        // Confirmed + INVOICE_SENT: always allow Ops to proceed via POST /jobs
        // when convert-to-job is broken (400/500/empty).
        return await createFallbackJob(convertErr);
      }
    } catch (error) {
      if (error instanceof Error && !(error as { response?: unknown }).response) {
        throw error;
      }
      throw formatNvoccError(error);
    }
  },

  async sendCutoffReminder(id: string, dto: SendCutoffReminderDto = {}): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.bookings.sendCutoffReminder(id),
        prepareNvoccPayload(dto),
      );
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async bookingConfirmationPdf(id: string): Promise<Blob> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(NVOCC_API.bookings.bookingConfirmation(id), undefined, {
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async csTriage(id: string, dto: NvoccWorkflowActionDto = {}): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.bookings.csTriage(id),
        prepareNvoccPayload(dto),
      );
      return normalizeNvoccBooking(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async markQuoteSent(id: string, dto: NvoccWorkflowActionDto = {}): Promise<NvoccBooking> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.bookings.markQuoteSent(id),
        prepareNvoccPayload(dto),
      );
      return normalizeNvoccBooking(raw) ?? this.get(id);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  /**
   * Mirror portal accept onto the NVOCC booking (sets CUSTOMER_ACCEPTED).
   * Uses staff axios against /portal/bookings/:id/accept when the quote was
   * approved in portal but the booking entity never received accept.
   */
  async tryPortalAccept(bookingId: string): Promise<NvoccBooking | null> {
    if (!isUuid(bookingId)) return null;
    try {
      await mutateResource('post', `/portal/bookings/${bookingId}/accept`, {});
      return await this.get(bookingId);
    } catch {
      return null;
    }
  },

  async getBookingForm(id: string): Promise<NvoccBookingForm> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.bookings.bookingForm(id)),
      );
      return normalizeNvoccBookingForm(unwrapEntity(res.data) ?? res.data);
    } catch (error) {
      // Backend returns 404 until the first PUT/POST creates the form row.
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return normalizeNvoccBookingForm({ booking_id: id });
      }
      throw formatNvoccError(error);
    }
  },

  async updateBookingForm(id: string, dto: UpdateNvoccBookingFormDto): Promise<NvoccBookingForm> {
    const body = prepareNvoccPayload(dto);
    try {
      const raw = await mutateResource('put', NVOCC_API.bookings.bookingForm(id), body);
      return normalizeNvoccBookingForm(raw);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // Some backends only create via POST when no form exists yet.
      if (status === 404 || status === 405) {
        try {
          const raw = await mutateResource('post', NVOCC_API.bookings.bookingForm(id), body);
          return normalizeNvoccBookingForm(raw);
        } catch (createError) {
          throw formatNvoccError(createError);
        }
      }
      throw formatNvoccError(error);
    }
  },

  async sendInvoice(id: string, dto: NvoccWorkflowActionDto = {}): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.bookings.sendInvoice(id),
        prepareNvoccPayload(dto),
      );
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },
};

async function postNvoccJobDocument(
  path: string,
  dto: GenerateJobDocumentDto = {},
): Promise<Record<string, unknown>> {
  try {
    const raw = await mutateResource('post', path, prepareNvoccPayload(dto));
    return (raw as Record<string, unknown>) ?? {};
  } catch (error) {
    throw formatNvoccError(error);
  }
}

export const nvoccJobService = {
  async generationStatus(jobId: string): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.jobs.generationStatus(jobId)),
      );
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  hblDraft: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.hblDraft(jobId), dto),
  hblOriginal: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.hblOriginal(jobId), dto),
  hblDraftGated: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.hblDraftGated(jobId), dto),
  hblOriginalGated: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.hblOriginalGated(jobId), dto),
  hblExpressRelease: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.hblExpressRelease(jobId), dto),
  surrenderNotice: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.surrenderNotice(jobId), dto),
  mbl: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.mbl(jobId), dto),
  preCan: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.preCan(jobId), dto),
  can: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.can(jobId), dto),
  deliveryOrder: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.deliveryOrder(jobId), dto),
  preAlertPdf: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.preAlertPdf(jobId), dto),
  bookingConfirmation: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.bookingConfirmation(jobId), dto),
  stuffingReport: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.stuffingReport(jobId), dto),
  cargoManifest: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.cargoManifest(jobId), dto),
  jobCard: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.jobCard(jobId), dto),
  jobPnl: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.jobPnl(jobId), dto),
  proformaInvoice: (jobId: string, dto?: GenerateJobDocumentDto) =>
    postNvoccJobDocument(NVOCC_API.jobs.proformaInvoice(jobId), dto),

  async listContainerRequests(jobId: string): Promise<NvoccContainerRequest[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.jobs.containerRequests(jobId)),
      );
      const raw = unwrapList(res.data, ['items', 'container_requests', 'requests']);
      return normalizeMany(raw.items, normalizeNvoccContainerRequest);
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async createContainerRequest(
    jobId: string,
    dto: CreateNvoccContainerRequestDto = {},
  ): Promise<NvoccContainerRequest> {
    try {
      // API whitelist: container_count (int 1–100). `quantity` must not be sent.
      const rawCount = dto.container_count ?? dto.quantity;
      const parsed =
        rawCount == null || rawCount === ''
          ? 1
          : Number(rawCount);
      const containerCount = Number.isFinite(parsed)
        ? Math.min(100, Math.max(1, Math.trunc(parsed)))
        : 1;

      const body: Record<string, unknown> = {
        container_count: containerCount,
      };
      if (dto.container_type_id && isUuid(String(dto.container_type_id))) {
        body.container_type_id = String(dto.container_type_id).trim();
      }
      if (typeof dto.notes === 'string' && dto.notes.trim()) {
        body.notes = dto.notes.trim();
      }

      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.containerRequests(jobId),
        prepareNvoccPayload(body),
      );
      const item = normalizeNvoccContainerRequest(raw);
      if (!item) throw new Error('Container request was created but not returned.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async issueContainerRequest(
    jobId: string,
    requestId: string,
    dto: NvoccWorkflowActionDto = {},
  ): Promise<NvoccContainerRequest> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.issueContainerRequest(jobId, requestId),
        prepareNvoccPayload(dto),
      );
      const item = normalizeNvoccContainerRequest(raw);
      if (!item) throw new Error('CRO issue did not return a container request.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async allocateContainerRequest(
    jobId: string,
    requestId: string,
    dto: NvoccWorkflowActionDto = {},
  ): Promise<NvoccContainerRequest> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.allocateContainerRequest(jobId, requestId),
        prepareNvoccPayload(dto),
      );
      const item = normalizeNvoccContainerRequest(raw);
      if (!item) throw new Error('Container allocate did not return a container request.');
      return item;
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async stageLoading(jobId: string, dto: NvoccWorkflowActionDto = {}): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.stageLoading(jobId),
        prepareNvoccPayload(dto),
      );
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async confirmPayment(
    jobId: string,
    dto: NvoccWorkflowActionDto = {},
  ): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.confirmPayment(jobId),
        prepareNvoccPayload(dto),
      );
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async closeReport(jobId: string, dto: NvoccWorkflowActionDto = {}): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.closeReport(jobId),
        prepareNvoccPayload(dto),
      );
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async mblReceived(jobId: string, dto: RecordNvoccMblReceivedDto = {}): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource('patch', NVOCC_API.jobs.mblReceived(jobId), prepareNvoccPayload(dto));
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async sendPreAlert(jobId: string, dto: SendPreAlertDto): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource('post', NVOCC_API.jobs.sendPreAlert(jobId), prepareNvoccPayload(dto));
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async submitSi(jobId: string): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource('post', NVOCC_API.jobs.submitSi(jobId));
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async submitVgm(jobId: string): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource('post', NVOCC_API.jobs.submitVgm(jobId));
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async podReceived(jobId: string): Promise<Record<string, unknown>> {
    try {
      const raw = await mutateResource('post', NVOCC_API.jobs.podReceived(jobId));
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },
};

export const nvoccReportService = {
  async tradeLaneProfitability(params: NvoccTradeLaneReportParams = {}): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.reports.tradeLaneProfitability, { params: queryParams(params) }),
      );
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },

  async utilization(params: NvoccUtilizationReportParams = {}): Promise<Record<string, unknown>> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(NVOCC_API.reports.utilization, { params: queryParams(params) }),
      );
      return (unwrapEntity(res.data) as Record<string, unknown>) ?? {};
    } catch (error) {
      throw formatNvoccError(error);
    }
  },
};
