import type {
  AllocateAwbDto,
  CreateAwbStockBatchDto,
  TransferAwbBatchDto,
  UpdateAwbStockBatchDto,
  VoidAwbAllocationDto,
} from '../types/awbStock.types';

/**
 * Live master UUIDs required by CreateAwbStockBatchDto.
 * Never use Swagger sample UUID `3fa85f64-5717-4562-b3fc-2c963f66afa6`.
 */
export interface AwbStockDemoRefs {
  airlineId: string;
  branchId?: string;
  jobId?: string;
  /** 3-digit IATA airline prefix, e.g. Emirates = 176 */
  prefix?: string;
}

/** Build Swagger-valid CreateAwbStockBatchDto for form fill / POST testing. */
export function buildAwbStockBatchDemoValues(
  refs: AwbStockDemoRefs,
): CreateAwbStockBatchDto {
  const prefix = (refs.prefix || '176').replace(/\D/g, '').padStart(3, '0').slice(0, 3);
  return {
    airline_id: refs.airlineId,
    branch_id: refs.branchId || '',
    prefix,
    range_from: 12345670,
    range_to: 12345699,
    low_stock_threshold: 10,
    notes: 'Demo AWB stock batch — FE validation seed. Replace airline/branch UUIDs with live masters.',
  };
}

/** Minimal valid POST body (required fields only). */
export function buildMinimalAwbStockBatchPayload(
  airlineId: string,
  prefix = '176',
): CreateAwbStockBatchDto {
  return {
    airline_id: airlineId,
    prefix: prefix.replace(/\D/g, '').padStart(3, '0').slice(0, 3),
    range_from: 50000000,
    range_to: 50000009,
  };
}

export function buildAllocateAwbDemo(jobId: string): AllocateAwbDto {
  return { job_id: jobId };
}

export function buildTransferAwbBatchDemo(branchId: string): TransferAwbBatchDto {
  return { branch_id: branchId };
}

export function buildVoidAwbAllocationDemo(
  reason = 'Damaged stock — demo void',
): VoidAwbAllocationDto {
  return { void_reason: reason };
}

export function buildUpdateAwbStockBatchDemo(): UpdateAwbStockBatchDto {
  return {
    low_stock_threshold: 15,
    notes: 'Threshold raised after demo allocation run.',
  };
}

/**
 * Example CreateAwbStockBatchDto (paste into Swagger / Postman).
 * Replace UUIDs with real airline (and optional branch) from your tenant.
 */
export const DEMO_CREATE_AWB_STOCK_BATCH_PAYLOAD = {
  airline_id: '<AIRLINE_UUID>',
  branch_id: '<BRANCH_UUID_OPTIONAL>',
  prefix: '176',
  range_from: 12345670,
  range_to: 12345699,
  low_stock_threshold: 10,
  notes: 'Demo AWB stock batch for Emirates prefix 176',
} as const;

export const DEMO_ALLOCATE_AWB_PAYLOAD = {
  job_id: '<JOB_UUID>',
} as const;

export const DEMO_TRANSFER_AWB_BATCH_PAYLOAD = {
  branch_id: '<BRANCH_UUID>',
} as const;

export const DEMO_VOID_AWB_ALLOCATION_PAYLOAD = {
  void_reason: 'Incorrect allocation — reprint required',
} as const;

export const DEMO_UPDATE_AWB_STOCK_BATCH_PAYLOAD = {
  low_stock_threshold: 15,
  notes: 'Updated low-stock threshold',
} as const;
