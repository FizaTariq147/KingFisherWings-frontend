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
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import { quotationService } from '@/features/quotations/services/quotation.service';
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
    return {
      party_kind: kind,
      full_name: pick(cur.full_name, nxt.full_name),
      address: pick(cur.address, nxt.address),
      city: pick(cur.city, nxt.city),
      country: pick(cur.country, nxt.country),
      entity_kind: (overwrite || !cur.entity_kind ? nxt.entity_kind : cur.entity_kind) || '',
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
    pol: pick(base.pol, fromPortal.pol),
    pod: pick(base.pod, fromPortal.pod),
    shipper_owned_container: pickBool(
      base.shipper_owned_container,
      fromPortal.shipper_owned_container,
    ),
    teu_count: pick(base.teu_count, fromPortal.teu_count),
    origin_city_country: pick(base.origin_city_country, fromPortal.origin_city_country),
    dest_city_country: pick(base.dest_city_country, fromPortal.dest_city_country),
    parties,
    containers:
      overwrite || (!baseHasContainers && portalHasContainers)
        ? fromPortal.containers
        : base.containers,
    attaches: Object.fromEntries(
      ATTACH_FLAGS.map((a) => [
        a.key,
        pickBool(Boolean(base.attaches[a.key]), Boolean(fromPortal.attaches[a.key])),
      ]),
    ),
  };
}

function applyPortalPayloadToFormUi(
  prev: FormUi,
  payload: PortalBookingFormMessagePayload,
  opts?: { overwrite?: boolean },
): FormUi {
  const fromPortal = hydrateForm(portalPayloadToModeBookingFormDto(payload));
  return mergeFormUiPreferExisting(prev, fromPortal, Boolean(opts?.overwrite));
}

const modeTitle: Record<StaffBookingFormMode, string> = {
  SEA_FCL: 'Sea FCL booking form',
  SEA_LCL: 'Sea LCL booking form',
  LAND: 'Land booking form',
  ROAD_FREIGHT: 'Road freight booking form',
  COURIER: 'Courier booking form',
};

const fieldClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-50)]';
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

  const linkedQuoteQuery = useQuery({
    queryKey: ['quotations', 'linked-to-job', jobId],
    queryFn: () => quotationService.findLinkedToJob(jobId),
    enabled: Boolean(jobId),
    staleTime: 60_000,
    retry: 1,
  });
  const linkedQuote = linkedQuoteQuery.data;
  const jobTypePrefix = String(linkedQuote?.job_type ?? mode)
    .toUpperCase()
    .split('_')[0];

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

  useEffect(() => {
    if (query.data == null) return;
    if (panelMode === 'list' || panelMode === 'create') return;
    setForm(hydrateForm(query.data));
    setPortalPrefillApplied(false);
  }, [query.data, panelMode]);

  useEffect(() => {
    const savedForm = query.data as ModeBookingForm | undefined;
    if (savedForm?.mark_complete === true) setForceCompleted(true);
    if (!hasSavedForm) setForceCompleted(false);
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
    setForm((prev) =>
      applyPortalPayloadToFormUi(prev, payload, { overwrite: panelMode === 'create' }),
    );
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

  const run = async (fn: () => Promise<unknown>, success: string, goList = false) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      if (goList) setPanelMode('list');
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const openCreate = () => {
    setErr(null);
    setMsg(null);
    setForm(emptyForm());
    setPortalPrefillApplied(false);
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
    setForm((prev) => applyPortalPayloadToFormUi(prev, payload, { overwrite: true }));
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
          commodity: '',
          client_booking_no: '',
          voyage_ref: '',
          pol: '',
          pod: '',
          request_details: '',
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
  const listStatus = !hasSavedForm
    ? null
    : forceCompleted || saved?.mark_complete === true
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
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Customer portal booking is available
            {portalBookingQuery.data.quoteNumber
              ? ` (${portalBookingQuery.data.quoteNumber})`
              : ''}
            . Click <strong>Add booking form</strong> to load it, then Save.
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
                  <TableHead>Route</TableHead>
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
                        const a =
                          saved?.pol || saved?.origin_city_country || saved?.origin_door_address;
                        const b =
                          saved?.pod || saved?.dest_city_country || saved?.dest_door_address;
                        if (!a && !b) return '—';
                        return `${a || '—'} â†’ ${b || '—'}`;
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-neutral-800)]">
            {panelMode === 'view'
              ? `View · ${modeTitle[mode]}`
              : panelMode === 'create'
                ? `Add · ${modeTitle[mode]}`
                : `Edit · ${modeTitle[mode]}`}
          </h3>
          <p className="text-xs text-[var(--color-neutral-400)]">
            Same layout style as job forms · Save stores via PUT
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={backToList} className="w-full sm:w-auto">
          â† Back to list
        </Button>
      </div>

      {portalBookingQuery.data && !readOnly ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
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

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Date of request"
            type="date"
            disabled={readOnly}
            value={form.date_of_request}
            onChange={(e) => patch({ date_of_request: e.target.value })}
          />
          <Input
            label="Client booking no"
            maxLength={50}
            disabled={readOnly}
            value={form.client_booking_no}
            onChange={(e) => patch({ client_booking_no: e.target.value })}
          />
          <Input
            label="Voyage / trip ref"
            maxLength={50}
            disabled={readOnly}
            value={form.voyage_ref}
            onChange={(e) => patch({ voyage_ref: e.target.value })}
          />
          <label className={labelClass}>
            Service scope
            <select
              className={fieldClass}
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
          <label className={labelClass}>
            Cargo category
            <select
              className={fieldClass}
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
            maxLength={500}
            disabled={readOnly}
            value={form.commodity}
            onChange={(e) => patch({ commodity: e.target.value })}
          />
          <Input
            label="HS code"
            maxLength={20}
            disabled={readOnly}
            value={form.hs_code}
            onChange={(e) => patch({ hs_code: e.target.value })}
          />
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
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cargo &amp; weights</CardTitle>
        </CardHeader>
        <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
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
            label="Origin door address"
            disabled={readOnly}
            value={form.origin_door_address}
            onChange={(e) => patch({ origin_door_address: e.target.value })}
          />
          <Input
            label="Dest door address"
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
              maxLength={20}
              disabled={readOnly}
              value={form.dg_class}
              onChange={(e) => patch({ dg_class: e.target.value })}
            />
          ) : null}
          <label className={`${labelClass} sm:col-span-2`}>
            Insurance details
            <textarea
              disabled={readOnly}
              className="min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm disabled:bg-[var(--color-neutral-50)]"
              value={form.insurance_details}
              onChange={(e) => patch({ insurance_details: e.target.value })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
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
        <Card>
          <CardHeader>
            <CardTitle>Shipment route</CardTitle>
          </CardHeader>
          <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="POL"
              maxLength={100}
              disabled={readOnly}
              value={form.pol}
              onChange={(e) => patch({ pol: e.target.value })}
            />
            <Input
              label="POD"
              maxLength={100}
              disabled={readOnly}
              value={form.pod}
              onChange={(e) => patch({ pod: e.target.value })}
            />
            <Input
              label="Incoterms"
              maxLength={10}
              disabled={readOnly}
              value={form.incoterms}
              onChange={(e) => patch({ incoterms: e.target.value })}
            />
            <label className={labelClass}>
              Freight terms
              <select
                className={fieldClass}
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
                label="CFS warehouse"
                maxLength={200}
                disabled={readOnly}
                value={form.cfs_warehouse}
                onChange={(e) => patch({ cfs_warehouse: e.target.value })}
              />
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
        <Card>
          <CardHeader>
            <CardTitle>Containers</CardTitle>
          </CardHeader>
          <div className="space-y-3 p-4 pt-0">
            {form.containers.map((line, idx) => (
              <div key={idx} className="grid gap-2 sm:grid-cols-4">
                <label className={labelClass}>
                  Container type
                  <select
                    className={fieldClass}
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
                  maxLength={30}
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
        <Card>
          <CardHeader>
            <CardTitle>Land / road / courier</CardTitle>
          </CardHeader>
          <div className="grid gap-4 p-4 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Origin city / country"
              maxLength={200}
              disabled={readOnly}
              value={form.origin_city_country}
              onChange={(e) => patch({ origin_city_country: e.target.value })}
            />
            <Input
              label="Dest city / country"
              maxLength={200}
              disabled={readOnly}
              value={form.dest_city_country}
              onChange={(e) => patch({ dest_city_country: e.target.value })}
            />
            {mode === 'LAND' || mode === 'ROAD_FREIGHT' ? (
              <>
                <label className={labelClass}>
                  Vehicle type
                  <select
                    className={fieldClass}
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
                  maxLength={10}
                  disabled={readOnly}
                  value={form.incoterms}
                  onChange={(e) => patch({ incoterms: e.target.value })}
                />
              </>
            ) : null}
            {mode === 'ROAD_FREIGHT' ? (
              <Input
                label="Border crossing"
                maxLength={200}
                disabled={readOnly}
                value={form.border_crossing}
                onChange={(e) => patch({ border_crossing: e.target.value })}
              />
            ) : null}
            {mode === 'COURIER' ? (
              <Input
                label="Tracking number"
                maxLength={100}
                disabled={readOnly}
                value={form.tracking_number}
                onChange={(e) => patch({ tracking_number: e.target.value })}
              />
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-4 pt-0">
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
                disabled={readOnly}
                value={p.full_name}
                onChange={(e) => patchParty(p.party_kind, { full_name: e.target.value })}
              />
              <Input
                label="City"
                maxLength={100}
                disabled={readOnly}
                value={p.city}
                onChange={(e) => patchParty(p.party_kind, { city: e.target.value })}
              />
              <Input
                label="Country"
                maxLength={100}
                disabled={readOnly}
                value={p.country}
                onChange={(e) => patchParty(p.party_kind, { country: e.target.value })}
              />
              <label className={`${labelClass} sm:col-span-2`}>
                Address
                <textarea
                  disabled={readOnly}
                  className="min-h-[56px] rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm disabled:bg-[var(--color-neutral-50)]"
                  value={p.address}
                  onChange={(e) => patchParty(p.party_kind, { address: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Entity kind
                <select
                  className={fieldClass}
                  disabled={readOnly}
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
                disabled={readOnly}
                value={p.other_details}
                onChange={(e) => patchParty(p.party_kind, { other_details: e.target.value })}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attachments &amp; consent</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-4 pt-0">
          <div className="flex flex-wrap gap-3 text-sm">
            {ATTACH_FLAGS.map((a) => (
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
              void run(
                async () => {
                  const result = await save.mutateAsync(toDto(form, mode));
                  if (form.mark_complete || (result as ModeBookingForm)?.mark_complete) {
                    setForceCompleted(true);
                  }
                },
                form.mark_complete
                  ? 'Booking form saved & marked complete.'
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
  );
}
