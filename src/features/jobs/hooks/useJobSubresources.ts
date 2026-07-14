import { useMutation } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type {
  AssignCargoToContainerDto,
  CreateBillOfLadingDto,
  CreateJobCargoDto,
  CreateJobContainerDto,
  CreateJobDocumentDto,
  CreateStuffingRecordDto,
  SplitContainerDto,
  SubmitSiDto,
  SubmitVgmDto,
  UpdateAirJobDetailDto,
  UpdateBillOfLadingDto,
  UpdateJobCargoDto,
  UpdateJobContainerDto,
  UpdateJobDocumentDto,
  UpdateSeaFclJobDetailDto,
  UpdateStuffingRecordDto,
} from '../types/job.types';
import { useInvalidateJobs } from './useJobs';

/** Sub-resource mutations exposed for detail panels and programmatic use. */
export function useJobSubresourceMutations(jobId: string) {
  const invalidate = useInvalidateJobs();
  const refresh = () => invalidate(jobId);

  return {
    updateAirDetails: useMutation({
      mutationFn: (dto: UpdateAirJobDetailDto) => jobService.updateAirDetails(jobId, dto),
      onSuccess: refresh,
    }),
    updateSeaFclDetails: useMutation({
      mutationFn: (dto: UpdateSeaFclJobDetailDto) =>
        jobService.updateSeaFclDetails(jobId, dto),
      onSuccess: refresh,
    }),
    submitSi: useMutation({
      mutationFn: (dto?: SubmitSiDto) => jobService.submitSi(jobId, dto),
      onSuccess: refresh,
    }),
    submitVgm: useMutation({
      mutationFn: (dto?: SubmitVgmDto) => jobService.submitVgm(jobId, dto),
      onSuccess: refresh,
    }),
    createContainer: useMutation({
      mutationFn: (dto: CreateJobContainerDto) => jobService.createContainer(jobId, dto),
      onSuccess: refresh,
    }),
    updateContainer: useMutation({
      mutationFn: ({
        containerId,
        dto,
      }: {
        containerId: string;
        dto: UpdateJobContainerDto;
      }) => jobService.updateContainer(jobId, containerId, dto),
      onSuccess: refresh,
    }),
    deleteContainer: useMutation({
      mutationFn: (containerId: string) => jobService.deleteContainer(jobId, containerId),
      onSuccess: refresh,
    }),
    assignCargo: useMutation({
      mutationFn: ({
        containerId,
        dto,
      }: {
        containerId: string;
        dto: AssignCargoToContainerDto;
      }) => jobService.assignCargoToContainer(jobId, containerId, dto),
      onSuccess: refresh,
    }),
    splitContainer: useMutation({
      mutationFn: ({
        containerId,
        dto,
      }: {
        containerId: string;
        dto: SplitContainerDto;
      }) => jobService.splitContainer(jobId, containerId, dto),
      onSuccess: refresh,
    }),
    createCargo: useMutation({
      mutationFn: (dto: CreateJobCargoDto) => jobService.createCargo(jobId, dto),
      onSuccess: refresh,
    }),
    updateCargo: useMutation({
      mutationFn: ({ cargoId, dto }: { cargoId: string; dto: UpdateJobCargoDto }) =>
        jobService.updateCargo(jobId, cargoId, dto),
      onSuccess: refresh,
    }),
    deleteCargo: useMutation({
      mutationFn: (cargoId: string) => jobService.deleteCargo(jobId, cargoId),
      onSuccess: refresh,
    }),
    createBl: useMutation({
      mutationFn: (dto: CreateBillOfLadingDto) => jobService.createBillOfLading(jobId, dto),
      onSuccess: refresh,
    }),
    updateBl: useMutation({
      mutationFn: ({ blId, dto }: { blId: string; dto: UpdateBillOfLadingDto }) =>
        jobService.updateBillOfLading(jobId, blId, dto),
      onSuccess: refresh,
    }),
    deleteBl: useMutation({
      mutationFn: (blId: string) => jobService.deleteBillOfLading(jobId, blId),
      onSuccess: refresh,
    }),
    createStuffing: useMutation({
      mutationFn: (dto: CreateStuffingRecordDto) =>
        jobService.createStuffingRecord(jobId, dto),
      onSuccess: refresh,
    }),
    updateStuffing: useMutation({
      mutationFn: ({
        recordId,
        dto,
      }: {
        recordId: string;
        dto: UpdateStuffingRecordDto;
      }) => jobService.updateStuffingRecord(jobId, recordId, dto),
      onSuccess: refresh,
    }),
    deleteStuffing: useMutation({
      mutationFn: (recordId: string) => jobService.deleteStuffingRecord(jobId, recordId),
      onSuccess: refresh,
    }),
    createDocument: useMutation({
      mutationFn: (dto: CreateJobDocumentDto) => jobService.createDocument(jobId, dto),
      onSuccess: refresh,
    }),
    updateDocument: useMutation({
      mutationFn: ({
        documentId,
        dto,
      }: {
        documentId: string;
        dto: UpdateJobDocumentDto;
      }) => jobService.updateDocument(jobId, documentId, dto),
      onSuccess: refresh,
    }),
    deleteDocument: useMutation({
      mutationFn: (documentId: string) => jobService.deleteDocument(jobId, documentId),
      onSuccess: refresh,
    }),
    finalizeDocument: useMutation({
      mutationFn: (documentId: string) => jobService.finalizeDocument(jobId, documentId),
      onSuccess: refresh,
    }),
  };
}
