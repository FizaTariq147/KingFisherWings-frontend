import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import {
  staffBookingFormModeToApiMode,
  type ModeBookingFormDocumentKind,
} from '@/features/booking-documents/constants/bookingDocumentKinds';
import { jobService } from '@/features/jobs/services/job.service';
import type { ModeBookingForm, StaffBookingFormMode } from '@/features/jobs/types/job.types';
import { resolveBookingFormPayloadRecord } from '@/features/portal-quotations/utils/normalizePortalQuotations';
import { quotationService } from '../services/quotation.service';
import { quotationKeys } from './useQuotations';

export const quotationBookingFormKeys = {
  form: (quotationId: string) =>
    [...quotationKeys.detail(quotationId), 'booking-form'] as const,
};

/** Normalize GET/PUT /quotations/:id/booking-form into ModeBookingForm shape. */
export function quotationBookingFormToMode(raw: unknown): ModeBookingForm {
  const data = resolveBookingFormPayloadRecord(raw);
  const linkedJobId = pickJobIdFromQuotationBookingForm(raw);
  const statusToken = String(
    data.status ?? data.form_status ?? data.formStatus ?? data.state ?? '',
  )
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const markComplete =
    data.mark_complete === true ||
    data.markComplete === true ||
    data.completed === true ||
    data.is_complete === true ||
    data.isComplete === true ||
    statusToken === 'COMPLETED' ||
    statusToken === 'COMPLETE' ||
    statusToken === 'BOOKING_FORM_COMPLETE' ||
    statusToken.includes('COMPLETE');
  return {
    ...(data as ModeBookingForm),
    // Keep envelope job / provisional_job ids so BL draft + View Job can resolve them.
    ...(linkedJobId
      ? {
          job_id: linkedJobId,
          provisional_job_id:
            String(data.provisional_job_id ?? data.provisionalJobId ?? '').trim() ||
            linkedJobId,
        }
      : {}),
    mark_complete: markComplete || Boolean((data as ModeBookingForm).mark_complete),
    consent_accepted:
      data.consent_accepted === true ||
      data.consentAccepted === true ||
      Boolean((data as ModeBookingForm).consent_accepted),
  };
}

export function pickJobIdFromQuotationBookingForm(raw: unknown): string | undefined {
  const r = resolveBookingFormPayloadRecord(raw);
  for (const key of [
    'converted_job_id',
    'convertedJobId',
    'job_id',
    'jobId',
    'provisional_job_id',
    'provisionalJobId',
  ]) {
    const v = String(r[key] ?? '').trim();
    if (isUuid(v)) return v;
  }
  const nested =
    r.job && typeof r.job === 'object' && !Array.isArray(r.job)
      ? (r.job as Record<string, unknown>)
      : r.converted_job && typeof r.converted_job === 'object' && !Array.isArray(r.converted_job)
        ? (r.converted_job as Record<string, unknown>)
        : null;
  const nestedId = String(nested?.id ?? '').trim();
  return isUuid(nestedId) ? nestedId : undefined;
}

/**
 * Staff quotation booking form — GET /quotations/:id/booking-form
 * (OpenAPI: job-scoped; creates provisional job if needed).
 */
export function useQuotationBookingForm(quotationId: string, enabled = true) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: quotationBookingFormKeys.form(quotationId),
    queryFn: async () => {
      const raw = await quotationService.getBookingForm(quotationId);
      const jobId = pickJobIdFromQuotationBookingForm(raw);
      if (jobId) {
        void queryClient.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) });
        void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      }
      return quotationBookingFormToMode(raw);
    },
    enabled: Boolean(token) && isUuid(quotationId) && enabled,
    retry: false,
  });
}

/**
 * Prefer staff POST /quotations/:id/booking-form/documents/:kind (creates provisional job).
 * Fall back to job-scoped upload when quotation route is unavailable.
 */
async function uploadQuotationBookingDocument(
  quotationId: string,
  mode: StaffBookingFormMode,
  kind: ModeBookingFormDocumentKind,
  file: File,
): Promise<unknown> {
  try {
    return await quotationService.uploadBookingFormDocument(quotationId, kind, file);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/404|cannot post|not found|not implemented/i.test(msg)) throw err;
  }
  const raw = await quotationService.getBookingForm(quotationId);
  let jobId = pickJobIdFromQuotationBookingForm(raw);
  if (!jobId) {
    const q = await quotationService.getById(quotationId);
    if (q.job_id && isUuid(q.job_id)) jobId = q.job_id;
  }
  if (!jobId) {
    throw new Error(
      'Booking document upload needs job_id / provisional_job_id from GET /quotations/:id/booking-form, or POST /quotations/:id/booking-form/documents/:kind.',
    );
  }
  return jobService.uploadBookingFormDocument(
    jobId,
    staffBookingFormModeToApiMode(mode),
    kind,
    file,
  );
}

export function useQuotationBookingFormActions(
  quotationId: string,
  mode: StaffBookingFormMode,
) {
  const queryClient = useQueryClient();
  const key = quotationBookingFormKeys.form(quotationId);
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: key });
    void queryClient.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) });
    void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
  };

  return {
    save: useMutation({
      mutationFn: async (dto: ModeBookingForm) => {
        const raw = await quotationService.upsertBookingForm(
          quotationId,
          dto as Record<string, unknown>,
        );
        return quotationBookingFormToMode(raw);
      },
      onSuccess: (saved) => {
        queryClient.setQueryData(key, (prev: ModeBookingForm | undefined) => {
          const next: ModeBookingForm = { ...(prev ?? {}), ...saved };
          if ('mark_complete' in saved) {
            next.mark_complete = saved.mark_complete === true;
          } else if (prev?.mark_complete === true) {
            next.mark_complete = true;
          }
          return next;
        });
        refresh();
      },
    }),
    clear: useMutation({
      mutationFn: async (dto: ModeBookingForm) => {
        const raw = await quotationService.upsertBookingForm(
          quotationId,
          dto as Record<string, unknown>,
        );
        return quotationBookingFormToMode(raw);
      },
      onSuccess: (saved) => {
        queryClient.setQueryData(key, {
          ...saved,
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
          status: 'DRAFT',
        });
        refresh();
      },
    }),
    uploadDocument: useMutation({
      mutationFn: async ({
        kind,
        file,
      }: {
        kind: ModeBookingFormDocumentKind;
        file: File;
      }) => uploadQuotationBookingDocument(quotationId, mode, kind, file),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: key });
        void queryClient.invalidateQueries({ queryKey: quotationKeys.detail(quotationId) });
        void queryClient.invalidateQueries({ queryKey: quotationKeys.all });
      },
    }),
    complete: useMutation({
      mutationFn: async () => {
        await quotationService.completeBookingForm(quotationId);
        return { completed: true as const };
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: key });
        queryClient.setQueryData(key, (prev: ModeBookingForm | undefined) => ({
          ...(prev ?? {}),
          mark_complete: true,
          consent_accepted: prev?.consent_accepted !== false,
          status: 'COMPLETED',
        }));
        refresh();
      },
    }),
  };
}
