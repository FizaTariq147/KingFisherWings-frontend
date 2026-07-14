import type { CreateJobDto, Job, UpdateJobDto } from '../types/job.types';

export const JOB_FORM_DEFAULTS: CreateJobDto = {
  job_type: 'AIR_EXPORT',
  shipper_id: '',
  company_id: '',
  branch_id: '',
  department_id: '',
  parent_job_id: '',
  consignee_id: '',
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

function omitEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as T;
}

export function prepareJobPayload(values: CreateJobDto | UpdateJobDto): CreateJobDto | UpdateJobDto {
  const payload: Record<string, unknown> = { ...values };
  if (typeof payload.incoterms === 'string') {
    payload.incoterms = payload.incoterms.toUpperCase();
  }
  return omitEmpty(payload);
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
