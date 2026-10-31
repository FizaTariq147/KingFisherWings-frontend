import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { erpForm } from '@/lib/erpForm';
import { isUuid } from '@/lib/isUuid';
import {
  useCompleteShipmentBookingForm,
  useShipmentBookingForm,
  useUpsertShipmentBookingForm,
} from '../hooks/useShipments';
import type {
  BookingCustomField,
  BookingCustomFieldType,
} from '../types/shipment.types';
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
  const skip = new Set<string>(['raw', 'id', 'tenant_id', 'company_id', 'custom_fields']);
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

const FIELD_TYPES: BookingCustomFieldType[] = ['text', 'number', 'date', 'boolean'];

function slugKey(label: string, used: Set<string>): string {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'custom_field';
  let key = base;
  let i = 2;
  while (used.has(key)) {
    key = `${base}_${i}`;
    i += 1;
  }
  used.add(key);
  return key;
}

function normalizeCustomFields(raw: unknown): BookingCustomField[] {
  if (!Array.isArray(raw)) return [];
  const out: BookingCustomField[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const r = item as Record<string, unknown>;
    const label = String(r.label ?? r.name ?? '').trim();
    const key = String(r.key ?? '').trim() || (label ? slugKey(label, new Set()) : '');
    if (!key && !label) continue;
    const typeRaw = String(r.type ?? 'text').toLowerCase();
    const type: BookingCustomFieldType = FIELD_TYPES.includes(
      typeRaw as BookingCustomFieldType,
    )
      ? (typeRaw as BookingCustomFieldType)
      : 'text';
    let value: BookingCustomField['value'] = null;
    if (typeof r.value === 'boolean' || typeof r.value === 'number') {
      value = r.value;
    } else if (r.value != null) {
      value = String(r.value);
    }
    out.push({
      key: key || slugKey(label || 'field', new Set(out.map((f) => f.key))),
      label: label || formatKey(key),
      type,
      value,
    });
  }
  return out;
}

function customFieldDisplayValue(field: BookingCustomField): string {
  if (field.value == null || field.value === '') return '—';
  if (typeof field.value === 'boolean') return field.value ? 'Yes' : 'No';
  return String(field.value);
}

/**
 * GET/PUT /shipments/:id/booking-form + POST …/booking-form/complete.
 * Shows names (not UUIDs); supports custom_fields[] alongside typed fields.
 */
export function ShipmentBookingFormPanel({ shipmentId }: { shipmentId: string }) {
  const query = useShipmentBookingForm(shipmentId, true);
  const upsert = useUpsertShipmentBookingForm(shipmentId);
  const complete = useCompleteShipmentBookingForm(shipmentId);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<BookingCustomField[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<BookingCustomFieldType>('text');
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
    setCustomFields(normalizeCustomFields(data.custom_fields));
  }, [data]);

  const entries = displayEntries(data);
  const markComplete = data.mark_complete === true;
  const status = String(data.status ?? '').toUpperCase();
  const isCompleted =
    markComplete || status === 'COMPLETED' || status === 'COMPLETE';

  /**
   * PUT body = only UI-editable scalars + custom_fields.
   * Do not echo the full GET envelope (status, ids, nested objects) — that often
   * causes Nest 500s on /shipments/:id/booking-form.
   */
  const buildBody = (): Record<string, unknown> => {
    const body: Record<string, unknown> = {};
    for (const key of EDITABLE_KEYS) {
      const v = draft[key]?.trim();
      if (v && !isUuid(v)) body[key] = v;
    }
    body.custom_fields = customFields
      .filter((f) => f.key.trim() && f.label.trim())
      .map((f) => {
        const row: BookingCustomField = {
          key: f.key.trim(),
          label: f.label.trim(),
          type: f.type ?? 'text',
        };
        if (f.type === 'boolean') {
          row.value = f.value === true || f.value === 'true' || f.value === 1;
        } else if (f.type === 'number') {
          const n =
            typeof f.value === 'number' ? f.value : Number(String(f.value ?? '').trim());
          if (Number.isFinite(n)) row.value = n;
          else if (f.value == null || f.value === '') row.value = null;
          else row.value = String(f.value);
        } else if (f.value == null || f.value === '') {
          row.value = null;
        } else {
          row.value = String(f.value);
        }
        return row;
      });
    return body;
  };

  const saveErrorMessage = (e: unknown): string => {
    const msg = getErrorMessage(e);
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 500 || /internal server error/i.test(msg)) {
      return `${msg} (backend failed on PUT /shipments/:id/booking-form — check server logs / DTO validation.)`;
    }
    return msg;
  };

  const onSave = async () => {
    setErr(null);
    setMsg(null);
    try {
      await upsert.mutateAsync(buildBody());
      setMsg('Booking form saved (PUT /shipments/:id/booking-form).');
      void query.refetch();
    } catch (e) {
      setErr(saveErrorMessage(e));
    }
  };

  const onComplete = async () => {
    setErr(null);
    setMsg(null);
    try {
      // Persist custom fields with the form before completing.
      await upsert.mutateAsync(buildBody());
      await complete.mutateAsync();
      setMsg('Booking form completed (POST /shipments/:id/booking-form/complete).');
      void query.refetch();
    } catch (e) {
      setErr(saveErrorMessage(e));
    }
  };

  const addCustomField = () => {
    const label = newLabel.trim();
    if (!label) {
      setErr('Enter a label for the custom field.');
      return;
    }
    const used = new Set(customFields.map((f) => f.key));
    const key = slugKey(label, used);
    setCustomFields((prev) => [
      ...prev,
      {
        key,
        label,
        type: newType,
        value: newType === 'boolean' ? false : '',
      },
    ]);
    setNewLabel('');
    setNewType('text');
    setErr(null);
  };

  const updateCustomField = (index: number, patch: Partial<BookingCustomField>) => {
    setCustomFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  };

  const removeCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
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
            disabled={
              complete.isPending || upsert.isPending || isCompleted || query.isLoading
            }
            onClick={() => void onComplete()}
          >
            {complete.isPending || upsert.isPending
              ? 'Completing…'
              : isCompleted
                ? 'Completed'
                : 'Complete'}
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
              <span className={erpForm.label}>{formatKey(key)}</span>
              <input
                className={erpForm.input}
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
          <CardTitle>Custom fields</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <p className="text-[12px] text-[#64748b]">
            Add optional fields stored as{' '}
            <code className="text-[10px]">custom_fields</code> on the booking form.
          </p>
          {customFields.length === 0 ? (
            <p className="text-[13px] text-[#64748b]">No custom fields yet.</p>
          ) : (
            <ul className="space-y-2">
              {customFields.map((field, index) => (
                <li
                  key={`${field.key}-${index}`}
                  className="grid grid-cols-1 gap-2 rounded-sm border border-[#e8edf2] bg-white p-2.5 sm:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <Input
                    label="Label"
                    value={field.label}
                    onChange={(e) =>
                      updateCustomField(index, { label: e.target.value })
                    }
                  />
                  {field.type === 'boolean' ? (
                    <label className="flex items-end gap-2 pb-2 text-[13px]">
                      <input
                        type="checkbox"
                        checked={
                          field.value === true ||
                          field.value === 'true' ||
                          field.value === 1
                        }
                        onChange={(e) =>
                          updateCustomField(index, { value: e.target.checked })
                        }
                      />
                      <span>Value</span>
                    </label>
                  ) : (
                    <Input
                      label="Value"
                      type={
                        field.type === 'number'
                          ? 'number'
                          : field.type === 'date'
                            ? 'date'
                            : 'text'
                      }
                      value={
                        field.value == null
                          ? ''
                          : typeof field.value === 'boolean'
                            ? ''
                            : String(field.value)
                      }
                      onChange={(e) =>
                        updateCustomField(index, { value: e.target.value })
                      }
                    />
                  )}
                  <label className="block text-[12px]">
                    <span className={erpForm.label}>Type</span>
                    <select
                      className={erpForm.input}
                      value={field.type ?? 'text'}
                      onChange={(e) =>
                        updateCustomField(index, {
                          type: e.target.value as BookingCustomFieldType,
                          value:
                            e.target.value === 'boolean'
                              ? false
                              : field.value === true || field.value === false
                                ? ''
                                : field.value,
                        })
                      }
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-end pb-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => removeCustomField(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-2 border-t border-[#e8edf2] pt-3">
            <div className="min-w-[180px] flex-1">
              <Input
                label="New field label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Special instructions"
              />
            </div>
            <label className="block text-[12px]">
              <span className={erpForm.label}>Type</span>
              <select
                className={erpForm.input}
                value={newType}
                onChange={(e) => setNewType(e.target.value as BookingCustomFieldType)}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={addCustomField}
            >
              Add custom field
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete booking form (API)</CardTitle>
        </CardHeader>
        <div className="space-y-4 px-4 pb-4">
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
              No booking form payload yet. Save after entering fields, or wait for the linked
              job booking form.
            </p>
          )}
          {customFields.length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                Custom fields
              </p>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
                {customFields.map((field) => (
                  <div key={field.key}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
                      {field.label}
                    </dt>
                    <dd className="mt-0.5 break-words text-[13px] text-[#0f172a]">
                      {customFieldDisplayValue(field)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
