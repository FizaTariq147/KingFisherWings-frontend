import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { API_DEFAULTS, API_ENUMS, API_MAX_LENGTH } from '@/lib/api/apiSchema.generated';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import {
  baseCurrencyCode,
  MasterCodeDatalist,
  useMasterCodeOptions,
} from '@/features/masters/hooks/useMasterCodeOptions';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { BookingDocumentUploadList } from '@/features/booking-documents/components/BookingDocumentUploadList';
import {
  BOOKING_DOCUMENT_KIND_LABELS,
  MANDATORY_BOOKING_DOCUMENT_KINDS,
  MODE_BOOKING_FORM_DOCUMENT_KINDS,
  missingMandatoryBookingDocs,
} from '@/features/booking-documents/constants/bookingDocumentKinds';
import {
  staffBookingFormApiLabel,
  useStaffBookingForm,
  useStaffBookingFormActions,
} from '../hooks/useStaffBookingForm';
import { useJobs } from '../hooks/useJobs';
import type {
  BookingFormPartyDto,
  BookingFormPartyKind,
  CcCargoLineInputDto,
  ContainerSizeLineDto,
  JobCargoCategory,
  JobServiceScope,
  ModeBookingForm,
  StaffBookingFormMode,
  WhStockLineInputDto,
} from '../types/job.types';
import {
  modeBookingFormIsEmpty,
  portalPayloadToModeBookingFormDto,
} from '../utils/applyPortalPayloadToModeBookingForm';
import { getErrorMessage } from '../utils/getErrorMessage';

type PanelMode = 'list' | 'view' | 'edit' | 'create';

function ActionIconButton({
  label,
  onClick,
  disabled,
  tone = 'neutral',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'neutral' | 'primary' | 'danger';
  children: React.ReactNode;
}) {
  const toneClass =
    tone === 'danger'
      ? 'text-[var(--color-danger-500)] hover:bg-[var(--color-danger-100)]'
      : tone === 'primary'
        ? 'text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]'
        : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]';
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex size-8 items-center justify-center rounded-md transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        toneClass,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// Option lists come from the OpenAPI spec — regenerate with `npm run gen:api-schema`.
const SERVICE_SCOPES: readonly JobServiceScope[] = API_ENUMS.UpsertSeaFclBookingFormDto.service_scope;
const CARGO_CATEGORIES: readonly JobCargoCategory[] = API_ENUMS.UpsertSeaFclBookingFormDto.cargo_category;
// Booking-form DTOs type these as free strings; the job-detail DTOs carry the enums.
const FREIGHT_TERMS = API_ENUMS.UpdateSeaFclJobDetailDto.freight_terms;
const VEHICLE_TYPES = API_ENUMS.UpdateLandJobDetailDto.vehicle_type;
const PARTY_KINDS: readonly BookingFormPartyKind[] = API_ENUMS.BookingFormPartyDto.party_kind;
const ENTITY_KINDS = API_ENUMS.BookingFormPartyDto.entity_kind;
type EntityKind = (typeof ENTITY_KINDS)[number];

const UNIT_LIST_ID = 'kfw-booking-uom-options';
const CURRENCY_LIST_ID = 'kfw-booking-currency-options';

function asEntityKind(v: unknown): EntityKind | '' {
  return (ENTITY_KINDS as readonly unknown[]).includes(v) ? (v as EntityKind) : '';
}

const ATTACH_FLAGS_COMMON: { key: keyof ModeBookingForm; label: string }[] = [
  { key: 'attach_commercial_invoice', label: 'Commercial invoice' },
  { key: 'attach_packing_list', label: 'Packing list' },
  { key: 'attach_bl_awb_copy', label: 'BL / AWB copy' },
  { key: 'attach_carnet', label: 'Carnet' },
  { key: 'attach_vehicle_title', label: 'Vehicle title' },
  { key: 'attach_msds', label: 'MSDS' },
  { key: 'attach_dangerous_goods_declaration', label: 'DG declaration' },
  { key: 'attach_health_veterinary', label: 'Health / veterinary' },
  { key: 'attach_fda_moh', label: 'FDA / MOH' },
];

/** Customs Clearance only — not on sea/land/warehouse booking DTOs. */
const ATTACH_FLAGS_CUSTOMS: { key: keyof ModeBookingForm; label: string }[] = [
  { key: 'attach_coo', label: 'Certificate of Origin (COO)' },
  { key: 'attach_poa', label: 'Power of Attorney / CHA (POA)' },
  { key: 'attach_permit', label: 'Permits / licenses' },
];

const ATTACH_FLAGS_ALL = [...ATTACH_FLAGS_COMMON, ...ATTACH_FLAGS_CUSTOMS];

function attachFlagsForMode(mode: StaffBookingFormMode) {
  return mode === 'CUSTOMS_CLEARANCE' ? ATTACH_FLAGS_ALL : ATTACH_FLAGS_COMMON;
}

const CC_DIRECTIONS = API_ENUMS.UpsertCustomsClearanceBookingFormDto.direction;

type PartyUi = {
  party_kind: BookingFormPartyKind;
  full_name: string;
  address: string;
  city: string;
  country: string;
  entity_kind: EntityKind | '';
  other_details: string;
};

type FormUi = {
  date_of_request: string;
  client_booking_no: string;
  voyage_ref: string;
  service_scope: string;
  origin_door_address: string;
  dest_door_address: string;
  commodity: string;
  hs_code: string;
  cargo_category: string;
  is_dg: boolean;
  dg_class: string;
  gross_weight_kg: string;
  net_weight_kg: string;
  volume_cbm: string;
  pieces: string;
  insurance_details: string;
  request_details: string;
  mark_complete: boolean;
  consent_accepted: boolean;
  etd: string;
  eta: string;
  incoterms: string;
  freight_terms: string;
  pol: string;
  pod: string;
  shipper_owned_container: boolean;
  teu_count: string;
  cfs_warehouse: string;
  origin_city_country: string;
  dest_city_country: string;
  vehicle_type: string;
  border_crossing: string;
  tracking_number: string;
  warehouse_id: string;
  warehouse_name: string;
  expected_inbound_at: string;
  expected_outbound_at: string;
  storage_days_requested: string;
  bonded: boolean;
  temperature_controlled: boolean;
  handling_instructions: string;
  freight_job_id: string;
  stock_lines: {
    sku_code: string;
    description: string;
    quantity: string;
    unit: string;
    cbm: string;
  }[];
  /** Customs clearance */
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
  cargo_lines: {
    description: string;
    hs_code: string;
    country_of_origin: string;
    quantity: string;
    unit: string;
    value_amount: string;
    currency_code: string;
  }[];
  parties: PartyUi[];
  containers: { container_type_id: string; iso_size: string; count: string }[];
  attaches: Record<string, boolean>;
};

function emptyParty(kind: BookingFormPartyKind): PartyUi {
  return {
    party_kind: kind,
    full_name: '',
    address: '',
    city: '',
    country: '',
    entity_kind: '',
    other_details: '',
  };
}

function emptyForm(): FormUi {
  return {
    date_of_request: '',
    client_booking_no: '',
    voyage_ref: '',
    service_scope: SERVICE_SCOPES[0],
    origin_door_address: '',
    dest_door_address: '',
    commodity: '',
    hs_code: '',
    cargo_category: CARGO_CATEGORIES[0],
    is_dg: false,
    dg_class: '',
    gross_weight_kg: '',
    net_weight_kg: '',
    volume_cbm: '',
    pieces: '',
    insurance_details: '',
    request_details: '',
    mark_complete: false,
    consent_accepted: false,
    etd: '',
    eta: '',
    incoterms: '',
    freight_terms: '',
    pol: '',
    pod: '',
    shipper_owned_container: false,
    teu_count: '',
    cfs_warehouse: '',
    origin_city_country: '',
    dest_city_country: '',
    vehicle_type: '',
    border_crossing: '',
    tracking_number: '',
    warehouse_id: '',
    warehouse_name: '',
    expected_inbound_at: '',
    expected_outbound_at: '',
    storage_days_requested: '',
    bonded: false,
    temperature_controlled: false,
    handling_instructions: '',
    freight_job_id: '',
    stock_lines: [{ sku_code: '', description: '', quantity: '', unit: '', cbm: '' }],
    direction: API_DEFAULTS.UpsertCustomsClearanceBookingFormDto.direction,
    border_or_port: '',
    entry_type: '',
    declaration_type: '',
    port_of_entry: '',
    port_of_exit: '',
    country_of_origin: '',
    country_of_destination: '',
    invoice_value_amount: '',
    invoice_currency: '',
    cargo_lines: [
      {
        description: '',
        hs_code: '',
        country_of_origin: '',
        quantity: '',
        unit: '',
        value_amount: '',
        currency_code: '',
      },
    ],
    parties: PARTY_KINDS.map(emptyParty),
    containers: [{ container_type_id: '', iso_size: '', count: '1' }],
    attaches: Object.fromEntries(ATTACH_FLAGS_ALL.map((a) => [a.key, false])),
  };
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v != null && typeof v !== 'object' ? String(v) : '';
}

function numStr(v: unknown): string {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : typeof v === 'string' ? v : '';
}

function dateInput(v: unknown): string {
  const s = str(v);
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return s;
}

function datetimeLocal(v: unknown): string {
  const s = str(v);
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) return s.slice(0, 16);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return `${s.slice(0, 10)}T00:00`;
  return s;
}

function hydrateForm(raw: unknown): FormUi {
  const base = emptyForm();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;

  const partiesRaw = Array.isArray(r.parties) ? (r.parties as BookingFormPartyDto[]) : [];
  const parties: PartyUi[] = PARTY_KINDS.map((kind) => {
    const found = partiesRaw.find((p) => p.party_kind === kind);
    if (!found) return emptyParty(kind);
    const entity = asEntityKind(found.entity_kind);
    return {
      party_kind: kind,
      full_name: str(found.full_name),
      address: str(found.address),
      city: str(found.city),
      country: str(found.country),
      entity_kind: entity,
      other_details: str(found.other_details),
    };
  });

  const containersRaw = Array.isArray(r.containers)
    ? (r.containers as ContainerSizeLineDto[])
    : [];
  const containers =
    containersRaw.length > 0
      ? containersRaw.map((c) => ({
          container_type_id: str(c.container_type_id),
          iso_size: str(c.iso_size),
          count: numStr(c.count) || '1',
        }))
      : base.containers;

  const stockRaw = Array.isArray(r.stock_lines) ? (r.stock_lines as WhStockLineInputDto[]) : [];
  const stock_lines =
    stockRaw.length > 0
      ? stockRaw.map((line) => ({
          sku_code: str(line.sku_code),
          description: str(line.description),
          quantity: numStr(line.quantity),
          unit: str(line.unit),
          cbm: numStr(line.cbm),
        }))
      : base.stock_lines;

  const cargoRaw = Array.isArray(r.cargo_lines) ? (r.cargo_lines as CcCargoLineInputDto[]) : [];
  const cargo_lines =
    cargoRaw.length > 0
      ? cargoRaw.map((line) => ({
          description: str(line.description),
          hs_code: str(line.hs_code),
          country_of_origin: str(line.country_of_origin),
          quantity: numStr(line.quantity),
          unit: str(line.unit),
          value_amount: numStr(line.value_amount),
          currency_code: str(line.currency_code),
        }))
      : base.cargo_lines;

  const attaches = { ...base.attaches };
  for (const a of ATTACH_FLAGS_ALL) {
    if (typeof r[a.key] === 'boolean') attaches[a.key] = r[a.key] as boolean;
  }

  return {
    ...base,
    date_of_request: dateInput(r.date_of_request),
    client_booking_no: str(r.client_booking_no),
    voyage_ref: str(r.voyage_ref),
    service_scope: str(r.service_scope) || base.service_scope,
    origin_door_address: str(r.origin_door_address),
    dest_door_address: str(r.dest_door_address),
    commodity: str(r.commodity),
    hs_code: str(r.hs_code),
    cargo_category: str(r.cargo_category) || base.cargo_category,
    is_dg: r.is_dg === true,
    dg_class: str(r.dg_class),
    gross_weight_kg: numStr(r.gross_weight_kg),
    net_weight_kg: numStr(r.net_weight_kg),
    volume_cbm: numStr(r.volume_cbm),
    pieces: numStr(r.pieces),
    insurance_details: str(r.insurance_details),
    request_details: str(r.request_details),
    mark_complete: r.mark_complete === true,
    consent_accepted: r.consent_accepted === true,
    etd: datetimeLocal(r.etd),
    eta: datetimeLocal(r.eta),
    incoterms: str(r.incoterms),
    freight_terms: str(r.freight_terms),
    pol: str(r.pol),
    pod: str(r.pod),
    shipper_owned_container: r.shipper_owned_container === true,
    teu_count: numStr(r.teu_count),
    cfs_warehouse: str(r.cfs_warehouse),
    origin_city_country: str(r.origin_city_country),
    dest_city_country: str(r.dest_city_country),
    vehicle_type: str(r.vehicle_type),
    border_crossing: str(r.border_crossing),
    tracking_number: str(r.tracking_number),
    warehouse_id: str(r.warehouse_id),
    warehouse_name: str(r.warehouse_name),
    expected_inbound_at: datetimeLocal(r.expected_inbound_at),
    expected_outbound_at: datetimeLocal(r.expected_outbound_at),
    storage_days_requested: numStr(r.storage_days_requested),
    bonded: r.bonded === true,
    temperature_controlled: r.temperature_controlled === true,
    handling_instructions: str(r.handling_instructions),
    freight_job_id: str(r.freight_job_id),
    stock_lines,
    direction: str(r.direction) || base.direction,
    border_or_port: str(r.border_or_port),
    entry_type: str(r.entry_type),
    declaration_type: str(r.declaration_type),
    port_of_entry: str(r.port_of_entry),
    port_of_exit: str(r.port_of_exit),
    country_of_origin: str(r.country_of_origin),
    country_of_destination: str(r.country_of_destination),
    invoice_value_amount: numStr(r.invoice_value_amount),
    invoice_currency: str(r.invoice_currency),
    cargo_lines,
    parties,
    containers,
    attaches,
  };
}

function parseNum(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function toDto(form: FormUi, mode: StaffBookingFormMode): ModeBookingForm {
  const parties: BookingFormPartyDto[] = form.parties
    .filter((p) => p.full_name.trim() || p.address.trim() || p.city.trim() || p.country.trim())
    .map((p) => ({
      party_kind: p.party_kind,
      full_name: p.full_name.trim() || undefined,
      address: p.address.trim() || undefined,
      city: p.city.trim() || undefined,
      country: p.country.trim() || undefined,
      entity_kind: p.entity_kind || undefined,
      other_details: p.other_details.trim() || undefined,
    }));

  const dto: ModeBookingForm = {
    date_of_request: form.date_of_request || undefined,
    client_booking_no: form.client_booking_no.trim() || undefined,
    voyage_ref: form.voyage_ref.trim() || undefined,
    origin_door_address: form.origin_door_address.trim() || undefined,
    dest_door_address: form.dest_door_address.trim() || undefined,
    commodity: form.commodity.trim() || undefined,
    hs_code: form.hs_code.trim() || undefined,
    cargo_category: form.cargo_category || undefined,
    is_dg: form.is_dg,
    dg_class: form.dg_class.trim() || undefined,
    gross_weight_kg: parseNum(form.gross_weight_kg),
    net_weight_kg: parseNum(form.net_weight_kg),
    volume_cbm: parseNum(form.volume_cbm),
    pieces: parseNum(form.pieces),
    insurance_details: form.insurance_details.trim() || undefined,
    request_details: form.request_details.trim() || undefined,
    mark_complete: form.mark_complete,
    consent_accepted: form.consent_accepted,
    parties: parties.length ? parties : undefined,
  };

  if (mode !== 'WAREHOUSE') {
    dto.service_scope = form.service_scope || undefined;
    dto.etd = form.etd || undefined;
    dto.eta = form.eta || undefined;
  }

  for (const a of attachFlagsForMode(mode)) {
    dto[a.key] = form.attaches[a.key] === true;
  }

  if (mode === 'SEA_FCL' || mode === 'SEA_LCL') {
    dto.pol = form.pol.trim() || undefined;
    dto.pod = form.pod.trim() || undefined;
    dto.incoterms = form.incoterms.trim() || undefined;
    dto.freight_terms = form.freight_terms || undefined;
  }
  if (mode === 'SEA_FCL') {
    dto.shipper_owned_container = form.shipper_owned_container;
    dto.teu_count = parseNum(form.teu_count);
    const containers: ContainerSizeLineDto[] = form.containers
      .map((c) => ({
        container_type_id: c.container_type_id.trim() || undefined,
        iso_size: c.iso_size.trim() || undefined,
        count: parseNum(c.count) ?? 0,
      }))
      .filter((c) => c.count >= 1);
    if (containers.length) dto.containers = containers;
  }
  if (mode === 'SEA_LCL') {
    dto.cfs_warehouse = form.cfs_warehouse.trim() || undefined;
  }
  if (mode === 'LAND' || mode === 'ROAD_FREIGHT') {
    dto.origin_city_country = form.origin_city_country.trim() || undefined;
    dto.dest_city_country = form.dest_city_country.trim() || undefined;
    dto.vehicle_type = form.vehicle_type || undefined;
    dto.incoterms = form.incoterms.trim() || undefined;
  }
  if (mode === 'ROAD_FREIGHT') {
    dto.border_crossing = form.border_crossing.trim() || undefined;
  }
  if (mode === 'COURIER') {
    dto.origin_city_country = form.origin_city_country.trim() || undefined;
    dto.dest_city_country = form.dest_city_country.trim() || undefined;
    dto.tracking_number = form.tracking_number.trim() || undefined;
  }
  if (mode === 'WAREHOUSE') {
    dto.warehouse_id = form.warehouse_id.trim() || undefined;
    dto.warehouse_name = form.warehouse_name.trim() || undefined;
    dto.expected_inbound_at = form.expected_inbound_at || undefined;
    dto.expected_outbound_at = form.expected_outbound_at || undefined;
    dto.storage_days_requested = parseNum(form.storage_days_requested);
    dto.bonded = form.bonded;
    dto.temperature_controlled = form.temperature_controlled;
    dto.handling_instructions = form.handling_instructions.trim() || undefined;
    dto.freight_job_id = form.freight_job_id.trim() || undefined;
    const stock_lines: WhStockLineInputDto[] = form.stock_lines
      .map((line) => ({
        sku_code: line.sku_code.trim() || undefined,
        description: line.description.trim() || undefined,
        quantity: parseNum(line.quantity),
        unit: line.unit.trim() || undefined,
        cbm: parseNum(line.cbm),
      }))
      .filter(
        (line) =>
          Boolean(line.sku_code) ||
          Boolean(line.description) ||
          (line.quantity != null && line.quantity > 0),
      );
    if (stock_lines.length) dto.stock_lines = stock_lines;
  }

  if (mode === 'CUSTOMS_CLEARANCE') {
    dto.direction = form.direction || undefined;
    dto.border_or_port = form.border_or_port.trim() || undefined;
    dto.entry_type = form.entry_type.trim() || undefined;
    dto.declaration_type = form.declaration_type.trim() || undefined;
    dto.port_of_entry = form.port_of_entry.trim() || undefined;
    dto.port_of_exit = form.port_of_exit.trim() || undefined;
    dto.country_of_origin = form.country_of_origin.trim().toUpperCase() || undefined;
    dto.country_of_destination =
      form.country_of_destination.trim().toUpperCase() || undefined;
    dto.incoterms = form.incoterms.trim() || undefined;
    dto.invoice_value_amount = parseNum(form.invoice_value_amount);
    dto.invoice_currency = form.invoice_currency.trim().toUpperCase() || undefined;
    dto.freight_job_id = form.freight_job_id.trim() || undefined;
    const cargo_lines: CcCargoLineInputDto[] = form.cargo_lines
      .map((line) => ({
        description: line.description.trim() || undefined,
        hs_code: line.hs_code.trim() || undefined,
        country_of_origin: line.country_of_origin.trim().toUpperCase() || undefined,
        quantity: parseNum(line.quantity),
        unit: line.unit.trim() || undefined,
        value_amount: parseNum(line.value_amount),
        currency_code:
          line.currency_code.trim().toUpperCase() ||
          form.invoice_currency.trim().toUpperCase() ||
          undefined,
      }))
      .filter(
        (line) =>
          Boolean(line.description) ||
          Boolean(line.hs_code) ||
          (line.quantity != null && line.quantity > 0) ||
          (line.value_amount != null && line.value_amount > 0),
      );
    if (cargo_lines.length) dto.cargo_lines = cargo_lines;
  }

  return dto;
}

function missingCustomsCompleteFields(form: FormUi): string[] {
  const missing: string[] = [];
  if (!form.border_or_port.trim()) missing.push('border / port');
  if (parseNum(form.invoice_value_amount) == null) missing.push('invoice value');
  if (!form.invoice_currency.trim()) missing.push('invoice currency');
  if (!form.attaches.attach_packing_list) missing.push('packing list attached');
  if (!form.attaches.attach_poa) missing.push('POA / CHA attached');
  return missing;
}

/** Client-side mirror of backend `mark_complete` checks — avoids a bare 400. */
function incompleteFormMessage(
  form: FormUi,
  mode: StaffBookingFormMode,
  uploadedDocKinds: Iterable<string>,
): string | null {
  const missingDocs = missingMandatoryBookingDocs(uploadedDocKinds);
  if (missingDocs.length) {
    return `Upload required booking documents: ${missingDocs
      .map((k) => BOOKING_DOCUMENT_KIND_LABELS[k])
      .join(', ')}.`;
  }
  if (mode === 'CUSTOMS_CLEARANCE') {
    const missing = missingCustomsCompleteFields(form);
    return missing.length ? `Customs clearance form incomplete: ${missing.join(', ')}.` : null;
  }
  if (mode === 'SEA_LCL' && !form.cfs_warehouse.trim()) {
    return 'Sea LCL booking form incomplete: CFS warehouse is required to mark the form complete.';
  }
  return null;
}

function mergeFormUiPreferExisting(base: FormUi, fromPortal: FormUi, overwrite: boolean): FormUi {
  const pick = (current: string, next: string) => {
    const n = (next ?? '').trim();
    if (!n) return current;
    if (overwrite || !current.trim()) return n;
    return current;
  };
  const pickBool = (current: boolean, next: boolean) =>
    overwrite ? next : current || next;

  const parties = PARTY_KINDS.map((kind) => {
    const cur = base.parties.find((p) => p.party_kind === kind) ?? emptyParty(kind);
    const nxt = fromPortal.parties.find((p) => p.party_kind === kind) ?? emptyParty(kind);
    const entityRaw = overwrite || !cur.entity_kind ? nxt.entity_kind : cur.entity_kind;
    const entity_kind = asEntityKind(entityRaw);
    return {
      party_kind: kind,
      full_name: pick(cur.full_name, nxt.full_name),
      address: pick(cur.address, nxt.address),
      city: pick(cur.city, nxt.city),
      country: pick(cur.country, nxt.country),
      entity_kind,
      other_details: pick(cur.other_details, nxt.other_details),
    };
  });

  const portalHasContainers = fromPortal.containers.some(
    (c) => c.container_type_id.trim() || c.iso_size.trim() || Number(c.count) > 0,
  );
  const baseHasContainers = base.containers.some(
    (c) => c.container_type_id.trim() || c.iso_size.trim() || Number(c.count) > 1,
  );

  return {
    ...base,
    date_of_request: pick(base.date_of_request, fromPortal.date_of_request),
    client_booking_no: pick(base.client_booking_no, fromPortal.client_booking_no),
    voyage_ref: pick(base.voyage_ref, fromPortal.voyage_ref),
    service_scope: pick(base.service_scope, fromPortal.service_scope) || base.service_scope,
    origin_door_address: pick(base.origin_door_address, fromPortal.origin_door_address),
    dest_door_address: pick(base.dest_door_address, fromPortal.dest_door_address),
    commodity: pick(base.commodity, fromPortal.commodity),
    hs_code: pick(base.hs_code, fromPortal.hs_code),
    cargo_category: pick(base.cargo_category, fromPortal.cargo_category) || base.cargo_category,
    is_dg: pickBool(base.is_dg, fromPortal.is_dg),
    dg_class: pick(base.dg_class, fromPortal.dg_class),
    gross_weight_kg: pick(base.gross_weight_kg, fromPortal.gross_weight_kg),
    net_weight_kg: pick(base.net_weight_kg, fromPortal.net_weight_kg),
    volume_cbm: pick(base.volume_cbm, fromPortal.volume_cbm),
    pieces: pick(base.pieces, fromPortal.pieces),
    insurance_details: pick(base.insurance_details, fromPortal.insurance_details),
    request_details: pick(base.request_details, fromPortal.request_details),
    consent_accepted: pickBool(base.consent_accepted, fromPortal.consent_accepted),
    etd: pick(base.etd, fromPortal.etd),
    eta: pick(base.eta, fromPortal.eta),
    incoterms: pick(base.incoterms, fromPortal.incoterms),
    freight_terms: pick(base.freight_terms, fromPortal.freight_terms),
    pol: pick(base.pol, fromPortal.pol),
    pod: pick(base.pod, fromPortal.pod),
    shipper_owned_container: pickBool(
      base.shipper_owned_container,
      fromPortal.shipper_owned_container,
    ),
    teu_count: pick(base.teu_count, fromPortal.teu_count),
    cfs_warehouse: pick(base.cfs_warehouse, fromPortal.cfs_warehouse),
    origin_city_country: pick(base.origin_city_country, fromPortal.origin_city_country),
    dest_city_country: pick(base.dest_city_country, fromPortal.dest_city_country),
    vehicle_type: pick(base.vehicle_type, fromPortal.vehicle_type),
    border_crossing: pick(base.border_crossing, fromPortal.border_crossing),
    tracking_number: pick(base.tracking_number, fromPortal.tracking_number),
    warehouse_id: pick(base.warehouse_id, fromPortal.warehouse_id),
    warehouse_name: pick(base.warehouse_name, fromPortal.warehouse_name),
    expected_inbound_at: pick(base.expected_inbound_at, fromPortal.expected_inbound_at),
    expected_outbound_at: pick(base.expected_outbound_at, fromPortal.expected_outbound_at),
    storage_days_requested: pick(
      base.storage_days_requested,
      fromPortal.storage_days_requested,
    ),
    bonded: pickBool(base.bonded, fromPortal.bonded),
    temperature_controlled: pickBool(
      base.temperature_controlled,
      fromPortal.temperature_controlled,
    ),
    handling_instructions: pick(base.handling_instructions, fromPortal.handling_instructions),
    freight_job_id: pick(base.freight_job_id, fromPortal.freight_job_id),
    stock_lines:
      overwrite ||
      (!base.stock_lines.some(
        (l) => l.sku_code.trim() || l.description.trim() || Number(l.quantity) > 0,
      ) &&
        fromPortal.stock_lines.some(
          (l) => l.sku_code.trim() || l.description.trim() || Number(l.quantity) > 0,
        ))
        ? fromPortal.stock_lines
        : base.stock_lines,
    direction: pick(base.direction, fromPortal.direction) || base.direction,
    border_or_port: pick(base.border_or_port, fromPortal.border_or_port),
    entry_type: pick(base.entry_type, fromPortal.entry_type),
    declaration_type: pick(base.declaration_type, fromPortal.declaration_type),
    port_of_entry: pick(base.port_of_entry, fromPortal.port_of_entry),
    port_of_exit: pick(base.port_of_exit, fromPortal.port_of_exit),
    country_of_origin: pick(base.country_of_origin, fromPortal.country_of_origin),
    country_of_destination: pick(
      base.country_of_destination,
      fromPortal.country_of_destination,
    ),
    invoice_value_amount: pick(base.invoice_value_amount, fromPortal.invoice_value_amount),
    invoice_currency: pick(base.invoice_currency, fromPortal.invoice_currency),
    cargo_lines:
      overwrite ||
      (!base.cargo_lines.some(
        (l) =>
          l.description.trim() ||
          l.hs_code.trim() ||
          Number(l.quantity) > 0 ||
          Number(l.value_amount) > 0,
      ) &&
        fromPortal.cargo_lines.some(
          (l) =>
            l.description.trim() ||
            l.hs_code.trim() ||
            Number(l.quantity) > 0 ||
            Number(l.value_amount) > 0,
        ))
        ? fromPortal.cargo_lines
        : base.cargo_lines,
    parties,
    containers:
      overwrite || (!baseHasContainers && portalHasContainers)
        ? fromPortal.containers
        : base.containers,
    attaches: Object.fromEntries(
      ATTACH_FLAGS_ALL.map((a) => [
        a.key,
        pickBool(Boolean(base.attaches[a.key]), Boolean(fromPortal.attaches[a.key])),
      ]),
    ),
  };
}

function applyPortalPayloadToFormUi(
  prev: FormUi,
  payload: PortalBookingFormMessagePayload,
  opts?: { overwrite?: boolean; jobTypeOverride?: string | null },
): FormUi {
  const fromPortal = hydrateForm(
    portalPayloadToModeBookingFormDto(payload, {
      jobTypeOverride: opts?.jobTypeOverride ?? payload.jobType,
    }),
  );
  return mergeFormUiPreferExisting(prev, fromPortal, Boolean(opts?.overwrite));
}

const modeTitle: Record<StaffBookingFormMode, string> = {
  SEA_FCL: 'Sea FCL booking form',
  SEA_LCL: 'Sea LCL booking form',
  LAND: 'Land booking form',
  ROAD_FREIGHT: 'Road freight booking form',
  COURIER: 'Courier booking form',
  WAREHOUSE: 'Warehouse booking form',
  CUSTOMS_CLEARANCE: 'Customs clearance booking form',
};

/** Portal booking form field chrome (visual only). */
const portalFieldClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-50)]';
const portalLabelClass =
  'flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-600)]';

export function ModeBookingFormPanel({
  jobId,
  mode,
}: {
  jobId: string;
  mode: StaffBookingFormMode;
}) {
  const query = useStaffBookingForm(jobId, mode);
  const { save, complete, uploadDocument } = useStaffBookingFormActions(jobId, mode);
  const [uploadedDocKinds, setUploadedDocKinds] = useState<Set<string>>(() => new Set());
  const [uploadingKind, setUploadingKind] = useState<string | null>(null);
  const { data: containerTypes = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    mode === 'SEA_FCL',
  );
  const { data: warehouseMasters = [] } = useMasterOptions(
    'warehouses',
    MASTER_PATHS.warehouses,
    mode === 'WAREHOUSE' || mode === 'SEA_LCL',
  );
  const unitOptions = useMasterCodeOptions(
    'units-of-measure',
    mode === 'WAREHOUSE' || mode === 'CUSTOMS_CLEARANCE',
  );
  const currencyOptions = useMasterCodeOptions('currencies', mode === 'CUSTOMS_CLEARANCE');
  const baseCurrency = baseCurrencyCode(currencyOptions);
  const { data: jobsList } = useJobs(
    { page: 1, limit: 100 },
    { enabled: mode === 'WAREHOUSE' || mode === 'CUSTOMS_CLEARANCE' },
  );
  const freightJobOptions = useMemo(() => {
    const jobs = jobsList?.jobs ?? [];
    return jobs
      .filter((j) => j.id && j.id !== jobId)
      .map((j) => ({
        id: j.id,
        label: j.job_number || j.id.slice(0, 8),
      }));
  }, [jobsList?.jobs, jobId]);

  const linkedQuoteQuery = useQuery({
    queryKey: ['quotations', 'linked-to-job', jobId],
    queryFn: () => quotationService.findLinkedToJob(jobId),
    enabled: Boolean(jobId),
    staleTime: 60_000,
    retry: 1,
  });
  const linkedQuote = linkedQuoteQuery.data;
  const linkedJobType = String(linkedQuote?.job_type ?? mode).toUpperCase();
  const jobTypePrefix = linkedJobType.split('_')[0];

  const portalBookingQuery = useCustomerPortalBookingForm(
    {
      jobId,
      quotationId: linkedQuote?.id,
      quoteNumber: linkedQuote?.quotation_number || linkedQuote?.quote_no,
      jobTypePrefix,
    },
    Boolean(jobId),
  );

  const [panelMode, setPanelMode] = useState<PanelMode>('list');
  const [form, setForm] = useState<FormUi>(emptyForm);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [portalPrefillApplied, setPortalPrefillApplied] = useState(false);
  /** Optimistic Completed flag after POST /complete (GET may lag). */
  const [forceCompleted, setForceCompleted] = useState(false);

  const hasSavedForm = useMemo(() => !modeBookingFormIsEmpty(query.data), [query.data]);
  const readOnly = panelMode === 'view';
  const isSea = mode === 'SEA_FCL' || mode === 'SEA_LCL';
  const isLandish = mode === 'LAND' || mode === 'ROAD_FREIGHT' || mode === 'COURIER';
  const isWarehouse = mode === 'WAREHOUSE';
  const isCustoms = mode === 'CUSTOMS_CLEARANCE';
  /** Match customer portal booking form visual chrome for every job type. */
  const selectClass = portalFieldClass;
  const labelCls = portalLabelClass;
  const sectionCardClass =
    'rounded-[20px] border-[var(--color-neutral-100)] shadow-[0_10px_30px_rgba(10,41,66,0.05)]';
  const sectionHeaderClass = 'border-b-0 pb-1 mb-2';
  const sectionTitleClass =
    'text-base font-semibold tracking-tight text-[var(--color-neutral-900)]';
  const sectionPad = 'p-5 pt-0';

  const resolvePortalPayload = (payload: PortalBookingFormMessagePayload) => ({
    ...payload,
    jobType: payload.jobType || linkedQuote?.job_type || String(mode),
  });

  const applyPortal = (
    prev: FormUi,
    payload: PortalBookingFormMessagePayload,
    overwrite: boolean,
  ) =>
    applyPortalPayloadToFormUi(prev, resolvePortalPayload(payload), {
      overwrite,
      jobTypeOverride: linkedQuote?.job_type || mode,
    });

  useEffect(() => {
    if (query.data == null) return;
    if (panelMode === 'list' || panelMode === 'create') return;
    setForm(hydrateForm(query.data));
    setPortalPrefillApplied(false);
  }, [query.data, panelMode]);

  useEffect(() => {
    const savedForm = query.data as ModeBookingForm | undefined;
    if (savedForm?.mark_complete === true) {
      setForceCompleted(true);
      return;
    }
    // Only clear Completed when the form is deleted / truly empty — not during refetch.
    if (!hasSavedForm && query.data != null && modeBookingFormIsEmpty(query.data)) {
      setForceCompleted(false);
    }
  }, [query.data, hasSavedForm]);

  useEffect(() => {
    if (panelMode !== 'create' && panelMode !== 'edit') return;
    const payload = portalBookingQuery.data;
    if (!payload || portalPrefillApplied) return;
    if (query.isLoading || query.isFetching) return;
    if (panelMode === 'edit' && !modeBookingFormIsEmpty(query.data)) {
      setPortalPrefillApplied(true);
      return;
    }
    setForm((prev) => applyPortal(prev, payload, panelMode === 'create'));
    setPortalPrefillApplied(true);
    setMsg(
      `Customer portal booking loaded (quote ${
        payload.quoteNumber || payload.quotationId.slice(0, 8)
      }). Review, then click Save.`,
    );
  }, [
    panelMode,
    portalBookingQuery.data,
    portalPrefillApplied,
    query.data,
    query.isLoading,
    query.isFetching,
    linkedQuote?.job_type,
    mode,
  ]);

  /** When portal form exists and staff form is empty, open create already prefilled. */
  useEffect(() => {
    if (panelMode !== 'list') return;
    if (hasSavedForm) return;
    if (query.isLoading || query.isFetching) return;
    if (!portalBookingQuery.data) return;
    if (portalPrefillApplied) return;
    setForm(applyPortal(emptyForm(), portalBookingQuery.data, true));
    setPortalPrefillApplied(true);
    setPanelMode('create');
    setMsg(
      `Customer portal booking auto-loaded (quote ${
        portalBookingQuery.data.quoteNumber ||
        portalBookingQuery.data.quotationId.slice(0, 8)
      }). Review, then Save.`,
    );
  }, [
    panelMode,
    hasSavedForm,
    query.isLoading,
    query.isFetching,
    portalBookingQuery.data,
    portalPrefillApplied,
    linkedQuote?.job_type,
    mode,
  ]);

  /** Push portal payload onto empty staff booking-form API (idempotent). */
  useEffect(() => {
    if (!jobId || !linkedQuote?.id) return;
    if (query.isLoading || query.isFetching) return;
    if (hasSavedForm) return;
    if (!portalBookingQuery.data?.mark_complete) return;
    let cancelled = false;
    void (async () => {
      try {
        const { syncCustomerPortalBookingFormOntoJob } = await import(
          '../utils/applyPortalPayloadToModeBookingForm'
        );
        const result = await syncCustomerPortalBookingFormOntoJob({
          jobId,
          jobType: linkedQuote.job_type || mode,
          quotationId: linkedQuote.id,
          quoteNumber: linkedQuote.quotation_number || linkedQuote.quote_no,
        });
        if (!cancelled && result.synced) {
          void query.refetch();
        }
      } catch {
        /* UI prefill still works without API sync */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    jobId,
    linkedQuote?.id,
    linkedQuote?.job_type,
    linkedQuote?.quotation_number,
    linkedQuote?.quote_no,
    hasSavedForm,
    query.isLoading,
    query.isFetching,
    portalBookingQuery.data?.mark_complete,
    mode,
  ]);

  const patch = (partial: Partial<FormUi>) => {
    if (readOnly) return;
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const patchParty = (kind: BookingFormPartyKind, partial: Partial<PartyUi>) => {
    if (readOnly) return;
    setForm((prev) => ({
      ...prev,
      parties: prev.parties.map((p) => (p.party_kind === kind ? { ...p, ...partial } : p)),
    }));
  };

  const run = async (
    fn: () => Promise<unknown>,
    success: string,
    goList = false,
  ) => {
    setErr(null);
    setMsg(null);
    try {
      const result = await fn();
      const customMsg = typeof result === 'string' && result.trim() ? result : success;
      setMsg(customMsg);
      if (goList) setPanelMode('list');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const openCreate = () => {
    setErr(null);
    setMsg(null);
    const payload = portalBookingQuery.data;
    if (payload) {
      setForm(applyPortal(emptyForm(), payload, true));
      setPortalPrefillApplied(true);
      setMsg(
        `Customer portal booking loaded (quote ${
          payload.quoteNumber || payload.quotationId.slice(0, 8)
        }). Review, then click Save.`,
      );
    } else {
      setForm(emptyForm());
      setPortalPrefillApplied(false);
    }
    setPanelMode('create');
  };

  const openView = () => {
    setErr(null);
    setMsg(null);
    setForm(hydrateForm(query.data));
    setPanelMode('view');
  };

  const openEdit = () => {
    setErr(null);
    setMsg(null);
    setForm(hydrateForm(query.data));
    setPortalPrefillApplied(false);
    setPanelMode('edit');
  };

  const backToList = () => {
    setErr(null);
    setDeleteOpen(false);
    setPanelMode('list');
    if (query.data != null) setForm(hydrateForm(query.data));
  };

  const reloadFromPortal = () => {
    const payload = portalBookingQuery.data;
    if (!payload) {
      setErr('No customer portal booking form found for this job / quotation yet.');
      return;
    }
    setForm((prev) => applyPortal(prev, payload, true));
    setMsg(
      `Reloaded from customer portal (quote ${
        payload.quoteNumber || payload.quotationId.slice(0, 8)
      }). Click Save to store the booking form.`,
    );
  };

  const confirmDelete = () =>
    void run(
      async () => {
        await save.mutateAsync({
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
        });
        setForm(emptyForm());
        setForceCompleted(false);
        setDeleteOpen(false);
      },
      'Booking form deleted.',
      true,
    );

  const saved = query.data as ModeBookingForm | undefined;
  const shipperName =
    saved?.parties?.find((p) => p.party_kind === 'SHIPPER')?.full_name?.trim() || '—';
  /** Save alone → Draft; Complete / mark_complete → Completed. */
  const savedStatus = String(saved?.status ?? '').toUpperCase().replace(/[\s-]+/g, '_');
  const listStatus = !hasSavedForm
    ? null
    : forceCompleted ||
        saved?.mark_complete === true ||
        savedStatus === 'COMPLETED' ||
        savedStatus === 'COMPLETE'
      ? 'Completed'
      : 'Draft';

  if (panelMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-neutral-800)]">
              {modeTitle[mode]}
            </h3>
            <p className="text-xs text-[var(--color-neutral-400)]">
              Saved booking forms for this job ·{' '}
              <code className="text-[10px]">{staffBookingFormApiLabel(mode)}</code>
              <span className="mt-1 block">
                Status: <strong>Draft</strong> after Save · <strong>Completed</strong> after
                Complete
              </span>
            </p>
          </div>
          {!hasSavedForm ? (
            <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
              + Add booking form
            </Button>
          ) : null}
        </div>

        {portalBookingQuery.data && !hasSavedForm ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Customer portal booking is available
            {portalBookingQuery.data.quoteNumber
              ? ` (${portalBookingQuery.data.quoteNumber})`
              : ''}
            . Opening the form will auto-fill those values — review, then Save.
          </div>
        ) : null}

        {query.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading booking forms…</p>
        ) : null}
        {query.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(query.error)}</p>
        ) : null}
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking no</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>{mode === 'WAREHOUSE' ? 'Pickup → Warehouse' : 'Route'}</TableHead>
                  <TableHead>Shipper</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!hasSavedForm ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <p className="py-6 text-center text-sm text-[var(--color-neutral-400)]">
                        No booking form saved yet. Add one to continue.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell>{saved?.client_booking_no || '—'}</TableCell>
                    <TableCell>{saved?.commodity || '—'}</TableCell>
                    <TableCell>
                      {(() => {
                        if (mode === 'WAREHOUSE') {
                          const from =
                            saved?.origin_door_address || saved?.pol || '—';
                          const to =
                            saved?.warehouse_name || saved?.dest_door_address || saved?.pod || '—';
                          return `${from} → ${to}`;
                        }
                        const a =
                          saved?.pol || saved?.origin_city_country || saved?.origin_door_address;
                        const b =
                          saved?.pod || saved?.dest_city_country || saved?.dest_door_address;
                        if (!a && !b) return '—';
                        return `${a || '—'} → ${b || '—'}`;
                      })()}
                    </TableCell>
                    <TableCell>{shipperName}</TableCell>
                    <TableCell>
                      <Badge variant={listStatus === 'Completed' ? 'success' : 'warning'}>
                        {listStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <ActionIconButton label="View" onClick={openView}>
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </ActionIconButton>
                        <ActionIconButton label="Edit" tone="primary" onClick={openEdit}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </ActionIconButton>
                        <ActionIconButton
                          label="Delete"
                          tone="danger"
                          onClick={() => setDeleteOpen(true)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </ActionIconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete booking form?">
          <p className="text-sm text-[var(--color-neutral-600)]">
            This clears the saved booking form for this job. You can add a new one afterwards.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={save.isPending}
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
            {modeTitle[mode]}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
            {panelMode === 'view'
              ? `View · ${modeTitle[mode]}`
              : panelMode === 'create'
                ? `Add · ${modeTitle[mode]}`
                : `Edit · ${modeTitle[mode]}`}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            Same look as the customer portal booking form · fields follow live API for{' '}
            <code className="text-[10px]">{staffBookingFormApiLabel(mode)}</code>
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={backToList} className="w-full sm:w-auto">
          ← Back to list
        </Button>
      </div>

      {portalBookingQuery.data && !readOnly ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
          <span>
            Customer booking form on file
            {portalBookingQuery.data.quoteNumber
              ? ` · ${portalBookingQuery.data.quoteNumber}`
              : ''}
          </span>
          <Button type="button" size="sm" variant="secondary" onClick={reloadFromPortal}>
            Reload from customer portal
          </Button>
        </div>
      ) : null}

      {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <div className="space-y-5 overflow-hidden rounded-[20px] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]/40 p-4 sm:p-5">
        <div className="-mx-4 -mt-4 mb-1 h-[3px] bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-secondary)] to-[var(--color-primary)] sm:-mx-5 sm:-mt-5" />

      <Card className={sectionCardClass} padding="none">
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className={sectionTitleClass}>Basic information</CardTitle>
        </CardHeader>
        <div className={`grid gap-4 ${sectionPad} sm:grid-cols-2 lg:grid-cols-3`}>
          <Input
            label="Date of request"
            type="date"
            disabled={readOnly}
            value={form.date_of_request}
            onChange={(e) => patch({ date_of_request: e.target.value })}
          />
          <Input
            label="Client booking no"
            maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.client_booking_no}
            disabled={readOnly}
            value={form.client_booking_no}
            onChange={(e) => patch({ client_booking_no: e.target.value })}
          />
          <Input
            label={isWarehouse ? 'Booking / storage ref' : 'Voyage / trip ref'}
            maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.voyage_ref}
            disabled={readOnly}
            value={form.voyage_ref}
            onChange={(e) => patch({ voyage_ref: e.target.value })}
          />
          {!isWarehouse ? (
            <label className={labelCls}>
              Service scope
              <select
                className={selectClass}
                disabled={readOnly}
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
          ) : null}
          <label className={labelCls}>
            Cargo category
            <select
              className={selectClass}
              disabled={readOnly}
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
          <Input
            label="Commodity"
            maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.commodity}
            disabled={readOnly}
            value={form.commodity}
            onChange={(e) => patch({ commodity: e.target.value })}
          />
          <Input
            label="HS code"
            maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.hs_code}
            disabled={readOnly}
            value={form.hs_code}
            onChange={(e) => patch({ hs_code: e.target.value })}
          />
          {!isWarehouse ? (
            <>
              <Input
                label="ETD"
                type="datetime-local"
                disabled={readOnly}
                value={form.etd}
                onChange={(e) => patch({ etd: e.target.value })}
              />
              <Input
                label="ETA"
                type="datetime-local"
                disabled={readOnly}
                value={form.eta}
                onChange={(e) => patch({ eta: e.target.value })}
              />
            </>
          ) : null}
        </div>
      </Card>

      <Card className={sectionCardClass} padding="none">
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className={sectionTitleClass}>Cargo &amp; weights</CardTitle>
        </CardHeader>
        <div className={`grid gap-4 ${sectionPad} sm:grid-cols-2 lg:grid-cols-3`}>
          <Input
            label="Gross weight kg"
            type="number"
            disabled={readOnly}
            value={form.gross_weight_kg}
            onChange={(e) => patch({ gross_weight_kg: e.target.value })}
          />
          <Input
            label="Net weight kg"
            type="number"
            disabled={readOnly}
            value={form.net_weight_kg}
            onChange={(e) => patch({ net_weight_kg: e.target.value })}
          />
          <Input
            label="Volume CBM"
            type="number"
            disabled={readOnly}
            value={form.volume_cbm}
            onChange={(e) => patch({ volume_cbm: e.target.value })}
          />
          <Input
            label="Pieces"
            type="number"
            min={0}
            disabled={readOnly}
            value={form.pieces}
            onChange={(e) => patch({ pieces: e.target.value })}
          />
          <Input
            label={isWarehouse ? 'Pickup / origin address' : 'Origin door address'}
            disabled={readOnly}
            value={form.origin_door_address}
            onChange={(e) => patch({ origin_door_address: e.target.value })}
          />
          <Input
            label={isWarehouse ? 'Delivery / collection address' : 'Dest door address'}
            disabled={readOnly}
            value={form.dest_door_address}
            onChange={(e) => patch({ dest_door_address: e.target.value })}
          />
          <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={form.is_dg}
              onChange={(e) => patch({ is_dg: e.target.checked })}
            />
            Dangerous goods
          </label>
          {form.is_dg ? (
            <Input
              label="DG class"
              maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.dg_class}
              disabled={readOnly}
              value={form.dg_class}
              onChange={(e) => patch({ dg_class: e.target.value })}
            />
          ) : null}
          <label className={`${labelCls} sm:col-span-2`}>
            Insurance details
            <textarea
              disabled={readOnly}
              className="min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm disabled:bg-[var(--color-neutral-50)]"
              value={form.insurance_details}
              onChange={(e) => patch({ insurance_details: e.target.value })}
            />
          </label>
          <label className={`${labelCls} sm:col-span-2`}>
            Request details
            <textarea
              disabled={readOnly}
              className="min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm disabled:bg-[var(--color-neutral-50)]"
              value={form.request_details}
              onChange={(e) => patch({ request_details: e.target.value })}
            />
          </label>
        </div>
      </Card>

      {isSea ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Shipment route</CardTitle>
          </CardHeader>
          <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="POL"
              maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.pol}
              disabled={readOnly}
              value={form.pol}
              onChange={(e) => patch({ pol: e.target.value })}
            />
            <Input
              label="POD"
              maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.pod}
              disabled={readOnly}
              value={form.pod}
              onChange={(e) => patch({ pod: e.target.value })}
            />
            <Input
              label="Incoterms"
              maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.incoterms}
              disabled={readOnly}
              value={form.incoterms}
              onChange={(e) => patch({ incoterms: e.target.value })}
            />
            <label className={labelCls}>
              Freight terms
              <select
                className={selectClass}
                disabled={readOnly}
                value={form.freight_terms}
                onChange={(e) => patch({ freight_terms: e.target.value })}
              >
                <option value="">—</option>
                {FREIGHT_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            {mode === 'SEA_LCL' ? (
              <Input
                label="CFS warehouse *"
                maxLength={API_MAX_LENGTH.UpsertSeaLclBookingFormDto.cfs_warehouse}
                disabled={readOnly}
                list="kfw-cfs-warehouse-options"
                value={form.cfs_warehouse}
                onChange={(e) => patch({ cfs_warehouse: e.target.value })}
              />
            ) : null}
            {mode === 'SEA_LCL' ? (
              <datalist id="kfw-cfs-warehouse-options">
                {warehouseMasters.map((w) => {
                  const name = String(w.name ?? '').trim();
                  return name ? <option key={String(w.id ?? name)} value={name} /> : null;
                })}
              </datalist>
            ) : null}
            {mode === 'SEA_FCL' ? (
              <>
                <Input
                  label="TEU count"
                  type="number"
                  disabled={readOnly}
                  value={form.teu_count}
                  onChange={(e) => patch({ teu_count: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={form.shipper_owned_container}
                    onChange={(e) => patch({ shipper_owned_container: e.target.checked })}
                  />
                  Shipper-owned container
                </label>
              </>
            ) : null}
          </div>
        </Card>
      ) : null}

      {mode === 'SEA_FCL' ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Containers</CardTitle>
          </CardHeader>
          <div className="space-y-3 p-4 pt-0">
            {form.containers.map((line, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-4">
                <label className={labelCls}>
                  Container type
                  <select
                    className={selectClass}
                    disabled={readOnly}
                    value={line.container_type_id}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        containers: prev.containers.map((c, i) =>
                          i === idx ? { ...c, container_type_id: e.target.value } : c,
                        ),
                      }))
                    }
                  >
                    <option value="">—</option>
                    {containerTypes.map((o) => {
                      const id = String(o.id ?? '');
                      if (!id) return null;
                      return (
                        <option key={id} value={id}>
                          {String(o.name ?? o.code ?? id)}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <Input
                  label="ISO size"
                  maxLength={API_MAX_LENGTH.ContainerSizeLineDto.iso_size}
                  disabled={readOnly}
                  placeholder="40HC"
                  value={line.iso_size}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      containers: prev.containers.map((c, i) =>
                        i === idx ? { ...c, iso_size: e.target.value } : c,
                      ),
                    }))
                  }
                />
                <Input
                  label="Count"
                  type="number"
                  min={1}
                  disabled={readOnly}
                  value={line.count}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      containers: prev.containers.map((c, i) =>
                        i === idx ? { ...c, count: e.target.value } : c,
                      ),
                    }))
                  }
                />
                {!readOnly ? (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={form.containers.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          containers: prev.containers.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
            {!readOnly ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    containers: [
                      ...prev.containers,
                      { container_type_id: '', iso_size: '', count: '1' },
                    ],
                  }))
                }
              >
                Add container line
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {isLandish ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Land / road / courier</CardTitle>
          </CardHeader>
          <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Origin city / country"
              maxLength={API_MAX_LENGTH.UpsertLandBookingFormDto.origin_city_country}
              disabled={readOnly}
              value={form.origin_city_country}
              onChange={(e) => patch({ origin_city_country: e.target.value })}
            />
            <Input
              label="Dest city / country"
              maxLength={API_MAX_LENGTH.UpsertLandBookingFormDto.dest_city_country}
              disabled={readOnly}
              value={form.dest_city_country}
              onChange={(e) => patch({ dest_city_country: e.target.value })}
            />
            {mode === 'LAND' || mode === 'ROAD_FREIGHT' ? (
              <>
                <label className={labelCls}>
                  Vehicle type
                  <select
                    className={selectClass}
                    disabled={readOnly}
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
                <Input
                  label="Incoterms"
                  maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.incoterms}
                  disabled={readOnly}
                  value={form.incoterms}
                  onChange={(e) => patch({ incoterms: e.target.value })}
                />
              </>
            ) : null}
            {mode === 'ROAD_FREIGHT' ? (
              <Input
                label="Border crossing"
                maxLength={API_MAX_LENGTH.UpsertRoadFreightBookingFormDto.border_crossing}
                disabled={readOnly}
                value={form.border_crossing}
                onChange={(e) => patch({ border_crossing: e.target.value })}
              />
            ) : null}
            {mode === 'COURIER' ? (
              <Input
                label="Tracking number"
                maxLength={API_MAX_LENGTH.UpsertCourierBookingFormDto.tracking_number}
                disabled={readOnly}
                value={form.tracking_number}
                onChange={(e) => patch({ tracking_number: e.target.value })}
              />
            ) : null}
          </div>
        </Card>
      ) : null}

      {isWarehouse ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Warehouse storage</CardTitle>
          </CardHeader>
          <div className={`grid gap-4 ${sectionPad} sm:grid-cols-2 lg:grid-cols-3`}>
            <label className={labelCls}>
              Warehouse
              <select
                className={selectClass}
                disabled={readOnly}
                value={form.warehouse_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const row = warehouseMasters.find((w) => String(w.id ?? '') === id);
                  const code = String(row?.code ?? '').trim();
                  const name = String(row?.name ?? '').trim();
                  patch({
                    warehouse_id: id,
                    warehouse_name:
                      form.warehouse_name.trim() ||
                      [code, name].filter(Boolean).join(' — ') ||
                      name ||
                      code,
                  });
                }}
              >
                <option value="">Select warehouse…</option>
                {warehouseMasters.map((w) => {
                  const id = String(w.id ?? '');
                  if (!id) return null;
                  const code = String(w.code ?? '').trim();
                  const name = String(w.name ?? '').trim();
                  return (
                    <option key={id} value={id}>
                      {[code, name].filter(Boolean).join(' — ') || id}
                    </option>
                  );
                })}
              </select>
            </label>
            <Input
              label="Warehouse name"
              maxLength={API_MAX_LENGTH.UpsertWarehouseBookingFormDto.warehouse_name}
              disabled={readOnly}
              value={form.warehouse_name}
              onChange={(e) => patch({ warehouse_name: e.target.value })}
              placeholder="e.g. JAFZA Free Zone Warehouse"
            />
            <MasterCodeDatalist id={UNIT_LIST_ID} options={unitOptions} />
            <Input
              label="Expected inbound"
              type="datetime-local"
              disabled={readOnly}
              value={form.expected_inbound_at}
              onChange={(e) => patch({ expected_inbound_at: e.target.value })}
            />
            <Input
              label="Expected outbound"
              type="datetime-local"
              disabled={readOnly}
              value={form.expected_outbound_at}
              onChange={(e) => patch({ expected_outbound_at: e.target.value })}
            />
            <Input
              label="Storage days requested"
              type="number"
              min={0}
              disabled={readOnly}
              value={form.storage_days_requested}
              onChange={(e) => patch({ storage_days_requested: e.target.value })}
            />
            <label className={labelCls}>
              Linked freight job
              <select
                className={selectClass}
                disabled={readOnly}
                value={form.freight_job_id}
                onChange={(e) => patch({ freight_job_id: e.target.value })}
              >
                <option value="">None</option>
                {form.freight_job_id &&
                !freightJobOptions.some((j) => j.id === form.freight_job_id) ? (
                  <option value={form.freight_job_id}>
                    {form.freight_job_id.slice(0, 8)}…
                  </option>
                ) : null}
                {freightJobOptions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={form.bonded}
                onChange={(e) => patch({ bonded: e.target.checked })}
              />
              Bonded storage
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={form.temperature_controlled}
                onChange={(e) => patch({ temperature_controlled: e.target.checked })}
              />
              Temperature controlled
            </label>
            <label className={`${labelCls} sm:col-span-2 lg:col-span-3`}>
              Handling instructions
              <textarea
                disabled={readOnly}
                className="min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm disabled:bg-[var(--color-neutral-50)]"
                value={form.handling_instructions}
                onChange={(e) => patch({ handling_instructions: e.target.value })}
              />
            </label>
          </div>
        </Card>
      ) : null}

      {isWarehouse ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Stock lines</CardTitle>
          </CardHeader>
          <div className="space-y-3 p-4 pt-0">
            {form.stock_lines.map((line, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-5">
                <Input
                  label="SKU code"
                  maxLength={API_MAX_LENGTH.WhStockLineInputDto.sku_code}
                  disabled={readOnly}
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
                  label="Description"
                  maxLength={API_MAX_LENGTH.WhStockLineInputDto.description}
                  disabled={readOnly}
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
                  label="Qty"
                  type="number"
                  min={0}
                  disabled={readOnly}
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
                  label="Unit"
                  maxLength={API_MAX_LENGTH.WhStockLineInputDto.unit}
                  list={UNIT_LIST_ID}
                  disabled={readOnly}
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
                <div className="flex items-end gap-2">
                  <Input
                    label="CBM"
                    type="number"
                    min={0}
                    disabled={readOnly}
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
                  {!readOnly ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={form.stock_lines.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          stock_lines: prev.stock_lines.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {!readOnly ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    stock_lines: [
                      ...prev.stock_lines,
                      { sku_code: '', description: '', quantity: '', unit: '', cbm: '' },
                    ],
                  }))
                }
              >
                Add stock line
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {isCustoms ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Customs clearance</CardTitle>
          </CardHeader>
          <div className={`grid gap-4 ${sectionPad} sm:grid-cols-2 lg:grid-cols-3`}>
            <label className={labelCls}>
              Direction <span className="text-[var(--color-danger-600)]">*</span>
              <select
                className={selectClass}
                disabled={readOnly}
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
            <Input
              label="Border / port *"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.border_or_port}
              disabled={readOnly}
              value={form.border_or_port}
              onChange={(e) => patch({ border_or_port: e.target.value })}
              placeholder="e.g. Jebel Ali Port / Terminal 1"
            />
            <Input
              label="Entry type"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.entry_type}
              disabled={readOnly}
              value={form.entry_type}
              onChange={(e) => patch({ entry_type: e.target.value })}
              placeholder="e.g. BOE"
            />
            <Input
              label="Declaration type"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.declaration_type}
              disabled={readOnly}
              value={form.declaration_type}
              onChange={(e) => patch({ declaration_type: e.target.value })}
              placeholder="e.g. Home consumption"
            />
            <Input
              label="Port of entry"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.port_of_entry}
              disabled={readOnly}
              value={form.port_of_entry}
              onChange={(e) => patch({ port_of_entry: e.target.value })}
            />
            <Input
              label="Port of exit"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.port_of_exit}
              disabled={readOnly}
              value={form.port_of_exit}
              onChange={(e) => patch({ port_of_exit: e.target.value })}
            />
            <Input
              label="Country of origin"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.country_of_origin}
              disabled={readOnly}
              value={form.country_of_origin}
              onChange={(e) => patch({ country_of_origin: e.target.value.toUpperCase() })}
              placeholder="CN"
            />
            <Input
              label="Country of destination"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.country_of_destination}
              disabled={readOnly}
              value={form.country_of_destination}
              onChange={(e) =>
                patch({ country_of_destination: e.target.value.toUpperCase() })
              }
              placeholder="AE"
            />
            <Input
              label="Incoterms"
              maxLength={API_MAX_LENGTH.UpsertSeaFclBookingFormDto.incoterms}
              disabled={readOnly}
              value={form.incoterms}
              onChange={(e) => patch({ incoterms: e.target.value })}
              placeholder="CIF"
            />
            <Input
              label="Invoice value *"
              type="number"
              min={0}
              disabled={readOnly}
              value={form.invoice_value_amount}
              onChange={(e) => patch({ invoice_value_amount: e.target.value })}
            />
            <Input
              label="Invoice currency *"
              maxLength={API_MAX_LENGTH.UpsertCustomsClearanceBookingFormDto.invoice_currency}
              disabled={readOnly}
              list={CURRENCY_LIST_ID}
              value={form.invoice_currency}
              onChange={(e) =>
                patch({ invoice_currency: e.target.value.toUpperCase() })
              }
              placeholder={baseCurrency}
            />
            <MasterCodeDatalist id={CURRENCY_LIST_ID} options={currencyOptions} />
            <MasterCodeDatalist id={UNIT_LIST_ID} options={unitOptions} />
            <label className={labelCls}>
              Linked freight job
              <select
                className={selectClass}
                disabled={readOnly}
                value={form.freight_job_id}
                onChange={(e) => patch({ freight_job_id: e.target.value })}
              >
                <option value="">None</option>
                {form.freight_job_id &&
                !freightJobOptions.some((j) => j.id === form.freight_job_id) ? (
                  <option value={form.freight_job_id}>
                    {form.freight_job_id.slice(0, 8)}…
                  </option>
                ) : null}
                {freightJobOptions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-[var(--color-neutral-500)] sm:col-span-2 lg:col-span-3">
              To complete: check <strong>Packing list</strong> and{' '}
              <strong>Power of Attorney / CHA (POA)</strong> under Attachments.
            </p>
          </div>
        </Card>
      ) : null}

      {isCustoms ? (
        <Card className={sectionCardClass} padding="none">
          <CardHeader className={sectionHeaderClass}>
            <CardTitle className={sectionTitleClass}>Cargo lines</CardTitle>
          </CardHeader>
          <div className={`space-y-3 ${sectionPad}`}>
            {form.cargo_lines.map((line, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
                <Input
                  label="Description"
                  maxLength={API_MAX_LENGTH.CcCargoLineInputDto.description}
                  disabled={readOnly}
                  value={line.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cargo_lines: prev.cargo_lines.map((l, i) =>
                        i === idx ? { ...l, description: e.target.value } : l,
                      ),
                    }))
                  }
                />
                <Input
                  label="HS code"
                  maxLength={API_MAX_LENGTH.CcCargoLineInputDto.hs_code}
                  disabled={readOnly}
                  value={line.hs_code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cargo_lines: prev.cargo_lines.map((l, i) =>
                        i === idx ? { ...l, hs_code: e.target.value } : l,
                      ),
                    }))
                  }
                />
                <Input
                  label="Origin"
                  maxLength={API_MAX_LENGTH.CcCargoLineInputDto.country_of_origin}
                  disabled={readOnly}
                  value={line.country_of_origin}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cargo_lines: prev.cargo_lines.map((l, i) =>
                        i === idx
                          ? { ...l, country_of_origin: e.target.value.toUpperCase() }
                          : l,
                      ),
                    }))
                  }
                />
                <Input
                  label="Qty"
                  type="number"
                  min={0}
                  disabled={readOnly}
                  value={line.quantity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cargo_lines: prev.cargo_lines.map((l, i) =>
                        i === idx ? { ...l, quantity: e.target.value } : l,
                      ),
                    }))
                  }
                />
                <Input
                  label="Unit"
                  maxLength={API_MAX_LENGTH.CcCargoLineInputDto.unit}
                  list={UNIT_LIST_ID}
                  disabled={readOnly}
                  value={line.unit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cargo_lines: prev.cargo_lines.map((l, i) =>
                        i === idx ? { ...l, unit: e.target.value } : l,
                      ),
                    }))
                  }
                />
                <Input
                  label="Value"
                  type="number"
                  min={0}
                  disabled={readOnly}
                  value={line.value_amount}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      cargo_lines: prev.cargo_lines.map((l, i) =>
                        i === idx ? { ...l, value_amount: e.target.value } : l,
                      ),
                    }))
                  }
                />
                <div className="flex items-end gap-2">
                  <Input
                    label="Currency"
                    maxLength={API_MAX_LENGTH.CcCargoLineInputDto.currency_code}
                    disabled={readOnly}
                    list={CURRENCY_LIST_ID}
                    placeholder={form.invoice_currency || baseCurrency}
                    value={line.currency_code}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cargo_lines: prev.cargo_lines.map((l, i) =>
                          i === idx
                            ? { ...l, currency_code: e.target.value.toUpperCase() }
                            : l,
                        ),
                      }))
                    }
                  />
                  {!readOnly ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={form.cargo_lines.length <= 1}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          cargo_lines: prev.cargo_lines.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {!readOnly ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    cargo_lines: [
                      ...prev.cargo_lines,
                      {
                        description: '',
                        hs_code: '',
                        country_of_origin: '',
                        quantity: '',
                        unit: '',
                        value_amount: '',
                        currency_code: form.invoice_currency || baseCurrency,
                      },
                    ],
                  }))
                }
              >
                Add cargo line
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card className={sectionCardClass} padding="none">
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className={sectionTitleClass}>Parties</CardTitle>
        </CardHeader>
        <div className={`space-y-3 ${sectionPad}`}>
          {form.parties.map((p) => (
            <div
              key={p.party_kind}
              className="grid gap-2 rounded-md border border-[var(--color-neutral-100)] p-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              <p className="text-xs font-medium text-[var(--color-neutral-800)] sm:col-span-2 lg:col-span-3">
                {p.party_kind}
              </p>
              <Input
                label="Full name"
                maxLength={API_MAX_LENGTH.BookingFormPartyDto.full_name}
                disabled={readOnly}
                value={p.full_name}
                onChange={(e) => patchParty(p.party_kind, { full_name: e.target.value })}
              />
              <Input
                label="City"
                maxLength={API_MAX_LENGTH.BookingFormPartyDto.city}
                disabled={readOnly}
                value={p.city}
                onChange={(e) => patchParty(p.party_kind, { city: e.target.value })}
              />
              <Input
                label="Country"
                maxLength={API_MAX_LENGTH.BookingFormPartyDto.country}
                disabled={readOnly}
                value={p.country}
                onChange={(e) => patchParty(p.party_kind, { country: e.target.value })}
              />
              <label className={`${labelCls} sm:col-span-2`}>
                Address
                <textarea
                  disabled={readOnly}
                  className="min-h-[56px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm disabled:bg-[var(--color-neutral-50)]"
                  value={p.address}
                  onChange={(e) => patchParty(p.party_kind, { address: e.target.value })}
                />
              </label>
              <label className={labelCls}>
                Entity kind
                <select
                  className={selectClass}
                  disabled={readOnly}
                  value={p.entity_kind}
                  onChange={(e) =>
                    patchParty(p.party_kind, {
                      entity_kind: e.target.value as PartyUi['entity_kind'],
                    })
                  }
                >
                  <option value="">—</option>
                  {ENTITY_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Other details"
                disabled={readOnly}
                value={p.other_details}
                onChange={(e) => patchParty(p.party_kind, { other_details: e.target.value })}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className={sectionCardClass} padding="none">
        <CardHeader className={sectionHeaderClass}>
          <CardTitle className={sectionTitleClass}>
            Documents Checklist &amp; consent
          </CardTitle>
        </CardHeader>
        <div className={`space-y-4 ${sectionPad}`}>
          <div className="space-y-2">
            <p className="text-xs text-[var(--color-neutral-500)]">
              Documents Checklist (these documents should be uploaded by the customer). Ops may
              upload here if the customer has not. Complete is blocked until all mandatory docs
              are present (Bill of lading / AWB is optional).
            </p>
            <BookingDocumentUploadList
              kinds={MODE_BOOKING_FORM_DOCUMENT_KINDS}
              uploadedKinds={uploadedDocKinds}
              uploadingKind={uploadingKind}
              disabled={readOnly || save.isPending || complete.isPending}
              requiredKinds={new Set(MANDATORY_BOOKING_DOCUMENT_KINDS)}
              onUpload={async (kind, file) => {
                setUploadingKind(kind);
                try {
                  await uploadDocument.mutateAsync({
                    kind: kind as (typeof MODE_BOOKING_FORM_DOCUMENT_KINDS)[number],
                    file,
                  });
                  setUploadedDocKinds((prev) => new Set(prev).add(kind));
                  setForm((prev) => {
                    const attaches = { ...prev.attaches };
                    if (kind === 'commercial_invoice') attaches.attach_commercial_invoice = true;
                    if (kind === 'packing_list') attaches.attach_packing_list = true;
                    if (kind === 'bill_of_lading') attaches.attach_bl_awb_copy = true;
                    if (kind === 'licence') {
                      attaches.attach_licence = true;
                      attaches.attach_permit = true;
                    }
                    return { ...prev, attaches };
                  });
                } finally {
                  setUploadingKind(null);
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {attachFlagsForMode(mode).map((a) => (
              <label key={a.key} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={form.attaches[a.key] === true}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      attaches: { ...prev.attaches, [a.key]: e.target.checked },
                    }))
                  }
                />
                {a.label}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={form.consent_accepted}
                onChange={(e) => patch({ consent_accepted: e.target.checked })}
              />
              Consent accepted <span className="text-[var(--color-danger-600)]">*</span>
              <span className="text-[var(--color-neutral-400)]">(required to complete)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={form.mark_complete}
                onChange={(e) => patch({ mark_complete: e.target.checked })}
              />
              Mark complete on save
            </label>
          </div>
        </div>
      </Card>

      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={save.isPending || complete.isPending}
            onClick={() => {
              if (form.mark_complete && !form.consent_accepted) {
                setErr(
                  'Consent confirmation is required before marking the booking form complete.',
                );
                setMsg(null);
                return;
              }
              const incomplete = form.mark_complete
                ? incompleteFormMessage(form, mode, uploadedDocKinds)
                : null;
              if (incomplete) {
                setErr(incomplete);
                setMsg(null);
                return;
              }
              void run(
                async () => {
                  const result = await save.mutateAsync(toDto(form, mode));
                  if (form.mark_complete || (result as ModeBookingForm)?.mark_complete) {
                    await complete.mutateAsync();
                    setForceCompleted(true);
                    setForm((prev) => ({ ...prev, mark_complete: true }));
                    return 'Booking form completed.';
                  }
                  return undefined;
                },
                form.mark_complete
                  ? 'Booking form completed.'
                  : 'Booking form saved as Draft.',
                true,
              );
            }}
          >
            Save booking form
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={save.isPending || complete.isPending}
            onClick={() => {
              if (!form.consent_accepted) {
                setErr(
                  'Consent confirmation is required to complete the booking form. Check "Consent accepted", then try again.',
                );
                setMsg(null);
                return;
              }
              const incomplete = incompleteFormMessage(form, mode, uploadedDocKinds);
              if (incomplete) {
                setErr(incomplete);
                setMsg(null);
                return;
              }
              void run(
                async () => {
                  const dto = toDto(
                    { ...form, consent_accepted: true, mark_complete: true },
                    mode,
                  );
                  await save.mutateAsync(dto);
                  setForm((prev) => ({
                    ...prev,
                    consent_accepted: true,
                    mark_complete: true,
                  }));
                  await complete.mutateAsync();
                  setForceCompleted(true);
                  return undefined;
                },
                'Booking form completed.',
                true,
              );
            }}
          >
            Complete booking form
          </Button>
          <Button type="button" variant="ghost" onClick={backToList}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={openEdit}>
            Edit
          </Button>
          <Button type="button" variant="secondary" onClick={backToList}>
            Back to list
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
