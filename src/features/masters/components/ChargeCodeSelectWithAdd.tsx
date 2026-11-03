import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '../api/masterPaths';
import { useMasterOptions } from '../hooks/useMasterResource';
import type { MasterRecord } from '../types/master.types';
import {
  chargeCodeNarrative,
  chargeCodeOptionLabel,
  mapChargeCodeOptions,
} from '../utils/chargeCodeDisplay';
import { AddChargeCodeModal } from './AddChargeCodeModal';

const DEFAULT_SELECT_CLASS =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

export type ChargeCodeChangeMeta = {
  description: string;
  label: string;
  record?: MasterRecord;
};

export type ChargeCodeSelectWithAddProps = {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (id: string, meta: ChargeCodeChangeMeta) => void;
  error?: string;
  required?: boolean;
  /** Open create modal above another modal (job Add charge, etc.). */
  nestedModal?: boolean;
  emptyLabel?: string;
  selectClassName?: string;
  disabled?: boolean;
  /** Hide the field label (caller already rendered one). */
  hideLabel?: boolean;
};

/**
 * Charge-code picker with inline “+” that creates Masters → Charge Codes
 * and selects the new row. Description meta never falls back to code alone.
 */
export function ChargeCodeSelectWithAdd({
  id,
  name = 'charge_code_id',
  label = 'Charge code',
  value,
  onChange,
  error,
  required,
  nestedModal = false,
  emptyLabel = 'Select…',
  selectClassName = DEFAULT_SELECT_CLASS,
  disabled = false,
  hideLabel = false,
}: ChargeCodeSelectWithAddProps) {
  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
    true,
  );
  const [addOpen, setAddOpen] = useState(false);

  const options = useMemo(
    () => mapChargeCodeOptions(chargeCodes, isUuid),
    [chargeCodes],
  );

  const emit = (nextId: string, record?: MasterRecord) => {
    const fromOpt = options.find((o) => o.id === nextId);
    const description =
      (record ? chargeCodeNarrative(record) : '') || fromOpt?.description || '';
    const labelText = record
      ? chargeCodeOptionLabel(record)
      : fromOpt?.label || nextId;
    onChange(nextId, { description, label: labelText, record });
  };

  return (
    <div className="space-y-1">
      {!hideLabel && label ? (
        <label
          htmlFor={id || name}
          className="text-xs font-medium text-[var(--color-neutral-500)]"
        >
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}
      <div className="flex items-end gap-2">
        <select
          id={id || name}
          name={name}
          className={`${selectClassName} min-w-0 flex-1`}
          value={value}
          disabled={disabled}
          onChange={(e) => emit(e.target.value)}
        >
          <option value="">{emptyLabel}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          title="Add charge code"
          aria-label="Add charge code"
          disabled={disabled}
          onClick={() => setAddOpen(true)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {error ? <p className="text-xs text-[var(--color-danger-500)]">{error}</p> : null}

      <AddChargeCodeModal
        open={addOpen}
        nested={nestedModal}
        onClose={() => setAddOpen(false)}
        onCreated={(record) => {
          const idCreated = String(record.id ?? '');
          if (!isUuid(idCreated)) return;
          emit(idCreated, record);
        }}
      />
    </div>
  );
}
