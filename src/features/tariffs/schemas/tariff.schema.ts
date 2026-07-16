import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  optionalTextUndef,
  optionalUuid,
  requiredUuid,
} from '@/lib/validation';
import { TARIFF_SERVICE_TYPES } from '../constants/tariff.constants';

const serviceTypeSchema = z.enum(TARIFF_SERVICE_TYPES);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .optional(),
);

const requiredDate = z.preprocess(
  emptyToUndefined,
  z
    .string({ error: 'Valid from is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
);

export const createTariffSchema = z
  .object({
    service_type: serviceTypeSchema,
    origin_port_id: optionalUuid(),
    dest_port_id: optionalUuid(),
    container_type_id: optionalUuid(),
    charge_code_id: requiredUuid('Charge code is required'),
    customer_id: optionalUuid(),
    unit: optionalTextUndef({ max: 100 }),
    sale_rate: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
    cost_rate: amountField({ required: true, min: 0, allowNegative: false, maxDecimals: 4 }),
    currency_code: currencyCode(true),
    valid_from: requiredDate,
    valid_to: optionalDate,
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.valid_from && data.valid_to && data.valid_to < data.valid_from) {
      ctx.addIssue({
        code: 'custom',
        path: ['valid_to'],
        message: 'Valid to must be on or after valid from',
      });
    }
    if (
      data.origin_port_id &&
      data.dest_port_id &&
      data.origin_port_id === data.dest_port_id
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dest_port_id'],
        message: 'Destination must differ from origin',
      });
    }
  });

export const updateTariffSchema = z
  .object({
    service_type: serviceTypeSchema.optional(),
    origin_port_id: optionalUuid(),
    dest_port_id: optionalUuid(),
    container_type_id: optionalUuid(),
    charge_code_id: optionalUuid(),
    customer_id: optionalUuid(),
    unit: optionalTextUndef({ max: 100 }),
    sale_rate: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
    cost_rate: amountField({ required: false, min: 0, allowNegative: false, maxDecimals: 4 }),
    currency_code: currencyCode(false),
    valid_from: optionalDate,
    valid_to: optionalDate,
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.valid_from && data.valid_to && data.valid_to < data.valid_from) {
      ctx.addIssue({
        code: 'custom',
        path: ['valid_to'],
        message: 'Valid to must be on or after valid from',
      });
    }
    if (
      data.origin_port_id &&
      data.dest_port_id &&
      data.origin_port_id === data.dest_port_id
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dest_port_id'],
        message: 'Destination must differ from origin',
      });
    }
  });

export type CreateTariffFormValues = z.infer<typeof createTariffSchema>;
export type UpdateTariffFormValues = z.infer<typeof updateTariffSchema>;
