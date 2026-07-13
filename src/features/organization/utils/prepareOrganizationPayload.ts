import { isUuid } from '@/lib/isUuid';
import type {
  BankAccountFormValues,
  NumberFormat,
  OrganizationProfile,
  TenantBankAccount,
  CreateNumberFormatDto,
  CreateTenantBankAccountDto,
  NumberFormatFormValues,
  OrganizationProfileFormValues,
  UpdateNumberFormatDto,
  UpdateOrganizationProfileDto,
  UpdateTenantBankAccountDto,
} from '../types/organization.types';

function trimOrOmit(value: string | undefined): string | undefined {
  if (value == null) return undefined;
  const t = value.trim();
  return t || undefined;
}

export function prepareProfilePayload(
  values: OrganizationProfileFormValues,
): UpdateOrganizationProfileDto {
  const payload: UpdateOrganizationProfileDto = {};

  const name = values.name.trim();
  if (name) payload.name = name;

  const display = trimOrOmit(values.display_name);
  if (display) payload.display_name = display;

  const logo = trimOrOmit(values.logo_url);
  if (logo) payload.logo_url = logo;

  const color = trimOrOmit(values.primary_color);
  if (color) payload.primary_color = color;

  const website = trimOrOmit(values.website);
  if (website) payload.website = website;

  const address = trimOrOmit(values.address);
  if (address) payload.address = address;

  const city = trimOrOmit(values.city);
  if (city) payload.city = city;

  const phone = trimOrOmit(values.phone);
  if (phone) payload.phone = phone;

  const email = trimOrOmit(values.email);
  if (email) payload.email = email;

  const language = trimOrOmit(values.language);
  if (language) payload.language = language;

  const currency = trimOrOmit(values.base_currency)?.toUpperCase();
  if (currency) payload.base_currency = currency;

  const timezone = trimOrOmit(values.timezone);
  if (timezone) payload.timezone = timezone;

  if (values.financial_year_start !== '' && values.financial_year_start != null) {
    payload.financial_year_start = Number(values.financial_year_start);
  }

  const vat = trimOrOmit(values.vat_number);
  if (vat) payload.vat_number = vat;

  const cr = trimOrOmit(values.cr_number);
  if (cr) payload.cr_number = cr;

  const iata = trimOrOmit(values.iata_cargo_agent_code);
  if (iata) payload.iata_cargo_agent_code = iata;

  const customs = trimOrOmit(values.customs_code);
  if (customs) payload.customs_code = customs;

  const license = trimOrOmit(values.customs_license_no);
  if (license) payload.customs_license_no = license;

  return payload;
}

export function prepareBankAccountPayload(
  values: BankAccountFormValues,
): CreateTenantBankAccountDto {
  const dto: CreateTenantBankAccountDto = {
    bank_name: values.bank_name.trim(),
    account_name: values.account_name.trim(),
    account_number: values.account_number.trim(),
    is_default: values.is_default,
    is_active: values.is_active,
  };

  const iban = trimOrOmit(values.iban);
  if (iban) dto.iban = iban;

  const swift = trimOrOmit(values.swift_code);
  if (swift) dto.swift_code = swift;

  const currency = trimOrOmit(values.currency_code)?.toUpperCase();
  if (currency) dto.currency_code = currency;

  const branchId = trimOrOmit(values.branch_id);
  if (branchId && isUuid(branchId)) dto.branch_id = branchId;

  return dto;
}

export function prepareBankAccountUpdatePayload(
  values: Partial<BankAccountFormValues>,
): UpdateTenantBankAccountDto {
  const dto: UpdateTenantBankAccountDto = {};

  if (values.bank_name != null) dto.bank_name = values.bank_name.trim();
  if (values.account_name != null) dto.account_name = values.account_name.trim();
  if (values.account_number != null) dto.account_number = values.account_number.trim();
  if (values.iban != null) {
    const iban = trimOrOmit(values.iban);
    if (iban) dto.iban = iban;
  }
  if (values.swift_code != null) {
    const swift = trimOrOmit(values.swift_code);
    if (swift) dto.swift_code = swift;
  }
  if (values.currency_code != null) {
    const currency = trimOrOmit(values.currency_code)?.toUpperCase();
    if (currency) dto.currency_code = currency;
  }
  if (values.branch_id != null) {
    const branchId = trimOrOmit(values.branch_id);
    if (branchId && isUuid(branchId)) dto.branch_id = branchId;
  }
  if (typeof values.is_default === 'boolean') dto.is_default = values.is_default;
  if (typeof values.is_active === 'boolean') dto.is_active = values.is_active;

  return dto;
}

export function prepareNumberFormatCreatePayload(
  values: NumberFormatFormValues,
): CreateNumberFormatDto {
  return {
    document_type: values.document_type,
    prefix: values.prefix.trim(),
    include_branch_code: values.include_branch_code,
    include_year: values.include_year,
    year_digits: Number(values.year_digits),
    include_month: values.include_month,
    sequence_length: Number(values.sequence_length),
    separator: values.separator ?? '/',
    reset_frequency: values.reset_frequency,
    is_active: values.is_active,
  };
}

export function prepareNumberFormatUpdatePayload(
  values: Partial<NumberFormatFormValues>,
): UpdateNumberFormatDto {
  const dto: UpdateNumberFormatDto = {};
  if (values.document_type) dto.document_type = values.document_type;
  if (values.prefix != null) dto.prefix = values.prefix.trim();
  if (typeof values.include_branch_code === 'boolean') {
    dto.include_branch_code = values.include_branch_code;
  }
  if (typeof values.include_year === 'boolean') dto.include_year = values.include_year;
  if (values.year_digits != null) dto.year_digits = Number(values.year_digits);
  if (typeof values.include_month === 'boolean') dto.include_month = values.include_month;
  if (values.sequence_length != null) dto.sequence_length = Number(values.sequence_length);
  if (values.separator != null) dto.separator = values.separator;
  if (values.reset_frequency) dto.reset_frequency = values.reset_frequency;
  if (typeof values.is_active === 'boolean') dto.is_active = values.is_active;
  return dto;
}

export function profileToFormValues(
  profile: OrganizationProfile,
): OrganizationProfileFormValues {
  return {
    name: profile.name,
    display_name: profile.display_name,
    logo_url: profile.logo_url,
    primary_color: profile.primary_color || '#0A66C2',
    website: profile.website,
    address: profile.address,
    city: profile.city,
    phone: profile.phone,
    email: profile.email,
    language: profile.language || 'en',
    base_currency: profile.base_currency || 'AED',
    timezone: profile.timezone || 'Asia/Dubai',
    financial_year_start: profile.financial_year_start ?? '',
    vat_number: profile.vat_number,
    cr_number: profile.cr_number,
    iata_cargo_agent_code: profile.iata_cargo_agent_code,
    customs_code: profile.customs_code,
    customs_license_no: profile.customs_license_no,
  };
}

export function bankAccountToFormValues(
  account: TenantBankAccount,
): BankAccountFormValues {
  return {
    bank_name: account.bank_name,
    account_name: account.account_name,
    account_number: account.account_number,
    iban: account.iban,
    swift_code: account.swift_code,
    currency_code: account.currency_code || 'AED',
    branch_id: account.branch_id ?? '',
    is_default: account.is_default,
    is_active: account.is_active,
  };
}

export function numberFormatToFormValues(
  format: NumberFormat,
): NumberFormatFormValues {
  return {
    document_type: format.document_type as NumberFormatFormValues['document_type'],
    prefix: format.prefix,
    include_branch_code: format.include_branch_code,
    include_year: format.include_year,
    year_digits: format.year_digits || 2,
    include_month: format.include_month,
    sequence_length: format.sequence_length || 5,
    separator: format.separator || '/',
    reset_frequency: (format.reset_frequency ||
      'YEARLY') as NumberFormatFormValues['reset_frequency'],
    is_active: format.is_active,
  };
}
