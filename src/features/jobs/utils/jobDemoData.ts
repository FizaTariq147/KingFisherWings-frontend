import type { CreateJobFormValues, JobType } from '../types/job.types';

/**
 * Live master/party UUIDs required by CreateJobDto.
 * Never use Swagger sample UUID `3fa85f64-5717-4562-b3fc-2c963f66afa6`.
 */
export interface JobDemoRefs {
  shipperId: string;
  consigneeId?: string;
  agentId?: string;
  originPortId?: string;
  destPortId?: string;
  containerTypeId?: string;
  companyId?: string;
  branchId?: string;
  departmentId?: string;
  salespersonId?: string;
  opsUserId?: string;
  parentJobId?: string;
}

function plusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Realistic CreateJobDto values for form fill / POST /jobs testing.
 * Only includes fields defined on Swagger CreateJobDto.
 */
export function buildJobDemoValues(
  refs: JobDemoRefs,
  jobType: JobType = 'AIR_EXPORT',
): CreateJobFormValues {
  const isSeaFcl = jobType === 'SEA_FCL_EXPORT' || jobType === 'SEA_FCL_IMPORT';
  const isAir = jobType === 'AIR_EXPORT' || jobType === 'AIR_IMPORT';

  return {
    job_type: jobType,
    shipper_id: refs.shipperId,
    company_id: refs.companyId || '',
    branch_id: refs.branchId || '',
    department_id: refs.departmentId || '',
    parent_job_id: refs.parentJobId || '',
    consignee_id: refs.consigneeId || '',
    agent_id: refs.agentId || '',
    salesperson_id: refs.salespersonId || '',
    ops_user_id: refs.opsUserId || '',
    origin_port_id: refs.originPortId || '',
    dest_port_id: refs.destPortId || '',
    commodity: isAir
      ? 'Consumer electronics — boxed units'
      : isSeaFcl
        ? 'General merchandise — cartons on pallets'
        : 'Mixed general cargo',
    hs_code: isAir ? '8517.12' : '8471.30',
    gross_weight: isAir ? 485.5 : isSeaFcl ? 18500 : 2200,
    chargeable_weight: isAir ? 520 : isSeaFcl ? 18500 : 2200,
    volume_cbm: isAir ? 2.85 : isSeaFcl ? 55.2 : 8.5,
    pieces: isAir ? 24 : isSeaFcl ? 480 : 60,
    container_type_id: isSeaFcl ? refs.containerTypeId || '' : '',
    container_count: isSeaFcl ? 1 : undefined,
    incoterms: 'FOB',
    is_dg: false,
    dg_class: '',
    notes: 'Demo job for FE validation — replace FK UUIDs with live tenant masters.',
    customer_remarks: 'Notify consignee 48h before arrival. Prefer weekday delivery.',
    tags: ['demo', isAir ? 'air' : 'sea'],
    etd: plusDays(7),
    eta: plusDays(isAir ? 10 : 25),
  };
}

/** Minimal valid POST body (required fields only + common optionals). */
export function buildMinimalJobCreatePayload(shipperId: string, jobType: JobType = 'AIR_EXPORT') {
  return {
    job_type: jobType,
    shipper_id: shipperId,
    commodity: 'General cargo — demo',
    hs_code: '8471.30',
    pieces: 10,
    gross_weight: 250,
    chargeable_weight: 250,
    volume_cbm: 1.2,
    incoterms: 'EXW',
    is_dg: false,
    etd: plusDays(5),
    eta: plusDays(12),
    notes: 'Minimal demo create payload',
  };
}

/**
 * Example full CreateJobDto (paste into Swagger / Postman).
 * Replace every UUID with real records from your tenant.
 */
export const DEMO_CREATE_JOB_PAYLOAD_EXAMPLE = {
  job_type: 'AIR_EXPORT',
  shipper_id: '<PARTY_UUID_SHIPPER>',
  consignee_id: '<PARTY_UUID_CONSIGNEE>',
  agent_id: '<PARTY_UUID_AGENT>',
  origin_port_id: '<PORT_UUID_ORIGIN>',
  dest_port_id: '<PORT_UUID_DEST>',
  commodity: 'Consumer electronics — boxed units',
  hs_code: '8517.12',
  gross_weight: 485.5,
  chargeable_weight: 520,
  volume_cbm: 2.85,
  pieces: 24,
  incoterms: 'FOB',
  is_dg: false,
  notes: 'Demo job for FE validation',
  customer_remarks: 'Notify consignee 48h before arrival.',
  tags: ['demo', 'air'],
  etd: '2026-07-22',
  eta: '2026-07-25',
} as const;

/** Sea FCL export example (includes container fields). */
export const DEMO_CREATE_SEA_FCL_JOB_PAYLOAD_EXAMPLE = {
  job_type: 'SEA_FCL_EXPORT',
  shipper_id: '<PARTY_UUID_SHIPPER>',
  consignee_id: '<PARTY_UUID_CONSIGNEE>',
  agent_id: '<PARTY_UUID_AGENT>',
  origin_port_id: '<PORT_UUID_ORIGIN>',
  dest_port_id: '<PORT_UUID_DEST>',
  container_type_id: '<CONTAINER_TYPE_UUID>',
  container_count: 1,
  commodity: 'General merchandise — cartons on pallets',
  hs_code: '8471.30',
  gross_weight: 18500,
  chargeable_weight: 18500,
  volume_cbm: 55.2,
  pieces: 480,
  incoterms: 'FOB',
  is_dg: false,
  notes: 'Demo FCL export job',
  customer_remarks: 'CY cutoff — confirm equipment early.',
  tags: ['demo', 'sea', 'fcl'],
  etd: '2026-07-22',
  eta: '2026-08-09',
} as const;
