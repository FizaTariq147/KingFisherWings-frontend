import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getServerErrorMessage } from '@/lib/validation/mapApiErrors';
import { MASTER_PATHS } from '../api/masterPaths';
import { getMasterResource } from '../config/masterResources';
import { useMasterMutations, useMasterOptions } from '../hooks/useMasterResource';
import { validateMasterValues } from '../schemas/master.schema';
import type { MasterRecord } from '../types/master.types';

const RESOURCE = getMasterResource('charge-codes');

const FIELD_CLASS =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

function emptyChargeCodeValues(): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  if (!RESOURCE) return defaults;
  for (const field of RESOURCE.fields) {
    if (field.type === 'boolean') {
      defaults[field.name] = field.name === 'is_active';
    } else if (field.type === 'multiselect') {
      defaults[field.name] = [];
    } else if (field.name === 'charge_group') {
      defaults[field.name] = 'OTHER';
    } else {
      defaults[field.name] = '';
    }
  }
  return defaults;
}

export type AddChargeCodeModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after successful create — parent should select the new id in the dropdown. */
  onCreated: (record: MasterRecord) => void;
  /** Use when opening over another modal (e.g. job Add charge dialog). */
  nested?: boolean;
};

/**
 * In-place create for Masters → Charge Codes (same fields as /masters/charge-codes/new).
 * POST /masters/charge-codes via useMasterMutations — invalidates charge-code option caches.
 */
export function AddChargeCodeModal({
  open,
  onClose,
  onCreated,
  nested = false,
}: AddChargeCodeModalProps) {
  const { create } = useMasterMutations('charge-codes', MASTER_PATHS['charge-codes']);
  const { data: taxRates = [] } = useMasterOptions(
    'tax-rates',
    MASTER_PATHS['tax-rates'],
    open,
  );
  const { data: units = [] } = useMasterOptions(
    'units-of-measure',
    MASTER_PATHS['units-of-measure'],
    open,
  );

  const [values, setValues] = useState<Record<string, unknown>>(emptyChargeCodeValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(emptyChargeCodeValues());
    setFieldErrors({});
    setError(null);
  }, [open]);

  const taxRateOptions = useMemo(
    () =>
      taxRates.map((r) => ({
        value: String(r.id),
        label: String(r.name ?? r.code ?? r.id),
      })),
    [taxRates],
  );

  const unitOptions = useMemo(
    () =>
      units.map((u) => ({
        value: String(u.code ?? u.id),
        label: String(u.name ?? u.code ?? u.id),
      })),
    [units],
  );

  const patch = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const submit = async () => {
    setError(null);
    if (!RESOURCE) {
      setError('Charge codes master config is missing.');
      return;
    }
    const validation = validateMasterValues(RESOURCE.fields, values, 'charge-codes');
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setError(validation.message);
      return;
    }
    try {
      const created = await create.mutateAsync(validation.data);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(getServerErrorMessage(err) || 'Could not create charge code.');
    }
  };

  const chargeGroupField = RESOURCE?.fields.find((f) => f.name === 'charge_group');
  const modesField = RESOURCE?.fields.find((f) => f.name === 'applicable_modes');
  const selectedModes = Array.isArray(values.applicable_modes)
    ? (values.applicable_modes as string[])
    : [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add charge code"
      size="lg"
      layer={nested ? 'nested' : 'base'}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={create.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={create.isPending || !RESOURCE}>
            {create.isPending ? 'Saving…' : 'Save charge code'}
          </Button>
        </>
      }
    >
      <div className="max-h-[min(70vh,560px)] space-y-3 overflow-y-auto pr-1">
        <p className="text-xs text-[var(--color-neutral-500)]">
          Creates a master charge code (same as Masters → Charge Codes → New). After save it
          appears in this dropdown and you stay on this screen.
        </p>
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}

        <Input
          label="Code *"
          value={String(values.code ?? '')}
          error={fieldErrors.code}
          className="font-mono"
          onChange={(e) => patch('code', e.target.value)}
        />
        <Input
          label="Description *"
          value={String(values.description ?? '')}
          error={fieldErrors.description}
          onChange={(e) => patch('description', e.target.value)}
        />

        <div className="space-y-1">
          <label htmlFor="add-cc-group" className="text-xs font-medium text-[var(--color-neutral-500)]">
            Charge group
          </label>
          <select
            id="add-cc-group"
            className={FIELD_CLASS}
            value={String(values.charge_group ?? '')}
            onChange={(e) => patch('charge_group', e.target.value)}
          >
            <option value="">Select…</option>
            {(chargeGroupField?.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {fieldErrors.charge_group ? (
            <p className="text-xs text-[var(--color-danger-500)]">{fieldErrors.charge_group}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-[var(--color-neutral-500)]">
            Applicable modes *
          </span>
          <div className="flex flex-wrap gap-3">
            {(modesField?.options ?? []).map((opt) => {
              const checked = selectedModes.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-700)]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? selectedModes.filter((v) => v !== opt.value)
                        : [...selectedModes, opt.value];
                      patch('applicable_modes', next);
                    }}
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
          {fieldErrors.applicable_modes ? (
            <p className="text-xs text-[var(--color-danger-500)]">{fieldErrors.applicable_modes}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="add-cc-unit" className="text-xs font-medium text-[var(--color-neutral-500)]">
              Unit of measure
            </label>
            <select
              id="add-cc-unit"
              className={FIELD_CLASS}
              value={String(values.unit ?? '')}
              onChange={(e) => patch('unit', e.target.value)}
            >
              <option value="">Select…</option>
              {unitOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="add-cc-tax-rate"
              className="text-xs font-medium text-[var(--color-neutral-500)]"
            >
              Tax rate
            </label>
            <select
              id="add-cc-tax-rate"
              className={FIELD_CLASS}
              value={String(values.tax_rate_id ?? '')}
              onChange={(e) => patch('tax_rate_id', e.target.value)}
            >
              <option value="">Optional…</option>
              {taxRateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="GL revenue code"
            value={String(values.gl_revenue_code ?? '')}
            onChange={(e) => patch('gl_revenue_code', e.target.value)}
          />
          <Input
            label="GL cost code"
            value={String(values.gl_cost_code ?? '')}
            onChange={(e) => patch('gl_cost_code', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input
              type="checkbox"
              checked={Boolean(values.tax_applicable)}
              onChange={(e) => patch('tax_applicable', e.target.checked)}
            />
            Tax applicable
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input
              type="checkbox"
              checked={Boolean(values.is_mandatory)}
              onChange={(e) => patch('is_mandatory', e.target.checked)}
            />
            Mandatory
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input
              type="checkbox"
              checked={Boolean(values.is_active)}
              onChange={(e) => patch('is_active', e.target.checked)}
            />
            Active
          </label>
        </div>
      </div>
    </Modal>
  );
}
