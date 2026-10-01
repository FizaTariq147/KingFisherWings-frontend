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
      String(r.origin_airport_code ?? '').trim() ||
      String(r.dest_airport_code ?? '').trim() ||
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
  const hasCustoms = Boolean(
    String(r.border_or_port ?? '').trim() ||
      String(r.invoice_currency ?? '').trim() ||
      (r.invoice_value_amount != null && Number(r.invoice_value_amount) > 0),
  );
  return !(
    hasParty ||
    hasRoute ||
    hasCommodity ||
    hasBookingNo ||
    hasWeight ||
    hasStock ||
    hasCustoms
  );
}

/**
 * Map customer portal booking-form payload → staff ModeBookingForm DTO.
 * Source of truth is the customer submission (inbox message / draft) — never hardcoded demo values.
 */
export function portalPayloadToModeBookingFormDto(
  payload: PortalBookingFormMessagePayload,
  opts?: { jobTypeOverride?: string | null },
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

  const jt = String(opts?.jobTypeOverride ?? payload.jobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const isCustoms = jt === 'CUSTOMS_CLEARANCE' || jt.includes('CUSTOMS');
  const isWarehouse = jt === 'WAREHOUSE';
  const isLandish =
    jt === 'LAND' || jt === 'ROAD_FREIGHT' || jt === 'COURIER' || jt.startsWith('ROAD');
  const isSea =
    jt.includes('SEA') || jt.includes('FCL') || jt.includes('LCL') || jt.includes('NVOCC');

  const dto: ModeBookingForm = {
    date_of_request: payload.date_of_request?.slice(0, 10) || undefined,
    client_booking_no: payload.client_booking_no?.trim() || undefined,
    voyage_ref: payload.voyage_ref?.trim() || undefined,
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
    // Staff Ops still reviews — do not mark the job form complete from the portal alone.
    mark_complete: false,
    consent_accepted: Boolean(payload.consent_accepted),
  };

  if (isWarehouse) {
    dto.warehouse_id = payload.warehouse_id?.trim() || undefined;
    dto.warehouse_name = warehouseName;
    dto.expected_inbound_at = payload.expected_inbound_at || undefined;
    dto.expected_outbound_at = payload.expected_outbound_at || undefined;
    dto.storage_days_requested = payload.storage_days_requested;
    dto.bonded = payload.bonded === true;
    dto.temperature_controlled = payload.temperature_controlled === true;
    dto.handling_instructions = payload.handling_instructions?.trim() || undefined;
    dto.freight_job_id = payload.freight_job_id?.trim() || undefined;
    dto.dest_door_address = payload.dest_door_address?.trim() || warehouseName;
  } else {
    dto.service_scope = payload.service_scope || undefined;
  }

  // Customs-only fields — never send on sea/land/warehouse booking DTOs.
  if (isCustoms) {
    dto.attach_coo = Boolean(payload.attach_coo);
    dto.attach_poa = Boolean(payload.attach_poa);
    dto.attach_permit = Boolean(payload.attach_permit);
    dto.direction = payload.direction?.trim() || undefined;
    dto.border_or_port = payload.border_or_port?.trim() || undefined;
    dto.entry_type = payload.entry_type?.trim() || undefined;
    dto.declaration_type = payload.declaration_type?.trim() || undefined;
    dto.port_of_entry = payload.port_of_entry?.trim() || undefined;
    dto.port_of_exit = payload.port_of_exit?.trim() || undefined;
    dto.country_of_origin = payload.country_of_origin?.trim() || undefined;
    dto.country_of_destination = payload.country_of_destination?.trim() || undefined;
    dto.incoterms = payload.incoterms?.trim() || undefined;
    dto.invoice_value_amount = payload.invoice_value_amount;
    dto.invoice_currency = payload.invoice_currency?.trim() || undefined;
  }

  if (parties.length) dto.parties = parties;

  // Mode-aware mapping — only attach fields the staff Upsert* DTO accepts.
  if (isWarehouse) {
    if (stock_lines.length) dto.stock_lines = stock_lines;
  } else if (isCustoms) {
    const cargo_lines = (payload.cargo_lines ?? [])
      .filter(
        (line) =>
          line &&
          (String(line.description ?? '').trim() ||
            String(line.hs_code ?? '').trim() ||
            Number(line.quantity) > 0 ||
            Number(line.value_amount) > 0),
      )
      .map((line) => ({
        description: line.description?.trim() || undefined,
        hs_code: line.hs_code?.trim() || undefined,
        country_of_origin: line.country_of_origin?.trim() || undefined,
        quantity: line.quantity,
        unit: line.unit?.trim() || undefined,
        value_amount: line.value_amount,
        currency_code: line.currency_code?.trim() || undefined,
      }));
    if (cargo_lines.length) dto.cargo_lines = cargo_lines;
  } else {
    if (containers.length) dto.containers = containers;
    if (isSea || !isLandish) {
      if (payload.pol?.trim()) dto.pol = payload.pol.trim();
      if (payload.pod?.trim()) dto.pod = payload.pod.trim();
      dto.shipper_owned_container = Boolean(payload.shipper_owned_container);
      dto.teu_count = payload.teu_count;
      if (payload.etd) dto.etd = payload.etd;
      if (payload.eta) dto.eta = payload.eta;
      if (payload.incoterms?.trim()) dto.incoterms = payload.incoterms.trim();
      if (payload.freight_terms?.trim()) dto.freight_terms = payload.freight_terms.trim();
      if (jt.includes('LCL') && payload.cfs_warehouse?.trim()) {
        dto.cfs_warehouse = payload.cfs_warehouse.trim();
      }
    }
    if (isLandish || (!isSea && !isCustoms)) {
      const originCity =
        payload.origin_city_country?.trim() ||
        payload.origin_door_address?.trim() ||
        payload.pol?.trim();
      const destCity =
        payload.dest_city_country?.trim() ||
        payload.dest_door_address?.trim() ||
        payload.pod?.trim();
      if (originCity) dto.origin_city_country = originCity;
      if (destCity) dto.dest_city_country = destCity;
      if (payload.vehicle_type?.trim()) dto.vehicle_type = payload.vehicle_type.trim();
      if (payload.incoterms?.trim()) dto.incoterms = payload.incoterms.trim();
      if (payload.etd) dto.etd = payload.etd;
      if (payload.eta) dto.eta = payload.eta;
      if (jt === 'ROAD_FREIGHT' || jt.startsWith('ROAD')) {
        if (payload.border_crossing?.trim()) {
          dto.border_crossing = payload.border_crossing.trim();
        }
      }
      if (jt === 'COURIER' || jt.startsWith('COURIER')) {
        if (payload.tracking_number?.trim()) {
          dto.tracking_number = payload.tracking_number.trim();
        }
      }
    }
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

  // Skip overwrite if Ops already saved meaningful data — never downgrade a completed form.
  const existing = await getModeBookingForm(mode, jobId, jobService);
  if (existing?.mark_complete === true) {
    return { synced: false, mode };
  }
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
