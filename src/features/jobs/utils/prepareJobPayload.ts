import { isUuid } from '@/lib/isUuid';
import type { CreateJobDto, Job, UpdateJobDto } from '../types/job.types';

export const JOB_FORM_DEFAULTS: CreateJobDto = {
  job_type: 'AIR_EXPORT',
  shipper_id: '',
  company_id: '',
  branch_id: '',
  department_id: '',
  parent_job_id: '',
  consignee_id: '',
  billing_party_id: '',
  agent_id: '',
  salesperson_id: '',
  ops_user_id: '',
  origin_port_id: '',
  dest_port_id: '',
  commodity: '',
  hs_code: '',
  gross_weight: undefined,
  chargeable_weight: undefined,
  volume_cbm: undefined,
  pieces: undefined,
  container_type_id: '',
  container_count: undefined,
  incoterms: '',
  is_dg: false,
  dg_class: '',
  notes: '',
  customer_remarks: '',
  tags: [],
  etd: '',
  eta: '',
};

const UUID_OPTIONAL_KEYS = [
  'company_id',
  'branch_id',
  'department_id',
  'parent_job_id',
  'consignee_id',
  'billing_party_id',
  'agent_id',
  'salesperson_id',
  'ops_user_id',
  'origin_port_id',
  'dest_port_id',
  'container_type_id',
] as const;

const NUMBER_KEYS = [
  'gross_weight',
  'chargeable_weight',
  'volume_cbm',
  'pieces',
  'container_count',
] as const;

function omitEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue;
    if (typeof value === 'number' && !Number.isFinite(value)) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/**
 * Build Swagger CreateJobDto / UpdateJobDto body.
 * Strips empty strings, NaN, and invalid optional UUIDs (common FE→500 cause).
 */
export function prepareJobPayload(
  values: CreateJobDto | UpdateJobDto,
): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...values };

  if (typeof payload.incoterms === 'string') {
    payload.incoterms = payload.incoterms.trim().toUpperCase();
  }
  if (typeof payload.hs_code === 'string') {
    payload.hs_code = payload.hs_code.trim();
  }
  if (typeof payload.commodity === 'string') {
    payload.commodity = payload.commodity.trim();
  }
  if (Array.isArray(payload.tags)) {
    const tags: string[] = [];
    for (const t of payload.tags) {
      const trimmed = String(t).trim();
      if (trimmed.length > 0) tags.push(trimmed);
    }
    payload.tags = tags.slice(0, 20);
  }

  for (const key of UUID_OPTIONAL_KEYS) {
    const v = payload[key];
    if (v == null || v === '') {
      delete payload[key];
      continue;
    }
    if (typeof v === 'string' && !isUuid(v)) {
      delete payload[key];
    }
  }

  if (typeof payload.shipper_id === 'string' && !isUuid(payload.shipper_id)) {
    // leave for API/validation to reject — required
  }

  for (const key of NUMBER_KEYS) {
    const v = payload[key];
    if (v == null || v === '') {
      delete payload[key];
      continue;
    }
    if (typeof v === 'number' && !Number.isFinite(v)) {
      delete payload[key];
    }
  }

  // FCL: container_count without a valid type is incomplete — drop count
  if (payload.container_count != null && !payload.container_type_id) {
    delete payload.container_count;
  }

  // DG class only meaningful when flagged
  if (payload.is_dg !== true) {
    delete payload.dg_class;
  }

  // Do not auto-inject billing_party_id — some tenants 500 when it duplicates shipper FK context.

  return omitEmpty(payload);
}

/** Minimal CreateJobDto for 500 retry (only widely accepted fields). */
export function prepareMinimalJobCreatePayload(
  values: CreateJobDto | UpdateJobDto,
): Record<string, unknown> {
  const full = prepareJobPayload(values);
  const jobType = String(full.job_type ?? '');

  // FCL create seeds sea_fcl_details + milestones; optional FKs/dates often trigger opaque 500s.
  if (/SEA_FCL_/i.test(jobType)) {
    return {
      job_type: full.job_type,
      shipper_id: full.shipper_id,
    };
  }

  // SERVICE_JOB: keep header-only fields — ports/containers from quotations often break create.
  if (jobType === 'SERVICE_JOB') {
    const out: Record<string, unknown> = {
      job_type: full.job_type,
      shipper_id: full.shipper_id,
    };
    for (const key of ['company_id', 'branch_id', 'department_id', 'salesperson_id', 'notes'] as const) {
      if (full[key] !== undefined) out[key] = full[key];
    }
    return out;
  }

  const keep = [
    'job_type',
    'shipper_id',
    'company_id',
    'branch_id',
    'department_id',
    'billing_party_id',
    'salesperson_id',
    'consignee_id',
    'origin_port_id',
    'dest_port_id',
    'commodity',
    'hs_code',
    'pieces',
    'gross_weight',
    'chargeable_weight',
    'volume_cbm',
    'incoterms',
    'is_dg',
    'etd',
    'eta',
    'notes',
    'customer_remarks',
  ] as const;
  const out: Record<string, unknown> = {};
  for (const key of keep) {
    if (full[key] !== undefined) out[key] = full[key];
  }
  return out;
}

/** Absolute minimum body — used as last retry when FCL still 500s. */
export function prepareBareJobCreatePayload(
  values: CreateJobDto | UpdateJobDto,
): Record<string, unknown> {
  const full = prepareJobPayload(values);
  return {
    job_type: full.job_type,
    shipper_id: full.shipper_id,
  };
}

export function jobToFormValues(job: Job) {
  return {
    job_type: job.job_type,
    shipper_id: job.shipper_id,
    company_id: job.company_id ?? '',
    branch_id: job.branch_id ?? '',
    department_id: job.department_id ?? '',
    parent_job_id: job.parent_job_id ?? '',
    consignee_id: job.consignee_id ?? '',
    billing_party_id: job.billing_party_id ?? '',
    agent_id: job.agent_id ?? '',
    salesperson_id: job.salesperson_id ?? '',
    ops_user_id: job.ops_user_id ?? '',
    origin_port_id: job.origin_port_id ?? '',
    dest_port_id: job.dest_port_id ?? '',
    commodity: job.commodity ?? '',
    hs_code: job.hs_code ?? '',
    gross_weight: job.gross_weight,
    chargeable_weight: job.chargeable_weight,
    volume_cbm: job.volume_cbm,
    pieces: job.pieces,
    container_type_id: job.container_type_id ?? '',
    container_count: job.container_count,
    incoterms: job.incoterms ?? '',
    is_dg: job.is_dg ?? false,
    dg_class: job.dg_class ?? '',
    notes: job.notes ?? '',
    customer_remarks: job.customer_remarks ?? '',
    tags: job.tags ?? [],
    etd: job.etd ?? '',
    eta: job.eta ?? '',
  };
}
