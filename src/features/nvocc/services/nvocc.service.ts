import { axiosInstance } from '@/lib/axios';
import { withGatewayRetry } from '@/lib/wakeApi';
import type {
  GenerateJobDocumentDto,
  SendPreAlertDto,
} from '@/features/jobs/types/job.types';
import { NVOCC_API } from '../api/nvocc.api';
import type {
  AssignLoadListContainerDto,
  ConvertNvoccBookingToJobDto,
  CopyNvoccVoyageDto,
  CreateNvoccBookingDto,
  CreateNvoccEnquiryDto,
  CreateNvoccTariffDto,
  CreateNvoccVoyageDto,
  ListResult,
  MarkNvoccEnquiryLostDto,
  NvoccBooking,
  NvoccBookingListParams,
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
  RecordNvoccMblReceivedDto,
  SendCutoffReminderDto,
  SendNvoccRateDto,
  UpdateNvoccBookingDto,
  UpdateNvoccEnquiryDto,
  UpdateNvoccLoadListItemDto,
  UpdateNvoccTariffDto,
  UpdateNvoccVoyageDto,
} from '../types/nvocc.types';
import {
  normalizeMany,
  normalizeNvoccBooking,
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
  method: 'post' | 'patch' | 'delete',
  path: string,
  body?: object,
): Promise<unknown> {
  const res = await withGatewayRetry(() => {
    if (method === 'delete') return axiosInstance.delete(path);
    if (method === 'patch') return axiosInstance.patch(path, body);
    return axiosInstance.post(path, body);
  });
  return unwrapEntity(res.data);
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
      const raw = await mutateResource(
        'post',
        NVOCC_API.bookings.convertToJob(id),
        prepareNvoccPayload(dto),
      );
      return (raw as Record<string, unknown>) ?? {};
    } catch (error) {
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
