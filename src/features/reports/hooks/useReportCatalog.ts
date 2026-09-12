import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { reportCatalogService } from '../services/reportCatalog.service';
import type {
  ReportBindRendererDto,
  ReportGenerateRequest,
  ReportTemplate,
} from '../types/reportCatalog.types';

export const reportCatalogKeys = {
  all: ['tenant', 'report-catalog'] as const,
  list: (params: Record<string, unknown>) => [...reportCatalogKeys.all, 'list', params] as const,
  detail: (id: string) => [...reportCatalogKeys.all, 'detail', id] as const,
  renderers: () => [...reportCatalogKeys.all, 'renderers'] as const,
  job: (id: string) => [...reportCatalogKeys.all, 'job', id] as const,
};

export function useReportTemplates(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    family?: string;
    context?: string;
    includeInactive?: boolean;
    rolloutPhase?: number;
  } = {},
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.list(params),
    queryFn: () => reportCatalogService.listTemplates(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

/** Multi-page live browse for FRESA-style sectioned catalog (not single-page only). */
export function useReportTemplatesBrowse(
  params: {
    search?: string;
    family?: string;
    context?: string;
    includeInactive?: boolean;
    rolloutPhase?: number;
  } = {},
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...reportCatalogKeys.all, 'browse', params] as const,
    queryFn: () => reportCatalogService.listTemplatesBrowse(params),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useReportTemplate(idOrCode: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.detail(idOrCode),
    queryFn: () => reportCatalogService.getTemplate(idOrCode),
    enabled: Boolean(accessToken) && Boolean(idOrCode) && enabled,
  });
}

/** GET /reports/templates/renderers — Puppeteer pack keys for bind/activate. */
export function useReportRenderers(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.renderers(),
    queryFn: () => reportCatalogService.listRenderers(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (dto: ReportGenerateRequest) => reportCatalogService.generate(dto),
  });
}

export function useImportReportTemplates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (onProgress?: (done: number, total: number) => void) =>
      reportCatalogService.importFresaRegistry(onProgress),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: reportCatalogKeys.all });
    },
  });
}

export function useBindReportRenderer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: ReportBindRendererDto }) =>
      reportCatalogService.bindRenderer(code, dto),
    onSuccess: (template) => {
      void qc.invalidateQueries({ queryKey: reportCatalogKeys.all });
      if (template?.code) {
        void qc.invalidateQueries({ queryKey: reportCatalogKeys.detail(template.code) });
        void qc.invalidateQueries({ queryKey: reportCatalogKeys.detail(template.id) });
      }
    },
  });
}

export function useActivateReportTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      template: string | ReportTemplate;
      renderer_key?: string;
    }) => reportCatalogService.activateTemplate(input.template, {
      renderer_key: input.renderer_key,
    }),
    onSuccess: (template) => {
      void qc.invalidateQueries({ queryKey: reportCatalogKeys.all });
      if (template?.code) {
        void qc.invalidateQueries({ queryKey: reportCatalogKeys.detail(template.code) });
        void qc.invalidateQueries({ queryKey: reportCatalogKeys.detail(template.id) });
      }
    },
  });
}

export function useDeactivateReportTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => reportCatalogService.deactivateTemplate(code),
    onSuccess: (template) => {
      void qc.invalidateQueries({ queryKey: reportCatalogKeys.all });
      if (template?.code) {
        void qc.invalidateQueries({ queryKey: reportCatalogKeys.detail(template.code) });
        void qc.invalidateQueries({ queryKey: reportCatalogKeys.detail(template.id) });
      }
    },
  });
}

export function useReportJob(jobId: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: reportCatalogKeys.job(jobId),
    queryFn: () => reportCatalogService.getJob(jobId),
    enabled: Boolean(accessToken) && Boolean(jobId) && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'queued' || status === 'running') return 2000;
      return false;
    },
  });
}
