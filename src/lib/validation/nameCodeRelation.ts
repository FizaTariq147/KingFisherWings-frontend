import { RULES } from './messages';

/** Uppercase A–Z / 0–9 letters only from a display name (for relation checks). */
export function nameKeyLetters(name: string): string {
  return Array.from(String(name ?? '').toUpperCase())
    .filter((ch) => /[A-Z0-9]/.test(ch))
    .join('');
}

/**
 * Suggest a department/entity code from a name.
 * e.g. "Human Resources" → "HUMAN-RESOURCES", "Finance" → "FINANCE"
 */
export function suggestCodeFromName(name: string, max = RULES.CODE_MAX): string {
  const cleaned = String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  const slug = cleaned
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, max)
    .replace(/-$/g, '');

  return slug;
}

/** Normalize company code/slug for use as a department-code prefix (uppercase). */
export function normalizeCompanySlugPrefix(codeOrSlug: string): string {
  return String(codeOrSlug ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Department code = company slug/code + department name slug.
 * e.g. company "KF" + "Human Resources" → "KF-HUMAN-RESOURCES" (or shorter if needed).
 */
export function suggestDepartmentCode(
  companyCodeOrSlug: string,
  departmentName: string,
  max = 64,
): string {
  const prefix = normalizeCompanySlugPrefix(companyCodeOrSlug);
  if (!prefix) return suggestCodeFromName(departmentName, Math.min(max, RULES.CODE_MAX));

  const room = max - prefix.length - 1;
  if (room < 1) return prefix.slice(0, max);

  // Prefer full name slug when it fits; otherwise use initials.
  const fullSlug = suggestCodeFromName(departmentName, room);
  if (fullSlug.length >= 2 && prefix.length + 1 + fullSlug.length <= max) {
    return `${prefix}-${fullSlug}`;
  }

  const initials = suggestInitialsFromName(departmentName, Math.max(room, 1));
  if (initials.length >= 1 && prefix.length + 1 + initials.length <= max) {
    return `${prefix}-${initials}`;
  }

  if (fullSlug.length >= 1 && room >= 1) {
    return `${prefix}-${fullSlug.slice(0, room)}`.replace(/-$/g, '').slice(0, max);
  }

  return prefix.slice(0, max);
}

/**
 * True when department code starts with company slug and the suffix relates to the name.
 * Also accepts the prefixed suggested form exactly.
 */
export function isDepartmentCodeWithCompanyPrefix(
  code: string,
  companyCodeOrSlug: string,
  departmentName: string,
): boolean {
  const prefix = normalizeCompanySlugPrefix(companyCodeOrSlug);
  const raw = String(code ?? '')
    .trim()
    .toUpperCase();
  if (!prefix || !raw.startsWith(`${prefix}-`)) return false;
  if (raw.length > 64) return false;

  const rest = raw.slice(prefix.length + 1);
  if (!rest || !/^[A-Z0-9-]+$/.test(rest)) return false;

  const suggested = suggestDepartmentCode(prefix, departmentName, 64);
  if (raw === suggested) return true;

  return isCodeRelatedToName(rest, departmentName);
}

/**
 * Short prefix from a branch name (initials preferred).
 * "Dubai Head Office" → "DHO", "Airport" → "AIRP" (leading slug letters).
 */
export function suggestBranchNamePrefix(name: string, max = 8): string {
  const room = Math.max(2, max);
  const initials = suggestInitialsFromName(name, room);
  if (initials.length >= 2) return initials;

  const slug = suggestCodeFromName(name, room).replace(/-/g, '');
  if (slug.length >= 2) return slug.slice(0, Math.min(4, room));

  return initials || slug || 'BR';
}

/**
 * Branch code = company prefix + branch-name prefix.
 * e.g. company "KF" + "Dubai Head Office" → "KF-DHO"
 */
export function suggestBranchCode(
  companyCodeOrSlug: string,
  branchName: string,
  max = 32,
): string {
  const prefix = normalizeCompanySlugPrefix(companyCodeOrSlug);
  if (!prefix) return suggestBranchNamePrefix(branchName, Math.min(max, 8));

  const room = max - prefix.length - 1;
  if (room < 1) return prefix.slice(0, max);

  const namePrefix = suggestBranchNamePrefix(branchName, room);
  return `${prefix}-${namePrefix}`.slice(0, max).replace(/-$/g, '');
}

/**
 * True when branch code is `{company}-{branchNamePrefix}` and the suffix relates to the name.
 */
export function isBranchCodeWithCompanyPrefix(
  code: string,
  companyCodeOrSlug: string,
  branchName: string,
): boolean {
  const prefix = normalizeCompanySlugPrefix(companyCodeOrSlug);
  const raw = String(code ?? '')
    .trim()
    .toUpperCase();
  if (!prefix || !raw.startsWith(`${prefix}-`)) return false;
  if (raw.length > 32) return false;

  const rest = raw.slice(prefix.length + 1);
  if (!rest || !/^[A-Z0-9-]+$/.test(rest)) return false;

  const suggested = suggestBranchCode(prefix, branchName, 32);
  if (raw === suggested) return true;

  const initials = suggestInitialsFromName(branchName);
  if (initials && (rest === initials || rest.replace(/-/g, '') === initials)) return true;

  const namePrefix = suggestBranchNamePrefix(branchName);
  if (namePrefix && rest === namePrefix) return true;

  // Allow a slightly longer abbreviated suffix if still related to the name.
  return isCodeRelatedToName(rest, branchName);
}

/** Warehouse code hint, e.g. "Jebel Ali Warehouse 3" → "WH-JEBEL-ALI-WAREHOUSE-3" (truncated). */
export function suggestWarehouseCode(name: string, max = RULES.CODE_MAX): string {
  const slug = suggestCodeFromName(name, Math.max(4, max - 3));
  if (!slug) return 'WH';
  if (slug.startsWith('WH-') || slug === 'WH') return slug.slice(0, max);
  return `WH-${slug}`.slice(0, max);
}

/** Word initials, e.g. "Human Resources" → "HR". */
export function suggestInitialsFromName(name: string, max = RULES.CODE_MAX): string {
  const words = String(name ?? '')
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean);

  return words
    .map((w) => w[0]!.toUpperCase())
    .join('')
    .slice(0, max);
}

/**
 * Suggest a shipping container type code from a display name.
 * e.g. "40ft High Cube" → "40HC", "20' Reefer" → "20RF"
 */
export function suggestContainerTypeCode(name: string, max = RULES.CODE_MAX): string {
  const raw = String(name ?? '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  const sizeMatch = lower.match(/\b(10|20|40|45|48|53)\b/);
  const size = sizeMatch?.[1];

  if (size) {
    if (/\bhigh[\s-]*cube\b|\bhc\b|\bhq\b/.test(lower)) return `${size}HC`.slice(0, max);
    if (/\breefer\b|\brefrigerat|\brf\b/.test(lower)) return `${size}RF`.slice(0, max);
    if (/\bopen[\s-]*top\b|\bot\b/.test(lower)) return `${size}OT`.slice(0, max);
    if (/\bflat[\s-]*rack\b|\bfr\b/.test(lower)) return `${size}FR`.slice(0, max);
    if (/\btank\b|\btk\b/.test(lower)) return `${size}TK`.slice(0, max);
    if (/\bgeneral(\s+purpose)?\b|\bgp\b|\bdry\b/.test(lower)) return `${size}GP`.slice(0, max);
  }

  return suggestCodeFromName(raw, max);
}

/**
 * True when `code` is related to `name`:
 * - equals suggested slug (HUMAN-RESOURCES)
 * - equals word initials (HR)
 * - equals suggested container code (40HC)
 * - code letters are an ordered abbreviation (subsequence) of name letters
 *
 * If the name has fewer than 2 Latin/digit letters (e.g. pure Arabic),
 * only format is enforced elsewhere — relation returns true so users can
 * assign a Latin code manually.
 */
export function isCodeRelatedToName(code: string, name: string): boolean {
  const rawCode = String(code ?? '')
    .trim()
    .toUpperCase();
  if (!RULES.CODE_PATTERN.test(rawCode)) return false;

  const nameLetters = nameKeyLetters(name);
  const codeLetters = rawCode.replace(/-/g, '');
  if (!codeLetters) return false;

  // Non-Latin names: cannot auto-relate — accept any valid code format.
  if (nameLetters.length < 2) return true;

  const slug = suggestCodeFromName(name);
  if (slug && rawCode === slug) return true;

  const initials = suggestInitialsFromName(name);
  if (initials && (rawCode === initials || codeLetters === initials)) return true;

  const containerCode = suggestContainerTypeCode(name);
  if (containerCode && rawCode === containerCode) return true;

  // Abbreviation: every code letter appears in order inside the name letters.
  let i = 0;
  for (const ch of nameLetters) {
    if (ch === codeLetters[i]) i += 1;
    if (i >= codeLetters.length) return true;
  }
  return false;
}

/** Canonical length units accepted for container size. */
export const CONTAINER_SIZE_UNITS = [
  { value: 'ft', label: 'Feet (ft)', aliases: ['ft', 'feet', 'foot', "'", '′', 'ʻ', 'ʼ'] },
  { value: 'in', label: 'Inches (in)', aliases: ['in', 'inch', 'inches', '"', '″', '”'] },
  { value: 'm', label: 'Meters (m)', aliases: ['m', 'meter', 'meters', 'metre', 'metres'] },
  {
    value: 'cm',
    label: 'Centimeters (cm)',
    aliases: ['cm', 'centimeter', 'centimeters', 'centimetre', 'centimetres'],
  },
  {
    value: 'mm',
    label: 'Millimeters (mm)',
    aliases: ['mm', 'millimeter', 'millimeters', 'millimetre', 'millimetres'],
  },
  { value: 'yd', label: 'Yards (yd)', aliases: ['yd', 'yard', 'yards'] },
] as const;

export type ContainerSizeUnit = (typeof CONTAINER_SIZE_UNITS)[number]['value'];

/** ISO / industry standard lengths commonly stored without a unit (feet implied). */
export const CONTAINER_ISO_LENGTHS = new Set(['10', '20', '40', '45', '48', '53']);

const UNIT_ALIAS_MAP = (() => {
  const map = new Map<string, ContainerSizeUnit>();
  for (const unit of CONTAINER_SIZE_UNITS) {
    map.set(unit.value.toLowerCase(), unit.value);
    for (const alias of unit.aliases) {
      map.set(alias.toLowerCase(), unit.value);
    }
  }
  return map;
})();

export function resolveContainerSizeUnit(raw: string): ContainerSizeUnit | undefined {
  const key = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\./g, '');
  if (!key) return undefined;
  return UNIT_ALIAS_MAP.get(key);
}

/**
 * Parse "40ft", "12.192 m", "20'", "45" into value + canonical unit.
 * Bare ISO lengths (10/20/40/…) default to feet.
 */
export function parseContainerSize(input: string): {
  amount: string;
  unit: ContainerSizeUnit;
  normalized: string;
} | null {
  const raw = String(input ?? '')
    .trim()
    .replace(/,/g, '.');
  if (!raw) return null;

  if (CONTAINER_ISO_LENGTHS.has(raw)) {
    return { amount: raw, unit: 'ft', normalized: `${raw}ft` };
  }

  // Combined forms: 40ft / 20' / 12.192m / 12192mm
  const combined = raw.match(
    /^(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|m|meter|meters|metre|metres|cm|centimeter|centimeters|centimetre|centimetres|mm|millimeter|millimeters|millimetre|millimetres|yd|yard|yards|'|′|"|″|”)$/i,
  );
  if (combined) {
    const amount = combined[1]!;
    const unit = resolveContainerSizeUnit(combined[2]!);
    if (!unit) return null;
    if (!isReasonableContainerAmount(amount, unit)) return null;
    return { amount, unit, normalized: `${amount}${unit}` };
  }

  // Number only (non-ISO): reject — unit is required
  if (/^\d+(?:\.\d+)?$/.test(raw)) return null;

  return null;
}

function isReasonableContainerAmount(amount: string, unit: ContainerSizeUnit): boolean {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return false;
  // Practical shipping bounds (approx).
  switch (unit) {
    case 'ft':
      return n >= 5 && n <= 60;
    case 'in':
      return n >= 60 && n <= 720;
    case 'm':
      return n >= 1.5 && n <= 18;
    case 'cm':
      return n >= 150 && n <= 1800;
    case 'mm':
      return n >= 1500 && n <= 18000;
    case 'yd':
      return n >= 2 && n <= 20;
    default:
      return false;
  }
}

/** Normalize size to `{amount}{unit}` (e.g. 40ft, 12.192m) or null if invalid. */
export function normalizeContainerSize(value: string): string | null {
  return parseContainerSize(value)?.normalized ?? null;
}

export function isValidContainerSize(value: string): boolean {
  return normalizeContainerSize(value) != null;
}

/** @deprecated Prefer parseContainerSize — kept for callers expecting a RegExp. */
export const CONTAINER_SIZE_PATTERN =
  /^(\d+(?:\.\d+)?)\s*(ft|feet|foot|in|inch|inches|m|meter|meters|metre|metres|cm|mm|yd|yard|yards|'|′|"|″)?$/i;
