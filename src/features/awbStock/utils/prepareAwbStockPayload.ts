import type {
  CreateAwbStockBatchDto,
  UpdateAwbStockBatchDto,
} from '../types/awbStock.types';

function omitEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '' || value === null || value === undefined) continue;
    out[key] = value;
  }
  return out as T;
}

export function prepareCreateBatchPayload(
  values: CreateAwbStockBatchDto,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    airline_id: values.airline_id,
    prefix: String(values.prefix).trim(),
    range_from: values.range_from,
    range_to: values.range_to,
  };
  if (values.branch_id && String(values.branch_id).trim()) {
    payload.branch_id = values.branch_id;
  }
  if (
    typeof values.low_stock_threshold === 'number' &&
    Number.isFinite(values.low_stock_threshold)
  ) {
    payload.low_stock_threshold = values.low_stock_threshold;
  }
  if (values.notes && String(values.notes).trim()) {
    payload.notes = String(values.notes).trim();
  }
  return omitEmpty(payload);
}

export function prepareUpdateBatchPayload(
  values: UpdateAwbStockBatchDto,
): UpdateAwbStockBatchDto {
  return omitEmpty({ ...values }) as UpdateAwbStockBatchDto;
}

export const AWB_STOCK_CREATE_DEFAULTS: CreateAwbStockBatchDto = {
  airline_id: '',
  branch_id: '',
  prefix: '',
  range_from: undefined as unknown as number,
  range_to: undefined as unknown as number,
  low_stock_threshold: 10,
  notes: '',
};

export function batchToFormValues(batch: {
  airline_id: string;
  branch_id?: string;
  prefix: string;
  range_from: number;
  range_to: number;
  low_stock_threshold?: number;
  notes?: string;
}) {
  return {
    airline_id: batch.airline_id,
    branch_id: batch.branch_id ?? '',
    prefix: batch.prefix,
    range_from: batch.range_from,
    range_to: batch.range_to,
    low_stock_threshold: batch.low_stock_threshold ?? 10,
    notes: batch.notes ?? '',
  };
}
