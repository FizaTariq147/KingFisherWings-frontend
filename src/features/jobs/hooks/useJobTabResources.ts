import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type {
  AddJobOrganizationDto,
  BulkJobDimensionsDto,
  ConfirmDimensionUploadDto,
  CopyJobOrganizationsDto,
  PasteDimensionUploadDto,
  PatchJobDepartmentDto,
  ReplaceJobOrganizationDto,
  SyncDimensionsToCargoDto,
  UpsertJobCustomsRefDto,
  UpsertJobDimensionLineDto,
  UpsertJobExchangeRateDto,
  UpsertJobRoutingLegDto,
} from '../types/job.types';
import { jobKeys, useInvalidateJobs } from './useJobs';

function invalidateTabResources(queryClient: ReturnType<typeof useQueryClient>, jobId: string) {
  void queryClient.invalidateQueries({ queryKey: jobKeys.organizations(jobId) });
  void queryClient.invalidateQueries({ queryKey: jobKeys.dimensionLines(jobId) });
  void queryClient.invalidateQueries({ queryKey: jobKeys.jobShipments(jobId) });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'organization') });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'dimensions') });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'department') });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'ex_rate') });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'routing') });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'customs') });
  void queryClient.invalidateQueries({ queryKey: jobKeys.detailTab(jobId, 'shipments') });
  void queryClient.invalidateQueries({
    queryKey: jobKeys.detailTab(jobId, 'shipping_bill_boe'),
  });
}

/** Mutations for Party / Dimensions / Department / Ex-rate / Routing / Customs tabs. */
export function useJobTabResourceMutations(jobId: string) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  const id = jobId;

  const after = () => {
    invalidate(id);
    invalidateTabResources(queryClient, id);
  };

  return {
    // Organizations
    addOrganization: useMutation({
      mutationFn: (dto: AddJobOrganizationDto) => jobService.addOrganization(id, dto),
      onSuccess: after,
    }),
    replaceOrganization: useMutation({
      mutationFn: ({
        orgType,
        dto,
      }: {
        orgType: string;
        dto: ReplaceJobOrganizationDto;
      }) => jobService.replaceOrganization(id, orgType, dto),
      onSuccess: after,
    }),
    unlinkOrganization: useMutation({
      mutationFn: (orgType: string) => jobService.unlinkOrganization(id, orgType),
      onSuccess: after,
    }),
    copyOrganizationsFrom: useMutation({
      mutationFn: (dto: CopyJobOrganizationsDto = {}) =>
        jobService.copyOrganizationsFrom(id, dto),
      onSuccess: after,
    }),
    refreshOrganizationSnapshots: useMutation({
      mutationFn: (body: Record<string, unknown> = {}) =>
        jobService.refreshOrganizationSnapshots(id, body),
      onSuccess: after,
    }),

    // Dimensions lines
    addDimensionLine: useMutation({
      mutationFn: (dto: UpsertJobDimensionLineDto) => jobService.addDimensionLine(id, dto),
      onSuccess: after,
    }),
    updateDimensionLine: useMutation({
      mutationFn: ({
        lineId,
        dto,
      }: {
        lineId: string;
        dto: UpsertJobDimensionLineDto;
      }) => jobService.updateDimensionLine(id, lineId, dto),
      onSuccess: after,
    }),
    deleteDimensionLine: useMutation({
      mutationFn: (lineId: string) => jobService.deleteDimensionLine(id, lineId),
      onSuccess: after,
    }),
    bulkUpdateDimensions: useMutation({
      mutationFn: (dto: BulkJobDimensionsDto) => jobService.bulkUpdateDimensions(id, dto),
      onSuccess: after,
    }),
    syncDimensionsToCargo: useMutation({
      mutationFn: (dto: SyncDimensionsToCargoDto = {}) =>
        jobService.syncDimensionsToCargo(id, dto),
      onSuccess: after,
    }),
    uploadDimensions: useMutation({
      mutationFn: ({
        formData,
        params,
      }: {
        formData: FormData;
        params?: Record<string, unknown>;
      }) => jobService.uploadDimensions(id, formData, params),
      onSuccess: after,
    }),
    pasteDimensionsUpload: useMutation({
      mutationFn: (dto: PasteDimensionUploadDto) =>
        jobService.pasteDimensionsUpload(id, dto),
      onSuccess: after,
    }),
    confirmDimensionsUpload: useMutation({
      mutationFn: (dto: ConfirmDimensionUploadDto) =>
        jobService.confirmDimensionsUpload(id, dto),
      onSuccess: after,
    }),
    exportDimensions: useMutation({
      mutationFn: () => jobService.exportDimensions(id),
    }),
    downloadDimensionsSample: useMutation({
      mutationFn: () => jobService.downloadDimensionsUploadSample(id),
    }),

    // Department
    patchDepartment: useMutation({
      mutationFn: (dto: PatchJobDepartmentDto) => jobService.patchDepartment(id, dto),
      onSuccess: after,
    }),

    // Exchange rates
    upsertExchangeRate: useMutation({
      mutationFn: (dto: UpsertJobExchangeRateDto) => jobService.upsertExchangeRate(id, dto),
      onSuccess: after,
    }),
    deleteExchangeRate: useMutation({
      mutationFn: (rateId: string) => jobService.deleteExchangeRate(id, rateId),
      onSuccess: after,
    }),

    // Routing legs
    addRoutingLeg: useMutation({
      mutationFn: (dto: UpsertJobRoutingLegDto) => jobService.addRoutingLeg(id, dto),
      onSuccess: after,
    }),
    updateRoutingLeg: useMutation({
      mutationFn: ({
        legId,
        dto,
      }: {
        legId: string;
        dto: UpsertJobRoutingLegDto;
      }) => jobService.updateRoutingLeg(id, legId, dto),
      onSuccess: after,
    }),
    deleteRoutingLeg: useMutation({
      mutationFn: (legId: string) => jobService.deleteRoutingLeg(id, legId),
      onSuccess: after,
    }),

    // Customs refs
    addCustomsRef: useMutation({
      mutationFn: (dto: UpsertJobCustomsRefDto) => jobService.addCustomsRef(id, dto),
      onSuccess: after,
    }),
    updateCustomsRef: useMutation({
      mutationFn: ({
        refId,
        dto,
      }: {
        refId: string;
        dto: UpsertJobCustomsRefDto;
      }) => jobService.updateCustomsRef(id, refId, dto),
      onSuccess: after,
    }),
    deleteCustomsRef: useMutation({
      mutationFn: (refId: string) => jobService.deleteCustomsRef(id, refId),
      onSuccess: after,
    }),

    // Shipments attached to job
    attachExistingShipments: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        jobService.attachExistingJobShipments(id, body),
      onSuccess: after,
    }),
    createLinkShipments: useMutation({
      mutationFn: (body: Record<string, unknown>) =>
        jobService.attachJobShipments(id, body),
      onSuccess: after,
    }),
  };
}
