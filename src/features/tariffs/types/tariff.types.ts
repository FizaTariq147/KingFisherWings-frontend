import type { TariffServiceType } from '../constants/tariff.constants';
import type {
  CreateTariffFormValues,
  UpdateTariffFormValues,
} from '../schemas/tariff.schema';

export type {
  CreateTariffFormValues,
  UpdateTariffFormValues,
} from '../schemas/tariff.schema';

export interface Tariff {
  id: string;
  service_type: TariffServiceType;
  origin_port_id?: string;
  dest_port_id?: string;
  origin_port_code?: string;
  dest_port_code?: string;
  origin_port_name?: string;
  dest_port_name?: string;
  container_type_id?: string;
  container_type_code?: string;
  charge_code_id: string;
  charge_code?: string;
  charge_name?: string;
  customer_id?: string;
  customer_name?: string;
  unit?: string;
  sale_rate: number;
  cost_rate: number;
  currency_code: string;
  valid_from: string;
  valid_to?: string;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  remarks?: string;
}

export type CreateTariffDto = CreateTariffFormValues;
export type UpdateTariffDto = UpdateTariffFormValues;

export interface TariffListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TariffListResult {
  tariffs: Tariff[];
  meta: PaginationMeta;
  /** True when rows were loaded via GET /quotations/tariffs/{id} (collection list is shadowed). */
  backendListUnavailable?: boolean;
}
