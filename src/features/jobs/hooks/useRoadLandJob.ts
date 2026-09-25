import { useMutation } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type {
  AssignLandTruckerDto,
  AssignRoadFreightTruckerDto,
  CreateLandPodDto,
  CreateRoadFreightPodDto,
  RecordLandBorderCrossingDto,
  RecordLandPickupDto,
  RecordRoadFreightBorderCrossingDto,
  RecordRoadFreightPickupDto,
  UpdateLandJobDetailDto,
  UpdateRoadFreightJobDetailDto,
} from '../types/job.types';
import { useInvalidateJobs } from './useJobs';

import { isRoadOrLandJobType as isRoadOrLandJobTypeBase } from '../constants/job.constants';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';

export type RoadLandMode = 'ROAD_FREIGHT' | 'LAND';

export function isRoadOrLandJobType(jobType?: string | null): jobType is RoadLandMode {
  const t = canonicalizeJobType(jobType ?? '', 'AIR_EXPORT');
  return isRoadOrLandJobTypeBase(t);
}

/** Lifecycle mutations for ROAD_FREIGHT (or LAND parity). */
export function useRoadLandJobActions(jobId: string, mode: RoadLandMode) {
  const invalidate = useInvalidateJobs();
  const refresh = () => invalidate(jobId);
  const isRoad = mode === 'ROAD_FREIGHT';

  return {
    updateDetails: useMutation({
      mutationFn: (dto: UpdateRoadFreightJobDetailDto | UpdateLandJobDetailDto) =>
        isRoad
          ? jobService.updateRoadFreightDetails(jobId, dto)
          : jobService.updateLandDetails(jobId, dto),
      onSuccess: refresh,
    }),
    assignTrucker: useMutation({
      mutationFn: (dto: AssignRoadFreightTruckerDto | AssignLandTruckerDto) =>
        isRoad
          ? jobService.assignRoadFreightTrucker(jobId, dto as AssignRoadFreightTruckerDto)
          : jobService.assignLandTrucker(jobId, dto),
      onSuccess: refresh,
    }),
    pickup: useMutation({
      mutationFn: (dto?: RecordRoadFreightPickupDto | RecordLandPickupDto) =>
        isRoad
          ? jobService.recordRoadFreightPickup(jobId, dto)
          : jobService.recordLandPickup(jobId, dto),
      onSuccess: refresh,
    }),
    borderCrossing: useMutation({
      mutationFn: (dto: RecordRoadFreightBorderCrossingDto | RecordLandBorderCrossingDto) =>
        isRoad
          ? jobService.recordRoadFreightBorderCrossing(jobId, dto)
          : jobService.recordLandBorderCrossing(jobId, dto),
      onSuccess: refresh,
    }),
    crossBorder: useMutation({
      mutationFn: (dto: UpdateRoadFreightJobDetailDto | UpdateLandJobDetailDto) =>
        isRoad
          ? jobService.upsertRoadFreightCrossBorder(jobId, dto)
          : jobService.upsertLandCrossBorder(jobId, dto),
      onSuccess: refresh,
    }),
    pod: useMutation({
      mutationFn: (dto: CreateRoadFreightPodDto | CreateLandPodDto) =>
        isRoad
          ? jobService.createRoadFreightPod(jobId, dto)
          : jobService.createLandPod(jobId, dto),
      onSuccess: refresh,
    }),
  };
}
