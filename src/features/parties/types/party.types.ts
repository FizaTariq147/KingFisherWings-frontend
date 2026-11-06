import type { CreditStatus, PartyType } from '../constants/party.constants';
import type {
  CreatePartyAddressFormValues,
  CreatePartyContactFormValues,
  CreatePartyFormValues,
  UpdateCreditStatusFormValues,
  UpdatePartyFormValues,
} from '../schemas/party.schema';

export type {
  CreatePartyAddressFormValues,
  CreatePartyContactFormValues,
  CreatePartyFormValues,
  UpdateCreditStatusFormValues,
  UpdatePartyFormValues,
} from '../schemas/party.schema';

/** GET /parties/types — system + tenant custom catalog row. */
export interface PartyTypeCatalogItem {
  id?: string;
  code: string;
  label: string;
  is_system?: boolean;
  is_active?: boolean;
}

/** POST /parties/types — CreatePartyTypeDto. */
export interface CreatePartyTypeDto {
  code: string;
  label: string;
}

export interface PartyContact {
  id: string;
  name: string;
  designation?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  is_primary?: boolean;
}

export interface PartyAddress {
  id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code: string;
  is_default?: boolean;
}

export interface Party {
  id: string;
  company_id?: string;
  /** Known system type or tenant custom code. */
  party_type: PartyType | string;
  code: string;
  name: string;
  short_name?: string;
  vat_number?: string;
  cr_number?: string;
  country_code?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  credit_limit?: number;
  credit_days?: number;
  currency_code?: string;
  credit_status?: CreditStatus;
  salesperson_id?: string;
  portal_access?: boolean;
  marketing_subscription?: boolean;
  iata_code?: string;
  scac_code?: string;
  tags?: string[];
  notes?: string;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  contacts?: PartyContact[];
  addresses?: PartyAddress[];
}

export type CreatePartyDto = CreatePartyFormValues;
export type UpdatePartyDto = UpdatePartyFormValues;
export type CreatePartyContactDto = CreatePartyContactFormValues;
export type UpdatePartyContactDto = Partial<CreatePartyContactFormValues>;
export type CreatePartyAddressDto = CreatePartyAddressFormValues;
export type UpdatePartyAddressDto = Partial<CreatePartyAddressFormValues>;
export type UpdateCreditStatusDto = UpdateCreditStatusFormValues;

export interface PartyListParams {
  page?: number;
  limit?: number;
  search?: string;
  party_type?: PartyType | string;
  credit_status?: CreditStatus;
  company_id?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PartyListResult {
  parties: Party[];
  meta: PaginationMeta;
}

export interface PartyImportRowError {
  row: number;
  message: string;
  code?: string;
}

export interface PartyImportResult {
  total: number;
  imported: number;
  failed: number;
  createdIds: string[];
  errors: PartyImportRowError[];
}

/** GET /parties/{id}/history — jobs, quotations, invoices, etc. */
export interface PartyHistoryEntry {
  id?: string;
  type?: string;
  label: string;
  reference?: string;
  date?: string;
  amount?: number;
  status?: string;
}
