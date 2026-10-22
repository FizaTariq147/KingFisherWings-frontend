import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import {
  staffBookingFormModeToApiMode,
  type ModeBookingFormDocumentKind,
} from '@/features/booking-documents/constants/bookingDocumentKinds';
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
 * POST …/booking-form/complete only.
 * Quote→job convert is driven by the customer portal booking-form submit
 * (OpenAPI: convert after the mode booking form is complete on the customer side).
 * Admin complete flips the job booking form Draft → Completed — it must not convert.
 */
export async function completeStaffBookingForm(
  mode: StaffBookingFormMode,
  jobId: string,
): Promise<{ completed: boolean }> {
  await completeBookingForm(mode, jobId);
  return { completed: true };
}

/** @deprecated Use completeStaffBookingForm — staff complete no longer converts. */
export async function completeStaffBookingFormAndConvert(
  mode: StaffBookingFormMode,
  jobId: string,
): Promise<{ completed: boolean; converted: boolean }> {
  await completeStaffBookingForm(mode, jobId);
  return { completed: true, converted: false };
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
  const key = bookingKey(mode, jobId);
  const refresh = () => {
    invalidate(jobId);
    void queryClient.invalidateQueries({ queryKey: key });
  };

  return {
    save: useMutation({
      mutationFn: (dto: ModeBookingForm) => putBookingForm(mode, jobId, dto),
      onSuccess: (saved) => {
        if (saved && typeof saved === 'object') {
          queryClient.setQueryData(key, (prev: ModeBookingForm | undefined) => {
            const next: ModeBookingForm = {
              ...(prev ?? {}),
              ...saved,
            };
            // Explicit mark_complete from this save wins (delete/clear must not keep Completed).
            if ('mark_complete' in saved) {
              next.mark_complete = saved.mark_complete === true;
            } else if (prev?.mark_complete === true) {
              next.mark_complete = true;
            }
            return next;
          });
        }
        refresh();
      },
    }),
    /** Clears staff booking form via PUT empty payload and replaces the cache (not merge). */
    clear: useMutation({
      mutationFn: (dto: ModeBookingForm) => putBookingForm(mode, jobId, dto),
      onSuccess: (saved) => {
        const fromApi =
          saved && typeof saved === 'object' ? (saved as ModeBookingForm) : undefined;
        const cleared: ModeBookingForm = {
          ...(fromApi ?? {}),
          mark_complete: false,
          consent_accepted: false,
          parties: [],
          containers: [],
          stock_lines: [],
          cargo_lines: [],
          commodity: '',
          client_booking_no: '',
          voyage_ref: '',
          pol: '',
          pod: '',
          warehouse_id: '',
          warehouse_name: '',
          expected_inbound_at: '',
          expected_outbound_at: '',
          handling_instructions: '',
          freight_job_id: '',
          request_details: '',
          border_or_port: '',
          invoice_value_amount: undefined,
          invoice_currency: '',
          direction: undefined,
          entry_type: '',
          declaration_type: '',
          port_of_entry: '',
          port_of_exit: '',
          country_of_origin: '',
          country_of_destination: '',
          attach_packing_list: false,
          status: 'DRAFT',
        };
        queryClient.setQueryData(key, cleared);
        refresh();
      },
    }),
    uploadDocument: useMutation({
      mutationFn: ({ kind, file }: { kind: ModeBookingFormDocumentKind; file: File }) =>
        jobService.uploadBookingFormDocument(
          jobId,
          staffBookingFormModeToApiMode(mode),
          kind,
          file,
        ),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: key });
      },
    }),
    complete: useMutation({
      mutationFn: () => completeStaffBookingForm(mode, jobId),
      onSuccess: async () => {
        invalidate(jobId);
        await queryClient.invalidateQueries({ queryKey: key });
        // GET may lag or omit mark_complete — keep UI Status = Completed after admin complete.
        queryClient.setQueryData(key, (prev: ModeBookingForm | undefined) => ({
          ...(prev ?? {}),
          mark_complete: true,
          consent_accepted: prev?.consent_accepted !== false,
          status: 'COMPLETED',
        }));
      },
    }),
  };
}
