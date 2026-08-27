import { z } from 'zod';
import {
  amountField,
  currencyCode,
  entityCode,
  isValidLogicalDepartmentName,
  masterSelect,
  normalizeName,
  optionalTextUndef,
  optionalUuid,
  requiredText,
  requiredUuid,
  V,
} from '@/lib/validation';
import { emptyToNumber, emptyToUndefined } from '@/lib/validation';

const valuationMethod = z.enum(['FIFO', 'LIFO'], {
  error: 'Select FIFO or LIFO',
});

const optionalDateTime = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date/time')
    .optional(),
);

const requiredDate = z.preprocess(
  emptyToUndefined,
  z
    .string({ error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date'),
);

const positiveQty = z.preprocess(
  emptyToNumber,
  z
    .number({ error: 'Enter a quantity' })
    .gt(0, 'Quantity must be greater than 0')
    .refine((n) => Number.isFinite(n), 'Enter a valid quantity'),
);

const nonZeroQty = z.preprocess(
  emptyToNumber,
  z
    .number({ error: 'Enter a quantity' })
    .refine((n) => Number.isFinite(n) && n !== 0, 'Quantity cannot be zero'),
);

/** Item display name — rejects digit-heavy / keyboard-smash junk (e.g. 65444gf). */
const wmsItemName = z.preprocess(
  normalizeName,
  z
    .string({ error: V.required })
    .min(2, V.minLength(2))
    .max(200, V.maxLength(200))
    .refine((v) => v.trim().length > 0, V.whitespace)
    .superRefine((v, ctx) => {
      const result = isValidLogicalDepartmentName(v);
      if (result.ok) return;
      ctx.addIssue({
        code: 'custom',
        message:
          result.reason === 'letters'
            ? 'Item name must include at least two letters'
            : result.reason === 'junk'
              ? 'Item name looks invalid — use a real product name, not codes or random characters'
              : 'Enter a valid item name (e.g. Shipping Carton, Diesel Filter)',
      });
    }),
);

const optionalItemDescription = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .max(1000, V.maxLength(1000))
    .superRefine((v, ctx) => {
      const result = isValidLogicalDepartmentName(v);
      if (!result.ok) {
        ctx.addIssue({
          code: 'custom',
          message: 'Description looks invalid — use clear text, not random characters',
        });
        return;
      }
      // Reject compact alphanumeric junk like "hhfr56"
      if (/\d/.test(v) && !/\s/.test(v)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Description looks invalid — use clear wording (e.g. Heavy duty filter cartridge)',
        });
      }
    })
    .optional(),
);

export const upsertWmsSettingsSchema = z.object({
  valuation_method: valuationMethod,
  default_free_days: amountField({ required: true, min: 0, max: 3650, maxDecimals: 0 }),
  default_storage_rate: amountField({ required: true, min: 0, max: 1_000_000, maxDecimals: 4 }),
  default_currency: currencyCode(true),
});

/** Static shape used when UOM master options are not loaded yet. */
export const createWmsItemSchema = z.object({
  code: entityCode({ min: 2, max: 40 }),
  name: wmsItemName,
  description: optionalItemDescription,
  uom_code: entityCode({ min: 1, max: 20, message: V.uomCode }),
  low_stock_threshold: amountField({ required: false, min: 0, max: 1_000_000_000, maxDecimals: 4 }),
  is_active: z.boolean().optional(),
});

/** Prefer this when UOM options from Masters are available. */
export function createWmsItemSchemaWithUoms(allowedUomCodes: readonly string[]) {
  return z.object({
    code: entityCode({ min: 2, max: 40 }),
    name: wmsItemName,
    description: optionalItemDescription,
    uom_code: masterSelect({
      required: true,
      allowedValues: allowedUomCodes,
      message: V.uom,
    }),
    low_stock_threshold: amountField({
      required: false,
      min: 0,
      max: 1_000_000_000,
      maxDecimals: 4,
    }),
    is_active: z.boolean().optional(),
  });
}

export const updateWmsItemSchema = createWmsItemSchema.partial().extend({
  code: entityCode({ min: 2, max: 40 }).optional(),
  name: wmsItemName.optional(),
});

const asnLineSchema = z.object({
  item_id: requiredUuid('Select an item'),
  quantity: positiveQty,
  cbm: amountField({ required: false, min: 0, max: 1_000_000, maxDecimals: 6 }),
  remarks: optionalTextUndef({ max: 500 }),
});

export const createAsnSchema = z.object({
  warehouse_id: requiredUuid('Select a warehouse'),
  party_id: optionalUuid(),
  job_id: optionalUuid(),
  expected_at: optionalDateTime,
  remarks: optionalTextUndef({ max: 1000 }),
  lines: z.array(asnLineSchema).min(1, 'Add at least one line'),
});

const grnLineSchema = z.object({
  item_id: requiredUuid('Select an item'),
  quantity: positiveQty,
  cbm: amountField({ required: false, min: 0, max: 1_000_000, maxDecimals: 6 }),
  remarks: optionalTextUndef({ max: 500 }),
  unit_cost: amountField({ required: false, min: 0, max: 1_000_000_000, maxDecimals: 4 }),
  batch_code: optionalTextUndef({ max: 80 }),
});

export const createGrnSchema = z.object({
  warehouse_id: requiredUuid('Select a warehouse'),
  party_id: optionalUuid(),
  job_id: optionalUuid(),
  asn_id: optionalUuid(),
  received_at: optionalDateTime,
  remarks: optionalTextUndef({ max: 1000 }),
  lines: z.array(grnLineSchema).min(1, 'Add at least one line'),
});

const gdoLineSchema = z.object({
  item_id: requiredUuid('Select an item'),
  quantity: positiveQty,
  remarks: optionalTextUndef({ max: 500 }),
});

export const createGdoSchema = z.object({
  warehouse_id: requiredUuid('Select a warehouse'),
  party_id: optionalUuid(),
  job_id: optionalUuid(),
  delivered_at: optionalDateTime,
  remarks: optionalTextUndef({ max: 1000 }),
  lines: z.array(gdoLineSchema).min(1, 'Add at least one line'),
});

export const adjustStockSchema = z.object({
  warehouse_id: requiredUuid('Select a warehouse'),
  item_id: requiredUuid('Select an item'),
  quantity: nonZeroQty,
  remarks: requiredText({ min: 1, max: 500 }),
});

export const createTransferSchema = z
  .object({
    from_warehouse_id: requiredUuid('Select from warehouse'),
    to_warehouse_id: requiredUuid('Select to warehouse'),
    remarks: optionalTextUndef({ max: 500 }),
    item_id: requiredUuid('Select an item'),
    quantity: positiveQty,
  })
  .superRefine((data, ctx) => {
    if (data.from_warehouse_id && data.to_warehouse_id && data.from_warehouse_id === data.to_warehouse_id) {
      ctx.addIssue({
        code: 'custom',
        path: ['to_warehouse_id'],
        message: 'To warehouse must be different from from warehouse',
      });
    }
  });

export const calculateStorageSchema = z
  .object({
    warehouse_id: requiredUuid('Select a warehouse'),
    party_id: requiredUuid('Enter a valid party ID'),
    period_from: requiredDate,
    period_to: requiredDate,
    free_days: amountField({ required: false, min: 0, max: 3650, maxDecimals: 0 }),
    rate_per_day: amountField({ required: false, min: 0, max: 1_000_000, maxDecimals: 4 }),
    currency_code: currencyCode(false),
  })
  .superRefine((data, ctx) => {
    if (data.period_from && data.period_to && data.period_to < data.period_from) {
      ctx.addIssue({
        code: 'custom',
        path: ['period_to'],
        message: 'Period to must be on or after period from',
      });
    }
  });

export const invoiceStorageSchema = z.object({
  charge_ids: z.array(requiredUuid('Invalid charge id')).min(1, 'Select at least one charge'),
});

export type UpsertWmsSettingsForm = z.infer<typeof upsertWmsSettingsSchema>;
export type CreateWmsItemForm = z.infer<typeof createWmsItemSchema>;
export type CreateAsnForm = z.infer<typeof createAsnSchema>;
export type CreateGrnForm = z.infer<typeof createGrnSchema>;
export type CreateGdoForm = z.infer<typeof createGdoSchema>;
export type AdjustStockForm = z.infer<typeof adjustStockSchema>;
export type CreateTransferForm = z.infer<typeof createTransferSchema>;
export type CalculateStorageForm = z.infer<typeof calculateStorageSchema>;
