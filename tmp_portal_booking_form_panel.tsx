import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import {
  usePortalQuotationBookingForm,
  useUpdatePortalQuotationBookingForm,
} from '../hooks/usePortalQuotations';
import type { PortalQuotationDetail } from '../types/portalQuotations.types';
import type { PortalBookingFormUpsertDto } from '../types/portalQuotations.types';

type FormUi = {
  pol: string;
  pod: string;
  commodity: string;
  hs_code: string;
  shipper_name: string;
  shipper_address: string;
  shipper_city: string;
  shipper_country: string;
  consignee_name: string;
  consignee_address: string;
  consignee_city: string;
  consignee_country: string;
  notify_name: string;
  request_details: string;
  is_dg: boolean;
  mark_complete: boolean;
};

function emptyForm(): FormUi {
  return {
    pol: '',
    pod: '',
    commodity: '',
    hs_code: '',
    shipper_name: '',
    shipper_address: '',
    shipper_city: '',
    shipper_country: '',
    consignee_name: '',
    consignee_address: '',
    consignee_city: '',
    consignee_country: '',
    notify_name: '',
    request_details: '',
    is_dg: false,
    mark_complete: true,
  };
}

function isGatedJobType(jobType?: string): boolean {
  const jt = (jobType || '').toUpperCase();
  return jt.startsWith('NVOCC') || jt.startsWith('AIR');
}

function isApprovedStatus(status?: string): boolean {
  const s = (status || '').toUpperCase().replace(/\s+/g, '_');
  return s === 'APPROVED' || s === 'WON' || s === 'ACCEPTED';
}

interface PortalBookingFormPanelProps {
  quote: PortalQuotationDetail;
  onSuccess?: (message: string) => void;
}

/** Customer booking form after quote approve (NVOCC / Air). */
export function PortalBookingFormPanel({ quote, onSuccess }: PortalBookingFormPanelProps) {
  const enabled = isGatedJobType(quote.jobType) && isApprovedStatus(quote.status);
  const formQuery = usePortalQuotationBookingForm(quote.id, enabled);
  const saveForm = useUpdatePortalQuotationBookingForm(quote.id);
  const [form, setForm] = useState<FormUi>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const isAir = useMemo(
    () => (quote.jobType || '').toUpperCase().startsWith('AIR'),
    [quote.jobType],
  );

  useEffect(() => {
    const data = formQuery.data;
    if (!data) return;
    const parties = data.parties ?? [];
    const shipper = parties.find((p) => p.party_kind === 'SHIPPER');
    const consignee = parties.find((p) => p.party_kind === 'CONSIGNEE');
    const notify = parties.find((p) => p.party_kind === 'NOTIFY');
    setForm({
      pol: String(data.pol ?? quote.origin ?? ''),
      pod: String(data.pod ?? quote.destination ?? ''),
      commodity: String(data.commodity ?? ''),
      hs_code: String(data.hs_code ?? ''),
      shipper_name: String(shipper?.full_name ?? ''),
      shipper_address: String(shipper?.address ?? ''),
      shipper_city: String(shipper?.city ?? ''),
      shipper_country: String(shipper?.country ?? ''),
      consignee_name: String(consignee?.full_name ?? ''),
      consignee_address: String(consignee?.address ?? ''),
      consignee_city: String(consignee?.city ?? ''),
      consignee_country: String(consignee?.country ?? ''),
      notify_name: String(notify?.full_name ?? ''),
      request_details: String(data.request_details ?? ''),
      is_dg: Boolean(data.is_dg),
      mark_complete: data.mark_complete !== false,
    });
  }, [formQuery.data, quote.origin, quote.destination]);

  if (!enabled) return null;

  if (formQuery.data?.mark_complete === true) {
    return (
      <PortalPanel padded className="border-emerald-200 bg-emerald-50/50">
        <h2 className="text-sm font-semibold text-emerald-900">Booking form submitted</h2>
        <p className="mt-1 text-sm text-emerald-800">
          Your forwarder will send the invoice next. You can update details below if needed.
        </p>
      </PortalPanel>
    );
  }

  const submit = (complete: boolean) => {
    setError(null);
    setMsg(null);
    const pol = form.pol.trim();
    const pod = form.pod.trim();
    const commodity = form.commodity.trim();
    const shipperName = form.shipper_name.trim();
    const shipperAddress = form.shipper_address.trim();
    const consigneeName = form.consignee_name.trim();
    const consigneeAddress = form.consignee_address.trim();
    if (!pol || !pod || !commodity) {
      setError('POL, POD, and commodity are required.');
      return;
    }
    if (!shipperName || !shipperAddress || !consigneeName || !consigneeAddress) {
      setError('Shipper and consignee need full name and address.');
      return;
    }
    const dto: PortalBookingFormUpsertDto = {
      pol,
      pod,
      commodity,
      hs_code: form.hs_code.trim() || undefined,
      is_dg: form.is_dg,
      request_details: form.request_details.trim() || undefined,
      mark_complete: complete,
      parties: [
        {
          party_kind: 'SHIPPER',
          full_name: shipperName,
          address: shipperAddress,
          city: form.shipper_city.trim() || undefined,
          country: form.shipper_country.trim() || undefined,
          entity_kind: 'COMPANY',
        },
        {
          party_kind: 'CONSIGNEE',
          full_name: consigneeName,
          address: consigneeAddress,
          city: form.consignee_city.trim() || undefined,
          country: form.consignee_country.trim() || undefined,
          entity_kind: 'COMPANY',
        },
        {
          party_kind: 'NOTIFY',
          full_name: form.notify_name.trim() || consigneeName || 'Same as consignee',
          address: consigneeAddress,
          city: form.consignee_city.trim() || undefined,
          country: form.consignee_country.trim() || undefined,
          entity_kind: 'COMPANY',
        },
      ],
    };
    void saveForm
      .mutateAsync({ dto, isAir })
      .then(() => {
        const message = complete
          ? 'Booking form submitted. Your forwarder will send the invoice next.'
          : 'Booking form draft saved.';
        setMsg(message);
        onSuccess?.(message);
      })
      .catch((err) => {
        setError(getServerErrorMessage(err) || 'Could not save booking form.');
      });
  };

  return (
    <PortalPanel padded className="border-[var(--color-secondary-200)] bg-[var(--color-secondary-50)]/40">
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
            {isAir ? 'Air booking form' : 'Sea booking form'}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-neutral-600)]">
            Fill shipper, consignee, and route details so your forwarder can invoice and proceed.
          </p>
        </div>

        {formQuery.isError ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {getServerErrorMessage(formQuery.error) ||
              'Booking form API is not available yet. Ask your forwarder if you cannot submit.'}
          </p>
        ) : null}
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

        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ['pol', 'POL / Origin *'],
              ['pod', 'POD / Destination *'],
              ['commodity', 'Commodity *'],
              ['hs_code', 'HS code'],
              ['shipper_name', 'Shipper name *'],
              ['shipper_city', 'Shipper city'],
              ['shipper_country', 'Shipper country'],
              ['consignee_name', 'Consignee name *'],
              ['consignee_city', 'Consignee city'],
              ['consignee_country', 'Consignee country'],
              ['notify_name', 'Notify party'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs font-medium text-[var(--color-neutral-600)]">
              {label}
              <Input
                className="mt-1"
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block text-xs font-medium text-[var(--color-neutral-600)] sm:col-span-2">
            Shipper address *
            <Input
              className="mt-1"
              value={form.shipper_address}
              onChange={(e) => setForm((prev) => ({ ...prev, shipper_address: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-medium text-[var(--color-neutral-600)] sm:col-span-2">
            Consignee address *
            <Input
              className="mt-1"
              value={form.consignee_address}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, consignee_address: e.target.value }))
              }
            />
          </label>
          <label className="block text-xs font-medium text-[var(--color-neutral-600)] sm:col-span-2">
            Request details
            <Input
              className="mt-1"
              value={form.request_details}
              onChange={(e) => setForm((prev) => ({ ...prev, request_details: e.target.value }))}
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-xs text-[var(--color-neutral-700)]">
          <input
            type="checkbox"
            checked={form.is_dg}
            onChange={(e) => setForm((prev) => ({ ...prev, is_dg: e.target.checked }))}
          />
          Dangerous goods
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={saveForm.isPending || formQuery.isLoading}
            onClick={() => submit(false)}
          >
            Save draft
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saveForm.isPending || formQuery.isLoading}
            onClick={() => submit(true)}
          >
            {saveForm.isPending ? 'Submitting…' : 'Submit booking form'}
          </Button>
        </div>
      </div>
    </PortalPanel>
  );
}
