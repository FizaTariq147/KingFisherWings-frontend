import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import type { CreateJobDto, JobListParams, UpdateJobDto } from '../types/job.types';

export const jobKeys = {
  all: ['tenant', 'jobs'] as const,
  list: (params: JobListParams) => [...jobKeys.all, 'list', params] as const,
  detail: (id: string) => [...jobKeys.all, 'detail', id] as const,
  houseJobs: (id: string) => [...jobKeys.all, 'house-jobs', id] as const,
  pnl: (id: string) => [...jobKeys.all, 'pnl', id] as const,
  milestones: (id: string) => [...jobKeys.all, 'milestones', id] as const,
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
    queryFn: () => jobService.getById(id),
    enabled: Boolean(accessToken) && isUuid(id),
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
