import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import type { ApiEnvelope } from '@/lib/apiEnvelope';

export interface TenantCompanyOption {
  id: string;
  name: string;
  code: string;
}

/** Load companies for the authenticated tenant (ERP JWT scope). */
export async function fetchTenantCompanyOptions(): Promise<TenantCompanyOption[]> {
  const res = await axiosInstance.get<
    ApiEnvelope<Array<Record<string, unknown>>> | Array<Record<string, unknown>>
  >('/companies', { params: { page: 1, limit: 100 } });

  const raw = res.data;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as ApiEnvelope<Array<Record<string, unknown>>>).data)
      ? (raw as ApiEnvelope<Array<Record<string, unknown>>>).data
      : [];

  const companies: TenantCompanyOption[] = [];
  for (const item of list) {
    const id = String(item.id ?? '');
    if (!isUuid(id)) continue;
    companies.push({
      id,
      name: String(item.name ?? item.legal_name ?? 'Company'),
      code: String(item.code ?? ''),
    });
  }
  return companies;
}

/**
 * Companies for the authenticated tenant (ERP JWT scope).
 * Uses axiosInstance — not the Super Admin client.
 */
export function useTenantCompanies(enabled = true) {
  return useQuery({
    queryKey: ['tenant', 'companies', 'options'] as const,
    queryFn: fetchTenantCompanyOptions,
    enabled,
    staleTime: 60_000,
  });
}
