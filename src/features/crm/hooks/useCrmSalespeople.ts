import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';

export type CrmSalespersonOption = { value: string; label: string };

async function loadSalespeople(): Promise<CrmSalespersonOption[]> {
  const res = await axiosInstance.get<unknown>('/users', {
    params: { page: 1, limit: 200 },
  });
  const raw = res.data;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: unknown }).data)
      ? (raw as { data: unknown[] }).data
      : [];
  return list
    .map((item) => {
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? '');
      if (!isUuid(id)) return null;
      const first = String(row.first_name ?? row.firstName ?? '');
      const last = String(row.last_name ?? row.lastName ?? '');
      const email = String(row.email ?? '');
      const label = [first, last].filter(Boolean).join(' ') || email || id;
      return { value: id, label };
    })
    .filter((o): o is CrmSalespersonOption => Boolean(o));
}

export function useCrmSalespeople(enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['tenant', 'crm', 'salespeople'],
    queryFn: loadSalespeople,
    enabled: Boolean(token && enabled),
    staleTime: 60_000,
  });
}
