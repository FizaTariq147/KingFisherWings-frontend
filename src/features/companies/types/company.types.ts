export type { CreateCompanyFormValues, UpdateCompanyFormValues } from '../schemas/company.schema';
import type { CreateCompanyFormValues, UpdateCompanyFormValues } from '../schemas/company.schema';

export type CreateCompanyDto = CreateCompanyFormValues;
export type UpdateCompanyDto = Partial<UpdateCompanyFormValues>;

export interface Company extends CreateCompanyFormValues {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CompanyListParams {
  tenantId?: string;
  search?: string;
  status?: 'active' | 'inactive' | 'deleted';
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
