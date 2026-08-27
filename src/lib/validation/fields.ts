import { z } from 'zod';
import { getCountry, isValidNationalPhone } from '@/lib/countries';
import { isValidLibPhone } from '@/lib/locale';
import { isUuid } from '@/lib/isUuid';
import { RULES, V } from './messages';
import {
  emptyToNumber,
  emptyToUndefined,
  isLogicalName,
  isValidLogicalDepartmentName,
  normalizeIsoCountryCode,
  normalizeName,
  toLowerCaseEmail,
  toUpperCaseCode,
  trimString,
} from './preprocessors';

type LenOpts = { min?: number; max?: number };

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

function decimalPlacesOk(n: number, max: number): boolean {
  if (!Number.isFinite(n)) return false;
  const parts = String(n).split('.');
  return !parts[1] || parts[1].length <= max;
}

function isBlockedEmailDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (!d || d.startsWith('.') || d.endsWith('.') || d.includes('..')) return true;
  if (d === 'localhost' || d.endsWith('.localhost') || d.endsWith('.local')) return true;
  if (d === 'invalid' || d.endsWith('.invalid') || d.endsWith('.test')) return true;
  const labels = d.split('.');
  const tld = labels[labels.length - 1] ?? '';
  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) return true;
  return false;
}

function normalizeUrl(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Generic trimmed text (addresses, notes, etc.). */
export function requiredText(opts: LenOpts = {}) {
  const min = opts.min ?? 1;
  const max = opts.max ?? 500;
  return z.preprocess(
    trimString,
    z
      .string({ error: V.required })
      .min(min, V.minLength(min))
      .max(max, V.maxLength(max))
      .refine((v) => v.trim().length > 0, V.whitespace),
  );
}

export function optionalText(opts: { max?: number } = {}) {
  const max = opts.max ?? 1000;
  return z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().max(max, V.maxLength(max)).optional().or(z.literal('')),
  );
}

export function optionalTextUndef(opts: { max?: number; min?: number } = {}) {
  const max = opts.max ?? 1000;
  const min = opts.min;
  let inner = z.string().max(max, V.maxLength(max));
  if (min != null) inner = inner.min(min, V.minLength(min));
  return z.preprocess(emptyToUndefined, inner.optional());
}

/**
 * Business “Name” fields — required in every module that collects a name.
 * Normalizes whitespace, requires a logical name (at least one letter),
 * blocks junk-only values, and allows multilingual letters + common punctuation.
 */
export function requiredName(opts: { min?: number; max?: number } = {}) {
  const min = opts.min ?? RULES.NAME_MIN;
  const max = opts.max ?? RULES.NAME_MAX;
  return z.preprocess(
    normalizeName,
    z
      .string({ error: V.required })
      .min(min, V.minLength(min))
      .max(max, V.maxLength(max))
      .refine((v) => v.length > 0, V.whitespace)
      .superRefine((v, ctx) => {
        const result = isLogicalName(v);
        if (result.ok) return;
        ctx.addIssue({
          code: 'custom',
          message:
            result.reason === 'logical'
              ? V.nameLogical
              : result.reason === 'edges'
                ? V.nameEdges
                : V.nameChars,
        });
      }),
  );
}

export function optionalName(opts: { min?: number; max?: number } = {}) {
  const min = opts.min ?? RULES.NAME_MIN;
  const max = opts.max ?? RULES.NAME_MAX;
  return z.preprocess(
    (v) => {
      if (v == null || v === '') return '';
      return normalizeName(v);
    },
    z.union([
      z.literal(''),
      z
        .string()
        .min(min, V.minLength(min))
        .max(max, V.maxLength(max))
        .superRefine((v, ctx) => {
          const result = isLogicalName(v);
          if (result.ok) return;
          ctx.addIssue({
            code: 'custom',
            message:
              result.reason === 'logical'
                ? V.nameLogical
                : result.reason === 'edges'
                  ? V.nameEdges
                  : V.nameChars,
          });
        }),
    ]),
  );
}

/**
 * Department display name — must be a valid, logical label (not a code / junk).
 */
export function requiredDepartmentName(opts: { min?: number; max?: number } = {}) {
  return requiredLogicalLabelName(opts, {
    invalid: V.departmentName,
    letters: V.departmentNameLetters,
    junk: V.departmentNameJunk,
  });
}

/**
 * Designation / job-title name — same logical rules as department names.
 */
export function requiredDesignationName(opts: { min?: number; max?: number } = {}) {
  return requiredLogicalLabelName(opts, {
    invalid: V.designationName,
    letters: V.designationNameLetters,
    junk: V.designationNameJunk,
  });
}

/** Branch office display name — valid & logical label. */
export function requiredBranchName(opts: { min?: number; max?: number } = {}) {
  return requiredLogicalLabelName(opts, {
    invalid: V.branchName,
    letters: V.branchNameLetters,
    junk: V.branchNameJunk,
  });
}

function requiredLogicalLabelName(
  opts: { min?: number; max?: number },
  messages: { invalid: string; letters: string; junk: string },
) {
  const min = opts.min ?? RULES.NAME_MIN;
  const max = opts.max ?? RULES.NAME_MAX;
  return z.preprocess(
    normalizeName,
    z
      .string({ error: V.required })
      .min(min, V.minLength(min))
      .max(max, V.maxLength(max))
      .refine((v) => v.length > 0, V.whitespace)
      .superRefine((v, ctx) => {
        const result = isValidLogicalDepartmentName(v);
        if (result.ok) return;
        ctx.addIssue({
          code: 'custom',
          message:
            result.reason === 'letters'
              ? messages.letters
              : result.reason === 'junk'
                ? messages.junk
                : messages.invalid,
        });
      }),
  );
}

export function requiredEmail() {
  return z.preprocess(
    toLowerCaseEmail,
    z
      .string({ error: V.required })
      .min(1, V.required)
      .max(RULES.EMAIL_MAX, V.emailMax)
      .regex(RULES.EMAIL, V.email)
      .refine((email) => {
        const domain = email.split('@')[1] ?? '';
        return !isBlockedEmailDomain(domain);
      }, V.emailDomain),
  );
}

export function optionalEmail() {
  return z.preprocess(
    (v) => {
      const cleaned = emptyToUndefined(
        typeof v === 'string' ? v.trim().toLowerCase() : v,
      );
      return cleaned;
    },
    z
      .string()
      .max(RULES.EMAIL_MAX, V.emailMax)
      .regex(RULES.EMAIL, V.email)
      .refine((email) => {
        const domain = email.split('@')[1] ?? '';
        return !isBlockedEmailDomain(domain);
      }, V.emailDomain)
      .optional(),
  );
}

function phoneCountryMessage(_v: string, preferredIso?: string): string {
  const countryIso = String(preferredIso ?? '').trim().toUpperCase();
  if (!countryIso) return V.phone;
  const country = getCountry(countryIso);
  if (!country) return V.phone;
  if (country.example) {
    return V.phoneForCountryExample(country.name, country.dial, country.example);
  }
  return V.phoneForCountry(country.name, country.phoneMin, country.phoneMax, country.dial);
}

/** Normalize to E.164 (+digits only). */
function normalizeE164(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;
  return `+${digits}`;
}

function isAcceptablePhone(v: string, preferredIso?: string): boolean {
  if (!RULES.E164.test(v)) return false;
  const digits = countDigits(v);
  if (digits < RULES.PHONE_DIGIT_MIN || digits > RULES.PHONE_DIGIT_MAX) return false;

  const country = String(preferredIso ?? '')
    .trim()
    .toUpperCase();
  // No country set → any valid international E.164 number.
  if (!country) {
    return isValidLibPhone(v);
  }

  if (isValidLibPhone(v, country)) return true;
  return isValidNationalPhone(country, v);
}

/** International phone E.164 (+dial + national). Length follows selected country. */
export function requiredPhone(opts?: { countryIso?: string }) {
  return z.preprocess(
    normalizeE164,
    z
      .string({ error: V.required })
      .regex(RULES.E164, V.phone)
      .superRefine((v, ctx) => {
        if (isAcceptablePhone(v, opts?.countryIso)) return;
        ctx.addIssue({
          code: 'custom',
          message: phoneCountryMessage(v, opts?.countryIso),
        });
      }),
  );
}

export function optionalPhone(opts?: { countryIso?: string }) {
  return z.preprocess(
    (v) => {
      if (v == null || v === '') return undefined;
      return normalizeE164(v);
    },
    z
      .string()
      .regex(RULES.E164, V.phone)
      .superRefine((v, ctx) => {
        if (isAcceptablePhone(v, opts?.countryIso)) return;
        ctx.addIssue({
          code: 'custom',
          message: phoneCountryMessage(v, opts?.countryIso),
        });
      })
      .optional(),
  );
}

/**
 * Attach object-level phone rules that use a sibling `country_code` field
 * when the user has selected an address/billing country.
 */
export function withPhoneCountryRefine<
  T extends z.ZodObject<z.ZodRawShape>,
>(
  schema: T,
  opts: {
    phoneKey?: string;
    countryKey?: string;
    required?: boolean;
  } = {},
) {
  const phoneKey = opts.phoneKey ?? 'phone';
  const countryKey = opts.countryKey ?? 'country_code';
  const required = opts.required === true;

  return schema.superRefine((data, ctx) => {
    const record = data as Record<string, unknown>;
    const phone = String(record[phoneKey] ?? '').trim();
    const country = String(record[countryKey] ?? '').trim().toUpperCase();

    if (!phone) {
      if (required) {
        ctx.addIssue({ code: 'custom', message: V.required, path: [phoneKey] });
      }
      return;
    }

    if (!isAcceptablePhone(phone, country || undefined)) {
      ctx.addIssue({
        code: 'custom',
        message: country
          ? phoneCountryMessage(phone, country)
          : V.phone,
        path: [phoneKey],
      });
    }
  });
}

export function requiredUrl() {
  return z.preprocess(
    normalizeUrl,
    z.string({ error: V.required }).url(V.url),
  );
}

export function optionalUrl() {
  return z.preprocess(
    (v) => {
      const cleaned = emptyToUndefined(typeof v === 'string' ? v.trim() : v);
      if (cleaned == null) return undefined;
      return normalizeUrl(cleaned);
    },
    z.string().url(V.url).optional(),
  );
}

/** Form-friendly optional URL that allows '' in the form value. */
export function optionalUrlOrEmpty() {
  return z.preprocess(
    (v) => {
      if (v == null || v === '') return '';
      return normalizeUrl(typeof v === 'string' ? v.trim() : v);
    },
    z.union([z.literal(''), z.string().url(V.url)]),
  );
}

export function requiredUuid(message: string = V.uuid) {
  return z.preprocess(
    emptyToUndefined,
    z.string({ error: V.required }).refine((v) => isUuid(v), message),
  );
}

export function optionalUuid() {
  return z.preprocess(
    emptyToUndefined,
    z.string().refine((v) => isUuid(v), V.uuid).optional(),
  );
}

export function countryCode(required = true) {
  const base = z.preprocess(
    (v) => normalizeIsoCountryCode(v),
    z.string().regex(RULES.COUNTRY, V.countryCode),
  );
  if (required) return base;
  return z.preprocess(
    (v) => {
      if (v === '' || v == null) return undefined;
      return normalizeIsoCountryCode(v);
    },
    z.string().regex(RULES.COUNTRY, V.countryCode).optional(),
  );
}

export function currencyCode(required = false) {
  const code = z
    .string()
    .length(3, V.currencyCode)
    .regex(RULES.CURRENCY, V.currencyCode);
  if (required) {
    return z.preprocess(toUpperCaseCode, code);
  }
  return z.preprocess(
    (v) => {
      const cleaned = emptyToUndefined(
        typeof v === 'string' ? v.trim().toUpperCase() : v,
      );
      return cleaned;
    },
    code.optional(),
  );
}

/** Dial code E.164 country calling code, e.g. +971 */
export function dialCode(required = false) {
  const inner = z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v;
      const trimmed = v.trim();
      if (!trimmed) return trimmed;
      const digits = trimmed.replace(/\D/g, '');
      return digits ? `+${digits}` : trimmed;
    },
    z.string().regex(RULES.DIAL_CODE, V.dialCode),
  );
  if (required) return inner;
  return z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    inner.optional(),
  );
}

/** IATA airline (2) / airport (3) code. */
export function iataCode(required = false) {
  const inner = z.preprocess(
    toUpperCaseCode,
    z.string().regex(RULES.IATA, V.iataCode),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** ICAO airline (3) / airport (4) code. */
export function icaoCode(required = false) {
  const inner = z.preprocess(
    toUpperCaseCode,
    z.string().regex(RULES.ICAO, V.icaoCode),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** UN/LOCODE e.g. AEJEA (5–10 chars: ISO country + location). */
export function unLocode(required = false) {
  const inner = z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v;
      return v.trim().toUpperCase().replace(/[\s-]+/g, '');
    },
    z
      .string({ error: V.unLocode })
      .min(RULES.UN_LOCODE_MIN, V.unLocode)
      .max(RULES.UN_LOCODE_MAX, V.unLocode)
      .regex(RULES.UN_LOCODE, V.unLocode),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** IMO ship number — exactly 7 digits. */
export function imoNumber(required = false) {
  const inner = z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(/\D/g, '') : v),
    z.string().regex(RULES.IMO, V.imoNumber),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** SWIFT/BIC — 8 or 11 characters. */
export function swiftBic(required = false) {
  const inner = z.preprocess(
    toUpperCaseCode,
    z.string().regex(RULES.SWIFT_BIC, V.swiftBic),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** AWB prefix — exactly 3 digits. */
export function awbPrefix(required = false) {
  const inner = z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(/\D/g, '') : v),
    z.string().regex(RULES.AWB_PREFIX, V.awbPrefix),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** HS code — pattern for HS master (4–10 digits, optional dots; length 4–12). */
export function hsCode(required = false) {
  const inner = z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v;
      return v.trim().replace(/\s+/g, '');
    },
    z
      .string({ error: V.hsCode })
      .min(RULES.HS_CODE_MIN_LEN, V.hsCode)
      .max(RULES.HS_CODE_MAX_LEN, V.hsCode)
      .regex(RULES.HS_CODE, V.hsCode),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** Dangerous goods class (1–9, optional subclass). */
export function dgClass(required = false) {
  const inner = z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v;
      return v.trim().replace(/\s+/g, ' ');
    },
    z.string().regex(RULES.DG_CLASS, V.dgClass),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** Import/export duty rate percent (0–100). */
export function dutyRatePercent(required = false) {
  const inner = z
    .number({ error: V.hsDutyRate })
    .min(RULES.DUTY_MIN, V.hsDutyRate)
    .max(RULES.DUTY_MAX, V.hsDutyRate)
    .refine((n) => {
      if (!Number.isFinite(n)) return false;
      const parts = String(n).split('.');
      return !parts[1] || parts[1].length <= 4;
    }, V.decimals(4));
  const pre = z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    required ? inner : inner.optional(),
  );
  return pre;
}

/** Dangerous goods UN number — 4 digits, optional UN prefix. */
export function unNumber(required = false) {
  const inner = z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v;
      const t = v.trim().toUpperCase().replace(/\s+/g, '');
      return t;
    },
    z.string().regex(RULES.UN_NUMBER, V.unNumber),
  );
  if (required) return inner;
  return z.preprocess(emptyToUndefined, inner.optional());
}

/** Codes: uppercase A-Z0-9-, length 2–20. */
export function entityCode(
  opts: { min?: number; max?: number; pattern?: RegExp; message?: string } = {},
) {
  const min = opts.min ?? RULES.CODE_MIN;
  const max = opts.max ?? RULES.CODE_MAX;
  const pattern = opts.pattern ?? RULES.CODE_PATTERN;
  return z.preprocess(
    toUpperCaseCode,
    z
      .string({ error: V.required })
      .min(min, V.minLength(min))
      .max(max, V.maxLength(max))
      .regex(pattern, opts.message ?? V.codeFormat),
  );
}

/** Prefixes: uppercase A-Z0-9_-, max 10. */
export function prefixCode(opts: { required?: boolean; max?: number } = {}) {
  const max = opts.max ?? RULES.PREFIX_MAX;
  const required = opts.required !== false;
  const inner = z
    .string({ error: V.required })
    .min(1, V.required)
    .max(max, V.maxLength(max))
    .regex(RULES.PREFIX_PATTERN, V.prefixFormat);
  if (required) {
    return z.preprocess(toUpperCaseCode, inner);
  }
  return z.preprocess(
    (v) => {
      const cleaned = emptyToUndefined(
        typeof v === 'string' ? v.trim().toUpperCase() : v,
      );
      return cleaned;
    },
    inner.optional(),
  );
}

export function slugLower() {
  return z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z
      .string({ error: V.required })
      .min(1, V.required)
      .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  );
}

export function hexColor() {
  return z.preprocess(
    trimString,
    z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, V.hexColor),
  );
}

export function requiredSelect(message = V.requiredSelect) {
  return z.preprocess(
    emptyToUndefined,
    z.string({ error: message }).min(1, message),
  );
}

/**
 * Validate a master-data selection (e.g. UOM).
 * Pass allowed active values from the loaded options list.
 */
export function masterSelect(opts: {
  required?: boolean;
  allowedValues: readonly string[];
  message?: string;
}) {
  const { required = true, allowedValues, message = V.uom } = opts;
  const set = new Set(allowedValues.map(String));
  const inner = z
    .string({ error: V.requiredSelect })
    .min(1, V.requiredSelect)
    .refine((v) => set.has(v), message);
  if (required) {
    return z.preprocess(emptyToUndefined, inner);
  }
  return z.preprocess(emptyToUndefined, inner.optional());
}

export function latitude(opts: { required?: boolean } = {}) {
  const required = opts.required === true;
  const num = z
    .number({ error: V.latitude })
    .min(RULES.LAT_MIN, V.latitude)
    .max(RULES.LAT_MAX, V.latitude)
    .refine((n) => decimalPlacesOk(n, RULES.GEO_DECIMALS), V.decimals(RULES.GEO_DECIMALS));
  return z.preprocess(emptyToNumber, required ? num : num.optional());
}

export function longitude(opts: { required?: boolean } = {}) {
  const required = opts.required === true;
  const num = z
    .number({ error: V.longitude })
    .min(RULES.LNG_MIN, V.longitude)
    .max(RULES.LNG_MAX, V.longitude)
    .refine((n) => decimalPlacesOk(n, RULES.GEO_DECIMALS), V.decimals(RULES.GEO_DECIMALS));
  return z.preprocess(emptyToNumber, required ? num : num.optional());
}

export function integerField(opts: {
  required?: boolean;
  min?: number;
  max?: number;
  allowNegative?: boolean;
} = {}) {
  const { required = false, min, max, allowNegative = true } = opts;
  let num = z.number({ error: V.integer }).int(V.integer);
  if (!allowNegative) num = num.min(0, V.nonNegative);
  if (min != null) num = num.min(min, V.minValue(min));
  if (max != null) num = num.max(max, V.maxValue(max));
  return z.preprocess(emptyToNumber, required ? num : num.optional());
}

export function amountField(opts: {
  required?: boolean;
  min?: number;
  max?: number;
  maxDecimals?: number;
  allowNegative?: boolean;
} = {}) {
  const {
    required = false,
    min = 0,
    max,
    maxDecimals = 2,
    allowNegative = false,
  } = opts;

  let num = z.number({ error: 'Enter a valid amount' });
  if (!allowNegative) num = num.min(min, V.nonNegative);
  else if (min != null) num = num.min(min, V.minValue(min));
  if (max != null) num = num.max(max, V.maxValue(max));

  num = num.refine(
    (n) => decimalPlacesOk(n, maxDecimals),
    V.decimals(maxDecimals),
  );

  return z.preprocess(emptyToNumber, required ? num : num.optional());
}

export type PasswordPolicy = {
  minLength?: number;
  requireUpper?: boolean;
  requireLower?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
};

export function passwordField(policy: PasswordPolicy = {}) {
  const {
    minLength = 8,
    requireUpper = true,
    requireLower = true,
    requireNumber = true,
    requireSpecial = false,
  } = policy;

  let schema = z
    .string({ error: V.required })
    .min(minLength, V.passwordMin(minLength));

  if (requireUpper) schema = schema.regex(/[A-Z]/, V.passwordUpper);
  if (requireLower) schema = schema.regex(/[a-z]/, V.passwordLower);
  if (requireNumber) schema = schema.regex(/[0-9]/, V.passwordNumber);
  if (requireSpecial) schema = schema.regex(/[^A-Za-z0-9]/, V.passwordSpecial);

  return schema;
}

export function softPasswordField(minLength = 8) {
  return z
    .string({ error: V.required })
    .min(minLength, V.passwordMin(minLength))
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, V.passwordNumber);
}

export function passwordsMatch<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  passwordKey: keyof T & string = 'password' as keyof T & string,
  confirmKey: keyof T & string = 'confirm_password' as keyof T & string,
) {
  return schema.refine(
    (data) =>
      (data as Record<string, unknown>)[passwordKey] ===
      (data as Record<string, unknown>)[confirmKey],
    {
      message: V.passwordMatch,
      path: [confirmKey],
    },
  );
}

export function dateString(opts: { required?: boolean; notPast?: boolean } = {}) {
  const { required = false, notPast = false } = opts;
  let base = z.string().refine((v) => !Number.isNaN(Date.parse(v)), V.dateInvalid);
  if (notPast) {
    base = base.refine((v) => {
      const d = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, 'Date cannot be in the past');
  }
  if (required) {
    return z.preprocess(emptyToUndefined, base);
  }
  return z.preprocess(emptyToUndefined, base.optional());
}

export function fileMetaSchema(opts: {
  accept?: string[];
  maxSizeMb?: number;
}) {
  const accept = opts.accept ?? [];
  const maxSizeMb = opts.maxSizeMb ?? 10;
  return z
    .custom<File>((v) => typeof File !== 'undefined' && v instanceof File, {
      message: V.required,
    })
    .refine(
      (f) =>
        accept.length === 0 ||
        accept.some(
          (t) =>
            f.type === t ||
            f.name.toLowerCase().endsWith(t.replace('*/', '.')),
        ),
      V.fileType,
    )
    .refine((f) => f.size <= maxSizeMb * 1024 * 1024, V.fileSize(maxSizeMb));
}

export function requiredArray(min = 1) {
  return z.array(z.string()).min(min, V.arrayMin(min));
}

/** Detect common “name” field keys for config-driven masters. */
export function isNameField(fieldName: string): boolean {
  return (
    fieldName === 'name' ||
    fieldName === 'display_name' ||
    fieldName === 'short_name' ||
    fieldName === 'legal_name' ||
    fieldName === 'account_name' ||
    fieldName === 'bank_name' ||
    fieldName === 'first_name' ||
    fieldName === 'last_name' ||
    fieldName === 'admin_first_name' ||
    fieldName === 'admin_last_name' ||
    fieldName === 'contact_person' ||
    fieldName === 'vessel_name' ||
    fieldName === 'company_name' ||
    fieldName === 'party_name' ||
    fieldName.endsWith('_name')
  );
}

const SPECIAL_CODE_FIELDS = new Set([
  'dial_code',
  'hs_code',
  'scac_code',
  'iata_code',
  'icao_code',
  'iso_code',
  'iso3_code',
  'un_locode',
  'swift_code',
  'gl_revenue_code',
  'gl_cost_code',
  'imo_number',
  'un_number',
]);

/** Standard entity codes (A-Z0-9-, 2–20). Specialized aviation/customs codes are excluded. */
export function isCodeField(fieldName: string): boolean {
  if (SPECIAL_CODE_FIELDS.has(fieldName) || isPrefixField(fieldName)) return false;
  return fieldName === 'code' || fieldName === 'company_code' || fieldName.endsWith('_code');
}

export function isPrefixField(fieldName: string): boolean {
  return (
    fieldName === 'prefix' ||
    fieldName === 'prefix_code' ||
    fieldName === 'iban_prefix' ||
    fieldName.endsWith('_prefix')
  );
}
