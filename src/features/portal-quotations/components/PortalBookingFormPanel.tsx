import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import {
  usePortalQuotationBookingForm,
  useUpdatePortalQuotationBookingForm,
} from '../hooks/usePortalQuotations';
import type {
  PortalBookingFormUpsertDto,
  PortalQuotationDetail,
} from '../types/portalQuotations.types';
import { portalQuoteShowsBookingForm } from '../utils/portalQuotationStatus';
import { isAirJobType } from '@/features/jobs/constants/job.constants';

type StepId =
  | 'voyage'
  | 'shipper'
  | 'consignee'
  | 'notify'
  | 'commodity'
  | 'documents'
  | 'agent'
  | 'review';

const STEPS: { id: StepId; label: string; eyebrow: string; title: string; blurb: string }[] = [
  {
    id: 'voyage',
    label: 'VOYAGE',
    eyebrow: 'VOYAGE & CARGO DETAIL',
    title: 'Booking & Shipment Overview',
    blurb: 'Basic voyage, weight and container details for this booking request.',
  },
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
    blurb: 'Indicate which supporting documents will be provided.',
  },
  {
    id: 'agent',
    label: 'AGENT',
    eyebrow: 'BOOKING AGENT',
    title: 'Agent & References',
    blurb: 'Booking agent line, requester, and voyage / SQ-BL references.',
  },
  {
    id: 'review',
    label: 'REVIEW',
    eyebrow: 'REVIEW & SUBMIT',
    title: 'Confirm Booking Form',
    blurb: 'Review your details, accept consent, then submit to your forwarder.',
  },
];

type PartyUi = {
  full_name: string;
  address: string;
  city: string;
  country: string;
  entity_kind: 'COMPANY' | 'INDIVIDUAL';
  other_details: string;
};

type FormUi = {
  date_of_request: string;
  client_booking_no: string;
  teu_count: string;
  pol: string;
  pod: string;
  gross_weight_kg: string;
  net_weight_kg: string;
  shipper_owned_container: boolean;
  is_dg: boolean;
  shipper: PartyUi;
  consignee: PartyUi;
  notify: PartyUi;
  commodity: string;
  hs_code: string;
  final_use: string;
  activity_sector: '' | 'CIVILIAN' | 'MILITARY' | 'NUCLEAR';
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
};

function emptyParty(): PartyUi {
  return {
    full_name: '',
    address: '',
    city: '',
    country: '',
    entity_kind: 'COMPANY',
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
    gross_weight_kg: '',
    net_weight_kg: '',
    shipper_owned_container: false,
    is_dg: false,
    shipper: emptyParty(),
    consignee: emptyParty(),
    notify: emptyParty(),
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
    booking_agent_line: 'KINGFISHER',
    agent_requester_name: '',
    sq_bl_booking_reference: '',
    voyage_ref: '',
    consent_accepted: false,
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
          value={party.full_name}
          onChange={(e) => patch({ full_name: e.target.value })}
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
          value={party.city}
          onChange={(e) => patch({ city: e.target.value })}
        />
      </label>
      <label className="block">
        <FieldLabel>Country</FieldLabel>
        <Input
          className="mt-1"
          value={party.country}
          onChange={(e) => patch({ country: e.target.value })}
        />
      </label>
      <label className="block">
        <FieldLabel>Entity kind</FieldLabel>
        <select
          className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
          value={party.entity_kind}
          onChange={(e) =>
            patch({ entity_kind: e.target.value === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY' })
          }
        >
          <option value="COMPANY">COMPANY</option>
          <option value="INDIVIDUAL">INDIVIDUAL</option>
        </select>
      </label>
      <label className="block">
        <FieldLabel>Other details</FieldLabel>
        <Input
          className="mt-1"
          value={party.other_details}
          onChange={(e) => patch({ other_details: e.target.value })}
          placeholder="Email, phone, website…"
        />
      </label>
    </div>
  );
}

function toDto(form: FormUi, markComplete: boolean): PortalBookingFormUpsertDto {
  const numOrUndef = (v: string) => {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  };
  const notifyName = form.notify.full_name.trim() || form.consignee.full_name.trim() || 'Same as consignee';
  const notifyAddress = form.notify.address.trim() || form.consignee.address.trim();
  return {
    date_of_request: form.date_of_request.trim() || undefined,
    client_booking_no: form.client_booking_no.trim() || undefined,
    teu_count: numOrUndef(form.teu_count),
    pol: form.pol.trim(),
    pod: form.pod.trim(),
    gross_weight_kg: numOrUndef(form.gross_weight_kg),
    net_weight_kg: numOrUndef(form.net_weight_kg),
    shipper_owned_container: form.shipper_owned_container,
    is_dg: form.is_dg,
    commodity: form.commodity.trim(),
    hs_code: form.hs_code.trim() || undefined,
    final_use: form.final_use.trim() || undefined,
    activity_sector: form.activity_sector || undefined,
    insurance_details: form.insurance_details.trim() || undefined,
    lc_bank_details: form.lc_bank_details.trim() || undefined,
    request_details: form.request_details.trim() || undefined,
    attach_commercial_invoice: form.attach_commercial_invoice,
    attach_correspondence: form.attach_correspondence,
    attach_cod_form: form.attach_cod_form,
    attach_licence: form.attach_licence,
    booking_agent_line: form.booking_agent_line.trim() || undefined,
    agent_requester_name: form.agent_requester_name.trim() || undefined,
    sq_bl_booking_reference: form.sq_bl_booking_reference.trim() || undefined,
    voyage_ref: form.voyage_ref.trim() || undefined,
    consent_accepted: form.consent_accepted,
    mark_complete: markComplete,
    parties: [
      {
        party_kind: 'SHIPPER',
        full_name: form.shipper.full_name.trim(),
        address: form.shipper.address.trim() || undefined,
        city: form.shipper.city.trim() || undefined,
        country: form.shipper.country.trim() || undefined,
        entity_kind: form.shipper.entity_kind,
        other_details: form.shipper.other_details.trim() || undefined,
      },
      {
        party_kind: 'CONSIGNEE',
        full_name: form.consignee.full_name.trim(),
        address: form.consignee.address.trim() || undefined,
        city: form.consignee.city.trim() || undefined,
        country: form.consignee.country.trim() || undefined,
        entity_kind: form.consignee.entity_kind,
        other_details: form.consignee.other_details.trim() || undefined,
      },
      {
        party_kind: 'NOTIFY',
        full_name: notifyName,
        address: notifyAddress || undefined,
        city: form.notify.city.trim() || form.consignee.city.trim() || undefined,
        country: form.notify.country.trim() || form.consignee.country.trim() || undefined,
        entity_kind: form.notify.entity_kind,
        other_details: form.notify.other_details.trim() || undefined,
      },
    ],
  };
}

function validateStep(step: StepId, form: FormUi): string | null {
  if (step === 'voyage') {
    if (!form.teu_count.trim()) return 'Number of TEUs is required (teu_count).';
    if (!form.pol.trim()) return 'POL — Port of Loading is required (pol).';
    if (!form.pod.trim()) return 'POD — Port of Discharge is required (pod).';
    if (!form.gross_weight_kg.trim()) return 'Gross weight (kg) is required (gross_weight_kg).';
    if (!form.net_weight_kg.trim()) return 'Net weight (kg) is required (net_weight_kg).';
  }
  if (step === 'shipper') {
    if (!form.shipper.full_name.trim() || !form.shipper.address.trim()) {
      return 'Shipper full name and address are required.';
    }
  }
  if (step === 'consignee') {
    if (!form.consignee.full_name.trim() || !form.consignee.address.trim()) {
      return 'Consignee full name and address are required.';
    }
  }
  if (step === 'commodity') {
    if (!form.commodity.trim()) return 'Commodity is required (commodity).';
  }
  if (step === 'review') {
    if (!form.consent_accepted) return 'Please accept consent before submitting (consent_accepted).';
  }
  return null;
}

interface PortalBookingFormPanelProps {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
  onFormCompleteChange?: (complete: boolean) => void;
}

/**
 * Customer 8-step compliance booking form after CUSTOMER_ACCEPTED (shared commercial).
 * NVOCC: GET/PUT/POST /portal/bookings/{id}/compliance-form*
 * Air:   GET/PUT/POST /portal/shipments/{id}/compliance-form* (+ accept)
 * Same UpsertNvoccBookingFormDto fields per OpenAPI.
 */
export function PortalBookingFormPanel({
  quote,
  onSuccess,
  onFormCompleteChange,
}: PortalBookingFormPanelProps) {
  const enabled = portalQuoteShowsBookingForm(quote);
  const isAir =
    isAirJobType(quote.jobType) ||
    String(quote.jobType ?? quote.raw?.job_type ?? '')
      .toUpperCase()
      .startsWith('AIR');
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
  const [form, setForm] = useState<FormUi>(emptyForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex] ?? STEPS[0];

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
    if (!data) {
      setForm(base);
      return;
    }
    const parties = data.parties ?? [];
    const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
    const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
    const notify = parties.find((p) => p.party_kind === 'NOTIFY');
    const sector = String(data.activity_sector ?? '').toUpperCase();
    setForm({
      ...base,
      date_of_request: String(data.date_of_request ?? '').slice(0, 10) || base.date_of_request,
      client_booking_no: String(data.client_booking_no ?? ''),
      teu_count: data.teu_count != null ? String(data.teu_count) : '',
      pol: String(data.pol ?? quote.origin ?? ''),
      pod: String(data.pod ?? quote.destination ?? ''),
      gross_weight_kg: data.gross_weight_kg != null ? String(data.gross_weight_kg) : '',
      net_weight_kg: data.net_weight_kg != null ? String(data.net_weight_kg) : '',
      shipper_owned_container: Boolean(data.shipper_owned_container),
      is_dg: Boolean(data.is_dg),
      shipper: {
        full_name: String(shipper?.full_name ?? ''),
        address: String(shipper?.address ?? ''),
        city: String(shipper?.city ?? ''),
        country: String(shipper?.country ?? ''),
        entity_kind: shipper?.entity_kind === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY',
        other_details: String(shipper?.other_details ?? ''),
      },
      consignee: {
        full_name: String(consignee?.full_name ?? ''),
        address: String(consignee?.address ?? ''),
        city: String(consignee?.city ?? ''),
        country: String(consignee?.country ?? ''),
        entity_kind: consignee?.entity_kind === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY',
        other_details: String(consignee?.other_details ?? ''),
      },
      notify: {
        full_name: String(notify?.full_name ?? ''),
        address: String(notify?.address ?? ''),
        city: String(notify?.city ?? ''),
        country: String(notify?.country ?? ''),
        entity_kind: notify?.entity_kind === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'COMPANY',
        other_details: String(notify?.other_details ?? ''),
      },
      commodity: String(data.commodity ?? quote.commodity ?? ''),
      hs_code: String(data.hs_code ?? ''),
      final_use: String(data.final_use ?? ''),
      activity_sector:
        sector === 'CIVILIAN' || sector === 'MILITARY' || sector === 'NUCLEAR'
          ? sector
          : '',
      insurance_details: String(data.insurance_details ?? ''),
      lc_bank_details: String(data.lc_bank_details ?? ''),
      request_details: String(data.request_details ?? ''),
      attach_commercial_invoice: Boolean(data.attach_commercial_invoice),
      attach_correspondence: Boolean(data.attach_correspondence),
      attach_cod_form: Boolean(data.attach_cod_form),
      attach_licence: Boolean(data.attach_licence),
      booking_agent_line: String(data.booking_agent_line ?? 'KINGFISHER'),
      agent_requester_name: String(data.agent_requester_name ?? ''),
      sq_bl_booking_reference: String(data.sq_bl_booking_reference ?? quote.number ?? ''),
      voyage_ref: String(data.voyage_ref ?? ''),
      consent_accepted: Boolean(data.consent_accepted),
    });
    if (data.mark_complete === true) setSubmitted(true);
  }, [formQuery.data, quote.origin, quote.destination, quote.commodity, quote.number]);

  useEffect(() => {
    const complete = submitted || formQuery.data?.mark_complete === true;
    onFormCompleteChange?.(complete);
  }, [submitted, formQuery.data?.mark_complete, onFormCompleteChange]);

  const patch = (partial: Partial<FormUi>) => setForm((prev) => ({ ...prev, ...partial }));

  const submit = (complete: boolean) => {
    setError(null);
    setMsg(null);
    if (complete) {
      for (const s of STEPS) {
        const err = validateStep(s.id, form);
        if (err) {
          setError(err);
          setStepIndex(STEPS.findIndex((x) => x.id === s.id));
          return;
        }
      }
    } else {
      const err = validateStep('voyage', form);
      if (err) {
        setError(err);
        return;
      }
    }
    const dto = toDto(form, complete);
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
        const message = complete
          ? linked
            ? 'Booking form submitted. Your forwarder can complete Ops and send the invoice.'
            : isAir
              ? 'Booking form submitted to your forwarder. They will link it to the air shipment and send the invoice.'
              : 'Booking form submitted to your forwarder. They will link it to the NVOCC booking and send the invoice.'
          : 'Booking form draft saved.';
        setMsg(message);
        if (complete) setSubmitted(true);
        onSuccess?.(message);
      })
      .catch((err) => {
        setError(getServerErrorMessage(err) || 'Could not submit booking form.');
      });
  };

  const goNext = () => {
    setError(null);
    const err = validateStep(step.id, form);
    if (err) {
      setError(err);
      return;
    }
    if (stepIndex >= STEPS.length - 1) {
      submit(true);
      return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const reviewRows = useMemo(
    () => [
      ['date_of_request', form.date_of_request],
      ['client_booking_no', form.client_booking_no || '—'],
      ['teu_count', form.teu_count],
      ['pol', form.pol],
      ['pod', form.pod],
      ['gross_weight_kg', form.gross_weight_kg],
      ['net_weight_kg', form.net_weight_kg],
      ['shipper_owned_container', form.shipper_owned_container ? 'true' : 'false'],
      ['is_dg', form.is_dg ? 'true' : 'false'],
      ['commodity', form.commodity],
      ['hs_code', form.hs_code || '—'],
      ['activity_sector', form.activity_sector || '—'],
      ['SHIPPER', form.shipper.full_name],
      ['CONSIGNEE', form.consignee.full_name],
      ['NOTIFY', form.notify.full_name || '(same as consignee)'],
      ['booking_agent_line', form.booking_agent_line],
    ],
    [form],
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
            Thanks — next your forwarder sends the invoice (INVOICE_SENT)
            {isAir ? ', then air export or import ops begin.' : '.'}
          </p>
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
            {STEPS.map((s, i) => {
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
                  {i < STEPS.length - 1 ? (
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
                value={form.client_booking_no}
                onChange={(e) => patch({ client_booking_no: e.target.value })}
                placeholder="Assigned by agent"
              />
            </label>
            <label className="block">
              <FieldLabel required>Number of TEUs</FieldLabel>
              <Input
                className="mt-1"
                inputMode="decimal"
                value={form.teu_count}
                onChange={(e) => patch({ teu_count: e.target.value })}
                placeholder="e.g. 2"
              />
            </label>
            <label className="block sm:col-span-1">
              <FieldLabel required>POL – Port of Loading</FieldLabel>
              <Input
                className="mt-1"
                value={form.pol}
                onChange={(e) => patch({ pol: e.target.value })}
                placeholder="Port of Loading required"
              />
            </label>
            <label className="block sm:col-span-1">
              <FieldLabel required>POD – Port of Discharge</FieldLabel>
              <Input
                className="mt-1"
                value={form.pod}
                onChange={(e) => patch({ pod: e.target.value })}
                placeholder="Port of Discharge required"
              />
            </label>
            <label className="block">
              <FieldLabel required>Gross weight (kg)</FieldLabel>
              <Input
                className="mt-1"
                inputMode="decimal"
                value={form.gross_weight_kg}
                onChange={(e) => patch({ gross_weight_kg: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel required>Net weight (kg)</FieldLabel>
              <Input
                className="mt-1"
                inputMode="decimal"
                value={form.net_weight_kg}
                onChange={(e) => patch({ net_weight_kg: e.target.value })}
              />
            </label>
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

        {step.id === 'commodity' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <FieldLabel required>Commodity</FieldLabel>
              <Input
                className="mt-1"
                value={form.commodity}
                onChange={(e) => patch({ commodity: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel>HS code</FieldLabel>
              <Input
                className="mt-1"
                value={form.hs_code}
                onChange={(e) => patch({ hs_code: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel>Final use</FieldLabel>
              <Input
                className="mt-1"
                value={form.final_use}
                onChange={(e) => patch({ final_use: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel>Activity sector</FieldLabel>
              <select
                className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                value={form.activity_sector}
                onChange={(e) =>
                  patch({
                    activity_sector: e.target.value as FormUi['activity_sector'],
                  })
                }
              >
                <option value="">—</option>
                <option value="CIVILIAN">CIVILIAN</option>
                <option value="MILITARY">MILITARY</option>
                <option value="NUCLEAR">NUCLEAR</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <FieldLabel>Insurance details</FieldLabel>
              <Input
                className="mt-1"
                value={form.insurance_details}
                onChange={(e) => patch({ insurance_details: e.target.value })}
              />
            </label>
            <label className="block sm:col-span-2">
              <FieldLabel>LC bank details</FieldLabel>
              <Input
                className="mt-1"
                value={form.lc_bank_details}
                onChange={(e) => patch({ lc_bank_details: e.target.value })}
              />
            </label>
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
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ['attach_commercial_invoice', 'Commercial invoice'],
                ['attach_correspondence', 'Correspondence'],
                ['attach_cod_form', 'COD form'],
                ['attach_licence', 'Licence'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => patch({ [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
        ) : null}

        {step.id === 'agent' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel>Booking agent line</FieldLabel>
              <Input
                className="mt-1"
                value={form.booking_agent_line}
                onChange={(e) => patch({ booking_agent_line: e.target.value })}
                placeholder="KINGFISHER"
              />
            </label>
            <label className="block">
              <FieldLabel>Agent requester name</FieldLabel>
              <Input
                className="mt-1"
                value={form.agent_requester_name}
                onChange={(e) => patch({ agent_requester_name: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel>Voyage ref</FieldLabel>
              <Input
                className="mt-1"
                value={form.voyage_ref}
                onChange={(e) => patch({ voyage_ref: e.target.value })}
              />
            </label>
            <label className="block">
              <FieldLabel>SQ / BL booking reference</FieldLabel>
              <Input
                className="mt-1"
                value={form.sq_bl_booking_reference}
                onChange={(e) => patch({ sq_bl_booking_reference: e.target.value })}
              />
            </label>
          </div>
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
              : stepIndex >= STEPS.length - 1
                ? 'Submit'
                : 'Continue →'}
          </Button>
        </div>
      </div>
    </PortalPanel>
    </div>
  );
}
