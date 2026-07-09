import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantService } from '../services/tenant.service';
import type { CreateTenantDto, UpdateTenantDto } from '../types/tenant.types';
import { tenantKeys } from './useTenants';

function useInvalidateTenants() {
  const queryClient = useQueryClient();

  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detail(detailId) });
    }
  };
}

export function useTenantMutations() {
  const invalidate = useInvalidateTenants();

  const createTenant = useMutation({
    mutationFn: (dto: CreateTenantDto) => tenantService.create(dto),
    onSuccess: () => invalidate(),
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTenantDto }) =>
      tenantService.update(id, dto),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const deleteTenant = useMutation({
    mutationFn: (id: string) => tenantService.softDelete(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const restoreTenant = useMutation({
    mutationFn: (id: string) => tenantService.restore(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const activateTenant = useMutation({
    mutationFn: (id: string) => tenantService.activate(id),
    onSuccess: (_, id) => invalidate(id),
  });

  const deactivateTenant = useMutation({
    mutationFn: (id: string) => tenantService.deactivate(id),
    onSuccess: (_, id) => invalidate(id),
  });

  return {
    createTenant,
    updateTenant,
    deleteTenant,
    restoreTenant,
    activateTenant,
    deactivateTenant,
  };
}

export function useCreateTenant() {
  const { createTenant } = useTenantMutations();
  return createTenant;
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTenantDto) => tenantService.update(id, dto),
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
      queryClient.setQueryData(tenantKeys.detail(id), tenant);
    },
  });
}

export function useActivateTenant() {
  const { activateTenant } = useTenantMutations();
  return activateTenant;
}

export function useDeactivateTenant() {
  const { deactivateTenant } = useTenantMutations();
  return deactivateTenant;
}

export function useDeleteTenant() {
  const { deleteTenant } = useTenantMutations();
  return deleteTenant;
}

export function useRestoreTenant() {
  const { restoreTenant } = useTenantMutations();
  return restoreTenant;
}
