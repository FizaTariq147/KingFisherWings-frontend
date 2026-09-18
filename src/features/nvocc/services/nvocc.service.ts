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
        return {
          id: booking.job_id,
          job_id: booking.job_id,
          job_type: booking.job_type ?? 'NVOCC_EXPORT',
          already_linked: true,
        };
      }

      const status = String(booking.booking_status ?? '').toUpperCase().replace(/[\s-]+/g, '_');
      const isDraft = !status || status === 'DRAFT' || status === 'NEW' || status === 'PENDING';

      // Classic confirm is DRAFT-only (allocates HBL / voyage space). Gated flow bookings are
      // already past draft (e.g. INVOICE_SENT) — never call confirm for those.
      if (isDraft) {
        try {
          booking = await this.confirm(id);
        } catch (confirmErr) {
          const detail = extractAxiosErrorDetail(confirmErr).toLowerCase();
          if (!detail.includes('only draft') && !detail.includes('already')) {
            throw new Error(
              `Confirm booking failed (status: ${booking.booking_status || 'DRAFT'}). ` +
                `Confirm needs a voyage with free space. ${extractAxiosErrorDetail(confirmErr)}`,
            );
          }
        }
      }

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
            shipperId = booking.shipper_id && isUuid(booking.shipper_id) ? booking.shipper_id : shipperId;
          } catch {
            /* still use resolved id for fallback create */
          }
        }
      }

      const body: ConvertNvoccBookingToJobDto = {
        ...dto,
        company_id: companyId,
        branch_id: branchId,
      };

      try {
        const raw = await mutateResource(
          'post',
          NVOCC_API.bookings.convertToJob(id),
          prepareNvoccPayload(body),
        );
        return (raw as Record<string, unknown>) ?? {};
      } catch (convertErr) {
        const convertStatus = (convertErr as { response?: { status?: number } })?.response?.status;
        if (convertStatus !== 500) throw convertErr;

        // Same class of failure as quotation convert — try direct POST /jobs so Ops can continue.
        if (!shipperId || !isUuid(shipperId)) {
          shipperId = await resolveShipperIdForBooking(booking);
        }
        if (!shipperId || !isUuid(shipperId)) {
          throw new Error(
            `Convert to job crashed on the API (NvoccBookingsController_convertToJob). ` +
              `Could not resolve a shipper party for fallback job create. Add a SHIPPER name on the ` +
              `booking form (or link a Customer party), then retry. ` +
              `Booking status: ${booking.booking_status || 'unknown'}.`,
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
        let lastCreateError = extractAxiosErrorDetail(convertErr);
        for (const candidate of candidates) {
          try {
            const res = await withGatewayRetry(() =>
              axiosInstance.post(JOB_API.list, candidate, JOB_POST_AXIOS_CONFIG),
            );
            const job = normalizeJob(unwrapJobEntity(res.data));
            if (job?.id) {
              return {
                ...job,
                id: job.id,
                job_id: job.id,
                job_type: job.job_type ?? jobType,
                fallback_from_booking: true,
                booking_id: booking.id,
              };
            }
          } catch (createErr) {
            lastCreateError = extractAxiosErrorDetail(createErr);
          }
        }

        throw new Error(
          `Convert to job failed (NvoccBookingsController_convertToJob HTTP 500) and fallback ` +
            `POST /jobs also failed (JobsController_create). ${lastCreateError}`,
        );
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
      const raw = await mutateResource(
        'post',
        NVOCC_API.jobs.containerRequests(jobId),
        prepareNvoccPayload(dto),
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
