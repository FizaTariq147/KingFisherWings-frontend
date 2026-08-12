import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { vendorAdminDisputesService } from '../services/vendorAdminDisputes.service';
import type { ReviewVendorDisputeDto } from '../types/vendorAdminDisputes.types';

export const vendorAdminDisputeKeys = {
  all: ['vendor-admin', 'disputes'] as const,
  list: () => [...vendorAdminDisputeKeys.all, 'list'] as const,
  detail: (id: string) => [...vendorAdminDisputeKeys.all, 'detail', id] as const,
};

export function useAdminVendorDisputes(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: vendorAdminDisputeKeys.list(),
    queryFn: () => vendorAdminDisputesService.list(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 0,
  });
}

export function useReviewAdminVendorDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewVendorDisputeDto }) =>
      vendorAdminDisputesService.review(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: vendorAdminDisputeKeys.all });
    },
  });
}
