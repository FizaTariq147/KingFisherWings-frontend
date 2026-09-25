import { z } from 'zod';
import {
  amountField,
  currencyCode,
  emptyToUndefined,
  optionalTextUndef,
} from '@/lib/validation';
import { JOB_TYPES } from '@/features/quotations/constants/quotation.constants';

const jobTypeSchema = z.enum(JOB_TYPES, { required_error: 'Job type is required' });

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date (YYYY-MM-DD)')
    .optional(),
);

const optionalWeight = amountField({
  required: false,
  min: 0,
  max: 999_999.999,
  maxDecimals: 3,
  allowNegative: false,
});

const optionalVolume = amountField({
  required: false,
  min: 0,
  max: 99_999.999,
  maxDecimals: 3,
  allowNegative: false,
});

const optionalPieces = amountField({
  required: false,
  min: 0,
  max: 999_999,
  maxDecimals: 0,
  allowNegative: false,
});

/** Trimmed port / location text (UUID or free-text name). Optional at schema level; required for non-road in refine. */
const portField = z.preprocess(
  (v) => {
    if (v == null) return '';
    if (typeof v === 'string') return v.trim();
    return v;
  },
  z.string().max(200, 'Must be at most 200 characters'),
);

function isRoadOrLandQuoteJob(jobType?: string | null): boolean {
  const t = String(jobType ?? '').toUpperCase();
  return t === 'ROAD_FREIGHT' || t === 'LAND';
}

export const portalBookQuoteSchema = z
  .object({
    job_type: jobTypeSchema,
    currency_code: currencyCode(true),
    origin_port: portField,
    dest_port: portField,
    commodity: optionalTextUndef({ min: 2, max: 200 }),
    gross_weight: optionalWeight,
    chargeable_weight: optionalWeight,
    volume_cbm: optionalVolume,
    pieces: optionalPieces,
    special_requirements: optionalTextUndef({ max: 2000 }),
    valid_until: optionalDate,
  })
  .superRefine((data, ctx) => {
    const roadLand = isRoadOrLandQuoteJob(data.job_type);
    const originRaw = data.origin_port ?? '';
    const destRaw = data.dest_port ?? '';

    if (!roadLand) {
      if (originRaw.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['origin_port'],
          message: 'This field is required',
        });
      }
      if (destRaw.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['dest_port'],
          message: 'This field is required',
        });
      }
    } else {
      if (originRaw && originRaw.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['origin_port'],
          message: 'Enter at least 2 characters',
        });
      }
      if (destRaw && destRaw.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['dest_port'],
          message: 'Enter at least 2 characters',
        });
      }
    }

    const origin = originRaw.toLowerCase();
    const dest = destRaw.toLowerCase();
    if (origin && dest && origin === dest) {
      ctx.addIssue({
        code: 'custom',
        path: ['dest_port'],
        message: 'Destination must differ from origin',
      });
    }

    if (roadLand && !originRaw && !destRaw) {
      const special = data.special_requirements?.trim() ?? '';
      if (special.length < 8) {
        ctx.addIssue({
          code: 'custom',
          path: ['special_requirements'],
          message:
            'For road freight, add origin/destination hubs or describe door addresses in special requirements',
        });
      }
    }

    if (data.valid_until) {
      const parsed = Date.parse(data.valid_until);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: 'custom',
          path: ['valid_until'],
          message: 'Enter a valid date',
        });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsed < today.getTime()) {
          ctx.addIssue({
            code: 'custom',
            path: ['valid_until'],
            message: 'Valid-until date must be today or later',
          });
        }
      }
    }

    if (
      data.gross_weight != null &&
      data.chargeable_weight != null &&
      data.chargeable_weight < data.gross_weight
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['chargeable_weight'],
        message: 'Chargeable weight cannot be less than gross weight',
      });
    }

    const hasCargoDetail =
      data.gross_weight != null ||
      data.chargeable_weight != null ||
      data.volume_cbm != null ||
      data.pieces != null ||
      Boolean(data.commodity?.trim());

    if (!hasCargoDetail) {
      ctx.addIssue({
        code: 'custom',
        path: ['commodity'],
        message: 'Enter commodity and/or at least one cargo detail (weight, volume, or pieces)',
      });
    }
  });

export type PortalBookQuoteFormValues = z.input<typeof portalBookQuoteSchema>;
export type PortalBookQuotePayload = z.infer<typeof portalBookQuoteSchema>;
