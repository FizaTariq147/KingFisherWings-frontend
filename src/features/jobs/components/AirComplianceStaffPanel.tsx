import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  useJobAirComplianceForm,
  useUpdateJobAirComplianceForm,
} from '../hooks/useJobs';
import type {
  AirCompliancePartyDto,
  AirPalletLineDto,
  UpsertAirComplianceBookingFormDto,
} from '../types/job.types';

const SERVICE_SCOPES = ['DOOR_TO_DOOR', 'DOOR_TO_PORT', 'PORT_TO_DOOR', 'PORT_TO_PORT'] as const;
const SECTORS = ['CIVILIAN', 'MILITARY', 'NUCLEAR'] as const;

type PartyUi = {
  party_kind: 'SHIPPER' | 'CONSIGNEE' | 'NOTIFY';
  full_name: string;
  address: string;
  city: string;
  country: string;
};

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
  return { party_kind: kind, full_name: '', address: '', city: '', country: '' };
}

function emptyPallet(): PalletUi {
  return {
    pallet_type: 'PMC',
    count: '1',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    weight_kg: '',
  };
}

function emptyForm(): FormUi {
  return {
    date_of_request: new Date().toISOString().slice(0, 10),
    client_booking_no: '',
    voyage_ref: '',
    service_scope: 'DOOR_TO_DOOR',
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
    booking_agent_line: 'KINGFISHER',
    agent_requester_name: '',
    sq_bl_booking_reference: '',
    is_dg: false,
    attach_commercial_invoice: false,
    attach_correspondence: false,
    attach_cod_form: false,
    attach_licence: false,
    consent_accepted: false,
    mark_complete: false,
    admin_override: true,
    stage_override_reason: 'Staff correction',
    parties: [emptyParty('SHIPPER'), emptyParty('CONSIGNEE'), emptyParty('NOTIFY')],
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

function hydrate(raw: Record<string, unknown> | undefined): FormUi {
  const base = emptyForm();
  if (!raw) return base;
  const partiesRaw = Array.isArray(raw.parties) ? (raw.parties as AirCompliancePartyDto[]) : [];
  const parties = (['SHIPPER', 'CONSIGNEE', 'NOTIFY'] as const).map((kind) => {
    const found = partiesRaw.find((p) => p.party_kind === kind);
    return {
      party_kind: kind,
      full_name: str(found?.full_name),
      address: str(found?.address),
      city: str(found?.city),
      country: str(found?.country),
    };
  });
  const palletsRaw = Array.isArray(raw.pallets) ? (raw.pallets as AirPalletLineDto[]) : [];
  const pallets =
    palletsRaw.length > 0
      ? palletsRaw.map((p) => ({
          pallet_type: str(p.pallet_type) || 'PMC',
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
    booking_agent_line: str(raw.booking_agent_line) || base.booking_agent_line,
    agent_requester_name: str(raw.agent_requester_name),
    sq_bl_booking_reference: str(raw.sq_bl_booking_reference),
    is_dg: raw.is_dg === true,
    attach_commercial_invoice: raw.attach_commercial_invoice === true,
    attach_correspondence: raw.attach_correspondence === true,
    attach_cod_form: raw.attach_cod_form === true,
    attach_licence: raw.attach_licence === true,
    consent_accepted: raw.consent_accepted === true,
    mark_complete: raw.mark_complete === true,
    parties,
    pallets,
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
      entity_kind: 'COMPANY',
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
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-2 text-sm';
const labelClass = 'flex flex-col gap-1 text-xs text-[var(--color-neutral-600)]';

/** Staff GET/PUT /jobs/:id/air/compliance-form — UpsertAirComplianceBookingFormDto. */
export function AirComplianceStaffPanel({ jobId }: { jobId: string }) {
  const formQuery = useJobAirComplianceForm(jobId);
  const save = useUpdateJobAirComplianceForm(jobId);
  const [form, setForm] = useState<FormUi>(emptyForm);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formQuery.data) setForm(hydrate(formQuery.data as Record<string, unknown>));
  }, [formQuery.data]);

  const patch = (partial: Partial<FormUi>) => setForm((prev) => ({ ...prev, ...partial }));

  const onSave = async () => {
    setError(null);
    setMsg(null);
    try {
      await save.mutateAsync(toDto(form));
      setMsg(
        form.mark_complete
          ? 'Air compliance form saved & marked complete.'
          : 'Air compliance form saved.',
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Air compliance form (staff)</CardTitle>
      </CardHeader>
      <div className="space-y-4 px-4 pb-4 text-sm">
        <p className="text-xs text-[var(--color-neutral-500)]">
          GET/PUT <code className="text-[10px]">/jobs/:id/air/compliance-form</code> —{' '}
          <code className="text-[10px]">UpsertAirComplianceBookingFormDto</code>
        </p>
        {formQuery.isLoading ? (
          <p className="text-[var(--color-neutral-400)]">Loading…</p>
        ) : null}
        {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

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
            label="Voyage / flight ref"
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
          <Input
            label="Origin airport (e.g. DXB)"
            maxLength={10}
            value={form.origin_airport_code}
            onChange={(e) => patch({ origin_airport_code: e.target.value.toUpperCase() })}
          />
          <Input
            label="Dest airport (e.g. RUH)"
            maxLength={10}
            value={form.dest_airport_code}
            onChange={(e) => patch({ dest_airport_code: e.target.value.toUpperCase() })}
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
            label="Pieces"
            type="number"
            min={1}
            value={form.pieces}
            onChange={(e) => patch({ pieces: e.target.value })}
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
            label="Chargeable weight kg"
            type="number"
            value={form.chargeable_weight_kg}
            onChange={(e) => patch({ chargeable_weight_kg: e.target.value })}
          />
          <Input
            label="Volume CBM"
            type="number"
            value={form.volume_cbm}
            onChange={(e) => patch({ volume_cbm: e.target.value })}
          />
          <Input
            label="Pallet count"
            type="number"
            min={0}
            value={form.pallet_count}
            onChange={(e) => patch({ pallet_count: e.target.value })}
          />
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
            label="Final use"
            maxLength={200}
            value={form.final_use}
            onChange={(e) => patch({ final_use: e.target.value })}
          />
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
          <Input
            label="Booking agent line"
            maxLength={100}
            value={form.booking_agent_line}
            onChange={(e) => patch({ booking_agent_line: e.target.value })}
          />
          <Input
            label="Agent requester"
            maxLength={200}
            value={form.agent_requester_name}
            onChange={(e) => patch({ agent_requester_name: e.target.value })}
          />
          <Input
            label="SQ / booking reference"
            maxLength={200}
            value={form.sq_bl_booking_reference}
            onChange={(e) => patch({ sq_bl_booking_reference: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">Pallets</p>
          {form.pallets.map((line, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <Input
                label="Type"
                maxLength={30}
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
                type="number"
                min={1}
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
                type="number"
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
                type="number"
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
                type="number"
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
                type="number"
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
            onClick={() => setForm((prev) => ({ ...prev, pallets: [...prev.pallets, emptyPallet()] }))}
          >
            Add pallet line
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {form.parties.map((p) => (
            <div key={p.party_kind} className="space-y-2 rounded-md border border-[var(--color-neutral-100)] p-3">
              <p className="text-xs font-medium">{p.party_kind}</p>
              <Input
                label="Name"
                value={p.full_name}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parties: prev.parties.map((x) =>
                      x.party_kind === p.party_kind ? { ...x, full_name: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Input
                label="City"
                value={p.city}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parties: prev.parties.map((x) =>
                      x.party_kind === p.party_kind ? { ...x, city: e.target.value } : x,
                    ),
                  }))
                }
              />
              <Input
                label="Country"
                value={p.country}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parties: prev.parties.map((x) =>
                      x.party_kind === p.party_kind ? { ...x, country: e.target.value } : x,
                    ),
                  }))
                }
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          {(
            [
              ['is_dg', 'Dangerous goods'],
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

        <Input
          label="Override reason"
          value={form.stage_override_reason}
          onChange={(e) => patch({ stage_override_reason: e.target.value })}
        />

        <Button type="button" disabled={save.isPending} onClick={() => void onSave()}>
          Save air compliance form
        </Button>
      </div>
    </Card>
  );
}
