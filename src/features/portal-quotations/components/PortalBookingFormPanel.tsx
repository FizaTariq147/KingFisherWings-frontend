import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import {
  usePortalQuotationBookingForm,
  useUpdatePortalQuotationBookingForm,
  useUploadPortalComplianceDocument,
} from '../hooks/usePortalQuotations';
import { BookingDocumentUploadList } from '@/features/booking-documents/components/BookingDocumentUploadList';
import {
  BOOKING_DOCUMENT_KIND_LABELS,
  MANDATORY_BOOKING_DOCUMENT_KINDS,
  OPTIONAL_PORTAL_BOOKING_DOCUMENT_KINDS,
  missingMandatoryBookingDocs,
  type PortalBookingDocumentKind,
} from '@/features/booking-documents/constants/bookingDocumentKinds';
import type {
  PortalBookingFormUpsertDto,
  PortalQuotationDetail,
} from '../types/portalQuotations.types';
import { portalQuoteShowsBookingForm } from '../utils/portalQuotationStatus';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import { usesModeBookingFormConvertFlow } from '@/features/quotations/utils/quotationStatus';
import {
  clipComplianceField,
  PORTAL_COMPLIANCE_FORM_LIMITS as L,
} from '../utils/portalComplianceFormLimits';
import {
  normalizeBookingCurrencyInput,
  normalizeBookingHsCodeInput,
  normalizeBookingIataInput,
  normalizeBookingIsoCountryInput,
  validatePortalBookingFormStep,
} from '../utils/validatePortalBookingForm';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { API_ENUMS, API_MAX_LENGTH } from '@/lib/api/apiSchema.generated';

// Option lists come from the OpenAPI spec — regenerate with `npm run gen:api-schema`.
const SERVICE_SCOPES = API_ENUMS.UpsertNvoccBookingFormDto.service_scope;
const SECTORS = API_ENUMS.UpsertNvoccBookingFormDto.activity_sector;
const ENTITY_KINDS = API_ENUMS.NvoccBookingFormPartyDto.entity_kind;
const CARGO_CATEGORIES = API_ENUMS.UpsertWarehouseBookingFormDto.cargo_category;

type EntityKind = (typeof ENTITY_KINDS)[number];
type Sector = (typeof SECTORS)[number];

function asEntityKind(v: unknown): EntityKind {
  return (ENTITY_KINDS as readonly unknown[]).includes(v) ? (v as EntityKind) : ENTITY_KINDS[0];
}

function asSector(v: unknown): Sector | '' {
  return (SECTORS as readonly unknown[]).includes(v) ? (v as Sector) : '';
}

type StepId =
  | 'voyage'
  | 'shipper'
  | 'consignee'
  | 'notify'
  | 'billing'
  | 'commodity'
  | 'documents'
  | 'agent'
  | 'review';

type StepMeta = { id: StepId; label: string; eyebrow: string; title: string; blurb: string };

type PortalBookingFormKind =
  | 'air'
  | 'sea'
  | 'warehouse'
  | 'road'
  | 'land'
  | 'courier'
  | 'customs';

const VEHICLE_TYPES = API_ENUMS.UpdateLandJobDetailDto.vehicle_type;
const CC_DIRECTIONS = API_ENUMS.UpsertCustomsClearanceBookingFormDto.direction;

/** Step copy — dynamic per job type (matches Upsert*BookingFormDto modes). */
function getSteps(kind: PortalBookingFormKind): StepMeta[] {
  const voyage =
    kind === 'air'
      ? {
          id: 'voyage' as const,
          label: 'FLIGHT',
          eyebrow: 'ROUTE & CARGO DETAIL',
          title: 'Air Booking Overview',
          blurb: 'Origin/destination airports, weights, and DG status for this air booking request.',
        }
      : kind === 'warehouse'
        ? {
            id: 'voyage' as const,
            label: 'STORAGE',
            eyebrow: 'WAREHOUSE & CARGO DETAIL',
            title: 'Warehouse Booking Overview',
            blurb:
              'Pickup and warehouse locations, pieces, weights, and DG status for this storage booking.',
          }
        : kind === 'customs'
          ? {
              id: 'voyage' as const,
              label: 'CLEARANCE',
              eyebrow: 'CUSTOMS & CARGO DETAIL',
              title: 'Customs Clearance Overview',
              blurb: 'Direction, border/port, invoice value, and cargo details for clearance.',
            }
          : kind === 'road' || kind === 'land' || kind === 'courier'
            ? {
                id: 'voyage' as const,
                label: kind === 'courier' ? 'PARCEL' : 'ROUTE',
                eyebrow: 'DOOR / CITY & CARGO DETAIL',
                title:
                  kind === 'road'
                    ? 'Road Freight Booking Overview'
                    : kind === 'land'
                      ? 'Land Transport Booking Overview'
                      : 'Courier Booking Overview',
                blurb:
                  'Origin/destination cities, door addresses, vehicle or tracking, and cargo weights.',
              }
            : {
                id: 'voyage' as const,
                label: 'VOYAGE',
                eyebrow: 'VOYAGE & CARGO DETAIL',
                title: 'Booking & Shipment Overview',
                blurb: 'Basic voyage, weight and container details for this booking request.',
              };

  return [
    voyage,
    {
      id: 'shipper',
      label: 'SHIPPER',
      eyebrow: 'SHIPPER DETAILS',
      title: 'Shipper Information',
      blurb: 'Enter the shipper company or person details for this booking.',
    },
    {
      id: 'consignee',
      label: 'CONSIGNEE',
      eyebrow: 'CONSIGNEE DETAILS',
      title: 'Consignee Information',
      blurb: 'Enter the consignee company or person details for this booking.',
    },
    {
      id: 'notify',
      label: 'NOTIFY',
      eyebrow: 'NOTIFY PARTY',
      title: 'Notify Party',
      blurb: 'Who should be notified about this shipment (or same as consignee).',
    },
    ...(kind === 'warehouse'
      ? [
          {
            id: 'billing' as const,
            label: 'BILLING',
            eyebrow: 'BILLING PARTY',
            title: 'Billing Party',
            blurb: 'Party billed for storage (BookingFormPartyDto party_kind=BILLING).',
          },
        ]
      : []),
    {
      id: 'commodity',
      label: 'COMMODITY',
      eyebrow: 'COMMODITY & COMPLIANCE',
      title: 'Commodity Details',
      blurb: 'Describe the cargo, HS code, and compliance information.',
    },
    {
      id: 'documents',
      label: 'DOCUMENTS',
      eyebrow: 'SUPPORTING DOCUMENTS',
      title: 'Documents Checklist',
      blurb: 'These documents should be uploaded by you before submit.',
    },
    {
      id: 'agent',
      label: 'AGENT',
      eyebrow: 'BOOKING AGENT',
      title: 'Agent & References',
      blurb:
        kind === 'air'
          ? 'Booking agent line, requester, and flight / booking references.'
          : kind === 'warehouse'
            ? 'Booking agent line, requester, and warehouse booking references.'
            : 'Booking agent line, requester, and voyage / SQ-BL references.',
    },
    {
      id: 'review',
      label: 'REVIEW',
      eyebrow: 'REVIEW & SUBMIT',
      title: 'Confirm Booking Form',
      blurb: 'Review your details, accept consent, then submit to your forwarder.',
    },
  ];
}

function normalizePortalJobTypeToken(jobType?: string | null, rawJobType?: unknown): string {
  return String(jobType ?? rawJobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

function portalBookingFormKind(
  jobType?: string | null,
  rawJobType?: unknown,
): PortalBookingFormKind {
  const jt = normalizePortalJobTypeToken(jobType, rawJobType);
  if (jt === 'WAREHOUSE' || jt.startsWith('WAREHOUSE_')) return 'warehouse';
  if (jt === 'CUSTOMS_CLEARANCE' || jt.startsWith('CUSTOMS')) return 'customs';
  if (jt === 'ROAD_FREIGHT' || jt.startsWith('ROAD')) return 'road';
  if (jt === 'LAND' || jt.startsWith('LAND')) return 'land';
  if (jt === 'COURIER' || jt.startsWith('COURIER')) return 'courier';
  if (jt.startsWith('AIR') || isAirJobType(jt)) return 'air';
  return 'sea';
}

function isLandishKind(kind: PortalBookingFormKind): boolean {
  return kind === 'road' || kind === 'land' || kind === 'courier';
}

type PartyUi = {
  full_name: string;
  address: string;
  city: string;
  country: string;
  entity_kind: EntityKind;
  other_details: string;
};

type FormUi = {
  date_of_request: string;
  client_booking_no: string;
  teu_count: string;
  pol: string;
  pod: string;
  origin_airport_code: string;
  dest_airport_code: string;
  service_scope: string;
  origin_door_address: string;
  dest_door_address: string;
  pieces: string;
  volume_cbm: string;
  pallet_count: string;
  chargeable_weight_kg: string;
  gross_weight_kg: string;
  net_weight_kg: string;
  shipper_owned_container: boolean;
  is_dg: boolean;
  shipper: PartyUi;
  consignee: PartyUi;
  notify: PartyUi;
  billing: PartyUi;
  agentParty: PartyUi;
  commodity: string;
  hs_code: string;
  final_use: string;
  activity_sector: Sector | '';
  insurance_details: string;
  lc_bank_details: string;
  request_details: string;
  attach_commercial_invoice: boolean;
  attach_correspondence: boolean;
  attach_cod_form: boolean;
  attach_licence: boolean;
  booking_agent_line: string;
  agent_requester_name: string;
  sq_bl_booking_reference: string;
  voyage_ref: string;
  consent_accepted: boolean;
  warehouse_name: string;
  expected_inbound_at: string;
  expected_outbound_at: string;
  storage_days_requested: string;
  bonded: boolean;
  temperature_controlled: boolean;
  handling_instructions: string;
  cargo_category: string;
  dg_class: string;
  attach_packing_list: boolean;
  attach_bl_awb_copy: boolean;
  attach_carnet: boolean;
  attach_vehicle_title: boolean;
  attach_msds: boolean;
  attach_dangerous_goods_declaration: boolean;
  attach_health_veterinary: boolean;
  attach_fda_moh: boolean;
  stock_lines: {
    sku_code: string;
    description: string;
    quantity: string;
    unit: string;
    cbm: string;
  }[];
  pallets: {
    pallet_type: string;
    count: string;
    length_cm: string;
    width_cm: string;
    height_cm: string;
    weight_kg: string;
  }[];
  origin_city_country: string;
  dest_city_country: string;
  vehicle_type: string;
  border_crossing: string;
  tracking_number: string;
  etd: string;
  eta: string;
  incoterms: string;
  direction: string;
  border_or_port: string;
  entry_type: string;
  declaration_type: string;
  port_of_entry: string;
  port_of_exit: string;
  country_of_origin: string;
  country_of_destination: string;
  invoice_value_amount: string;
  invoice_currency: string;
};

function emptyParty(): PartyUi {
  return {
    full_name: '',
    address: '',
    city: '',
    country: '',
    entity_kind: ENTITY_KINDS[0],
    other_details: '',
  };
}

function emptyForm(): FormUi {
  return {
    date_of_request: new Date().toISOString().slice(0, 10),
    client_booking_no: '',
    teu_count: '',
    pol: '',
    pod: '',
    origin_airport_code: '',
    dest_airport_code: '',
    service_scope: SERVICE_SCOPES[0],
    origin_door_address: '',
    dest_door_address: '',
    pieces: '',
    volume_cbm: '',
    pallet_count: '',
    chargeable_weight_kg: '',
    gross_weight_kg: '',
    net_weight_kg: '',
    shipper_owned_container: false,
    is_dg: false,
    shipper: emptyParty(),
    consignee: emptyParty(),
    notify: emptyParty(),
    billing: emptyParty(),
    agentParty: emptyParty(),
    commodity: '',
    hs_code: '',
    final_use: '',
    activity_sector: '',
    insurance_details: '',
    lc_bank_details: '',
    request_details: '',
    attach_commercial_invoice: false,
    attach_correspondence: false,
    attach_cod_form: false,
    attach_licence: false,
    booking_agent_line: '',
    agent_requester_name: '',
    sq_bl_booking_reference: '',
    voyage_ref: '',
    consent_accepted: false,
    warehouse_name: '',
    expected_inbound_at: '',
    expected_outbound_at: '',
    storage_days_requested: '',
    bonded: false,
    temperature_controlled: false,
    handling_instructions: '',
    cargo_category: CARGO_CATEGORIES[0],
    dg_class: '',
    attach_packing_list: false,
    attach_bl_awb_copy: false,
    attach_carnet: false,
    attach_vehicle_title: false,
    attach_msds: false,
    attach_dangerous_goods_declaration: false,
    attach_health_veterinary: false,
    attach_fda_moh: false,
    stock_lines: [{ sku_code: '', description: '', quantity: '', unit: '', cbm: '' }],
    pallets: [
      {
        pallet_type: '',
        count: '1',
        length_cm: '',
        width_cm: '',
        height_cm: '',
        weight_kg: '',
      },
    ],
    origin_city_country: '',
    dest_city_country: '',
    vehicle_type: '',
    border_crossing: '',
    tracking_number: '',
    etd: '',
    eta: '',
    incoterms: '',
    direction: CC_DIRECTIONS[0] ?? 'IMPORT',
    border_or_port: '',
    entry_type: '',
    declaration_type: '',
    port_of_entry: '',
    port_of_exit: '',
    country_of_origin: '',
    country_of_destination: '',
    invoice_value_amount: '',
    invoice_currency: 'USD',
  };
}

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-600)]">
      {children}
      {required ? <span className="text-[var(--color-danger-600)]"> *</span> : null}
    </span>
  );
}

function ChoiceToggle({
  value,
  onChange,
  options,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
  options: [{ label: string; value: true }, { label: string; value: false }];
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              active
                ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)] text-white'
                : 'border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)] hover:border-[var(--color-secondary)]/50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PartyFields({
  party,
  onChange,
  nameRequired = true,
}: {
  party: PartyUi;
  onChange: (next: PartyUi) => void;
  nameRequired?: boolean;
}) {
  const patch = (partial: Partial<PartyUi>) => onChange({ ...party, ...partial });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <FieldLabel required={nameRequired}>Full name</FieldLabel>
        <Input
          className="mt-1"
          maxLength={L.party_full_name}
          value={party.full_name}
          onChange={(e) => patch({ full_name: e.target.value.slice(0, L.party_full_name) })}
          placeholder="Company or person name"
        />
      </label>
      <label className="block sm:col-span-2">
        <FieldLabel required={nameRequired}>Address</FieldLabel>
        <Input
          className="mt-1"
          value={party.address}
          onChange={(e) => patch({ address: e.target.value })}
          placeholder="Street / building"
        />
      </label>
      <label className="block">
        <FieldLabel>City</FieldLabel>
        <Input
          className="mt-1"
          maxLength={L.party_city}
          value={party.city}
          onChange={(e) => patch({ city: e.target.value.slice(0, L.party_city) })}
        />
      </label>
      <label className="block">
        <FieldLabel>Country</FieldLabel>
        <Input
          className="mt-1"
          maxLength={L.party_country}
          value={party.country}
          onChange={(e) => patch({ country: e.target.value.slice(0, L.party_country) })}
          placeholder="Country name or ISO code (e.g. AE)"
        />
      </label>
      <label className="block">
        <FieldLabel>Entity kind</FieldLabel>
        <select
          className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
          value={party.entity_kind}
          onChange={(e) =>
            patch({ entity_kind: asEntityKind(e.target.value) })
          }
        >
          {ENTITY_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <FieldLabel>Other details</FieldLabel>
        <Input
          className="mt-1"
          value={party.other_details}
          onChange={(e) => patch({ other_details: e.target.value })}
          placeholder="Email (name@company.com), phone (+971501234567), or website"
        />
      </label>
    </div>
  );
}

function toPartyDto(
  kind: 'SHIPPER' | 'CONSIGNEE' | 'NOTIFY' | 'BILLING' | 'AGENT',
  party: PartyUi,
  fallback?: PartyUi,
): PortalBookingFormUpsertDto['parties'][number] {
  const fullName =
    clipComplianceField(party.full_name, L.party_full_name) ||
    clipComplianceField(fallback?.full_name, L.party_full_name) ||
    (kind === 'NOTIFY' ? 'Same as consignee' : '');
  return {
    party_kind: kind,
    full_name: fullName || '',
    address: party.address.trim() || fallback?.address.trim() || undefined,
    city: clipComplianceField(party.city, L.party_city) ||
      clipComplianceField(fallback?.city, L.party_city),
    country:
      clipComplianceField(party.country, L.party_country) ||
      clipComplianceField(fallback?.country, L.party_country),
    entity_kind: party.entity_kind,
    other_details: party.other_details.trim() || undefined,
  };
}

/** Maps UI → UpsertNvoccBookingFormDto (sea) / UpsertAirComplianceBookingFormDto (air) /
 * warehouse fields aligned to UpsertWarehouseBookingFormDto (draft + staff sync). */
function toDto(
  form: FormUi,
  markComplete: boolean,
  kind: PortalBookingFormKind,
): PortalBookingFormUpsertDto {
  const numOrUndef = (v: string) => {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  };
  const parties = [
    toPartyDto('SHIPPER', form.shipper),
    toPartyDto('CONSIGNEE', form.consignee),
    toPartyDto('NOTIFY', form.notify, form.consignee),
  ];
  if (kind === 'warehouse') {
    if (form.billing.full_name.trim() || form.billing.address.trim()) {
      parties.push(toPartyDto('BILLING', form.billing, form.consignee));
    }
    if (form.agentParty.full_name.trim() || form.booking_agent_line.trim()) {
      const agent = form.agentParty.full_name.trim()
        ? form.agentParty
        : {
            ...emptyParty(),
            full_name: form.booking_agent_line.trim() || form.agent_requester_name.trim(),
            other_details: form.agent_requester_name.trim(),
          };
      parties.push(toPartyDto('AGENT', agent));
    }
  }
  const shared = {
    date_of_request: form.date_of_request.trim() || undefined,
    client_booking_no: clipComplianceField(form.client_booking_no, L.client_booking_no),
    gross_weight_kg: numOrUndef(form.gross_weight_kg),
    net_weight_kg: numOrUndef(form.net_weight_kg),
    is_dg: form.is_dg,
    commodity: clipComplianceField(form.commodity, L.commodity) ?? '',
    hs_code: clipComplianceField(form.hs_code, L.hs_code),
    final_use: clipComplianceField(form.final_use, L.final_use),
    activity_sector: form.activity_sector || undefined,
    insurance_details: form.insurance_details.trim() || undefined,
    lc_bank_details: form.lc_bank_details.trim() || undefined,
    request_details: form.request_details.trim() || undefined,
    attach_commercial_invoice: form.attach_commercial_invoice,
    attach_correspondence: form.attach_correspondence,
    attach_cod_form: form.attach_cod_form,
    attach_licence: form.attach_licence,
    booking_agent_line: clipComplianceField(form.booking_agent_line, L.booking_agent_line),
    agent_requester_name: clipComplianceField(form.agent_requester_name, L.agent_requester_name),
    sq_bl_booking_reference: clipComplianceField(
      form.sq_bl_booking_reference,
      L.sq_bl_booking_reference,
    ),
    voyage_ref: clipComplianceField(form.voyage_ref, L.voyage_ref),
    consent_accepted: form.consent_accepted,
    mark_complete: markComplete,
    parties,
  };

  if (kind === 'air') {
    const pallets = form.pallets
      .map((p) => ({
        pallet_type: clipComplianceField(p.pallet_type, L.pallet_type) ?? '',
        count: numOrUndef(p.count) ?? 0,
        length_cm: numOrUndef(p.length_cm),
        width_cm: numOrUndef(p.width_cm),
        height_cm: numOrUndef(p.height_cm),
        weight_kg: numOrUndef(p.weight_kg),
      }))
      .filter((p) => p.pallet_type && p.count >= 1);
    return {
      ...shared,
      service_scope: form.service_scope || undefined,
      origin_door_address: form.origin_door_address.trim() || undefined,
      dest_door_address: form.dest_door_address.trim() || undefined,
      origin_airport_code:
        clipComplianceField(form.origin_airport_code, L.origin_airport_code) ?? '',
      dest_airport_code: clipComplianceField(form.dest_airport_code, L.dest_airport_code) ?? '',
      pieces: numOrUndef(form.pieces),
      volume_cbm: numOrUndef(form.volume_cbm),
      pallet_count: numOrUndef(form.pallet_count),
      chargeable_weight_kg: numOrUndef(form.chargeable_weight_kg),
      pallets: pallets.length ? pallets : undefined,
    };
  }

  if (kind === 'warehouse') {
    const pickup =
      form.origin_door_address.trim() || form.pol.trim() || undefined;
    const warehouseName =
      form.warehouse_name.trim() || form.pod.trim() || form.dest_door_address.trim();
    const stock_lines = form.stock_lines
      .map((line) => ({
        sku_code: line.sku_code.trim() || undefined,
        description: line.description.trim() || undefined,
        quantity: numOrUndef(line.quantity),
        unit: line.unit.trim() || undefined,
        cbm: numOrUndef(line.cbm),
      }))
      .filter(
        (line) =>
          Boolean(line.sku_code) ||
          Boolean(line.description) ||
          (line.quantity != null && line.quantity > 0),
      );
    return {
      date_of_request: form.date_of_request.trim() || undefined,
      client_booking_no: clipComplianceField(form.client_booking_no, L.client_booking_no),
      voyage_ref: clipComplianceField(form.voyage_ref, L.voyage_ref),
      service_scope: form.service_scope || undefined,
      commodity: clipComplianceField(form.commodity, L.commodity) ?? '',
      hs_code: clipComplianceField(form.hs_code, L.hs_code),
      cargo_category: form.cargo_category || undefined,
      is_dg: form.is_dg,
      dg_class: form.is_dg ? form.dg_class.trim() || undefined : undefined,
      gross_weight_kg: numOrUndef(form.gross_weight_kg),
      net_weight_kg: numOrUndef(form.net_weight_kg),
      pieces: numOrUndef(form.pieces),
      volume_cbm: numOrUndef(form.volume_cbm),
      insurance_details: form.insurance_details.trim() || undefined,
      request_details: form.request_details.trim() || undefined,
      origin_door_address: pickup,
      dest_door_address: form.dest_door_address.trim() || warehouseName || undefined,
      // Compliance / message fallback only — UpsertWarehouseBookingFormDto has no pol/pod.
      pol: clipComplianceField(pickup ?? '', L.pol) ?? '',
      pod: clipComplianceField(warehouseName || form.pod, L.pod) ?? '',
      warehouse_name: warehouseName || undefined,
      expected_inbound_at: form.expected_inbound_at || undefined,
      expected_outbound_at: form.expected_outbound_at || undefined,
      storage_days_requested: numOrUndef(form.storage_days_requested),
      bonded: form.bonded,
      temperature_controlled: form.temperature_controlled,
      handling_instructions: form.handling_instructions.trim() || undefined,
      stock_lines: stock_lines.length ? stock_lines : undefined,
      attach_commercial_invoice: form.attach_commercial_invoice,
      attach_packing_list: form.attach_packing_list,
      attach_bl_awb_copy: form.attach_bl_awb_copy,
      attach_carnet: form.attach_carnet,
      attach_vehicle_title: form.attach_vehicle_title,
      attach_msds: form.attach_msds,
      attach_dangerous_goods_declaration: form.attach_dangerous_goods_declaration,
      attach_health_veterinary: form.attach_health_veterinary,
      attach_fda_moh: form.attach_fda_moh,
      booking_agent_line: clipComplianceField(form.booking_agent_line, L.booking_agent_line),
      agent_requester_name: clipComplianceField(form.agent_requester_name, L.agent_requester_name),
      sq_bl_booking_reference: clipComplianceField(
        form.sq_bl_booking_reference,
        L.sq_bl_booking_reference,
      ),
      consent_accepted: form.consent_accepted,
      mark_complete: markComplete,
      parties,
    };
  }

  if (isLandishKind(kind) || kind === 'customs') {
    const originCity =
      form.origin_city_country.trim() ||
      form.origin_door_address.trim() ||
      form.pol.trim();
    const destCity =
      form.dest_city_country.trim() ||
      form.dest_door_address.trim() ||
      form.pod.trim();
    const baseLand = {
      ...shared,
      service_scope: form.service_scope || undefined,
      origin_door_address: form.origin_door_address.trim() || undefined,
      dest_door_address: form.dest_door_address.trim() || undefined,
      pieces: numOrUndef(form.pieces),
      volume_cbm: numOrUndef(form.volume_cbm),
      cargo_category: form.cargo_category || undefined,
      dg_class: form.is_dg ? form.dg_class.trim() || undefined : undefined,
      attach_packing_list: form.attach_packing_list,
      attach_bl_awb_copy: form.attach_bl_awb_copy,
      attach_carnet: form.attach_carnet,
      attach_vehicle_title: form.attach_vehicle_title,
      attach_msds: form.attach_msds,
      attach_dangerous_goods_declaration: form.attach_dangerous_goods_declaration,
      attach_health_veterinary: form.attach_health_veterinary,
      attach_fda_moh: form.attach_fda_moh,
      // Keep pol/pod mirrors for inbox/display when cities fill route hubs.
      pol: clipComplianceField(originCity, L.pol) ?? '',
      pod: clipComplianceField(destCity, L.pod) ?? '',
      origin_city_country: originCity || undefined,
      dest_city_country: destCity || undefined,
      etd: form.etd || undefined,
      eta: form.eta || undefined,
      incoterms: form.incoterms.trim() || undefined,
    };
    if (kind === 'customs') {
      return {
        ...baseLand,
        direction: form.direction || undefined,
        border_or_port: form.border_or_port.trim() || undefined,
        entry_type: form.entry_type.trim() || undefined,
        declaration_type: form.declaration_type.trim() || undefined,
        port_of_entry: form.port_of_entry.trim() || undefined,
        port_of_exit: form.port_of_exit.trim() || undefined,
        country_of_origin: form.country_of_origin.trim().toUpperCase() || undefined,
        country_of_destination: form.country_of_destination.trim().toUpperCase() || undefined,
        invoice_value_amount: numOrUndef(form.invoice_value_amount),
        invoice_currency: form.invoice_currency.trim().toUpperCase() || undefined,
      };
    }
    if (kind === 'courier') {
      return {
        ...baseLand,
        tracking_number: form.tracking_number.trim() || undefined,
      };
    }
    return {
      ...baseLand,
      vehicle_type: form.vehicle_type || undefined,
      ...(kind === 'road'
        ? { border_crossing: form.border_crossing.trim() || undefined }
        : {}),
    };
  }

  const teu = numOrUndef(form.teu_count);
  return {
    ...shared,
    ...(teu != null ? { teu_count: teu } : {}),
    pol: clipComplianceField(form.pol, L.pol) ?? '',
    pod: clipComplianceField(form.pod, L.pod) ?? '',
    shipper_owned_container: form.shipper_owned_container,
    service_scope: form.service_scope || undefined,
    origin_door_address: form.origin_door_address.trim() || undefined,
    dest_door_address: form.dest_door_address.trim() || undefined,
  };
}

function validateStep(
  step: StepId,
  form: FormUi,
  kind: PortalBookingFormKind,
): string | null {
  return validatePortalBookingFormStep(step, form, kind);
}

interface PortalBookingFormPanelProps {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
  onFormCompleteChange?: (complete: boolean) => void;
  /** When forwarder already posted INVOICE_SENT / portal invoice exists. */
  invoiceAlreadySent?: boolean;
}

/**
 * Customer 8-step booking form after CUSTOMER_ACCEPTED.
 * NVOCC: GET/PUT/POST /portal/bookings/{id}/compliance-form*
 * Air:   GET/PUT/POST /portal/shipments/{id}/compliance-form* (+ accept)
 * Warehouse: draft + /portal/messages (no portal warehouse booking-form in live OpenAPI);
 *            fields align to UpsertWarehouseBookingFormDto for staff /jobs/:id/warehouse/booking-form.
 */
export function PortalBookingFormPanel({
  quote,
  onSuccess,
  onFormCompleteChange,
  invoiceAlreadySent = false,
}: PortalBookingFormPanelProps) {
  const enabled = portalQuoteShowsBookingForm(quote);
  const formKind = portalBookingFormKind(
    quote.jobType,
    (quote.raw as { job_type?: string } | undefined)?.job_type,
  );
  const isAir = formKind === 'air';
  const isWarehouse = formKind === 'warehouse';
  const isLandish = isLandishKind(formKind);
  const isCustoms = formKind === 'customs';
  const isSea = formKind === 'sea';
  const bookingId =
    quote.bookingId ||
    String(
      (quote.raw as { portal_booking_id?: string; booking_id?: string } | undefined)
        ?.portal_booking_id ||
        (quote.raw as { booking_id?: string } | undefined)?.booking_id ||
        '',
    ).trim() ||
    undefined;
  const jobId =
    quote.jobId ||
    String(
      (quote.raw as { portal_shipment_id?: string; shipment_id?: string } | undefined)
        ?.portal_shipment_id ||
        (quote.raw as { shipment_id?: string; job_id?: string } | undefined)?.shipment_id ||
        (quote.raw as { job_id?: string } | undefined)?.job_id ||
        '',
    ).trim() ||
    undefined;
  const formQuery = usePortalQuotationBookingForm(quote.id, enabled, {
    isAir,
    jobId,
    bookingId,
    quoteNumber: quote.number,
    jobType: quote.jobType,
  });
  const saveForm = useUpdatePortalQuotationBookingForm(quote.id);
  const uploadDoc = useUploadPortalComplianceDocument(quote.id);
  const [form, setForm] = useState<FormUi>(emptyForm);
  // Forwarder (tenant) name — default agent line, replacing the old hardcoded value.
  const tenantName = usePortalAuthStore((s) => s.user?.tenantName);
  const tenantAgentLine = (tenantName ?? '').trim().slice(0, L.booking_agent_line);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedDocKinds, setUploadedDocKinds] = useState<Set<string>>(() => new Set());
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Customer uploads on Step 6 — portal compliance APIs for NVOCC bookings / Air shipments.
  const jtUpper = String(quote.jobType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  const usesPortalComplianceDocs =
    isAir || jtUpper.startsWith('NVOCC') || Boolean(bookingId);
  const portalDocKinds = useMemo(
    () =>
      [
        ...MANDATORY_BOOKING_DOCUMENT_KINDS,
        ...OPTIONAL_PORTAL_BOOKING_DOCUMENT_KINDS,
      ] as PortalBookingDocumentKind[],
    [],
  );

  const steps = useMemo(() => getSteps(formKind), [formKind]);
  const step = steps[stepIndex] ?? steps[0];

  useEffect(() => {
    if (!enabled || submitted) return;
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [enabled, submitted]);

  useEffect(() => {
    const data = formQuery.data;
    const base = emptyForm();
    base.pol = quote.origin || '';
    base.pod = quote.destination || '';
    base.commodity = quote.commodity || '';
    base.sq_bl_booking_reference = quote.number || '';
    base.booking_agent_line = tenantAgentLine;
    if (!data) {
      setForm(base);
      return;
    }
    const parties = data.parties ?? [];
    const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
    const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
    const notify = parties.find((p) => p.party_kind === 'NOTIFY');
    const billing = parties.find((p) => p.party_kind === 'BILLING');
    const agentPartyRow = parties.find((p) => p.party_kind === 'AGENT');
    const sector = String(data.activity_sector ?? '').toUpperCase();
    const mapParty = (p: (typeof parties)[number] | undefined): PartyUi => ({
      full_name: String(p?.full_name ?? ''),
      address: String(p?.address ?? ''),
      city: String(p?.city ?? ''),
      country: String(p?.country ?? ''),
      entity_kind: asEntityKind(p?.entity_kind),
      other_details: String(p?.other_details ?? ''),
    });
    setForm({
      ...base,
      date_of_request: String(data.date_of_request ?? '').slice(0, 10) || base.date_of_request,
      client_booking_no: String(data.client_booking_no ?? ''),
      teu_count: data.teu_count != null ? String(data.teu_count) : '',
      pol: String(data.pol ?? quote.origin ?? ''),
      pod: String(data.pod ?? quote.destination ?? ''),
      origin_airport_code: String(
        data.origin_airport_code ?? (isAir ? data.pol ?? quote.origin ?? '' : ''),
      )
        .toUpperCase()
        .slice(0, L.origin_airport_code),
      dest_airport_code: String(
        data.dest_airport_code ?? (isAir ? data.pod ?? quote.destination ?? '' : ''),
      )
        .toUpperCase()
        .slice(0, L.dest_airport_code),
      service_scope: String(data.service_scope ?? base.service_scope),
      origin_door_address: String(
        data.origin_door_address ?? (isWarehouse ? data.pol ?? quote.origin ?? '' : ''),
      ),
      dest_door_address: String(data.dest_door_address ?? ''),
      pieces: data.pieces != null ? String(data.pieces) : '',
      volume_cbm: data.volume_cbm != null ? String(data.volume_cbm) : '',
      pallet_count: data.pallet_count != null ? String(data.pallet_count) : '',
      chargeable_weight_kg:
        data.chargeable_weight_kg != null ? String(data.chargeable_weight_kg) : '',
      gross_weight_kg: data.gross_weight_kg != null ? String(data.gross_weight_kg) : '',
      net_weight_kg: data.net_weight_kg != null ? String(data.net_weight_kg) : '',
      shipper_owned_container: Boolean(data.shipper_owned_container),
      is_dg: Boolean(data.is_dg),
      shipper: mapParty(shipper),
      consignee: mapParty(consignee),
      notify: mapParty(notify),
      billing: mapParty(billing),
      agentParty: mapParty(agentPartyRow),
      commodity: String(data.commodity ?? quote.commodity ?? ''),
      hs_code: String(data.hs_code ?? ''),
      final_use: String(data.final_use ?? ''),
      activity_sector: asSector(sector),
      insurance_details: String(data.insurance_details ?? ''),
      lc_bank_details: String(data.lc_bank_details ?? ''),
      request_details: String(data.request_details ?? ''),
      attach_commercial_invoice: Boolean(data.attach_commercial_invoice),
      attach_correspondence: Boolean(data.attach_correspondence),
      attach_cod_form: Boolean(data.attach_cod_form),
      attach_licence: Boolean(data.attach_licence),
      booking_agent_line: String(data.booking_agent_line ?? base.booking_agent_line),
      agent_requester_name: String(data.agent_requester_name ?? ''),
      sq_bl_booking_reference: String(data.sq_bl_booking_reference ?? quote.number ?? ''),
      voyage_ref: String(data.voyage_ref ?? ''),
      consent_accepted: Boolean(data.consent_accepted),
      warehouse_name: String(
        data.warehouse_name ?? (isWarehouse ? data.pod ?? quote.destination ?? '' : ''),
      ),
      expected_inbound_at: String(data.expected_inbound_at ?? '').slice(0, 16),
      expected_outbound_at: String(data.expected_outbound_at ?? '').slice(0, 16),
      storage_days_requested:
        data.storage_days_requested != null ? String(data.storage_days_requested) : '',
      bonded: Boolean(data.bonded),
      temperature_controlled: Boolean(data.temperature_controlled),
      handling_instructions: String(data.handling_instructions ?? ''),
      cargo_category: String(data.cargo_category ?? '') || base.cargo_category,
      dg_class: String(data.dg_class ?? ''),
      attach_packing_list: Boolean(data.attach_packing_list),
      attach_bl_awb_copy: Boolean(data.attach_bl_awb_copy),
      attach_carnet: Boolean(data.attach_carnet),
      attach_vehicle_title: Boolean(data.attach_vehicle_title),
      attach_msds: Boolean(data.attach_msds),
      attach_dangerous_goods_declaration: Boolean(data.attach_dangerous_goods_declaration),
      attach_health_veterinary: Boolean(data.attach_health_veterinary),
      attach_fda_moh: Boolean(data.attach_fda_moh),
      stock_lines:
        Array.isArray(data.stock_lines) && data.stock_lines.length > 0
          ? data.stock_lines.map((line) => ({
              sku_code: String(line.sku_code ?? ''),
              description: String(line.description ?? ''),
              quantity: line.quantity != null ? String(line.quantity) : '',
              unit: String(line.unit ?? ''),
              cbm: line.cbm != null ? String(line.cbm) : '',
            }))
          : base.stock_lines,
      pallets:
        Array.isArray(data.pallets) && data.pallets.length > 0
          ? data.pallets.map((p) => ({
              pallet_type: String(p.pallet_type ?? ''),
              count: p.count != null ? String(p.count) : '1',
              length_cm: p.length_cm != null ? String(p.length_cm) : '',
              width_cm: p.width_cm != null ? String(p.width_cm) : '',
              height_cm: p.height_cm != null ? String(p.height_cm) : '',
              weight_kg: p.weight_kg != null ? String(p.weight_kg) : '',
            }))
          : base.pallets,
      origin_city_country: String(
        data.origin_city_country ??
          (isLandish ? data.pol ?? quote.origin ?? '' : ''),
      ),
      dest_city_country: String(
        data.dest_city_country ??
          (isLandish ? data.pod ?? quote.destination ?? '' : ''),
      ),
      vehicle_type: String(data.vehicle_type ?? ''),
      border_crossing: String(data.border_crossing ?? ''),
      tracking_number: String(data.tracking_number ?? ''),
      etd: String(data.etd ?? '').slice(0, 16),
      eta: String(data.eta ?? '').slice(0, 16),
      incoterms: String(data.incoterms ?? ''),
      direction: String(data.direction ?? '') || base.direction,
      border_or_port: String(data.border_or_port ?? ''),
      entry_type: String(data.entry_type ?? ''),
      declaration_type: String(data.declaration_type ?? ''),
      port_of_entry: String(data.port_of_entry ?? ''),
      port_of_exit: String(data.port_of_exit ?? ''),
      country_of_origin: String(data.country_of_origin ?? ''),
      country_of_destination: String(data.country_of_destination ?? ''),
      invoice_value_amount:
        data.invoice_value_amount != null ? String(data.invoice_value_amount) : '',
      invoice_currency: String(data.invoice_currency ?? '') || base.invoice_currency,
    });
    if (data.mark_complete === true) setSubmitted(true);
  }, [
    formQuery.data,
    quote.origin,
    quote.destination,
    quote.commodity,
    quote.number,
    isAir,
    isWarehouse,
    isLandish,
    tenantAgentLine,
  ]);

  useEffect(() => {
    const complete = submitted || formQuery.data?.mark_complete === true;
    onFormCompleteChange?.(complete);
  }, [submitted, formQuery.data?.mark_complete, onFormCompleteChange]);

  // If submit already succeeded but Ops inbox never got the mirror (common), re-post once
  // when the customer reopens the submitted quote so admin autofill can find it.
  useEffect(() => {
    if (!enabled) return;
    if (!(submitted || formQuery.data?.mark_complete === true)) return;
    const key = `kf.portal.bookingForm.inboxMirror:${quote.id}`;
    try {
      const existing = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
      if (existing === '1' || existing === 'pending') return;
      sessionStorage.setItem(key, 'pending');
    } catch {
      /* ignore */
    }
    const source = formQuery.data?.mark_complete ? formQuery.data : null;
    const dto = source
      ? undefined
      : form.commodity.trim()
        ? toDto(form, true, formKind)
        : undefined;
    if (!source && !dto) {
      try {
        if (sessionStorage.getItem(key) === 'pending') sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { portalQuotationsService } = await import('../services/portalQuotations.service');
        await portalQuotationsService.remirrorBookingFormToInbox({
          quotationId: quote.id,
          quoteNumber: quote.number,
          jobType: quote.jobType,
          jobId,
          bookingId,
          form: source ?? dto!,
        });
        if (!cancelled) {
          try {
            sessionStorage.setItem(key, '1');
          } catch {
            /* ignore */
          }
        }
      } catch {
        try {
          if (sessionStorage.getItem(key) === 'pending') sessionStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally omit `form` — hydrate from formQuery.data when complete; avoid remirror loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remirror once per quote session
  }, [
    enabled,
    submitted,
    formQuery.data,
    formKind,
    quote.id,
    quote.number,
    quote.jobType,
    jobId,
    bookingId,
  ]);

  const remirrorToForwarder = () => {
    setError(null);
    setMsg(null);
    try {
      sessionStorage.removeItem(`kf.portal.bookingForm.inboxMirror:${quote.id}`);
    } catch {
      /* ignore */
    }
    const source = formQuery.data?.mark_complete ? formQuery.data : null;
    const dto = toDto(form, true, formKind);
    void (async () => {
      try {
        const { portalQuotationsService } = await import('../services/portalQuotations.service');
        await portalQuotationsService.remirrorBookingFormToInbox({
          quotationId: quote.id,
          quoteNumber: quote.number,
          jobType: quote.jobType,
          jobId,
          bookingId,
          form: source ?? dto,
        });
        try {
          sessionStorage.setItem(`kf.portal.bookingForm.inboxMirror:${quote.id}`, '1');
        } catch {
          /* ignore */
        }
        setMsg(
          'Shared with your forwarder again. Ask them to refresh Ops / Portal Admin inbox.',
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not share with forwarder.');
      }
    })();
  };

  const patch = (partial: Partial<FormUi>) => setForm((prev) => ({ ...prev, ...partial }));

  const submit = (complete: boolean) => {
    setError(null);
    setMsg(null);
    if (complete) {
      for (const s of steps) {
        const err = validateStep(s.id, form, formKind);
        if (err) {
          setError(err);
          setStepIndex(steps.findIndex((x) => x.id === s.id));
          return;
        }
      }
    } else {
      const err = validateStep('voyage', form, formKind);
      if (err) {
        setError(err);
        return;
      }
    }
    if (complete) {
      const missingDocs = missingMandatoryBookingDocs(uploadedDocKinds);
      if (missingDocs.length) {
        setError(
          `Upload required documents before submit: ${missingDocs
            .map((k) => BOOKING_DOCUMENT_KIND_LABELS[k])
            .join(', ')}.`,
        );
        const docsIdx = steps.findIndex((x) => x.id === 'documents');
        if (docsIdx >= 0) setStepIndex(docsIdx);
        return;
      }
    }
    const dto = toDto(form, complete, formKind);
    const linked = isAir ? Boolean(jobId) : Boolean(bookingId);
    void saveForm
      .mutateAsync({
        dto,
        isAir,
        jobId,
        bookingId,
        quoteNumber: quote.number,
        jobType: quote.jobType,
      })
      .then(() => {
        const modeConvert = usesModeBookingFormConvertFlow(quote.jobType);
        const message = complete
          ? modeConvert
            ? 'Booking form submitted — quotation converts to a job.'
            : linked
              ? 'Booking form submitted. Your forwarder can complete Ops and send the invoice.'
              : isAir
                ? 'Booking form submitted to your forwarder. They will link it to the air shipment and send the invoice.'
                : 'Booking form submitted to your forwarder. They will link it to the NVOCC booking and send the invoice.'
          : 'Booking form draft saved.';
        setMsg(message);
        if (complete) {
          setSubmitted(true);
          try {
            window.dispatchEvent(
              new CustomEvent('kfw-customer-booking-form-complete', {
                detail: { quotationId: quote.id, jobType: quote.jobType },
              }),
            );
          } catch {
            /* ignore */
          }
        }
        onSuccess?.(message);
      })
      .catch((err) => {
        setError(getServerErrorMessage(err) || 'Could not submit booking form.');
      });
  };

  const goNext = () => {
    setError(null);
    const err = validateStep(step.id, form, formKind);
    if (err) {
      setError(err);
      return;
    }
    if (stepIndex >= steps.length - 1) {
      submit(true);
      return;
    }
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const reviewRows = useMemo(
    () => [
      ['date_of_request', form.date_of_request],
      ['client_booking_no', form.client_booking_no || '—'],
      ...(isAir
        ? ([
            ['service_scope', form.service_scope],
            ['origin_airport_code', form.origin_airport_code],
            ['dest_airport_code', form.dest_airport_code],
            ['pieces', form.pieces],
            ['volume_cbm', form.volume_cbm || '—'],
            ['pallet_count', form.pallet_count || '—'],
          ] as [string, string][])
        : isWarehouse
          ? ([
              ['pieces', form.pieces],
              ['volume_cbm', form.volume_cbm || '—'],
              ['origin_door_address', form.origin_door_address || form.pol || '—'],
              ['warehouse_name', form.warehouse_name || form.pod || '—'],
              ['dest_door_address', form.dest_door_address || '—'],
              ['expected_inbound_at', form.expected_inbound_at || '—'],
              ['expected_outbound_at', form.expected_outbound_at || '—'],
              ['storage_days_requested', form.storage_days_requested || '—'],
              ['bonded', form.bonded ? 'true' : 'false'],
              ['temperature_controlled', form.temperature_controlled ? 'true' : 'false'],
              ['service_scope', form.service_scope || '—'],
            ] as [string, string][])
          : ([
              ['teu_count', form.teu_count],
              ['pol', form.pol],
              ['pod', form.pod],
              ['shipper_owned_container', form.shipper_owned_container ? 'true' : 'false'],
            ] as [string, string][])),
      ['gross_weight_kg', form.gross_weight_kg],
      ['net_weight_kg', form.net_weight_kg],
      ['is_dg', form.is_dg ? 'true' : 'false'],
      ['commodity', form.commodity],
      ['hs_code', form.hs_code || '—'],
      ['activity_sector', form.activity_sector || '—'],
      ['SHIPPER', form.shipper.full_name],
      ['CONSIGNEE', form.consignee.full_name],
      ['NOTIFY', form.notify.full_name || '(same as consignee)'],
      [
        isAir
          ? 'voyage_ref (flight)'
          : isWarehouse
            ? 'voyage_ref (booking / storage)'
            : 'voyage_ref',
        form.voyage_ref || '—',
      ],
      ['booking_agent_line', form.booking_agent_line],
      ['sq_bl_booking_reference', form.sq_bl_booking_reference || '—'],
    ],
    [form, isAir, isWarehouse],
  );

  if (!enabled) return null;

  if (submitted || formQuery.data?.mark_complete === true) {
    return (
      <div ref={panelRef}>
        <PortalPanel padded className="border-emerald-200 bg-emerald-50/50">
          <h2 className="text-sm font-semibold text-emerald-900">
            Booking form submitted (BOOKING_FORM_COMPLETE)
          </h2>
          <p className="mt-1 text-sm text-emerald-800">
            {usesModeBookingFormConvertFlow(quote.jobType)
              ? isWarehouse
                ? 'Thanks — your quotation converts to a job. Warehouse ops (ASN / GRN / GDO) continue on the staff side.'
                : 'Thanks — your quotation converts to a job.'
              : invoiceAlreadySent
                ? isAir
                  ? 'Booking form is complete and your invoice has been sent. Air export / import ops continue on the shipment.'
                  : 'Booking form is complete and your invoice has been sent. View it under Invoices.'
                : isAir
                  ? 'Thanks — next your forwarder sends the invoice (INVOICE_SENT), then air export or import ops begin.'
                  : 'Thanks — next your forwarder sends the invoice (INVOICE_SENT).'}
          </p>
          {msg ? <p className="mt-2 text-xs text-emerald-900">{msg}</p> : null}
          {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-emerald-900 underline underline-offset-2 hover:text-emerald-950"
            onClick={remirrorToForwarder}
          >
            Share with forwarder again
          </button>
        </PortalPanel>
      </div>
    );
  }

  return (
    <div ref={panelRef}>
    <PortalPanel padded={false} className="overflow-hidden border border-[var(--color-neutral-100)]">
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-secondary)] to-[var(--color-primary)]" />

      <div className="space-y-6 p-5 sm:p-6">
        <nav aria-label="Booking form steps" className="overflow-x-auto pb-1">
          <ol className="flex min-w-max items-center justify-between gap-0">
            {steps.map((s, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <li key={s.id} className="flex flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStepIndex(i);
                    }}
                    className="flex min-w-[4.5rem] flex-col items-center gap-1.5"
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        active
                          ? 'bg-[var(--color-secondary)] text-white ring-2 ring-[var(--color-secondary)] ring-offset-2'
                          : done
                            ? 'bg-[var(--color-secondary)] text-white'
                            : 'border-2 border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-400)]'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-[0.08em] ${
                        active
                          ? 'text-[var(--color-secondary)]'
                          : done
                            ? 'text-[var(--color-secondary-700)]'
                            : 'text-[var(--color-neutral-400)]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < steps.length - 1 ? (
                    <span
                      className={`mx-1 mb-5 h-[2px] flex-1 min-w-[12px] ${
                        done ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-neutral-200)]'
                      }`}
                      aria-hidden
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
            Step {stepIndex + 1} · {step.eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
            {step.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{step.blurb}</p>
        </div>

        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}
        {msg ? (
          <p className="text-sm text-[var(--color-success-700)]" role="status">
            {msg}
          </p>
        ) : null}

        {step.id === 'voyage' ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <FieldLabel>Date of request</FieldLabel>
              <Input
                className="mt-1"
                type="date"
                value={form.date_of_request}
                onChange={(e) => patch({ date_of_request: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel>Booking no (if known)</FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.client_booking_no}
                value={form.client_booking_no}
                onChange={(e) =>
                  patch({ client_booking_no: e.target.value.slice(0, L.client_booking_no) })
                }
                placeholder="Assigned by agent"
              />
            </label>
            {isSea ? (
              <label className="block">
                <FieldLabel required>Number of TEUs</FieldLabel>
                <Input
                  className="mt-1"
                  inputMode="decimal"
                  value={form.teu_count}
                  onChange={(e) =>
                    patch({ teu_count: e.target.value.replace(/[^\d.]/g, '') })
                  }
                  placeholder="e.g. 1 or 2.25"
                />
              </label>
            ) : isAir ? (
              <label className="block">
                <FieldLabel>Service scope</FieldLabel>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                  value={form.service_scope}
                  onChange={(e) => patch({ service_scope: e.target.value })}
                >
                  {SERVICE_SCOPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <label className="block">
                  <FieldLabel required>Pieces</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    value={form.pieces}
                    onChange={(e) =>
                      patch({ pieces: e.target.value.replace(/[^\d]/g, '') })
                    }
                    placeholder="Whole number e.g. 48"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Service scope</FieldLabel>
                  <select
                    className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                    value={form.service_scope}
                    onChange={(e) => patch({ service_scope: e.target.value })}
                  >
                    {SERVICE_SCOPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {isAir ? (
              <>
                <label className="block sm:col-span-1">
                  <FieldLabel required>Origin airport code</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={L.origin_airport_code}
                    value={form.origin_airport_code}
                    onChange={(e) =>
                      patch({
                        origin_airport_code: normalizeBookingIataInput(e.target.value).slice(
                          0,
                          L.origin_airport_code,
                        ),
                      })
                    }
                    placeholder="IATA e.g. DXB"
                  />
                </label>
                <label className="block sm:col-span-1">
                  <FieldLabel required>Dest airport code</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={L.dest_airport_code}
                    value={form.dest_airport_code}
                    onChange={(e) =>
                      patch({
                        dest_airport_code: normalizeBookingIataInput(e.target.value).slice(
                          0,
                          L.dest_airport_code,
                        ),
                      })
                    }
                    placeholder="IATA e.g. RUH"
                  />
                </label>
                <label className="block">
                  <FieldLabel required>Pieces</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    value={form.pieces}
                    onChange={(e) =>
                      patch({ pieces: e.target.value.replace(/[^\d]/g, '') })
                    }
                    placeholder="Whole number e.g. 10"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Volume CBM</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={form.volume_cbm}
                    onChange={(e) =>
                      patch({ volume_cbm: e.target.value.replace(/[^\d.]/g, '') })
                    }
                    placeholder="e.g. 1.250"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Pallet count</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    value={form.pallet_count}
                    onChange={(e) =>
                      patch({ pallet_count: e.target.value.replace(/[^\d]/g, '') })
                    }
                    placeholder="Whole number"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Chargeable weight (kg)</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={form.chargeable_weight_kg}
                    onChange={(e) =>
                      patch({
                        chargeable_weight_kg: e.target.value.replace(/[^\d.]/g, ''),
                      })
                    }
                    placeholder="e.g. 125.500"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <FieldLabel>Origin door address</FieldLabel>
                  <Input
                    className="mt-1"
                    value={form.origin_door_address}
                    onChange={(e) => patch({ origin_door_address: e.target.value })}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <FieldLabel>Dest door address</FieldLabel>
                  <Input
                    className="mt-1"
                    value={form.dest_door_address}
                    onChange={(e) => patch({ dest_door_address: e.target.value })}
                  />
                </label>
              </>
            ) : isWarehouse ? (
              <>
                <label className="block sm:col-span-1">
                  <FieldLabel required>Pickup / origin address</FieldLabel>
                  <Input
                    className="mt-1"
                    value={form.origin_door_address}
                    onChange={(e) => {
                      const v = e.target.value;
                      patch({
                        origin_door_address: v,
                        pol: v.slice(0, L.pol),
                      });
                    }}
                    placeholder="e.g. Customer warehouse / factory — Jebel Ali"
                  />
                </label>
                <label className="block sm:col-span-1">
                  <FieldLabel required>Warehouse name</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={API_MAX_LENGTH.UpsertWarehouseBookingFormDto.warehouse_name}
                    value={form.warehouse_name}
                    onChange={(e) => {
                      const v = e.target.value.slice(0, 200);
                      patch({
                        warehouse_name: v,
                        pod: v.slice(0, L.pod),
                        dest_door_address: form.dest_door_address.trim() || v,
                      });
                    }}
                    placeholder="e.g. JAFZA Free Zone Warehouse"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <FieldLabel>Delivery / collection address</FieldLabel>
                  <Input
                    className="mt-1"
                    value={form.dest_door_address}
                    onChange={(e) => patch({ dest_door_address: e.target.value })}
                    placeholder="Optional — where cargo is collected after storage"
                  />
                </label>
                <label className="block">
                  <FieldLabel>Volume CBM</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={form.volume_cbm}
                    onChange={(e) => patch({ volume_cbm: e.target.value })}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Expected inbound</FieldLabel>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    value={form.expected_inbound_at}
                    onChange={(e) => patch({ expected_inbound_at: e.target.value })}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Expected outbound</FieldLabel>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    value={form.expected_outbound_at}
                    onChange={(e) => patch({ expected_outbound_at: e.target.value })}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Storage days requested</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="numeric"
                    value={form.storage_days_requested}
                    onChange={(e) => patch({ storage_days_requested: e.target.value })}
                  />
                </label>
                <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.bonded}
                      onChange={(e) => patch({ bonded: e.target.checked })}
                    />
                    Bonded storage
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.temperature_controlled}
                      onChange={(e) => patch({ temperature_controlled: e.target.checked })}
                    />
                    Temperature controlled
                  </label>
                </div>
                <label className="block sm:col-span-2 lg:col-span-3">
                  <FieldLabel>Handling instructions</FieldLabel>
                  <textarea
                    className="mt-1 min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm"
                    value={form.handling_instructions}
                    onChange={(e) => patch({ handling_instructions: e.target.value })}
                  />
                </label>
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <FieldLabel>Stock lines (SKU)</FieldLabel>
                  {form.stock_lines.map((line, idx) => (
                    <div key={idx} className="grid gap-2 sm:grid-cols-5">
                      <Input
                        placeholder="SKU"
                        maxLength={API_MAX_LENGTH.WhStockLineInputDto.sku_code}
                        value={line.sku_code}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            stock_lines: prev.stock_lines.map((l, i) =>
                              i === idx ? { ...l, sku_code: e.target.value } : l,
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Description"
                        maxLength={API_MAX_LENGTH.WhStockLineInputDto.description}
                        value={line.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            stock_lines: prev.stock_lines.map((l, i) =>
                              i === idx ? { ...l, description: e.target.value } : l,
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Qty"
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            stock_lines: prev.stock_lines.map((l, i) =>
                              i === idx ? { ...l, quantity: e.target.value } : l,
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Unit"
                        maxLength={API_MAX_LENGTH.WhStockLineInputDto.unit}
                        value={line.unit}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            stock_lines: prev.stock_lines.map((l, i) =>
                              i === idx ? { ...l, unit: e.target.value } : l,
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="CBM"
                        inputMode="decimal"
                        value={line.cbm}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            stock_lines: prev.stock_lines.map((l, i) =>
                              i === idx ? { ...l, cbm: e.target.value } : l,
                            ),
                          }))
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        stock_lines: [
                          ...prev.stock_lines,
                          {
                            sku_code: '',
                            description: '',
                            quantity: '',
                            unit: '',
                            cbm: '',
                          },
                        ],
                      }))
                    }
                  >
                    Add stock line
                  </Button>
                </div>
              </>
            ) : isLandish || isCustoms ? (
              <>
                {isCustoms ? (
                  <>
                    <label className="block">
                      <FieldLabel required>Direction</FieldLabel>
                      <select
                        className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                        value={form.direction}
                        onChange={(e) => patch({ direction: e.target.value })}
                      >
                        {CC_DIRECTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <FieldLabel required>Border / port</FieldLabel>
                      <Input
                        className="mt-1"
                        value={form.border_or_port}
                        onChange={(e) => patch({ border_or_port: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Port of entry</FieldLabel>
                      <Input
                        className="mt-1"
                        value={form.port_of_entry}
                        onChange={(e) => patch({ port_of_entry: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Port of exit</FieldLabel>
                      <Input
                        className="mt-1"
                        value={form.port_of_exit}
                        onChange={(e) => patch({ port_of_exit: e.target.value })}
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Country of origin</FieldLabel>
                      <Input
                        className="mt-1"
                        maxLength={2}
                        value={form.country_of_origin}
                        onChange={(e) =>
                          patch({
                            country_of_origin: normalizeBookingIsoCountryInput(e.target.value),
                          })
                        }
                        placeholder="ISO-2 e.g. AE"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Country of destination</FieldLabel>
                      <Input
                        className="mt-1"
                        maxLength={2}
                        value={form.country_of_destination}
                        onChange={(e) =>
                          patch({
                            country_of_destination: normalizeBookingIsoCountryInput(
                              e.target.value,
                            ),
                          })
                        }
                        placeholder="ISO-2 e.g. SA"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Invoice value</FieldLabel>
                      <Input
                        className="mt-1"
                        inputMode="decimal"
                        value={form.invoice_value_amount}
                        onChange={(e) =>
                          patch({
                            invoice_value_amount: e.target.value.replace(/[^\d.]/g, ''),
                          })
                        }
                        placeholder="e.g. 1500.00"
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>Invoice currency</FieldLabel>
                      <Input
                        className="mt-1"
                        maxLength={3}
                        value={form.invoice_currency}
                        onChange={(e) =>
                          patch({
                            invoice_currency: normalizeBookingCurrencyInput(e.target.value),
                          })
                        }
                        placeholder="USD"
                      />
                    </label>
                  </>
                ) : null}
                <label className="block sm:col-span-1">
                  <FieldLabel required>Origin city / country</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={API_MAX_LENGTH.UpsertLandBookingFormDto.origin_city_country}
                    value={form.origin_city_country}
                    onChange={(e) => {
                      const v = e.target.value;
                      patch({
                        origin_city_country: v,
                        pol: v.slice(0, L.pol),
                      });
                    }}
                    placeholder="e.g. Dubai, AE"
                  />
                </label>
                <label className="block sm:col-span-1">
                  <FieldLabel required>Dest city / country</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={API_MAX_LENGTH.UpsertLandBookingFormDto.dest_city_country}
                    value={form.dest_city_country}
                    onChange={(e) => {
                      const v = e.target.value;
                      patch({
                        dest_city_country: v,
                        pod: v.slice(0, L.pod),
                      });
                    }}
                    placeholder="e.g. Riyadh, SA"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <FieldLabel>Origin door address</FieldLabel>
                  <Input
                    className="mt-1"
                    value={form.origin_door_address}
                    onChange={(e) => patch({ origin_door_address: e.target.value })}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <FieldLabel>Dest door address</FieldLabel>
                  <Input
                    className="mt-1"
                    value={form.dest_door_address}
                    onChange={(e) => patch({ dest_door_address: e.target.value })}
                  />
                </label>
                {formKind === 'land' || formKind === 'road' ? (
                  <>
                    <label className="block">
                      <FieldLabel>Vehicle type</FieldLabel>
                      <select
                        className="mt-1 h-9 w-full rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                        value={form.vehicle_type}
                        onChange={(e) => patch({ vehicle_type: e.target.value })}
                      >
                        <option value="">—</option>
                        {VEHICLE_TYPES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <FieldLabel>Incoterms</FieldLabel>
                      <Input
                        className="mt-1"
                        value={form.incoterms}
                        onChange={(e) => patch({ incoterms: e.target.value })}
                      />
                    </label>
                  </>
                ) : null}
                {formKind === 'road' ? (
                  <label className="block">
                    <FieldLabel>Border crossing</FieldLabel>
                    <Input
                      className="mt-1"
                      maxLength={API_MAX_LENGTH.UpsertRoadFreightBookingFormDto.border_crossing}
                      value={form.border_crossing}
                      onChange={(e) => patch({ border_crossing: e.target.value })}
                    />
                  </label>
                ) : null}
                {formKind === 'courier' ? (
                  <label className="block">
                    <FieldLabel>Tracking number</FieldLabel>
                    <Input
                      className="mt-1"
                      maxLength={API_MAX_LENGTH.UpsertCourierBookingFormDto.tracking_number}
                      value={form.tracking_number}
                      onChange={(e) => patch({ tracking_number: e.target.value })}
                    />
                  </label>
                ) : null}
                <label className="block">
                  <FieldLabel>ETD</FieldLabel>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    value={form.etd}
                    onChange={(e) => patch({ etd: e.target.value })}
                  />
                </label>
                <label className="block">
                  <FieldLabel>ETA</FieldLabel>
                  <Input
                    className="mt-1"
                    type="datetime-local"
                    value={form.eta}
                    onChange={(e) => patch({ eta: e.target.value })}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Volume CBM</FieldLabel>
                  <Input
                    className="mt-1"
                    inputMode="decimal"
                    value={form.volume_cbm}
                    onChange={(e) => patch({ volume_cbm: e.target.value })}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block sm:col-span-1">
                  <FieldLabel required>POL – Port of Loading</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={L.pol}
                    value={form.pol}
                    onChange={(e) => patch({ pol: e.target.value.slice(0, L.pol) })}
                    placeholder="Port of Loading required"
                  />
                </label>
                <label className="block sm:col-span-1">
                  <FieldLabel required>POD – Port of Discharge</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={L.pod}
                    value={form.pod}
                    onChange={(e) => patch({ pod: e.target.value.slice(0, L.pod) })}
                    placeholder="Port of Discharge required"
                  />
                </label>
              </>
            )}
            <label className="block">
              <FieldLabel required>Gross weight (kg)</FieldLabel>
              <Input
                className="mt-1"
                inputMode="decimal"
                value={form.gross_weight_kg}
                onChange={(e) =>
                  patch({ gross_weight_kg: e.target.value.replace(/[^\d.]/g, '') })
                }
                placeholder="e.g. 1000.500"
              />
            </label>
            <label className="block">
              <FieldLabel required>Net weight (kg)</FieldLabel>
              <Input
                className="mt-1"
                inputMode="decimal"
                value={form.net_weight_kg}
                onChange={(e) =>
                  patch({ net_weight_kg: e.target.value.replace(/[^\d.]/g, '') })
                }
                placeholder="Must be ≤ gross weight"
              />
            </label>
            {isSea ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <FieldLabel required>Shipper&apos;s owned container (SOC)?</FieldLabel>
                <ChoiceToggle
                  value={form.shipper_owned_container}
                  onChange={(v) => patch({ shipper_owned_container: v })}
                  options={[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]}
                />
              </div>
            ) : null}
            <div className="sm:col-span-2 lg:col-span-3">
              <FieldLabel required>DG / Non-DG cargo</FieldLabel>
              <ChoiceToggle
                value={form.is_dg}
                onChange={(v) => patch({ is_dg: v })}
                options={[
                  { label: 'DG (Dangerous Goods)', value: true },
                  { label: 'Non-DG', value: false },
                ]}
              />
            </div>
            {form.is_dg ? (
              <label className="block sm:col-span-1">
                <FieldLabel required={isWarehouse}>DG class</FieldLabel>
                <Input
                  className="mt-1"
                  maxLength={API_MAX_LENGTH.UpsertWarehouseBookingFormDto.dg_class}
                  value={form.dg_class}
                  onChange={(e) => patch({ dg_class: e.target.value.trim() })}
                  placeholder="e.g. 3 or 2.1"
                />
              </label>
            ) : null}
            {isAir ? (
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <FieldLabel>Pallet lines</FieldLabel>
                {form.pallets.map((line, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <Input
                      label="Type"
                      maxLength={L.pallet_type}
                      value={line.pallet_type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pallets: prev.pallets.map((p, i) =>
                            i === idx ? { ...p, pallet_type: e.target.value } : p,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Count"
                      inputMode="numeric"
                      value={line.count}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pallets: prev.pallets.map((p, i) =>
                            i === idx ? { ...p, count: e.target.value } : p,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="L cm"
                      inputMode="decimal"
                      value={line.length_cm}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pallets: prev.pallets.map((p, i) =>
                            i === idx ? { ...p, length_cm: e.target.value } : p,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="W cm"
                      inputMode="decimal"
                      value={line.width_cm}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pallets: prev.pallets.map((p, i) =>
                            i === idx ? { ...p, width_cm: e.target.value } : p,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="H cm"
                      inputMode="decimal"
                      value={line.height_cm}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pallets: prev.pallets.map((p, i) =>
                            i === idx ? { ...p, height_cm: e.target.value } : p,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Weight kg"
                      inputMode="decimal"
                      value={line.weight_kg}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          pallets: prev.pallets.map((p, i) =>
                            i === idx ? { ...p, weight_kg: e.target.value } : p,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      pallets: [
                        ...prev.pallets,
                        {
                          pallet_type: '',
                          count: '1',
                          length_cm: '',
                          width_cm: '',
                          height_cm: '',
                          weight_kg: '',
                        },
                      ],
                    }))
                  }
                >
                  Add pallet line
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {step.id === 'shipper' ? (
          <PartyFields
            party={form.shipper}
            onChange={(shipper) => patch({ shipper })}
          />
        ) : null}

        {step.id === 'consignee' ? (
          <PartyFields
            party={form.consignee}
            onChange={(consignee) => patch({ consignee })}
          />
        ) : null}

        {step.id === 'notify' ? (
          <div className="space-y-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                patch({
                  notify: {
                    ...form.consignee,
                    full_name: form.consignee.full_name || 'Same as consignee',
                  },
                })
              }
            >
              Same as consignee
            </Button>
            <PartyFields party={form.notify} onChange={(notify) => patch({ notify })} nameRequired={false} />
          </div>
        ) : null}

        {step.id === 'billing' ? (
          <div className="space-y-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                patch({
                  billing: {
                    ...form.consignee,
                    full_name: form.consignee.full_name || 'Same as consignee',
                  },
                })
              }
            >
              Same as consignee
            </Button>
            <PartyFields
              party={form.billing}
              onChange={(billing) => patch({ billing })}
              nameRequired={false}
            />
          </div>
        ) : null}

        {step.id === 'commodity' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <FieldLabel required>Commodity</FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.commodity}
                value={form.commodity}
                onChange={(e) => patch({ commodity: e.target.value.slice(0, L.commodity) })}
              />
            </label>
            <label className="block">
              <FieldLabel>HS code</FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.hs_code}
                value={form.hs_code}
                onChange={(e) =>
                  patch({
                    hs_code: e.target.value.replace(/[^\d.]/g, '').slice(0, L.hs_code),
                  })
                }
                onBlur={() =>
                  patch({
                    hs_code: normalizeBookingHsCodeInput(form.hs_code).slice(0, L.hs_code),
                  })
                }
                placeholder="e.g. 8517 or 8517.12"
              />
            </label>
            {isWarehouse ? (
              <label className="block">
                <FieldLabel>Cargo category</FieldLabel>
                <select
                  className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                  value={form.cargo_category}
                  onChange={(e) => patch({ cargo_category: e.target.value })}
                >
                  {CARGO_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <label className="block">
                  <FieldLabel>Final use</FieldLabel>
                  <Input
                    className="mt-1"
                    maxLength={L.final_use}
                    value={form.final_use}
                    onChange={(e) => patch({ final_use: e.target.value.slice(0, L.final_use) })}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Activity sector</FieldLabel>
                  <select
                    className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                    value={form.activity_sector}
                    onChange={(e) =>
                      patch({
                        activity_sector: asSector(e.target.value),
                      })
                    }
                  >
                    <option value="">—</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label className="block sm:col-span-2">
              <FieldLabel>Insurance details</FieldLabel>
              <Input
                className="mt-1"
                value={form.insurance_details}
                onChange={(e) => patch({ insurance_details: e.target.value })}
              />
            </label>
            {!isWarehouse ? (
              <label className="block sm:col-span-2">
                <FieldLabel>LC bank details</FieldLabel>
                <Input
                  className="mt-1"
                  value={form.lc_bank_details}
                  onChange={(e) => patch({ lc_bank_details: e.target.value })}
                />
              </label>
            ) : null}
            <label className="block sm:col-span-2">
              <FieldLabel>Request details</FieldLabel>
              <Input
                className="mt-1"
                value={form.request_details}
                onChange={(e) => patch({ request_details: e.target.value })}
              />
            </label>
          </div>
        ) : null}

        {step.id === 'documents' ? (
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-neutral-500)]">
              Documents Checklist — upload each required file below
              {usesPortalComplianceDocs
                ? ' (correspondence and COD form are optional)'
                : ''}
              . Submit is blocked until all five mandatory documents are uploaded.
            </p>
            {!usesPortalComplianceDocs ? (
              <p className="text-xs text-amber-800 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                File upload needs a linked booking or shipment. If upload fails, ask your forwarder
                to link the booking, then return here to attach your documents.
              </p>
            ) : null}
            <BookingDocumentUploadList
              kinds={portalDocKinds}
              uploadedKinds={uploadedDocKinds}
              uploadingKind={uploadingKind}
              disabled={saveForm.isPending || submitted}
              requiredKinds={new Set(MANDATORY_BOOKING_DOCUMENT_KINDS)}
              onUpload={async (kind, file) => {
                setUploadingKind(kind);
                try {
                  await uploadDoc.mutateAsync({
                    kind,
                    file,
                    isAir,
                    jobId,
                    bookingId,
                    jobType: quote.jobType,
                  });
                  setUploadedDocKinds((prev) => new Set(prev).add(kind));
                  // Keep legacy attach_* flags in sync for PUT form payload.
                  if (kind === 'commercial_invoice') {
                    patch({ attach_commercial_invoice: true });
                  } else if (kind === 'licence') {
                    patch({ attach_licence: true });
                  } else if (kind === 'correspondence') {
                    patch({ attach_correspondence: true });
                  } else if (kind === 'cod_form') {
                    patch({ attach_cod_form: true });
                  } else if (kind === 'packing_list') {
                    patch({ attach_packing_list: true });
                  } else if (kind === 'bill_of_lading') {
                    patch({ attach_bl_awb_copy: true });
                  }
                } finally {
                  setUploadingKind(null);
                }
              }}
            />
          </div>
        ) : null}

        {step.id === 'agent' ? (
          isWarehouse ? (
            <div className="space-y-4">
              <PartyFields
                party={form.agentParty}
                onChange={(agentParty) =>
                  patch({
                    agentParty,
                    booking_agent_line: agentParty.full_name || form.booking_agent_line,
                    agent_requester_name:
                      agentParty.other_details || form.agent_requester_name,
                  })
                }
                nameRequired={false}
              />
              <label className="block">
                <FieldLabel>Booking / storage ref (voyage_ref)</FieldLabel>
                <Input
                  className="mt-1"
                  maxLength={L.voyage_ref}
                  value={form.voyage_ref}
                  onChange={(e) => patch({ voyage_ref: e.target.value.slice(0, L.voyage_ref) })}
                  placeholder="e.g. WH-BK-2026-0048"
                />
              </label>
              <label className="block">
                <FieldLabel>Client booking no</FieldLabel>
                <Input
                  className="mt-1"
                  maxLength={L.client_booking_no}
                  value={form.client_booking_no}
                  onChange={(e) =>
                    patch({ client_booking_no: e.target.value.slice(0, L.client_booking_no) })
                  }
                />
              </label>
            </div>
          ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Booking agent line</FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.booking_agent_line}
                value={form.booking_agent_line}
                onChange={(e) =>
                  patch({ booking_agent_line: e.target.value.slice(0, L.booking_agent_line) })
                }
                placeholder="KINGFISHER"
              />
            </label>
            <label className="block">
              <FieldLabel>Agent requester name</FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.agent_requester_name}
                value={form.agent_requester_name}
                onChange={(e) =>
                  patch({
                    agent_requester_name: e.target.value.slice(0, L.agent_requester_name),
                  })
                }
              />
            </label>
            <label className="block">
              <FieldLabel>
                {isAir
                  ? 'Flight / booking ref (voyage_ref)'
                  : 'Voyage ref'}
              </FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.voyage_ref}
                value={form.voyage_ref}
                onChange={(e) => patch({ voyage_ref: e.target.value.slice(0, L.voyage_ref) })}
                placeholder={isAir ? 'e.g. EK512 / booking ref' : undefined}
              />
            </label>
            <label className="block">
              <FieldLabel>
                {isAir ? 'Quote / booking reference' : 'SQ / BL booking reference'}
              </FieldLabel>
              <Input
                className="mt-1"
                maxLength={L.sq_bl_booking_reference}
                value={form.sq_bl_booking_reference}
                onChange={(e) =>
                  patch({
                    sq_bl_booking_reference: e.target.value.slice(0, L.sq_bl_booking_reference),
                  })
                }
              />
            </label>
          </div>
          )
        ) : null}

        {step.id === 'review' ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-md border border-[var(--color-neutral-200)]">
              <table className="w-full text-left text-sm">
                <tbody>
                  {reviewRows.map(([k, v]) => (
                    <tr key={k} className="border-b border-[var(--color-neutral-100)] last:border-0">
                      <th className="w-1/3 bg-[var(--color-neutral-50)] px-3 py-2 font-medium text-[var(--color-neutral-600)]">
                        {k}
                      </th>
                      <td className="px-3 py-2 text-[var(--color-neutral-900)]">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label className="inline-flex items-start gap-2 text-sm text-[var(--color-neutral-700)]">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.consent_accepted}
                onChange={(e) => patch({ consent_accepted: e.target.checked })}
              />
              <span>
                I confirm these booking details are accurate (
                <code className="text-xs">consent_accepted</code>).
              </span>
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-neutral-100)] pt-5">
          <div className="flex flex-wrap gap-2">
            {stepIndex > 0 ? (
              <Button type="button" size="md" variant="secondary" onClick={goBack}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              size="md"
              variant="ghost"
              disabled={saveForm.isPending || formQuery.isLoading}
              onClick={() => submit(false)}
            >
              Save draft
            </Button>
          </div>
          <Button
            type="button"
            size="lg"
            disabled={saveForm.isPending || formQuery.isLoading}
            onClick={goNext}
            className="min-w-[9rem] bg-[var(--color-secondary)] px-6 font-semibold text-white hover:opacity-90 focus:ring-[var(--color-secondary)]"
          >
            {saveForm.isPending
              ? 'Submitting…'
              : stepIndex >= steps.length - 1
                ? 'Submit'
                : 'Continue →'}
          </Button>
        </div>
      </div>
    </PortalPanel>
    </div>
  );
}
