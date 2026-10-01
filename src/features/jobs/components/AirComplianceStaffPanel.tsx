import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useCustomerPortalBookingForm } from '@/features/portal-admin-inbox/hooks/usePortalAdminInbox';
import type { PortalBookingFormMessagePayload } from '@/features/portal-quotations/utils/portalBookingFormStorage';
import { quotationService } from '@/features/quotations/services/quotation.service';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  MasterCodeDatalist,
  useMasterCodeOptions,
} from '@/features/masters/hooks/useMasterCodeOptions';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import { API_ENUMS, API_MAX_LENGTH } from '@/lib/api/apiSchema.generated';
import {
  useJob,
  useJobAirComplianceForm,
  useUpdateJobAirComplianceForm,
} from '../hooks/useJobs';
import type {
  AirCompliancePartyDto,
  AirPalletLineDto,
  UpsertAirComplianceBookingFormDto,
} from '../types/job.types';

// Option lists come from the OpenAPI spec — regenerate with `npm run gen:api-schema`.
const SERVICE_SCOPES = API_ENUMS.UpsertAirComplianceBookingFormDto.service_scope;
const SECTORS = API_ENUMS.UpsertAirComplianceBookingFormDto.activity_sector;
const PARTY_KINDS = API_ENUMS.AirCompliancePartyDto.party_kind;
const ENTITY_KINDS = API_ENUMS.AirCompliancePartyDto.entity_kind;
const PARTY_MAX = API_MAX_LENGTH.AirCompliancePartyDto;
const FORM_MAX = API_MAX_LENGTH.UpsertAirComplianceBookingFormDto;
const PALLET_LIST_ID = 'kfw-air-compliance-pallet-types';

type PanelMode = 'list' | 'view' | 'edit' | 'create';

type EntityKind = (typeof ENTITY_KINDS)[number];

function ActionIconButton({
  label,
  onClick,
  tone = 'neutral',
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: 'neutral' | 'primary';
  children: ReactNode;
}) {
  const toneClass =
    tone === 'primary'
      ? 'text-[var(--color-primary-600)] hover:bg-[var(--color-primary-50)]'
      : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]';
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${toneClass}`}
    >
      {children}
    </button>
  );
}

type PartyUi = {
  party_kind: (typeof PARTY_KINDS)[number];
  full_name: string;
  address: string;
  city: string;
  country: string;
  entity_kind: EntityKind | '';
  other_details: string;
};

function asEntityKind(v: unknown): EntityKind | '' {
  return (ENTITY_KINDS as readonly unknown[]).includes(v) ? (v as EntityKind) : '';
}

type PalletUi = {
  pallet_type: string;
  count: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  weight_kg: string;
};

type FormUi = {
  date_of_request: string;
  client_booking_no: string;
  voyage_ref: string;
  service_scope: string;
  origin_door_address: string;
  dest_door_address: string;
  origin_airport_code: string;
  dest_airport_code: string;
  pieces: string;
  gross_weight_kg: string;
  net_weight_kg: string;
  chargeable_weight_kg: string;
  volume_cbm: string;
  pallet_count: string;
  commodity: string;
  hs_code: string;
  final_use: string;
  activity_sector: string;
  insurance_details: string;
  lc_bank_details: string;
  request_details: string;
  booking_agent_line: string;
  agent_requester_name: string;
  sq_bl_booking_reference: string;
  is_dg: boolean;
  attach_commercial_invoice: boolean;
  attach_correspondence: boolean;
  attach_cod_form: boolean;
  attach_licence: boolean;
  consent_accepted: boolean;
  mark_complete: boolean;
  admin_override: boolean;
  stage_override_reason: string;
  parties: PartyUi[];
  pallets: PalletUi[];
};

function emptyParty(kind: PartyUi['party_kind']): PartyUi {
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

function emptyPallet(): PalletUi {
  return {
    pallet_type: '',
    count: '1',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    weight_kg: '',
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
    origin_airport_code: '',
    dest_airport_code: '',
    pieces: '',
    gross_weight_kg: '',
    net_weight_kg: '',
    chargeable_weight_kg: '',
    volume_cbm: '',
    pallet_count: '',
    commodity: '',
    hs_code: '',
    final_use: '',
    activity_sector: '',
    insurance_details: '',
    lc_bank_details: '',
    request_details: '',
    booking_agent_line: '',
    agent_requester_name: '',
    sq_bl_booking_reference: '',
    is_dg: false,
    attach_commercial_invoice: false,
    attach_correspondence: false,
    attach_cod_form: false,
    attach_licence: false,
    consent_accepted: false,
    mark_complete: false,
    admin_override: false,
    stage_override_reason: '',
    parties: PARTY_KINDS.map(emptyParty),
    pallets: [emptyPallet()],
  };
}

function numStr(v: unknown): string {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : typeof v === 'string' ? v : '';
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function parseNum(v: string): number | undefined {
  const t = v.trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeAirportCode(raw?: string | null): string {
  const t = String(raw ?? '')
    .trim()
    .toUpperCase();
  if (!t) return '';
  if (/^[A-Z]{3,4}$/.test(t)) return t;
  return '';
}

function hydrate(raw: Record<string, unknown> | undefined): FormUi {
  const base = emptyForm();
  if (!raw) return base;
  const partiesRaw = Array.isArray(raw.parties) ? (raw.parties as AirCompliancePartyDto[]) : [];
  const parties = PARTY_KINDS.map((kind) => {
    const found = partiesRaw.find((p) => p.party_kind === kind);
    return {
      party_kind: kind,
      full_name: str(found?.full_name),
      address: str(found?.address),
      city: str(found?.city),
      country: str(found?.country),
      entity_kind: asEntityKind(found?.entity_kind),
      other_details: str(found?.other_details),
    };
  });
  const palletsRaw = Array.isArray(raw.pallets) ? (raw.pallets as AirPalletLineDto[]) : [];
  const pallets =
    palletsRaw.length > 0
      ? palletsRaw.map((p) => ({
          pallet_type: str(p.pallet_type),
          count: numStr(p.count) || '1',
          length_cm: numStr(p.length_cm),
          width_cm: numStr(p.width_cm),
          height_cm: numStr(p.height_cm),
          weight_kg: numStr(p.weight_kg),
        }))
      : base.pallets;

  return {
    ...base,
    date_of_request: str(raw.date_of_request).slice(0, 10) || base.date_of_request,
    client_booking_no: str(raw.client_booking_no),
    voyage_ref: str(raw.voyage_ref),
    service_scope: str(raw.service_scope) || base.service_scope,
    origin_door_address: str(raw.origin_door_address),
    dest_door_address: str(raw.dest_door_address),
    origin_airport_code: str(raw.origin_airport_code).toUpperCase(),
    dest_airport_code: str(raw.dest_airport_code).toUpperCase(),
    pieces: numStr(raw.pieces),
    gross_weight_kg: numStr(raw.gross_weight_kg),
    net_weight_kg: numStr(raw.net_weight_kg),
    chargeable_weight_kg: numStr(raw.chargeable_weight_kg),
    volume_cbm: numStr(raw.volume_cbm),
    pallet_count: numStr(raw.pallet_count),
    commodity: str(raw.commodity),
    hs_code: str(raw.hs_code),
    final_use: str(raw.final_use),
    activity_sector: str(raw.activity_sector),
    insurance_details: str(raw.insurance_details),
    lc_bank_details: str(raw.lc_bank_details),
    request_details: str(raw.request_details),
    booking_agent_line: str(raw.booking_agent_line),
    agent_requester_name: str(raw.agent_requester_name),
    sq_bl_booking_reference: str(raw.sq_bl_booking_reference),
    is_dg: raw.is_dg === true,
    attach_commercial_invoice: raw.attach_commercial_invoice === true,
    attach_correspondence: raw.attach_correspondence === true,
    attach_cod_form: raw.attach_cod_form === true,
    attach_licence: raw.attach_licence === true,
    consent_accepted: raw.consent_accepted === true,
    mark_complete: raw.mark_complete === true,
    admin_override: raw.admin_override === true,
    stage_override_reason: str(raw.stage_override_reason),
    parties,
    pallets,
  };
}

/** True when staff GET has no meaningful customer/ops data yet. */
function complianceFormIsEmpty(raw: unknown): boolean {
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
    String(r.origin_airport_code ?? '').trim() ||
      String(r.dest_airport_code ?? '').trim() ||
      String(r.origin_door_address ?? '').trim() ||
      String(r.dest_door_address ?? '').trim(),
  );
  const hasCommodity = Boolean(String(r.commodity ?? '').trim());
  const hasBookingNo = Boolean(String(r.client_booking_no ?? '').trim());
  const hasWeight = r.gross_weight_kg != null && Number(r.gross_weight_kg) > 0;
  const pallets = Array.isArray(r.pallets) ? r.pallets : [];
  const hasPallet = pallets.some(
    (p) =>
      p &&
      typeof p === 'object' &&
      (String((p as { pallet_type?: string }).pallet_type ?? '').trim() ||
        Number((p as { count?: number }).count) > 0),
  );
  return !(hasParty || hasRoute || hasCommodity || hasBookingNo || hasWeight || hasPallet);
}

function portalPayloadToComplianceForm(
  payload: PortalBookingFormMessagePayload,
  defaults?: { agentLine?: string; quoteNumber?: string; markComplete?: boolean },
): FormUi {
  const base = emptyForm();
  const parties = PARTY_KINDS.map((kind) => {
    const found = (payload.parties ?? []).find((p) => p.party_kind === kind);
    return {
      party_kind: kind,
      full_name: found?.full_name?.trim() || '',
      address: found?.address?.trim() || '',
      city: found?.city?.trim() || '',
      country: found?.country?.trim() || '',
      entity_kind: asEntityKind(found?.entity_kind),
      other_details: found?.other_details?.trim() || '',
    };
  });

  const portalPallets = (payload.pallets ?? [])
    .filter((p) => p && (String(p.pallet_type ?? '').trim() || Number(p.count) > 0))
    .map((p) => ({
      pallet_type: String(p.pallet_type ?? ''),
      count: p.count != null ? String(p.count) : '1',
      length_cm: p.length_cm != null ? String(p.length_cm) : '',
      width_cm: p.width_cm != null ? String(p.width_cm) : '',
      height_cm: p.height_cm != null ? String(p.height_cm) : '',
      weight_kg: p.weight_kg != null ? String(p.weight_kg) : '',
    }));

  const originAirport =
    normalizeAirportCode(payload.origin_airport_code) ||
    normalizeAirportCode(payload.pol) ||
    '';
  const destAirport =
    normalizeAirportCode(payload.dest_airport_code) ||
    normalizeAirportCode(payload.pod) ||
    '';

  const scope = String(payload.service_scope ?? '').trim();
  const sector = String(payload.activity_sector ?? '').trim();

  return {
    ...base,
    date_of_request: payload.date_of_request?.slice(0, 10) || '',
    client_booking_no: payload.client_booking_no?.trim() || '',
    voyage_ref: payload.voyage_ref?.trim() || '',
    service_scope:
      (SERVICE_SCOPES as readonly string[]).includes(scope) ? scope : SERVICE_SCOPES[0],
    origin_door_address: payload.origin_door_address?.trim() || '',
    dest_door_address: payload.dest_door_address?.trim() || '',
    origin_airport_code: originAirport,
    dest_airport_code: destAirport,
    pieces: payload.pieces != null ? String(payload.pieces) : '',
    gross_weight_kg: payload.gross_weight_kg != null ? String(payload.gross_weight_kg) : '',
    net_weight_kg: payload.net_weight_kg != null ? String(payload.net_weight_kg) : '',
    chargeable_weight_kg:
      payload.chargeable_weight_kg != null ? String(payload.chargeable_weight_kg) : '',
    volume_cbm: payload.volume_cbm != null ? String(payload.volume_cbm) : '',
    pallet_count:
      payload.pallet_count != null
        ? String(payload.pallet_count)
        : portalPallets.length
          ? String(
              portalPallets.reduce((n, p) => n + (Number(p.count) || 0), 0) ||
                portalPallets.length,
            )
          : '',
    commodity: payload.commodity?.trim() || '',
    hs_code: payload.hs_code?.trim() || '',
    final_use: payload.final_use?.trim() || '',
    activity_sector: (SECTORS as readonly string[]).includes(sector) ? sector : '',
    insurance_details: payload.insurance_details?.trim() || '',
    lc_bank_details: payload.lc_bank_details?.trim() || '',
    request_details: payload.request_details?.trim() || '',
    booking_agent_line:
      payload.booking_agent_line?.trim() || defaults?.agentLine?.trim() || '',
    agent_requester_name: payload.agent_requester_name?.trim() || '',
    sq_bl_booking_reference:
      payload.sq_bl_booking_reference?.trim() ||
      payload.quoteNumber?.trim() ||
      defaults?.quoteNumber?.trim() ||
      '',
    is_dg: Boolean(payload.is_dg),
    attach_commercial_invoice: Boolean(payload.attach_commercial_invoice),
    attach_correspondence: Boolean(payload.attach_correspondence),
    attach_cod_form: Boolean(payload.attach_cod_form),
    attach_licence: Boolean(payload.attach_licence),
    // Mirror customer completion so admin list shows Completed (staff can still edit).
    consent_accepted: Boolean(payload.consent_accepted),
    mark_complete:
      defaults?.markComplete === true || Boolean(payload.mark_complete),
    admin_override: false,
    stage_override_reason: '',
    parties,
    pallets: portalPallets.length ? portalPallets : base.pallets,
  };
}

function mergePreferExisting(base: FormUi, fromPortal: FormUi, overwrite: boolean): FormUi {
  const pick = (current: string, next: string) => {
    const n = (next ?? '').trim();
    if (!n) return current;
    if (overwrite || !current.trim()) return n;
    return current;
  };
  const pickBool = (current: boolean, next: boolean) => (overwrite ? next : current || next);

  return {
    ...base,
    date_of_request: pick(base.date_of_request, fromPortal.date_of_request),
    client_booking_no: pick(base.client_booking_no, fromPortal.client_booking_no),
    voyage_ref: pick(base.voyage_ref, fromPortal.voyage_ref),
    service_scope: pick(base.service_scope, fromPortal.service_scope) || base.service_scope,
    origin_door_address: pick(base.origin_door_address, fromPortal.origin_door_address),
    dest_door_address: pick(base.dest_door_address, fromPortal.dest_door_address),
    origin_airport_code: pick(base.origin_airport_code, fromPortal.origin_airport_code),
    dest_airport_code: pick(base.dest_airport_code, fromPortal.dest_airport_code),
    pieces: pick(base.pieces, fromPortal.pieces),
    gross_weight_kg: pick(base.gross_weight_kg, fromPortal.gross_weight_kg),
    net_weight_kg: pick(base.net_weight_kg, fromPortal.net_weight_kg),
    chargeable_weight_kg: pick(base.chargeable_weight_kg, fromPortal.chargeable_weight_kg),
    volume_cbm: pick(base.volume_cbm, fromPortal.volume_cbm),
    pallet_count: pick(base.pallet_count, fromPortal.pallet_count),
    commodity: pick(base.commodity, fromPortal.commodity),
    hs_code: pick(base.hs_code, fromPortal.hs_code),
    final_use: pick(base.final_use, fromPortal.final_use),
    activity_sector: pick(base.activity_sector, fromPortal.activity_sector),
    insurance_details: pick(base.insurance_details, fromPortal.insurance_details),
    lc_bank_details: pick(base.lc_bank_details, fromPortal.lc_bank_details),
    request_details: pick(base.request_details, fromPortal.request_details),
    booking_agent_line: pick(base.booking_agent_line, fromPortal.booking_agent_line),
    agent_requester_name: pick(base.agent_requester_name, fromPortal.agent_requester_name),
    sq_bl_booking_reference: pick(
      base.sq_bl_booking_reference,
      fromPortal.sq_bl_booking_reference,
    ),
    is_dg: pickBool(base.is_dg, fromPortal.is_dg),
    attach_commercial_invoice: pickBool(
      base.attach_commercial_invoice,
      fromPortal.attach_commercial_invoice,
    ),
    attach_correspondence: pickBool(
      base.attach_correspondence,
      fromPortal.attach_correspondence,
    ),
    attach_cod_form: pickBool(base.attach_cod_form, fromPortal.attach_cod_form),
    attach_licence: pickBool(base.attach_licence, fromPortal.attach_licence),
    consent_accepted: pickBool(base.consent_accepted, fromPortal.consent_accepted),
    mark_complete: overwrite
      ? fromPortal.mark_complete
      : base.mark_complete || fromPortal.mark_complete,
    admin_override: base.admin_override,
    stage_override_reason: base.stage_override_reason,
    parties: PARTY_KINDS.map((kind) => {
      const cur = base.parties.find((p) => p.party_kind === kind) ?? emptyParty(kind);
      const nxt = fromPortal.parties.find((p) => p.party_kind === kind) ?? emptyParty(kind);
      return {
        party_kind: kind,
        full_name: pick(cur.full_name, nxt.full_name),
        address: pick(cur.address, nxt.address),
        city: pick(cur.city, nxt.city),
        country: pick(cur.country, nxt.country),
        entity_kind:
          overwrite || !cur.entity_kind ? nxt.entity_kind || cur.entity_kind : cur.entity_kind,
        other_details: pick(cur.other_details, nxt.other_details),
      };
    }),
    pallets: (() => {
      const portalHas = fromPortal.pallets.some(
        (p) => p.pallet_type.trim() || Number(p.count) > 1 || p.weight_kg.trim(),
      );
      const baseHas = base.pallets.some(
        (p) => p.pallet_type.trim() || Number(p.count) > 1 || p.weight_kg.trim(),
      );
      if (overwrite || (!baseHas && portalHas)) return fromPortal.pallets;
      return base.pallets;
    })(),
  };
}

function toDto(form: FormUi): UpsertAirComplianceBookingFormDto {
  const parties: AirCompliancePartyDto[] = form.parties
    .filter((p) => p.full_name.trim() || p.address.trim())
    .map((p) => ({
      party_kind: p.party_kind,
      full_name: p.full_name.trim() || undefined,
      address: p.address.trim() || undefined,
      city: p.city.trim() || undefined,
      country: p.country.trim() || undefined,
      entity_kind: p.entity_kind || undefined,
      other_details: p.other_details.trim() || undefined,
    }));

  const pallets: AirPalletLineDto[] = form.pallets
    .map((p) => ({
      pallet_type: p.pallet_type.trim(),
      count: parseNum(p.count) ?? 0,
      length_cm: parseNum(p.length_cm),
      width_cm: parseNum(p.width_cm),
      height_cm: parseNum(p.height_cm),
      weight_kg: parseNum(p.weight_kg),
    }))
    .filter((p) => p.pallet_type && p.count >= 1);

  return {
    date_of_request: form.date_of_request || undefined,
    client_booking_no: form.client_booking_no.trim() || undefined,
    voyage_ref: form.voyage_ref.trim() || undefined,
    service_scope: form.service_scope || undefined,
    origin_door_address: form.origin_door_address.trim() || undefined,
    dest_door_address: form.dest_door_address.trim() || undefined,
    origin_airport_code: form.origin_airport_code.trim().toUpperCase() || undefined,
    dest_airport_code: form.dest_airport_code.trim().toUpperCase() || undefined,
    pieces: parseNum(form.pieces),
    gross_weight_kg: parseNum(form.gross_weight_kg),
    net_weight_kg: parseNum(form.net_weight_kg),
    chargeable_weight_kg: parseNum(form.chargeable_weight_kg),
    volume_cbm: parseNum(form.volume_cbm),
    pallet_count: parseNum(form.pallet_count),
    pallets: pallets.length ? pallets : undefined,
    commodity: form.commodity.trim() || undefined,
    hs_code: form.hs_code.trim() || undefined,
    final_use: form.final_use.trim() || undefined,
    activity_sector: form.activity_sector || undefined,
    insurance_details: form.insurance_details.trim() || undefined,
    lc_bank_details: form.lc_bank_details.trim() || undefined,
    request_details: form.request_details.trim() || undefined,
    booking_agent_line: form.booking_agent_line.trim() || undefined,
    agent_requester_name: form.agent_requester_name.trim() || undefined,
    sq_bl_booking_reference: form.sq_bl_booking_reference.trim() || undefined,
    is_dg: form.is_dg,
    attach_commercial_invoice: form.attach_commercial_invoice,
    attach_correspondence: form.attach_correspondence,
    attach_cod_form: form.attach_cod_form,
    attach_licence: form.attach_licence,
    consent_accepted: form.consent_accepted,
    mark_complete: form.mark_complete,
    admin_override: form.admin_override,
    stage_override_reason: form.stage_override_reason.trim() || undefined,
    parties: parties.length ? parties : undefined,
  };
}

const fieldClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] disabled:cursor-not-allowed disabled:bg-[var(--color-neutral-50)]';
const labelClass =
  'flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-600)]';
const sectionCardClass =
  'rounded-[20px] border-[var(--color-neutral-100)] shadow-[0_10px_30px_rgba(10,41,66,0.05)]';
const sectionTitleClass =
  'text-base font-semibold tracking-tight text-[var(--color-neutral-900)]';

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className={sectionCardClass} padding="none">
      <CardHeader className="border-b-0 pb-1 mb-2">
        <CardTitle className={sectionTitleClass}>{title}</CardTitle>
      </CardHeader>
      <div className="space-y-3 p-5 pt-0">{children}</div>
    </Card>
  );
}

/** Staff GET/PUT /jobs/:id/air/compliance-form — UpsertAirComplianceBookingFormDto. */
export function AirComplianceStaffPanel({ jobId }: { jobId: string }) {
  const formQuery = useJobAirComplianceForm(jobId);
  const save = useUpdateJobAirComplianceForm(jobId);
  const { data: job } = useJob(jobId);
  const [panelMode, setPanelMode] = useState<PanelMode>('list');
  const [form, setForm] = useState<FormUi>(emptyForm);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [portalPrefillApplied, setPortalPrefillApplied] = useState(false);
  const [portalPrefillKey, setPortalPrefillKey] = useState('');
  const [forceCompleted, setForceCompleted] = useState(false);
  const apiSyncAttempted = useRef(false);
  const { data: organization } = useOrganizationProfile();
  const palletTypeOptions = useMasterCodeOptions('air-pallet-types');
  const defaultAgentLine = (organization?.display_name || organization?.name || '')
    .trim()
    .slice(0, FORM_MAX.booking_agent_line);

  const linkedQuoteQuery = useQuery({
    queryKey: [
      'quotations',
      'linked-to-job',
      jobId,
      'air-compliance',
      job?.job_number ?? '',
      job?.job_type ?? '',
    ],
    queryFn: () =>
      quotationService.findLinkedToJob(jobId, {
        jobNumber: job?.job_number,
        jobType: job?.job_type,
        customerId: job?.shipper_id || job?.billing_party_id,
      }),
    enabled: Boolean(jobId),
    staleTime: 30_000,
    retry: 1,
  });
  const linkedQuote = linkedQuoteQuery.data;

  const portalBookingQuery = useCustomerPortalBookingForm(
    {
      jobId,
      quotationId: linkedQuote?.id,
      quoteNumber: linkedQuote?.quotation_number || linkedQuote?.quote_no,
      jobTypePrefix: 'AIR',
      jobNumber: job?.job_number,
    },
    Boolean(jobId),
  );

  const portalPayload = portalBookingQuery.data;
  const customerCompleted = Boolean(portalPayload?.mark_complete);

  const apiEmpty = useMemo(
    () => complianceFormIsEmpty(formQuery.data),
    [formQuery.data],
  );

  /** Row exists when staff API has data OR customer already submitted portal form. */
  const hasSavedForm = !apiEmpty || Boolean(portalPayload);

  const buildFromPortal = (payload: PortalBookingFormMessagePayload) =>
    portalPayloadToComplianceForm(payload, {
      agentLine: defaultAgentLine,
      quoteNumber: linkedQuote?.quotation_number || linkedQuote?.quote_no,
      markComplete: Boolean(payload.mark_complete),
    });

  useEffect(() => {
    if (panelMode === 'list' || panelMode === 'create') return;
    if (!formQuery.data || complianceFormIsEmpty(formQuery.data)) return;
    setForm(hydrate(formQuery.data as Record<string, unknown>));
  }, [formQuery.data, panelMode]);

  useEffect(() => {
    const saved = formQuery.data as { mark_complete?: boolean } | undefined;
    if (saved?.mark_complete === true || customerCompleted) {
      setForceCompleted(true);
    } else if (apiEmpty && !portalPayload) {
      setForceCompleted(false);
    }
  }, [formQuery.data, customerCompleted, apiEmpty, portalPayload]);

  /** Prefill create/edit from portal — matching customer fields autofill whenever payload is found. */
  useEffect(() => {
    if (panelMode !== 'create' && panelMode !== 'edit') return;
    if (formQuery.isLoading || formQuery.isFetching) return;
    if (!portalPayload) return;
    const payloadKey = `${portalPayload.quotationId}:${portalPayload.submittedAt || ''}:${portalPayload.mark_complete ? 1 : 0}`;
    const key = `${payloadKey}:${panelMode}`;
    if (portalPrefillApplied && portalPrefillKey === key) return;
    const prevPayloadKey = portalPrefillKey.includes(':')
      ? portalPrefillKey.split(':').slice(0, 3).join(':')
      : '';
    const isResubmit = Boolean(prevPayloadKey && prevPayloadKey !== payloadKey);
    const overwrite = panelMode === 'create' || isResubmit || apiEmpty;
    setForm((prev) => mergePreferExisting(prev, buildFromPortal(portalPayload), overwrite));
    setPortalPrefillApplied(true);
    setPortalPrefillKey(key);
    setMsg(
      `Autofilled from customer portal (quote ${
        portalPayload.quoteNumber || portalPayload.quotationId.slice(0, 8)
      }). Review matching fields, then Save.`,
    );
  }, [
    panelMode,
    portalPrefillApplied,
    portalPrefillKey,
    formQuery.isLoading,
    formQuery.isFetching,
    portalPayload,
    apiEmpty,
    defaultAgentLine,
    linkedQuote?.quotation_number,
    linkedQuote?.quote_no,
  ]);

  /** Persist portal → staff API when empty (keeps list Completed after customer submit). */
  useEffect(() => {
    if (!jobId) return;
    if (apiSyncAttempted.current) return;
    if (formQuery.isLoading || formQuery.isFetching) return;
    if (!apiEmpty) return;
    if (!portalPayload) return;
    apiSyncAttempted.current = true;
    let cancelled = false;
    void (async () => {
      try {
        const dto = toDto(buildFromPortal(portalPayload));
        await save.mutateAsync(dto);
        if (!cancelled) {
          if (portalPayload.mark_complete) setForceCompleted(true);
          void formQuery.refetch();
        }
      } catch {
        apiSyncAttempted.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    jobId,
    apiEmpty,
    formQuery.isLoading,
    formQuery.isFetching,
    portalPayload,
    defaultAgentLine,
    linkedQuote?.quotation_number,
    linkedQuote?.quote_no,
  ]);

  const patch = (partial: Partial<FormUi>) => {
    if (panelMode === 'view') return;
    setForm((prev) => ({ ...prev, ...partial }));
  };
  const patchParty = (kind: PartyUi['party_kind'], partial: Partial<PartyUi>) => {
    if (panelMode === 'view') return;
    setForm((prev) => ({
      ...prev,
      parties: prev.parties.map((x) => (x.party_kind === kind ? { ...x, ...partial } : x)),
    }));
  };

  const hydrateDisplayForm = (): FormUi => {
    if (!apiEmpty && formQuery.data) {
      const base = hydrate(formQuery.data as Record<string, unknown>);
      if (portalPayload) {
        return mergePreferExisting(base, buildFromPortal(portalPayload), false);
      }
      return base;
    }
    if (portalPayload) return buildFromPortal(portalPayload);
    return emptyForm();
  };

  const openCreate = () => {
    setError(null);
    setMsg(null);
    setPortalPrefillApplied(false);
    setPortalPrefillKey('');
    if (portalPayload) {
      setForm(buildFromPortal(portalPayload));
      setPortalPrefillApplied(true);
      setPortalPrefillKey(
        `${portalPayload.quotationId}:${portalPayload.submittedAt || ''}:${portalPayload.mark_complete ? 1 : 0}:create`,
      );
      setMsg(
        `Autofilled from customer portal (quote ${
          portalPayload.quoteNumber || portalPayload.quotationId.slice(0, 8)
        }). Review matching fields, then Save.`,
      );
    } else {
      setForm(emptyForm());
    }
    setPanelMode('create');
  };

  const openView = () => {
    setError(null);
    setMsg(null);
    setForm(hydrateDisplayForm());
    setPortalPrefillApplied(true);
    setPanelMode('view');
  };

  const openEdit = () => {
    setError(null);
    setMsg(null);
    setPortalPrefillApplied(false);
    setPortalPrefillKey('');
    const base = hydrateDisplayForm();
    setForm(
      portalPayload
        ? mergePreferExisting(base, buildFromPortal(portalPayload), apiEmpty)
        : base,
    );
    setPortalPrefillApplied(true);
    if (portalPayload) {
      setPortalPrefillKey(
        `${portalPayload.quotationId}:${portalPayload.submittedAt || ''}:${portalPayload.mark_complete ? 1 : 0}:edit`,
      );
      setMsg(
        `Autofilled from customer portal (quote ${
          portalPayload.quoteNumber || portalPayload.quotationId.slice(0, 8)
        }). Empty matching fields filled from customer submit.`,
      );
    }
    setPanelMode('edit');
  };

  const applyPortalOverwrite = () => {
    const payload = portalBookingQuery.data;
    if (!payload) return;
    setForm((prev) => mergePreferExisting(prev, buildFromPortal(payload), true));
    setMsg(
      `Autofilled from customer portal (quote ${
        payload.quoteNumber || payload.quotationId.slice(0, 8)
      }). Matching fields re-applied — review, then Save.`,
    );
  };

  const onSave = async (goList = true) => {
    setError(null);
    setMsg(null);
    try {
      const next = {
        ...form,
        booking_agent_line: form.booking_agent_line || defaultAgentLine,
      };
      await save.mutateAsync(toDto(next));
      if (next.mark_complete) setForceCompleted(true);
      setMsg(
        next.mark_complete
          ? 'Air compliance form saved & marked complete.'
          : 'Air compliance form saved.',
      );
      if (goList) {
        setPanelMode('list');
        void formQuery.refetch();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saved = formQuery.data as Record<string, unknown> | undefined;
  const displayForList = !apiEmpty
    ? hydrate(saved)
    : portalPayload
      ? buildFromPortal(portalPayload)
      : null;
  const shipperName =
    displayForList?.parties.find((p) => p.party_kind === 'SHIPPER')?.full_name?.trim() ||
    '—';
  const listStatus = !hasSavedForm
    ? null
    : forceCompleted ||
        customerCompleted ||
        (saved as { mark_complete?: boolean } | undefined)?.mark_complete === true
      ? 'Completed'
      : 'Draft';
  const readOnly = panelMode === 'view';

  if (panelMode === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-neutral-800)]">
              Air compliance / booking form
            </h3>
            <p className="text-xs text-[var(--color-neutral-400)]">
              Saved forms for this job ·{' '}
              <code className="text-[10px]">/jobs/:id/air/compliance-form</code>
              <span className="mt-1 block">
                Status: <strong>Completed</strong> when the customer submits the portal booking
                form (or staff marks complete) · <strong>Draft</strong> after Save without
                complete
              </span>
            </p>
          </div>
          {!hasSavedForm ? (
            <Button type="button" onClick={openCreate} className="w-full sm:w-auto">
              + Add booking form
            </Button>
          ) : null}
        </div>

        {portalPayload && apiEmpty ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            Customer portal booking is available
            {portalPayload.quoteNumber ? ` (${portalPayload.quoteNumber})` : ''}
            {customerCompleted ? ' · submitted' : ''}
            . Opening View/Edit auto-fills those values.
          </div>
        ) : null}

        {formQuery.isLoading ||
        linkedQuoteQuery.isFetching ||
        portalBookingQuery.isFetching ||
        portalBookingQuery.isLoading ? (
          <p className="text-sm text-[var(--color-neutral-400)]">
            Looking up customer booking form…
          </p>
        ) : null}
        {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
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
                {formQuery.isLoading ||
                portalBookingQuery.isLoading ||
                (portalBookingQuery.isFetching && !hasSavedForm) ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <p className="py-6 text-center text-sm text-[var(--color-neutral-400)]">
                        Looking up customer portal booking form…
                      </p>
                    </TableCell>
                  </TableRow>
                ) : !hasSavedForm || !displayForList ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <p className="py-6 text-center text-sm text-[var(--color-neutral-400)]">
                        No booking form yet. When the customer completes the portal form, it
                        appears here as Completed. If they already submitted, refresh this page —
                        we match by linked quote / portal inbox.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell>{displayForList.client_booking_no || '—'}</TableCell>
                    <TableCell>{displayForList.commodity || '—'}</TableCell>
                    <TableCell>
                      {(() => {
                        const a = displayForList.origin_airport_code;
                        const b = displayForList.dest_airport_code;
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
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 overflow-hidden rounded-[20px] border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)]/40 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            className="mb-2 text-xs font-medium text-[var(--color-primary-600)] hover:underline"
            onClick={() => {
              setPanelMode('list');
              setMsg(null);
              setError(null);
            }}
          >
            ← Back to list
          </button>
          <h3 className="text-lg font-semibold tracking-tight text-[var(--color-neutral-900)]">
            {panelMode === 'view'
              ? 'View air compliance form'
              : panelMode === 'create'
                ? 'Create air compliance form'
                : 'Edit air compliance form'}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
            Staff <code className="text-[10px]">/jobs/:id/air/compliance-form</code>
            {' · '}
            autofilled from customer portal when available
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {portalBookingQuery.data && !readOnly ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={portalBookingQuery.isFetching}
              onClick={applyPortalOverwrite}
            >
              Reload from customer
            </Button>
          ) : null}
          {!readOnly ? (
            <Button type="button" size="sm" disabled={save.isPending} onClick={() => void onSave()}>
              {save.isPending ? 'Saving…' : 'Save compliance form'}
            </Button>
          ) : (
            <Button type="button" size="sm" variant="secondary" onClick={openEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {portalBookingQuery.data ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
          Autofilled from customer portal
          {portalBookingQuery.data.quoteNumber
            ? ` · ${portalBookingQuery.data.quoteNumber}`
            : ''}
          {portalBookingQuery.data.mark_complete ? ' · submitted (Completed)' : ' · draft'}
          . Matching fields mirror the customer booking form.
        </div>
      ) : null}

      {formQuery.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading compliance form…</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <fieldset disabled={readOnly} className="space-y-5 border-0 p-0">

      <Section title="Route & booking">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>
            Date of request
            <input
              type="date"
              className={fieldClass}
              value={form.date_of_request}
              onChange={(e) => patch({ date_of_request: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Client booking no
            <input
              className={fieldClass}
              maxLength={FORM_MAX.client_booking_no}
              value={form.client_booking_no}
              onChange={(e) => patch({ client_booking_no: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Voyage / flight ref
            <input
              className={fieldClass}
              maxLength={FORM_MAX.voyage_ref}
              value={form.voyage_ref}
              onChange={(e) => patch({ voyage_ref: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Service scope
            <select
              className={fieldClass}
              value={form.service_scope}
              onChange={(e) => patch({ service_scope: e.target.value })}
            >
              {SERVICE_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Origin airport
            <input
              className={fieldClass}
              placeholder="DXB"
              maxLength={FORM_MAX.origin_airport_code}
              value={form.origin_airport_code}
              onChange={(e) => patch({ origin_airport_code: e.target.value.toUpperCase() })}
            />
          </label>
          <label className={labelClass}>
            Destination airport
            <input
              className={fieldClass}
              placeholder="RUH"
              maxLength={FORM_MAX.dest_airport_code}
              value={form.dest_airport_code}
              onChange={(e) => patch({ dest_airport_code: e.target.value.toUpperCase() })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Origin door address
            <input
              className={fieldClass}
              value={form.origin_door_address}
              onChange={(e) => patch({ origin_door_address: e.target.value })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Destination door address
            <input
              className={fieldClass}
              value={form.dest_door_address}
              onChange={(e) => patch({ dest_door_address: e.target.value })}
            />
          </label>
        </div>
      </Section>

      <Section title="Cargo & weights">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>
            Pieces
            <input
              type="number"
              min={1}
              className={fieldClass}
              value={form.pieces}
              onChange={(e) => patch({ pieces: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Gross weight (kg)
            <input
              type="number"
              className={fieldClass}
              value={form.gross_weight_kg}
              onChange={(e) => patch({ gross_weight_kg: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Net weight (kg)
            <input
              type="number"
              className={fieldClass}
              value={form.net_weight_kg}
              onChange={(e) => patch({ net_weight_kg: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Chargeable weight (kg)
            <input
              type="number"
              className={fieldClass}
              value={form.chargeable_weight_kg}
              onChange={(e) => patch({ chargeable_weight_kg: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Volume (CBM)
            <input
              type="number"
              className={fieldClass}
              value={form.volume_cbm}
              onChange={(e) => patch({ volume_cbm: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Pallet count
            <input
              type="number"
              min={0}
              className={fieldClass}
              value={form.pallet_count}
              onChange={(e) => patch({ pallet_count: e.target.value })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Commodity
            <input
              className={fieldClass}
              maxLength={FORM_MAX.commodity}
              value={form.commodity}
              onChange={(e) => patch({ commodity: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            HS code
            <input
              className={fieldClass}
              maxLength={FORM_MAX.hs_code}
              value={form.hs_code}
              onChange={(e) => patch({ hs_code: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Final use
            <input
              className={fieldClass}
              maxLength={FORM_MAX.final_use}
              value={form.final_use}
              onChange={(e) => patch({ final_use: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Activity sector
            <select
              className={fieldClass}
              value={form.activity_sector}
              onChange={(e) => patch({ activity_sector: e.target.value })}
            >
              <option value="">—</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 pt-6 text-sm text-[var(--color-neutral-700)]">
            <input
              type="checkbox"
              checked={form.is_dg}
              onChange={(e) => patch({ is_dg: e.target.checked })}
            />
            Dangerous goods
          </label>
        </div>
      </Section>

      <Section title="Pallets">
        <div className="space-y-3">
          {form.pallets.map((line, idx) => (
            <div
              key={idx}
              className="grid gap-2 rounded-xl border border-[var(--color-neutral-100)] bg-white p-3 sm:grid-cols-3 lg:grid-cols-6"
            >
              <label className={labelClass}>
                Type
                <input
                  className={fieldClass}
                  maxLength={API_MAX_LENGTH.AirPalletLineDto.pallet_type}
                  list={PALLET_LIST_ID}
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
              </label>
              <label className={labelClass}>
                Count
                <input
                  type="number"
                  min={1}
                  className={fieldClass}
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
              </label>
              <label className={labelClass}>
                L (cm)
                <input
                  type="number"
                  className={fieldClass}
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
              </label>
              <label className={labelClass}>
                W (cm)
                <input
                  type="number"
                  className={fieldClass}
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
              </label>
              <label className={labelClass}>
                H (cm)
                <input
                  type="number"
                  className={fieldClass}
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
              </label>
              <label className={labelClass}>
                Weight (kg)
                <input
                  type="number"
                  className={fieldClass}
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
              </label>
            </div>
          ))}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() =>
              setForm((prev) => ({ ...prev, pallets: [...prev.pallets, emptyPallet()] }))
            }
          >
            Add pallet line
          </Button>
          <MasterCodeDatalist id={PALLET_LIST_ID} options={palletTypeOptions} />
        </div>
      </Section>

      <Section title="Parties">
        <div className="grid gap-3 lg:grid-cols-3">
          {form.parties.map((p) => (
            <div
              key={p.party_kind}
              className="space-y-2 rounded-xl border border-[var(--color-neutral-100)] bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-700)]">
                {p.party_kind}
              </p>
              <label className={labelClass}>
                Name
                <input
                  className={fieldClass}
                  maxLength={PARTY_MAX.full_name}
                  value={p.full_name}
                  onChange={(e) => patchParty(p.party_kind, { full_name: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Address
                <input
                  className={fieldClass}
                  value={p.address}
                  onChange={(e) => patchParty(p.party_kind, { address: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                City
                <input
                  className={fieldClass}
                  maxLength={PARTY_MAX.city}
                  value={p.city}
                  onChange={(e) => patchParty(p.party_kind, { city: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Country
                <input
                  className={fieldClass}
                  maxLength={PARTY_MAX.country}
                  value={p.country}
                  onChange={(e) => patchParty(p.party_kind, { country: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Entity kind
                <select
                  className={fieldClass}
                  value={p.entity_kind}
                  onChange={(e) =>
                    patchParty(p.party_kind, { entity_kind: asEntityKind(e.target.value) })
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
              <label className={labelClass}>
                Other details
                <input
                  className={fieldClass}
                  placeholder="Email, phone, IDs"
                  value={p.other_details}
                  onChange={(e) => patchParty(p.party_kind, { other_details: e.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Agent, docs & notes">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className={`${labelClass} sm:col-span-2`}>
            Booking agent line
            <input
              className={fieldClass}
              maxLength={FORM_MAX.booking_agent_line}
              placeholder={defaultAgentLine || undefined}
              value={form.booking_agent_line}
              onChange={(e) => patch({ booking_agent_line: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            Agent requester
            <input
              className={fieldClass}
              maxLength={FORM_MAX.agent_requester_name}
              value={form.agent_requester_name}
              onChange={(e) => patch({ agent_requester_name: e.target.value })}
            />
          </label>
          <label className={labelClass}>
            SQ / booking reference
            <input
              className={fieldClass}
              maxLength={FORM_MAX.sq_bl_booking_reference}
              value={form.sq_bl_booking_reference}
              onChange={(e) => patch({ sq_bl_booking_reference: e.target.value })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Insurance details
            <textarea
              className={`${fieldClass} min-h-[72px] py-2`}
              value={form.insurance_details}
              onChange={(e) => patch({ insurance_details: e.target.value })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            LC / bank details
            <textarea
              className={`${fieldClass} min-h-[72px] py-2`}
              value={form.lc_bank_details}
              onChange={(e) => patch({ lc_bank_details: e.target.value })}
            />
          </label>
          <label className={`${labelClass} sm:col-span-3`}>
            Request details
            <textarea
              className={`${fieldClass} min-h-[88px] py-2`}
              value={form.request_details}
              onChange={(e) => patch({ request_details: e.target.value })}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-[var(--color-neutral-100)] bg-white p-3 text-sm text-[var(--color-neutral-700)]">
          {(
            [
              ['attach_commercial_invoice', 'Commercial invoice'],
              ['attach_correspondence', 'Correspondence'],
              ['attach_cod_form', 'COD form'],
              ['attach_licence', 'Licence'],
              ['consent_accepted', 'Consent accepted'],
              ['mark_complete', 'Mark complete'],
              ['admin_override', 'Admin override'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form[key] === true}
                onChange={(e) => patch({ [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        {form.admin_override ? (
          <label className={labelClass}>
            Override reason
            <input
              className={fieldClass}
              value={form.stage_override_reason}
              onChange={(e) => patch({ stage_override_reason: e.target.value })}
            />
          </label>
        ) : null}
      </Section>
      </fieldset>

      {!readOnly ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setPanelMode('list');
              setMsg(null);
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button type="button" disabled={save.isPending} onClick={() => void onSave()}>
            {save.isPending ? 'Saving…' : 'Save air compliance form'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
