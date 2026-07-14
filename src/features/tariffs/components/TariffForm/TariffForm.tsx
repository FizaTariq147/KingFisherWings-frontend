import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import {
  TARIFF_SERVICE_TYPE_LABELS,
  TARIFF_SERVICE_TYPES,
} from '../../constants/tariff.constants';
import { createTariffSchema, updateTariffSchema } from '../../schemas/tariff.schema';
import type { CreateTariffFormValues, UpdateTariffFormValues } from '../../types/tariff.types';
import { TARIFF_FORM_DEFAULTS } from '../../utils/tariffToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface TariffFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateTariffFormValues>;
  onSubmit: (values: CreateTariffFormValues | UpdateTariffFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function TariffForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: TariffFormProps) {
  const schema = mode === 'create' ? createTariffSchema : updateTariffSchema;
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: containers = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: chargeCodes = [] } = useMasterOptions(
    'charge-codes',
    MASTER_PATHS['charge-codes'],
    true,
  );
  const { data: uoms = [] } = useMasterOptions(
    'units-of-measure',
    MASTER_PATHS['units-of-measure'],
    true,
  );
  const { data: customersResult } = useParties({
    page: 1,
    limit: 200,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'tariffs', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const customers = (customersResult?.parties ?? []).filter((p) => isUuid(p.id));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useAppForm<CreateTariffFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateTariffFormValues>,
    defaultValues: { ...TARIFF_FORM_DEFAULTS, ...defaultValues },
  });

  const fieldError = (name: keyof CreateTariffFormValues) =>
    errors[name]?.message as string | undefined;

  const portOptions = ports
    .filter((p) => isUuid(String(p.id)))
    .map((p) => ({
      value: String(p.id),
      label: [p.code, p.name].filter(Boolean).join(' — ') || String(p.id),
    }));

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values))}
      className="space-y-4 max-w-4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Service type *
            </label>
            <select className={selectClass} {...register('service_type')}>
              {TARIFF_SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TARIFF_SERVICE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('service_type')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Charge code *
            </label>
            <select className={selectClass} {...register('charge_code_id')}>
              <option value="">Select…</option>
              {chargeCodes
                .filter((c) => isUuid(String(c.id)))
                .map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.code ?? c.name ?? c.id)}
                  </option>
                ))}
            </select>
            <FieldError message={fieldError('charge_code_id')} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Customer (optional — omit for general rate)
            </label>
            <select className={selectClass} {...register('customer_id')}>
              <option value="">All customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.name} (${c.code})` : c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm mt-2">
            <input type="checkbox" {...register('is_active')} />
            Active
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transportation & location</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Origin port
            </label>
            <select className={selectClass} {...register('origin_port_id')}>
              <option value="">Select…</option>
              {portOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Destination port
            </label>
            <select className={selectClass} {...register('dest_port_id')}>
              <option value="">Select…</option>
              {portOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Container type
            </label>
            <select className={selectClass} {...register('container_type_id')}>
              <option value="">Select…</option>
              {containers
                .filter((c) => isUuid(String(c.id)))
                .map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.code ?? c.name ?? c.id)}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Unit</label>
            {uoms.length > 0 ? (
              <select className={selectClass} {...register('unit')}>
                <option value="">Select…</option>
                <option value="Per Container">Per Container</option>
                {uoms.map((u) => {
                  const label = String(u.code ?? u.name ?? u.id);
                  return (
                    <option key={String(u.id ?? label)} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            ) : (
              <Input placeholder="Per Container" {...register('unit')} />
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Currency *
            </label>
            <select className={selectClass} {...register('currency_code')}>
              <option value="">Select…</option>
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('currency_code')} />
          </div>
          <Input
            label="Sale rate *"
            type="number"
            step="any"
            error={fieldError('sale_rate')}
            {...register('sale_rate', { valueAsNumber: true })}
          />
          <Input
            label="Cost rate *"
            type="number"
            step="any"
            error={fieldError('cost_rate')}
            {...register('cost_rate', { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validity</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Valid from *
            </label>
            <input type="date" className={selectClass} {...register('valid_from')} />
            <FieldError message={fieldError('valid_from')} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Valid to</label>
            <input type="date" className={selectClass} {...register('valid_to')} />
            <FieldError message={fieldError('valid_to')} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create tariff' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
