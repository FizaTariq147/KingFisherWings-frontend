import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import type { DocumentationUploadType } from '../api/documentation.api';
import {
  documentationBoeService,
  documentationBulkCostService,
  documentationChargeTemplateService,
  documentationDeliveryOrderService,
  documentationEdiService,
  documentationJobTransferService,
  documentationMpciService,
  documentationTrackingService,
  documentationUploadService,
} from '../services/documentation.service';
import type {
  AirTrackingParams,
  ApplyChargeTemplateDto,
  BoeListParams,
  BulkCostBatchDto,
  ChargeTemplateListParams,
  CgmVoyageDto,
  CreateBoeRecordDto,
  CreateChargeTemplateDto,
  CreateMpciFilingDto,
  DocumentationListParams,
  DocumentationReportParams,
  UpdateBoeRecordDto,
  UpdateCgmVoyageDto,
  UpdateChargeTemplateDto,
  UpdateDeliveryOrderDto,
} from '../types/documentation.types';

export const documentationKeys = {
  all: ['tenant', 'documentation'] as const,
  boe: {
    dashboard: (params: BoeListParams) => [...documentationKeys.all, 'boe', 'dashboard', params] as const,
    pendingClaims: (params: BoeListParams) =>
      [...documentationKeys.all, 'boe', 'pending-claims', params] as const,
  },
  bulkCosts: {
    detail: (id: string) => [...documentationKeys.all, 'bulk-costs', id] as const,
  },
  chargeTemplates: {
    list: (params: ChargeTemplateListParams) =>
      [...documentationKeys.all, 'charge-templates', params] as const,
    detail: (id: string) => [...documentationKeys.all, 'charge-templates', id] as const,
  },
  deliveryOrders: {
    closedJobs: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'delivery-orders', 'closed-jobs', params] as const,
  },
  edi: {
    bayanJobs: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'bayan', 'jobs', params] as const,
    bayanShipments: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'bayan', 'shipments', params] as const,
    ccnJobs: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'ccn', 'jobs', params] as const,
    cgmVessels: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'cgm', 'vessels', params] as const,
    dubaiEqoJobs: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'eqo', 'dubai', params] as const,
    omanEqoJobs: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'eqo', 'oman', params] as const,
    ialJobs: (params: DocumentationListParams) =>
      [...documentationKeys.all, 'edi', 'ial', 'jobs', params] as const,
  },
  mpci: {
    list: (params: DocumentationListParams) => [...documentationKeys.all, 'mpci', params] as const,
  },
  reports: {
    summary: (params: DocumentationReportParams) =>
      [...documentationKeys.all, 'reports', 'summary', params] as const,
    jobsList: (params: DocumentationReportParams) =>
      [...documentationKeys.all, 'reports', 'jobs-list', params] as const,
    etaFollowup: (params: DocumentationReportParams) =>
      [...documentationKeys.all, 'reports', 'eta-followup', params] as const,
    etdFollowup: (params: DocumentationReportParams) =>
      [...documentationKeys.all, 'reports', 'etd-followup', params] as const,
    manifestStatus: (params: DocumentationReportParams) =>
      [...documentationKeys.all, 'reports', 'manifest-status', params] as const,
  },
  tracking: {
    air: (params: AirTrackingParams) => [...documentationKeys.all, 'tracking', 'air', params] as const,
  },
};

function useToken() {
  return useAuthStore((s) => s.accessToken);
}

export function useBoeDashboard(params: BoeListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.boe.dashboard(params),
    queryFn: () => documentationBoeService.dashboard(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useBoePendingClaims(params: BoeListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.boe.pendingClaims(params),
    queryFn: () => documentationBoeService.pendingClaims(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useBoeActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    create: useMutation({
      mutationFn: (dto: CreateBoeRecordDto) => documentationBoeService.create(dto),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateBoeRecordDto }) =>
        documentationBoeService.update(id, dto),
      onSuccess: invalidate,
    }),
  };
}

export function useBulkCostActions() {
  const queryClient = useQueryClient();
  return {
    preview: useMutation({
      mutationFn: (dto: BulkCostBatchDto) => documentationBulkCostService.preview(dto),
    }),
    create: useMutation({
      mutationFn: (dto: BulkCostBatchDto) => documentationBulkCostService.create(dto),
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all }),
    }),
  };
}

export function useBulkCostBatch(id: string) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.bulkCosts.detail(id),
    queryFn: () => documentationBulkCostService.get(id),
    enabled: Boolean(token) && isUuid(id),
  });
}

export function useChargeTemplates(params: ChargeTemplateListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.chargeTemplates.list(params),
    queryFn: () => documentationChargeTemplateService.list(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useChargeTemplateActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    create: useMutation({
      mutationFn: (dto: CreateChargeTemplateDto) => documentationChargeTemplateService.create(dto),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateChargeTemplateDto }) =>
        documentationChargeTemplateService.update(id, dto),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => documentationChargeTemplateService.remove(id),
      onSuccess: invalidate,
    }),
    apply: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: ApplyChargeTemplateDto }) =>
        documentationChargeTemplateService.apply(id, dto),
      onSuccess: invalidate,
    }),
  };
}

export function useClosedDeliveryJobs(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.deliveryOrders.closedJobs(params),
    queryFn: () => documentationDeliveryOrderService.closedJobs(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useDeliveryOrderActions() {
  const queryClient = useQueryClient();
  return {
    updateJob: useMutation({
      mutationFn: ({ jobId, dto }: { jobId: string; dto: UpdateDeliveryOrderDto }) =>
        documentationDeliveryOrderService.updateJob(jobId, dto),
      onSuccess: () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all }),
    }),
  };
}

export function useBayanEdiJobs(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.bayanJobs(params),
    queryFn: () => documentationEdiService.bayanJobs(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useBayanEdiShipments(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.bayanShipments(params),
    queryFn: () => documentationEdiService.bayanShipments(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useBayanEdiActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    generate: useMutation({ mutationFn: documentationEdiService.bayanGenerate, onSuccess: invalidate }),
    submit: useMutation({ mutationFn: documentationEdiService.bayanSubmit, onSuccess: invalidate }),
    amend: useMutation({ mutationFn: documentationEdiService.bayanAmend, onSuccess: invalidate }),
  };
}

export function useCcnEdiJobs(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.ccnJobs(params),
    queryFn: () => documentationEdiService.ccnJobs(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useCcnEdiActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    generateFwb: useMutation({ mutationFn: documentationEdiService.ccnGenerateFwb, onSuccess: invalidate }),
    generateFhl: useMutation({ mutationFn: documentationEdiService.ccnGenerateFhl, onSuccess: invalidate }),
    submit: useMutation({ mutationFn: documentationEdiService.ccnSubmit, onSuccess: invalidate }),
  };
}

export function useCgmEdiVessels(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.cgmVessels(params),
    queryFn: () => documentationEdiService.cgmVessels(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useCgmEdiActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    create: useMutation({
      mutationFn: (dto: CgmVoyageDto) => documentationEdiService.cgmCreate(dto),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateCgmVoyageDto }) =>
        documentationEdiService.cgmUpdate(id, dto),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: documentationEdiService.cgmDelete, onSuccess: invalidate }),
    downloadEdi: useMutation({ mutationFn: (id: string) => documentationEdiService.cgmDownloadEdi(id) }),
  };
}

export function useDubaiEqoEdiJobs(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.dubaiEqoJobs(params),
    queryFn: () => documentationEdiService.dubaiEqoJobs(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useOmanEqoEdiJobs(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.omanEqoJobs(params),
    queryFn: () => documentationEdiService.omanEqoJobs(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useEqoEdiActions(variant: 'dubai' | 'oman') {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  const svc = variant === 'dubai' ? documentationEdiService : documentationEdiService;
  return {
    generateBol: useMutation({
      mutationFn: variant === 'dubai' ? svc.dubaiEqoGenerateBol : svc.omanEqoGenerateBol,
      onSuccess: invalidate,
    }),
    submit: useMutation({
      mutationFn: variant === 'dubai' ? svc.dubaiEqoSubmit : svc.omanEqoSubmit,
      onSuccess: invalidate,
    }),
  };
}

export function useIalEdiJobs(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.edi.ialJobs(params),
    queryFn: () => documentationEdiService.ialJobs(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useIalEdiActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    generate: useMutation({ mutationFn: documentationEdiService.ialGenerate, onSuccess: invalidate }),
    submit: useMutation({ mutationFn: documentationEdiService.ialSubmit, onSuccess: invalidate }),
  };
}

export function useEdiSubmissionDownload() {
  return useMutation({
    mutationFn: (submissionId: string) => documentationEdiService.downloadSubmission(submissionId),
  });
}

export function useJobTransferActions() {
  return {
    exportJobs: useMutation({ mutationFn: (body?: object) => documentationJobTransferService.exportJobs(body) }),
    importJobs: useMutation({ mutationFn: documentationJobTransferService.importJobs }),
  };
}

export function useMpciFilings(params: DocumentationListParams, enabled = true) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.mpci.list(params),
    queryFn: () => documentationMpciService.list(params),
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
}

export function useMpciActions() {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: documentationKeys.all });
  return {
    create: useMutation({
      mutationFn: (dto: CreateMpciFilingDto) => documentationMpciService.create(dto),
      onSuccess: invalidate,
    }),
    prepare: useMutation({ mutationFn: documentationMpciService.prepare, onSuccess: invalidate }),
    submit: useMutation({ mutationFn: documentationMpciService.submit, onSuccess: invalidate }),
    status: useMutation({ mutationFn: documentationMpciService.status }),
  };
}

export function useAirCargoTracking(params: AirTrackingParams, enabled = false) {
  const token = useToken();
  return useQuery({
    queryKey: documentationKeys.tracking.air(params),
    queryFn: () => documentationTrackingService.air(params),
    enabled: Boolean(token) && enabled && Boolean(params.mawb_number?.trim()),
    staleTime: 30_000,
  });
}

export function useDocumentationUpload(uploadType: DocumentationUploadType) {
  return {
    upload: useMutation({ mutationFn: (file: File) => documentationUploadService.upload(uploadType, file) }),
    downloadTemplate: useMutation({
      mutationFn: () => documentationUploadService.downloadTemplate(uploadType),
    }),
    batchErrors: useMutation({ mutationFn: documentationUploadService.batchErrors }),
  };
}
