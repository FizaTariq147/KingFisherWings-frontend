import type {
  CreateZipDistanceFormValues,
  UpdateZipDistanceFormValues,
} from '../schemas/zipDistance.schema';

export type {
  CreateZipDistanceFormValues,
  UpdateZipDistanceFormValues,
} from '../schemas/zipDistance.schema';

export interface ZipDistance {
  id: string;
  from_zip: string;
  from_city?: string;
  to_zip: string;
  to_city?: string;
  distance: number;
  unit: string;
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateZipDistanceDto = CreateZipDistanceFormValues;
export type UpdateZipDistanceDto = UpdateZipDistanceFormValues;

export interface ZipDistanceListParams {
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

export interface ZipDistanceListResult {
  items: ZipDistance[];
  meta: PaginationMeta;
  /** True when rows were loaded via GET /quotations/zip-distances/{id} (collection list is shadowed). */
  backendListUnavailable?: boolean;
}
