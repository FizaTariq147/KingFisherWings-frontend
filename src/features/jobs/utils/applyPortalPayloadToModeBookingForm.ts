import type { ModeBookingForm } from '../types/job.types';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import { staffBookingFormModeFromJob } from '../hooks/useStaffBookingForm';
import type { StaffBookingFormMode } from '../types/job.types';

/** True when the job booking-form API has no meaningful customer data yet. */
export function modeBookingFormIsEmpty(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return true;
  const r = raw as Record<string, unknown>;
  const parties = Array.isArray(r.parties) ? r.parties : [];
  const hasParty = parties.some(
    (p) =>
      p &&
      typeof p === 'object' &&
      String((p as { full_name?: string }).full_name ?? '').trim(),
  );
  const hasRoute = Boolean(String(r.pol ?? '').trim() || String(r.pod ?? '').trim());
  const hasCommodity = Boolean(String(r.commodity ?? '').trim());
  const hasBookingNo = Boolean(String(r.client_booking_no ?? '').trim());
  const hasWeight = r.gross_weight_kg != null && Number(r.gross_weight_kg) > 0;
  return !(hasParty || hasRoute || hasCommodity || hasBookingNo || hasWeight);
}

/**
 * Map customer portal booking-form payload → staff ModeBookingForm DTO.
 * Source of truth is the customer submission (inbox message / draft) — never hardcoded demo values.
 */
export function portalPayloadToModeBookingFormDto(
  payload: PortalBookingFormMessagePayload,
): ModeBookingForm {
  const parties = (payload.parties ?? [])
    .filter((p) => p && (p.full_name?.trim() || p.address?.trim() || p.city?.trim()))
    .map((p) => ({
      party_kind: p.party_kind,
      full_name: p.full_name?.trim() || undefined,
      address: p.address?.trim() || undefined,
      city: p.city?.trim() || undefined,
      country: p.country?.trim() || undefined,
      entity_kind: p.entity_kind,
      other_details: p.other_details?.trim() || undefined,
    }));

  const containers = (payload.containers ?? [])
    .filter((c) => c && (c.count ?? 0) >= 1)
    .map((c) => ({
      container_type_id: c.container_type_id || undefined,
      iso_size: c.iso_size || undefined,
      count: c.count,
    }));

  const dto: ModeBookingForm = {
    date_of_request: payload.date_of_request?.slice(0, 10) || undefined,
    client_booking_no: payload.client_booking_no?.trim() || undefined,
    voyage_ref: payload.voyage_ref?.trim() || undefined,
    service_scope: payload.service_scope || undefined,
    origin_door_address: payload.origin_door_address?.trim() || undefined,
    dest_door_address: payload.dest_door_address?.trim() || undefined,
    commodity: payload.commodity?.trim() || undefined,
    hs_code: payload.hs_code?.trim() || undefined,
    is_dg: Boolean(payload.is_dg),
    gross_weight_kg: payload.gross_weight_kg,
    net_weight_kg: payload.net_weight_kg,
    volume_cbm: payload.volume_cbm,
    pieces: payload.pieces,
    insurance_details: payload.insurance_details?.trim() || undefined,
    request_details: payload.request_details?.trim() || undefined,
    attach_commercial_invoice: Boolean(payload.attach_commercial_invoice),
    pol: payload.pol?.trim() || undefined,
    pod: payload.pod?.trim() || undefined,
    shipper_owned_container: Boolean(payload.shipper_owned_container),
    teu_count: payload.teu_count,
    // Staff Ops still reviews — do not mark the job form complete from the portal alone.
    mark_complete: false,
    consent_accepted: Boolean(payload.consent_accepted),
  };

  if (parties.length) dto.parties = parties;
  if (containers.length) dto.containers = containers;

  // Land / road / courier: map POL/POD text into city/country fields when present.
  const originCity = payload.origin_door_address?.trim() || payload.pol?.trim();
  const destCity = payload.dest_door_address?.trim() || payload.pod?.trim();
  if (originCity) dto.origin_city_country = originCity;
  if (destCity) dto.dest_city_country = destCity;

  return dto;
}

/**
 * After quote→job convert, push the customer portal booking form onto the job
 * booking-form API so admin GET returns the same fields (no hardcoding).
 */
export async function syncCustomerPortalBookingFormOntoJob(opts: {
  jobId: string;
  jobType?: string | null;
  quotationId: string;
  quoteNumber?: string | null;
}): Promise<{ synced: boolean; mode?: StaffBookingFormMode }> {
  const { jobId, jobType, quotationId, quoteNumber } = opts;
  if (!jobId || !quotationId) return { synced: false };

  const mode = staffBookingFormModeFromJob({ job_type: String(jobType ?? '') });
  if (!mode) return { synced: false };

  const { jobService } = await import('../services/job.service');
  const { portalAdminInboxService } = await import(
    '@/features/portal-admin-inbox/services/portalAdminInbox.service'
  );
  const { readPortalBookingFormDraft } = await import(
    '@/features/portal-quotations/utils/portalBookingFormStorage'
  );

  let payload = await portalAdminInboxService.findCustomerPortalBookingForm({
    jobId,
    quotationId,
    quoteNumber: quoteNumber || undefined,
    jobTypePrefix: String(jobType ?? '')
      .toUpperCase()
      .split('_')[0],
  });

  if (!payload?.mark_complete) {
    const draft = readPortalBookingFormDraft(quotationId);
    if (draft?.mark_complete) {
      payload = {
        v: 2,
        quotationId,
        quoteNumber: quoteNumber || undefined,
        jobType: jobType || undefined,
        jobId,
        submittedAt: new Date().toISOString(),
        ...draft,
        mark_complete: true,
      };
    }
  }

  if (!payload) return { synced: false };

  // Skip overwrite if Ops already saved meaningful data on the job form.
  const existing = await getModeBookingForm(mode, jobId, jobService);
  if (!modeBookingFormIsEmpty(existing)) {
    return { synced: false, mode };
  }

  const dto = portalPayloadToModeBookingFormDto(payload);
  await putModeBookingForm(mode, jobId, dto, jobService);
  return { synced: true, mode };
}

async function getModeBookingForm(
  mode: StaffBookingFormMode,
  jobId: string,
  jobService: typeof import('../services/job.service').jobService,
) {
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
  }
}

async function putModeBookingForm(
  mode: StaffBookingFormMode,
  jobId: string,
  dto: ModeBookingForm,
  jobService: typeof import('../services/job.service').jobService,
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
  }
}
