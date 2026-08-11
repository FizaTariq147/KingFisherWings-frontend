import { queryClient } from '@/lib/queryClient';

export function clearVendorQueryCache() {
  void queryClient.removeQueries({ queryKey: ['vendor'] });
}
