import type { Job, ModeBookingForm, StaffBookingFormMode, WhStockLineInputDto } from '../types/job.types';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import { staffBookingFormModeFromJob } from '../hooks/useStaffBookingForm';

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
  const hasRoute = Boolean(
    String(r.pol ?? '').trim() ||
      String(r.pod ?? '').trim() ||
      String(r.warehouse_name ?? '').trim() ||
      String(r.warehouse_id ?? '').trim(),
  );
  const hasCommodity = Boolean(String(r.commodity ?? '').trim());
  const hasBookingNo = Boolean(String(r.client_booking_no ?? '').trim());
  const hasWeight = r.gross_weight_kg != null && Number(r.gross_weight_kg) > 0;
  const stockLines = Array.isArray(r.stock_lines) ? r.stock_lines : [];
  const hasStock = stockLines.some(
    (line) =>
      line &&
      typeof line === 'object' &&
      (String((line as WhStockLineInputDto).sku_code ?? '').trim() ||
        Number((line as WhStockLineInputDto).quantity) > 0),
  );
  return !(hasParty || hasRoute || hasCommodity || hasBookingNo || hasWeight || hasStock);
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

  const stock_lines: WhStockLineInputDto[] = (payload.stock_lines ?? [])
    .filter(
      (line) =>
        line &&
        (String(line.sku_code ?? '').trim() ||
          String(line.description ?? '').trim() ||
          Number(line.quantity) > 0),
    )
    .map((line) => ({
      sku_code: line.sku_code?.trim() || undefined,
      description: line.description?.trim() || undefined,
      quantity: line.quantity,
      unit: line.unit?.trim() || undefined,
      cbm: line.cbm,
    }));

  const warehouseName =
    payload.warehouse_name?.trim() || payload.pod?.trim() || undefined;
  const pickupOrigin =
    payload.origin_door_address?.trim() || payload.pol?.trim() || undefined;

  const dto: ModeBookingForm = {
    date_of_request: payload.date_of_request?.slice(0, 10) || undefined,
    client_booking_no: payload.client_booking_no?.trim() || undefined,
    voyage_ref: payload.voyage_ref?.trim() || undefined,
    service_scope: payload.service_scope || undefined,
    origin_door_address: pickupOrigin,
    dest_door_address: payload.dest_door_address?.trim() || warehouseName,
    commodity: payload.commodity?.trim() || undefined,
    hs_code: payload.hs_code?.trim() || undefined,
    cargo_category: payload.cargo_category?.trim() || undefined,
    is_dg: Boolean(payload.is_dg),
    dg_class: payload.dg_class?.trim() || undefined,
    gross_weight_kg: payload.gross_weight_kg,
    net_weight_kg: payload.net_weight_kg,
    volume_cbm: payload.volume_cbm,
    pieces: payload.pieces,
    insurance_details: payload.insurance_details?.trim() || undefined,
    request_details: payload.request_details?.trim() || undefined,
    attach_commercial_invoice: Boolean(payload.attach_commercial_invoice),
    attach_packing_list: Boolean(payload.attach_packing_list),
    attach_bl_awb_copy: Boolean(payload.attach_bl_awb_copy),
    attach_carnet: Boolean(payload.attach_carnet),
    attach_vehicle_title: Boolean(payload.attach_vehicle_title),
    attach_msds: Boolean(payload.attach_msds),
    attach_dangerous_goods_declaration: Boolean(
      payload.attach_dangerous_goods_declaration,
    ),
    attach_health_veterinary: Boolean(payload.attach_health_veterinary),
    attach_fda_moh: Boolean(payload.attach_fda_moh),
    warehouse_id: payload.warehouse_id?.trim() || undefined,
    warehouse_name: warehouseName,
    expected_inbound_at: payload.expected_inbound_at || undefined,
    expected_outbound_at: payload.expected_outbound_at || undefined,
    storage_days_requested: payload.storage_days_requested,
    bonded: payload.bonded === true,
    temperature_controlled: payload.temperature_controlled === true,
    handling_instructions: payload.handling_instructions?.trim() || undefined,
    freight_job_id: payload.freight_job_id?.trim() || undefined,
    // Staff Ops still reviews — do not mark the job form complete from the portal alone.
    mark_complete: false,
    consent_accepted: Boolean(payload.consent_accepted),
  };

  if (parties.length) dto.parties = parties;
  if (containers.length) dto.containers = containers;
  if (stock_lines.length) dto.stock_lines = stock_lines;

  // Sea modes only: keep pol/pod from portal. Warehouse has no pol/pod on staff DTO.
  const jt = String(payload.jobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (jt !== 'WAREHOUSE') {
    if (payload.pol?.trim()) dto.pol = payload.pol.trim();
    if (payload.pod?.trim()) dto.pod = payload.pod.trim();
    dto.shipper_owned_container = Boolean(payload.shipper_owned_container);
    dto.teu_count = payload.teu_count;
  }

  // Land / road / courier: map POL/POD text into city/country fields when present.
  if (jt !== 'WAREHOUSE') {
    const originCity = payload.origin_door_address?.trim() || payload.pol?.trim();
    const destCity = payload.dest_door_address?.trim() || payload.pod?.trim();
    if (originCity) dto.origin_city_country = originCity;
    if (destCity) dto.dest_city_country = destCity;
  }

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

  const mode = staffBookingFormModeFromJob({
    job_type: String(jobType ?? '') as Job['job_type'],
  });
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
    case 'WAREHOUSE':
      return jobService.getWarehouseBookingForm(jobId);
    case 'CUSTOMS_CLEARANCE':
      return jobService.getCustomsClearanceBookingForm(jobId);
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
    case 'WAREHOUSE':
      return jobService.putWarehouseBookingForm(jobId, dto);
    case 'CUSTOMS_CLEARANCE':
      return jobService.putCustomsClearanceBookingForm(jobId, dto);
  }
}
