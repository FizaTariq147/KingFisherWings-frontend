import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { isUuid } from '@/lib/isUuid';
import {
  useCompleteShipmentBookingForm,
  useShipmentBookingForm,
  useUpsertShipmentBookingForm,
} from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';

function formatKey(key: string): string {
  return key
    .replace(/(_id|_uuid|_name|_label|_code)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isIdKey(key: string): boolean {
  const k = key.toLowerCase();
  return k === 'id' || k.endsWith('_id') || k.endsWith('_uuid');
}

function siblingName(key: string, data: Record<string, unknown>): string {
  const base = key.replace(/(_id|_uuid)$/i, '');
  const name = data[`${base}_name`] ?? data[`${base}_label`];
  if (typeof name === 'string' && name.trim() && !isUuid(name.trim())) {
    return name.trim();
  }
  return '';
}

function displayEntries(data: Record<string, unknown>): Array<[string, string]> {
  const skip = new Set<string>(['raw', 'id', 'tenant_id', 'company_id']);
  const out: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(data)) {
    if (skip.has(key.toLowerCase())) continue;
    if (isIdKey(key)) {
      const named = siblingName(key, data);
      if (named) {
        const base = key.replace(/(_id|_uuid)$/i, '');
        skip.add(`${base}_name`);
        skip.add(`${base}_label`);
        out.push([formatKey(base), named]);
      }
      continue;
    }
    if (value != null && typeof value === 'object') continue;
    if (typeof value === 'string' && isUuid(value.trim())) continue;
    if (value == null || value === '') {
      out.push([formatKey(key), '—']);
      continue;
    }
    if (typeof value === 'boolean') {
      out.push([formatKey(key), value ? 'Yes' : 'No']);
      continue;
    }
    out.push([formatKey(key), String(value)]);
  }
  return out;
}

const EDITABLE_KEYS = [
  'client_booking_no',
  'voyage_ref',
  'commodity',
  'hs_code',
  'pol',
  'pod',
  'etd',
  'eta',
  'incoterms',
  'freight_terms',
  'origin_door_address',
  'dest_door_address',
  'request_details',
  'notes',
] as const;

/**
 * GET/PUT /shipments/:id/booking-form + POST …/booking-form/complete.
 * Shows names (not UUIDs); blank until API returns real data.
 */
export function ShipmentBookingFormPanel({ shipmentId }: { shipmentId: string }) {
  const query = useShipmentBookingForm(shipmentId, true);
  const upsert = useUpsertShipmentBookingForm(shipmentId);
  const complete = useCompleteShipmentBookingForm(shipmentId);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const data = useMemo(
    () => (query.data && typeof query.data === 'object' ? query.data : {}),
    [query.data],
  );

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const key of EDITABLE_KEYS) {
      const v = data[key];
      next[key] =
        v == null || typeof v === 'object'
          ? ''
          : typeof v === 'string' && isUuid(v)
            ? ''
            : String(v);
    }
    setDraft(next);
  }, [data]);

  const entries = displayEntries(data);
  const markComplete = data.mark_complete === true;
  const status = String(data.status ?? '').toUpperCase();
  const isCompleted =
    markComplete || status === 'COMPLETED' || status === 'COMPLETE';

  const onSave = async () => {
    setErr(null);
    setMsg(null);
    try {
      const body: Record<string, unknown> = { ...data };
      for (const key of EDITABLE_KEYS) {
        const v = draft[key]?.trim();
        if (v) body[key] = v;
        else delete body[key];
      }
      // Never send bare UUID placeholders as “data”.
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === 'string' && isUuid(v)) delete body[k];
      }
      await upsert.mutateAsync(body);
      setMsg('Booking form saved (PUT /shipments/:id/booking-form).');
      void query.refetch();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const onComplete = async () => {
    setErr(null);
    setMsg(null);
    try {
      await complete.mutateAsync();
      setMsg('Booking form completed (POST /shipments/:id/booking-form/complete).');
      void query.refetch();
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
            Shipment booking form
          </p>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
            <code className="text-[10px]">GET/PUT /shipments/:id/booking-form</code>
            {' · '}
            <code className="text-[10px]">POST …/complete</code>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={upsert.isPending || query.isLoading}
            onClick={() => void onSave()}
          >
            {upsert.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="success"
            disabled={complete.isPending || isCompleted || query.isLoading}
            onClick={() => void onComplete()}
          >
            {complete.isPending ? 'Completing…' : isCompleted ? 'Completed' : 'Complete'}
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading booking form…</p>
      ) : null}
      {query.isError ? (
        <p className="text-sm text-[var(--color-danger-600)]">{getErrorMessage(query.error)}</p>
      ) : null}
      {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Editable fields</CardTitle>
        </CardHeader>
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          {EDITABLE_KEYS.map((key) => (
            <label key={key} className="block text-[12px]">
              <span className="mb-1 block font-medium text-[#64748b]">{formatKey(key)}</span>
              <input
                className="h-9 w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-2.5 text-[13px]"
                value={draft[key] ?? ''}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete booking form (API)</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4">
          {entries.length ? (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
              {entries.map(([label, value], i) => (
                <div key={`${label}-${i}`}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                    {label}
                  </dt>
                  <dd className="mt-0.5 break-words text-[13px] text-[#0f172a]">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[13px] text-[#64748b]">
              No booking form payload yet. Save after entering fields, or wait for the linked job
              booking form.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
