import { z } from 'zod';
import {
  amountField,
  emptyToUndefined,
  optionalTextUndef,
  trimString,
} from '@/lib/validation';
import { V } from '@/lib/validation/messages';
import { DISTANCE_UNITS } from '../constants/zipDistance.constants';

const unitSchema = z.preprocess((v) => {
  if (v === '' || v == null) return 'KM';
  const s = String(v).trim();
  if (/^mi(les)?$/i.test(s)) return 'Miles';
  if (/^(km|kilometers?)$/i.test(s)) return 'KM';
  return s;
}, z.enum(DISTANCE_UNITS));

/** Postal / zip-style code — letters, digits, spaces, hyphens. */
const zipCodeField = z.preprocess(
  trimString,
  z
    .string({ error: V.required })
    .min(1, V.required)
    .max(20, V.maxLength(20))
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9\s-]{0,19}$/,
      'Use letters, numbers, spaces, or hyphens only',
    ),
);

export const createZipDistanceSchema = z
  .object({
    from_zip: zipCodeField,
    from_city: optionalTextUndef({ max: 100 }),
    to_zip: zipCodeField,
    to_city: optionalTextUndef({ max: 100 }),
    distance: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
    unit: unitSchema,
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.distance === 'number' && !(data.distance > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['distance'],
        message: V.positive,
      });
    }
    const sameZip =
      data.from_zip.trim().toUpperCase() === data.to_zip.trim().toUpperCase();
    const sameCity =
      (data.from_city ?? '').trim().toLowerCase() === (data.to_city ?? '').trim().toLowerCase();
    if (sameZip && sameCity) {
      ctx.addIssue({
        code: 'custom',
        path: ['to_zip'],
        message: 'Destination must differ from origin',
      });
    }
  });

export const updateZipDistanceSchema = z
  .object({
    from_zip: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(1)
        .max(20)
        .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{0,19}$/, 'Use letters, numbers, spaces, or hyphens only')
        .optional(),
    ),
    from_city: optionalTextUndef({ max: 100 }),
    to_zip: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(1)
        .max(20)
        .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{0,19}$/, 'Use letters, numbers, spaces, or hyphens only')
        .optional(),
    ),
    to_city: optionalTextUndef({ max: 100 }),
    distance: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
    unit: z.preprocess(emptyToUndefined, z.enum(DISTANCE_UNITS).optional()),
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (typeof data.distance === 'number' && !(data.distance > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['distance'],
        message: V.positive,
      });
    }
    if (
      data.from_zip &&
      data.to_zip &&
      data.from_zip.trim().toUpperCase() === data.to_zip.trim().toUpperCase() &&
      (data.from_city ?? '').trim().toLowerCase() === (data.to_city ?? '').trim().toLowerCase()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['to_zip'],
        message: 'Destination must differ from origin',
      });
    }
  });

export type CreateZipDistanceFormValues = z.infer<typeof createZipDistanceSchema>;
export type UpdateZipDistanceFormValues = z.infer<typeof updateZipDistanceSchema>;
