import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { PatchShowAllDto } from '@/features/jobs/types/job.types';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { parseServerValidationError } from '@/lib/validation/mapApiErrors';
import {
  extractPatchShowAllDefaults,
  isPatchShowAllFieldEmpty,
  toPatchShowAllPayload,
} from './extractPatchShowAllDefaults';

type FieldKind = 'text' | 'number' | 'date';

const FIELD_DEFS: Array<{
  key: keyof PatchShowAllDto;
  label: string;
  kind: FieldKind;
  group: string;
}> = [
  { key: 'commodity', label: 'Commodity', kind: 'text', group: 'Cargo' },
  { key: 'pieces', label: 'Pieces', kind: 'number', group: 'Cargo' },
  { key: 'gross_weight', label: 'Gross weight', kind: 'number', group: 'Cargo' },
  { key: 'volume_cbm', label: 'Volume (CBM)', kind: 'number', group: 'Cargo' },
  { key: 'job_date', label: 'Job / shipment date', kind: 'date', group: 'Dates' },
  { key: 'etd', label: 'ETD', kind: 'date', group: 'Dates' },
  { key: 'eta', label: 'ETA', kind: 'date', group: 'Dates' },
  { key: 'mbl_number', label: 'MBL number', kind: 'text', group: 'References' },
  { key: 'hbl_number', label: 'HBL number', kind: 'text', group: 'References' },
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
];

function strVal(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

export function ShowAllEditModal({
  open,
  onClose,
  title = 'Edit Show All',
  sources,
  pending,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Aggregated Show All / entity payloads used to prefill. */
  sources: unknown[];
  pending?: boolean;
  onSubmit: (dto: PatchShowAllDto) => Promise<void>;
}) {
  const defaults = useMemo(
    () => extractPatchShowAllDefaults(sources),
    [sources],
  );
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
    const map = new Map<string, typeof FIELD_DEFS>();
    for (const field of FIELD_DEFS) {
      const list = map.get(field.group) ?? [];
      list.push(field);
      map.set(field.group, list);
    }
    return [...map.entries()];
  }, []);

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
        setDraft((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        return;
      }
      const n = Number(raw);
      setDraft((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : raw }));
      return;
    }
    setDraft((prev) => ({ ...prev, [key]: raw }));
  };

  const submit = async () => {
    setFormError(null);
    setFieldErrors({});
    const payload = toPatchShowAllPayload(draft);
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
      size="lg"
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
        Fill incomplete header fields. Only values you enter are sent — existing data is not
        cleared. Incomplete fields are highlighted.
      </p>
      {formError ? (
        <p className="mb-3 text-sm text-[var(--color-danger-600)]">{formError}</p>
      ) : null}
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {groups.map(([group, fields]) => (
          <section key={group} className="space-y-2">
            <h4 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              {group}
            </h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {fields.map((field) => {
                const incomplete = isPatchShowAllFieldEmpty(defaults, field.key);
                const value = draft[field.key];
                const display =
                  field.kind === 'number'
                    ? value == null
                      ? ''
                      : String(value)
                    : strVal(value);
                return (
                  <div
                    key={field.key}
                    className={
                      incomplete
                        ? 'rounded-md bg-amber-50/80 p-2 ring-1 ring-amber-200'
                        : undefined
                    }
                  >
                    <Input
                      label={
                        incomplete ? `${field.label} (incomplete)` : field.label
                      }
                      type={field.kind === 'number' ? 'number' : field.kind}
                      value={display}
                      error={fieldErrors[field.key]}
                      onChange={(e) =>
                        setField(field.key, e.target.value, field.kind)
                      }
                    />
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
