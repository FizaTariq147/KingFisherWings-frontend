import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { organizationService } from '../services/organization.service';
import type { NumberFormatFormValues } from '../types/organization.types';
import { organizationKeys } from './useOrganizationProfile';

export const numberFormatKeys = {
  all: (tenantId?: string | null) =>
    [...organizationKeys.all(tenantId), 'number-formats'] as const,
  list: (tenantId?: string | null) => [...numberFormatKeys.all(tenantId), 'list'] as const,
  detail: (tenantId: string | null | undefined, documentType: string) =>
    [...numberFormatKeys.all(tenantId), 'detail', documentType] as const,
  preview: (tenantId: string | null | undefined, documentType: string) =>
    [...numberFormatKeys.all(tenantId), 'preview', documentType] as const,
};

export function useNumberFormats() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: numberFormatKeys.list(tenantId),
    queryFn: () => organizationService.listNumberFormats(),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useNumberFormat(documentType: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: numberFormatKeys.detail(tenantId, documentType),
    queryFn: () => organizationService.getNumberFormat(documentType),
    enabled: Boolean(accessToken) && Boolean(documentType),
  });
}

export function useNumberFormatPreview(documentType: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return useQuery({
    queryKey: numberFormatKeys.preview(tenantId, documentType),
    queryFn: () => organizationService.previewNumberFormat(documentType),
    enabled: Boolean(accessToken) && Boolean(documentType) && enabled,
  });
}

function useInvalidateNumberFormats() {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  return (documentType?: string) => {
    queryClient.invalidateQueries({ queryKey: numberFormatKeys.all(tenantId) });
    if (documentType) {
      queryClient.invalidateQueries({
        queryKey: numberFormatKeys.detail(tenantId, documentType),
      });
      queryClient.invalidateQueries({
        queryKey: numberFormatKeys.preview(tenantId, documentType),
      });
    }
  };
}

export function useCreateNumberFormat() {
  const invalidate = useInvalidateNumberFormats();
  return useMutation({
    mutationFn: (values: NumberFormatFormValues) =>
      organizationService.createNumberFormat(values),
    onSuccess: (format) => invalidate(String(format.document_type)),
  });
}

export function useUpdateNumberFormat(documentType: string) {
  const invalidate = useInvalidateNumberFormats();
  return useMutation({
    mutationFn: (values: Partial<NumberFormatFormValues>) =>
      organizationService.updateNumberFormat(documentType, values),
    onSuccess: () => invalidate(documentType),
  });
}

export function usePreviewNumberFormatMutation() {
  return useMutation({
    mutationFn: (documentType: string) => organizationService.previewNumberFormat(documentType),
  });
}
