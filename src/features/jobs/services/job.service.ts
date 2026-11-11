import { axiosInstance } from '@/lib/axios';
import { API_LIST_LIMIT_MAX, clampApiListLimit } from '@/lib/apiListLimit';
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
  normalizeAirWaybill,
  normalizeContainerStatusCatalog,
  normalizeContainerStatusCatalogRow,
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
import type { JobType } from '../constants/job.constants';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import {
  effectiveJobListType,
  inferJobTypeFromJobNumber,
} from '../utils/effectiveJobListType';
import { jobDetailTabLabel, toApiDetailTabKey } from '../utils/jobDetailTabs';
import {
  listRecentCreatedJobIds,
  listRecentCreatedJobSnapshots,
  rememberCreatedJob,
} from '../utils/recentCreatedJobs';
import {
  isOpsUnrestrictedRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions';
import { resolveJobDocumentFileUrl } from '../utils/resolveJobDocumentFileUrl';
import { sanitizeModeBookingFormPut } from '../utils/sanitizeModeBookingFormPut';
import {
  emptyJobTrackingProfile,
  normalizeJobTrackingProfile,
  toUpsertJobTrackingProfileDto,
} from '../utils/normalizeJobTrackingProfile';
import { useAuthStore } from '@/store/authStore';

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
  SendDeliveryAcknowledgementDto,
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
  PatchJobHoldDto,
  ReopenJobDto,
  ResumeJobDto,
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
  StaffBookingFormMode,
  UpdateSeaFclJobDetailDto,
  UpdateSeaLclJobDetailDto,
  UpdateStuffingRecordDto,
  UpsertContainerFreeDaysDto,
  UpsertJobDimensionLineDto,
  PatchJobDepartmentDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
  UpsertJobCustomsRefDto,
  UpsertJobTrackingProfileDto,
  JobTrackingProfile,
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

/** Backend-allowed by-category keys (must match API enum). */
const JOB_BY_CATEGORY_SET = new Set([
  'on_hold',
  'delayed',
  'delivered',
  'cancelled',
  'completed',
  'in_progress',
]);

const STATUS_BY_JOB_CATEGORY: Partial<
  Record<string, NonNullable<JobListParams['status']>>
> = {
  on_hold: 'ON_HOLD',
  in_progress: 'IN_PROGRESS',
  delivered: 'DELIVERED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

async function listByCategorySingle(
  category: string,
  params: JobListParams = {},
): Promise<JobListResult> {
  const cat = category.trim().toLowerCase() || 'on_hold';
  if (!JOB_BY_CATEGORY_SET.has(cat)) {
    const status = STATUS_BY_JOB_CATEGORY[cat];
    return jobService.list({
      ...params,
      category: undefined,
      ...(status ? { status } : {}),
    });
  }
  try {
    const res = await withGatewayRetry(() =>
      axiosInstance.get(JOB_API.byCategory(cat), {
        params: buildListQuery({ ...params, category: undefined, status: undefined }),
      }),
    );
    const { items, meta } = unwrapList(res.data);
    const normalized = normalizeJobs(items);
    let jobs = normalized;
    try {
      jobs = await enrichJobsWithDisplayNames(normalized);
    } catch {
      jobs = normalized;
    }
    return {
      jobs,
      meta: normalizePaginationMeta(meta, jobs.length, params),
    };
  } catch {
    // Fallback: status only (do not send invalid/unknown category to GET /jobs).
    const status = STATUS_BY_JOB_CATEGORY[cat];
    return jobService.list({
      ...params,
      category: undefined,
      ...(status ? { status } : { category: cat }),
    });
  }
}

function buildListQuery(params: JobListParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {
    page: params.page ?? 1,
    limit: clampApiListLimit(params.limit, 20),
    order: params.order ?? 'desc',
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status) query.status = params.status;
  if (params.category?.trim()) query.category = params.category.trim();
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
  const normalized = normalizeJobs(items);
  // Enrichment is display-only. Staff 403 on GET /users must not wipe the list
  // (that caused job_count OK / Active shipments + /jobs/all empty).
  let jobs = normalized;
  try {
    jobs = await enrichJobsWithDisplayNames(normalized);
  } catch {
    jobs = normalized;
  }
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
  mode?: StaffBookingFormMode,
): Promise<ModeBookingForm> {
  const body = sanitizeModeBookingFormPut(dto, mode);
  const res = await withGatewayRetry(() => axiosInstance.put(url, body));
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
 * Staff list recovery when untyped GET /jobs is empty under operations_scope
 * (BE job_type:{in:[]} ) while dashboard-counts still reports job_count.
 * Fan out ONLY the caller's granted types — never the full role pack.
 */
async function fetchJobsViaGrantedTypeFanOut(
  params: JobListParams,
  scopeTypes: Array<NonNullable<JobListParams['job_type']>>,
): Promise<Job[]> {
  const allowed = new Set(scopeTypes.map((t) => canonicalizeJobType(String(t))));
  const typedOnly = scopeTypes.filter(
    (t) => canonicalizeJobType(String(t)) !== 'ROAD_FREIGHT',
  );
  const byId = new Map<string, Job>();
  const pageSize = API_LIST_LIMIT_MAX;
  const base = {
    ...params,
    job_types: undefined as JobListParams['job_types'],
    created_by: undefined,
    salesperson_id: undefined,
    department_id: undefined,
  };

  await Promise.all(
    typedOnly.map(async (job_type) => {
      try {
        let pageNum = 1;
        let apiTotal = Number.POSITIVE_INFINITY;
        while (pageNum <= 20) {
          const page = await fetchJobListPage(
            {
              ...base,
              job_type,
              page: pageNum,
              limit: pageSize,
              order: base.order ?? 'desc',
            },
            { skipErrorToast: true },
          );
          if (typeof page.meta?.total === 'number') apiTotal = page.meta.total;
          for (const job of page.jobs ?? []) {
            if (!job?.id) continue;
            const expected = canonicalizeJobType(String(job_type));
            let type = effectiveListJobType(job);
            if (!type || (type === 'AIR_EXPORT' && expected !== 'AIR_EXPORT')) {
              type = expected;
            }
            if (!allowed.has(type) && !allowed.has(expected)) continue;
            const stamped =
              job.job_type === expected ? job : { ...job, job_type: expected };
            byId.set(stamped.id, stamped);
          }
          const got = page.jobs?.length ?? 0;
          if (got === 0) break;
          if (pageNum * pageSize >= apiTotal) break;
          pageNum += 1;
        }
      } catch {
        /* type missing from token → empty; try next granted type */
      }
    }),
  );

  // ROAD_FREIGHT is often ACL-blocked on typed queries — recover via untyped scan
  // filtered client-side when the grant list includes road/land/courier.
  if (
    scopeTypes.some((t) =>
      ['ROAD_FREIGHT', 'LAND', 'COURIER'].includes(canonicalizeJobType(String(t))),
    )
  ) {
    try {
      const roadish = await fetchAllJobsMatchingTypes(base, [
        'ROAD_FREIGHT',
        'LAND',
        'COURIER',
      ]);
      for (const job of roadish.jobs) {
        if (job?.id) byId.set(job.id, job);
      }
    } catch {
      /* keep typed rows */
    }
  }

  return [...byId.values()];
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

/** Mid-code → job_type for search-prefix recovery (JOB/FI/… etc.). */
function jobTypeForMidCode(mid: string): JobType | undefined {
  switch (mid.toUpperCase()) {
    case 'FI':
      return 'SEA_FCL_IMPORT';
    case 'FE':
      return 'SEA_FCL_EXPORT';
    case 'LI':
      return 'SEA_LCL_IMPORT';
    case 'LE':
      return 'SEA_LCL_EXPORT';
    case 'AE':
      return 'AIR_EXPORT';
    case 'AI':
      return 'AIR_IMPORT';
    case 'RF':
      return 'ROAD_FREIGHT';
    case 'CC':
      return 'CUSTOMS_CLEARANCE';
    case 'NV':
      return 'NVOCC_EXPORT';
    case 'CR':
      return 'COURIER';
    default:
      return undefined;
  }
}

function midCodeForJobType(jobType: string): string | undefined {
  switch (canonicalizeJobType(String(jobType))) {
    case 'SEA_FCL_IMPORT':
      return 'FI';
    case 'SEA_FCL_EXPORT':
      return 'FE';
    case 'SEA_LCL_IMPORT':
      return 'LI';
    case 'SEA_LCL_EXPORT':
      return 'LE';
    case 'AIR_EXPORT':
      return 'AE';
    case 'AIR_IMPORT':
      return 'AI';
    case 'ROAD_FREIGHT':
    case 'LAND':
      return 'RF';
    case 'CUSTOMS_CLEARANCE':
      return 'CC';
    case 'NVOCC_EXPORT':
    case 'NVOCC_IMPORT':
      return 'NV';
    case 'COURIER':
      return 'CR';
    default:
      return undefined;
  }
}

/**
 * Job-number mid codes used by this tenant (e.g. JOB/FI/11/26/00004).
 * Staff list ACL often hides admin-created rows unless `search` matches these.
 */
function searchTokensForJobTypes(
  types: Array<NonNullable<JobListParams['job_type']>>,
): string[] {
  const tokens = new Set<string>(['JOB/', 'JOB']);
  for (const raw of types) {
    const mid = midCodeForJobType(String(raw));
    if (!mid) continue;
    // Prefer the same shapes staff type into the filter box (full prefix first).
    tokens.add(`JOB/${mid}`);
    tokens.add(`JOB/${mid}/`);
    tokens.add(`/${mid}/`);
    tokens.add(mid);
  }
  return [...tokens];
}

/** Infer job_type from a recovery search token when list rows omit/mis-label type. */
function jobTypeForSearchToken(searchToken: string): JobType | undefined {
  const t = searchToken.trim().toUpperCase();
  const fromNumber = inferJobTypeFromJobNumber(t.includes('/') ? t : `JOB/${t}/`);
  if (fromNumber) return fromNumber;
  const mid = t.replace(/^JOB\//, '').replace(/^\//, '').replace(/\/$/, '').split('/')[0];
  return mid ? jobTypeForMidCode(mid) : undefined;
}

function effectiveListJobType(job: Job): JobType {
  return effectiveJobListType(job);
}

/**
 * BE quirk: staff default GET /jobs omits admin-created jobs, but the same jobs
 * appear when search matches the job number (e.g. JOB/FI/…). Recover with
 * department number prefixes, then keep only the requested types.
 * Pages search results — admin creates can sit beyond the first page.
 * When dashboard-counts > list rows, deepen paging so mid-code search can catch up.
 */
async function fetchJobsVisibleViaSearchRecovery(
  params: JobListParams,
  types: Array<NonNullable<JobListParams['job_type']>>,
  opts?: { maxPages?: number },
): Promise<Job[]> {
  const allowed = new Set(types.map((t) => canonicalizeJobType(String(t))));
  const tokens = params.search?.trim()
    ? [params.search.trim()]
    : searchTokensForJobTypes(types);
  const byId = new Map<string, Job>();
  const maxSearchPages = Math.min(20, Math.max(5, opts?.maxPages ?? 5));

  await Promise.all(
    tokens.map(async (searchToken) => {
      const tokenType = jobTypeForSearchToken(searchToken);
      let pageNum = 1;
      let apiTotal = Number.POSITIVE_INFINITY;
      while (pageNum <= maxSearchPages) {
        try {
          const page = await fetchJobListPage(
            {
              page: pageNum,
              limit: API_LIST_LIMIT_MAX,
              order: params.order ?? 'desc',
              search: searchToken,
              status: params.status,
              branch_id: params.branch_id,
              // Critical: no job_type / created_by — same path as typing a job number.
            },
            { skipErrorToast: true },
          );
          if (typeof page.meta?.total === 'number') {
            apiTotal = page.meta.total;
          }
          const rows = page.jobs ?? [];
          for (const job of rows) {
            if (!job?.id) continue;
            const fromNum = inferJobTypeFromJobNumber(job.job_number);
            const rawField = job.job_type
              ? canonicalizeJobType(String(job.job_type))
              : undefined;
            let type = effectiveListJobType(job);
            // Prefer mid-code / search-token stamps over AIR_EXPORT fallback.
            if (fromNum && allowed.has(fromNum)) type = fromNum;
            else if (tokenType && allowed.has(tokenType)) type = tokenType;
            else if (rawField && allowed.has(rawField)) type = rawField;
            else if (!allowed.has(type)) {
              // Missing type defaulted to AIR_EXPORT — keep via granted search token.
              if (tokenType && allowed.has(tokenType) && !job.job_type) type = tokenType;
              else continue;
            }
            byId.set(job.id, job.job_type === type ? job : { ...job, job_type: type });
          }
          if (rows.length === 0) break;
          if (pageNum * API_LIST_LIMIT_MAX >= apiTotal) break;
          pageNum += 1;
        } catch {
          break;
        }
      }
    }),
  );

  return [...byId.values()];
}

/**
 * Scan JWT-scoped GET /jobs (any creator) and keep only the requested types.
 * Returns every match (no page slice) so department/dashboard merges do not
 * drop admin-created rows that sit past the caller's page limit.
 */
async function fetchAllJobsMatchingTypes(
  params: JobListParams,
  types: Array<NonNullable<JobListParams['job_type']>>,
): Promise<{ jobs: Job[]; apiTotal: number }> {
  const order = params.order ?? 'desc';
  const allowed = new Set(types.map((t) => canonicalizeJobType(String(t))));
  const byId = new Map<string, Job>();
  const pageSize = API_LIST_LIMIT_MAX;
  let apiTotal = Number.POSITIVE_INFINITY;
  let pageNum = 1;
  const maxPages = 20;

  while (pageNum <= maxPages) {
    const unfiltered = await fetchJobListPage({
      ...params,
      job_type: undefined,
      job_types: undefined,
      created_by: undefined,
      salesperson_id: undefined,
      department_id: undefined,
      status: params.status,
      page: pageNum,
      limit: pageSize,
      order,
    });
    if (typeof unfiltered.meta?.total === 'number') {
      apiTotal = unfiltered.meta.total;
    }
    for (const job of unfiltered.jobs ?? []) {
      if (!job?.id) continue;
      const type = effectiveListJobType(job);
      if (allowed.has(type)) {
        byId.set(job.id, job.job_type === type ? job : { ...job, job_type: type });
      }
    }
    const got = unfiltered.jobs?.length ?? 0;
    if (got === 0) break;
    if (pageNum * pageSize >= apiTotal) break;
    pageNum += 1;
  }

  const jobs = [...byId.values()].sort((a, b) => {
    const diff = jobSortTime(a) - jobSortTime(b);
    return order === 'asc' ? diff : -diff;
  });
  const scannedAll = Number.isFinite(apiTotal) && pageNum * pageSize >= apiTotal;
  return {
    jobs,
    apiTotal: scannedAll ? jobs.length : Math.max(jobs.length, Number.isFinite(apiTotal) ? apiTotal : 0),
  };
}

/**
 * GET /jobs with no job_type (BE JWT scopes visibility / any creator), then keep
 * only the requested department types. Pages through the unfiltered list so
 * section jobs are not lost behind newer jobs of other types (staff Sea Import, etc.).
 */
async function fetchJobsFilteredByTypes(
  params: JobListParams,
  types: Array<NonNullable<JobListParams['job_type']>>,
): Promise<JobListResult> {
  const page = params.page ?? 1;
  const limit = clampApiListLimit(params.limit, 20);
  const { jobs: merged, apiTotal } = await fetchAllJobsMatchingTypes(params, types);
  const start = (page - 1) * limit;
  const slice = merged.slice(start, start + limit);
  const total = Math.max(apiTotal, merged.length);
  return {
    jobs: slice,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit) || 1),
    },
  };
}

/**
 * Interim hydrate when list ACL still hides jobs the staff just created.
 * Prefer session snapshots (create response) so list/dashboard work even when
 * GET /jobs and GET /jobs/:id are gated for staff. Only merges types in scope.
 * Permanent fix: BE scopes findAll/getOne/dashboard by visible_job_types only
 * (converted-customer gate is for quotes, not jobs).
 */
async function mergeRecentCreatedJobs(
  jobs: Job[],
  opts?: { jobTypes?: Array<NonNullable<JobListParams['job_type']>> | null },
): Promise<Job[]> {
  // Explicit empty allow-list → locked scope; do not leak recent creates.
  if (opts && Array.isArray(opts.jobTypes) && opts.jobTypes.length === 0) {
    return jobs;
  }

  const typeFilter = opts?.jobTypes?.map(String) ?? null;
  const byId = new Map(jobs.map((j) => [j.id, j]));

  for (const snap of listRecentCreatedJobSnapshots({ jobTypes: typeFilter })) {
    if (!byId.has(snap.id)) byId.set(snap.id, snap);
  }

  const recentIds = listRecentCreatedJobIds({ jobTypes: typeFilter });
  const missing = recentIds.filter((id) => !byId.has(id)).slice(0, 15);
  if (!missing.length) return [...byId.values()];

  const allowed = opts?.jobTypes?.length
    ? new Set(opts.jobTypes.map((t) => canonicalizeJobType(String(t))))
    : null;

  await Promise.all(
    missing.map(async (id) => {
      try {
        const job = await findJobByRef(id);
        if (!job?.id) return;
        if (allowed && !allowed.has(canonicalizeJobType(String(job.job_type ?? '')))) {
          return;
        }
        byId.set(job.id, job);
      } catch {
        /* detail may also be gated — snapshot above is enough */
      }
    }),
  );

  return [...byId.values()];
}

/** SALE → customer visibility; COST → vendor (OpenAPI defaults). */
function defaultChargeAttachmentVisibility(
  side: NonNullable<CreateJobChargeAttachmentDto['side']>,
  overrides: Partial<CreateJobChargeAttachmentDto> = {},
): Required<
  Pick<
    CreateJobChargeAttachmentDto,
    | 'visible_to_customer'
    | 'visible_to_vendor'
    | 'downloadable_by_customer'
    | 'downloadable_by_vendor'
  >
> {
  const sale = side === 'SALE';
  const cost = side === 'COST';
  return {
    visible_to_customer:
      typeof overrides.visible_to_customer === 'boolean'
        ? overrides.visible_to_customer
        : sale,
    visible_to_vendor:
      typeof overrides.visible_to_vendor === 'boolean'
        ? overrides.visible_to_vendor
        : cost,
    downloadable_by_customer:
      typeof overrides.downloadable_by_customer === 'boolean'
        ? overrides.downloadable_by_customer
        : sale,
    downloadable_by_vendor:
      typeof overrides.downloadable_by_vendor === 'boolean'
        ? overrides.downloadable_by_vendor
        : cost,
  };
}

function normalizeChargeAttachment(
  raw: unknown,
  fallback: CreateJobChargeAttachmentDto & { file_name?: string; file_url?: string },
): JobChargeAttachment {
  const r =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const nested =
    r.attachment && typeof r.attachment === 'object' && !Array.isArray(r.attachment)
      ? (r.attachment as Record<string, unknown>)
      : r;
  const bool = (v: unknown): boolean | undefined =>
    typeof v === 'boolean' ? v : v === 'true' ? true : v === 'false' ? false : undefined;
  return {
    id: typeof nested.id === 'string' ? nested.id : undefined,
    file_name: String(
      nested.file_name ?? nested.fileName ?? fallback.file_name ?? '',
    ),
    file_url: String(nested.file_url ?? nested.fileUrl ?? fallback.file_url ?? ''),
    s3_key:
      typeof nested.s3_key === 'string'
        ? nested.s3_key
        : typeof nested.s3Key === 'string'
          ? nested.s3Key
          : fallback.s3_key,
    file_size: Number.isFinite(Number(nested.file_size ?? nested.fileSize ?? fallback.file_size))
      ? Number(nested.file_size ?? nested.fileSize ?? fallback.file_size)
      : undefined,
    mime_type:
      typeof nested.mime_type === 'string'
        ? nested.mime_type
        : typeof nested.mimeType === 'string'
          ? nested.mimeType
          : fallback.mime_type,
    side: String(nested.side ?? fallback.side ?? 'CHARGE') as JobChargeAttachment['side'],
    purpose: String(
      nested.purpose ?? fallback.purpose ?? 'GENERAL',
    ) as JobChargeAttachment['purpose'],
    visible_to_customer:
      bool(nested.visible_to_customer ?? nested.visibleToCustomer) ??
      fallback.visible_to_customer,
    visible_to_vendor:
      bool(nested.visible_to_vendor ?? nested.visibleToVendor) ??
      fallback.visible_to_vendor,
    downloadable_by_customer:
      bool(nested.downloadable_by_customer ?? nested.downloadableByCustomer) ??
      fallback.downloadable_by_customer,
    downloadable_by_vendor:
      bool(nested.downloadable_by_vendor ?? nested.downloadableByVendor) ??
      fallback.downloadable_by_vendor,
    marked_paid:
      bool(r.marked_paid ?? r.markedPaid ?? nested.marked_paid ?? nested.markedPaid) ===
      true,
    mark_paid_warning:
      typeof (r.mark_paid_warning ?? r.markPaidWarning) === 'string'
        ? String(r.mark_paid_warning ?? r.markPaidWarning)
        : typeof (nested.mark_paid_warning ?? nested.markPaidWarning) === 'string'
          ? String(nested.mark_paid_warning ?? nested.markPaidWarning)
          : undefined,
    created_at:
      typeof nested.created_at === 'string'
        ? nested.created_at
        : typeof nested.createdAt === 'string'
          ? nested.createdAt
          : undefined,
  };
}

export const jobService = {
  /**
   * Load jobs for Active shipments / department / hub.
   * BE: GET /jobs + dashboard-counts share buildVisibleJobsBaseWhere /
   * resolveVisibleJobTypes. Staff list ignores org department_id; admin MIS may use it.
   * FE:
   * - Plain GET /jobs first — trust BE rows (same ACL as job_count)
   * - If under-delivered vs expectedTotal, recover via typed + search for probeTypes only
   * - Never invent created_by / ops_user / salesperson
   * - Staff: never send org department_id (13/14 jobs can have department_id null)
   */
  async listVisibleJobs(
    params: JobListParams = {},
    opts?: {
      scopeTypes?: JobType[] | null;
      /** Kept for callers; plain list is no longer client-filtered by this. */
      scopeConfident?: boolean;
      /** Typed fan-out + search recovery targets (defaults to scopeTypes). */
      probeTypes?: JobType[] | null;
      /**
       * From GET /jobs/dashboard-counts job_count. When list under-delivers,
       * deepen mid-code search recovery for probeTypes only (never full JOB_TYPES).
       */
      expectedTotal?: number;
    },
  ): Promise<JobListResult> {
    const page = params.page ?? 1;
    const limit = clampApiListLimit(params.limit, 20);
    const order = params.order ?? 'desc';
    const expectedTotal = Math.max(0, Number(opts?.expectedTotal ?? 0) || 0);

    const isAdmin = opts?.scopeTypes === null || opts?.scopeTypes === undefined;
    let probeTypes: JobType[] = Array.isArray(opts?.probeTypes)
      ? opts.probeTypes
      : Array.isArray(opts?.scopeTypes)
        ? opts.scopeTypes
        : [];
    let metaVisible: string[] | null | undefined;
    let plainApiTotal = 0;

    const baseParams: JobListParams = {
      ...params,
      job_type: undefined,
      job_types: undefined,
      created_by: params.created_by,
      salesperson_id: params.salesperson_id,
      // Admin MIS may filter by org department_id; staff must not (ACL is job type).
      department_id:
        isAdmin && String(params.department_id ?? '').trim()
          ? params.department_id
          : undefined,
    };
    // Default views: any creator in scope.
    if (!String(params.created_by ?? '').trim()) baseParams.created_by = undefined;
    if (!String(params.salesperson_id ?? '').trim()) baseParams.salesperson_id = undefined;

    const byId = new Map<string, Job>();

    const ingest = (jobs: Job[] | undefined, allow?: Set<JobType> | null) => {
      for (const job of jobs ?? []) {
        if (!job?.id) continue;
        let type = effectiveListJobType(job);
        if (allow && !allow.has(type)) {
          const fromNum = inferJobTypeFromJobNumber(job.job_number);
          if (fromNum && allow.has(fromNum)) type = fromNum;
          else continue;
        }
        byId.set(job.id, job.job_type === type ? job : { ...job, job_type: type });
      }
    };

    // 1) Plain GET /jobs — trust BE-scoped rows (same visibility as job_count).
    try {
      let pageNum = 1;
      let reported = Number.POSITIVE_INFINITY;
      const pageSize = API_LIST_LIMIT_MAX;
      while (pageNum <= 20) {
        const result = await fetchJobListPage(
          {
            ...baseParams,
            page: pageNum,
            limit: pageSize,
            order,
          },
          { skipErrorToast: true },
        );
        if (
          metaVisible === undefined &&
          result.meta &&
          Object.prototype.hasOwnProperty.call(result.meta, 'visible_job_types')
        ) {
          metaVisible = result.meta.visible_job_types;
          if (metaVisible === null) {
            // Admin / unrestricted — no staff probes needed once plain list is complete.
            probeTypes = [];
          } else if (Array.isArray(metaVisible) && metaVisible.length > 0) {
            probeTypes = [
              ...new Set(metaVisible.map((t) => canonicalizeJobType(String(t)))),
            ] as JobType[];
          }
          // Empty visible_job_types + expectedTotal > 0: do NOT hard-empty — recover below.
        }
        // Critical: do not client-filter plain BE rows by FE allow-list.
        ingest(result.jobs, null);
        if (typeof result.meta?.total === 'number') {
          reported = result.meta.total;
          plainApiTotal = Math.max(plainApiTotal, result.meta.total);
        }
        const got = result.jobs?.length ?? 0;
        if (got === 0) break;
        if (pageNum * pageSize >= reported) break;
        pageNum += 1;
      }
    } catch {
      /* typed merge below */
    }

    const underDelivered =
      byId.size === 0 ||
      (expectedTotal > 0 && byId.size < expectedTotal) ||
      (plainApiTotal > 0 && byId.size < plainApiTotal);

    const needRecovery =
      !isAdmin && underDelivered && probeTypes.length > 0;

    // 2) Staff recovery when plain list under-delivers vs count / API total.
    // Trust BE typed/search rows (no client allow-list drop — that caused 14→0).
    if (needRecovery) {
      try {
        ingest(await fetchJobsViaGrantedTypeFanOut(baseParams, probeTypes), null);
      } catch {
        /* keep plain rows */
      }

      const searchPages = Math.min(
        20,
        Math.max(8, Math.ceil(Math.max(expectedTotal, plainApiTotal, 1) / API_LIST_LIMIT_MAX) + 2),
      );
      try {
        ingest(
          await fetchJobsVisibleViaSearchRecovery(baseParams, probeTypes, {
            maxPages: searchPages,
          }),
          null,
        );
      } catch {
        /* keep what we have */
      }

      if (expectedTotal > byId.size) {
        try {
          ingest(
            await fetchJobsVisibleViaSearchRecovery(baseParams, probeTypes, {
              maxPages: 20,
            }),
            null,
          );
        } catch {
          /* keep what we have */
        }
      }
    }

    const merged = [...byId.values()].sort((a, b) => {
      const diff = jobSortTime(a) - jobSortTime(b);
      return order === 'asc' ? diff : -diff;
    });

    // Prefer the larger of merged rows, plain meta.total, and dashboard job_count
    // so callers keep paging/recovering when list under-delivers vs counts.
    const total = Math.max(
      merged.length,
      plainApiTotal > 0 ? plainApiTotal : 0,
      expectedTotal > 0 ? expectedTotal : 0,
    );

    const start = (page - 1) * limit;
    return {
      jobs: merged.slice(start, start + limit),
      meta: {
        page,
        limit,
        total: total || merged.length,
        totalPages: Math.max(1, Math.ceil((total || merged.length) / limit) || 1),
        ...(metaVisible !== undefined
          ? { visible_job_types: metaVisible }
          : isAdmin
            ? { visible_job_types: null }
            : Array.isArray(probeTypes) && probeTypes.length
              ? { visible_job_types: probeTypes }
              : {}),
      },
    };
  },

  /**
   * GET /jobs — API accepts a single `job_type` query.
   * Segment lists pass `job_types` (e.g. ROAD_FREIGHT + LAND); we fan out per type
   * and merge so converted road jobs are not lost behind other modes on page 1.
   * Soft-failed types (403 ROAD_FREIGHT ACL) are recovered via unfiltered list + filter.
   */
  async list(params: JobListParams = {}): Promise<JobListResult> {
    try {
      const skipHydrate = Boolean(params.skip_client_hydrate);
      // Client-only flag — never send to API.
      const { skip_client_hydrate: _skipHydrateFlag, ...paramsNoHydrateFlag } = params;
      void _skipHydrateFlag;

      // Explicit empty scope (visible_job_types: []) — no ops jobs.
      if (
        Array.isArray(paramsNoHydrateFlag.job_types) &&
        paramsNoHydrateFlag.job_types.length === 0 &&
        !paramsNoHydrateFlag.job_type
      ) {
        return emptyJobListResult(clampApiListLimit(paramsNoHydrateFlag.limit, 20));
      }

      // Never send job_type=ROAD_FREIGHT — backend ACL returns 403 for many roles.
      // Recover ROAD jobs via unfiltered list + quotation hydrate instead.
      const requestedType = paramsNoHydrateFlag.job_type
        ? canonicalizeJobType(String(paramsNoHydrateFlag.job_type))
        : undefined;
      const safeParams: JobListParams =
        requestedType === 'ROAD_FREIGHT'
          ? { ...paramsNoHydrateFlag, job_type: undefined }
          : paramsNoHydrateFlag;

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

      const paginate = (jobs: Job[], apiTotal?: number): JobListResult => {
        const page = paramsNoHydrateFlag.page ?? 1;
        const limit = clampApiListLimit(paramsNoHydrateFlag.limit, 20);
        const order = paramsNoHydrateFlag.order ?? 'desc';
        const merged = [...jobs].sort((a, b) => {
          const diff = jobSortTime(a) - jobSortTime(b);
          return order === 'asc' ? diff : -diff;
        });
        const start = (page - 1) * limit;
        const slice = merged.slice(start, start + limit);
        // Prefer BE total when present so soft-retry / recent merge cannot inflate counts.
        const total =
          typeof apiTotal === 'number' && Number.isFinite(apiTotal)
            ? Math.max(0, apiTotal)
            : merged.length;
        return {
          jobs: slice,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit) || 1),
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
        if (skipHydrate) {
          return emptyJobListResult(clampApiListLimit(paramsNoHydrateFlag.limit, 20));
        }
        let result = emptyJobListResult(clampApiListLimit(paramsNoHydrateFlag.limit, 20));
        try {
          result = await fetchJobsFilteredByTypes(safeParams, ['ROAD_FREIGHT']);
        } catch {
          /* empty */
        }
        const hydrated = await hydrateJobsFromConvertedQuotes(result.jobs, ['ROAD_FREIGHT']);
        return paginate(hydrated, result.meta.total);
      }

      // Department sections: merge BOTH strategies — some BE builds return staff rows only
      // on typed job_type=SEA_FCL_IMPORT, others only on unfiltered JWT scope. Using either
      // alone left Sea Import empty for staff who can see SEA_* grants.
      if (multiTypes && multiTypes.length >= 1) {
        const types = hydrateTypes(multiTypes);
        const allowed = new Set(types.map((t) => canonicalizeJobType(String(t))));
        const page = paramsNoHydrateFlag.page ?? 1;
        const limit = clampApiListLimit(paramsNoHydrateFlag.limit, 20);
        const perTypeLimit = clampApiListLimit(Math.max(limit * page, limit), 100);
        const typedOnly = types.filter(
          (t) => canonicalizeJobType(String(t)) !== 'ROAD_FREIGHT',
        );

        // Department lists: any creator. BE contract for staff = visible_job_types
        // only (not created_by / ops_user). FE strips creator filters on default view.
        const deptListBase = {
          ...safeParams,
          job_types: undefined as JobListParams['job_types'],
          created_by: undefined,
          salesperson_id: undefined,
          department_id: undefined,
        };

        const fetchTypedPages = async (): Promise<JobListResult[]> =>
          Promise.all(
            typedOnly.map(async (job_type) => {
              try {
                const pageResult = await fetchJobListPage(
                  {
                    ...deptListBase,
                    job_type,
                    page: 1,
                    limit: perTypeLimit,
                  },
                  { skipErrorToast: true },
                );
                // Stamp requested type when list rows omit job_type (normalize defaults to AIR_EXPORT).
                const stamped = (pageResult.jobs ?? []).map((j) => {
                  const current = canonicalizeJobType(String(j.job_type ?? ''));
                  const expected = canonicalizeJobType(String(job_type));
                  if (
                    !j.job_type ||
                    (current === 'AIR_EXPORT' && expected !== 'AIR_EXPORT')
                  ) {
                    return { ...j, job_type: expected };
                  }
                  return j;
                });
                return { ...pageResult, jobs: stamped };
              } catch (err) {
                if (isJobTypeAccessError(err)) return emptyJobListResult(perTypeLimit);
                throw err;
              }
            }),
          );

        if (skipHydrate) {
          // Dashboard open-status probes: typed fan-out only (no client hydrate).
          if (typedOnly.length === 1) {
            try {
              return await fetchJobListPage(
                {
                  ...deptListBase,
                  job_type: typedOnly[0],
                },
                { skipErrorToast: true },
              );
            } catch (err) {
              if (isJobTypeAccessError(err)) {
                return emptyJobListResult(clampApiListLimit(paramsNoHydrateFlag.limit, 20));
              }
              throw err;
            }
          }
          const pages = await fetchTypedPages();
          const byId = new Map<string, Job>();
          let apiTotal = 0;
          for (const pageResult of pages) {
            apiTotal += pageResult.meta.total ?? 0;
            for (const job of pageResult.jobs) {
              if (job?.id) byId.set(job.id, job);
            }
          }
          const merged = [...byId.values()].filter((j) =>
            allowed.has(canonicalizeJobType(String(j.job_type ?? ''))),
          );
          return paginate(merged, apiTotal);
        }

        const byId = new Map<string, Job>();
        const rawJwtById = new Map<string, Job>();
        let unfilteredTotal = 0;

        const stamp = (job: Job): Job => {
          const type = effectiveListJobType(job);
          return job.job_type === type ? job : { ...job, job_type: type };
        };

        const addIfAllowed = (jobs: Job[] | undefined) => {
          for (const job of jobs ?? []) {
            if (!job?.id) continue;
            const next = stamp(job);
            rawJwtById.set(next.id, next);
            if (allowed.has(effectiveListJobType(next))) {
              byId.set(next.id, next);
            }
          }
        };

        // 1) Plain JWT pages — BE scopes staff by visible_job_types (any creator).
        try {
          let pageNum = 1;
          let apiTotal = Number.POSITIVE_INFINITY;
          const pageSize = API_LIST_LIMIT_MAX;
          while (pageNum <= 20) {
            const pageResult = await fetchJobListPage(
              {
                ...deptListBase,
                job_type: undefined,
                job_types: undefined,
                page: pageNum,
                limit: pageSize,
                order: deptListBase.order ?? 'desc',
              },
              { skipErrorToast: true },
            );
            if (typeof pageResult.meta?.total === 'number') {
              apiTotal = pageResult.meta.total;
            }
            addIfAllowed(pageResult.jobs);
            const got = pageResult.jobs?.length ?? 0;
            if (got === 0) break;
            if (pageNum * pageSize >= apiTotal) break;
            pageNum += 1;
          }
          unfilteredTotal = Math.max(
            unfilteredTotal,
            byId.size,
            rawJwtById.size,
            Number.isFinite(apiTotal) ? apiTotal : 0,
          );
        } catch {
          /* typed / search below */
        }

        // 2) Typed job_type= fan-out.
        try {
          for (const pageResult of await fetchTypedPages()) {
            unfilteredTotal = Math.max(unfilteredTotal, pageResult.meta.total ?? 0);
            addIfAllowed(pageResult.jobs);
          }
        } catch {
          /* keep JWT rows */
        }

        // 3) Search recovery only if still empty.
        if (!String(deptListBase.search ?? '').trim() && byId.size === 0) {
          try {
            addIfAllowed(await fetchJobsVisibleViaSearchRecovery(deptListBase, types));
            unfilteredTotal = Math.max(unfilteredTotal, byId.size);
          } catch {
            /* keep what we have */
          }
        }

        // 4) Last resort: JWT returned rows but none matched segment types
        // (mis-labeled job_type). Show all JWT rows — BE already scoped staff.
        if (byId.size === 0 && rawJwtById.size > 0) {
          for (const job of rawJwtById.values()) byId.set(job.id, job);
          unfilteredTotal = Math.max(unfilteredTotal, byId.size);
        }

        const seeded = [...byId.values()];
        const hydrated = await hydrateJobsFromConvertedQuotes(seeded, types);
        const withRecent = await mergeRecentCreatedJobs(
          hydrated.map(stamp),
          { jobTypes: types },
        );
        return paginate(withRecent, Math.max(unfilteredTotal, withRecent.length));
      }

      const base = await fetchJobListPage(safeParams, { skipErrorToast: wantsRoadFreight });
      if (skipHydrate) {
        return base;
      }
      if (wantsRoadFreight || !safeParams.job_type) {
        const hydrated = await hydrateJobsFromConvertedQuotes(base.jobs, ['ROAD_FREIGHT']);
        if (requestedType === 'ROAD_FREIGHT') {
          const roadOnly = hydrated.filter(
            (j) => canonicalizeJobType(String(j.job_type ?? '')) === 'ROAD_FREIGHT',
          );
          return paginate(
            await mergeRecentCreatedJobs(roadOnly, {
              jobTypes: ['ROAD_FREIGHT', 'LAND', 'COURIER'],
            }),
            base.meta.total,
          );
        }
        if (!safeParams.job_type && hydrated.length !== base.jobs.length) {
          const byId = new Map(base.jobs.map((j) => [j.id, j]));
          for (const j of hydrated) {
            if (!byId.has(j.id)) byId.set(j.id, j);
          }
          return paginate(await mergeRecentCreatedJobs([...byId.values()]), base.meta.total);
        }
      }

      return {
        ...base,
        jobs: await mergeRecentCreatedJobs(base.jobs),
        meta: {
          ...base.meta,
          // Do not inflate total above BE — recent merge is display-only for missing rows.
          total: base.meta.total,
        },
      };
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

  /** PATCH /jobs/:id/detail/show_all — partial header fields by name/code. */
  async patchShowAll(
    id: string,
    dto: import('../types/job.types').PatchShowAllDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() =>
      axiosInstance.patch(JOB_API.detailTab(id, 'show_all'), dto),
    );
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

  /** GET /jobs/container-statuses — system + custom (active preferred). */
  async listContainerStatuses(): Promise<
    import('../types/job.types').ContainerStatusCatalogOption[]
  > {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.containerStatuses),
      );
      return normalizeContainerStatusCatalog(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createContainerStatus(
    dto: import('../types/job.types').CreateContainerStatusCatalogDto,
  ): Promise<import('../types/job.types').ContainerStatusCatalogOption> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.containerStatuses, dto),
      );
      const row = normalizeContainerStatusCatalogRow(unwrapEntity(res.data));
      if (!row) throw new Error('Container status create returned no row.');
      return row;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateContainerStatus(
    id: string,
    dto: import('../types/job.types').UpdateContainerStatusCatalogDto,
  ): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(JOB_API.containerStatusById(id), dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deactivateContainerStatus(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(JOB_API.containerStatusById(id)),
      );
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

  /**
   * POST /jobs/:id/acknowledgement/send —
   * first send: message (+ optional file);
   * later: file-only resend when fields are locked (proof_only).
   */
  async sendAcknowledgement(
    id: string,
    body: SendDeliveryAcknowledgementDto = {},
  ): Promise<DeliveryAcknowledgement> {
    assertId(id);
    const message = (body.message ?? body.remarks ?? '').trim();
    const proofOnly = body.proof_only === true || (!message && Boolean(body.file));
    if (!proofOnly && !message) {
      throw new Error('Enter a written acknowledgement message for the customer.');
    }
    if (proofOnly && !body.file) {
      throw new Error('Attach a proof file to resend acknowledgement.');
    }
    try {
      let res;
      if (body.file) {
        const form = new FormData();
        if (proofOnly) {
          form.append('proof_only', 'true');
        } else if (message) {
          form.append('message', message);
          form.append('remarks', message);
          if (body.container_id?.trim()) {
            form.append('container_id', body.container_id.trim());
          }
        }
        form.append('file', body.file, body.file.name);
        res = await withGatewayRetry(() =>
          axiosInstance.post(JOB_API.acknowledgementSend(id), form),
        );
      } else {
        const payload: Record<string, unknown> = { message, remarks: message };
        if (body.container_id?.trim()) payload.container_id = body.container_id.trim();
        res = await withGatewayRetry(() =>
          axiosInstance.post(JOB_API.acknowledgementSend(id), payload),
        );
      }
      return normalizeDeliveryAcknowledgement(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/acknowledgement/receive — mark RECEIVED_BY_ADMIN. */
  async receiveAcknowledgement(
    id: string,
    body: { notes?: string } | Record<string, unknown> = {},
  ): Promise<DeliveryAcknowledgement> {
    assertId(id);
    try {
      const payload: Record<string, unknown> = {};
      if (typeof body.notes === 'string' && body.notes.trim()) {
        payload.notes = body.notes.trim();
      }
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.acknowledgementReceive(id), payload),
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

  /** GET /jobs/:id/acknowledgement/attachments */
  async listAcknowledgementAttachments(id: string): Promise<unknown[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.acknowledgementAttachments(id)),
      );
      if (Array.isArray(res.data)) return res.data;
      const unwrapped = unwrapEntity(res.data);
      if (Array.isArray(unwrapped)) return unwrapped;
      return unwrapList(res.data).items;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/acknowledgement/attachments — proof after first send. */
  async uploadAcknowledgementAttachment(id: string, file: File): Promise<unknown> {
    assertId(id);
    try {
      const form = new FormData();
      form.append('file', file, file.name);
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.acknowledgementAttachments(id), form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/acknowledgement/attachments/:attachmentId/download */
  async downloadAcknowledgementAttachment(
    id: string,
    attachmentId: string,
  ): Promise<Blob> {
    assertId(id);
    assertId(attachmentId);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(
          JOB_API.acknowledgementAttachmentDownload(id, attachmentId),
          { responseType: 'blob' },
        ),
      );
      return res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart]);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/ledger — invoices + credit/debit notes for the job. */
  async getLedger(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.ledger(id)));
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/port-token — admin view of customer port-token form + containers. */
  async getPortToken(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.portToken(id)));
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/port-token/confirm — admin issue/record port token. */
  async confirmPortToken(
    id: string,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.portTokenConfirm(id), body),
      );
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /jobs/:id/containers/generate-shipments — one shipment per ACTUAL container. */
  async generateShipmentsFromContainers(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.generateShipmentsFromContainers(id)),
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
    // Best-effort only — must not block staff when TENANT_ADMIN is required to manage formats.
    await ensureJobNumberFormatReady().catch(() => undefined);

    const companyId = await resolveSessionCompanyIdAsync(
      typeof dto.company_id === 'string' ? dto.company_id : undefined,
    );
    const branchId = await ensureJobBranchReady(companyId || undefined);
    const sessionUser = useAuthStore.getState().user;
    const sessionUserId = sessionUser?.id?.trim() || '';
    // Admin/branch manager creates must not auto-own the job — staff with the same
    // job_type grant should see it on list / Active shipments (any creator).
    const adminCreator = isOpsUnrestrictedRole(
      resolveAuthRoleSlug(sessionUser?.role),
    );

    const dtoWithContext: CreateJobDto = {
      ...(companyId && !dto.company_id ? { ...dto, company_id: companyId } : dto),
      branch_id: branchId,
      // Staff creates: default ops assignment to self for "My jobs". Admin: leave blank.
      ...(sessionUserId && !dto.ops_user_id && !adminCreator
        ? { ops_user_id: sessionUserId }
        : {}),
    };

    const body = prepareJobPayload(dtoWithContext);

    const created = await request(
      () => axiosInstance.post(JOB_API.list, body, JOB_POST_AXIOS_CONFIG),
      normalizeJob,
    );
    if (created?.id) rememberCreatedJob(created);
    return created;
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

  /** POST /jobs/:id/stop — status → ON_HOLD. Only whitelisted DTO keys (Nest forbidNonWhitelisted). */
  async stop(id: string, dto: StopJobDto = {}): Promise<Job> {
    assertId(id);
    const reason = String(dto.reason ?? dto.hold_reason ?? '').trim();
    const body: Record<string, unknown> = {};
    if (reason) body.reason = reason;
    if (typeof dto.expected_release_at === 'string' && dto.expected_release_at.trim()) {
      body.expected_release_at = dto.expected_release_at.trim();
    }
    if (typeof dto.held_at === 'string' && dto.held_at.trim()) {
      body.held_at = dto.held_at.trim();
    }
    try {
      return await request(() => axiosInstance.post(JOB_API.stop(id), body), normalizeJob);
    } catch (error) {
      // Some Stop DTOs only allow `reason` / `expected_release_at` — retry without held_at.
      if (body.held_at) {
        const msg = getErrorMessage(error);
        if (/held_at/i.test(msg) && /should not exist|whitelist|forbidden/i.test(msg)) {
          delete body.held_at;
          return request(() => axiosInstance.post(JOB_API.stop(id), body), normalizeJob);
        }
      }
      throw error;
    }
  },

  /** POST /jobs/:id/resume — leave ON_HOLD (default status IN_PROGRESS). */
  async resume(id: string, dto: ResumeJobDto): Promise<Job> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.resume(id), dto), normalizeJob);
  },

  /**
   * Update hold metadata while ON_HOLD.
   * Prefer PATCH /jobs/:id/hold; if the route is missing (404/405/501), fall back to
   * POST /jobs/:id/stop. Never send `hold_reason` — backend Stop/Hold DTOs use `reason`.
   */
  async patchHold(id: string, dto: PatchJobHoldDto): Promise<Job> {
    assertId(id);
    const reason = String(dto.reason ?? dto.hold_reason ?? '').trim();
    const body: Record<string, unknown> = {};
    if (reason) body.reason = reason;
    if (dto.expected_release_at === null) {
      body.expected_release_at = null;
    } else if (
      typeof dto.expected_release_at === 'string' &&
      dto.expected_release_at.trim()
    ) {
      body.expected_release_at = dto.expected_release_at.trim();
    }
    if (dto.held_at === null) {
      body.held_at = null;
    } else if (typeof dto.held_at === 'string' && dto.held_at.trim()) {
      body.held_at = dto.held_at.trim();
    }

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(JOB_API.hold(id), body),
      );
      const job = normalizeJob(unwrapEntity(res.data) ?? res.data);
      if (job) return job;
      return this.getById(id);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 405 || status === 501) {
        return this.stop(id, {
          reason: reason || undefined,
          ...(typeof dto.expected_release_at === 'string' && dto.expected_release_at.trim()
            ? { expected_release_at: dto.expected_release_at.trim() }
            : {}),
          ...(typeof dto.held_at === 'string' && dto.held_at.trim()
            ? { held_at: dto.held_at.trim() }
            : {}),
        });
      }
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/by-category/:category — on_hold | delayed | delivered | cancelled | completed | in_progress */
  async listByCategory(
    category: string,
    params: JobListParams = {},
  ): Promise<JobListResult> {
    return listByCategorySingle(category, params);
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
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(JOB_API.department(id), payload),
      );
      const fromBody = normalizeJob(unwrapEntity(res.data) ?? res.data);
      // Backend often returns a sparse ack (no job id) — do not throw "No data returned."
      if (fromBody) {
        return {
          ...fromBody,
          company_name: fromBody.company_name || dto.company_name || fromBody.company_name,
          branch_name: fromBody.branch_name || dto.branch_name || fromBody.branch_name,
          department_name:
            fromBody.department_name || dto.department_name || fromBody.department_name,
          salesperson_name:
            fromBody.salesperson_name || dto.salesperson_name || fromBody.salesperson_name,
        };
      }
      const fresh = await this.getById(id);
      return {
        ...fresh,
        ...(dto.company_name ? { company_name: dto.company_name } : {}),
        ...(dto.branch_name ? { branch_name: dto.branch_name } : {}),
        ...(dto.department_name ? { department_name: dto.department_name } : {}),
        ...(dto.salesperson_name ? { salesperson_name: dto.salesperson_name } : {}),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
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

  /**
   * Preferred: multipart POST /jobs/:id/charges/:chargeId/attachments
   * (file + side + purpose + visibility). Falls back to JOB_COSTING typed upload
   * + JSON metadata only when the multipart endpoint rejects the file field.
   */
  async uploadChargeAttachmentFile(
    id: string,
    chargeId: string,
    file: File,
    options: {
      side?: CreateJobChargeAttachmentDto['side'];
      purpose?: CreateJobChargeAttachmentDto['purpose'];
      visible_to_customer?: boolean;
      visible_to_vendor?: boolean;
      downloadable_by_customer?: boolean;
      downloadable_by_vendor?: boolean;
      amount_claimed?: string;
      payment_date?: string;
      reference_number?: string;
      notes?: string;
    } = {},
  ): Promise<JobChargeAttachment> {
    assertId(id);
    if (!isUuid(chargeId)) throw new Error('Invalid charge id.');
    const side = options.side ?? 'CHARGE';
    const purpose = options.purpose ?? 'GENERAL';
    const visibility = defaultChargeAttachmentVisibility(side, options);

    const form = new FormData();
    form.append('file', file);
    form.append('side', side);
    form.append('purpose', purpose);
    form.append('visible_to_customer', String(visibility.visible_to_customer));
    form.append('visible_to_vendor', String(visibility.visible_to_vendor));
    form.append(
      'downloadable_by_customer',
      String(visibility.downloadable_by_customer),
    );
    form.append(
      'downloadable_by_vendor',
      String(visibility.downloadable_by_vendor),
    );
    if (file.name) form.append('file_name', file.name);
    if (options.amount_claimed?.trim()) {
      form.append('amount_claimed', options.amount_claimed.trim());
    }
    if (options.payment_date?.trim()) {
      form.append('payment_date', options.payment_date.trim().slice(0, 10));
    }
    if (options.reference_number?.trim()) {
      form.append('reference_number', options.reference_number.trim());
    }
    if (options.notes?.trim()) form.append('notes', options.notes.trim());

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.chargeAttachments(id, chargeId), form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      return normalizeChargeAttachment(
        unwrapEntity(res.data) ?? res.data,
        {
          file_name: file.name,
          file_url: '',
          side,
          purpose,
          ...visibility,
        },
      );
    } catch (multipartError) {
      // Legacy fallback: typed JOB_COSTING doc then JSON attachment metadata.
      try {
        const uploaded = await this.uploadJobTypedDocument(id, 'JOB_COSTING', file);
        const file_name =
          String(uploaded.file_name ?? uploaded.fileName ?? file.name).trim() ||
          file.name;
        const s3_key =
          typeof uploaded.s3_key === 'string'
            ? uploaded.s3_key
            : typeof uploaded.s3Key === 'string'
              ? uploaded.s3Key
              : undefined;
        let file_url = String(
          uploaded.file_url ??
            uploaded.fileUrl ??
            uploaded.url ??
            uploaded.download_url ??
            '',
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
          throw multipartError;
        }
        if (!file_url && s3_key) file_url = s3_key;
        const file_size = Number.isFinite(
          Number(uploaded.file_size ?? uploaded.fileSize),
        )
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
          purpose,
          ...visibility,
        });
      } catch {
        throw formatAxiosError(multipartError);
      }
    }
  },

  /** POST /jobs/:id/charges/:chargeId/attachments (JSON metadata path). */
  async createChargeAttachment(
    id: string,
    chargeId: string,
    dto: CreateJobChargeAttachmentDto,
  ): Promise<JobChargeAttachment> {
    assertId(id);
    if (!isUuid(chargeId)) throw new Error('Invalid charge id.');
    const side = dto.side ?? 'CHARGE';
    const purpose = dto.purpose ?? 'GENERAL';
    const visibility = defaultChargeAttachmentVisibility(side, dto);
    const payload: CreateJobChargeAttachmentDto = {
      ...dto,
      side,
      purpose,
      ...visibility,
    };
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.chargeAttachments(id, chargeId), payload),
      );
      return normalizeChargeAttachment(
        unwrapEntity(res.data) ?? res.data,
        payload,
      );
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
    // Live API rejects charge_code / charge_code_name on composite create.
    const { charge_code: _cc, charge_code_name: _ccn, ...charge } = dto.charge ?? {};
    void _cc;
    void _ccn;
    const body: CreateJobChargesCompositeDto = {
      ...dto,
      charge: charge as CreateJobChargesCompositeDto['charge'],
    };
    return request(() => axiosInstance.post(JOB_API.chargesComposite(id), body));
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
   * Prefill by `source`: job (costing sale amounts), quotation, or auto (legacy).
   * `charge_ids` query is comma-separated.
   */
  async getSaleInvoiceForm(
    id: string,
    chargeIds: string[] = [],
    source?: 'job' | 'quotation' | 'auto',
  ): Promise<JobInvoiceFormPreview> {
    assertId(id);
    return request(() =>
      axiosInstance.get(JOB_API.invoicesSaleForm(id), {
        params: {
          charge_ids: chargeIds.filter(Boolean).join(','),
          ...(source ? { source } : {}),
        },
      }),
    ) as Promise<JobInvoiceFormPreview>;
  },

  /**
   * GET /jobs/:id/invoices/purchase/form
   * Prefill from vendor offer → costing → empty.
   * POST purchase requires cost_party_id (vendor) — validated in the form modal.
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
    const ediType = String(dto.edi_type).trim();
    const companyCodes = Array.isArray(dto.company_codes)
      ? [
          ...new Set(
            dto.company_codes
              .map((c) => String(c ?? '').trim())
              .filter((c) => c.length > 0),
          ),
        ]
      : undefined;
    const isCsdp = /MANIFEST_CSDP|CSDP/i.test(ediType);
    if (isCsdp && (!companyCodes || companyCodes.length === 0)) {
      throw new Error('At least one company code is required for MANIFEST_CSDP.');
    }
    return request(() =>
      axiosInstance.post(JOB_API.ediGenerate(id), {
        edi_type: ediType,
        ...(companyCodes?.length ? { company_codes: companyCodes } : {}),
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
    return putModeBookingFormRequest(
      JOB_API.seaFclBookingForm(id),
      dto as Record<string, unknown>,
      'SEA_FCL',
    );
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
    return putModeBookingFormRequest(
      JOB_API.seaLclBookingForm(id),
      dto as Record<string, unknown>,
      'SEA_LCL',
    );
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
    return putModeBookingFormRequest(
      JOB_API.courierBookingForm(id),
      dto as Record<string, unknown>,
      'COURIER',
    );
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
    return putModeBookingFormRequest(
      JOB_API.landBookingForm(id),
      dto as Record<string, unknown>,
      'LAND',
    );
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
    const body = sanitizeModeBookingFormPut(dto as Record<string, unknown>, 'ROAD_FREIGHT');
    return withRoadLandAclFallback(
      async () => {
        try {
          const res = await withGatewayRetry(() =>
            axiosInstance.put(JOB_API.roadFreightBookingForm(id), body, SOFT_ACL_AXIOS),
          );
          return asModeBookingForm(res.data);
        } catch (error) {
          if (isJobTypeAccessError(error)) throw error;
          throw formatAxiosError(error);
        }
      },
      () => this.putLandBookingForm(id, body as UpsertLandBookingFormDto),
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
      'WAREHOUSE',
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
      'CUSTOMS_CLEARANCE',
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
      // Nest forbidNonWhitelisted: status_code is read-only / not on UpdateJobContainerDto.
      const body: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(dto)) {
        if (value === undefined || key === 'status_code') continue;
        body[key] = value;
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

  /**
   * GET /jobs/:id/organizations — full envelope when present so org_types /
   * available_org_types catalogs are preserved for the Party tab dropdown.
   */
  async listOrganizations(id: string): Promise<unknown> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.organizations(id)));
    const unwrapped = unwrapEntity(res.data) ?? res.data;
    if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped)) {
      return unwrapped;
    }
    if (Array.isArray(unwrapped)) return unwrapped;
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

  async listAirWaybills(id: string): Promise<import('../types/job.types').JobAirWaybill[]> {
    assertId(id);
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.airWaybills(id)));
    return unwrapList(res.data).items.map((row) => normalizeAirWaybill(row)).filter(
      (r): r is import('../types/job.types').JobAirWaybill => Boolean(r),
    );
  },

  async createAirWaybill(
    id: string,
    dto: import('../types/job.types').UpsertAirWaybillDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.post(JOB_API.airWaybills(id), dto));
  },

  async updateAirWaybill(
    id: string,
    awbId: string,
    dto: import('../types/job.types').UpdateAirWaybillDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.patch(JOB_API.airWaybill(id, awbId), dto));
  },

  async deleteAirWaybill(id: string, awbId: string): Promise<void> {
    assertId(id);
    return requestVoid(() => axiosInstance.delete(JOB_API.airWaybill(id, awbId)));
  },

  /** PUT /jobs/:id/detail/mawb — air planned-container MAWB fields. */
  async updateAirMawb(
    id: string,
    dto: import('../types/job.types').UpdateAirMawbDto,
  ): Promise<unknown> {
    assertId(id);
    return request(() => axiosInstance.put(JOB_API.detailMawb(id), dto));
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

  /**
   * POST /jobs/:id/charges/:chargeId/mark-paid — proof file required.
   * Creates/posts invoice for that party amount then RECEIPT (SALE) or PAYMENT (COST).
   */
  async markChargePaid(
    id: string,
    chargeId: string,
    file: File,
    dto: {
      side?: 'SALE' | 'COST';
      amount?: number;
      payment_date?: string;
      reference?: string;
      notes?: string;
    } = {},
  ): Promise<unknown> {
    assertId(id);
    if (!chargeId?.trim()) throw new Error('Charge id is required.');
    if (!(file instanceof File) || file.size <= 0) {
      throw new Error('A payment proof file is required to mark the charge paid.');
    }
    const { postPaymentProofMultipart, formatAmountClaimed } = await import(
      '@/features/payment-proofs/utils/uploadPaymentProofMultipart'
    );
    const fields: Record<string, string | undefined> = {
      ...(dto.side ? { side: dto.side } : {}),
      ...(dto.amount != null && Number.isFinite(dto.amount)
        ? { amount_claimed: formatAmountClaimed(dto.amount) }
        : {}),
      ...(dto.payment_date?.trim()
        ? { payment_date: dto.payment_date.trim().slice(0, 10) }
        : {}),
      ...(dto.reference?.trim() ? { reference_number: dto.reference.trim() } : {}),
      ...(dto.notes?.trim() ? { notes: dto.notes.trim() } : {}),
    };
    return withGatewayRetry(() =>
      postPaymentProofMultipart(
        axiosInstance,
        JOB_API.chargeMarkPaid(id, chargeId),
        file,
        fields,
      ),
    );
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
    const { isMilestoneListRow, normalizeMilestone, unwrapEntity } = await import(
      '../utils/normalizeJob'
    );
    const res = await withGatewayRetry(() => axiosInstance.get(JOB_API.milestones(id)));
    const entity = unwrapEntity(res.data);
    const record =
      entity && typeof entity === 'object' && !Array.isArray(entity)
        ? (entity as Record<string, unknown>)
        : res.data && typeof res.data === 'object' && !Array.isArray(res.data)
          ? (res.data as Record<string, unknown>)
          : null;

    // Actions list = `milestones` (+ explicit custom arrays). Never fold Track &
    // Trace history into this list — those events look completed and hide Mark complete.
    const buckets: unknown[][] = [];
    const pushBucket = (arr: unknown) => {
      if (Array.isArray(arr) && arr.length) buckets.push(arr);
    };

    if (Array.isArray(entity)) {
      pushBucket(entity);
    } else if (record) {
      pushBucket(record.milestones);
      pushBucket(record.custom_milestones);
      pushBucket(record.customMilestones);
      pushBucket(record.customs);
      pushBucket(record.actions);
      const nestedData =
        record.data && typeof record.data === 'object' && !Array.isArray(record.data)
          ? (record.data as Record<string, unknown>)
          : null;
      if (nestedData) {
        pushBucket(nestedData.milestones);
        pushBucket(nestedData.custom_milestones);
        pushBucket(nestedData.customMilestones);
        pushBucket(nestedData.customs);
      }
      // Customs sometimes only appear in unified track items with is_custom / milestone fields.
      for (const key of ['items', 'history', 'timeline', 'events'] as const) {
        const arr = record[key];
        if (!Array.isArray(arr)) continue;
        const customs = arr.filter((row) => {
          if (!isMilestoneListRow(row)) return false;
          const r = row as Record<string, unknown>;
          return (
            r.is_custom === true ||
            r.isCustom === true ||
            typeof r.milestone === 'string' ||
            Boolean(r.milestone_key || r.milestoneKey || r.milestone_code || r.milestoneCode)
          );
        });
        pushBucket(customs);
      }
    }
    if (!buckets.length) {
      pushBucket(unwrapList(res.data).items.filter(isMilestoneListRow));
    }

    const byKey = new Map<string, import('../types/job.types').JobMilestone>();
    for (const bucket of buckets) {
      for (const raw of bucket) {
        if (!isMilestoneListRow(raw)) continue;
        const m = normalizeMilestone(raw);
        if (!m) continue;
        const key = String(m.milestone_key || m.milestone || m.id || '')
          .trim()
          .toUpperCase();
        if (!key) continue;
        const prev = byKey.get(key);
        if (!prev) {
          byKey.set(key, m);
          continue;
        }
        const actual_date = m.actual_date || prev.actual_date;
        const completed_at = m.completed_at || prev.completed_at;
        // Explicit false from either side keeps the row open for Mark complete.
        const explicitOpen = m.is_completed === false || prev.is_completed === false;
        byKey.set(key, {
          id: prev.id || m.id,
          milestone: m.milestone || prev.milestone,
          milestone_key: m.milestone_key || prev.milestone_key,
          description: m.description || prev.description,
          notes: m.notes || prev.notes,
          planned_date: m.planned_date || prev.planned_date,
          actual_date,
          completed_at,
          is_completed: explicitOpen
            ? Boolean(actual_date || completed_at)
            : Boolean(actual_date || completed_at) ||
              m.is_completed === true ||
              prev.is_completed === true,
        });
      }
    }

    return [...byKey.values()];
  },

  async createMilestone(
    id: string,
    dto: CreateCustomMilestoneDto,
  ): Promise<import('../types/job.types').JobMilestone> {
    assertId(id);
    const { normalizeMilestone, unwrapEntity } = await import('../utils/normalizeJob');
    const name = String(dto.milestone ?? '').trim();
    if (!name) throw new Error('Milestone name is required.');

    const body: CreateCustomMilestoneDto = {
      milestone: name,
      ...(dto.planned_date?.trim() ? { planned_date: dto.planned_date.trim() } : {}),
      ...(dto.actual_date?.trim() ? { actual_date: dto.actual_date.trim() } : {}),
      ...(dto.description?.trim() ? { description: dto.description.trim() } : {}),
      ...(dto.notes?.trim() ? { notes: dto.notes.trim() } : {}),
    };

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(JOB_API.milestones(id), body, { skipErrorToast: true }),
      );
      const raw = unwrapEntity(res.data) ?? res.data;
      const normalized = normalizeMilestone(raw);
      if (normalized) return normalized;
      // 201 with empty body — still treat as success using the submitted name.
      return {
        id: name,
        milestone: name,
        milestone_key: name,
        planned_date: body.planned_date,
        actual_date: body.actual_date,
        description: body.description,
        notes: body.notes,
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateMilestone(
    id: string,
    milestoneKey: string,
    dto: UpdateJobMilestoneDto,
  ): Promise<unknown> {
    assertId(id);
    const key = String(milestoneKey ?? '').trim();
    if (!key || key === 'undefined' || key === 'null') {
      throw new Error(
        'Milestone code/name is required. Use the code from GET /jobs/:id/milestones (e.g. SI_SUBMITTED).',
      );
    }
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
    dto: {
      visible_to_customer?: boolean;
      visible_to_vendor?: boolean;
      downloadable_by_customer?: boolean;
      downloadable_by_vendor?: boolean;
    },
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

  /** GET /jobs/:id/tracking/live — live vessel/flight card for this job. */
  async getTrackingLive(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.trackingLive(id)),
      );
      return unwrapEntity(res.data) ?? res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** Empty seed for first-open GET /jobs/:id/tracking/profile. */
  emptyTrackingProfile(): JobTrackingProfile {
    return emptyJobTrackingProfile();
  },

  /** GET /jobs/:id/tracking/profile — returns empty seed when API has no profile yet. */
  async getTrackingProfile(id: string): Promise<JobTrackingProfile> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(JOB_API.trackingProfile(id)),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      if (data == null || data === '') return this.emptyTrackingProfile();
      if (typeof data !== 'object' || Array.isArray(data)) {
        return this.emptyTrackingProfile();
      }
      return normalizeJobTrackingProfile(data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // First open / no profile yet — seed empty rather than fail the editor.
      if (status === 404) return this.emptyTrackingProfile();
      throw formatAxiosError(error);
    }
  },

  /** PUT /jobs/:id/tracking/profile */
  async upsertTrackingProfile(
    id: string,
    dto: UpsertJobTrackingProfileDto,
  ): Promise<JobTrackingProfile> {
    assertId(id);
    try {
      const payload = toUpsertJobTrackingProfileDto(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.put(JOB_API.trackingProfile(id), payload),
      );
      const data = unwrapEntity(res.data) ?? res.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return normalizeJobTrackingProfile(data);
      }
      return this.getTrackingProfile(id);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /jobs/:id/tracking/pdf — live Track & Trace PDF. */
  async downloadTrackingPdf(id: string, container?: string): Promise<Blob> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<Blob>(JOB_API.trackingPdf(id), {
          params: container?.trim() ? { container: container.trim() } : undefined,
          responseType: 'blob',
          headers: { Accept: 'application/pdf, application/octet-stream, */*' },
        }),
      );
      return res.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
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
        // Attach job milestone descriptions so Track & Trace can show customer text
        // even when history/timeline rows omit `description`.
        try {
          const milestones = await this.listMilestones(opts.jobId);
          if (milestones.length && data && typeof data === 'object' && !Array.isArray(data)) {
            const body = data as Record<string, unknown>;
            if (!Array.isArray(body.milestones) || body.milestones.length === 0) {
              body.milestones = milestones;
            }
          }
        } catch {
          /* tracking payload alone is still usable */
        }
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
