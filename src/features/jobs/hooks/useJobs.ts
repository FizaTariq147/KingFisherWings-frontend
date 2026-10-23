import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { tenantSlugFromAccessToken } from '@/lib/tenantFromAuth';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import type {
  CreateJobDto,
  JobListParams,
  UpdateAirBookingFormDto,
  UpdateJobDto,
  UpsertAirComplianceBookingFormDto,
} from '../types/job.types';

export const jobKeys = {
  all: ['tenant', 'jobs'] as const,
  list: (params: JobListParams) => [...jobKeys.all, 'list', params] as const,
  detail: (id: string) => [...jobKeys.all, 'detail', id] as const,
  detailTab: (id: string, tab: string) => [...jobKeys.all, 'detail-tab', id, tab] as const,
  statusOptions: (jobId?: string) => [...jobKeys.all, 'status-options', jobId ?? ''] as const,
  lookupsDropdowns: [...(['tenant', 'jobs'] as const), 'lookups-dropdowns'] as const,
  gpum: (id: string) => [...jobKeys.all, 'gpum', id] as const,
  chargeAttachments: (id: string, chargeId: string) =>
    [...jobKeys.all, 'charge-attachments', id, chargeId] as const,
  houseJobs: (id: string) => [...jobKeys.all, 'house-jobs', id] as const,
  pnl: (id: string) => [...jobKeys.all, 'pnl', id] as const,
  milestones: (id: string) => [...jobKeys.all, 'milestones', id] as const,
  tracking: (id: string) => [...jobKeys.all, 'tracking', id] as const,
  notes: (id: string) => [...jobKeys.all, 'notes', id] as const,
  documents: (id: string) => [...jobKeys.all, 'documents', id] as const,
  docStatus: (id: string) => [...jobKeys.all, 'doc-status', id] as const,
  containers: (id: string) => [...jobKeys.all, 'containers', id] as const,
  containersFill: (id: string) => [...jobKeys.all, 'containers-fill', id] as const,
  cargo: (id: string) => [...jobKeys.all, 'cargo', id] as const,
  cutoffs: (id: string) => [...jobKeys.all, 'cutoffs', id] as const,
  billsOfLading: (id: string) => [...jobKeys.all, 'bills-of-lading', id] as const,
  stuffing: (id: string) => [...jobKeys.all, 'stuffing', id] as const,
  deposits: (id: string) => [...jobKeys.all, 'deposits', id] as const,
  freeDays: (id: string) => [...jobKeys.all, 'free-days', id] as const,
  damageReports: (id: string) => [...jobKeys.all, 'damage-reports', id] as const,
  partDeliveries: (id: string) => [...jobKeys.all, 'part-deliveries', id] as const,
  pods: (id: string) => [...jobKeys.all, 'pods', id] as const,
  subJobs: (id: string) => [...jobKeys.all, 'sub-jobs', id] as const,
  customsExaminations: (id: string) => [...jobKeys.all, 'customs-examinations', id] as const,
  storageCalculation: (id: string, asOf?: string) =>
    [...jobKeys.all, 'storage-calculation', id, asOf ?? ''] as const,
  airBookingForm: (id: string) => [...jobKeys.all, 'air-booking-form', id] as const,
  airComplianceForm: (id: string) => [...jobKeys.all, 'air-compliance-form', id] as const,
  organizations: (id: string) => [...jobKeys.all, 'organizations', id] as const,
  dimensionLines: (id: string) => [...jobKeys.all, 'dimension-lines', id] as const,
  jobShipments: (id: string) => [...jobKeys.all, 'job-shipments', id] as const,
  jobVouchers: (id: string) => [...jobKeys.all, 'job-vouchers', id] as const,
  jobCharges: (id: string) => [...jobKeys.all, 'job-charges', id] as const,
  jobChargesHistory: (id: string) => [...jobKeys.all, 'job-charges-history', id] as const,
  jobChargeHistory: (id: string, chargeId: string) =>
    [...jobKeys.all, 'job-charge-history', id, chargeId] as const,
  jobPnlCustomDuty: (id: string) => [...jobKeys.all, 'job-pnl-custom-duty', id] as const,
  jobReferences: (id: string) => [...jobKeys.all, 'job-references', id] as const,
  jobEmailRecipientsSuggest: (id: string) =>
    [...jobKeys.all, 'job-email-recipients-suggest', id] as const,
  chargeAttachments: (id: string, chargeId: string) =>
    [...jobKeys.all, 'charge-attachments', id, chargeId] as const,
  profitShareCalculator: (id: string) =>
    [...jobKeys.all, 'profit-share-calculator', id] as const,
  profitShareAccounts: (id: string, search: string) =>
    [...jobKeys.all, 'profit-share-accounts', id, search] as const,
  purchaseBulkPreview: (id: string) =>
    [...jobKeys.all, 'purchase-bulk-preview', id] as const,
  ediTypes: (id: string) => [...jobKeys.all, 'edi-types', id] as const,
  ediSubmissions: (id: string) => [...jobKeys.all, 'edi-submissions', id] as const,
};

export function useInvalidateJobs() {
  const queryClient = useQueryClient();
  return (detailId?: string) => {
    queryClient.invalidateQueries({ queryKey: jobKeys.all });
    if (detailId) {
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(detailId) });
    }
  };
}

export function useJobs(params: JobListParams, options?: { enabled?: boolean }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => jobService.list(params),
    enabled: Boolean(accessToken) && options?.enabled !== false,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useJob(id: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.detail(id),
    /** Prefer Fresa detail (actions/tabs); falls back to GET /jobs/:id inside service. */
    queryFn: () => jobService.getDetail(id),
    enabled: Boolean(accessToken) && isUuid(id),
  });
}

export function useJobStatusOptions(jobId?: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.statusOptions(jobId),
    queryFn: () => jobService.getStatusOptions(jobId),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
  });
}

export function useJobDetailTab(id: string, tab: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.detailTab(id, tab),
    queryFn: () => jobService.getDetailTab(id, tab),
    enabled: Boolean(accessToken) && isUuid(id) && Boolean(tab.trim()) && enabled,
  });
}

/** Show All — aggregates sibling keys from GET /jobs/:id/detail via detail/:tab. */
export function useJobShowAll(id: string, siblingTabKeys: string[], enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const keys = siblingTabKeys.map((k) => k.trim()).filter(Boolean).sort();
  return useQuery({
    queryKey: [...jobKeys.detail(id), 'show-all', keys] as const,
    queryFn: () => jobService.getShowAll(id, keys),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
    staleTime: 30_000,
  });
}

/** GET /jobs/:id/organizations */
export function useJobOrganizations(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.organizations(id),
    queryFn: () => jobService.listOrganizations(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/dimensions */
export function useJobDimensionLines(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.dimensionLines(id),
    queryFn: () => jobService.listDimensions(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/shipments — shipments attached to this job */
export function useJobShipmentsList(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobShipments(id),
    queryFn: () => jobService.listJobShipments(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/vouchers — vouchers linked to this job */
export function useJobVouchersList(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobVouchers(id),
    queryFn: () => jobService.listJobVouchers(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/charges — costing grid + parties_included rollup */
export function useJobCharges(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobCharges(id),
    queryFn: () => jobService.listJobChargesTab(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/charges/history */
export function useJobChargesHistory(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobChargesHistory(id),
    queryFn: () => jobService.listChargesHistory(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/charges/:chargeId/history */
export function useJobChargeHistory(id: string, chargeId: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobChargeHistory(id, chargeId),
    queryFn: () => jobService.listChargeHistory(id, chargeId),
    enabled: Boolean(accessToken) && isUuid(id) && isUuid(chargeId) && enabled,
  });
}

/** GET /jobs/:id/charges/:chargeId/attachments?side= */
export function useJobChargeAttachments(
  id: string,
  chargeId: string,
  enabled = true,
  side: 'SALE' | 'COST' | 'CHARGE' = 'CHARGE',
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...jobKeys.chargeAttachments(id, chargeId), side] as const,
    queryFn: () => jobService.listChargeAttachments(id, chargeId, side),
    enabled: Boolean(accessToken) && isUuid(id) && isUuid(chargeId) && enabled,
  });
}

/** GET /jobs/:id/pnl/custom-duty */
export function useJobPnlCustomDuty(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobPnlCustomDuty(id),
    queryFn: () => jobService.getPnlCustomDuty(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/references */
export function useJobReferences(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobReferences(id),
    queryFn: () => jobService.getReferences(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/email-recipients/suggest */
export function useJobEmailRecipientsSuggest(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.jobEmailRecipientsSuggest(id),
    queryFn: () => jobService.suggestEmailRecipients(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/profit-share/calculator */
export function useProfitShareCalculator(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.profitShareCalculator(id),
    queryFn: () => jobService.getProfitShareCalculator(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/profit-share/accounts?search= */
export function useProfitShareAccounts(
  id: string,
  search = '',
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.profitShareAccounts(id, search.trim()),
    queryFn: () =>
      jobService.listProfitShareAccounts(id, {
        search: search.trim() || undefined,
      }),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/invoices/purchase/bulk */
export function useJobBulkPurchasePreview(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.purchaseBulkPreview(id),
    queryFn: () => jobService.previewBulkPurchaseInvoice(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/edi/types */
export function useJobEdiTypes(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.ediTypes(id),
    queryFn: () => jobService.listJobEdiTypes(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** GET /jobs/:id/edi/submissions */
export function useJobEdiSubmissions(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.ediSubmissions(id),
    queryFn: () => jobService.listJobEdiSubmissions(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobLookupsDropdowns(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.lookupsDropdowns,
    queryFn: () => jobService.getLookupsDropdowns(),
    enabled: Boolean(accessToken) && enabled,
    staleTime: 60_000,
  });
}

export function useJobGpum(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.gpum(id),
    queryFn: () => jobService.getGpum(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useCreateJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (dto: CreateJobDto) => jobService.create(dto),
    onSuccess: (job) => invalidate(job.id),
  });
}

export function useUpdateJob(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateJobDto) => jobService.update(id, dto),
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      queryClient.setQueryData(jobKeys.detail(id), job);
    },
  });
}

export function useDeleteJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (id: string) => jobService.softDelete(id),
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useJobHouseJobs(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.houseJobs(id),
    queryFn: () => jobService.listHouseJobs(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobPnl(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.pnl(id),
    queryFn: () => jobService.getPnl(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobMilestones(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.milestones(id),
    queryFn: () => jobService.listMilestones(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

/** Track & Trace — shipment tracking / public /track / job milestones. */
export function useJobTracking(
  opts: {
    jobId: string;
    jobNumber?: string;
    shipmentId?: string;
  },
  enabled = false,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantSlugFromToken = tenantSlugFromAccessToken(accessToken);
  return useQuery({
    queryKey: [
      ...jobKeys.tracking(opts.jobId),
      opts.shipmentId ?? '',
      opts.jobNumber ?? '',
      tenantSlugFromToken,
    ],
    queryFn: async () => {
      const { readRememberedPublicTrackTenantSlug } = await import(
        '@/features/public-track/utils/publicTrackContext'
      );
      const tenantSlug =
        tenantSlugFromToken || readRememberedPublicTrackTenantSlug() || undefined;
      return jobService.trackAndTrace({
        jobId: opts.jobId,
        jobNumber: opts.jobNumber,
        shipmentId: opts.shipmentId,
        tenantSlug,
      });
    },
    enabled: Boolean(accessToken) && isUuid(opts.jobId) && enabled,
  });
}

export function useJobNotes(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.notes(id),
    queryFn: () => jobService.listNotes(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobDocuments(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.documents(id),
    queryFn: () => jobService.listDocuments(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobDocumentGenerationStatus(id: string, poll = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.docStatus(id),
    queryFn: () => jobService.getDocumentGenerationStatus(id),
    enabled: Boolean(accessToken) && isUuid(id),
    refetchInterval: poll ? 3000 : false,
  });
}

export function useJobContainers(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.containers(id),
    queryFn: () => jobService.listContainers(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobCargo(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.cargo(id),
    queryFn: () => jobService.listCargo(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobCutoffs(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.cutoffs(id),
    queryFn: () => jobService.getCutoffs(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobAirBookingForm(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.airBookingForm(id),
    queryFn: () => jobService.getAirBookingForm(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useUpdateJobAirBookingForm(id: string) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAirBookingFormDto) => jobService.updateAirBookingForm(id, dto),
    onSuccess: () => {
      invalidate(id);
      void queryClient.invalidateQueries({ queryKey: jobKeys.airBookingForm(id) });
    },
  });
}

export function useJobAirComplianceForm(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.airComplianceForm(id),
    queryFn: () => jobService.getAirComplianceForm(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useUpdateJobAirComplianceForm(id: string) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpsertAirComplianceBookingFormDto) =>
      jobService.putAirComplianceForm(id, dto),
    onSuccess: () => {
      invalidate(id);
      void queryClient.invalidateQueries({ queryKey: jobKeys.airComplianceForm(id) });
    },
  });
}

export function useJobBillsOfLading(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.billsOfLading(id),
    queryFn: () => jobService.listBillsOfLading(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobStuffingRecords(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.stuffing(id),
    queryFn: () => jobService.listStuffingRecords(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobContainersFill(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.containersFill(id),
    queryFn: () => jobService.listContainersFill(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobContainerFill(
  id: string,
  containerId: string,
  enabled = true,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: [...jobKeys.containersFill(id), containerId] as const,
    queryFn: () => jobService.getContainerFill(id, containerId),
    enabled: Boolean(accessToken) && isUuid(id) && isUuid(containerId) && enabled,
  });
}

export function useJobDeposits(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.deposits(id),
    queryFn: () => jobService.listDeposits(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobFreeDays(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.freeDays(id),
    queryFn: () => jobService.listFreeDays(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobDamageReports(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.damageReports(id),
    queryFn: () => jobService.listDamageReports(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobPartDeliveries(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.partDeliveries(id),
    queryFn: () => jobService.listPartDeliveries(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobPods(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.pods(id),
    queryFn: () => jobService.listPods(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobSubJobs(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.subJobs(id),
    queryFn: () => jobService.listSubJobs(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobCustomsExaminations(id: string, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.customsExaminations(id),
    queryFn: () => jobService.listCustomsExaminations(id),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}

export function useJobStorageCalculation(
  id: string,
  asOf?: string,
  enabled = false,
) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: jobKeys.storageCalculation(id, asOf),
    queryFn: () => jobService.getStorageCalculation(id, { as_of_date: asOf }),
    enabled: Boolean(accessToken) && isUuid(id) && enabled,
  });
}
