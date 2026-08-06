import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { usePortalQueryScope } from '@/features/portal-shared/usePortalQueryScope';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { portalDocumentsService } from '../services/portalDocuments.service';
import type { PortalDocumentItem, PortalDocumentListParams } from '../types/portalDocuments.types';

export const portalDocumentKeys = {
  all: (scope: string) => ['portal', scope, 'documents'] as const,
  summary: (scope: string) => [...portalDocumentKeys.all(scope), 'summary'] as const,
  permissions: (scope: string) => [...portalDocumentKeys.all(scope), 'permissions'] as const,
  list: (scope: string, params: PortalDocumentListParams) =>
    [...portalDocumentKeys.all(scope), 'list', params] as const,
};

export function usePortalDocumentSummary(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalDocumentKeys.summary(scope),
    queryFn: () => portalDocumentsService.summary(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalDocumentPermissions(enabled = true) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalDocumentKeys.permissions(scope),
    queryFn: () => portalDocumentsService.permissions(),
    enabled: Boolean(accessToken) && enabled && scope !== 'anon',
    staleTime: 0,
  });
}

export function usePortalDocuments(params: PortalDocumentListParams) {
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const scope = usePortalQueryScope();
  return useQuery({
    queryKey: portalDocumentKeys.list(scope, params),
    queryFn: () => portalDocumentsService.list(params),
    enabled: Boolean(accessToken) && scope !== 'anon',
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useDownloadPortalDocument() {
  return useMutation({
    mutationFn: async (doc: PortalDocumentItem) => {
      if (doc.source === 'invoice' || doc.invoiceId) {
        await portalDocumentsService.downloadInvoice(
          doc.invoiceId || doc.id,
          doc.name || 'invoice.pdf',
        );
        return;
      }
      if (!doc.jobId) {
        throw new Error('This document cannot be downloaded (missing job id).');
      }
      await portalDocumentsService.downloadJobDocument(doc.jobId, doc.id, doc.name);
    },
  });
}
