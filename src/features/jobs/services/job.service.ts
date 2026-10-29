import { axiosInstance } from '@/lib/axios';
import { clampApiListLimit } from '@/lib/apiListLimit';
import { isUuid } from '@/lib/isUuid';
import { resolveSessionCompanyIdAsync } from '@/lib/resolveSessionCompanyId';
import { withGatewayRetry } from '@/lib/wakeApi';
import { enrichJobsWithDisplayNames } from '@/features/customers/utils/resolveCustomerDisplayNames';
import { ensureJobNumberFormatReady } from '@/features/organization/utils/ensureJobNumberFormat';
import { JOB_API } from '../api/job.api';
import {
  normalizeAirUldRequest,
  normalizeDeliveryAcknowledgement,
  normalizeJob,
  normalizeJobCharges,
  normalizeJobPnl,
  normalizeJobs,
  normalizeJobStatusOptions,
  normalizePaginationMeta,
  unwrapEntity,
  unwrapList,
} from '../utils/normalizeJob';
import {
  normalizeJobDashboardCounts,
  normalizeTeamWorkload,
} from '../utils/normalizeJobDashboard';
import type {
  JobDashboardCounts,
  JobDashboardPeriodParams,
  TeamWorkloadRow,
} from '../types/jobDashboard.types';
import { jobDashboardQueryParams } from '../types/jobDashboard.types';
import { JOB_POST_AXIOS_CONFIG } from '../utils/buildJobCreateCandidates';
import { ensureJobBranchReady } from '../utils/ensureJobBranchReady';
import { prepareJobPayload } from '../utils/prepareJobPayload';
import { getErrorMessage } from '../utils/getErrorMessage';
import { normalizeCode128Value } from '../utils/scannableBarcode';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import { jobDetailTabLabel, toApiDetailTabKey } from '../utils/jobDetailTabs';
import { resolveJobDocumentFileUrl } from '../utils/resolveJobDocumentFileUrl';

function jobDetailTabLabelSafe(key: string): string {
  try {
    return jobDetailTabLabel(key);
  } catch {
    return key.replace(/[-_]+/g, ' ');
  }
}
import type {
  AssignCargoToContainerDto,
  AssignLandTruckerDto,
  AssignRoadFreightTruckerDto,
  AttachLclHouseDto,
  CalculateCfsStorageDto,
  CalculateStorageChargesDto,
  ChangeJobStatusDto,
  ConfirmCourierBookingDto,
  ConfirmStorageChargesDto,
  CreateBillOfLadingDto,
  CreateJobChargeAttachmentDto,
  CreateCourierPodDto,
  CreateDamageReportDto,
  CreateJobCargoDto,
  CopyJobChargesDto,
  CreateJobChargeDto,
  CreateJobChargesCompositeDto,
  CreateJobInvoiceFromCostingDto,
  GetJobChargesDto,
  GetJobChargesFromShipmentDto,
  JobCharge,
  JobInvoiceFormPreview,
  JobInvoiceFormSaveDto,
  PatchJobChargeSideDto,
  PatchJobClosedOverridesDto,
  ProfitShareAddDto,
  ProfitSharePreviewDto,
  ProrateToShipmentsDto,
  UpsertJobReferencesDto,
  CreateJobContainerDto,
  CreateJobDepositDto,
  CreateJobDocumentDto,
  CreateJobDto,
  CreateJobNoteDto,
  CreateCustomMilestoneDto,
  CreateCustomsExaminationDto,
  CreateLandPodDto,
  CreateRoadFreightPodDto,
  CreatePartDeliveryDto,
  CreatePaymentRequestFromJobDto,
  CreateProofOfDeliveryDto,
  DeliveryAcknowledgement,
  CreateStuffingRecordDto,
  CreateSubJobDto,
  CreateTransportRequestDto,
  FinalizeJobDocumentDto,
  GenerateJobDocumentDto,
  GenerateJobVoucherDto,
  Job,
  JobChangeStatusResult,
  JobChargeAttachment,
  JobListParams,
  JobListResult,
  JobPnl,
  JobStatusOption,
  PatchJobDimensionsDto,
  PutJobGpumDto,
  ReopenJobDto,
  StopJobDto,
  UpsertJobPartyReferenceDto,
  LclCfsStorageCalculationDto,
  LinkAirTranshipmentDto,
  LinkCourierJobDto,
  LinkLclTranshipmentDto,
  LinkLclWmsStorageDto,
  LinkTranshipmentDto,
  RecordLandBorderCrossingDto,
  RecordLandPickupDto,
  RecordRoadFreightBorderCrossingDto,
  RecordRoadFreightPickupDto,
  ReturnContainerDto,
  ScanCourierCheckpointDto,
  ScanJobBarcodeDto,
  SchedulePreAlertDto,
  SendImportNoticeDto,
  SendPreAlertDto,
  SendWhatsAppStatusDto,
  SplitContainerDto,
  StorageCalculationParams,
  SubmitLclSiDto,
  SubmitSiDto,
  SubmitVgmDto,
  AirBookingForm,
  AirComplianceForm,
  AirUldRequest,
  AirWorkflowActionDto,
  CreateAirUldRequestDto,
  UpdateAirBookingFormDto,
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
  UpdateRoadFreightJobDetailDto,
  UpsertAirComplianceBookingFormDto,
  UpsertCourierBookingFormDto,
  UpsertLandBookingFormDto,
  UpsertRoadFreightBookingFormDto,
  UpsertSeaFclBookingFormDto,
  UpsertSeaLclBookingFormDto,
  UpsertWarehouseBookingFormDto,
  UpsertCustomsClearanceBookingFormDto,
  ModeBookingForm,
  UpdateSeaFclJobDetailDto,
  UpdateSeaLclJobDetailDto,
  UpdateStuffingRecordDto,
  UpsertContainerFreeDaysDto,
  UpsertJobDimensionLineDto,
  PatchJobDepartmentDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
  UpsertJobCustomsRefDto,
  AddJobOrganizationDto,
  ReplaceJobOrganizationDto,
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
    limit: clampApiListLimit(params.limit, 20),
    order: params.order ?? 'desc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status) query.status = params.status;
  // Never send job_type=ROAD_FREIGHT — backend ACL returns 403 for many roles.
  if (
    params.job_type &&
    canonicalizeJobType(String(params.job_type)) !== 'ROAD_FREIGHT'
  ) {
    query.job_type = params.job_type;
  }
  if (params.shipper_id) query.shipper_id = params.shipper_id;
  if (params.consignee_id) query.consignee_id = params.consignee_id;
  if (params.salesperson_id) query.salesperson_id = params.salesperson_id;
  if (params.branch_id) query.branch_id = params.branch_id;
  if (params.company_id) query.company_id = params.company_id;
  if (params.department_id) query.department_id = params.department_id;
  if (params.created_by) query.created_by = params.created_by;
  if (params.origin_port_id) query.origin_port_id = params.origin_port_id;
  if (params.dest_port_id) query.dest_port_id = params.dest_port_id;
  if (typeof params.masters_only === 'boolean') query.masters_only = params.masters_only;
  if (params.parent_job_id) query.parent_job_id = params.parent_job_id;
  if (params.date_field) query.date_field = params.date_field;
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

function jobSortTime(job: Job): number {
  const raw = job.updated_at || job.created_at || '';
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

async function fetchJobListPage(
  params: JobListParams,
  opts?: { skipErrorToast?: boolean },
): Promise<JobListResult> {
  const res = await withGatewayRetry(() =>
    axiosInstance.get<unknown>(JOB_API.list, {
      params: buildListQuery(params),
      ...(opts?.skipErrorToast ? { skipErrorToast: true } : {}),
    }),
  );
  const { items, meta } = unwrapList(res.data);
  const jobs = await enrichJobsWithDisplayNames(normalizeJobs(items));
  return {
    jobs,
    meta: normalizePaginationMeta(meta, jobs.length, params),
  };
}

/** Soft ACL config — suppresses toast while callers fall back (e.g. ROAD → LAND). */
const SOFT_ACL_AXIOS = { skipErrorToast: true } as const;

/**
 * Run a ROAD_FREIGHT request; on job-type ACL 403, retry with the LAND parity fn.
 */
async function withRoadLandAclFallback<T>(
  roadFn: () => Promise<T>,
  landFn: () => Promise<T>,
): Promise<T> {
  try {
    return await roadFn();
  } catch (error) {
    if (!isJobTypeAccessError(error)) throw error;
    return landFn();
  }
}

function asModeBookingForm(raw: unknown): ModeBookingForm {
  const data = unwrapEntity(raw) ?? raw;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    const statusToken = String(
      record.status ?? record.form_status ?? record.formStatus ?? record.state ?? '',
    )
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const markComplete =
      record.mark_complete === true ||
      record.markComplete === true ||
      record.completed === true ||
      record.is_complete === true ||
      record.isComplete === true ||
      statusToken === 'COMPLETED' ||
      statusToken === 'COMPLETE' ||
      statusToken === 'BOOKING_FORM_COMPLETE' ||
      statusToken.includes('COMPLETE');
    return {
      ...(data as ModeBookingForm),
      mark_complete: markComplete || Boolean((data as ModeBookingForm).mark_complete),
      consent_accepted:
        record.consent_accepted === true ||
        record.consentAccepted === true ||
        Boolean((data as ModeBookingForm).consent_accepted),
    };
  }
  return {};
}

async function putModeBookingFormRequest(
  url: string,
  dto: Record<string, unknown>,
): Promise<ModeBookingForm> {
  const res = await withGatewayRetry(() => axiosInstance.put(url, dto));
  return asModeBookingForm(res.data);
}

/** GET mode booking form — 404 / “not found” means not created yet; return empty for upsert UX. */
async function getModeBookingForm(
  url: string,
  opts?: { skipErrorToast?: boolean },
): Promise<ModeBookingForm> {
  try {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(url, opts?.skipErrorToast ? SOFT_ACL_AXIOS : undefined),
    );
    return asModeBookingForm(res.data);
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const msg = getErrorMessage(error).toLowerCase();
    if (
      status === 404 ||
      /booking not found|booking form not found|form not found/.test(msg)
    ) {
      return {};
    }
    // Preserve axios shape so ROAD → LAND ACL fallback can detect 403.
    if (isJobTypeAccessError(error)) throw error;
    throw formatAxiosError(error);
  }
}

function isJobTypeAccessError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const msg = getErrorMessage(error).toLowerCase();
  return (
    status === 403 ||
    status === 401 ||
    /do not have access|forbidden|missing required permission/i.test(msg)
  );
}

function emptyJobListResult(limit: number): JobListResult {
  return {
    jobs: [],
    meta: { page: 1, limit, total: 0, totalPages: 1 },
  };
}

/**
 * Backend job-type ACL often blocks GET /jobs?job_type=ROAD_FREIGHT (and may strip
 * ROAD_FREIGHT from unfiltered lists). Converted quotes still expose job_id and/or
 * job_number (portal shows JOB-RF-*) — resolve those into Job rows for admin lists.
 */
async function findJobByRef(ref: string): Promise<Job | null> {
  const token = String(ref ?? '').trim();
  if (!token) return null;

  if (isUuid(token)) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(JOB_API.byId(token), SOFT_ACL_AXIOS),
      );
      return normalizeJob(res.data);
    } catch {
      /* try search / barcode below */
    }
  }

  try {
    const listed = await fetchJobListPage(
      {
        search: token,
        page: 1,
        limit: 20,
        order: 'desc',
      },
      { skipErrorToast: true },
    );
    const upper = token.toUpperCase();
    const exact =
      listed.jobs.find(
        (j) =>
          String(j.job_number ?? '')
            .trim()
            .toUpperCase() === upper || j.id === token,
      ) ?? listed.jobs[0];
    if (exact) return exact;
  } catch {
    /* continue */
  }

  try {
    const res = await withGatewayRetry(() =>
      axiosInstance.get<unknown>(JOB_API.byBarcode(token), SOFT_ACL_AXIOS),
    );
    return normalizeJob(res.data);
  } catch {
    return null;
  }
}

async function hydrateJobsFromConvertedQuotes(
  existing: Job[],
  typesToHydrate: Array<NonNullable<JobListParams['job_type']>>,
): Promise<Job[]> {
  if (!typesToHydrate.length) return existing;
  const byId = new Map(existing.map((j) => [j.id, j]));
  const byNumber = new Map(
    existing
      .filter((j) => j.job_number?.trim())
      .map((j) => [String(j.job_number).trim().toUpperCase(), j] as const),
  );
  const wanted = new Set(typesToHydrate.map((t) => canonicalizeJobType(String(t))));

  const remember = (job: Job, forceType?: Job['job_type']) => {
    const next =
      forceType && job.job_type !== forceType ? { ...job, job_type: forceType } : job;
    byId.set(next.id, next);
    const num = String(next.job_number ?? '')
      .trim()
      .toUpperCase();
    if (num) byNumber.set(num, next);
  };

  try {
    const { quotationService } = await import(
      '@/features/quotations/services/quotation.service'
    );

    type QuoteRow = {
      id: string;
      job_id?: string;
      job_number?: string;
      job_type?: string;
      quotation_number?: string;
      quote_no?: string;
      customer_id?: string;
      customer_name?: string;
      company_id?: string;
      branch_id?: string;
      commodity?: string;
      created_at?: string;
      updated_at?: string;
      status?: string;
    };

    // Only CONVERTED quotes — APPROVED may still have provisional job_id before Generate Job.
    const quoteBatches = await Promise.all(
      typesToHydrate.map(async (job_type) => {
        try {
          const page = await quotationService.list({
            page: 1,
            limit: 100,
            job_type: job_type as never,
            status: 'CONVERTED',
            order: 'desc',
          });
          return page.quotations as QuoteRow[];
        } catch {
          return [] as QuoteRow[];
        }
      }),
    );

    try {
      const converted = await quotationService.list({
        page: 1,
        limit: 100,
        status: 'CONVERTED',
        order: 'desc',
      });
      quoteBatches.push(converted.quotations);
    } catch {
      /* ignore */
    }

    const seenQuote = new Set<string>();
    for (const batch of quoteBatches) {
      for (const q of batch) {
        if (seenQuote.has(q.id)) continue;
        seenQuote.add(q.id);

        let qType = canonicalizeJobType(q.job_type);
        if (!wanted.has(qType)) continue;

        let jobId = String(q.job_id ?? '').trim();
        let jobNumber = String(q.job_number ?? '').trim();

        // List payloads often omit converted_job_number — detail has what portal shows.
        const statusTok = String(q.status ?? '')
          .trim()
          .toUpperCase();
        // Continuum: only surface jobs from CONVERTED quotes (post Generate Job / convert).
        if (statusTok && statusTok !== 'CONVERTED') continue;
        if (!jobId && !jobNumber && statusTok === 'CONVERTED') {
          try {
            const detail = await quotationService.getById(q.id);
            jobId = String(detail.job_id ?? '').trim();
            jobNumber = String(detail.job_number ?? '').trim();
            qType = canonicalizeJobType(detail.job_type || q.job_type);
            if (!wanted.has(qType)) continue;
          } catch {
            continue;
          }
        }
        if (!jobId && !jobNumber) continue;

        const alreadyById = Boolean(jobId && byId.has(jobId));
        const alreadyByNumber = Boolean(
          jobNumber && byNumber.has(jobNumber.toUpperCase()),
        );
        if (alreadyById || alreadyByNumber) {
          const existingJob =
            (jobId && byId.get(jobId)) ||
            (jobNumber ? byNumber.get(jobNumber.toUpperCase()) : undefined);
          if (
            existingJob &&
            qType === 'ROAD_FREIGHT' &&
            existingJob.job_type !== 'ROAD_FREIGHT'
          ) {
            remember(existingJob, 'ROAD_FREIGHT');
          }
          continue;
        }

        const refs = [jobId, jobNumber].filter(Boolean);
        let found: Job | null = null;
        for (const ref of refs) {
          found = await findJobByRef(ref);
          if (found) break;
        }

        if (found) {
          remember(found, qType === 'ROAD_FREIGHT' ? 'ROAD_FREIGHT' : undefined);
        }
      }
    }
  } catch {
    /* non-fatal */
  }

  return [...byId.values()];
}

/** Unfiltered GET /jobs then keep only the requested types (canonicalized). */
async function fetchJobsFilteredByTypes(
  params: JobListParams,
  types: Array<NonNullable<JobListParams['job_type']>>,
): Promise<JobListResult> {
  const page = params.page ?? 1;
  const limit = clampApiListLimit(params.limit, 20);
  const order = params.order ?? 'desc';
  const pull = clampApiListLimit(Math.max(limit * page * Math.max(types.length, 1), limit), 100);
  const unfiltered = await fetchJobListPage({
    ...params,
    job_type: undefined,
    job_types: undefined,
    page: 1,
    limit: pull,
  });
  const allowed = new Set(types.map((t) => canonicalizeJobType(String(t))));
  const filtered = unfiltered.jobs.filter((j) =>
    allowed.has(canonicalizeJobType(String(j.job_type ?? ''))),
  );
  const merged = [...filtered].sort((a, b) => {
    const diff = jobSortTime(a) - jobSortTime(b);
    return order === 'asc' ? diff : -diff;
  });
  const start = (page - 1) * limit;
  const slice = merged.slice(start, start + limit);
  return {
    jobs: slice,
    meta: {
      page,
      limit,
      total: merged.length,
      totalPages: Math.max(1, Math.ceil(merged.length / limit) || 1),
    },
  };
}

export const jobService = {
  /**
   * GET /jobs — API accepts a single `job_type` query.
   * Segment lists pass `job_types` (e.g. ROAD_FREIGHT + LAND); we fan out per type
   * and merge so converted road jobs are not lost behind other modes on page 1.
   * Soft-failed types (403 ROAD_FREIGHT ACL) are recovered via unfiltered list + filter.
   */
  async list(params: JobListParams = {}): Promise<JobListResult> {
    try {
      // Never send job_type=ROAD_FREIGHT — backend ACL returns 403 for many roles.
      // Recover ROAD jobs via unfiltered list + quotation hydrate instead.
      const requestedType = params.job_type
        ? canonicalizeJobType(String(params.job_type))
        : undefined;
      const safeParams: JobListParams =
        requestedType === 'ROAD_FREIGHT'
          ? { ...params, job_type: undefined }
          : params;

      const multiTypesRaw =
        !safeParams.job_type && safeParams.job_types?.length
          ? [...new Set(safeParams.job_types)]
          : requestedType === 'ROAD_FREIGHT'
            ? (['ROAD_FREIGHT'] as JobListParams['job_types'])
            : null;
      const multiTypes = multiTypesRaw
        ? multiTypesRaw.filter((t) => canonicalizeJobType(String(t)) !== 'ROAD_FREIGHT')
        : null;
      const wantsRoadFreight =
        requestedType === 'ROAD_FREIGHT' ||
        Boolean(
          params.job_types?.some((t) => canonicalizeJobType(String(t)) === 'ROAD_FREIGHT'),
        );

      const paginate = (jobs: Job[]): JobListResult => {
        const page = params.page ?? 1;
        const limit = clampApiListLimit(params.limit, 20);
        const order = params.order ?? 'desc';
        const merged = [...jobs].sort((a, b) => {
          const diff = jobSortTime(a) - jobSortTime(b);
          return order === 'asc' ? diff : -diff;
        });
        const start = (page - 1) * limit;
        const slice = merged.slice(start, start + limit);
        return {
          jobs: slice,
          meta: {
            page,
            limit,
            total: merged.length,
            totalPages: Math.max(1, Math.ceil(merged.length / limit) || 1),
          },
        };
      };

      const hydrateTypes = (
        types: Array<NonNullable<JobListParams['job_type']>>,
      ): Array<NonNullable<JobListParams['job_type']>> => {
        const set = new Set(types.map((t) => canonicalizeJobType(String(t))));
        if (wantsRoadFreight) set.add('ROAD_FREIGHT');
        return [...set];
      };

      if (multiTypes && multiTypes.length === 0 && wantsRoadFreight) {
        // Only ROAD_FREIGHT requested — never call typed ROAD endpoint.
        let result = emptyJobListResult(clampApiListLimit(params.limit, 20));
        try {
          result = await fetchJobsFilteredByTypes(safeParams, ['ROAD_FREIGHT']);
        } catch {
          /* empty */
        }
        const hydrated = await hydrateJobsFromConvertedQuotes(result.jobs, ['ROAD_FREIGHT']);
        return paginate(hydrated);
      }

      if (multiTypes && multiTypes.length === 1) {
        let result: JobListResult;
        try {
          result = await fetchJobListPage(
            {
              ...safeParams,
              job_type: multiTypes[0],
              job_types: undefined,
            },
            { skipErrorToast: true },
          );
        } catch (err) {
          if (isJobTypeAccessError(err)) {
            try {
              result = await fetchJobsFilteredByTypes(safeParams, hydrateTypes(multiTypes));
            } catch {
              result = emptyJobListResult(clampApiListLimit(params.limit, 20));
            }
          } else {
            throw err;
          }
        }
        const hydrated = await hydrateJobsFromConvertedQuotes(
          result.jobs,
          hydrateTypes(multiTypes),
        );
        const allowed = new Set(hydrateTypes(multiTypes).map(String));
        return paginate(
          hydrated.filter((j) => allowed.has(canonicalizeJobType(String(j.job_type ?? '')))),
        );
      }

      if (multiTypes && multiTypes.length > 1) {
        const page = params.page ?? 1;
        const limit = clampApiListLimit(params.limit, 20);
        const perTypeLimit = clampApiListLimit(Math.max(limit * page, limit), 100);

        const fetchTypePage = async (
          job_type: NonNullable<JobListParams['job_type']>,
        ): Promise<JobListResult> => {
          try {
            return await fetchJobListPage(
              {
                ...safeParams,
                job_type,
                job_types: undefined,
                page: 1,
                limit: perTypeLimit,
              },
              { skipErrorToast: true },
            );
          } catch (err) {
            if (isJobTypeAccessError(err)) {
              return emptyJobListResult(perTypeLimit);
            }
            throw err;
          }
        };

        const pages = await Promise.all(multiTypes.map((job_type) => fetchTypePage(job_type)));

        try {
          const recovered = await fetchJobsFilteredByTypes(
            safeParams,
            hydrateTypes(multiTypes),
          );
          pages.push(recovered);
        } catch {
          /* keep typed pages */
        }

        const byId = new Map<string, Job>();
        for (const pageResult of pages) {
          for (const job of pageResult.jobs) {
            if (!byId.has(job.id)) byId.set(job.id, job);
          }
        }

        const allowed = new Set(hydrateTypes(multiTypes).map((t) => String(t)));
        let merged = [...byId.values()].filter((j) =>
          allowed.has(canonicalizeJobType(String(j.job_type ?? ''))),
        );

        merged = await hydrateJobsFromConvertedQuotes(merged, hydrateTypes(multiTypes));
        merged = merged.filter((j) =>
          allowed.has(canonicalizeJobType(String(j.job_type ?? ''))),
        );

        return paginate(merged);
      }

      const base = await fetchJobListPage(safeParams, { skipErrorToast: wantsRoadFreight });
      if (wantsRoadFreight || !safeParams.job_type) {
        const hydrated = await hydrateJobsFromConvertedQuotes(base.jobs, ['ROAD_FREIGHT']);
        if (requestedType === 'ROAD_FREIGHT') {
          return paginate(
            hydrated.filter(
              (j) => canonicalizeJobType(String(j.job_type ?? '')) === 'ROAD_FREIGHT',
            ),
          );
        }
        if (!safeParams.job_type && hydrated.length !== base.jobs.length) {
          const byId = new Map(base.jobs.map((j) => [j.id, j]));
          for (const j of hydrated) {
            if (!byId.has(j.id)) byId.set(j.id, j);
          }
          return paginate([...byId.values()]);
        }
      }

      return base;
    } catch (error) {
      if (isJobTypeAccessError(error)) {
        // Last resort: never surface ROAD_FREIGHT ACL as a hard list failure.
        try {
          const recovered = await fetchJobsFilteredByTypes(
            { ...params, job_type: undefined },
            params.job_types?.length
              ? params.job_types
              : (['ROAD_FREIGHT', 'LAND', 'COURIER'] as JobListParams['job_types'])!,
          );
          const hydrated = await hydrateJobsFromConvertedQuotes(
            recovered.jobs,
            (params.job_types?.length
              ? params.job_types
              : ['ROAD_FREIGHT', 'LAND', 'COURIER']) as Array<
              NonNullable<JobListParams['job_type']>
            >,
          );
          const page = params.page ?? 1;
          const limit = clampApiListLimit(params.limit, 20);
          const order = params.order ?? 'desc';
          const merged = [...hydrated].sort((a, b) => {
            const diff = jobSortTime(a) - jobSortTime(b);
            return order === 'asc' ? diff : -diff;
          });
          const start = (page - 1) * limit;
          return {
            jobs: merged.slice(start, start + limit),
            meta: {
              page,
              limit,
              total: merged.length,
              totalPages: Math.max(1, Math.ceil(merged.length / limit) || 1),
            },
          };
        } catch {
          return emptyJobListResult(clampApiListLimit(params.limit, 20));
        }
      }
      throw formatAxiosError(error);
    }
  },

  async dashboardCounts(params: JobDashboardPeriodParams = {}): Promise<JobDashboardCounts> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(JOB_API.dashboardCounts, {
          params: jobDashboardQueryParams(params),
        }),
      );
      return normalizeJobDashboardCounts(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async teamWorkload(params: JobDashboardPeriodParams = {}): Promise<TeamWorkloadRow[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(JOB_API.teamWorkload, {
          params: jobDashboardQueryParams(params),
        }),
      );
      return normalizeTeamWorkload(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 501) return [];
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.byId(id)), normalizeJob);
  },

  /**
   * GET /jobs/:id/detail — Fresa header/tabs/actions/links; falls back to GET /jobs/:id.
   * `tabs` come only from the detail envelope (never from basic GET /jobs/:id).
   * Each tab key is used for GET /jobs/:id/detail/:tab.
   */
  async getDetail(id: string): Promise<Job> {
    assertId(id);
    const basic = await this.getById(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.detail(id)));
      const root = unwrapEntity(res.data) ?? res.data;
      const rootRec =
        root && typeof root === 'object' && !Array.isArray(root)
          ? (root as Record<string, unknown>)
          : null;
      if (!rootRec) return { ...basic, tabs: undefined };

      const nestedJob =
        (rootRec.job && typeof rootRec.job === 'object' && !Array.isArray(rootRec.job)
          ? (rootRec.job as Record<string, unknown>)
          : null) ||
        (rootRec.detail && typeof rootRec.detail === 'object' && !Array.isArray(rootRec.detail)
          ? (rootRec.detail as Record<string, unknown>)
          : null) ||
        (rootRec.header && typeof rootRec.header === 'object' && !Array.isArray(rootRec.header)
          ? (rootRec.header as Record<string, unknown>)
          : null);

      const tabsRaw = rootRec.tabs ?? nestedJob?.tabs;
      const actionsRaw = rootRec.actions ?? nestedJob?.actions;

      const merged: Record<string, unknown> = {
        ...basic,
        ...(nestedJob ?? {}),
        // Prefer root-level Fresa chrome fields when present.
        ...(rootRec.id || nestedJob ? {} : rootRec),
        id: basic.id,
        tabs: tabsRaw,
        actions: actionsRaw,
        header: rootRec.header ?? nestedJob?.header,
        links: rootRec.links ?? nestedJob?.links,
      };
      // When job fields live on the root (not nested), fold them in without wiping tabs/actions.
      if (!nestedJob && rootRec.id) {
        Object.assign(merged, rootRec, {
          id: basic.id,
          tabs: rootRec.tabs ?? tabsRaw,
          actions: rootRec.actions ?? actionsRaw,
        });
      }

      const enriched = normalizeJob(merged);
      if (enriched) {
        return {
          ...basic,
          ...enriched,
          id: basic.id,
          // Never keep tabs from basic GET /jobs/:id — only detail API.
          tabs: enriched.tabs,
        };
      }
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== 404 && status !== 501) throw formatAxiosError(error);
    }
    return { ...basic, tabs: undefined };
  },

  /** GET /jobs/:id/detail/:tab — form-ready payload (exact API tab key). */
  async getDetailTab(id: string, tab: string): Promise<Record<string, unknown>> {
    assertId(id);
    const key = toApiDetailTabKey(tab);
    if (!key) throw new Error('Tab key is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.detailTab(id, key)),
      );
      const payload = unwrapEntity(res.data);
      if (Array.isArray(payload)) return { items: payload };
      if (payload && typeof payload === 'object') {
        const rec = payload as Record<string, unknown>;
        const nested =
          (rec.data && typeof rec.data === 'object' ? rec.data : null) ||
          (rec.content && typeof rec.content === 'object' ? rec.content : null) ||
          (rec.payload && typeof rec.payload === 'object' ? rec.payload : null);
        if (Array.isArray(nested)) return { ...rec, items: nested };
        if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
          return { ...rec, ...(nested as Record<string, unknown>) };
        }
        return rec;
      }
      if (payload != null && payload !== '') return { value: payload };
      return {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * Show All — only tabs from GET /jobs/:id/detail `tabs` (siblingTabKeys).
   * Uses exact key for dedicated show_all when present, then aggregates every other
   * sibling via GET /jobs/:id/detail/:tab. No hardcoded tab inventory.
   */
  async getShowAll(
    id: string,
    siblingTabKeys: string[] = [],
  ): Promise<{
    sections: Array<{ key: string; title: string; data: Record<string, unknown> }>;
    arrays: Array<{ key: string; title: string; rows: unknown[] }>;
  }> {
    assertId(id);

    const sections: Array<{ key: string; title: string; data: Record<string, unknown> }> = [];
    const arrays: Array<{ key: string; title: string; rows: unknown[] }> = [];

    const isMetaField = (k: string) => {
      const n = k.trim().toLowerCase().replace(/[-_\s]/g, '');
      return (
        n === 'opscontinuum' ||
        n === 'continuum' ||
        n === 'pathhints' ||
        n === 'pathhint' ||
        n === 'hints' ||
        n === 'canopscontinuum'
      );
    };

    const stripMetaFields = (
      data: Record<string, unknown> | null | undefined,
    ): Record<string, unknown> | null => {
      if (!data) return null;
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (isMetaField(k)) continue;
        out[k] = v;
      }
      return Object.keys(out).length ? out : null;
    };

    const pushSection = (
      key: string,
      title: string,
      data: Record<string, unknown> | null | undefined,
    ) => {
      if (isMetaField(key) || isMetaField(title)) return;
      const cleaned = stripMetaFields(data);
      if (!cleaned || !Object.keys(cleaned).length) return;
      sections.push({ key, title, data: cleaned });
    };
    const pushArray = (key: string, title: string, rows: unknown[]) => {
      if (!rows.length || isMetaField(key)) return;
      arrays.push({ key, title, rows });
    };

    const isShowAll = (k: string) => {
      const n = k.trim().toLowerCase().replace(/-/g, '_');
      return n === 'show_all' || n === 'showall';
    };

    const normalizedSiblings = Array.from(
      new Set(siblingTabKeys.map((k) => toApiDetailTabKey(k)).filter(Boolean)),
    );

    const showAllKey = normalizedSiblings.find((k) => isShowAll(k));
    if (showAllKey) {
      try {
        const data = await this.getDetailTab(id, showAllKey);
        pushSection(`api-${showAllKey}`, jobDetailTabLabelSafe(showAllKey), data);
      } catch {
        /* aggregate siblings below */
      }
    }

    const isMetaTab = isMetaField;

    /** Skip interactive tabs — their dedicated panels own the UX (not UUID dumps). */
    const skipShowAllTabs = new Set([
      'costing',
      'history',
      'planned_container',
      'actual_container',
      'booking_form',
      'shipments',
    ]);
    const tabKeys = normalizedSiblings.filter(
      (k) => !isShowAll(k) && !isMetaTab(k) && !skipShowAllTabs.has(k),
    );
    await Promise.all(
      tabKeys.map(async (tab) => {
        try {
          const data = await this.getDetailTab(id, tab);
          const title = jobDetailTabLabelSafe(tab);
          const root = { ...data };
          let pushedChargeLike = false;
          for (const [k, v] of Object.entries(data)) {
            if (!Array.isArray(v)) continue;
            delete root[k];
            const isChargeLike = /charge|line/i.test(k);
            if (isChargeLike) {
              if (pushedChargeLike) continue;
              pushedChargeLike = true;
              pushArray(`${tab}-charges`, `${title} · Charges`, v);
              continue;
            }
            pushArray(`${tab}-${k}`, `${title} · ${k.replace(/[-_]/g, ' ')}`, v);
          }
          pushSection(tab, title, root);
        } catch {
          /* tab may 404 for this job */
        }
      }),
    );

    let keptChargeBlock = false;
    const dedupedArrays = arrays.filter((block) => {
      const isChargeLike = /charge|costing|(^|[^a-z])lines([^a-z]|$)/i.test(
        `${block.key} ${block.title}`,
      );
      if (!isChargeLike) return true;
      if (keptChargeBlock) return false;
      keptChargeBlock = true;
      return true;
    });

    return { sections, arrays: dedupedArrays };
  },

  /** GET /jobs/status-options — optional job_id for context-aware catalog. */
  async getStatusOptions(jobId?: string): Promise<JobStatusOption[]> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.statusOptions, {
          params: jobId && isUuid(jobId) ? { job_id: jobId } : undefined,
        }),
      );
      return normalizeJobStatusOptions(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createStatusCatalog(
    dto: import('../types/job.types').UpsertStatusCatalogDto,
  ): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.statusCatalog, dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateStatusCatalog(
    id: string,
    dto: Partial<import('../types/job.types').UpsertStatusCatalogDto>,
  ): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(JOB_API.statusCatalogById(id), dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deactivateStatusCatalog(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(JOB_API.statusCatalogById(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/detail/acknowledgement */
  async getAcknowledgement(id: string): Promise<DeliveryAcknowledgement> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.acknowledgement(id)),
      );
      return normalizeDeliveryAcknowledgement(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/acknowledgement/receive — mark RECEIVED_BY_ADMIN. */
  async receiveAcknowledgement(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<DeliveryAcknowledgement> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.acknowledgementReceive(id), body),
      );
      return normalizeDeliveryAcknowledgement(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** Optional formal PDF → JobDocument PROOF_OF_DELIVERY (visible_to_customer). */
  async generateAcknowledgementPdf(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.acknowledgementGeneratePdf(id)),
      );
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/by-barcode/:code — lookup any job by barcode (no scan event). */
  async findByBarcode(code: string): Promise<Job> {
    const trimmed = normalizeCode128Value(code);
    if (!trimmed) throw new Error('Barcode is required.');
    return request(
      () => axiosInstance.get(JOB_API.byBarcode(trimmed)),
      normalizeJob,
    );
  },

  /** POST /jobs/scan — record scan event and return job summary. */
  async scanBarcode(dto: ScanJobBarcodeDto): Promise<Job> {
    const barcode = normalizeCode128Value(dto.barcode ?? '');
    if (!barcode) throw new Error('Barcode is required.');
    const body: ScanJobBarcodeDto = {
      barcode,
      ...(dto.location?.trim() ? { location: dto.location.trim() } : {}),
      ...(dto.notes?.trim() ? { notes: dto.notes.trim() } : {}),
    };
    return request(() => axiosInstance.post(JOB_API.scan, body), normalizeJob);
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

  async close(id: string, body?: { force?: boolean }): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.post(JOB_API.close(id), body ?? {}),
      normalizeJob,
    );
  },

  /**
   * POST /jobs/:id/change-status — anytime status; may return warnings[].
   */
  async changeStatus(id: string, dto: ChangeJobStatusDto): Promise<JobChangeStatusResult> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.changeStatus(id), dto),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      const record =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : null;
      const warningsRaw = record?.warnings ?? (res.data as { warnings?: unknown })?.warnings;
      const warnings = Array.isArray(warningsRaw)
        ? warningsRaw.map(String).filter(Boolean)
        : undefined;
      const job =
        normalizeJob(record?.job ?? data) ??
        (await this.getDetail(id).catch(() => this.getById(id)));
      return { job, warnings };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/reopen — from COMPLETED / CANCELLED / DELIVERED. */
  async reopen(id: string, dto: ReopenJobDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.reopen(id), dto), normalizeJob);
  },

  /** POST /jobs/:id/stop — status → ON_HOLD. */
  async stop(id: string, dto: StopJobDto = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.stop(id), dto), normalizeJob);
  },

  /** PATCH /jobs/:id/organization/client-reference */
  async upsertClientReference(id: string, dto: UpsertJobPartyReferenceDto): Promise<Job> {
    assertId(id);
    return request(
      () => axiosInstance.patch(JOB_API.organizationClientReference(id), dto),
      normalizeJob,
    );
  },

  /** PATCH /jobs/:id/dimensions — legacy header commodity/HS */
  async patchDimensions(id: string, dto: PatchJobDimensionsDto): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.dimensions(id), dto), normalizeJob);
  },

  /** GET /jobs/:id/dimensions — list dimension lines */
  async listDimensions(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.dimensions(id)));
    return unwrapList(res.data).items;
  },

  /** POST /jobs/:id/dimensions — add dimension line */
  async addDimensionLine(id: string, dto: UpsertJobDimensionLineDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.dimensions(id), dto));
  },

  /** GET /jobs/lookups/dropdowns — name/code (and email) options for department & GPUM. */
  async getLookupsDropdowns(): Promise<
    import('../types/job.types').JobLookupsDropdowns
  > {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.lookupsDropdowns),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      const rec =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {};
      const mapNamed = (raw: unknown): import('../types/job.types').JobLookupNamedOption[] => {
        if (!Array.isArray(raw)) return [];
        const out: import('../types/job.types').JobLookupNamedOption[] = [];
        for (const row of raw) {
          if (!row || typeof row !== 'object') continue;
          const r = row as Record<string, unknown>;
          const name = String(r.name ?? r.full_name ?? r.fullName ?? '').trim();
          const email = String(r.email ?? '').trim();
          const code = String(r.code ?? '').trim();
          const label = name || email;
          if (!label) continue;
          out.push({
            name: label,
            ...(code ? { code } : {}),
            ...(email ? { email } : {}),
          });
        }
        return out;
      };
      return {
        companies: mapNamed(rec.companies ?? rec.company),
        branches: mapNamed(rec.branches ?? rec.branch),
        departments: mapNamed(rec.departments ?? rec.department),
        salespeople: mapNamed(
          rec.salespeople ?? rec.salesperson ?? rec.sales_people,
        ),
        employees: mapNamed(rec.employees ?? rec.employee),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** PATCH /jobs/:id/department */
  async patchDepartment(id: string, dto: PatchJobDepartmentDto): Promise<Job> {
    assertId(id);
    const payload: Record<string, unknown> = {};
    for (const key of [
      'company_name',
      'branch_name',
      'department_name',
      'salesperson_name',
      'company_id',
      'branch_id',
      'department_id',
      'salesperson_id',
    ] as const) {
      const v = dto[key];
      if (typeof v === 'string' && v.trim()) payload[key] = v.trim();
    }
    return request(
      () => axiosInstance.patch(JOB_API.department(id), payload),
      normalizeJob,
    );
  },

  /** POST /jobs/:id/exchange-rates */
  async upsertExchangeRate(id: string, dto: UpsertJobExchangeRateDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.exchangeRates(id), dto));
  },

  /** DELETE /jobs/:id/exchange-rates/:rateId */
  async deleteExchangeRate(id: string, rateId: string): Promise<void> {
    assertId(id);
    if (!rateId?.trim()) throw new Error('Exchange rate id is required.');
    return requestVoid(() => axiosInstance.delete(JOB_API.exchangeRate(id, rateId)));
  },

  /** POST /jobs/:id/routing-legs */
  async addRoutingLeg(id: string, dto: UpsertJobRoutingLegDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.routingLegs(id), dto));
  },

  /** PATCH /jobs/:id/routing-legs/:legId */
  async updateRoutingLeg(
    id: string,
    legId: string,
    dto: UpsertJobRoutingLegDto,
  ): Promise<unknown> {
    assertId(id);
    if (!legId?.trim()) throw new Error('Routing leg id is required.');
    return request(() => axiosInstance.patch(JOB_API.routingLeg(id, legId), dto));
  },

  /** DELETE /jobs/:id/routing-legs/:legId */
  async deleteRoutingLeg(id: string, legId: string): Promise<void> {
    assertId(id);
    if (!legId?.trim()) throw new Error('Routing leg id is required.');
    return requestVoid(() => axiosInstance.delete(JOB_API.routingLeg(id, legId)));
  },

  /** POST /jobs/:id/customs-refs */
  async addCustomsRef(id: string, dto: UpsertJobCustomsRefDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.customsRefs(id), dto));
  },

  /** PATCH /jobs/:id/customs-refs/:refId */
  async updateCustomsRef(
    id: string,
    refId: string,
    dto: UpsertJobCustomsRefDto,
  ): Promise<unknown> {
    assertId(id);
    if (!refId?.trim()) throw new Error('Customs ref id is required.');
    return request(() => axiosInstance.patch(JOB_API.customsRef(id, refId), dto));
  },

  /** DELETE /jobs/:id/customs-refs/:refId */
  async deleteCustomsRef(id: string, refId: string): Promise<void> {
    assertId(id);
    if (!refId?.trim()) throw new Error('Customs ref id is required.');
    return requestVoid(() => axiosInstance.delete(JOB_API.customsRef(id, refId)));
  },

  /** GET /jobs/:id/gpum — allocations + employees dropdown. */
  async getGpum(id: string): Promise<import('../types/job.types').JobGpumResult> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.gpum(id)));
      const data = unwrapEntity(res.data) ?? res.data;
      const rec =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : null;
      const list =
        (Array.isArray(data) && data) ||
        (rec && Array.isArray(rec.allocations) && rec.allocations) ||
        (rec && Array.isArray(rec.items) && rec.items) ||
        [];
      const allocations = (list as unknown[])
        .map((row) => {
          if (!row || typeof row !== 'object') return null;
          const r = row as Record<string, unknown>;
          const employeeName = String(
            r.employee_name ??
              r.employeeName ??
              r.user_name ??
              r.userName ??
              r.email ??
              r.user_id ??
              r.userId ??
              '',
          ).trim();
          const gp = Number(r.gp_percent ?? r.gpPercent);
          if (!employeeName || !Number.isFinite(gp)) return null;
          return {
            employee_name: employeeName,
            gp_percent: gp,
            id: typeof r.id === 'string' ? r.id : undefined,
          } satisfies import('../types/job.types').JobGpumAllocation;
        })
        .filter(
          (x): x is import('../types/job.types').JobGpumAllocation => Boolean(x),
        );

      const mapEmployees = (raw: unknown) => {
        if (!Array.isArray(raw)) return [];
        const out: import('../types/job.types').JobLookupNamedOption[] = [];
        for (const row of raw) {
          if (!row || typeof row !== 'object') continue;
          const r = row as Record<string, unknown>;
          const name = String(r.name ?? r.full_name ?? r.fullName ?? '').trim();
          const email = String(r.email ?? '').trim();
          const label = name || email;
          if (!label) continue;
          out.push({ name: label, ...(email ? { email } : {}) });
        }
        return out;
      };

      let employees = mapEmployees(rec?.employees ?? rec?.employee);
      if (!employees.length) {
        try {
          const lookups = await this.getLookupsDropdowns();
          employees = lookups.employees;
        } catch {
          /* optional fallback */
        }
      }

      return { allocations, employees };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** PUT /jobs/:id/gpum — allocations must total 100%; use employee_name. */
  async putGpum(
    id: string,
    dto: PutJobGpumDto,
  ): Promise<import('../types/job.types').JobGpumResult> {
    assertId(id);
    try {
      const allocations = (dto.allocations ?? [])
        .map((row) => ({
          employee_name: String(
            row.employee_name ?? row.user_id ?? '',
          ).trim(),
          gp_percent: Number(row.gp_percent),
        }))
        .filter((row) => row.employee_name && Number.isFinite(row.gp_percent));
      await withGatewayRetry(() =>
        axiosInstance.put(JOB_API.gpum(id), { allocations }),
      );
      return this.getGpum(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/containers/storage-charges/calculate */
  async calculateStorageCharges(
    id: string,
    dto: CalculateStorageChargesDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.storageChargesCalculate(id), dto));
  },

  /** POST /jobs/:id/containers/storage-charges/confirm-to-costing */
  async confirmStorageCharges(
    id: string,
    dto: ConfirmStorageChargesDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.storageChargesConfirm(id), dto));
  },

  /** GET /jobs/:id/charges/:chargeId/attachments?side=SALE|COST|CHARGE */
  async listChargeAttachments(
    id: string,
    chargeId: string,
    side: 'SALE' | 'COST' | 'CHARGE' = 'CHARGE',
  ): Promise<JobChargeAttachment[]> {
    assertId(id);
    if (!isUuid(chargeId)) throw new Error('Invalid charge id.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.chargeAttachments(id, chargeId), {
          params: { side },
        }),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      const list =
        (Array.isArray(data) && data) ||
        (data &&
          typeof data === 'object' &&
          Array.isArray((data as { items?: unknown }).items) &&
          (data as { items: unknown[] }).items) ||
        (data &&
          typeof data === 'object' &&
          Array.isArray((data as { attachments?: unknown }).attachments) &&
          (data as { attachments: unknown[] }).attachments) ||
        [];
      return list
        .map((row) => {
          if (!row || typeof row !== 'object') return null;
          const r = row as Record<string, unknown>;
          const file_name = String(r.file_name ?? r.fileName ?? r.name ?? '').trim();
          const s3_key = String(r.s3_key ?? r.s3Key ?? '').trim() || undefined;
          let file_url = String(r.file_url ?? r.fileUrl ?? r.url ?? r.download_url ?? '').trim();
          if (!file_url && s3_key) {
            file_url =
              resolveJobDocumentFileUrl({ s3_key, file_name }, undefined) || s3_key;
          }
          if (!file_name && !file_url && !s3_key) return null;
          return {
            id: typeof r.id === 'string' ? r.id : undefined,
            file_name: file_name || 'attachment',
            file_url: file_url || s3_key || '',
            s3_key,
            file_size: Number.isFinite(Number(r.file_size ?? r.fileSize))
              ? Number(r.file_size ?? r.fileSize)
              : undefined,
            mime_type: typeof r.mime_type === 'string' ? r.mime_type : undefined,
            created_at: typeof r.created_at === 'string' ? r.created_at : undefined,
          } satisfies JobChargeAttachment;
        })
        .filter((x): x is JobChargeAttachment => Boolean(x));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST multipart /jobs/:id/documents/{documentType}/upload */
  async uploadJobTypedDocument(
    id: string,
    documentType: string,
    file: File,
  ): Promise<Record<string, unknown>> {
    assertId(id);
    const type = documentType.trim();
    if (!type) throw new Error('Document type is required.');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.documentTypeUpload(id, type), form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      return data && typeof data === 'object' && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : {};
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** Upload file then POST charge attachment metadata (OpenAPI CreateJobChargeAttachmentDto). */
  async uploadChargeAttachmentFile(
    id: string,
    chargeId: string,
    file: File,
    side: CreateJobChargeAttachmentDto['side'] = 'CHARGE',
  ): Promise<JobChargeAttachment> {
    const uploaded = await this.uploadJobTypedDocument(id, 'OTHER', file);
    const file_name =
      String(uploaded.file_name ?? uploaded.fileName ?? file.name).trim() || file.name;
    const s3_key =
      typeof uploaded.s3_key === 'string'
        ? uploaded.s3_key
        : typeof uploaded.s3Key === 'string'
          ? uploaded.s3Key
          : undefined;
    let file_url = String(
      uploaded.file_url ?? uploaded.fileUrl ?? uploaded.url ?? uploaded.download_url ?? '',
    ).trim();
    if (!file_url) {
      file_url =
        resolveJobDocumentFileUrl(
          { s3_key, file_name, file_url: undefined },
          typeof uploaded.tenant_id === 'string'
            ? uploaded.tenant_id
            : typeof uploaded.tenantId === 'string'
              ? uploaded.tenantId
              : undefined,
        ) || '';
    }
    if (!file_url && !s3_key) {
      throw new Error('Upload succeeded but no file URL or storage key was returned.');
    }
    // OpenAPI requires file_url — use s3_key as last-resort absolute-ish ref.
    if (!file_url && s3_key) file_url = s3_key;
    const file_size = Number.isFinite(Number(uploaded.file_size ?? uploaded.fileSize))
      ? Number(uploaded.file_size ?? uploaded.fileSize)
      : file.size;
    const mime_type =
      (typeof uploaded.mime_type === 'string' && uploaded.mime_type) ||
      (typeof uploaded.mimeType === 'string' && uploaded.mimeType) ||
      file.type ||
      undefined;
    return this.createChargeAttachment(id, chargeId, {
      file_name,
      file_url,
      s3_key,
      file_size,
      mime_type,
      side,
    });
  },

  /** POST /jobs/:id/charges/:chargeId/attachments */
  async createChargeAttachment(
    id: string,
    chargeId: string,
    dto: CreateJobChargeAttachmentDto,
  ): Promise<JobChargeAttachment> {
    assertId(id);
    if (!isUuid(chargeId)) throw new Error('Invalid charge id.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.chargeAttachments(id, chargeId), dto),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      const r =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {};
      return {
        id: typeof r.id === 'string' ? r.id : undefined,
        file_name: String(r.file_name ?? r.fileName ?? dto.file_name),
        file_url: String(r.file_url ?? r.fileUrl ?? dto.file_url),
        s3_key: typeof r.s3_key === 'string' ? r.s3_key : dto.s3_key,
        file_size:
          Number.isFinite(Number(r.file_size ?? r.fileSize ?? dto.file_size))
            ? Number(r.file_size ?? r.fileSize ?? dto.file_size)
            : undefined,
        mime_type:
          typeof r.mime_type === 'string' ? r.mime_type : dto.mime_type,
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async closeChecklist(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.closeChecklist(id)));
  },

  async copyJob(id: string, body: Record<string, unknown> = {}): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.copy(id), body), normalizeJob);
  },

  /** GET /jobs/:id/shipments — list shipments attached to this job (all API rows). */
  async listJobShipments(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.shipments(id)));
    const { items } = unwrapList(res.data);
    if (items.length) {
      return items.map((row) => {
        if (typeof row === 'string' && isUuid(row.trim())) return { id: row.trim() };
        return row;
      });
    }
    // Some builds return a single shipment object when the job was created from a shipment.
    const raw = unwrapEntity(res.data) ?? res.data;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const single = raw as Record<string, unknown>;
      if (single.id || single.shipment_id || single.shipment_number) {
        return [single];
      }
      // Nested { shipments: [...] } under entity
      for (const key of ['shipments', 'linked_shipments', 'items', 'results']) {
        const nested = single[key];
        if (Array.isArray(nested) && nested.length) return nested;
      }
    }
    return [];
  },

  /** POST /jobs/:id/shipments — create/link shipment payload on this job */
  async attachJobShipments(id: string, body: Record<string, unknown>): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.shipments(id), body));
  },

  /** POST /jobs/:id/shipments/attach — attach existing shipment id(s) */
  async attachExistingJobShipments(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.shipmentsAttach(id), body));
  },

  /** GET /jobs/:id/vouchers */
  async listJobVouchers(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.vouchers(id)));
    return unwrapList(res.data).items;
  },

  /** POST /jobs/:id/vouchers/generate */
  async generateJobVoucher(id: string, dto: GenerateJobVoucherDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.vouchersGenerate(id), dto));
  },

  /**
   * GET /jobs/:id/charges — costing grid + optional `parties_included` rollup.
   * Falls back to client-side party rollup from lines when BE omits the field.
   */
  async listJobChargesTab(id: string): Promise<{
    charges: JobCharge[];
    parties_included: import('../utils/normalizeCostingParties').CostingPartyIncluded[];
  }> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.charges(id)));
    const charges = normalizeJobCharges(res.data);
    const {
      normalizePartiesIncluded,
      derivePartiesIncludedFromCharges,
    } = await import('../utils/normalizeCostingParties');
    const fromApi = normalizePartiesIncluded(res.data);
    return {
      charges,
      parties_included: fromApi.length
        ? fromApi
        : derivePartiesIncludedFromCharges(charges),
    };
  },

  /** GET /jobs/:id/charges — charge lines only (reports / legacy callers). */
  async listJobCharges(id: string): Promise<JobCharge[]> {
    const tab = await this.listJobChargesTab(id);
    return tab.charges;
  },

  /** POST /jobs/:id/charges/composite */
  async createChargesComposite(
    id: string,
    dto: CreateJobChargesCompositeDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.chargesComposite(id), dto));
  },

  /** PATCH /jobs/:id/charges/:chargeId/sale */
  async updateChargeSale(
    id: string,
    chargeId: string,
    dto: PatchJobChargeSideDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.chargeSale(id, chargeId), dto));
  },

  /** PATCH /jobs/:id/charges/:chargeId/cost */
  async updateChargeCost(
    id: string,
    chargeId: string,
    dto: PatchJobChargeSideDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.chargeCost(id, chargeId), dto));
  },

  /** GET /jobs/:id/charges/history */
  async listChargesHistory(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.chargesHistory(id)));
  },

  /** GET /jobs/:id/charges/:chargeId/history */
  async listChargeHistory(id: string, chargeId: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.chargeHistory(id, chargeId)));
  },

  /**
   * GET /jobs/:id/invoices/sale/form
   * Prefill from sale charges → quotation → empty. `charge_ids` query is comma-separated.
   */
  async getSaleInvoiceForm(
    id: string,
    chargeIds: string[] = [],
  ): Promise<JobInvoiceFormPreview> {
    assertId(id);
    return request(() =>
      axiosInstance.get(JOB_API.invoicesSaleForm(id), {
        params: { charge_ids: chargeIds.filter(Boolean).join(',') },
      }),
    ) as Promise<JobInvoiceFormPreview>;
  },

  /**
   * GET /jobs/:id/invoices/purchase/form
   * Prefill from vendor offer → costing → empty (does not require cost_party_id).
   */
  async getPurchaseInvoiceForm(
    id: string,
    chargeIds: string[] = [],
  ): Promise<JobInvoiceFormPreview> {
    assertId(id);
    return request(() =>
      axiosInstance.get(JOB_API.invoicesPurchaseForm(id), {
        params: { charge_ids: chargeIds.filter(Boolean).join(',') },
      }),
    ) as Promise<JobInvoiceFormPreview>;
  },

  /** POST /jobs/:id/invoices/sale — save form DRAFT/CREATE or legacy generate from charge_ids */
  async createSaleInvoiceFromJob(
    id: string,
    dto: CreateJobInvoiceFromCostingDto | JobInvoiceFormSaveDto = {},
    file?: File | null,
  ): Promise<unknown> {
    assertId(id);
    if (file) {
      const form = new FormData();
      form.append('file', file);
      form.append('data', JSON.stringify(dto ?? {}));
      return request(() =>
        axiosInstance.post(JOB_API.invoicesSale(id), form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
    }
    return request(() => axiosInstance.post(JOB_API.invoicesSale(id), dto));
  },

  /**
   * POST /jobs/:id/invoices/purchase — save form DRAFT/CREATE;
   * optional PDF via multipart `file` + JSON `data`.
   */
  async createPurchaseInvoiceFromJob(
    id: string,
    dto: CreateJobInvoiceFromCostingDto | JobInvoiceFormSaveDto = {},
    file?: File | null,
  ): Promise<unknown> {
    assertId(id);
    if (file) {
      const form = new FormData();
      form.append('file', file);
      form.append('data', JSON.stringify(dto ?? {}));
      return request(() =>
        axiosInstance.post(JOB_API.invoicesPurchase(id), form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
    }
    return request(() => axiosInstance.post(JOB_API.invoicesPurchase(id), dto));
  },

  /** GET /jobs/:id/documents/:documentId/download — trigger browser download */
  /** GET /jobs/:id/documents/:documentId/download as Blob (for remirror / preview). */
  async fetchJobDocumentBlob(id: string, documentId: string): Promise<Blob> {
    assertId(id);
    if (!isUuid(documentId)) throw new Error('Invalid document id.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<Blob>(JOB_API.documentDownload(id, documentId), {
          responseType: 'blob',
        }),
      );
      return res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async downloadJobDocument(
    id: string,
    documentId: string,
    displayName?: string,
  ): Promise<void> {
    assertId(id);
    if (!isUuid(documentId)) throw new Error('Invalid document id.');
    try {
      const blob = await this.fetchJobDocumentBlob(id, documentId);
      const name = (displayName || 'document').trim() || 'document';
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/invoices/purchase/bulk — Fresa bulk PI preview */
  async previewBulkPurchaseInvoice(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.invoicesPurchaseBulk(id)));
  },

  /** POST /jobs/:id/invoices/purchase/bulk — one DRAFT PI per vendor + currency */
  async generateBulkPurchaseInvoice(
    id: string,
    dto: CreateJobInvoiceFromCostingDto = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.invoicesPurchaseBulk(id), dto),
    );
  },

  /** GET /jobs/:id/edi/types */
  async listJobEdiTypes(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.ediTypes(id)));
  },

  /** POST /jobs/:id/edi/generate */
  async generateJobEdi(
    id: string,
    dto: import('../types/job.types').GenerateJobEdiDto,
  ): Promise<unknown> {
    assertId(id);
    if (!String(dto.edi_type ?? '').trim()) {
      throw new Error('EDI type is required.');
    }
    return request(() =>
      axiosInstance.post(JOB_API.ediGenerate(id), {
        edi_type: String(dto.edi_type).trim(),
      }),
    );
  },

  /** GET /jobs/:id/edi/submissions */
  async listJobEdiSubmissions(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.ediSubmissions(id)));
  },

  /**
   * GET /jobs/:id/edi/submissions/:submissionId/download
   * Streams text/plain (.txt MANIFEST_CSDP) or application/pdf with Bearer — not an S3 URL.
   */
  async downloadJobEdiSubmission(
    id: string,
    submissionId: string,
  ): Promise<Blob | unknown> {
    assertId(id);
    if (!isUuid(submissionId) && !submissionId.trim()) {
      throw new Error('Invalid EDI submission id.');
    }
    try {
      const { resolveEdiDownloadPayload } = await import(
        '@/features/shared/edi/normalizeEdi'
      );
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.ediSubmissionDownload(id, submissionId.trim()), {
          responseType: 'blob',
          headers: {
            Accept: 'text/plain, application/pdf, application/json, */*',
          },
        }),
      );
      const blob = res.data as Blob;
      const contentType = String(res.headers?.['content-type'] ?? blob.type ?? '');
      return resolveEdiDownloadPayload(blob, contentType);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/pnl/custom-duty */
  async getPnlCustomDuty(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.pnlCustomDuty(id)));
  },

  /** POST /jobs/:id/routing-legs/push-to-subjobs */
  async pushRoutingLegsToSubjobs(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.routingLegsPushToSubjobs(id), body),
    );
  },

  /** POST /jobs/:id/containers/push-to-sub-jobs */
  async pushContainersToSubJobs(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.containersPushToSubJobs(id), body),
    );
  },

  /** GET /jobs/:id/references */
  async getReferences(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.references(id)));
  },

  /** PUT /jobs/:id/references */
  async putReferences(id: string, dto: UpsertJobReferencesDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.put(JOB_API.references(id), dto));
  },

  /** PUT /jobs/:id/references/:type */
  async putReferenceByType(
    id: string,
    type: string,
    dto: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.put(JOB_API.referenceByType(id, type), dto),
    );
  },

  /** GET /jobs/:id/email-recipients/suggest */
  async suggestEmailRecipients(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.emailRecipientsSuggest(id)));
  },

  /** PATCH /jobs/:id/closed-overrides */
  async patchClosedOverrides(
    id: string,
    dto: PatchJobClosedOverridesDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.closedOverrides(id), dto));
  },

  /** POST /jobs/:id/get-charges — quotation / party standard */
  async pullJobCharges(id: string, dto: GetJobChargesDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.getCharges(id), dto));
  },

  /** POST /jobs/:id/get-job-charges — Fresa Get Job Charges from shipment */
  async getJobChargesFromShipment(
    id: string,
    dto: GetJobChargesFromShipmentDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.getJobChargesFromShipment(id), dto));
  },

  /** POST /jobs/:id/copy-charges */
  async copyJobCharges(id: string, dto: CopyJobChargesDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.copyCharges(id), dto));
  },

  /** POST /jobs/:id/profit-share/preview */
  async profitSharePreview(id: string, dto: ProfitSharePreviewDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.profitSharePreview(id), dto));
  },

  /** POST /jobs/:id/profit-share/add */
  async profitShareAdd(id: string, dto: ProfitShareAddDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.profitShareAdd(id), dto));
  },

  /** GET /jobs/:id/profit-share/calculator */
  async getProfitShareCalculator(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.profitShareCalculator(id)));
  },

  /** GET /jobs/:id/profit-share/accounts?search= */
  async listProfitShareAccounts(
    id: string,
    params: { search?: string } = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.get(JOB_API.profitShareAccounts(id), {
        params: params.search?.trim() ? { search: params.search.trim() } : undefined,
      }),
    );
  },

  async prorateToShipments(id: string, dto: ProrateToShipmentsDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.prorateToShipments(id), dto));
  },

  async cancelProrateToShipments(id: string, body: Record<string, unknown> = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.cancelProrate(id), body));
  },

  async queueJobBookingConfirmation(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.generateBookingConfirmation(id)));
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

  async getAirBookingForm(id: string): Promise<AirBookingForm> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.airBookingForm(id)));
      const data = unwrapEntity(res.data);
      return (
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as AirBookingForm)
          : {}
      );
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return {};
      throw error;
    }
  },

  async updateAirBookingForm(id: string, dto: UpdateAirBookingFormDto): Promise<AirBookingForm> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.put(JOB_API.airBookingForm(id), dto),
      );
      const data = unwrapEntity(res.data);
      return (
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as AirBookingForm)
          : {}
      );
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405) {
        try {
          const res = await withGatewayRetry(() =>
            axiosInstance.post(JOB_API.airBookingForm(id), dto),
          );
          const data = unwrapEntity(res.data);
          return (
            data && typeof data === 'object' && !Array.isArray(data)
              ? (data as AirBookingForm)
              : {}
          );
        } catch (postErr) {
          throw formatAxiosError(postErr);
        }
      }
      throw formatAxiosError(error);
    }
  },

  async getAirComplianceForm(id: string): Promise<AirComplianceForm> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.airComplianceForm(id)));
      const data = unwrapEntity(res.data);
      return (
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as AirComplianceForm)
          : {}
      );
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return {};
      throw formatAxiosError(error);
    }
  },

  async putAirComplianceForm(
    id: string,
    dto: UpsertAirComplianceBookingFormDto,
  ): Promise<AirComplianceForm> {
    assertId(id);
    const res = await withGatewayRetry(() =>
      axiosInstance.put(JOB_API.airComplianceForm(id), dto),
    );
    const data = unwrapEntity(res.data);
    return (
      data && typeof data === 'object' && !Array.isArray(data)
        ? (data as AirComplianceForm)
        : {}
    );
  },

  async airCsTriage(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airCsTriage(id), dto));
  },

  async airMarkQuoteSent(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airMarkQuoteSent(id), dto));
  },

  async airSendInvoice(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airSendInvoice(id), dto));
  },

  async listAirUldRequests(_id: string): Promise<AirUldRequest[]> {
    throw new Error(
      'Air pallet / ULD requests were removed from the backend (GET /jobs/:id/air/uld-requests).',
    );
  },

  async createAirUldRequest(
    _id: string,
    _dto: CreateAirUldRequestDto = {},
  ): Promise<AirUldRequest> {
    throw new Error(
      'Air pallet / ULD requests were removed from the backend (POST /jobs/:id/air/uld-requests).',
    );
  },

  async issueAirUldRequest(
    _id: string,
    _requestId: string,
    _dto: AirWorkflowActionDto = {},
  ): Promise<AirUldRequest> {
    throw new Error(
      'Air pallet / ULD issue was removed from the backend.',
    );
  },

  async allocateAirUldRequest(
    _id: string,
    _requestId: string,
    _dto: AirWorkflowActionDto = {},
  ): Promise<AirUldRequest> {
    throw new Error(
      'Air pallet / ULD allocate was removed from the backend.',
    );
  },

  async airStageBuildUp(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airStageBuildUp(id), dto));
  },

  async airStageMawbReceived(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airStageMawbReceived(id), dto));
  },

  async airStageMawbIssued(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airStageMawbIssued(id), dto));
  },

  async airStagePod(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airStagePod(id), dto));
  },

  async airConfirmPayment(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airConfirmPayment(id), dto));
  },

  async airCloseReport(id: string, dto: AirWorkflowActionDto = {}): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airCloseReport(id), dto));
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

  async getSeaFclBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return getModeBookingForm(JOB_API.seaFclBookingForm(id));
  },

  async putSeaFclBookingForm(id: string, dto: UpsertSeaFclBookingFormDto): Promise<ModeBookingForm> {
    assertId(id);
    return putModeBookingFormRequest(JOB_API.seaFclBookingForm(id), dto as Record<string, unknown>);
  },

  async completeSeaFclBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.seaFclBookingFormComplete(id)));
  },

  async getSeaLclBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return getModeBookingForm(JOB_API.seaLclBookingForm(id));
  },

  async putSeaLclBookingForm(id: string, dto: UpsertSeaLclBookingFormDto): Promise<ModeBookingForm> {
    assertId(id);
    return putModeBookingFormRequest(JOB_API.seaLclBookingForm(id), dto as Record<string, unknown>);
  },

  async completeSeaLclBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.seaLclBookingFormComplete(id)));
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

  async getCourierBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return getModeBookingForm(JOB_API.courierBookingForm(id));
  },

  async putCourierBookingForm(
    id: string,
    dto: UpsertCourierBookingFormDto,
  ): Promise<ModeBookingForm> {
    assertId(id);
    return putModeBookingFormRequest(JOB_API.courierBookingForm(id), dto as Record<string, unknown>);
  },

  async completeCourierBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.courierBookingFormComplete(id)));
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

  async getLandBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return getModeBookingForm(JOB_API.landBookingForm(id));
  },

  async putLandBookingForm(id: string, dto: UpsertLandBookingFormDto): Promise<ModeBookingForm> {
    assertId(id);
    return putModeBookingFormRequest(JOB_API.landBookingForm(id), dto as Record<string, unknown>);
  },

  async completeLandBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.landBookingFormComplete(id)));
  },

  async updateRoadFreightDetails(
    id: string,
    dto: UpdateRoadFreightJobDetailDto,
  ): Promise<Job> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(
          () => axiosInstance.patch(JOB_API.roadFreightDetails(id), dto, SOFT_ACL_AXIOS),
          normalizeJob,
        ),
      () => this.updateLandDetails(id, dto as UpdateLandJobDetailDto),
    );
  },

  async assignRoadFreightTrucker(
    id: string,
    dto: AssignRoadFreightTruckerDto,
  ): Promise<Job> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(
          () =>
            axiosInstance.post(JOB_API.roadFreightAssignTrucker(id), dto, SOFT_ACL_AXIOS),
          normalizeJob,
        ),
      () => this.assignLandTrucker(id, dto as AssignLandTruckerDto),
    );
  },

  async recordRoadFreightPickup(
    id: string,
    dto: RecordRoadFreightPickupDto = {},
  ): Promise<Job> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(
          () => axiosInstance.post(JOB_API.roadFreightPickup(id), dto, SOFT_ACL_AXIOS),
          normalizeJob,
        ),
      () => this.recordLandPickup(id, dto),
    );
  },

  async recordRoadFreightBorderCrossing(
    id: string,
    dto: RecordRoadFreightBorderCrossingDto,
  ): Promise<Job> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(
          () =>
            axiosInstance.post(JOB_API.roadFreightBorderCrossing(id), dto, SOFT_ACL_AXIOS),
          normalizeJob,
        ),
      () => this.recordLandBorderCrossing(id, dto),
    );
  },

  async upsertRoadFreightCrossBorder(
    id: string,
    dto: UpdateRoadFreightJobDetailDto,
  ): Promise<Job> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(
          () =>
            axiosInstance.patch(JOB_API.roadFreightCrossBorder(id), dto, SOFT_ACL_AXIOS),
          normalizeJob,
        ),
      () => this.upsertLandCrossBorder(id, dto as UpdateLandJobDetailDto),
    );
  },

  async createRoadFreightPod(id: string, dto: CreateRoadFreightPodDto): Promise<unknown> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(() => axiosInstance.post(JOB_API.roadFreightPod(id), dto, SOFT_ACL_AXIOS)),
      () => this.createLandPod(id, dto as CreateLandPodDto),
    );
  },

  async getRoadFreightBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        getModeBookingForm(JOB_API.roadFreightBookingForm(id), { skipErrorToast: true }),
      () => this.getLandBookingForm(id),
    );
  },

  async putRoadFreightBookingForm(
    id: string,
    dto: UpsertRoadFreightBookingFormDto,
  ): Promise<ModeBookingForm> {
    assertId(id);
    return withRoadLandAclFallback(
      async () => {
        try {
          const res = await withGatewayRetry(() =>
            axiosInstance.put(JOB_API.roadFreightBookingForm(id), dto, SOFT_ACL_AXIOS),
          );
          return asModeBookingForm(res.data);
        } catch (error) {
          if (isJobTypeAccessError(error)) throw error;
          throw formatAxiosError(error);
        }
      },
      () => this.putLandBookingForm(id, dto as UpsertLandBookingFormDto),
    );
  },

  async completeRoadFreightBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return withRoadLandAclFallback(
      () =>
        request(() =>
          axiosInstance.post(
            JOB_API.roadFreightBookingFormComplete(id),
            {},
            SOFT_ACL_AXIOS,
          ),
        ),
      () => this.completeLandBookingForm(id),
    );
  },

  async getWarehouseBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return getModeBookingForm(JOB_API.warehouseBookingForm(id));
  },

  async putWarehouseBookingForm(
    id: string,
    dto: UpsertWarehouseBookingFormDto,
  ): Promise<ModeBookingForm> {
    assertId(id);
    return putModeBookingFormRequest(
      JOB_API.warehouseBookingForm(id),
      dto as Record<string, unknown>,
    );
  },

  async completeWarehouseBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.warehouseBookingFormComplete(id)));
  },

  /**
   * POST /jobs/:id/:mode/booking-form/documents/:kind
   * Document kinds: commercial_invoice, packing_list, licence, uat_tax_certificate (mandatory);
   * bill_of_lading (optional).
   */
  async uploadBookingFormDocument(
    id: string,
    mode: import('@/features/booking-documents/constants/bookingDocumentKinds').ModeBookingFormApiMode,
    kind: import('@/features/booking-documents/constants/bookingDocumentKinds').ModeBookingFormDocumentKind,
    file: File,
  ): Promise<unknown> {
    assertId(id);
    const form = new FormData();
    form.append('file', file);
    // Do not set Content-Type — axios must add the multipart boundary for Multer.
    return request(() =>
      axiosInstance.post(JOB_API.bookingFormDocument(id, mode, kind), form, {
        transformRequest: [
          (data, headers) => {
            if (headers && typeof headers === 'object' && data instanceof FormData) {
              const h = headers as Record<string, unknown>;
              delete h['Content-Type'];
              delete h['content-type'];
              if (typeof (headers as { delete?: (k: string) => void }).delete === 'function') {
                (headers as { delete: (k: string) => void }).delete('Content-Type');
                (headers as { delete: (k: string) => void }).delete('content-type');
              }
            }
            return data;
          },
        ],
      }),
    );
  },

  async getCustomsClearanceBookingForm(id: string): Promise<ModeBookingForm> {
    assertId(id);
    return getModeBookingForm(JOB_API.customsClearanceBookingForm(id));
  },

  async putCustomsClearanceBookingForm(
    id: string,
    dto: UpsertCustomsClearanceBookingFormDto,
  ): Promise<ModeBookingForm> {
    assertId(id);
    return putModeBookingFormRequest(
      JOB_API.customsClearanceBookingForm(id),
      dto as Record<string, unknown>,
    );
  },

  async completeCustomsClearanceBookingForm(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.customsClearanceBookingFormComplete(id)));
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

  async getCutoffs(id: string): Promise<import('../utils/normalizeJobCutoffs').JobCutoffs> {
    assertId(id);
    const { normalizeJobCutoffs } = await import('../utils/normalizeJobCutoffs');
    return request(
      () => axiosInstance.get(JOB_API.cutoffs(id)),
      (raw) => normalizeJobCutoffs(raw),
    );
  },

  async listContainers(id: string): Promise<import('../types/job.types').JobContainer[]> {
    assertId(id);
    try {
      const { normalizeJobContainers } = await import('../utils/normalizeJobContainers');
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.containers(id)));
      return normalizeJobContainers(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createContainer(
    id: string,
    dto: CreateJobContainerDto,
  ): Promise<import('../types/job.types').JobContainer | null> {
    assertId(id);
    try {
      const { normalizeJobContainer } = await import('../utils/normalizeJobContainers');
      // Prefer type code / iso_size — omit type UUID when code is present.
      const payload: CreateJobContainerDto = {
        ...dto,
        status: dto.status ?? 'EMPTY',
      };
      if (payload.container_type_code || payload.iso_size) {
        delete payload.container_type_id;
      }
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.containers(id), payload),
      );
      return (
        normalizeJobContainer(unwrapEntity(res.data)) ?? {
          id: '',
          container_type_id: payload.container_type_id || '',
          container_number: payload.container_number,
          seal_number: payload.seal_number,
          status: payload.status,
        }
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateContainer(
    id: string,
    containerId: string,
    dto: UpdateJobContainerDto,
  ): Promise<import('../types/job.types').JobContainer | null> {
    assertId(id);
    try {
      const { normalizeJobContainer } = await import('../utils/normalizeJobContainers');
      // Drop undefined so PATCH is never an empty `{}` when callers pass sparse objects.
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(dto)) {
        if (value !== undefined) body[key] = value;
      }
      if (!Object.keys(body).length) {
        throw new Error('Nothing to update on container.');
      }
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(JOB_API.container(id, containerId), body),
      );
      return normalizeJobContainer(unwrapEntity(res.data));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deleteContainer(id: string, containerId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.container(id, containerId)));
  },

  async listContainersFill(
    id: string,
  ): Promise<import('../utils/normalizeJobContainers').ContainerFillInfo[]> {
    assertId(id);
    try {
      const { normalizeContainersFill } = await import('../utils/normalizeJobContainers');
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.containersFill(id)),
      );
      return normalizeContainersFill(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getContainerFill(
    id: string,
    containerId: string,
  ): Promise<import('../utils/normalizeJobContainers').ContainerFillInfo | null> {
    assertId(id);
    try {
      const { normalizeContainerFill } = await import('../utils/normalizeJobContainers');
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.containerFill(id, containerId)),
      );
      return normalizeContainerFill(unwrapEntity(res.data) ?? res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
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

  /** PUT /jobs/:id/containers/bulk */
  async bulkUpdateContainers(id: string, body: Record<string, unknown>): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.put(JOB_API.containersBulk(id), body));
  },

  /** GET /jobs/:id/containers/export — CSV blob */
  async exportContainers(id: string, params: Record<string, unknown> = {}): Promise<Blob> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.containersExport(id), {
          params,
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** PATCH /jobs/:id/containers/job-details */
  async patchContainersJobDetails(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.containersJobDetails(id), body));
  },

  /** POST /jobs/:id/containers/sync-from-sub-jobs */
  async syncContainersFromSubJobs(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.containersSyncFromSubJobs(id), body));
  },

  /** POST /jobs/:id/containers/upload — multipart; pass FormData from caller */
  async uploadContainers(
    id: string,
    formData: FormData,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.containersUpload(id), formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  /** GET /jobs/:id/containers/upload-sample */
  async downloadContainersUploadSample(id: string): Promise<Blob> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.containersUploadSample(id), { responseType: 'blob' }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/containers/upload/confirm */
  async confirmContainersUpload(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.containersUploadConfirm(id), body));
  },

  /** POST /jobs/:id/containers/upload/paste */
  async pasteContainersUpload(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.containersUploadPaste(id), body));
  },

  /** PATCH /jobs/:id/dimensions/:lineId */
  async updateDimensionLine(
    id: string,
    lineId: string,
    body: UpsertJobDimensionLineDto,
  ): Promise<unknown> {
    assertId(id);
    if (!lineId?.trim()) throw new Error('Invalid dimension line id.');
    return request(() =>
      axiosInstance.patch(JOB_API.dimensionLine(id, lineId), body),
    );
  },

  /** DELETE /jobs/:id/dimensions/:lineId */
  async deleteDimensionLine(id: string, lineId: string): Promise<void> {
    assertId(id);
    if (!lineId?.trim()) throw new Error('Invalid dimension line id.');
    return requestVoid(() => axiosInstance.delete(JOB_API.dimensionLine(id, lineId)));
  },

  /** PUT /jobs/:id/dimensions/bulk */
  async bulkUpdateDimensions(id: string, body: Record<string, unknown>): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.put(JOB_API.dimensionsBulk(id), body));
  },

  /** GET /jobs/:id/dimensions/export */
  async exportDimensions(id: string, params: Record<string, unknown> = {}): Promise<Blob> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.dimensionsExport(id), {
          params,
          responseType: 'blob',
        }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/dimensions/sync-to-cargo */
  async syncDimensionsToCargo(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.dimensionsSyncToCargo(id), body));
  },

  /** POST /jobs/:id/dimensions/upload */
  async uploadDimensions(
    id: string,
    formData: FormData,
    params: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.dimensionsUpload(id), formData, {
        params,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },

  /** GET /jobs/:id/dimensions/upload-sample */
  async downloadDimensionsUploadSample(id: string): Promise<Blob> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.dimensionsUploadSample(id), { responseType: 'blob' }),
      );
      return res.data as Blob;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/dimensions/upload/confirm */
  async confirmDimensionsUpload(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.dimensionsUploadConfirm(id), body));
  },

  /** POST /jobs/:id/dimensions/upload/paste */
  async pasteDimensionsUpload(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.dimensionsUploadPaste(id), body));
  },

  /** GET /jobs/:id/organizations */
  async listOrganizations(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.organizations(id)));
    return unwrapList(res.data).items;
  },

  /** POST /jobs/:id/organizations */
  async addOrganization(
    id: string,
    body: AddJobOrganizationDto | Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.organizations(id), body));
  },

  /** PUT /jobs/:id/organizations/:orgType */
  async replaceOrganization(
    id: string,
    orgType: string,
    body: ReplaceJobOrganizationDto | Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    if (!orgType?.trim()) throw new Error('Organization type is required.');
    return request(() =>
      axiosInstance.put(JOB_API.organizationByType(id, orgType), body),
    );
  },

  /** DELETE /jobs/:id/organizations/:orgType */
  async unlinkOrganization(id: string, orgType: string): Promise<void> {
    assertId(id);
    if (!orgType?.trim()) throw new Error('Organization type is required.');
    return requestVoid(() =>
      axiosInstance.delete(JOB_API.organizationByType(id, orgType)),
    );
  },

  /** POST /jobs/:id/organizations/copy-from */
  async copyOrganizationsFrom(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.organizationsCopyFrom(id), body));
  },

  /** POST /jobs/:id/organizations/refresh-snapshots */
  async refreshOrganizationSnapshots(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.organizationsRefreshSnapshots(id), body),
    );
  },

  /** GET /jobs/:id/organizations/party-search?q= */
  async searchOrganizationParties(
    id: string,
    q: string,
    params: { party_type?: string; limit?: number } = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.get(JOB_API.organizationsPartySearch(id), {
        params: { q: q.trim(), ...params },
      }),
    );
  },

  /** GET /jobs/:id/bl-draft/preview */
  async getBlDraftPreview(id: string): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.get(JOB_API.blDraftPreview(id)));
  },

  /** POST /jobs/:id/bl-draft/generate — is_original: false */
  async generateBlDraft(
    id: string,
    body: Record<string, unknown> = {},
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.post(JOB_API.blDraftGenerate(id), {
        is_original: false,
        ...body,
      }),
    );
  },

  /** GET /jobs/job-offers */
  async listJobOffers(params: Record<string, unknown> = {}): Promise<unknown> {
    return request(() => axiosInstance.get(JOB_API.jobOffersList, { params }));
  },

  /** POST /jobs/job-offers */
  async createJobOffer(body: Record<string, unknown>): Promise<unknown> {
    return request(() => axiosInstance.post(JOB_API.jobOffersList, body));
  },

  async listCargo(id: string): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.cargo(id)));
    return unwrapList(res.data).items;
  },

  async createCargo(id: string, dto: CreateJobCargoDto): Promise<unknown> {
    assertId(id);
    const payload: CreateJobCargoDto = { ...dto };
    if (payload.container_number?.trim()) {
      payload.container_number = payload.container_number.trim();
      delete payload.container_id;
    }
    return request(() => axiosInstance.post(JOB_API.cargo(id), payload));
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

  /**
   * Copy quotation revenue lines onto the job as billable charges when the job has none yet.
   * Returns the refreshed job (or original if nothing to copy).
   */
  async ensureChargesFromQuotation(
    jobId: string,
    quotation: { lines?: import('@/features/quotations/types/quotation.types').QuotationLine[] },
  ): Promise<Job> {
    assertId(jobId);
    const { quotationLinesToJobChargeDtos } = await import(
      '@/features/quotations/utils/quotationRevenueCharges'
    );
    const dtos = quotationLinesToJobChargeDtos(quotation.lines);
    if (!dtos.length) return this.getById(jobId);

    let job = await this.getById(jobId);
    const existingBillable = (job.charges ?? []).filter(
      (c) => c.is_cost !== true && c.is_billable !== false,
    );
    if (existingBillable.length > 0) return job;

    for (const dto of dtos) {
      try {
        await this.createCharge(jobId, dto);
      } catch {
        /* skip lines the API rejects */
      }
    }
    return this.getById(jobId);
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
    return request(() => axiosInstance.get(JOB_API.pnl(id)), normalizeJobPnl);
  },

  /** GET /jobs/:id/cargo/:cargoId/documents */
  async listCargoDocuments(id: string, cargoId: string): Promise<unknown[]> {
    assertId(id);
    if (!isUuid(cargoId)) throw new Error('Invalid cargo id.');
    const res = await withGatewayRetry(() =>
      axiosInstance.get(JOB_API.cargoDocuments(id, cargoId)),
    );
    return unwrapList(res.data).items;
  },

  /** POST multipart /jobs/:id/cargo/:cargoId/documents/upload */
  async uploadCargoDocument(
    id: string,
    cargoId: string,
    file: File,
  ): Promise<unknown> {
    assertId(id);
    if (!isUuid(cargoId)) throw new Error('Invalid cargo id.');
    const form = new FormData();
    form.append('file', file);
    return request(() =>
      axiosInstance.post(JOB_API.cargoDocumentUpload(id, cargoId), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
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
    // Prefer container_number; drop empty id when number is present.
    const payload: UpsertContainerFreeDaysDto = { ...dto };
    if (payload.container_number?.trim()) {
      delete payload.container_id;
      payload.container_number = payload.container_number.trim();
    }
    return request(() => axiosInstance.post(JOB_API.freeDays(id), payload));
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

  async listMilestones(id: string): Promise<import('../types/job.types').JobMilestone[]> {
    assertId(id);
    const { normalizeMilestones } = await import('../utils/normalizeJob');
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.milestones(id)));
    return normalizeMilestones(unwrapList(res.data).items);
  },

  async createMilestone(id: string, dto: CreateCustomMilestoneDto): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.milestones(id), dto));
  },

  async updateMilestone(
    id: string,
    milestoneKey: string,
    dto: UpdateJobMilestoneDto,
  ): Promise<unknown> {
    assertId(id);
    const key = String(milestoneKey ?? '').trim();
    if (!key) throw new Error('Milestone code/name is required.');
    return request(() => axiosInstance.patch(JOB_API.milestone(id, key), dto));
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

  /**
   * GET /jobs/:id/documents
   * Optional `uploader_side=CUSTOMER|VENDOR|STAFF` — customer booking-form uploads use CUSTOMER.
   */
  async listDocuments(
    id: string,
    opts?: { uploader_side?: 'CUSTOMER' | 'VENDOR' | 'STAFF' },
  ): Promise<unknown[]> {
    assertId(id);
    const res = await withGatewayRetry(() =>
      axiosInstance.get(JOB_API.documents(id), {
        params: opts?.uploader_side ? { uploader_side: opts.uploader_side } : undefined,
      }),
    );
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

  /** PATCH /jobs/:id/documents/:documentId/visibility */
  async patchDocumentVisibility(
    id: string,
    documentId: string,
    dto: { visible_to_customer?: boolean; visible_to_vendor?: boolean },
  ): Promise<unknown> {
    assertId(id);
    if (!documentId?.trim()) throw new Error('Document id is required.');
    return request(() =>
      axiosInstance.patch(JOB_API.documentVisibility(id, documentId.trim()), dto),
    );
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
  generateHawbDraftGated: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateHawbDraftGated(id), dto),
  generateHawbFinalGated: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateHawbFinalGated(id), dto),
  generatePreCanGated: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generatePreCanGated(id), dto),
  generateCanGated: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateCanGated(id), dto),
  generateDeliveryOrderGated: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateDeliveryOrderGated(id), dto),
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
  generateCourierReport: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateCourierReport(id), dto),
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
  generateJobPnlCustomDuty: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateJobPnlCustomDuty(id), dto),
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
  generateCrossBorderDeclaration: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateCrossBorderDeclaration(id), dto),
  generateCustomsTransit: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateCustomsTransit(id), dto),
  generateDeliveryNote: (id: string, dto?: GenerateJobDocumentDto) =>
    jobService.generateDocument(id, JOB_API.generateDeliveryNote(id), dto),
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

  /**
   * Track & Trace for a job (OpenAPI):
   * 1. GET /jobs/:id/tracking (Bearer) — preferred
   * 2. Linked shipment → GET /shipments/:id/tracking
   * 3. Job number → GET /track?ref=… (public Track & Trace)
   * 4. GET /jobs/:id/milestones (Bearer fallback)
   */
  async trackAndTrace(opts: {
    jobId: string;
    jobNumber?: string;
    shipmentId?: string;
    tenantSlug?: string;
  }): Promise<{
    source: 'job' | 'shipment' | 'public' | 'milestones';
    data: unknown;
  }> {
    assertId(opts.jobId);

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.tracking(opts.jobId)),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      if (data != null && data !== '') {
        return { source: 'job', data };
      }
    } catch {
      /* fall through */
    }

    let shipmentId =
      opts.shipmentId && isUuid(opts.shipmentId) ? opts.shipmentId : undefined;
    if (!shipmentId) {
      try {
        const rows = await this.listJobShipments(opts.jobId);
        for (const row of rows) {
          if (typeof row === 'string' && isUuid(row.trim())) {
            shipmentId = row.trim();
            break;
          }
          if (row && typeof row === 'object' && !Array.isArray(row)) {
            const rec = row as Record<string, unknown>;
            for (const key of ['id', 'shipment_id', 'shipmentId'] as const) {
              const value = rec[key];
              if (typeof value === 'string' && isUuid(value)) {
                shipmentId = value;
                break;
              }
            }
            if (shipmentId) break;
          }
        }
      } catch {
        /* ignore — fall through */
      }
    }

    if (shipmentId) {
      const { shipmentService } = await import(
        '@/features/shipments/services/shipment.service'
      );
      const data = await shipmentService.tracking(shipmentId);
      return { source: 'shipment', data };
    }

    const ref = (opts.jobNumber || '').trim();
    if (ref && !/^job\s/i.test(ref)) {
      try {
        const { publicTrackService } = await import(
          '@/features/public-track/services/publicTrack.service'
        );
        const data = await publicTrackService.trackRaw(opts.tenantSlug, ref);
        return { source: 'public', data };
      } catch {
        /* fall through to milestones */
      }
    }
    const milestones = await this.listMilestones(opts.jobId);
    return {
      source: 'milestones',
      data: {
        reference: ref || opts.jobId,
        milestones,
      },
    };
  },
};
