import { z } from 'zod';
import { isUuid } from '@/lib/isUuid';
import type { MasterFieldConfig } from '../types/master.types';

function normalizeIsoCountryCode(value: unknown): string {
  const raw = String(value ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(raw)) return raw;
  // e.g. "United Arab Emirates (AE)" from a mis-bound select
  const paren = raw.match(/\(([A-Z]{2})\)\s*$/);
  if (paren?.[1]) return paren[1];
  const token = raw.match(/\b([A-Z]{2})\b/);
  return token?.[1] ?? raw;
}

function emptyToUndefined(value: unknown): unknown {
  if (value === '' || value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
}

function isUuidFieldName(name: string): boolean {
  return name === 'customer_id' || name.endsWith('_id');
}

/** Build a Zod object schema from master field config (shared across all resources). */
export function createMasterSchema(fields: MasterFieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case 'boolean':
        schema = z.boolean();
        break;
      case 'multiselect': {
        const arr = z.array(z.string());
        schema = field.required
          ? arr.min(1, `${field.label} should not be empty`)
          : arr.optional();
        break;
      }
      case 'select': {
        if (field.name === 'country_code' || field.name === 'flag_country') {
          schema = z.preprocess(
            normalizeIsoCountryCode,
            z
              .string()
              .regex(
                /^[A-Z]{2}$/,
                'Select a country from the list (needs a 2-letter ISO code like AE)',
              ),
          );
        } else if (isUuidFieldName(field.name)) {
          // Nest @IsOptional()+@IsUUID() rejects "" — omit empties; require real UUIDs.
          const uuidString = z
            .string()
            .refine((v) => isUuid(v), `${field.label} must be a valid UUID`);
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? uuidString : uuidString.optional(),
          );
        } else {
          schema = z.preprocess(
            emptyToUndefined,
            field.required
              ? z.string().min(1, `${field.label} is required`)
              : z.string().optional(),
          );
        }
        break;
      }
      case 'number': {
        const base = z.number();
        schema = field.required
          ? z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), base)
          : z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), base.optional());
        break;
      }
      case 'email':
        schema = field.required
          ? z.string().trim().min(1, `${field.label} is required`).email('Enter a valid email')
          : z.union([z.literal(''), z.string().email('Enter a valid email')]).optional();
        break;
      case 'url':
        schema = field.required
          ? z.string().trim().min(1, `${field.label} is required`).url('Enter a valid URL')
          : z.union([z.literal(''), z.string().url('Enter a valid URL')]).optional();
        break;
      default:
        if (field.name === 'country_code' || field.name === 'flag_country') {
          schema = z.preprocess(
            normalizeIsoCountryCode,
            z
              .string()
              .regex(/^[A-Z]{2}$/, 'Country must be a 2-letter ISO code (e.g. AE)'),
          );
        } else if (isUuidFieldName(field.name)) {
          const uuidString = z
            .string()
            .refine((v) => isUuid(v), `${field.label} must be a valid UUID`);
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? uuidString : uuidString.optional(),
          );
        } else {
          schema = z.preprocess(
            emptyToUndefined,
            field.required
              ? z.string().min(1, `${field.label} is required`)
              : z.string().optional(),
          );
        }
        break;
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

export function validateMasterValues(
  fields: MasterFieldConfig[],
  values: Record<string, unknown>,
): { ok: true; data: Record<string, unknown> } | { ok: false; message: string } {
  const parsed = createMasterSchema(fields).safeParse(values);
  if (parsed.success) {
    return { ok: true, data: parsed.data as Record<string, unknown> };
  }
  const first = parsed.error.issues[0];
  return { ok: false, message: first?.message ?? 'Validation failed.' };
}
