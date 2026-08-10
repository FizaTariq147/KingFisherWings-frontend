import type { DocumentType, ResetFrequency } from '../constants/organization.constants';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Organization profile — response shape inferred from UpdateOrganizationProfileDto + common id fields. */
export interface OrganizationProfile {
  id: string;
  name: string;
  display_name: string;
  logo_url: string;
  primary_color: string;
  website: string;
  address: string;
  city: string;
  country_code: string;
  phone: string;
  email: string;
  language: string;
  base_currency: string;
  timezone: string;
  financial_year_start: number | null;
  vat_number: string;
  cr_number: string;
  iata_cargo_agent_code: string;
  customs_code: string;
  customs_license_no: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateOrganizationProfileDto {
  name?: string;
  display_name?: string;
  logo_url?: string;
  primary_color?: string;
  website?: string;
  address?: string;
  city?: string;
  country_code?: string;
  phone?: string;
  email?: string;
  language?: string;
  base_currency?: string;
  timezone?: string;
  financial_year_start?: number;
  vat_number?: string;
  cr_number?: string;
  iata_cargo_agent_code?: string;
  customs_code?: string;
  customs_license_no?: string;
}

export type OrganizationProfileFormValues = {
  name: string;
  display_name: string;
  logo_url: string;
  primary_color: string;
  website: string;
  address: string;
  city: string;
  country_code: string;
  phone: string;
  email: string;
  language: string;
  base_currency: string;
  timezone: string;
  financial_year_start: number | '';
  vat_number: string;
  cr_number: string;
  iata_cargo_agent_code: string;
  customs_code: string;
  customs_license_no: string;
};

export interface TenantBankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
  currency_code: string;
  branch_id: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTenantBankAccountDto {
  bank_name: string;
  account_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency_code?: string;
  branch_id?: string;
  is_default?: boolean;
  is_active?: boolean;
}

export type UpdateTenantBankAccountDto = Partial<CreateTenantBankAccountDto>;

export type BankAccountFormValues = {
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
  currency_code: string;
  branch_id: string;
  is_default: boolean;
  is_active: boolean;
};

export interface BankAccountListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  order?: 'asc' | 'desc';
}

export interface BankAccountListResult {
  accounts: TenantBankAccount[];
  meta: PaginationMeta;
}

export interface NumberFormat {
  id: string;
  document_type: DocumentType | string;
  prefix: string;
  include_branch_code: boolean;
  include_year: boolean;
  year_digits: number;
  include_month: boolean;
  sequence_length: number;
  separator: string;
  reset_frequency: ResetFrequency | string;
  is_active: boolean;
  current_sequence?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNumberFormatDto {
  document_type: DocumentType;
  prefix: string;
  include_branch_code?: boolean;
  include_year?: boolean;
  year_digits?: number;
  include_month?: boolean;
  sequence_length?: number;
  separator?: string;
  reset_frequency?: ResetFrequency;
  is_active?: boolean;
}

export type UpdateNumberFormatDto = Partial<CreateNumberFormatDto>;

export type NumberFormatFormValues = {
  document_type: DocumentType;
  prefix: string;
  include_branch_code: boolean;
  include_year: boolean;
  year_digits: number;
  include_month: boolean;
  sequence_length: number;
  separator: string;
  reset_frequency: ResetFrequency;
  is_active: boolean;
};

export interface NumberFormatPreview {
  preview: string;
  document_type?: string;
  next_sequence?: number | null;
}
