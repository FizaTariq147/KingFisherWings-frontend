import { z } from 'zod';
import { isUuid } from '@/lib/isUuid';
import {
  awbPrefix,
  countryCode,
  currencyCode,
  dialCode,
  emptyToUndefined,
  entityCode,
  dgClass,
  dutyRatePercent,
  hsCode,
  iataCode,
  optionalTextUndef,
  requiredText,
  icaoCode,
  imoNumber,
  isCodeField,
  isCodeRelatedToName,
  isDepartmentCodeWithCompanyPrefix,
  isBranchCodeWithCompanyPrefix,
  isNameField,
  isPrefixField,
  latitude,
  longitude,
  optionalName,
  optionalEmail,
  optionalPhone,
  optionalUrlOrEmpty,
  prefixCode,
  requiredDepartmentName,
  requiredDesignationName,
  requiredBranchName,
  requiredEmail,
  requiredName,
  requiredPhone,
  requiredUrl,
  suggestDepartmentCode,
  suggestBranchCode,
  swiftBic,
  unLocode,
  unNumber,
  RULES,
  V,
} from '@/lib/validation';
import { isValidContainerTypeSizeValue, normalizeContainerTypeSize } from '../constants/containerTypeSizes';
import {
  isValidUomCategoryValue,
  normalizeUomCategory,
} from '../constants/uomCategories';
import {
  currenciesAreSame,
  EXCHANGE_RATE_POSITIVE,
  EXCHANGE_RATE_SAME_CURRENCY,
} from '../utils/exchangeRateRules';
import type { MasterFieldConfig } from '../types/master.types';

function isUuidFieldName(name: string): boolean {
  return name === 'customer_id' || name.endsWith('_id');
}

function isUomField(field: MasterFieldConfig): boolean {
  return (
    field.name === 'unit' ||
    field.name === 'uom' ||
    field.name === 'uom_id' ||
    field.name === 'unit_of_measure' ||
    field.name === 'unit_of_measure_id' ||
    field.optionsFrom === 'units-of-measure'
  );
}

const NAME_CODE_RELATED_RESOURCES = new Set([
  'departments',
  'container-types',
  'branches',
  'units-of-measure',
]);

const PORTS_RESOURCE_KEYS = new Set(['ports', 'seaport', 'landport']);

function isPortsResource(resourceKey?: string): boolean {
  return Boolean(resourceKey && PORTS_RESOURCE_KEYS.has(resourceKey));
}

function decimalsOk(n: number, max: number): boolean {
  if (!Number.isFinite(n)) return false;
  const parts = String(n).split('.');
  return !parts[1] || parts[1].length <= max;
}

/** Build a Zod object schema from master field config (shared across all resources). */
export function createMasterSchema(
  fields: MasterFieldConfig[],
  resourceKey?: string,
  opts?: { selectedCurrencyCode?: string; companyCode?: string },
) {
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
          schema = field.required ? countryCode(true) : countryCode(false);
        } else if (resourceKey === 'exchange-rates' && field.name === 'base_currency') {
          schema = currencyCode(true);
        } else if (
          resourceKey === 'container-types' &&
          field.name === 'size'
        ) {
          const sizeField = z.preprocess(
            (v) => (typeof v === 'string' ? normalizeContainerTypeSize(v) : v),
            z
              .string({ error: V.requiredSelect })
              .min(1, V.requiredSelect)
              .refine((v) => isValidContainerTypeSizeValue(v), V.containerSize),
          );
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? sizeField : sizeField.optional(),
          );
        } else if (resourceKey === 'units-of-measure' && field.name === 'category') {
          const category = z.preprocess(
            (v) => (typeof v === 'string' ? normalizeUomCategory(v) : v),
            z
              .string({ error: V.uomCategory })
              .min(2, V.uomCategory)
              .max(50, V.uomCategory)
              .refine((v) => isValidUomCategoryValue(v), V.uomCategory),
          );
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? category : category.optional(),
          );
        } else if (isUuidFieldName(field.name) || isUomField(field)) {
          const uuidOrCode = z
            .string()
            .min(1, V.requiredSelect)
            .refine(
              (v) => isUuid(v) || /^[A-Z0-9_-]+$/i.test(v),
              isUomField(field) ? V.uom : `${field.label} must be a valid selection`,
            );
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? uuidOrCode : uuidOrCode.optional(),
          );
        } else if (isPortsResource(resourceKey) && field.name === 'mode') {
          const mode = z
            .string({ error: V.portMode })
            .refine(
              (v) => (RULES.PORT_MODES as readonly string[]).includes(v),
              V.portMode,
            );
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? mode : mode.optional(),
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
        if (field.name === 'latitude') {
          schema = latitude({ required: Boolean(field.required) });
        } else if (field.name === 'longitude') {
          schema = longitude({ required: Boolean(field.required) });
        } else if (resourceKey === 'container-types' && field.name === 'teu') {
          const teu = z
            .number({ error: V.containerTeu })
            .min(0, V.containerTeu)
            .max(10, V.containerTeu)
            .refine((n) => decimalsOk(n, 2), V.decimals(2));
          schema = z.preprocess(
            (v) => (v === '' || v == null ? undefined : Number(v)),
            field.required ? teu : teu.optional(),
          );
        } else if (resourceKey === 'container-types' && field.name === 'max_payload') {
          const payload = z
            .number({ error: V.containerPayload })
            .min(0, V.containerPayload)
            .max(100_000, V.containerPayload)
            .refine((n) => decimalsOk(n, 2), V.decimals(2));
          schema = z.preprocess(
            (v) => (v === '' || v == null ? undefined : Number(v)),
            field.required ? payload : payload.optional(),
          );
        } else if (resourceKey === 'container-types' && field.name === 'volume_cbm') {
          const volume = z
            .number({ error: V.containerVolume })
            .min(0, V.containerVolume)
            .max(500, V.containerVolume)
            .refine((n) => decimalsOk(n, 3), V.decimals(3));
          schema = z.preprocess(
            (v) => (v === '' || v == null ? undefined : Number(v)),
            field.required ? volume : volume.optional(),
          );
        } else if (resourceKey === 'exchange-rates' && field.name === 'rate') {
          const rate = z
            .number({ error: EXCHANGE_RATE_POSITIVE })
            .positive(EXCHANGE_RATE_POSITIVE)
            .refine((n) => decimalsOk(n, 8), V.decimals(8));
          schema = z.preprocess(
            (v) => (v === '' || v == null ? undefined : Number(v)),
            field.required ? rate : rate.optional(),
          );
        } else if (
          resourceKey === 'hs-codes' &&
          (field.name === 'import_duty_rate' || field.name === 'export_duty_rate')
        ) {
          schema = dutyRatePercent(Boolean(field.required));
        } else if (resourceKey === 'warehouses' && field.name === 'capacity_sqm') {
          const capacity = z
            .number({ error: V.warehouseCapacity })
            .min(0, V.warehouseCapacity)
            .max(10_000_000, V.warehouseCapacity)
            .refine((n) => decimalsOk(n, 2), V.decimals(2));
          schema = z.preprocess(
            (v) => (v === '' || v == null ? undefined : Number(v)),
            field.required ? capacity : capacity.optional(),
          );
        } else {
          const base = z.number({ error: 'Enter a valid number' });
          schema = field.required
            ? z.preprocess((v) => (v === '' || v == null ? undefined : Number(v)), base)
            : z.preprocess(
                (v) => (v === '' || v == null ? undefined : Number(v)),
                base.optional(),
              );
        }
        break;
      }
      case 'email':
        schema = field.required
          ? requiredEmail()
          : z.union([z.literal(''), optionalEmail()]);
        break;
      case 'url':
        schema = field.required ? requiredUrl() : optionalUrlOrEmpty();
        break;
      default:
        if (field.name === 'country_code' || field.name === 'flag_country') {
          schema = field.required ? countryCode(true) : countryCode(false);
        } else if (field.name === 'phone' || field.name.endsWith('_phone')) {
          schema = field.required ? requiredPhone() : optionalPhone();
        } else if (field.name === 'dial_code') {
          schema = field.required ? dialCode(true) : dialCode(false);
        } else if (field.name === 'iata_code') {
          schema = field.required ? iataCode(true) : iataCode(false);
        } else if (field.name === 'icao_code') {
          schema = field.required ? icaoCode(true) : icaoCode(false);
        } else if (field.name === 'un_locode') {
          schema = field.required ? unLocode(true) : unLocode(false);
        } else if (field.name === 'imo_number') {
          schema = field.required ? imoNumber(true) : imoNumber(false);
        } else if (field.name === 'swift_code') {
          schema = field.required ? swiftBic(true) : swiftBic(false);
        } else if (
          field.name === 'awb_prefix' ||
          (field.name === 'prefix_code' && resourceKey === 'airlines')
        ) {
          schema = field.required ? awbPrefix(true) : awbPrefix(false);
        } else if (field.name === 'hs_code') {
          schema = field.required ? hsCode(true) : hsCode(false);
        } else if (field.name === 'un_number') {
          schema = field.required ? unNumber(true) : unNumber(false);
        } else if (resourceKey === 'hs-codes' && field.name === 'dg_class') {
          schema = field.required ? dgClass(true) : dgClass(false);
        } else if (resourceKey === 'hs-codes' && field.name === 'description') {
          schema = requiredText({ min: 2, max: 500 });
        } else if (resourceKey === 'hs-codes' && field.name === 'notes') {
          schema = optionalTextUndef({ max: 2000 });
        } else if (
          resourceKey === 'currencies' &&
          (field.name === 'code' || field.name === 'currency_code')
        ) {
          schema = field.required ? currencyCode(true) : currencyCode(false);
        } else if (isPrefixField(field.name)) {
          schema = field.required
            ? prefixCode({ required: true })
            : prefixCode({ required: false });
        } else if (isCodeField(field.name)) {
          if (
            (resourceKey === 'departments' || resourceKey === 'branches') &&
            field.name === 'code'
          ) {
            // Prefixed codes (company-slug + name) may exceed the default 20-char entity code.
            schema = entityCode({ min: 3, max: 64 });
          } else if (
            (resourceKey === 'units-of-measure' || resourceKey === 'warehouses') &&
            field.name === 'code'
          ) {
            schema = entityCode({
              min: 1,
              max: 20,
              message:
                resourceKey === 'warehouses' ? V.warehouseCode : V.uomCode,
            });
          } else {
            schema = field.required
              ? entityCode()
              : z.preprocess(
                  emptyToUndefined,
                  z
                    .string()
                    .min(2)
                    .max(20)
                    .regex(/^[A-Z0-9-]+$/, V.codeFormat)
                    .optional(),
                );
          }
        } else if (isNameField(field.name) || field.name === 'city') {
          if (resourceKey === 'departments' && field.name === 'name') {
            schema = requiredDepartmentName();
          } else if (resourceKey === 'designations' && field.name === 'name') {
            schema = requiredDesignationName();
          } else if (resourceKey === 'branches' && field.name === 'name') {
            schema = requiredBranchName({ max: 200 });
          } else if (isPortsResource(resourceKey) && field.name === 'name') {
            schema = requiredName({ min: 2, max: 200 });
          } else if (isPortsResource(resourceKey) && field.name === 'city') {
            schema = optionalName({ min: 2, max: 100 });
          } else if (resourceKey === 'units-of-measure' && field.name === 'name') {
            schema = requiredName({ min: 2, max: 100 });
          } else if (resourceKey === 'warehouses' && field.name === 'name') {
            schema = requiredName({ min: 2, max: 200 });
          } else if (resourceKey === 'warehouses' && field.name === 'city') {
            schema = optionalName({ min: 2, max: 100 });
          } else if (field.name === 'city') {
            schema = field.required ? requiredName() : optionalName();
          } else {
            schema = field.required ? requiredName() : optionalName();
          }
        } else if (resourceKey === 'warehouses' && field.name === 'address') {
          schema = optionalTextUndef({ max: 500 });
        } else if (isUuidFieldName(field.name)) {
          const uuidString = z
            .string()
            .refine((v) => isUuid(v), `${field.label} must be a valid UUID`);
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? uuidString : uuidString.optional(),
          );
        } else if (isUomField(field)) {
          schema = z.preprocess(
            emptyToUndefined,
            field.required ? z.string().min(1, V.uom) : z.string().optional(),
          );
        } else {
          schema = z.preprocess(
            emptyToUndefined,
            field.required
              ? z
                  .string()
                  .trim()
                  .min(1, `${field.label} is required`)
                  .refine((v) => v.trim().length > 0, V.whitespace)
              : z.string().optional(),
          );
        }
        break;
    }

    shape[field.name] = schema;
  }

  let objectSchema: z.ZodTypeAny = z.object(shape);

  // Code must relate to the logical name (departments, container types, …).
  if (resourceKey && NAME_CODE_RELATED_RESOURCES.has(resourceKey)) {
    objectSchema = (objectSchema as z.ZodObject<z.ZodRawShape>).superRefine((data, ctx) => {
      const name = typeof data.name === 'string' ? data.name : '';
      const code = typeof data.code === 'string' ? data.code : '';
      if (!name || !code) return;

      if (resourceKey === 'departments' || resourceKey === 'branches') {
        const companyCode = opts?.companyCode ?? '';
        const entityLabel = resourceKey === 'branches' ? 'branch' : 'department';
        if (!companyCode) {
          ctx.addIssue({
            code: 'custom',
            path: ['company_id'],
            message: `Select a company so the ${entityLabel} code can use the company prefix`,
          });
          return;
        }
        if (resourceKey === 'branches') {
          if (!isBranchCodeWithCompanyPrefix(code, companyCode, name)) {
            ctx.addIssue({
              code: 'custom',
              path: ['code'],
              message: `${V.branchCodePrefix} Suggested: ${suggestBranchCode(companyCode, name)}`,
            });
          }
          return;
        }
        if (!isDepartmentCodeWithCompanyPrefix(code, companyCode, name)) {
          ctx.addIssue({
            code: 'custom',
            path: ['code'],
            message: `${V.departmentCodePrefix} Suggested: ${suggestDepartmentCode(companyCode, name)}`,
          });
        }
        return;
      }

      if (!isCodeRelatedToName(code, name)) {
        ctx.addIssue({
          code: 'custom',
          path: ['code'],
          message:
            resourceKey === 'container-types'
              ? 'Code must relate to the name (e.g. 40ft High Cube → 40HC or 40FT-HIGH-CUBE)'
              : resourceKey === 'units-of-measure'
                ? 'Code must relate to the name (e.g. Cubic Meter → CBM or CUBIC-METER)'
                : V.codeRelatedToName,
        });
      }
    });
  }

  // Exchange rates: selected currency code must differ from base currency.
  if (resourceKey === 'exchange-rates') {
    objectSchema = (objectSchema as z.ZodObject<z.ZodRawShape>).superRefine((data, ctx) => {
      const base = typeof data.base_currency === 'string' ? data.base_currency : '';
      const selectedCode = opts?.selectedCurrencyCode ?? '';
      if (currenciesAreSame(selectedCode, base)) {
        ctx.addIssue({
          code: 'custom',
          path: ['base_currency'],
          message: EXCHANGE_RATE_SAME_CURRENCY,
        });
      }
      const rate = data.rate;
      if (typeof rate === 'number' && !(rate > 0)) {
        ctx.addIssue({
          code: 'custom',
          path: ['rate'],
          message: EXCHANGE_RATE_POSITIVE,
        });
      }
    });
  }

  // HS codes: Prohibited (banned) and Restricted (permit-controlled) are mutually exclusive.
  if (resourceKey === 'hs-codes') {
    objectSchema = (objectSchema as z.ZodObject<z.ZodRawShape>).superRefine((data, ctx) => {
      if (data.is_prohibited === true && data.is_restricted === true) {
        ctx.addIssue({
          code: 'custom',
          path: ['is_restricted'],
          message: V.hsProhibitedRestricted,
        });
      }
    });
  }

  // Ports: LOCODE country prefix, mode enum already field-level, lat/lng pair.
  if (isPortsResource(resourceKey)) {
    objectSchema = (objectSchema as z.ZodObject<z.ZodRawShape>).superRefine((data, ctx) => {
      const locode = typeof data.un_locode === 'string' ? data.un_locode : '';
      const country =
        typeof data.country_code === 'string' ? data.country_code.toUpperCase() : '';
      if (locode.length >= 2 && country && !locode.startsWith(country)) {
        ctx.addIssue({
          code: 'custom',
          path: ['un_locode'],
          message: V.portLocodeCountry,
        });
      }

      const hasLat = typeof data.latitude === 'number' && Number.isFinite(data.latitude);
      const hasLng = typeof data.longitude === 'number' && Number.isFinite(data.longitude);
      if (hasLat !== hasLng) {
        ctx.addIssue({
          code: 'custom',
          path: [hasLat ? 'longitude' : 'latitude'],
          message: V.portLatLngPair,
        });
      }
    });
  }

  return objectSchema;
}

export function validateMasterValues(
  fields: MasterFieldConfig[],
  values: Record<string, unknown>,
  resourceKey?: string,
  opts?: { selectedCurrencyCode?: string; companyCode?: string },
):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; message: string; fieldErrors: Record<string, string> } {
  const parsed = createMasterSchema(fields, resourceKey, opts).safeParse(values);
  if (parsed.success) {
    return { ok: true, data: parsed.data as Record<string, unknown> };
  }
  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? '');
    if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  const first = parsed.error.issues[0];
  return {
    ok: false,
    message: first?.message ?? 'Validation failed.',
    fieldErrors,
  };
}
