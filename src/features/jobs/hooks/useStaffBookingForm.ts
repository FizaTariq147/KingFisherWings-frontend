import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { jobService } from '../services/job.service';
import type { Job, ModeBookingForm, StaffBookingFormMode } from '../types/job.types';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';
import { jobKeys, useInvalidateJobs } from './useJobs';

/**
 * Staff mode booking forms under
 * /jobs/:id/{sea-fcl|sea-lcl|land|road-freight|courier|warehouse|customs-clearance}/booking-form.
 * (Air uses /air-booking-form + /air/compliance-form; NVOCC uses /nvocc/bookings/:id/booking-form.)
 */
export function staffBookingFormModeFromJob(
  job: Pick<Job, 'job_type'>,
): StaffBookingFormMode | null {
  const t = canonicalizeJobType(job.job_type);
  if (t === 'SEA_FCL_EXPORT' || t === 'SEA_FCL_IMPORT') return 'SEA_FCL';
  if (t === 'SEA_LCL_EXPORT' || t === 'SEA_LCL_IMPORT') return 'SEA_LCL';
  if (t === 'LAND') return 'LAND';
  if (t === 'ROAD_FREIGHT') return 'ROAD_FREIGHT';
  if (t === 'COURIER') return 'COURIER';
  if (t === 'WAREHOUSE') return 'WAREHOUSE';
  if (t === 'CUSTOMS_CLEARANCE') return 'CUSTOMS_CLEARANCE';
  return null;
}

/** True when Ops should open on the staff mode booking-form panel after quote → job. */
export function jobHasStaffModeBookingForm(jobType?: string | null): boolean {
  return staffBookingFormModeFromJob({ job_type: canonicalizeJobType(jobType ?? '') }) != null;
}

/** Open Ops tab after convert when the job has booking / compliance forms to fill. */
export function jobShouldOpenOpsTab(jobType?: string | null): boolean {
  const t = canonicalizeJobType(jobType ?? '');
  if (jobHasStaffModeBookingForm(t)) return true;
  if (t === 'AIR_EXPORT' || t === 'AIR_IMPORT') return true;
  if (t === 'ROAD_FREIGHT' || t === 'LAND' || t === 'WAREHOUSE' || t === 'CUSTOMS_CLEARANCE') {
    return true;
  }
  return false;
}

export function staffBookingFormApiLabel(mode: StaffBookingFormMode): string {
  switch (mode) {
    case 'SEA_FCL':
      return '/jobs/:id/sea-fcl/booking-form';
    case 'SEA_LCL':
      return '/jobs/:id/sea-lcl/booking-form';
    case 'LAND':
      return '/jobs/:id/land/booking-form';
    case 'ROAD_FREIGHT':
      return '/jobs/:id/road-freight/booking-form';
    case 'COURIER':
      return '/jobs/:id/courier/booking-form';
    case 'WAREHOUSE':
      return '/jobs/:id/warehouse/booking-form';
    case 'CUSTOMS_CLEARANCE':
      return '/jobs/:id/customs-clearance/booking-form';
  }
}

const bookingKey = (mode: StaffBookingFormMode, jobId: string) =>
  [...jobKeys.all, 'staff-booking-form', mode, jobId] as const;

async function getBookingForm(mode: StaffBookingFormMode, jobId: string) {
  switch (mode) {
    case 'SEA_FCL':
      return jobService.getSeaFclBookingForm(jobId);
    case 'SEA_LCL':
      return jobService.getSeaLclBookingForm(jobId);
    case 'LAND':
      return jobService.getLandBookingForm(jobId);
    case 'ROAD_FREIGHT':
      return jobService.getRoadFreightBookingForm(jobId);
    case 'COURIER':
      return jobService.getCourierBookingForm(jobId);
    case 'WAREHOUSE':
      return jobService.getWarehouseBookingForm(jobId);
    case 'CUSTOMS_CLEARANCE':
      return jobService.getCustomsClearanceBookingForm(jobId);
  }
}

async function putBookingForm(
  mode: StaffBookingFormMode,
  jobId: string,
  dto: ModeBookingForm,
) {
  switch (mode) {
    case 'SEA_FCL':
      return jobService.putSeaFclBookingForm(jobId, dto);
    case 'SEA_LCL':
      return jobService.putSeaLclBookingForm(jobId, dto);
    case 'LAND':
      return jobService.putLandBookingForm(jobId, dto);
    case 'ROAD_FREIGHT':
      return jobService.putRoadFreightBookingForm(jobId, dto);
    case 'COURIER':
      return jobService.putCourierBookingForm(jobId, dto);
    case 'WAREHOUSE':
      return jobService.putWarehouseBookingForm(jobId, dto);
    case 'CUSTOMS_CLEARANCE':
      return jobService.putCustomsClearanceBookingForm(jobId, dto);
  }
}

async function completeBookingForm(mode: StaffBookingFormMode, jobId: string) {
  switch (mode) {
    case 'SEA_FCL':
      return jobService.completeSeaFclBookingForm(jobId);
    case 'SEA_LCL':
      return jobService.completeSeaLclBookingForm(jobId);
    case 'LAND':
      return jobService.completeLandBookingForm(jobId);
    case 'ROAD_FREIGHT':
      return jobService.completeRoadFreightBookingForm(jobId);
    case 'COURIER':
      return jobService.completeCourierBookingForm(jobId);
    case 'WAREHOUSE':
      return jobService.completeWarehouseBookingForm(jobId);
    case 'CUSTOMS_CLEARANCE':
      return jobService.completeCustomsClearanceBookingForm(jobId);
  }
}

/**
 * POST …/booking-form/complete, then quote→job convert when the linked quotation
 * is still APPROVED (Sea/Land/Road/Courier/Warehouse/Customs).
 */
export async function completeStaffBookingFormAndConvert(
  mode: StaffBookingFormMode,
  jobId: string,
): Promise<{ completed: boolean; converted: boolean }> {
  await completeBookingForm(mode, jobId);
  try {
    const { quotationService } = await import(
      '@/features/quotations/services/quotation.service'
    );
    const linked = await quotationService.convertAfterBookingFormComplete(jobId, {
      staffFormJustCompleted: true,
    });
    const converted = String(linked?.status ?? '').toUpperCase() === 'CONVERTED';
    return { completed: true, converted };
  } catch {
    // Complete succeeded; convert may retry from quotation detail / refresh.
    return { completed: true, converted: false };
  }
}

export function useStaffBookingForm(jobId: string, mode: StaffBookingFormMode, enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: bookingKey(mode, jobId),
    queryFn: () => getBookingForm(mode, jobId),
    enabled: Boolean(token) && isUuid(jobId) && enabled,
  });
}

export function useStaffBookingFormActions(jobId: string, mode: StaffBookingFormMode) {
  const invalidate = useInvalidateJobs();
  const queryClient = useQueryClient();
  const refresh = () => {
    invalidate(jobId);
    void queryClient.invalidateQueries({ queryKey: bookingKey(mode, jobId) });
  };

  return {
    save: useMutation({
      mutationFn: (dto: ModeBookingForm) => putBookingForm(mode, jobId, dto),
      onSuccess: refresh,
    }),
    complete: useMutation({
      mutationFn: () => completeStaffBookingFormAndConvert(mode, jobId),
      onSuccess: refresh,
    }),
  };
}
