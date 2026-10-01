import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import { partyService } from '@/features/parties/services/party.service';
import type { Quotation } from '@/features/quotations/types/quotation.types';
import type { NvoccBookingFormState } from '../schemas/nvocc.schema';
import type { UpdateNvoccBookingFormDto, NvoccBookingFormParty } from '../types/nvocc.types';
import { API_ENUMS } from '@/lib/api/apiSchema.generated';

const NVOCC_SERVICE_SCOPES = API_ENUMS.UpsertNvoccBookingFormDto.service_scope;

export function emptyNvoccCreateBookingForm(): NvoccBookingFormState {
  return {
    voyage_id: '',
    enquiry_id: '',
    shipper_id: '',
    consignee_id: '',
    cargo_type: 'FCL',
    container_type_id: '',
    container_count: '',
    cbm_allocated: '',
    gross_weight: '',
    pieces: '',
    commodity: '',
    hs_code: '',
    shipper_ref: '',
    incoterms: '',
    freight_terms: '',
    job_type: '',
    is_dg: false,
    apply_tariff: true,
  };
}

function partyFromPayload(kind: 'SHIPPER' | 'CONSIGNEE' | 'NOTIFY', payload: PortalBookingFormMessagePayload) {
  const p = payload.parties?.find((x) => x.party_kind === kind);
  if (!p?.full_name?.trim()) return undefined;
  return p;
}

async function resolvePartyIdByName(name?: string): Promise<string | undefined> {
  const n = name?.trim();
  if (!n) return undefined;
  try {
    const res = await partyService.list({ search: n, limit: 25, order: 'asc' });
    const lower = n.toLowerCase();
    const exact = res.parties.find((p) => p.name.trim().toLowerCase() === lower);
    if (exact) return exact.id;
    const partial = res.parties.find((p) => p.name.trim().toLowerCase().includes(lower));
    return partial?.id;
  } catch {
    return undefined;
  }
}

function containerCountFromPortal(payload: PortalBookingFormMessagePayload): string {
  if (payload.teu_count != null && Number.isFinite(payload.teu_count)) {
    return String(Math.max(1, Math.round(payload.teu_count)));
  }
  const sum = (payload.containers ?? []).reduce((acc, c) => acc + (c.count ?? 0), 0);
  if (sum >= 1) return String(sum);
  return '';
}

/** Map customer portal + quotation → POST /nvocc/bookings body (string form). */
export function mergeQuotationAndPortalIntoCreateForm(
  base: NvoccBookingFormState,
  opts: {
    quotation?: Quotation | null;
    portal?: PortalBookingFormMessagePayload | null;
    shipperId?: string;
    consigneeId?: string;
  },
): NvoccBookingFormState {
  const q = opts.quotation;
  const portal = opts.portal;
  const next = { ...base };

  if (q?.customer_id) next.shipper_id = next.shipper_id || q.customer_id;
  if (opts.shipperId) next.shipper_id = opts.shipperId;
  if (opts.consigneeId) next.consignee_id = opts.consigneeId;

  if (q?.job_type) next.job_type = q.job_type;
  if (q?.commodity?.trim()) next.commodity = next.commodity || q.commodity.trim();
  if (q?.hs_code?.trim()) next.hs_code = next.hs_code || q.hs_code.trim();
  if (q?.incoterms?.trim()) next.incoterms = next.incoterms || q.incoterms.trim();

  if (portal) {
    if (portal.commodity?.trim()) next.commodity = portal.commodity.trim();
    if (portal.hs_code?.trim()) next.hs_code = portal.hs_code.trim();
    if (portal.gross_weight_kg != null) next.gross_weight = String(portal.gross_weight_kg);
    if (portal.pieces != null) next.pieces = String(portal.pieces);
    if (portal.volume_cbm != null) next.cbm_allocated = String(portal.volume_cbm);
    next.is_dg = Boolean(portal.is_dg);
    const cc = containerCountFromPortal(portal);
    if (cc) next.container_count = cc;
    const ref =
      portal.client_booking_no?.trim() ||
      portal.sq_bl_booking_reference?.trim() ||
      portal.quoteNumber?.trim();
    if (ref) next.shipper_ref = ref;
    const firstContainer = portal.containers?.[0];
    if (firstContainer?.container_type_id) {
      next.container_type_id = firstContainer.container_type_id;
    }
    if (portal.jobType?.trim()) next.job_type = portal.jobType.trim();
  }

  return next;
}

export async function resolvePartyIdsFromPortal(
  portal: PortalBookingFormMessagePayload,
): Promise<{ shipperId?: string; consigneeId?: string }> {
  const shipper = partyFromPayload('SHIPPER', portal);
  const consignee = partyFromPayload('CONSIGNEE', portal);
  const [shipperId, consigneeId] = await Promise.all([
    resolvePartyIdByName(shipper?.full_name),
    resolvePartyIdByName(consignee?.full_name),
  ]);
  return { shipperId, consigneeId };
}

/** Build UpsertNvoccBookingFormDto for staff API after booking is created (no mark complete). */
export function portalPayloadToNvoccBookingFormDto(
  payload: PortalBookingFormMessagePayload,
  opts?: { defaultAgentLine?: string; quoteNumber?: string },
): UpdateNvoccBookingFormDto | null {
  const pol = payload.pol?.trim();
  const pod = payload.pod?.trim();
  const commodity = payload.commodity?.trim();
  if (!pol || !pod || !commodity) return null;

  const shipper = partyFromPayload('SHIPPER', payload);
  const consignee = partyFromPayload('CONSIGNEE', payload);
  const notify = partyFromPayload('NOTIFY', payload);
  if (!shipper?.full_name?.trim() || !shipper.address?.trim()) return null;
  if (!consignee?.full_name?.trim() || !consignee.address?.trim()) return null;

  const toParty = (kind: NvoccBookingFormParty['party_kind'], p: NonNullable<typeof shipper>) => ({
    party_kind: kind,
    full_name: p.full_name!.trim(),
    address: p.address!.trim(),
    city: p.city?.trim() || undefined,
    country: p.country?.trim() || undefined,
    entity_kind: p.entity_kind,
    other_details: p.other_details?.trim() || undefined,
  });

  const parties: NvoccBookingFormParty[] = [
    toParty('SHIPPER', shipper),
    toParty('CONSIGNEE', consignee),
    {
      party_kind: 'NOTIFY',
      full_name: (notify?.full_name || consignee.full_name)!.trim(),
      address: (notify?.address || consignee.address)!.trim(),
      city: notify?.city?.trim() || consignee.city?.trim() || undefined,
      country: notify?.country?.trim() || consignee.country?.trim() || undefined,
      entity_kind: notify?.entity_kind || consignee.entity_kind,
      other_details: notify?.other_details?.trim() || undefined,
    },
  ];

  const scope = String(payload.service_scope ?? '').trim();
  const scopeOk = (NVOCC_SERVICE_SCOPES as readonly string[]).includes(scope);

  const dto: UpdateNvoccBookingFormDto = {
    pol,
    pod,
    commodity,
    parties,
    mark_complete: false,
    is_dg: Boolean(payload.is_dg),
    shipper_owned_container: Boolean(payload.shipper_owned_container),
    date_of_request: payload.date_of_request?.slice(0, 10) || undefined,
    voyage_ref: payload.voyage_ref?.trim() || undefined,
    client_booking_no: payload.client_booking_no?.trim() || undefined,
    hs_code: payload.hs_code?.trim() || undefined,
    booking_agent_line: payload.booking_agent_line?.trim() || opts?.defaultAgentLine || undefined,
    agent_requester_name: payload.agent_requester_name?.trim() || undefined,
    sq_bl_booking_reference:
      payload.sq_bl_booking_reference?.trim() || opts?.quoteNumber?.trim() || undefined,
    final_use: payload.final_use?.trim() || undefined,
    activity_sector: payload.activity_sector || undefined,
    insurance_details: payload.insurance_details?.trim() || undefined,
    lc_bank_details: payload.lc_bank_details?.trim() || undefined,
    request_details: payload.request_details?.trim() || undefined,
    attach_commercial_invoice: Boolean(payload.attach_commercial_invoice),
    attach_correspondence: Boolean(payload.attach_correspondence),
    attach_cod_form: Boolean(payload.attach_cod_form),
    attach_licence: Boolean(payload.attach_licence),
    consent_accepted: Boolean(payload.consent_accepted),
    origin_door_address: payload.origin_door_address?.trim() || undefined,
    dest_door_address: payload.dest_door_address?.trim() || undefined,
    service_scope: scopeOk ? scope : undefined,
  };

  if (payload.gross_weight_kg != null) dto.gross_weight_kg = payload.gross_weight_kg;
  if (payload.net_weight_kg != null) dto.net_weight_kg = payload.net_weight_kg;
  if (payload.teu_count != null) dto.teu_count = payload.teu_count;
  const containers = (payload.containers ?? [])
    .filter((c) => c && (c.count ?? 0) >= 1)
    .map((c) => ({
      container_type_id: c.container_type_id || undefined,
      iso_size: c.iso_size || undefined,
      count: c.count,
    }));
  if (containers.length) dto.containers = containers;

  return dto;
}
