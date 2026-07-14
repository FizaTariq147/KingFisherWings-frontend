import { z } from 'zod';
import {
  amountField,
  emptyToUndefined,
  optionalTextUndef,
  requiredText,
} from '@/lib/validation';
import { DISTANCE_UNITS } from '../constants/zipDistance.constants';

const unitSchema = z.preprocess((v) => {
  if (v === '' || v == null) return 'KM';
  const s = String(v).trim();
  if (/^mi(les)?$/i.test(s)) return 'Miles';
  if (/^(km|kilometers?)$/i.test(s)) return 'KM';
  return s;
}, z.enum(DISTANCE_UNITS));

export const createZipDistanceSchema = z
  .object({
    from_zip: requiredText({ min: 1, max: 20 }),
    from_city: optionalTextUndef({ max: 100 }),
    to_zip: requiredText({ min: 1, max: 20 }),
    to_city: optionalTextUndef({ max: 100 }),
    distance: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
    unit: unitSchema,
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.from_zip.trim().toUpperCase() === data.to_zip.trim().toUpperCase() &&
      (data.from_city ?? '').trim().toLowerCase() === (data.to_city ?? '').trim().toLowerCase()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['to_zip'],
        message: 'Destination must differ from origin when city is the same',
      });
    }
  });

export const updateZipDistanceSchema = z
  .object({
    from_zip: z.preprocess(emptyToUndefined, z.string().min(1).max(20).optional()),
    from_city: optionalTextUndef({ max: 100 }),
    to_zip: z.preprocess(emptyToUndefined, z.string().min(1).max(20).optional()),
    to_city: optionalTextUndef({ max: 100 }),
    distance: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
    unit: z.preprocess(emptyToUndefined, z.enum(DISTANCE_UNITS).optional()),
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.from_zip &&
      data.to_zip &&
      data.from_zip.trim().toUpperCase() === data.to_zip.trim().toUpperCase() &&
      (data.from_city ?? '').trim().toLowerCase() === (data.to_city ?? '').trim().toLowerCase()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['to_zip'],
        message: 'Destination must differ from origin when city is the same',
      });
    }
  });

export type CreateZipDistanceFormValues = z.infer<typeof createZipDistanceSchema>;
export type UpdateZipDistanceFormValues = z.infer<typeof updateZipDistanceSchema>;
