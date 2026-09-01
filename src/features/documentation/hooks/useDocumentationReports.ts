import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { documentationReportService } from '../services/documentation.service';
import type { DocumentationReportParams } from '../types/documentation.types';
import { documentationKeys } from './useDocumentation';

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useDocumentationReportSummary(params: DocumentationReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.reports.summary(params),
    queryFn: () => documentationReportService.summary(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useDocumentationJobsListReport(params: DocumentationReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.reports.jobsList(params),
    queryFn: () => documentationReportService.jobsList(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useDocumentationEtaFollowupReport(params: DocumentationReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.reports.etaFollowup(params),
    queryFn: () => documentationReportService.etaFollowup(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useDocumentationEtdFollowupReport(params: DocumentationReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.reports.etdFollowup(params),
    queryFn: () => documentationReportService.etdFollowup(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useDocumentationManifestStatusReport(params: DocumentationReportParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.reports.manifestStatus(params),
    queryFn: () => documentationReportService.manifestStatus(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}
