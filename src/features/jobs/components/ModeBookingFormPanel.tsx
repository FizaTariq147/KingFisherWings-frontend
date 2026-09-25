import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import {
  staffBookingFormApiLabel,
  useStaffBookingForm,
  useStaffBookingFormActions,
} from '../hooks/useStaffBookingForm';
import type {
  BookingFormPartyDto,
  BookingFormPartyKind,
  ContainerSizeLineDto,
  JobCargoCategory,
  JobServiceScope,
  ModeBookingForm,
  StaffBookingFormMode,
} from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';

const SERVICE_SCOPES: JobServiceScope[] = [
  'DOOR_TO_DOOR',
  'DOOR_TO_PORT',
  'PORT_TO_DOOR',
  'PORT_TO_PORT',
];

const CARGO_CATEGORIES: JobCargoCategory[] = [
  'GENERAL',
  'VEHICLES',
  'FOOD_PERISHABLE',
  'PHARMA',
  'CHEMICALS_DG',
  'PERSONAL_EFFECTS',
  'PROJECT_OOG',
  'LIVESTOCK',
  'OTHER',
];

const FREIGHT_TERMS = ['Prepaid', 'Collect', 'Third Party'] as const;
const VEHICLE_TYPES = ['TRUCK', 'TRAILER', 'VAN'] as const;

const PARTY_KINDS: BookingFormPartyKind[] = [
  'SHIPPER',
  'CONSIGNEE',
  'NOTIFY',
  'BILLING',
  'AGENT',
];

const ATTACH_FLAGS: { key: keyof ModeBookingForm; label: string }[] = [
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

type PartyUi = {
  party_kind: BookingFormPartyKind;
  full_name: string;
  address: string;
  city: string;
  country: string;
  entity_kind: 'COMPANY' | 'INDIVIDUAL' | '';
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
    service_scope: 'DOOR_TO_DOOR',
    origin_door_address: '',
    dest_door_address: '',
    commodity: '',
    hs_code: '',
    cargo_category: 'GENERAL',
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
    parties: PARTY_KINDS.map(emptyParty),
    containers: [{ container_type_id: '', iso_size: '', count: '1' }],
    attaches: Object.fromEntries(ATTACH_FLAGS.map((a) => [a.key, false])),
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
    const entity: PartyUi['entity_kind'] =
      found.entity_kind === 'COMPANY' || found.entity_kind === 'INDIVIDUAL'
        ? found.entity_kind
        : '';
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

  const attaches = { ...base.attaches };
  for (const a of ATTACH_FLAGS) {
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
    service_scope: form.service_scope || undefined,
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
    etd: form.etd || undefined,
    eta: form.eta || undefined,
    parties: parties.length ? parties : undefined,
  };

  for (const a of ATTACH_FLAGS) {
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

  return dto;
}

const modeTitle: Record<StaffBookingFormMode, string> = {
  SEA_FCL: 'Sea FCL booking form',
  SEA_LCL: 'Sea LCL booking form',
  LAND: 'Land booking form',
  ROAD_FREIGHT: 'Road freight booking form',
  COURIER: 'Courier booking form',
};

const fieldClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm';
const labelClass = 'flex flex-col gap-1 text-xs text-[var(--color-neutral-600)]';

export function ModeBookingFormPanel({
  jobId,
  mode,
}: {
  jobId: string;
  mode: StaffBookingFormMode;
}) {
  const query = useStaffBookingForm(jobId, mode);
  const { save, complete } = useStaffBookingFormActions(jobId, mode);
  const { data: containerTypes = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    mode === 'SEA_FCL',
  );

  const [form, setForm] = useState<FormUi>(emptyForm);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (query.data != null) setForm(hydrateForm(query.data));
  }, [query.data]);

  const patch = (partial: Partial<FormUi>) => setForm((prev) => ({ ...prev, ...partial }));

  const patchParty = (kind: BookingFormPartyKind, partial: Partial<PartyUi>) =>
    setForm((prev) => ({
      ...prev,
      parties: prev.parties.map((p) => (p.party_kind === kind ? { ...p, ...partial } : p)),
    }));

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const isSea = mode === 'SEA_FCL' || mode === 'SEA_LCL';
  const isLandish = mode === 'LAND' || mode === 'ROAD_FREIGHT' || mode === 'COURIER';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{modeTitle[mode]}</CardTitle>
      </CardHeader>
      <div className="space-y-4 px-4 pb-4">
        <p className="text-xs text-[var(--color-neutral-400)]">
          GET/PUT <code className="text-[10px]">{staffBookingFormApiLabel(mode)}</code> · POST
          …/complete
        </p>

        {query.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">Loading booking form…</p>
        ) : null}
        {query.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(query.error)}</p>
        ) : null}
        {!query.isLoading && !query.isError && query.data != null && Object.keys(query.data).length === 0 ? (
          <p className="text-xs text-[var(--color-neutral-500)]">
            No booking form saved yet — fill the fields below and Save (creates via PUT).
          </p>
        ) : null}
        {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Date of request"
            type="date"
            value={form.date_of_request}
            onChange={(e) => patch({ date_of_request: e.target.value })}
          />
          <Input
            label="Client booking no"
            maxLength={50}
            value={form.client_booking_no}
            onChange={(e) => patch({ client_booking_no: e.target.value })}
          />
          <Input
            label="Voyage / trip ref"
            maxLength={50}
            value={form.voyage_ref}
            onChange={(e) => patch({ voyage_ref: e.target.value })}
          />
          <label className={labelClass}>
            Service scope
            <select
              className={fieldClass}
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
          <label className={labelClass}>
            Cargo category
            <select
              className={fieldClass}
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
            maxLength={500}
            value={form.commodity}
            onChange={(e) => patch({ commodity: e.target.value })}
          />
          <Input
            label="HS code"
            maxLength={20}
            value={form.hs_code}
            onChange={(e) => patch({ hs_code: e.target.value })}
          />
          <Input
            label="Gross weight kg"
            type="number"
            value={form.gross_weight_kg}
            onChange={(e) => patch({ gross_weight_kg: e.target.value })}
          />
          <Input
            label="Net weight kg"
            type="number"
            value={form.net_weight_kg}
            onChange={(e) => patch({ net_weight_kg: e.target.value })}
          />
          <Input
            label="Volume CBM"
            type="number"
            value={form.volume_cbm}
            onChange={(e) => patch({ volume_cbm: e.target.value })}
          />
          <Input
            label="Pieces"
            type="number"
            min={0}
            value={form.pieces}
            onChange={(e) => patch({ pieces: e.target.value })}
          />
          <Input
            label="Origin door address"
            value={form.origin_door_address}
            onChange={(e) => patch({ origin_door_address: e.target.value })}
          />
          <Input
            label="Dest door address"
            value={form.dest_door_address}
            onChange={(e) => patch({ dest_door_address: e.target.value })}
          />
          <Input
            label="ETD"
            type="datetime-local"
            value={form.etd}
            onChange={(e) => patch({ etd: e.target.value })}
          />
          <Input
            label="ETA"
            type="datetime-local"
            value={form.eta}
            onChange={(e) => patch({ eta: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_dg}
              onChange={(e) => patch({ is_dg: e.target.checked })}
            />
            Dangerous goods
          </label>
          {form.is_dg ? (
            <Input
              label="DG class"
              maxLength={20}
              value={form.dg_class}
              onChange={(e) => patch({ dg_class: e.target.value })}
            />
          ) : null}
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.consent_accepted}
              onChange={(e) => patch({ consent_accepted: e.target.checked })}
            />
            Consent accepted
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.mark_complete}
              onChange={(e) => patch({ mark_complete: e.target.checked })}
            />
            Mark complete on save
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className={labelClass}>
            Insurance details
            <textarea
              className="min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm"
              value={form.insurance_details}
              onChange={(e) => patch({ insurance_details: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Request details
            <textarea
              className="min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm"
              value={form.request_details}
              onChange={(e) => patch({ request_details: e.target.value })}
            />
          </label>
        </div>

        {isSea ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="POL"
              maxLength={100}
              value={form.pol}
              onChange={(e) => patch({ pol: e.target.value })}
            />
            <Input
              label="POD"
              maxLength={100}
              value={form.pod}
              onChange={(e) => patch({ pod: e.target.value })}
            />
            <Input
              label="Incoterms"
              maxLength={10}
              value={form.incoterms}
              onChange={(e) => patch({ incoterms: e.target.value })}
            />
            <label className={labelClass}>
              Freight terms
              <select
                className={fieldClass}
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
                label="CFS warehouse"
                maxLength={200}
                value={form.cfs_warehouse}
                onChange={(e) => patch({ cfs_warehouse: e.target.value })}
              />
            ) : null}
            {mode === 'SEA_FCL' ? (
              <>
                <Input
                  label="TEU count"
                  type="number"
                  value={form.teu_count}
                  onChange={(e) => patch({ teu_count: e.target.value })}
                />
                <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.shipper_owned_container}
                    onChange={(e) => patch({ shipper_owned_container: e.target.checked })}
                  />
                  Shipper-owned container
                </label>
              </>
            ) : null}
          </div>
        ) : null}

        {mode === 'SEA_FCL' ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-neutral-700)]">Containers</p>
            {form.containers.map((line, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-4">
                <label className={labelClass}>
                  Container type
                  <select
                    className={fieldClass}
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
                  maxLength={30}
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
              </div>
            ))}
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
          </div>
        ) : null}

        {isLandish ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Origin city / country"
              maxLength={200}
              value={form.origin_city_country}
              onChange={(e) => patch({ origin_city_country: e.target.value })}
            />
            <Input
              label="Dest city / country"
              maxLength={200}
              value={form.dest_city_country}
              onChange={(e) => patch({ dest_city_country: e.target.value })}
            />
            {mode === 'LAND' || mode === 'ROAD_FREIGHT' ? (
              <>
                <label className={labelClass}>
                  Vehicle type
                  <select
                    className={fieldClass}
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
                  maxLength={10}
                  value={form.incoterms}
                  onChange={(e) => patch({ incoterms: e.target.value })}
                />
              </>
            ) : null}
            {mode === 'ROAD_FREIGHT' ? (
              <Input
                label="Border crossing"
                maxLength={200}
                value={form.border_crossing}
                onChange={(e) => patch({ border_crossing: e.target.value })}
              />
            ) : null}
            {mode === 'COURIER' ? (
              <Input
                label="Tracking number"
                maxLength={100}
                value={form.tracking_number}
                onChange={(e) => patch({ tracking_number: e.target.value })}
              />
            ) : null}
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">Parties</p>
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
                maxLength={300}
                value={p.full_name}
                onChange={(e) => patchParty(p.party_kind, { full_name: e.target.value })}
              />
              <Input
                label="City"
                maxLength={100}
                value={p.city}
                onChange={(e) => patchParty(p.party_kind, { city: e.target.value })}
              />
              <Input
                label="Country"
                maxLength={100}
                value={p.country}
                onChange={(e) => patchParty(p.party_kind, { country: e.target.value })}
              />
              <label className={`${labelClass} sm:col-span-2`}>
                Address
                <textarea
                  className="min-h-[56px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm"
                  value={p.address}
                  onChange={(e) => patchParty(p.party_kind, { address: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Entity kind
                <select
                  className={fieldClass}
                  value={p.entity_kind}
                  onChange={(e) =>
                    patchParty(p.party_kind, {
                      entity_kind: e.target.value as PartyUi['entity_kind'],
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="COMPANY">COMPANY</option>
                  <option value="INDIVIDUAL">INDIVIDUAL</option>
                </select>
              </label>
              <Input
                label="Other details"
                value={p.other_details}
                onChange={(e) => patchParty(p.party_kind, { other_details: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          {ATTACH_FLAGS.map((a) => (
            <label key={a.key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
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

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={save.isPending}
            onClick={() =>
              void run(
                () => save.mutateAsync(toDto(form, mode)),
                form.mark_complete ? 'Booking form saved & marked complete.' : 'Booking form saved.',
              )
            }
          >
            Save booking form
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={complete.isPending}
            onClick={() =>
              void run(() => complete.mutateAsync(), 'Booking form completed via /complete.')
            }
          >
            Complete booking form
          </Button>
        </div>
      </div>
    </Card>
  );
}
