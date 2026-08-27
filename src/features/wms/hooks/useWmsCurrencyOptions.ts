import { useQuery } from '@tanstack/react-query';
import { loadWmsCurrencyOptions } from '../utils/wmsCurrencyOptions';

export function useWmsCurrencyOptions() {
  return useQuery({
    queryKey: ['tenant', 'wms', 'currency-options'],
    queryFn: loadWmsCurrencyOptions,
    staleTime: 60_000,
  });
}
