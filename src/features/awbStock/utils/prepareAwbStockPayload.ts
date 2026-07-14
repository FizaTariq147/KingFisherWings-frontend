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
): CreateAwbStockBatchDto {
  return omitEmpty({
    ...values,
    prefix: String(values.prefix).trim(),
    low_stock_threshold: values.low_stock_threshold ?? 10,
  }) as CreateAwbStockBatchDto;
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
