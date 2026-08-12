import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { useVendorQueryScope } from '@/features/vendor-shared/useVendorQueryScope';
import { vendorDisputesService } from '../services/vendorDisputes.service';
import type {
  VendorDisputeCreateDto,
  VendorDisputeListParams,
} from '../types/vendorDisputes.types';

export const vendorDisputeKeys = {
  all: (scope: string) => ['vendor', scope, 'disputes'] as const,
  list: (scope: string, params: VendorDisputeListParams) =>
    [...vendorDisputeKeys.all(scope), 'list', params] as const,
  detail: (scope: string, id: string) => [...vendorDisputeKeys.all(scope), 'detail', id] as const,
};

export function useVendorDisputes(params: VendorDisputeListParams) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorDisputeKeys.list(scope, params),
    queryFn: () => vendorDisputesService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useVendorDispute(id: string, enabled = true) {
  const accessToken = useVendorAuthStore((s) => s.accessToken);
  const scope = useVendorQueryScope();
  return useQuery({
    queryKey: vendorDisputeKeys.detail(scope, id),
    queryFn: () => vendorDisputesService.getById(id),
    enabled: Boolean(accessToken) && Boolean(id) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function useCreateVendorDispute() {
  const queryClient = useQueryClient();
  const scope = useVendorQueryScope();
  return useMutation({
    mutationFn: (dto: VendorDisputeCreateDto) => vendorDisputesService.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: vendorDisputeKeys.all(scope) });
    },
  });
}
