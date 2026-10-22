import { axiosInstance } from '@/lib/axios';
import type { ApiEnvelope } from '@/lib/apiEnvelope';
import { clampApiListLimit } from '@/lib/apiListLimit';
import { isUuid } from '@/lib/isUuid';
import { resolveSessionCompanyIdAsync } from '@/lib/resolveSessionCompanyId';
import { wakeApi, withGatewayRetry } from '@/lib/wakeApi';
import {
  formatShareEmailError,
  normalizeShareEmailResult,
  postStaffEmailWithPdf,
} from '@/features/shared/share-email';
import { ensureJobNumberFormatReady } from '@/features/organization/utils/ensureJobNumberFormat';
import { normalizeJob } from '@/features/jobs/utils/normalizeJob';
import { quotationToCreateJobDto } from '../utils/createJobFromQuotation';
import { QUOTATION_API } from '../api/quotation.api';
import { JOB_POST_AXIOS_CONFIG } from '@/features/jobs/utils/buildJobCreateCandidates';
import { ensureJobBranchReady, resolveOptionalBranchId } from '@/features/jobs/utils/ensureJobBranchReady';
import {
  normalizeQuotation,
  normalizeQuotationLine,
  normalizeQuotationLines,
  normalizeQuotations,
} from '../utils/normalizeQuotation';
import {
  prepareOnlineQuotePayload,
  prepareQuotationLinePayload,
  prepareQuotationPayload,
} from '../utils/prepareQuotationPayload';
import { normalizeQuotationPdfInfo } from '../utils/normalizeQuotationPdf';
import { normalizeQuotationDashboardStats } from '../utils/normalizeQuotationDashboard';
import { quotationTotalAmount } from '../utils/quotationDisplay';
import { formatShipmentsPermissionError } from '@/features/shipments/utils/shipmentPermissions';
import type {
  ApprovalDecisionDto,
  CreateOnlineQuoteDto,
  CreateQuotationDto,
  CreateQuotationLineDto,
  ExpireDueResult,
  GenerateQuotationPdfDto,
  MarkLostDto,
  PaginationMeta,
  Quotation,
  QuotationAnalyticsParams,
  QuotationLine,
  QuotationListParams,
  QuotationListResult,
  QuotationPdfInfo,
  QuotationReportParams,
  SendQuotationEmailDto,
  UpdateQuotationDto,
  UpdateQuotationLineDto,
} from '../types/quotation.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function strField(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function normalizeMeta(
  raw: unknown,
  fallbackTotal: number,
  params: { page?: number; limit?: number },
): PaginationMeta {
  const record = asRecord(raw);
  const page = Number(record?.page ?? params.page ?? 1) || 1;
  const limit = Number(record?.limit ?? params.limit ?? 20) || 20;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  return { page, limit, total, totalPages };
}

function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.quotations) && nested.quotations) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

/** Dig out a quotation-like object from varied online-quote response envelopes. */
function extractQuotationCandidate(raw: unknown): unknown {
  const candidates: unknown[] = [raw, unwrapEntity(raw)];
  const root = asRecord(raw);
  if (root) {
    candidates.push(
      root.data,
      root.quotation,
      root.result,
      root.payload,
      root.item,
      asRecord(root.data)?.quotation,
      asRecord(root.data)?.result,
      asRecord(root.data)?.item,
    );
  }
  for (const c of candidates) {
    if (!c) continue;
    const rec = asRecord(c);
    if (!rec) continue;
    if (rec.id || rec.quotation_id || rec.quotation_number || rec.quote_no) return c;
  }
  return unwrapEntity(raw);
}

function extractQuotationId(raw: unknown): string | null {
  const visited = new Set<unknown>();
  const stack: unknown[] = [raw, unwrapEntity(raw)];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || visited.has(cur)) continue;
    visited.add(cur);
    const rec = asRecord(cur);
    if (!rec) continue;
    for (const key of ['id', 'quotation_id', 'quote_id']) {
      const v = rec[key];
      if (typeof v === 'string' && isUuid(v.trim())) return v.trim();
    }
    for (const nest of [rec.data, rec.quotation, rec.result, rec.payload, rec.item]) {
      if (nest) stack.push(nest);
    }
  }
  return null;
}

function formatAxiosError(error: unknown): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }
  const axiosErr = error as {
    response?: { data?: { message?: string | string[]; error?: string }; status?: number };
    message?: string;
  };
  const data = axiosErr.response?.data;
  const message = data?.message;
  if (Array.isArray(message)) return new Error(message.map(String).join('; '));
  if (typeof message === 'string' && message.trim()) return new Error(message);
  if (typeof data?.error === 'string' && data.error.trim()) return new Error(data.error);
  return new Error(axiosErr.message || 'Request failed');
}

function assertId(id: string, label = 'quotation'): asserts id is string {
  if (!id || !isUuid(id)) throw new Error(`Invalid ${label} id.`);
}

function readableName(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || isUuid(trimmed)) return undefined;
  return trimmed;
}

function mergeQuotationForList(base: Quotation, detail: Quotation): Quotation {
  return {
    ...base,
    customer_name: readableName(base.customer_name) || readableName(detail.customer_name),
    department_name:
      readableName(base.department_name) || readableName(detail.department_name),
    salesperson_name:
      readableName(base.salesperson_name) || readableName(detail.salesperson_name),
    origin_port_id: base.origin_port_id || detail.origin_port_id,
    dest_port_id: base.dest_port_id || detail.dest_port_id,
    origin_port_code:
      readableName(base.origin_port_code) || readableName(detail.origin_port_code),
    dest_port_code:
      readableName(base.dest_port_code) || readableName(detail.dest_port_code),
    origin_port_name:
      readableName(base.origin_port_name) || readableName(detail.origin_port_name),
    dest_port_name:
      readableName(base.dest_port_name) || readableName(detail.dest_port_name),
    subtotal: base.subtotal ?? detail.subtotal,
    tax_total: base.tax_total ?? detail.tax_total,
    total_amount: base.total_amount ?? detail.total_amount,
    revenue_total: base.revenue_total ?? detail.revenue_total,
    cost_total: base.cost_total ?? detail.cost_total,
    discount_percent: base.discount_percent ?? detail.discount_percent,
    discount_amount: base.discount_amount ?? detail.discount_amount,
    lines: base.lines?.length ? base.lines : detail.lines,
    currency_code: base.currency_code || detail.currency_code,
  };
}

function needsListEnrichment(q: Quotation): boolean {
  const hasRouteIds = Boolean(q.origin_port_id || q.dest_port_id);
  const hasRouteLabels = Boolean(
    readableName(q.origin_port_code) ||
      readableName(q.dest_port_code) ||
      readableName(q.origin_port_name) ||
      readableName(q.dest_port_name),
  );
  const missingNames =
    (Boolean(q.customer_id) && !readableName(q.customer_name)) ||
    (Boolean(q.department_id) && !readableName(q.department_name)) ||
    (Boolean(q.salesperson_id) && !readableName(q.salesperson_name));
  return (hasRouteIds && !hasRouteLabels) || missingNames;
}

async function enrichQuotationsForList(quotations: Quotation[]): Promise<Quotation[]> {
  const targets = quotations.filter(
    (q) => quotationTotalAmount(q) == null || needsListEnrichment(q),
  );

  const detailById = new Map<string, Quotation>();
  if (targets.length) {
    await Promise.all(
      targets.slice(0, 25).map(async (q) => {
        try {
          const res = await withGatewayRetry(() =>
            axiosInstance.get<ApiEnvelope<Quotation> | Quotation>(QUOTATION_API.byId(q.id)),
          );
          const detail = normalizeQuotation(unwrapEntity(res.data));
          if (detail) detailById.set(q.id, detail);
        } catch {
          // Keep list row as-is when detail fetch fails.
        }
      }),
    );
  }

  let merged = quotations.map((q) => {
    const detail = detailById.get(q.id);
    return detail ? mergeQuotationForList(q, detail) : q;
  });

  // Resolve remaining UUID-backed labels via party / user / department masters.
  try {
    const { enrichQuotationsWithDisplayNames } = await import(
      '../utils/enrichQuotationsWithDisplayNames'
    );
    merged = await enrichQuotationsWithDisplayNames(merged);
  } catch {
    /* optional — UI maps still hide raw IDs */
  }

  return merged;
}

function buildListQuery(
  params: QuotationListParams | QuotationReportParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: clampApiListLimit(params.limit, 20),
    order: params.order ?? 'desc',
  };
  const copyKeys = [
    'search',
    'status',
    'job_type',
    'incoterm',
    'created_by',
    'from_date',
    'to_date',
  ] as const;
  for (const key of copyKeys) {
    const val = params[key];
    if (typeof val === 'string' && val.trim()) query[key] = val.trim();
  }
  const uuidKeys = [
    'customer_id',
    'salesperson_id',
    'branch_id',
    'company_id',
    'department_id',
    'carrier_id',
    'origin_port_id',
    'dest_port_id',
    'container_type_id',
  ] as const;
  for (const key of uuidKeys) {
    const val = params[key];
    if (typeof val === 'string' && isUuid(val)) query[key] = val;
  }
  return query;
}

function buildAnalyticsQuery(
  params: QuotationAnalyticsParams,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.from_date?.trim()) query.from_date = params.from_date.trim();
  if (params.to_date?.trim()) query.to_date = params.to_date.trim();
  if (params.job_type) query.job_type = params.job_type;
  for (const key of ['branch_id', 'salesperson_id', 'customer_id'] as const) {
    const val = params[key];
    if (val && isUuid(val)) query[key] = val;
  }
  return query;
}

async function postAction(url: string, body?: unknown): Promise<Quotation> {
  const res = await withGatewayRetry(() =>
    body !== undefined
      ? axiosInstance.post<unknown>(url, body)
      : axiosInstance.post<unknown>(url),
  );
  const quotation = normalizeQuotation(unwrapEntity(res.data));
  if (!quotation) throw new Error('Action succeeded but no quotation was returned.');
  return quotation;
}

function extractJobIdFromConvertResponse(raw: unknown): string {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return '';
  const nestedJob = asRecord(data.job);
  const candidates = [
    data.job_id,
    data.jobId,
    nestedJob?.id,
    root?.job_id,
    root?.jobId,
  ];
  for (const value of candidates) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  const asJob = normalizeJob(data);
  if (asJob?.id) return asJob.id;
  return '';
}

function extractShipmentIdFromResponse(raw: unknown): string {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return '';
  const nested = asRecord(data.shipment);
  const candidates = [
    data.shipment_id,
    data.shipmentId,
    nested?.id,
    root?.shipment_id,
    root?.shipmentId,
  ];
  for (const value of candidates) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  // Some generate-shipment responses return the shipment entity as data.
  if (isUuid(String(data.id ?? '')) && !asRecord(data.job_type) && !data.quotation_number) {
    const looksLikeShipment =
      data.shipment_number != null ||
      data.shipmentNumber != null ||
      data.reference != null ||
      String(data.entity_type ?? data.entityType ?? '').toUpperCase() === 'SHIPMENT';
    if (looksLikeShipment) return String(data.id);
  }
  return '';
}

function extractInvoiceIdFromConvertResponse(raw: unknown): string {
  const root = asRecord(raw);
  const data = asRecord(root?.data) ?? root;
  if (!data) return '';
  const nestedInvoice = asRecord(data.invoice);
  const candidates = [
    data.invoice_id,
    data.invoiceId,
    nestedInvoice?.id,
    root?.invoice_id,
    root?.invoiceId,
  ];
  for (const value of candidates) {
    const id = String(value ?? '');
    if (isUuid(id)) return id;
  }
  return '';
}

export type ConvertToJobResult = Quotation & {
  job_id?: string;
  invoice_id?: string;
};

async function ensureDraftInvoiceForJob(
  jobId: string,
  existingInvoiceId?: string,
): Promise<string | undefined> {
  if (existingInvoiceId && isUuid(existingInvoiceId)) return existingInvoiceId;
  try {
    const { invoiceService } = await import('@/features/invoices/services/invoice.service');
    const invoice = await invoiceService.createFromJob(jobId);
    return invoice.id;
  } catch (err) {
    // Convert already succeeded — don't fail the whole flow if invoice already exists / 409.
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 409 || status === 400) return existingInvoiceId;
    throw err;
  }
}

async function withDraftInvoice(result: ConvertToJobResult): Promise<ConvertToJobResult> {
  const jobId = result.job_id;
  if (!jobId || !isUuid(jobId)) return result;
  const invoiceId = await ensureDraftInvoiceForJob(jobId, result.invoice_id);
  return invoiceId ? { ...result, invoice_id: invoiceId } : result;
}

async function postConvertToJob(id: string, quotation: Quotation): Promise<ConvertToJobResult> {
  // POST /quotations/{id}/convert-to-job — v2 may return { job, invoice }.
  const res = await withGatewayRetry(() =>
    axiosInstance.post<unknown>(
      QUOTATION_API.convertToJob(id),
      undefined,
      JOB_POST_AXIOS_CONFIG,
    ),
  );
  const raw = unwrapEntity(res.data);
  const invoiceId = extractInvoiceIdFromConvertResponse(raw) || extractInvoiceIdFromConvertResponse(res.data);
  const updated = normalizeQuotation(raw);
  if (updated) {
    return {
      ...updated,
      ...(invoiceId ? { invoice_id: invoiceId } : {}),
      ...(extractJobIdFromConvertResponse(raw) ? { job_id: extractJobIdFromConvertResponse(raw) } : {}),
    };
  }

  const jobId = extractJobIdFromConvertResponse(raw) || extractJobIdFromConvertResponse(res.data);
  if (jobId) {
    try {
      const { rememberQuotationConverted } = await import(
        '../utils/quotationConvertedMemory'
      );
      rememberQuotationConverted(id, jobId);
      // Best-effort persist if convert response omitted CONVERTED status.
      await axiosInstance
        .patch(QUOTATION_API.byId(id), { status: 'CONVERTED', job_id: jobId })
        .catch(() => undefined);
    } catch {
      /* ignore */
    }
    return {
      ...quotation,
      job_id: jobId,
      status: 'CONVERTED',
      ...(invoiceId ? { invoice_id: invoiceId } : {}),
    };
  }

  try {
    const refreshRes = await withGatewayRetry(() =>
      axiosInstance.get<unknown>(QUOTATION_API.byId(id)),
    );
    const refreshed = normalizeQuotation(unwrapEntity(refreshRes.data));
    if (refreshed && (refreshed.job_id || refreshed.status === 'CONVERTED')) {
      return {
        ...refreshed,
        status: 'CONVERTED',
        ...(invoiceId ? { invoice_id: invoiceId } : {}),
      };
    }
  } catch {
    /* fall through */
  }

  throw new Error('Convert succeeded but no job id was returned.');
}

async function createJobFallbackFromQuotation(quotation: Quotation): Promise<Quotation> {
  const { jobService } = await import('@/features/jobs/services/job.service');
  const job = await jobService.create(await quotationToCreateJobDto(quotation));
  // Copy quotation revenue charges onto the new job shell (gated air ops / convert fallback).
  try {
    await jobService.ensureChargesFromQuotation(job.id, quotation);
  } catch {
    /* non-fatal — invoice path can still apply quotation lines */
  }
  const marked = await quotationService.markConvertedWithJob(quotation.id, job.id);
  return (
    marked ?? {
      ...quotation,
      job_id: job.id,
      status: 'CONVERTED',
    }
  );
}

/** Link job_id on quotation without flipping status to CONVERTED. */
async function linkQuotationJobShell(
  quotationId: string,
  jobId: string,
  current: Quotation,
): Promise<Quotation> {
  const { coerceQuotationStatus } = await import('../utils/quotationStatus');
  // Remember job↔quote for inbox reverse lookup only — status stays APPROVED
  // until customer booking-form submit triggers convert-to-job.
  const { rememberQuotationConverted } = await import('../utils/quotationConvertedMemory');
  rememberQuotationConverted(quotationId, jobId);

  if (current.job_id === jobId) return current;

  const bodies: Record<string, unknown>[] = [{ job_id: jobId }, { jobId }];
  for (const body of bodies) {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(QUOTATION_API.byId(quotationId), body),
      );
      const updated = normalizeQuotation(unwrapEntity(res.data));
      if (updated) {
        // Prefer keeping customer-APPROVED until booking-form /complete.
        const stayApproved = coerceQuotationStatus(current.status) === 'APPROVED';
        return {
          ...updated,
          job_id: updated.job_id || jobId,
          status: stayApproved ? 'APPROVED' : updated.status,
        };
      }
    } catch {
      /* try next body shape */
    }
  }

  return {
    ...current,
    job_id: jobId,
    status: coerceQuotationStatus(current.status) === 'APPROVED' ? 'APPROVED' : current.status,
  };
}

/**
 * Create ops job for mode booking-form APIs; leave quotation APPROVED
 * (CONVERTED happens on booking-form /complete).
 */
async function createBookingOpsJobShellFromQuotation(
  quotation: Quotation,
): Promise<Quotation> {
  if (quotation.job_id && isUuid(quotation.job_id)) return quotation;

  const { jobService } = await import('@/features/jobs/services/job.service');
  const job = await jobService.create(await quotationToCreateJobDto(quotation));
  try {
    await jobService.ensureChargesFromQuotation(job.id, quotation);
  } catch {
    /* non-fatal */
  }
  return linkQuotationJobShell(quotation.id, job.id, quotation);
}

/** True when the customer has submitted the portal booking form for this quote. */
async function isCustomerPortalBookingFormComplete(
  quotation: Pick<Quotation, 'id' | 'job_id' | 'job_type' | 'quotation_number' | 'quote_no'>,
): Promise<boolean> {
  // Staff inbox only (cross-device). Do not trust localStorage drafts — they can
  // flip mark_complete before Ops should convert.
  try {
    const { portalAdminInboxService } = await import(
      '@/features/portal-admin-inbox/services/portalAdminInbox.service'
    );
    const payload = await portalAdminInboxService.findCustomerPortalBookingForm({
      quotationId: quotation.id,
      quoteNumber: quotation.quotation_number || quotation.quote_no,
      jobId: quotation.job_id,
      jobTypePrefix: String(quotation.job_type ?? '')
        .toUpperCase()
        .split('_')[0],
    });
    if (payload?.mark_complete === true) return true;
  } catch {
    /* ignore */
  }

  return false;
}

/** True when staff mode booking form on the job is marked complete. */
async function isStaffModeBookingFormComplete(
  jobId: string,
  jobType?: string | null,
): Promise<boolean> {
  if (!jobId || !isUuid(jobId)) return false;
  try {
    const { staffBookingFormModeFromJob } = await import(
      '@/features/jobs/hooks/useStaffBookingForm'
    );
    const { jobService } = await import('@/features/jobs/services/job.service');
    const mode = staffBookingFormModeFromJob({
      job_type: String(jobType ?? '') as import('@/features/jobs/types/job.types').Job['job_type'],
    });
    if (!mode) return false;
    let form: { mark_complete?: boolean } | null = null;
    switch (mode) {
      case 'SEA_FCL':
        form = await jobService.getSeaFclBookingForm(jobId);
        break;
      case 'SEA_LCL':
        form = await jobService.getSeaLclBookingForm(jobId);
        break;
      case 'LAND':
        form = await jobService.getLandBookingForm(jobId);
        break;
      case 'ROAD_FREIGHT':
        form = await jobService.getRoadFreightBookingForm(jobId);
        break;
      case 'COURIER':
        form = await jobService.getCourierBookingForm(jobId);
        break;
      case 'WAREHOUSE':
        form = await jobService.getWarehouseBookingForm(jobId);
        break;
      case 'CUSTOMS_CLEARANCE':
        form = await jobService.getCustomsClearanceBookingForm(jobId);
        break;
    }
    return form?.mark_complete === true;
  } catch {
    return false;
  }
}

async function syncPortalBookingFormAfterConvert(result: ConvertToJobResult): Promise<void> {
  const jobId = result.job_id;
  if (!jobId || !isUuid(jobId) || !result.id) return;
  try {
    const { syncCustomerPortalBookingFormOntoJob } = await import(
      '@/features/jobs/utils/applyPortalPayloadToModeBookingForm'
    );
    await syncCustomerPortalBookingFormOntoJob({
      jobId,
      jobType: result.job_type,
      quotationId: result.id,
      quoteNumber: result.quotation_number || result.quote_no,
    });
  } catch {
    /* non-fatal — Ops can reload from portal */
  }
}

async function withSessionCompany<T extends { company_id?: string }>(dto: T): Promise<T> {
  if (dto.company_id && isUuid(dto.company_id)) return dto;
  const companyId = await resolveSessionCompanyIdAsync();
  if (!companyId) return dto;
  return { ...dto, company_id: companyId };
}

async function withSessionQuotationContext<
  T extends { company_id?: string; branch_id?: string },
>(dto: T): Promise<T> {
  let out = await withSessionCompany(dto);
  if (out.branch_id && isUuid(out.branch_id)) return out;
  const branchId = await resolveOptionalBranchId(out.company_id);
  if (!branchId) return out;
  return { ...out, branch_id: branchId };
}

export const quotationService = {
  async list(params: QuotationListParams = {}): Promise<QuotationListResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.list, { params: buildListQuery(params) }),
      );
      const { items, meta } = unwrapList(res.data);
      const quotations = await enrichQuotationsForList(normalizeQuotations(items));
      return { quotations, meta: normalizeMeta(meta, quotations.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async dashboardStats(
    params: {
      period?: string;
      from_date?: string;
      to_date?: string;
      branch_id?: string;
      salesperson_id?: string;
      customer_id?: string;
      job_type?: string;
    } = {},
  ) {
    try {
      const q: Record<string, string> = {};
      if (params.period) q.period = params.period;
      if (params.from_date) q.from_date = params.from_date;
      if (params.to_date) q.to_date = params.to_date;
      if (params.branch_id) q.branch_id = params.branch_id;
      if (params.salesperson_id) q.salesperson_id = params.salesperson_id;
      if (params.customer_id) q.customer_id = params.customer_id;
      if (params.job_type) q.job_type = params.job_type;
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.dashboardStats, { params: q }),
      );
      return normalizeQuotationDashboardStats(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getById(id: string): Promise<Quotation> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<ApiEnvelope<Quotation> | Quotation>(QUOTATION_API.byId(id)),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Quotation not found.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * Resolve the quotation linked to a job (or booking portal quote) so invoice charges
   * can mirror quotation revenue lines.
   */
  async findLinkedToJob(
    jobId: string,
    hints?: {
      quotationId?: string;
      customerId?: string;
      jobType?: string;
      jobNumber?: string;
    },
  ): Promise<Quotation | null> {
    if (hints?.quotationId && isUuid(hints.quotationId)) {
      try {
        return await this.getById(hints.quotationId);
      } catch {
        /* fall through */
      }
    }
    if (!jobId || !isUuid(jobId)) return null;

    try {
      const { findRememberedQuotationIdForJob } = await import(
        '../utils/quotationConvertedMemory'
      );
      const rememberedId = findRememberedQuotationIdForJob(jobId);
      if (rememberedId && isUuid(rememberedId)) {
        try {
          const remembered = await this.getById(rememberedId);
          if (remembered) {
            if (remembered.lines?.length) return remembered;
            return remembered;
          }
        } catch {
          /* fall through */
        }
      }
    } catch {
      /* ignore */
    }

    const jobNumberUpper = String(hints?.jobNumber ?? '')
      .trim()
      .toUpperCase();
    const jobTypeUpper = String(hints?.jobType ?? '')
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
    const isAirFamily = jobTypeUpper.startsWith('AIR');

    const tryMatch = (items: Quotation[]) => {
      const byId = items.find((q) => q.job_id === jobId);
      if (byId) return byId;
      if (jobNumberUpper) {
        const byNum = items.find(
          (q) =>
            String(q.job_number ?? '')
              .trim()
              .toUpperCase() === jobNumberUpper,
        );
        if (byNum) return byNum;
      }
      return null;
    };

    // Continuum Generate Job leaves quote APPROVED (+ job_id) — not only CONVERTED.
    const baseList = {
      page: 1,
      limit: 100,
      order: 'desc' as const,
      ...(hints?.customerId && isUuid(hints.customerId)
        ? { customer_id: hints.customerId }
        : {}),
      ...(hints?.jobType ? { job_type: hints.jobType as Quotation['job_type'] } : {}),
    };
    const listAttempts: QuotationListParams[] = [
      { ...baseList, status: 'CONVERTED' },
      { ...baseList, status: 'APPROVED', limit: 100 },
      { ...baseList, status: 'WON', limit: 50 },
      { ...baseList, limit: 50 },
      { page: 1, limit: 30, search: jobId, order: 'desc' },
    ];
    if (isAirFamily) {
      listAttempts.push(
        {
          page: 1,
          limit: 50,
          order: 'desc',
          status: 'APPROVED',
          job_type: 'AIR_EXPORT' as never,
        },
        {
          page: 1,
          limit: 50,
          order: 'desc',
          status: 'APPROVED',
          job_type: 'AIR_IMPORT' as never,
        },
      );
    }
    if (jobNumberUpper) {
      listAttempts.push({ page: 1, limit: 30, search: jobNumberUpper, order: 'desc' });
    }
    // Air jobs often omit job_type hint — try both air modes.
    if (!hints?.jobType || isAirFamily) {
      listAttempts.push(
        { page: 1, limit: 50, order: 'desc', status: 'CONVERTED', job_type: 'AIR_EXPORT' as never },
        { page: 1, limit: 50, order: 'desc', status: 'CONVERTED', job_type: 'AIR_IMPORT' as never },
      );
    }

    for (const params of listAttempts) {
      try {
        const listed = await this.list(params);
        const matched = tryMatch(listed.quotations);
        if (matched) {
          if (matched.lines?.length) return matched;
          return await this.getById(matched.id);
        }
      } catch {
        /* try next */
      }
    }

    return null;
  },

  /**
   * Persist APPROVED/WON → CONVERTED + job_id after a job is created outside
   * POST /quotations/:id/convert-to-job (NVOCC booking convert / job fallback).
   * Does not create a second job.
   */
  async markConvertedWithJob(
    quotationId: string,
    jobId: string,
  ): Promise<Quotation | null> {
    assertId(quotationId);
    if (!jobId || !isUuid(jobId)) return null;

    const { rememberQuotationConverted } = await import(
      '../utils/quotationConvertedMemory'
    );
    const { coerceQuotationStatus } = await import('../utils/quotationStatus');

    rememberQuotationConverted(quotationId, jobId);

    let current: Quotation | null = null;
    try {
      current = await this.getById(quotationId);
    } catch {
      return null;
    }

    if (
      coerceQuotationStatus(current.status) === 'CONVERTED' &&
      current.job_id === jobId
    ) {
      return current;
    }

    // Bypass prepareQuotationPayload — status / job_id are not header form fields.
    const bodies: Record<string, unknown>[] = [
      { status: 'CONVERTED', job_id: jobId },
      { status: 'CONVERTED', jobId },
      { job_id: jobId },
      { jobId },
    ];

    for (const body of bodies) {
      try {
        const res = await withGatewayRetry(() =>
          axiosInstance.patch<unknown>(QUOTATION_API.byId(quotationId), body),
        );
        const updated = normalizeQuotation(unwrapEntity(res.data));
        if (!updated) continue;
        if (
          coerceQuotationStatus(updated.status) === 'CONVERTED' ||
          updated.job_id === jobId
        ) {
          rememberQuotationConverted(quotationId, jobId);
          return {
            ...updated,
            job_id: updated.job_id || jobId,
            status: 'CONVERTED',
          };
        }
      } catch {
        /* try next body shape */
      }
    }

    try {
      const refreshed = await this.getById(quotationId);
      if (
        coerceQuotationStatus(refreshed.status) === 'CONVERTED' ||
        refreshed.job_id === jobId
      ) {
        return {
          ...refreshed,
          job_id: refreshed.job_id || jobId,
          status: 'CONVERTED',
        };
      }
      return {
        ...refreshed,
        job_id: jobId,
        status: 'CONVERTED',
      };
    } catch {
      return {
        ...current,
        job_id: jobId,
        status: 'CONVERTED',
      };
    }
  },

  async create(dto: CreateQuotationDto): Promise<Quotation> {
    try {
      const withCompany = await withSessionQuotationContext(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          QUOTATION_API.create,
          prepareQuotationPayload(withCompany as Record<string, unknown>),
        ),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Create succeeded but no quotation was returned.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async update(id: string, dto: UpdateQuotationDto): Promise<Quotation> {
    assertId(id);
    try {
      const withCompany = await withSessionQuotationContext(dto);
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          QUOTATION_API.byId(id),
          prepareQuotationPayload(withCompany as Record<string, unknown>),
        ),
      );
      const quotation = normalizeQuotation(unwrapEntity(res.data));
      if (!quotation) throw new Error('Update succeeded but no quotation was returned.');
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async softDelete(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() => axiosInstance.delete(QUOTATION_API.byId(id)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async listRevisions(id: string): Promise<Quotation[]> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.revisions(id)),
      );
      const { items } = unwrapList(res.data);
      const fromItems = normalizeQuotations(items);
      if (fromItems.length) return fromItems;
      const entity = unwrapEntity(res.data);
      if (Array.isArray(entity)) return normalizeQuotations(entity);
      return [];
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async addLine(id: string, dto: CreateQuotationLineDto): Promise<QuotationLine> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          QUOTATION_API.lines(id),
          prepareQuotationLinePayload(dto as Record<string, unknown>),
        ),
      );
      const line = normalizeQuotationLine(unwrapEntity(res.data));
      if (!line) {
        // Some APIs return the full quotation after adding a line.
        const quotation = normalizeQuotation(unwrapEntity(res.data));
        const last = quotation?.lines?.[quotation.lines.length - 1];
        if (last) return last;
        throw new Error('Add line succeeded but no line was returned.');
      }
      return line;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateLine(
    id: string,
    lineId: string,
    dto: UpdateQuotationLineDto,
  ): Promise<QuotationLine> {
    assertId(id);
    assertId(lineId, 'line');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch<unknown>(
          QUOTATION_API.lineById(id, lineId),
          prepareQuotationLinePayload(dto as Record<string, unknown>),
        ),
      );
      const line = normalizeQuotationLine(unwrapEntity(res.data));
      if (!line) throw new Error('Update line succeeded but no line was returned.');
      return line;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async removeLine(id: string, lineId: string): Promise<void> {
    assertId(id);
    assertId(lineId, 'line');
    try {
      await withGatewayRetry(() => axiosInstance.delete(QUOTATION_API.lineById(id, lineId)));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async applyTariff(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.applyTariff(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async submit(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.submit(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async approve(id: string, dto: ApprovalDecisionDto = {}): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.approve(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /quotations/:id/verify — Fresa continuum. */
  async verify(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.verify(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /quotations/:id/approve-verified — Fresa continuum. */
  async approveVerified(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.approveVerified(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /quotations/:id/generate-shipment — Fresa continuum (OpenAPI). */
  async generateShipment(
    id: string,
  ): Promise<Quotation & { shipment_id?: string; shipment_number?: string }> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.generateShipment(id)),
      );
      const shipmentId = extractShipmentIdFromResponse(res.data);
      const root = asRecord(res.data);
      const data = asRecord(root?.data) ?? root;
      const nestedShipment = asRecord(data?.shipment);
      const shipmentNumber =
        strField(data?.shipment_number) ??
        strField(data?.shipmentNumber) ??
        strField(data?.shipment_no) ??
        strField(nestedShipment?.shipment_number) ??
        strField(nestedShipment?.shipmentNumber) ??
        strField(nestedShipment?.number) ??
        strField(nestedShipment?.reference);
      // Always reload quotation by the original id — generate responses may be a bare
      // shipment entity and must not be treated as a Quotation.
      let quotation: Quotation;
      try {
        quotation = await this.getById(id);
      } catch {
        const fromBody = normalizeQuotation(unwrapEntity(res.data));
        quotation = fromBody?.id === id ? fromBody : ({ id } as Quotation);
      }
      const resolvedShipmentId = shipmentId || quotation.shipment_id;
      return {
        ...quotation,
        id,
        ...(resolvedShipmentId ? { shipment_id: resolvedShipmentId } : {}),
        ...(shipmentNumber || quotation.shipment_number
          ? { shipment_number: shipmentNumber || quotation.shipment_number }
          : {}),
      };
    } catch (error) {
      const formatted = formatAxiosError(error);
      throw new Error(formatShipmentsPermissionError(formatted.message));
    }
  },

  /** POST /quotations/:id/generate-job — Fresa continuum (distinct from convert-to-job). */
  async generateJob(
    id: string,
  ): Promise<Quotation & { job_id?: string; job_number?: string }> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.generateJob(id), undefined, JOB_POST_AXIOS_CONFIG),
      );
      const jobId =
        extractJobIdFromConvertResponse(res.data) ||
        extractJobIdFromConvertResponse(unwrapEntity(res.data));
      const root = asRecord(res.data);
      const data = asRecord(root?.data) ?? root;
      const nestedJob = asRecord(data?.job);
      const jobNumber =
        strField(data?.job_number) ??
        strField(data?.jobNumber) ??
        strField(data?.job_no) ??
        strField(nestedJob?.job_number) ??
        strField(nestedJob?.jobNumber) ??
        strField(nestedJob?.number);
      let quotation =
        normalizeQuotation(unwrapEntity(res.data)) ?? (await this.getById(id));
      const resolvedJobId = jobId || quotation.job_id;
      if (resolvedJobId && isUuid(resolvedJobId)) {
        const { rememberQuotationConverted } = await import(
          '../utils/quotationConvertedMemory'
        );
        rememberQuotationConverted(id, resolvedJobId);
        // Push customer portal booking form onto empty job booking-form APIs.
        await syncPortalBookingFormAfterConvert({
          ...quotation,
          id,
          job_id: resolvedJobId,
          job_type: quotation.job_type,
          quotation_number: quotation.quotation_number || quotation.quote_no,
        });
        try {
          quotation = await this.getById(id);
        } catch {
          /* keep prior */
        }
      }
      return {
        ...quotation,
        ...(resolvedJobId ? { job_id: resolvedJobId } : {}),
        ...(jobNumber || quotation.job_number
          ? { job_number: jobNumber || quotation.job_number }
          : {}),
      };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reject(id: string, dto: ApprovalDecisionDto = {}): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.reject(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async send(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.send(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async markWon(id: string): Promise<ConvertToJobResult | Quotation> {
    assertId(id);
    // Backend blocks staff mark-won (400). Customer accept / negotiation accept → APPROVED only.
    try {
      await postAction(QUOTATION_API.markWon(id));
      return await this.getById(id);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        throw new Error(
          'Mark won is blocked for staff. The customer must accept the quote (or accept their counter-offer via Negotiation). Then use Generate Shipment → Generate Job.',
        );
      }
      throw formatAxiosError(error);
    }
  },

  /**
   * APPROVED only — never auto-creates shipment/job.
   * Staff continuum: Generate Shipment → confirm/approve shipment → Generate Job.
   */
  async fulfillApprovedQuotation(id: string): Promise<ConvertToJobResult | Quotation> {
    assertId(id);
    return this.getById(id);
  },

  /**
   * No longer auto-converts after portal booking-form submit.
   * Customer approve + booking form stay APPROVED; admin creates the job via
   * Generate Shipment → Generate Job (or Convert to job).
   */
  async convertAfterCustomerBookingForm(id: string): Promise<ConvertToJobResult | Quotation> {
    assertId(id);
    return this.getById(id);
  },

  /**
   * No longer auto-converts. Staff continuum: Generate Shipment → Generate Job.
   * Kept for callers that still import this helper.
   */
  async convertPendingAfterBookingForms(
    _limit = 50,
  ): Promise<{ converted: number; ids: string[] }> {
    return { converted: 0, ids: [] };
  },

  /**
   * No auto-convert on booking-form complete.
   * Admin creates/links the job; this only syncs CONVERTED when a job already exists.
   */
  async convertAfterBookingFormComplete(
    jobId: string,
    opts?: { staffFormJustCompleted?: boolean },
  ): Promise<Quotation | null> {
    if (!jobId || !isUuid(jobId)) return null;
    // Staff complete is not a convert trigger.
    if (opts?.staffFormJustCompleted) return null;

    const linked = await this.findLinkedToJob(jobId);
    if (!linked) return null;

    const { coerceQuotationStatus, usesModeBookingFormConvertFlow } = await import(
      '../utils/quotationStatus'
    );
    if (!usesModeBookingFormConvertFlow(linked.job_type)) return linked;

    const status = coerceQuotationStatus(linked.status);
    if (status === 'CONVERTED' && linked.job_id === jobId) {
      if (!linked.invoice_id) {
        try {
          const invoiceId = await ensureDraftInvoiceForJob(jobId);
          return invoiceId ? { ...linked, invoice_id: invoiceId } : linked;
        } catch {
          return linked;
        }
      }
      return linked;
    }

    // Only mark CONVERTED when admin already created/linked this job — never create a new job here.
    if (linked.job_id && isUuid(linked.job_id) && linked.job_id === jobId) {
      const marked = await this.markConvertedWithJob(linked.id, jobId);
      if (marked) {
        try {
          const invoiceId = await ensureDraftInvoiceForJob(jobId, marked.invoice_id);
          const withInvoice = invoiceId ? { ...marked, invoice_id: invoiceId } : marked;
          await syncPortalBookingFormAfterConvert(withInvoice as ConvertToJobResult);
          return withInvoice;
        } catch {
          await syncPortalBookingFormAfterConvert(marked as ConvertToJobResult);
          return marked;
        }
      }
    }

    return linked;
  },

  /**
   * Sea/Land/Road/Courier/Warehouse/Customs — optional staff action if a job shell is needed before convert.
   * Prefer waiting for the customer portal booking form, then convert.
   */
  async createBookingOpsJobShell(id: string): Promise<Quotation> {
    assertId(id);
    const quotation = await this.getById(id);
    const { coerceQuotationStatus, usesModeBookingFormConvertFlow } = await import(
      '../utils/quotationStatus'
    );
    if (!usesModeBookingFormConvertFlow(quotation.job_type)) {
      throw new Error(
        'createBookingOpsJobShell is only for Sea/Land/Road/Courier/Warehouse/Customs quotes.',
      );
    }
    if (quotation.job_id && isUuid(quotation.job_id)) return quotation;
    if (coerceQuotationStatus(quotation.status) !== 'APPROVED') {
      throw new Error(
        `Quotation must be customer-approved before starting booking ops (current status: ${quotation.status}).`,
      );
    }
    const companyId =
      quotation.company_id && isUuid(quotation.company_id)
        ? quotation.company_id
        : await resolveSessionCompanyIdAsync();
    if (!companyId || !isUuid(companyId)) {
      throw new Error(
        'This quotation has no Company. Save a company on the quotation, then continue.',
      );
    }
    await ensureJobNumberFormatReady();
    const branchId = await ensureJobBranchReady(companyId);
    return createBookingOpsJobShellFromQuotation({
      ...quotation,
      company_id: companyId,
      branch_id: branchId,
    });
  },

  /**
   * Air only — explicit staff action. Creates a job shell for Ops APIs
   * (`/jobs/:id/air-booking-form`, `/air/send-invoice`) without draft invoice.
   * Never call this automatically from mark-won / portal accept.
   */
  async createOpsJobWithoutInvoice(id: string): Promise<Quotation> {
    assertId(id);
    const quotation = await this.getById(id);
    const { coerceQuotationStatus, usesGatedFreightQuoteFlow } = await import(
      '../utils/quotationStatus'
    );
    if (!usesGatedFreightQuoteFlow(quotation.job_type)) {
      throw new Error('createOpsJobWithoutInvoice is only for Air gated quotes.');
    }
    const jt = String(quotation.job_type ?? '').toUpperCase();
    if (!jt.startsWith('AIR_')) {
      throw new Error('NVOCC quotes do not create a job here — use NVOCC Bookings → send invoice → convert.');
    }
    if (quotation.job_id) return quotation;
    if (coerceQuotationStatus(quotation.status) !== 'APPROVED') {
      throw new Error(
        `Quotation must be customer-approved before starting air ops (current status: ${quotation.status}).`,
      );
    }
    const companyId =
      quotation.company_id && isUuid(quotation.company_id)
        ? quotation.company_id
        : await resolveSessionCompanyIdAsync();
    if (!companyId || !isUuid(companyId)) {
      throw new Error(
        'This quotation has no Company. Save a company on the quotation, then continue.',
      );
    }
    await ensureJobNumberFormatReady();
    const branchId = await ensureJobBranchReady(companyId);
    return createJobFallbackFromQuotation({
      ...quotation,
      company_id: companyId,
      branch_id: branchId,
    });
  },

  async markLost(id: string, dto: MarkLostDto): Promise<Quotation> {
    assertId(id);
    // Backend blocks staff mark-lost (400). Customer reject → DISAPPROVED.
    try {
      return await postAction(QUOTATION_API.markLost(id), dto);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 400) {
        throw new Error(
          'Mark lost is blocked for staff. Ask the customer to reject the quote, or use Reject on negotiation.',
        );
      }
      throw formatAxiosError(error);
    }
  },

  async duplicate(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.duplicate(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** POST /quotations/:id/copy — Fresa alias of duplicate. */
  async copy(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.copy(id));
    } catch (error) {
      // Fall back to duplicate if copy alias is unavailable.
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return this.duplicate(id);
      throw formatAxiosError(error);
    }
  },

  /** POST /quotations/:id/change-status — staff status change with optional reason. */
  async changeStatus(
    id: string,
    dto: { status: string; reason?: string },
  ): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.changeStatus(id), dto);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /quotations/status-options — system + custom catalog. */
  async getStatusOptions(): Promise<
    import('@/features/jobs/types/job.types').JobStatusOption[]
  > {
    try {
      const { normalizeJobStatusOptions } = await import(
        '@/features/jobs/utils/normalizeJob'
      );
      const res = await withGatewayRetry(() =>
        axiosInstance.get(QUOTATION_API.statusOptions),
      );
      return normalizeJobStatusOptions(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async createStatusCatalog(
    dto: import('@/features/jobs/types/job.types').UpsertStatusCatalogDto,
  ): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(QUOTATION_API.statusCatalog, dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async updateStatusCatalog(
    id: string,
    dto: Partial<import('@/features/jobs/types/job.types').UpsertStatusCatalogDto>,
  ): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.patch(QUOTATION_API.statusCatalogById(id), dto),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async deactivateStatusCatalog(id: string): Promise<void> {
    assertId(id);
    try {
      await withGatewayRetry(() =>
        axiosInstance.delete(QUOTATION_API.statusCatalogById(id)),
      );
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** GET /quotations/:id/detail — Fresa detail envelope; falls back to getById. */
  async getDetail(id: string): Promise<Quotation> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.detail(id)),
      );
      const item = normalizeQuotation(unwrapEntity(res.data) ?? res.data);
      if (item) return item;
      return this.getById(id);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) return this.getById(id);
      throw formatAxiosError(error);
    }
  },

  /** GET /quotations/:id/detail/:tab — lazy tab payload. */
  async getDetailTab(id: string, tab: string): Promise<Record<string, unknown>> {
    assertId(id);
    const key = tab.trim();
    if (!key) throw new Error('Tab key is required.');
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.detailTab(id, key)),
      );
      const payload = unwrapEntity(res.data);
      return asRecord(payload) ?? asRecord(res.data) ?? { raw: payload ?? res.data };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async convertToJob(
    id: string,
    opts?: { afterCustomerBookingForm?: boolean },
  ): Promise<ConvertToJobResult> {
    assertId(id);
    let quotation: Quotation | undefined;
    try {
      quotation = await this.getById(id);
      const {
        canConvertQuotationToJob,
        coerceQuotationStatus,
        usesGatedFreightQuoteFlow,
        usesModeBookingFormConvertFlow,
      } = await import('../utils/quotationStatus');

      if (usesModeBookingFormConvertFlow(quotation.job_type)) {
        // Admin-only convert — customer approve / booking-form submit never auto-create a job.
        const status = coerceQuotationStatus(quotation.status);
        if (status !== 'APPROVED' && status !== 'CONVERTED') {
          throw new Error(
            `Quotation must be customer-approved before convert (current status: ${quotation.status}).`,
          );
        }
      } else if (
        !canConvertQuotationToJob(quotation.status, quotation.job_type, quotation.actions)
      ) {
        throw new Error(
          usesGatedFreightQuoteFlow(quotation.job_type)
            ? `NVOCC/Air quotes do not convert here — continue Booking form → Send invoice on the gated flow (current status: ${quotation.status}).`
            : `Quotation must be customer-approved before convert (current status: ${quotation.status}).`,
        );
      }

      const companyId =
        quotation.company_id && isUuid(quotation.company_id)
          ? quotation.company_id
          : await resolveSessionCompanyIdAsync();

      if (!companyId || !isUuid(companyId)) {
        throw new Error(
          'This quotation has no Company. Open the quotation, select Company on the form, save, then convert — or ensure your user is linked to a company.',
        );
      }

      quotation = { ...quotation, company_id: companyId };

      await ensureJobNumberFormatReady();
      const branchId = await ensureJobBranchReady(quotation.company_id);

      try {
        return await withDraftInvoice(
          await postConvertToJob(id, { ...quotation, branch_id: branchId }),
        );
      } catch (convertErr) {
        const convertStatus = (convertErr as { response?: { status?: number } })?.response
          ?.status;
        const detail = formatAxiosError(convertErr).message;
        if (
          convertStatus === 403 &&
          /ROAD_FREIGHT|do not have access/i.test(detail)
        ) {
          throw new Error(
            `${detail} Enable ROAD_FREIGHT job-type access for this user/department, then retry convert from Quotations.`,
          );
        }
        if (convertStatus !== 500) {
          if ((convertErr as { response?: unknown }).response) {
            throw formatAxiosError(convertErr);
          }
          throw convertErr;
        }

        try {
          return await withDraftInvoice(
            await createJobFallbackFromQuotation({ ...quotation, branch_id: branchId }),
          );
        } catch (fallbackErr) {
          const fbStatus = (fallbackErr as { response?: { status?: number } })?.response?.status;
          const fbDetail = formatAxiosError(fallbackErr).message;
          if (
            fbStatus === 403 &&
            /ROAD_FREIGHT|do not have access/i.test(fbDetail)
          ) {
            throw new Error(
              `${fbDetail} Enable ROAD_FREIGHT job-type access for this user/department, then retry convert from Quotations.`,
            );
          }
          throw formatAxiosError(fallbackErr);
        }
      }
    } catch (error) {
      if (error instanceof Error && !(error as { response?: unknown }).response) {
        throw error;
      }
      throw formatAxiosError(error);
    }
  },

  async archive(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.archive(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async expire(id: string): Promise<Quotation> {
    assertId(id);
    try {
      return await postAction(QUOTATION_API.expire(id));
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async expireDue(): Promise<ExpireDueResult> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.expireDue),
      );
      const data = unwrapEntity(res.data);
      return (asRecord(data) ?? { message: 'Expire-due completed.' }) as ExpireDueResult;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async getPdf(id: string): Promise<QuotationPdfInfo> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.pdf(id), {
          withCredentials: false,
        }),
      );
      return normalizeQuotationPdfInfo(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      // No PDF yet / backend still processing / opaque 5xx — treat as empty, not a hard failure.
      if (status === 404 || status === 204 || (typeof status === 'number' && status >= 500)) {
        return {};
      }
      throw formatAxiosError(error);
    }
  },

  async generatePdf(id: string, dto: GenerateQuotationPdfDto): Promise<QuotationPdfInfo> {
    assertId(id);
    const mode = String(dto.mode ?? 'CUSTOMER').trim().toUpperCase();
    if (mode !== 'CUSTOMER' && mode !== 'INTERNAL') {
      throw new Error('PDF mode must be CUSTOMER or INTERNAL.');
    }
    const body: Record<string, unknown> = {
      mode,
      /** KingFisher client layout id — same visual used on staff + portal. */
      layout_variant: (dto.layout_variant?.trim() || 'KFW_STANDARD').slice(0, 50),
    };

    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.pdf(id), body, {
          withCredentials: false,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      return normalizeQuotationPdfInfo(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const formatted = formatAxiosError(error);
      if (status != null && status >= 500) {
        throw new Error(
          `${formatted.message}. PDF generation failed on the server (often missing template, queue, or Chromium on Render). Confirm in Network that POST /quotations/{id}/pdf body is { "mode": "CUSTOMER"|"INTERNAL" }.`,
        );
      }
      throw formatted;
    }
  },

  /**
   * Store the KingFisher client PDF on the quotation so portal/email can use the same file.
   * Tries multipart → JSON pdf_base64 → queue layout_variant=KFW_STANDARD.
   */
  async storeClientPdf(
    id: string,
    opts: {
      mode: 'CUSTOMER' | 'INTERNAL';
      blob: Blob;
      fileName?: string;
    },
  ): Promise<QuotationPdfInfo> {
    assertId(id);
    const mode = opts.mode === 'INTERNAL' ? 'INTERNAL' : 'CUSTOMER';
    const fileName = (opts.fileName || `quotation-${id}.pdf`).replace(/[^\w.\- ()[\]]+/g, '_');
    const file = new File([opts.blob], fileName, { type: 'application/pdf' });

    const stripFormContentType = [
      (data: unknown, headers?: Record<string, unknown> & { delete?: (key: string) => void }) => {
        if (headers && typeof headers === 'object' && data instanceof FormData) {
          delete headers['Content-Type'];
          delete headers['content-type'];
          headers.delete?.('Content-Type');
          headers.delete?.('content-type');
        }
        return data;
      },
    ];

    try {
      const form = new FormData();
      form.append('mode', mode);
      form.append('layout_variant', 'KFW_STANDARD');
      form.append('file', file);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.pdf(id), form, {
          withCredentials: false,
          transformRequest: stripFormContentType,
        }),
      );
      return normalizeQuotationPdfInfo(res.data);
    } catch {
      /* try base64 JSON next */
    }

    try {
      const buffer = await opts.blob.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const pdfBase64 = btoa(binary);
      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(
          QUOTATION_API.pdf(id),
          {
            mode,
            layout_variant: 'KFW_STANDARD',
            pdf_base64: pdfBase64,
            file_name: fileName,
          },
          {
            withCredentials: false,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
      return normalizeQuotationPdfInfo(res.data);
    } catch {
      // OpenAPI: POST /pdf is JSON-only { mode, layout_variant } — queue KFW layout.
      return this.generatePdf(id, { mode, layout_variant: 'KFW_STANDARD' });
    }
  },

  async getPdfStatus(id: string): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.pdfStatus(id), {
          withCredentials: false,
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || (typeof status === 'number' && status >= 500)) {
        return { status: status === 404 ? 'NOT_FOUND' : 'ERROR' };
      }
      throw formatAxiosError(error);
    }
  },

  async sendEmail(
    id: string,
    dto: SendQuotationEmailDto,
    opts?: { pdfBlob?: Blob; fileName?: string },
  ): Promise<unknown> {
    assertId(id);
    try {
      await wakeApi(45_000);

      const mode = dto.pdf_mode === 'INTERNAL' ? 'INTERNAL' : 'CUSTOMER';
      const fields: Record<string, string | undefined> = {
        to_email: dto.to_email.trim(),
        cc_email: dto.cc_email?.trim() || undefined,
        pdf_mode: dto.pdf_mode === 'CUSTOMER' || dto.pdf_mode === 'INTERNAL' ? dto.pdf_mode : mode,
        message: dto.message?.trim() ? dto.message.trim().slice(0, 500) : undefined,
      };

      // Live OpenAPI: attach client KingFisher PDF via multipart file / pdf_base64.
      // Without a client PDF, queue server generation then SMTP-send the stored file.
      if (!opts?.pdfBlob) {
        await this.generatePdf(id, { mode, layout_variant: 'KFW_STANDARD' });
        const { waitForQuotationPdfReady } = await import('../utils/waitForQuotationPdfReady');
        await waitForQuotationPdfReady(id, mode);
      }

      const data = await postStaffEmailWithPdf(
        axiosInstance,
        QUOTATION_API.sendEmail(id),
        fields,
        { pdfBlob: opts?.pdfBlob, fileName: opts?.fileName },
      );
      return unwrapEntity(data) ?? normalizeShareEmailResult(data);
    } catch (error) {
      throw formatShareEmailError(error, 'Could not send quotation email.');
    }
  },

  async createOnlineQuote(dto: CreateOnlineQuoteDto): Promise<Quotation> {
    try {
      const body = prepareOnlineQuotePayload(dto as Record<string, unknown>);
      if (!body.tenant_slug || !body.job_type || !body.currency_code) {
        throw new Error('tenant_slug, job_type, and currency_code are required.');
      }
      if (!body.customer_id && !(body.contact_email && body.contact_name)) {
        throw new Error(
          'Provide customer_id, or both contact_name and contact_email for online quote.',
        );
      }

      const res = await withGatewayRetry(() =>
        axiosInstance.post<unknown>(QUOTATION_API.onlineQuote, body),
      );

      const candidate = extractQuotationCandidate(res.data);
      let quotation = normalizeQuotation(candidate);

      if (!quotation) {
        const id = extractQuotationId(res.data) ?? extractQuotationId(candidate);
        if (id) {
          try {
            quotation = await this.getById(id);
          } catch {
            // fall through to clearer error below
          }
        }
      }

      if (!quotation) {
        // Empty / undocumented 201 body — still treat as success if HTTP succeeded.
        throw new Error(
          'Online quote was accepted by the server, but the response did not include a quotation object. Open All Quotations to find the new draft, or ask backend to return the created quotation (or its id) in the 201 body.',
        );
      }
      return quotation;
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportChargewise(params: QuotationReportParams = {}): Promise<{
    items: unknown[];
    meta: PaginationMeta;
  }> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.chargewise, {
          params: buildListQuery(params),
        }),
      );
      const { items, meta } = unwrapList(res.data);
      return { items, meta: normalizeMeta(meta, items.length, params) };
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportAnalytics(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.analytics, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportConversion(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.conversion, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportLostReasons(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.lostReasons, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async reportResponseTime(params: QuotationAnalyticsParams = {}): Promise<unknown> {
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get<unknown>(QUOTATION_API.reports.responseTime, {
          params: buildAnalyticsQuery(params),
        }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /** Helper used when a mutation returns lines nested on the quotation. */
  normalizeLinesFromQuotation(quotation: Quotation): QuotationLine[] {
    return normalizeQuotationLines(quotation.lines ?? []);
  },

  async getBookingForm(id: string, params?: Record<string, unknown>): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.get(QUOTATION_API.bookingForm(id), { params }),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async upsertBookingForm(id: string, body: Record<string, unknown>): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.put(QUOTATION_API.bookingForm(id), body),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  async completeBookingForm(id: string, body: Record<string, unknown> = {}): Promise<unknown> {
    assertId(id);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(QUOTATION_API.bookingFormComplete(id), body),
      );
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },

  /**
   * POST /quotations/:id/booking-form/documents/:kind
   * Creates provisional job when needed; mirrors job mode upload.
   */
  async uploadBookingFormDocument(
    id: string,
    kind: string,
    file: File,
  ): Promise<unknown> {
    assertId(id);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await withGatewayRetry(() =>
        axiosInstance.post(QUOTATION_API.bookingFormDocument(id, kind), form, {
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
      return unwrapEntity(res.data);
    } catch (error) {
      throw formatAxiosError(error);
    }
  },
};
