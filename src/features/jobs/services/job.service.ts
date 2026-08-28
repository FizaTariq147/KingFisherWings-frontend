import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { resolveSessionCompanyIdAsync } from '@/lib/resolveSessionCompanyId';
import { withGatewayRetry } from '@/lib/wakeApi';
import { enrichJobsWithDisplayNames } from '@/features/customers/utils/resolveCustomerDisplayNames';
import { ensureJobNumberFormatReady } from '@/features/organization/utils/ensureJobNumberFormat';
import { JOB_API } from '../api/job.api';
import {
  normalizeJob,
  normalizeJobs,
  normalizePaginationMeta,
  unwrapEntity,
  unwrapList,
} from '../utils/normalizeJob';
import { JOB_POST_AXIOS_CONFIG } from '../utils/buildJobCreateCandidates';
import { ensureJobBranchReady } from '../utils/ensureJobBranchReady';
import { prepareJobPayload } from '../utils/prepareJobPayload';
import type {
  AssignCargoToContainerDto,
  AssignLandTruckerDto,
  AttachLclHouseDto,
  CalculateCfsStorageDto,
  ConfirmCourierBookingDto,
  CreateBillOfLadingDto,
  CreateCourierPodDto,
  CreateDamageReportDto,
  CreateJobCargoDto,
  CreateJobChargeDto,
  CreateJobContainerDto,
  CreateJobDepositDto,
  CreateJobDocumentDto,
  CreateJobDto,
  CreateJobNoteDto,
  CreateCustomMilestoneDto,
  CreateCustomsExaminationDto,
  CreateLandPodDto,
  CreatePartDeliveryDto,
  CreatePaymentRequestFromJobDto,
  CreateProofOfDeliveryDto,
  CreateStuffingRecordDto,
  CreateSubJobDto,
  CreateTransportRequestDto,
  FinalizeJobDocumentDto,
  GenerateJobDocumentDto,
  Job,
  JobListParams,
  JobListResult,
  JobPnl,
  LclCfsStorageCalculationDto,
  LinkAirTranshipmentDto,
  LinkCourierJobDto,
  LinkLclTranshipmentDto,
  LinkLclWmsStorageDto,
  LinkTranshipmentDto,
  RecordLandBorderCrossingDto,
  RecordLandPickupDto,
  ReturnContainerDto,
  ScanCourierCheckpointDto,
  SchedulePreAlertDto,
  SendImportNoticeDto,
  SendPreAlertDto,
  SendWhatsAppStatusDto,
  SplitContainerDto,
  StorageCalculationParams,
  SubmitLclSiDto,
  SubmitSiDto,
  SubmitVgmDto,
  UpdateAirJobDetailDto,
  UpdateBillOfLadingDto,
  UpdateCourierJobDetailDto,
  UpdateCustomsStatusDto,
  UpdateJobCargoDto,
  UpdateJobChargeDto,
  UpdateJobContainerDto,
  UpdateJobDepositDto,
  UpdateJobDocumentDto,
  UpdateJobDto,
  UpdateJobMilestoneDto,
  UpdateJobNoteDto,
  UpdateLandJobDetailDto,
  UpdateSeaFclJobDetailDto,
  UpdateSeaLclJobDetailDto,
  UpdateStuffingRecordDto,
  UpsertContainerFreeDaysDto,
} from '../types/job.types';

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) return error;
  const axiosErr = error as {
    response?: {
      status?: number;
      data?: {
        message?: string | string[] | Record<string, unknown>;
        error?: string;
        details?: string | string[] | Record<string, unknown>;
        detail?: string;
        cause?: string | { message?: string };
      };
    };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const chunks: string[] = [];

  const pushMsg = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) chunks.push(value.trim());
    else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) chunks.push(item.trim());
        else if (item && typeof item === 'object') {
          const rec = item as Record<string, unknown>;
          if (typeof rec.message === 'string' && rec.message.trim()) chunks.push(rec.message.trim());
        }
      }
    } else if (value && typeof value === 'object') {
      const rec = value as Record<string, unknown>;
      if (typeof rec.message === 'string' && rec.message.trim()) chunks.push(rec.message.trim());
    }
  };

  pushMsg(data?.message);
  pushMsg(data?.error);
  pushMsg(data?.details);
  pushMsg(data?.detail);
  pushMsg(data?.cause);

  // Deduplicate while preserving order
  const unique = [...new Set(chunks.filter(Boolean))];
  if (unique.length) return new Error(unique.join(' — '));
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string): void {
  if (!id || !isUuid(id)) throw new Error('Invalid job id.');
}

function buildListQuery(params: JobListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    order: params.order ?? 'desc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status) query.status = params.status;
  if (params.job_type) query.job_type = params.job_type;
  if (params.shipper_id) query.shipper_id = params.shipper_id;
  if (params.salesperson_id) query.salesperson_id = params.salesperson_id;
  if (params.branch_id) query.branch_id = params.branch_id;
  if (params.company_id) query.company_id = params.company_id;
  if (params.origin_port_id) query.origin_port_id = params.origin_port_id;
  if (params.dest_port_id) query.dest_port_id = params.dest_port_id;
  if (typeof params.masters_only === 'boolean') query.masters_only = params.masters_only;
  if (params.parent_job_id) query.parent_job_id = params.parent_job_id;
  if (params.from_date) query.from_date = params.from_date;
  if (params.to_date) query.to_date = params.to_date;
  if (params.container_number) query.container_number = params.container_number;
  if (params.vessel_id) query.vessel_id = params.vessel_id;
  if (params.shipping_line_id) query.shipping_line_id = params.shipping_line_id;
  if (params.voyage_number) query.voyage_number = params.voyage_number;
  if (params.container_type_id) query.container_type_id = params.container_type_id;
  if (params.vehicle_number?.trim()) query.vehicle_number = params.vehicle_number.trim();
  if (params.trucker_id) query.trucker_id = params.trucker_id;
  if (params.tracking_number?.trim()) query.tracking_number = params.tracking_number.trim();
  return query;
}

async function request<T = unknown>(
  fn: () => Promise<{ data: unknown }>,
  normalize?: (raw: unknown) => T | null,
): Promise<T> {
  try {
    const res = await withGatewayRetry(fn);
    const raw = unwrapEntity(res.data);
    if (normalize) {
      const item = normalize(raw);
      if (item == null) throw new Error('No data returned.');
      return item;
    }
    return raw as T;
  } catch (error) {
    throw formatAxiosError(error);
  }
}

async function requestVoid(fn: () => Promise<unknown>): Promise<void> {
  try {
    await withGatewayRetry(fn);
  } catch (error) {
    throw formatAxiosError(error);
  }
}

export const jobService = {
  async list(params: JobListParams = {}): Promise<JobListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(JOB_API.list, { params: buildListQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      let jobs = normalizeJobs(items);
      if (params.job_types?.length && !params.job_type) {
        jobs = jobs.filter((j) => params.job_types!.includes(j.job_type));
      }
      jobs = await enrichJobsWithDisplayNames(jobs);
      return {
        jobs,
        meta: normalizePaginationMeta(meta, jobs.length, params),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.byId(id)), normalizeJob);
  },

  async create(dto: CreateJobDto): Promise<Job> {
    await ensureJobNumberFormatReady();

    const companyId = await resolveSessionCompanyIdAsync(
      typeof dto.company_id === 'string' ? dto.company_id : undefined,
    );
    const branchId = await ensureJobBranchReady(companyId || undefined);

    const dtoWithContext: CreateJobDto = {
      ...(companyId && !dto.company_id ? { ...dto, company_id: companyId } : dto),
      branch_id: branchId,
    };

    const body = prepareJobPayload(dtoWithContext);

    return request(
      () => axiosInstance.post(JOB_API.list, body, JOB_POST_AXIOS_CONFIG),
      normalizeJob,
    );
  },

  async update(id: string, dto: UpdateJobDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.byId(id), prepareJobPayload(dto)),
      normalizeJob,
    );
  },

  async softDelete(id: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.byId(id)));
  },

  async cancel(id: string): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.cancel(id)), normalizeJob);
  },

  async close(id: string): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.close(id)), normalizeJob);
  },

  async listHouseJobs(id: string): Promise<Job[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.houseJobs(id)));
    const { items } = unwrapList(res.data);
    return normalizeJobs(items);
  },

  async prorateCost(id: string, chargeCodeId: string): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.prorateCost(id, chargeCodeId)),
    );
  },

  async updateAirDetails(id: string, dto: UpdateAirJobDetailDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.airDetails(id), dto),
      normalizeJob,
    );
  },

  async updateSeaFclDetails(id: string, dto: UpdateSeaFclJobDetailDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.seaFclDetails(id), dto),
      normalizeJob,
    );
  },

  async updateSeaLclDetails(id: string, dto: UpdateSeaLclJobDetailDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.seaLclDetails(id), dto),
      normalizeJob,
    );
  },

  async submitLclSi(id: string, dto: SubmitLclSiDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.submitLclSi(id), dto), normalizeJob);
  },

  async updateCourierDetails(id: string, dto: UpdateCourierJobDetailDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.courierDetails(id), dto),
      normalizeJob,
    );
  },

  async listCourierCheckpoints(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.courierCheckpoints(id)));
    return unwrapList(res.data).items;
  },

  async confirmCourierBooking(id: string, dto: ConfirmCourierBookingDto = {}): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.courierConfirmBooking(id), dto),
      normalizeJob,
    );
  },

  async linkCourierExport(id: string, dto: LinkCourierJobDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.courierLinkExport(id), dto),
      normalizeJob,
    );
  },

  async linkCourierImport(id: string, dto: LinkCourierJobDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.courierLinkImport(id), dto),
      normalizeJob,
    );
  },

  async createCourierPod(id: string, dto: CreateCourierPodDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.courierPod(id), dto));
  },

  async scanCourierCheckpoint(id: string, dto: ScanCourierCheckpointDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.courierScanCheckpoint(id), dto));
  },

  async updateLandDetails(id: string, dto: UpdateLandJobDetailDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.landDetails(id), dto),
      normalizeJob,
    );
  },

  async assignLandTrucker(id: string, dto: AssignLandTruckerDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.landAssignTrucker(id), dto),
      normalizeJob,
    );
  },

  async recordLandPickup(id: string, dto: RecordLandPickupDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.landPickup(id), dto), normalizeJob);
  },

  async recordLandBorderCrossing(
    id: string,
    dto: RecordLandBorderCrossingDto,
  ): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.landBorderCrossing(id), dto),
      normalizeJob,
    );
  },

  async upsertLandCrossBorder(id: string, dto: UpdateLandJobDetailDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.landCrossBorder(id), dto),
      normalizeJob,
    );
  },

  async createLandPod(id: string, dto: CreateLandPodDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.landPod(id), dto));
  },

  async getLclConsolidation(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.lclConsolidation(id)));
  },

  async attachLclHouse(id: string, dto: AttachLclHouseDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclAttachHouse(id), dto),
      normalizeJob,
    );
  },

  async detachLclHouse(id: string, houseJobId: string): Promise<Job> {
    assertId(id);
    if (!houseJobId || !isUuid(houseJobId)) throw new Error('Invalid house job id.');
    return request(
      () => axiosInstance.post(JOB_API.lclDetachHouse(id, houseJobId)),
      normalizeJob,
    );
  },

  async calculateLclCfsStorage(
    id: string,
    dto: LclCfsStorageCalculationDto = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.lclCfsStorageCalculate(id), dto));
  },

  async createLclCfsStorageInvoice(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.lclCfsStorageInvoice(id)));
  },

  async linkLclTranshipment(id: string, dto: LinkLclTranshipmentDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclTranshipmentLink(id), dto),
      normalizeJob,
    );
  },

  async linkLclWmsStorage(id: string, dto: LinkLclWmsStorageDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclWmsStorageLink(id), dto),
      normalizeJob,
    );
  },

  async markLclCargoReceivedAtCfs(id: string): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclMilestoneCargoReceivedAtCfs(id)),
      normalizeJob,
    );
  },

  async markLclCfsDevanningCompleted(id: string): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclMilestoneCfsDevanningCompleted(id)),
      normalizeJob,
    );
  },

  async markLclCfsStuffingCompleted(id: string): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclMilestoneCfsStuffingCompleted(id)),
      normalizeJob,
    );
  },

  async markLclConsolidationStarted(id: string): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.lclMilestoneConsolidationStarted(id)),
      normalizeJob,
    );
  },

  async listTransportRequests(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.transportRequests(id)));
    return unwrapList(res.data).items;
  },

  async createTransportRequest(id: string, dto: CreateTransportRequestDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.transportRequests(id), dto));
  },

  async submitSi(id: string, dto: SubmitSiDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.submitSi(id), dto), normalizeJob);
  },

  async submitVgm(id: string, dto: SubmitVgmDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.submitVgm(id), dto), normalizeJob);
  },

  async getCutoffs(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.cutoffs(id)));
  },

  async listContainers(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.containers(id)));
    return unwrapList(res.data).items;
  },

  async createContainer(id: string, dto: CreateJobContainerDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.containers(id), dto));
  },

  async updateContainer(
    id: string,
    containerId: string,
    dto: UpdateJobContainerDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.container(id, containerId), dto));
  },

  async deleteContainer(id: string, containerId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.container(id, containerId)));
  },

  async listContainersFill(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.containersFill(id)));
  },

  async getContainerFill(id: string, containerId: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.containerFill(id, containerId)));
  },

  async assignCargoToContainer(
    id: string,
    containerId: string,
    dto: AssignCargoToContainerDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.assignCargo(id, containerId), dto));
  },

  async splitContainer(
    id: string,
    containerId: string,
    dto: SplitContainerDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.splitContainer(id, containerId), dto));
  },

  async returnContainer(
    id: string,
    containerId: string,
    dto: ReturnContainerDto = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.returnContainer(id, containerId), dto),
    );
  },

  async listCargo(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.cargo(id)));
    return unwrapList(res.data).items;
  },

  async createCargo(id: string, dto: CreateJobCargoDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.cargo(id), dto));
  },

  async updateCargo(id: string, cargoId: string, dto: UpdateJobCargoDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.cargoItem(id, cargoId), dto));
  },

  async deleteCargo(id: string, cargoId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.cargoItem(id, cargoId)));
  },

  async listBillsOfLading(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.billsOfLading(id)));
    return unwrapList(res.data).items;
  },

  async createBillOfLading(id: string, dto: CreateBillOfLadingDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.billsOfLading(id), dto));
  },

  async updateBillOfLading(
    id: string,
    blId: string,
    dto: UpdateBillOfLadingDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.billOfLading(id, blId), dto));
  },

  async deleteBillOfLading(id: string, blId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.billOfLading(id, blId)));
  },

  async createCharge(id: string, dto: CreateJobChargeDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.charges(id), dto));
  },

  async updateCharge(id: string, chargeId: string, dto: UpdateJobChargeDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.charge(id, chargeId), dto));
  },

  async deleteCharge(id: string, chargeId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.charge(id, chargeId)));
  },

  async getPnl(id: string): Promise<JobPnl> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.pnl(id)));
  },

  async listDeposits(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.deposits(id)));
    return unwrapList(res.data).items;
  },

  async createDeposit(id: string, dto: CreateJobDepositDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.deposits(id), dto));
  },

  async updateDeposit(
    id: string,
    depositId: string,
    dto: UpdateJobDepositDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.deposit(id, depositId), dto));
  },

  async deleteDeposit(id: string, depositId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.deposit(id, depositId)));
  },

  async listFreeDays(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.freeDays(id)));
    return unwrapList(res.data).items;
  },

  async upsertFreeDays(id: string, dto: UpsertContainerFreeDaysDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.freeDays(id), dto));
  },

  async recalculateFreeDays(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.freeDaysRecalculate(id)));
  },

  async listDamageReports(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.damageReports(id)));
    return unwrapList(res.data).items;
  },

  async createDamageReport(id: string, dto: CreateDamageReportDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.damageReports(id), dto));
  },

  async listPartDeliveries(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.partDeliveries(id)));
    return unwrapList(res.data).items;
  },

  async createPartDelivery(id: string, dto: CreatePartDeliveryDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.partDeliveries(id), dto));
  },

  async listPods(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.pods(id)));
    return unwrapList(res.data).items;
  },

  async createPod(id: string, dto: CreateProofOfDeliveryDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.pods(id), dto));
  },

  async createPaymentRequest(
    id: string,
    dto: CreatePaymentRequestFromJobDto = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.paymentRequests(id), dto));
  },

  async listSubJobs(id: string): Promise<Job[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.subJobs(id)));
    const { items } = unwrapList(res.data);
    return normalizeJobs(items);
  },

  async createSubJob(id: string, dto: CreateSubJobDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.subJobs(id), dto), normalizeJob);
  },

  async updateCustomsStatus(id: string, dto: UpdateCustomsStatusDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.customsStatus(id), dto),
      normalizeJob,
    );
  },

  async calculateCfsStorage(
    id: string,
    dto: CalculateCfsStorageDto = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.cfsStorageCalculate(id), dto));
  },

  async getStorageCalculation(
    id: string,
    params: StorageCalculationParams = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.get(JOB_API.storageCalculation(id), {
        params: params.as_of_date ? { as_of_date: params.as_of_date } : undefined,
      }),
    );
  },

  async createStorageInvoice(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.storageInvoice(id)));
  },

  async listCustomsExaminations(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() =>
      axiosInstance.get(JOB_API.customsExaminations(id)),
    );
    return unwrapList(res.data).items;
  },

  async createCustomsExamination(
    id: string,
    dto: CreateCustomsExaminationDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.customsExaminations(id), dto));
  },

  async linkAirTranshipment(id: string, dto: LinkAirTranshipmentDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.airTranshipmentLink(id), dto),
      normalizeJob,
    );
  },

  async sendImportNoticeCan(id: string, dto: SendImportNoticeDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.importNoticeCanSend(id), dto));
  },

  async sendImportNoticeDo(id: string, dto: SendImportNoticeDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.importNoticeDoSend(id), dto));
  },

  async linkTranshipment(id: string, dto: LinkTranshipmentDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.transhipmentLink(id), dto),
      normalizeJob,
    );
  },

  async listMilestones(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.milestones(id)));
    return unwrapList(res.data).items;
  },

  async createMilestone(id: string, dto: CreateCustomMilestoneDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.milestones(id), dto));
  },

  async updateMilestone(
    id: string,
    milestoneId: string,
    dto: UpdateJobMilestoneDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.milestone(id, milestoneId), dto));
  },

  async listNotes(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.notes(id)));
    return unwrapList(res.data).items;
  },

  async createNote(id: string, dto: CreateJobNoteDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.notes(id), dto));
  },

  async updateNote(id: string, noteId: string, dto: UpdateJobNoteDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.note(id, noteId), dto));
  },

  async deleteNote(id: string, noteId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.note(id, noteId)));
  },

  async listStuffingRecords(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.stuffingRecords(id)));
    return unwrapList(res.data).items;
  },

  async createStuffingRecord(id: string, dto: CreateStuffingRecordDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.stuffingRecords(id), dto));
  },

  async updateStuffingRecord(
    id: string,
    recordId: string,
    dto: UpdateStuffingRecordDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.stuffingRecord(id, recordId), dto));
  },

  async deleteStuffingRecord(id: string, recordId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.stuffingRecord(id, recordId)));
  },

  async listDocuments(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.documents(id)));
    return unwrapList(res.data).items;
  },

  async createDocument(id: string, dto: CreateJobDocumentDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.documents(id), dto));
  },

  async updateDocument(
    id: string,
    documentId: string,
    dto: UpdateJobDocumentDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.document(id, documentId), dto));
  },

  async deleteDocument(id: string, documentId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.document(id, documentId)));
  },

  async finalizeDocument(
    id: string,
    documentId: string,
    dto?: FinalizeJobDocumentDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.finalizeDocument(id, documentId), dto ?? {}),
    );
  },

  async getDocumentGenerationStatus(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.documentGenerationStatus(id)));
  },

  async generateDocument(
    id: string,
    path: string,
    dto: GenerateJobDocumentDto = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(path, dto));
  },

  generateHawb: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateHawb(id), dto),
  generateMawb: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateMawb(id), dto),
  generateHbl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateHbl(id), dto),
  generateHblExpressRelease: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateHblExpressRelease(id), dto),
  generateMbl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateMbl(id), dto),
  generateFiataBl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateFiataBl(id), dto),
  generateRiderBl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateRiderBl(id), dto),
  generateSwitchBl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateSwitchBl(id), dto),
  generateProxyBl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateProxyBl(id), dto),
  generateBackToBackBl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateBackToBackBl(id), dto),
  generateSurrenderNotice: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateSurrenderNotice(id), dto),
  generateSi: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateSi(id), dto),
  generateStuffingReport: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateStuffingReport(id), dto),
  generateSailingConfirmation: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateSailingConfirmation(id), dto),
  generateTranshipmentConfirmation: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateTranshipmentConfirmation(id), dto),
  generateCargoManifest: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateCargoManifest(id), dto),
  generateFreightManifest: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateFreightManifest(id), dto),
  generatePreAlertDoc: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generatePreAlertDoc(id), dto),
  generateJobCard: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateJobCard(id), dto),
  generateJobPnl: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateJobPnl(id), dto),
  generateProformaInvoice: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateProformaInvoice(id), dto),
  generateDeliveryOrder: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateDeliveryOrder(id), dto),
  generatePreCan: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generatePreCan(id), dto),
  generateCan: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateCan(id), dto),
  generateExchangeLetter: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateExchangeLetter(id), dto),
  generateUndertakeLetter: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateUndertakeLetter(id), dto),
  generateTransportRequest: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateTransportRequest(id), dto),
  generateShippingAdvice: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateShippingAdvice(id), dto),
  generateProofOfDelivery: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateProofOfDelivery(id), dto),
  generateEAwb: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateEAwb(id), dto),
  generateBarcodeLabel: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateBarcodeLabel(id), dto),
  generateConsigneeLabel: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateConsigneeLabel(id), dto),
  generateJobCosting: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateJobCosting(id), dto),
  generateFreightCertificate: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateFreightCertificate(id), dto),

  async sendPreAlert(id: string, dto: SendPreAlertDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.sendPreAlert(id), dto));
  },

  async schedulePreAlert(id: string, dto: SchedulePreAlertDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.schedulePreAlert(id), dto));
  },

  async sendWhatsAppStatus(id: string, dto: SendWhatsAppStatusDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.whatsappStatus(id), dto));
  },

  async convertFromQuotation(quotationId: string): Promise<Job> {
    assertId(quotationId);
    const { quotationService } = await import(
      '@/features/quotations/services/quotation.service'
    );
    const quotation = await quotationService.convertToJob(quotationId);
    if (quotation.job_id && isUuid(quotation.job_id)) {
      return this.getById(quotation.job_id);
    }
    throw new Error('Convert succeeded but no job id was returned.');
  },
};
