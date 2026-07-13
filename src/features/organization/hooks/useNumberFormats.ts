import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { organizationService } from '../services/organization.service';
import type { NumberFormatFormValues } from '../types/organization.types';
import { organizationKeys } from './useOrganizationProfile';

export const numberFormatKeys = {
  all: [...organizationKeys.all, 'number-formats'] as const,
  list: () => [...numberFormatKeys.all, 'list'] as const,
  detail: (documentType: string) => [...numberFormatKeys.all, 'detail', documentType] as const,
  preview: (documentType: string) => [...numberFormatKeys.all, 'preview', documentType] as const,
};

export function useNumberFormats() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: numberFormatKeys.list(),
    queryFn: () => organizationService.listNumberFormats(),
    enabled: Boolean(accessToken),
    staleTime: 30_000,
  });
}

export function useNumberFormat(documentType: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: numberFormatKeys.detail(documentType),
    queryFn: () => organizationService.getNumberFormat(documentType),
    enabled: Boolean(accessToken) && Boolean(documentType),
  });
}

export function useNumberFormatPreview(documentType: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: numberFormatKeys.preview(documentType),
    queryFn: () => organizationService.previewNumberFormat(documentType),
    enabled: Boolean(accessToken) && Boolean(documentType) && enabled,
  });
}

function useInvalidateNumberFormats() {
  const queryClient = useQueryClient();
  return (documentType?: string) => {
    queryClient.invalidateQueries({ queryKey: numberFormatKeys.all });
    if (documentType) {
      queryClient.invalidateQueries({ queryKey: numberFormatKeys.detail(documentType) });
      queryClient.invalidateQueries({ queryKey: numberFormatKeys.preview(documentType) });
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
