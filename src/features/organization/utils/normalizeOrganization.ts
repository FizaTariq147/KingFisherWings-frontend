import type {
  NumberFormat,
  NumberFormatPreview,
  OrganizationProfile,
  TenantBankAccount,
} from '../types/organization.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown, fallback = ''): string {
  if (value == null) return fallback;
  return String(value).trim();
}

function bool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 1 || value === '1') return true;
  if (value === 'false' || value === 0 || value === '0') return false;
  return fallback;
}

function num(value: unknown, fallback: number | null = null): number | null {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function unwrapEntity(raw: unknown): unknown {
  const envelope = asRecord(raw);
  if (envelope && 'data' in envelope) return envelope.data;
  return raw;
}

export function unwrapList(raw: unknown): { items: unknown[]; meta?: unknown } {
  if (Array.isArray(raw)) return { items: raw };
  const envelope = asRecord(raw);
  if (!envelope) return { items: [] };
  const data = envelope.data;
  if (Array.isArray(data)) return { items: data, meta: envelope.meta };
  const nested = asRecord(data);
  if (nested) {
    const list =
      (Array.isArray(nested.items) && nested.items) ||
      (Array.isArray(nested.results) && nested.results) ||
      (Array.isArray(nested.accounts) && nested.accounts) ||
      (Array.isArray(nested.bank_accounts) && nested.bank_accounts) ||
      (Array.isArray(nested.formats) && nested.formats) ||
      (Array.isArray(nested.number_formats) && nested.number_formats) ||
      [];
    return { items: list, meta: nested.meta ?? envelope.meta };
  }
  return { items: [] };
}

export function normalizePaginationMeta(
  raw: unknown,
  fallbackTotal: number,
  page = 1,
  limit = 20,
): { page: number; limit: number; total: number; totalPages: number } {
  const record = asRecord(raw);
  const p = Number(record?.page ?? page) || page;
  const l = Number(record?.limit ?? limit) || limit;
  const total = Number(record?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages =
    Number(record?.totalPages ?? record?.total_pages) ||
    Math.max(1, Math.ceil(total / l));
  return { page: p, limit: l, total, totalPages };
}

export function normalizeOrganizationProfile(raw: unknown): OrganizationProfile {
  const data = asRecord(unwrapEntity(raw)) ?? {};
  return {
    id: str(data.id),
    name: str(data.name),
    display_name: str(data.display_name ?? data.displayName),
    logo_url: str(data.logo_url ?? data.logoUrl),
    primary_color: str(data.primary_color ?? data.primaryColor),
    website: str(data.website),
    address: str(data.address),
    city: str(data.city),
    country_code: str(data.country_code ?? data.countryCode).toUpperCase(),
    phone: str(data.phone),
    email: str(data.email),
    language: str(data.language, 'en'),
    base_currency: str(data.base_currency ?? data.baseCurrency, 'AED').toUpperCase(),
    timezone: str(data.timezone, 'Asia/Dubai'),
    financial_year_start: num(data.financial_year_start ?? data.financialYearStart),
    vat_number: str(data.vat_number ?? data.vatNumber),
    cr_number: str(data.cr_number ?? data.crNumber),
    iata_cargo_agent_code: str(data.iata_cargo_agent_code ?? data.iataCargoAgentCode),
    customs_code: str(data.customs_code ?? data.customsCode),
    customs_license_no: str(data.customs_license_no ?? data.customsLicenseNo),
    created_at: str(data.created_at ?? data.createdAt) || undefined,
    updated_at: str(data.updated_at ?? data.updatedAt) || undefined,
  };
}

export function normalizeBankAccount(raw: unknown): TenantBankAccount {
  const data = asRecord(unwrapEntity(raw)) ?? {};
  const branchRaw = data.branch_id ?? data.branchId;
  return {
    id: str(data.id),
    bank_name: str(data.bank_name ?? data.bankName),
    account_name: str(data.account_name ?? data.accountName),
    account_number: str(data.account_number ?? data.accountNumber),
    iban: str(data.iban),
    swift_code: str(data.swift_code ?? data.swiftCode),
    currency_code: str(data.currency_code ?? data.currencyCode, 'AED').toUpperCase(),
    branch_id: branchRaw ? str(branchRaw) : null,
    is_default: bool(data.is_default ?? data.isDefault, false),
    is_active: bool(data.is_active ?? data.isActive, true),
    created_at: str(data.created_at ?? data.createdAt) || undefined,
    updated_at: str(data.updated_at ?? data.updatedAt) || undefined,
  };
}

export function normalizeBankAccounts(raw: unknown[]): TenantBankAccount[] {
  const accounts: TenantBankAccount[] = [];
  for (const item of raw) {
    const a = normalizeBankAccount(item);
    if (a.id) accounts.push(a);
  }
  return accounts;
}

export function normalizeNumberFormat(raw: unknown): NumberFormat {
  const data = asRecord(unwrapEntity(raw)) ?? {};
  return {
    id: str(data.id),
    document_type: str(data.document_type ?? data.documentType),
    prefix: str(data.prefix),
    include_branch_code: bool(data.include_branch_code ?? data.includeBranchCode, false),
    include_year: bool(data.include_year ?? data.includeYear, true),
    year_digits: num(data.year_digits ?? data.yearDigits, 2) ?? 2,
    include_month: bool(data.include_month ?? data.includeMonth, false),
    sequence_length: num(data.sequence_length ?? data.sequenceLength, 5) ?? 5,
    separator: str(data.separator, '/'),
    reset_frequency: str(data.reset_frequency ?? data.resetFrequency, 'YEARLY'),
    is_active: bool(data.is_active ?? data.isActive, true),
    current_sequence: num(data.current_sequence ?? data.currentSequence ?? data.current_number),
    created_at: str(data.created_at ?? data.createdAt) || undefined,
    updated_at: str(data.updated_at ?? data.updatedAt) || undefined,
  };
}

export function normalizeNumberFormats(raw: unknown[]): NumberFormat[] {
  const formats: NumberFormat[] = [];
  for (const item of raw) {
    const f = normalizeNumberFormat(item);
    if (f.document_type) formats.push(f);
  }
  return formats;
}

export function normalizeNumberFormatPreview(raw: unknown): NumberFormatPreview {
  const entity = unwrapEntity(raw);

  // Some APIs return a bare string/number under `data`
  if (typeof entity === 'string' && entity.trim()) {
    return { preview: entity.trim() };
  }
  if (typeof entity === 'number' && Number.isFinite(entity)) {
    return { preview: String(entity) };
  }

  const data = asRecord(entity) ?? asRecord(raw) ?? {};
  const preview =
    str(data.preview) ||
    str(data.next_number) ||
    str(data.nextNumber) ||
    str(data.formatted) ||
    str(data.formatted_number) ||
    str(data.formattedNumber) ||
    str(data.document_number) ||
    str(data.documentNumber) ||
    str(data.number) ||
    str(data.sample) ||
    str(data.example) ||
    str(data.value) ||
    str(data.result) ||
    (typeof raw === 'string' ? raw.trim() : '');

  return {
    preview,
    document_type: str(data.document_type ?? data.documentType) || undefined,
    next_sequence: num(
      data.next_sequence ??
        data.nextSequence ??
        data.current_sequence ??
        data.currentSequence ??
        data.sequence,
    ),
  };
}

/** Build a local preview when the API returns an empty preview payload. */
export function synthesizeNumberFormatPreview(format: {
  prefix?: string;
  separator?: string;
  include_year?: boolean;
  year_digits?: number;
  include_month?: boolean;
  sequence_length?: number;
  current_sequence?: number | null;
  include_branch_code?: boolean;
}): string {
  const sep = format.separator ?? '/';
  const parts: string[] = [];
  if (format.prefix) parts.push(format.prefix);
  if (format.include_branch_code) parts.push('BR');
  if (format.include_year !== false) {
    const digits = format.year_digits === 4 ? 4 : 2;
    const year = new Date().getFullYear();
    parts.push(digits === 4 ? String(year) : String(year).slice(-2));
  }
  if (format.include_month) {
    parts.push(String(new Date().getMonth() + 1).padStart(2, '0'));
  }
  const seqLen = Math.min(Math.max(format.sequence_length ?? 5, 3), 10);
  const next = Math.max(1, Number(format.current_sequence ?? 0) + 1);
  parts.push(String(next).padStart(seqLen, '0'));
  return parts.join(sep);
}
