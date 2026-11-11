import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useContainerStatusCatalog } from '@/features/jobs/hooks/useJobs';
import type {
  PatchShowAllDto,
  ShowAllTransportDto,
  ShowAllWarehouseDto,
} from '@/features/jobs/types/job.types';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { parseServerValidationError } from '@/lib/validation/mapApiErrors';
import { asRecord } from '@/features/portal-shared/normalize';
import {
  extractPatchShowAllDefaults,
  isPatchShowAllFieldEmpty,
  toPatchShowAllPayload,
} from './extractPatchShowAllDefaults';
import {
  filterShowAllPayloadForTransport,
  showAllFieldAllowed,
  type ShowAllTransportEditMode,
} from './showAllTransportFields';

type FieldKind = 'text' | 'number' | 'date' | 'select' | 'boolean';

type FlatFieldDef = {
  kind: FieldKind;
  group: string;
  label: string;
  key: keyof PatchShowAllDto;
  options?: string[];
  nested?: never;
  nestedKey?: never;
};

type NestedFieldDef = {
  kind: FieldKind;
  group: string;
  label: string;
  nested: 'warehouse' | 'transport';
  nestedKey: string;
  options?: string[];
  key?: never;
};

type FieldDef = FlatFieldDef | NestedFieldDef;

function extractContainerStatusMeta(sources: unknown[]): {
  options: string[];
  canEdit: boolean;
} {
  const options: string[] = [];
  let canEdit = true;
  for (const src of sources) {
    const rec = asRecord(src);
    if (!rec) continue;
    if (typeof rec.can_edit_container_status === 'boolean') {
      canEdit = rec.can_edit_container_status;
    }
    if (typeof rec.canEditContainerStatus === 'boolean') {
      canEdit = rec.canEditContainerStatus;
    }
    const raw =
      rec.container_status_options ??
      rec.containerStatusOptions ??
      rec.container_statuses;
    if (Array.isArray(raw)) {
      for (const row of raw) {
        if (typeof row === 'string' && row.trim()) {
          options.push(row.trim().toUpperCase());
          continue;
        }
        const item = asRecord(row);
        const code = String(
          item?.value ?? item?.code ?? item?.status ?? item?.id ?? '',
        )
          .trim()
          .toUpperCase();
        if (code) options.push(code);
      }
    }
  }
  return { options: [...new Set(options)], canEdit };
}

const SERVICE_SCOPE_OPTIONS = [
  'DOOR_TO_DOOR',
  'DOOR_TO_PORT',
  'PORT_TO_DOOR',
  'PORT_TO_PORT',
];

const FIELD_DEFS: FieldDef[] = [
  { key: 'commodity', label: 'Commodity', kind: 'text', group: 'Cargo' },
  {
    key: 'commodity_description',
    label: 'Commodity description',
    kind: 'text',
    group: 'Cargo',
  },
  { key: 'pieces', label: 'Pieces', kind: 'number', group: 'Cargo' },
  { key: 'gross_weight', label: 'Gross weight', kind: 'number', group: 'Cargo' },
  {
    key: 'chargeable_weight',
    label: 'Chargeable weight',
    kind: 'number',
    group: 'Cargo',
  },
  {
    key: 'chargeable_units',
    label: 'Chargeable units',
    kind: 'number',
    group: 'Cargo',
  },
  { key: 'volume_cbm', label: 'Volume (CBM)', kind: 'number', group: 'Cargo' },
  {
    key: 'freight_payable_at',
    label: 'Freight payable at',
    kind: 'text',
    group: 'Commercial',
  },
  {
    key: 'service_scope',
    label: 'Service scope',
    kind: 'select',
    group: 'Commercial',
    options: SERVICE_SCOPE_OPTIONS,
  },
  {
    key: 'service_type',
    label: 'Service type (job type)',
    kind: 'text',
    group: 'Commercial',
  },
  { key: 'job_date', label: 'Job / shipment date', kind: 'date', group: 'Dates' },
  { key: 'etd', label: 'ETD', kind: 'date', group: 'Dates' },
  { key: 'eta', label: 'ETA', kind: 'date', group: 'Dates' },
  { key: 'mbl_number', label: 'MBL number', kind: 'text', group: 'References' },
  { key: 'hbl_number', label: 'HBL number', kind: 'text', group: 'References' },
  { key: 'bl_number', label: 'BL number', kind: 'text', group: 'References' },
  { key: 'rotation_number', label: 'Rotation number', kind: 'text', group: 'Ops / EDI' },
  { key: 'container_number', label: 'Container number', kind: 'text', group: 'Ops / EDI' },
  { key: 'container_status', label: 'Container status', kind: 'select', group: 'Ops / EDI' },
  { key: 'vessel_name', label: 'Vessel name', kind: 'text', group: 'Ops / EDI' },
  { key: 'vessel_number', label: 'Vessel number', kind: 'text', group: 'Ops / EDI' },
  { key: 'voyage_number', label: 'Voyage number', kind: 'text', group: 'Ops / EDI' },
  { key: 'line_code', label: 'Line code', kind: 'text', group: 'Ops / EDI' },
  { key: 'line_no', label: 'Line no', kind: 'text', group: 'Ops / EDI' },
  {
    key: 'location_terminal',
    label: 'Location / terminal',
    kind: 'text',
    group: 'Ops / EDI',
  },
  { key: 'company_code', label: 'Company code (EDI)', kind: 'text', group: 'Ops / EDI' },
  { key: 'origin_port_name', label: 'Origin port name', kind: 'text', group: 'Ports' },
  { key: 'origin_port_code', label: 'Origin port code', kind: 'text', group: 'Ports' },
  { key: 'dest_port_name', label: 'Destination port name', kind: 'text', group: 'Ports' },
  { key: 'dest_port_code', label: 'Destination port code', kind: 'text', group: 'Ports' },
  { key: 'shipper_name', label: 'Shipper name', kind: 'text', group: 'Parties' },
  { key: 'shipper_code', label: 'Shipper code', kind: 'text', group: 'Parties' },
  { key: 'consignee_name', label: 'Consignee name', kind: 'text', group: 'Parties' },
  { key: 'consignee_code', label: 'Consignee code', kind: 'text', group: 'Parties' },
  { key: 'billing_party_name', label: 'Billing party name', kind: 'text', group: 'Parties' },
  { key: 'billing_party_code', label: 'Billing party code', kind: 'text', group: 'Parties' },
  { key: 'customer_name', label: 'Customer name', kind: 'text', group: 'Parties' },
  { key: 'customer_code', label: 'Customer code', kind: 'text', group: 'Parties' },
  { key: 'agent_name', label: 'Agent name', kind: 'text', group: 'Parties' },
  { key: 'agent_code', label: 'Agent code', kind: 'text', group: 'Parties' },
  { key: 'carrier_name', label: 'Carrier name', kind: 'text', group: 'Parties' },
  { key: 'carrier_code', label: 'Carrier code', kind: 'text', group: 'Parties' },
  { key: 'airline_name', label: 'Airline', kind: 'text', group: 'Air / MAWB' },
  { key: 'flight_no', label: 'Flight number', kind: 'text', group: 'Air / MAWB' },
  {
    key: 'arrival_flight_number',
    label: 'Arrival flight number',
    kind: 'text',
    group: 'Air / MAWB',
  },
  { key: 'flight_status', label: 'Flight status', kind: 'text', group: 'Air / MAWB' },
  { key: 'flight_date', label: 'Flight date', kind: 'date', group: 'Air / MAWB' },
  { key: 'shipment_date', label: 'Shipment date', kind: 'date', group: 'Air / MAWB' },
  { key: 'mawb_no', label: 'MAWB number', kind: 'text', group: 'Air / MAWB' },
  { key: 'hawb_no', label: 'HAWB number', kind: 'text', group: 'Air / MAWB' },
  { key: 'pallet_count', label: 'Pallet count', kind: 'number', group: 'Air / MAWB' },
  { key: 'dimensions', label: 'Dimensions / volume CBM', kind: 'number', group: 'Air / MAWB' },
  { key: 'weight', label: 'Weight (kg)', kind: 'number', group: 'Air / MAWB' },
  {
    nested: 'warehouse',
    nestedKey: 'warehouse_name',
    label: 'Warehouse name',
    kind: 'text',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'warehouse_id',
    label: 'Warehouse id',
    kind: 'text',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'expected_inbound_at',
    label: 'Expected inbound',
    kind: 'date',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'expected_outbound_at',
    label: 'Expected outbound',
    kind: 'date',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'storage_days_requested',
    label: 'Storage days',
    kind: 'number',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'bonded',
    label: 'Bonded',
    kind: 'boolean',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'temperature_controlled',
    label: 'Temperature controlled',
    kind: 'boolean',
    group: 'Warehouse',
  },
  {
    nested: 'warehouse',
    nestedKey: 'commodity',
    label: 'Warehouse commodity',
    kind: 'text',
    group: 'Warehouse',
  },
  {
    nested: 'transport',
    nestedKey: 'pickup_address',
    label: 'Pickup address',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'delivery_address',
    label: 'Delivery address',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'origin_city_country',
    label: 'Origin city / country',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'destination_city_country',
    label: 'Destination city / country',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'vehicle_number',
    label: 'Vehicle number',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'driver_name',
    label: 'Driver name',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'driver_license',
    label: 'Driver license',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'trucker_id',
    label: 'Trucker id',
    kind: 'text',
    group: 'Transport / land',
  },
  {
    nested: 'transport',
    nestedKey: 'freight_terms',
    label: 'Freight terms',
    kind: 'text',
    group: 'Transport / land',
  },
];

function strVal(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

function nestedEmpty(
  defaults: PatchShowAllDto,
  nested: 'warehouse' | 'transport',
  nestedKey: string,
): boolean {
  const bag = defaults[nested] as Record<string, unknown> | undefined;
  const v = bag?.[nestedKey];
  if (v == null) return true;
  if (typeof v === 'string') return !v.trim();
  return false;
}

export function ShowAllEditModal({
  open,
  onClose,
  title = 'Edit Show All',
  sources,
  pending,
  onSubmit,
  transportEditMode = 'all',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Aggregated Show All / entity payloads used to prefill. */
  sources: unknown[];
  pending?: boolean;
  onSubmit: (dto: PatchShowAllDto) => Promise<void>;
  /** Sea ↔ air isolation — hide / strip fields BE would reject. */
  transportEditMode?: ShowAllTransportEditMode;
}) {
  const defaults = useMemo(
    () => extractPatchShowAllDefaults(sources),
    [sources],
  );
  const { data: catalogStatuses = [] } = useContainerStatusCatalog(open);
  const containerStatusMeta = useMemo(() => {
    const fromPayload = extractContainerStatusMeta(sources);
    if (fromPayload.options.length) return fromPayload;
    const fromCatalog = catalogStatuses
      .map((row) => row.code.trim().toUpperCase())
      .filter(Boolean);
    return {
      options: [...new Set(fromCatalog)],
      canEdit: fromPayload.canEdit,
    };
  }, [sources, catalogStatuses]);
  const [draft, setDraft] = useState<PatchShowAllDto>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft({ ...defaults });
    setFieldErrors({});
    setFormError(null);
  }, [open, defaults]);

  const groups = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    for (const field of FIELD_DEFS) {
      if (field.key && !showAllFieldAllowed(field.key, transportEditMode)) continue;
      const list = map.get(field.group) ?? [];
      list.push(field);
      map.set(field.group, list);
    }
    return [...map.entries()];
  }, [transportEditMode]);

  if (!open) return null;

  const setField = (key: keyof PatchShowAllDto, raw: string, kind: FieldKind) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (kind === 'number') {
      if (!raw.trim()) {
        setDraft((prev) => ({ ...prev, [key]: '' }));
        return;
      }
      const n = Number(raw);
      setDraft((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : raw }));
      return;
    }
    setDraft((prev) => ({ ...prev, [key]: raw }));
  };

  const setNestedField = (
    nested: 'warehouse' | 'transport',
    nestedKey: string,
    raw: string,
    kind: FieldKind,
  ) => {
    const errKey = `${nested}.${nestedKey}`;
    setFieldErrors((prev) => {
      if (!prev[errKey]) return prev;
      const next = { ...prev };
      delete next[errKey];
      return next;
    });
    setDraft((prev) => {
      const bag = {
        ...((prev[nested] as Record<string, unknown> | undefined) ?? {}),
      };
      if (kind === 'number') {
        if (!raw.trim()) bag[nestedKey] = '';
        else {
          const n = Number(raw);
          bag[nestedKey] = Number.isFinite(n) ? n : raw;
        }
      } else if (kind === 'boolean') {
        if (raw === '') bag[nestedKey] = '';
        else bag[nestedKey] = raw === 'true';
      } else {
        bag[nestedKey] = raw;
      }
      return {
        ...prev,
        [nested]:
          nested === 'warehouse'
            ? (bag as ShowAllWarehouseDto)
            : (bag as ShowAllTransportDto),
      };
    });
  };

  const submit = async () => {
    setFormError(null);
    setFieldErrors({});
    const payload = filterShowAllPayloadForTransport(
      toPatchShowAllPayload(draft, defaults),
      transportEditMode,
    );
    if (!Object.keys(payload).length) {
      setFormError('Enter at least one field to update.');
      return;
    }
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const { fieldErrors: next, formError: banner } = parseServerValidationError(err);
      if (Object.keys(next).length) setFieldErrors(next);
      setFormError(banner || getErrorMessage(err));
    }
  };

  return (
    <Modal
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      title={title}
      size="full"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="create"
            leftIcon={<Save className="h-3.5 w-3.5" />}
            disabled={pending}
            onClick={() => void submit()}
          >
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-[13px] text-[var(--color-neutral-600)]">
        Saved values stay filled when you reopen. Clearing Air / MAWB, commercial, or
        container status sends null so the server clears them (reopen shows —); other blank
        fields are left unchanged. Incomplete fields are highlighted.
      </p>
      {formError ? (
        <p className="mb-3 text-sm text-[var(--color-danger-600)]">{formError}</p>
      ) : null}
      <div className="max-h-[min(70vh,36rem)] space-y-4 overflow-y-auto pr-1">
        {groups.map(([group, fields]) => (
          <section key={group} className="space-y-2">
            <h4 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              {group}
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => {
                const isNested = Boolean(field.nested);
                const fieldKey = isNested
                  ? `${field.nested}.${field.nestedKey}`
                  : String(field.key);
                const incomplete = isNested
                  ? nestedEmpty(defaults, field.nested!, field.nestedKey!)
                  : isPatchShowAllFieldEmpty(defaults, field.key!);
                const value = isNested
                  ? (draft[field.nested!] as Record<string, unknown> | undefined)?.[
                      field.nestedKey!
                    ]
                  : draft[field.key!];
                const display =
                  field.kind === 'number'
                    ? value == null
                      ? ''
                      : String(value)
                    : field.kind === 'boolean'
                      ? value === true
                        ? 'true'
                        : value === false
                          ? 'false'
                          : ''
                      : strVal(value);
                const isContainerStatus = field.key === 'container_status';
                const statusOptions =
                  field.options ??
                  (isContainerStatus ? containerStatusMeta.options : undefined);
                const statusLocked =
                  isContainerStatus && containerStatusMeta.canEdit === false;
                const selectOptions =
                  statusOptions && statusOptions.length
                    ? statusOptions
                    : display
                      ? [display]
                      : [];

                return (
                  <div
                    key={fieldKey}
                    className={
                      incomplete
                        ? 'rounded-md bg-amber-50/80 p-2 ring-1 ring-amber-200'
                        : undefined
                    }
                  >
                    {field.kind === 'select' ||
                    field.kind === 'boolean' ||
                    (isContainerStatus && (statusOptions?.length ?? 0) > 0) ? (
                      <label className="block space-y-1 text-xs font-medium text-[var(--color-neutral-500)]">
                        <span>
                          {incomplete ? `${field.label} (incomplete)` : field.label}
                        </span>
                        <select
                          className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] disabled:opacity-60"
                          value={display}
                          disabled={pending || statusLocked}
                          onChange={(e) => {
                            if (isNested) {
                              setNestedField(
                                field.nested!,
                                field.nestedKey!,
                                e.target.value,
                                field.kind,
                              );
                            } else {
                              setField(field.key!, e.target.value, 'text');
                            }
                          }}
                        >
                          <option value="">—</option>
                          {(field.kind === 'boolean'
                            ? ['true', 'false']
                            : selectOptions
                          ).map((opt) => (
                            <option key={opt} value={opt}>
                              {field.kind === 'boolean'
                                ? opt === 'true'
                                  ? 'Yes'
                                  : 'No'
                                : opt.replaceAll('_', ' ')}
                            </option>
                          ))}
                        </select>
                        {fieldErrors[fieldKey] ? (
                          <span className="text-[var(--color-danger-600)]">
                            {fieldErrors[fieldKey]}
                          </span>
                        ) : null}
                      </label>
                    ) : (
                      <Input
                        label={
                          incomplete ? `${field.label} (incomplete)` : field.label
                        }
                        type={
                          field.kind === 'number'
                            ? 'number'
                            : field.kind === 'date'
                              ? 'date'
                              : 'text'
                        }
                        value={
                          field.kind === 'date' && display
                            ? display.slice(0, 10)
                            : display
                        }
                        error={fieldErrors[fieldKey]}
                        disabled={pending || statusLocked}
                        onChange={(e) => {
                          if (isNested) {
                            setNestedField(
                              field.nested!,
                              field.nestedKey!,
                              e.target.value,
                              field.kind,
                            );
                          } else {
                            setField(
                              field.key!,
                              e.target.value,
                              field.kind === 'select' ? 'text' : field.kind,
                            );
                          }
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
