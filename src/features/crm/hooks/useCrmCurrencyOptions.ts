import { useQuery } from '@tanstack/react-query';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { useAuthStore } from '@/store/authStore';

export function useCrmCurrencyOptions(enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['tenant', 'crm', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    enabled: Boolean(token && enabled),
    staleTime: 60_000,
  });
}
