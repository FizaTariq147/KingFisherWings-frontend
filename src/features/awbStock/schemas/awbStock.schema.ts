import { z } from 'zod';
import {
  integerField,
  optionalTextUndef,
  optionalUuid,
  requiredText,
} from '@/lib/validation';

export const createAwbStockBatchSchema = z
  .object({
    airline_id: z.string().uuid('Select a valid airline'),
    branch_id: optionalUuid(),
    prefix: requiredText({ min: 3, max: 3 }).refine(
      (v) => /^\d{3}$/.test(v.trim()),
      'Prefix must be a 3-digit IATA airline code',
    ),
    range_from: integerField({ required: true, min: 1, allowNegative: false }),
    range_to: integerField({ required: true, min: 1, allowNegative: false }),
    low_stock_threshold: integerField({
      required: false,
      min: 1,
      max: 10000,
      allowNegative: false,
    }),
    notes: optionalTextUndef({ max: 2000 }),
  })
  .superRefine((data, ctx) => {
    if (
      typeof data.range_from === 'number' &&
      typeof data.range_to === 'number' &&
      data.range_from >= data.range_to
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['range_to'],
        message: 'End AWB number must be greater than start AWB number',
      });
    }
    if (
      typeof data.range_from === 'number' &&
      typeof data.range_to === 'number' &&
      data.range_to - data.range_from + 1 > 100_000
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['range_to'],
        message: 'Range cannot exceed 100,000 AWB numbers',
      });
    }
  });

export const updateAwbStockBatchSchema = z.object({
  low_stock_threshold: integerField({
    required: false,
    min: 1,
    max: 10000,
    allowNegative: false,
  }),
  notes: optionalTextUndef({ max: 2000 }),
});

export const allocateAwbSchema = z.object({
  job_id: z.string().uuid('Select a valid job'),
});

export const transferAwbBatchSchema = z.object({
  branch_id: z.string().uuid('Select a valid branch'),
});

export const voidAwbAllocationSchema = z.object({
  void_reason: requiredText({ min: 2, max: 255 }).refine(
    (v) => !/\s{2,}/.test(v),
    'Remove consecutive spaces',
  ),
});

export type CreateAwbStockBatchFormValues = z.infer<typeof createAwbStockBatchSchema>;
export type UpdateAwbStockBatchFormValues = z.infer<typeof updateAwbStockBatchSchema>;
export type AllocateAwbFormValues = z.infer<typeof allocateAwbSchema>;
export type TransferAwbBatchFormValues = z.infer<typeof transferAwbBatchSchema>;
export type VoidAwbAllocationFormValues = z.infer<typeof voidAwbAllocationSchema>;
