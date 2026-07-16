import { type Resolver } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import {
  createAwbStockBatchSchema,
  updateAwbStockBatchSchema,
} from '../../schemas/awbStock.schema';
import type {
  CreateAwbStockBatchFormValues,
  UpdateAwbStockBatchFormValues,
} from '../../types/awbStock.types';
import { computeTotalAwbs } from '../../utils/normalizeAwbStock';
import { AWB_STOCK_CREATE_DEFAULTS } from '../../utils/prepareAwbStockPayload';

interface AwbStockFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateAwbStockBatchFormValues>;
  onSubmit: (
    values: CreateAwbStockBatchFormValues | UpdateAwbStockBatchFormValues,
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function AwbStockForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: AwbStockFormProps) {
  const schema = mode === 'create' ? createAwbStockBatchSchema : updateAwbStockBatchSchema;
  const { data: airlines = [] } = useMasterOptions('airlines', MASTER_PATHS.airlines, true);
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);

  const {
    register,
    control,
    setValue,
    handleValidatedSubmit,
    formState: { errors },
  } = useAppForm<CreateAwbStockBatchFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateAwbStockBatchFormValues>,
    defaultValues: { ...AWB_STOCK_CREATE_DEFAULTS, ...defaultValues },
  });

  const rangeFrom = useWatch({ control, name: 'range_from' });
  const rangeTo = useWatch({ control, name: 'range_to' });
  const total =
    typeof rangeFrom === 'number' && typeof rangeTo === 'number'
      ? computeTotalAwbs(rangeFrom, rangeTo)
      : 0;

  const fieldError = (name: keyof CreateAwbStockBatchFormValues) =>
    errors[name]?.message as string | undefined;

  const airlineOpts = airlines
    .filter((a) => isUuid(String(a.id)))
    .map((a) => ({
      value: String(a.id),
      label: [a.code, a.name].filter(Boolean).join(' — ') || String(a.id),
      prefixHint: String(a.code || '')
        .replace(/\D/g, '')
        .slice(0, 3),
    }));

  const branchOpts = branches
    .filter((b) => isUuid(String(b.id)))
    .map((b) => ({
      value: String(b.id),
      label: [b.code, b.name].filter(Boolean).join(' — ') || String(b.id),
    }));

  const numAs = (v: unknown) =>
    v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v);

  return (
    <form
      onSubmit={handleValidatedSubmit((values) => onSubmit(values))}
      className="space-y-4 max-w-3xl"
      noValidate
    >
      {mode === 'create' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
              <Controller
                name="airline_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    name="airline_id"
                    label="Airline"
                    required
                    value={field.value ?? ''}
                    options={airlineOpts}
                    onChange={(value) => {
                      field.onChange(value);
                      const hint = airlineOpts.find((o) => o.value === value)?.prefixHint;
                      if (hint && hint.length === 3) {
                        setValue('prefix', hint, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    error={fieldError('airline_id')}
                  />
                )}
              />
              <Controller
                name="branch_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    name="branch_id"
                    label="Branch"
                    value={field.value ?? ''}
                    options={branchOpts}
                    onChange={field.onChange}
                    error={fieldError('branch_id')}
                  />
                )}
              />
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-neutral-500)]">
                  Airline prefix <span className="text-[var(--color-danger-500)]">*</span>
                </label>
                <Input {...register('prefix')} placeholder="e.g. 176" maxLength={3} />
                <FieldError message={fieldError('prefix')} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AWB range</CardTitle>
            </CardHeader>
            <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-neutral-500)]">
                  Start AWB number <span className="text-[var(--color-danger-500)]">*</span>
                </label>
                <Input
                  type="number"
                  {...register('range_from', { setValueAs: numAs })}
                />
                <FieldError message={fieldError('range_from')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--color-neutral-500)]">
                  End AWB number <span className="text-[var(--color-danger-500)]">*</span>
                </label>
                <Input type="number" {...register('range_to', { setValueAs: numAs })} />
                <FieldError message={fieldError('range_to')} />
              </div>
              <div className="sm:col-span-2 text-sm text-[var(--color-neutral-500)]">
                Total AWBs in range:{' '}
                <span className="font-medium text-[var(--color-neutral-800)]">
                  {total || '—'}
                </span>
              </div>
            </div>
          </Card>
        </>
      )}

      {mode === 'edit' && defaultValues ? (
        <Card>
          <CardHeader>
            <CardTitle>Registered range (read-only)</CardTitle>
          </CardHeader>
          <div className="p-4 pt-0 grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-xs text-[var(--color-neutral-400)]">Prefix</p>
              <p className="font-mono font-medium">{defaultValues.prefix || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-400)]">Range</p>
              <p className="font-mono font-medium">
                {defaultValues.range_from ?? '—'} – {defaultValues.range_to ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-neutral-400)]">Airline</p>
              <p className="font-medium truncate">{defaultValues.airline_id || '—'}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Stock settings' : 'Update batch'}</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">
              Low stock threshold
            </label>
            <Input
              type="number"
              {...register('low_stock_threshold', { setValueAs: numAs })}
            />
            <FieldError message={fieldError('low_stock_threshold')} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-[var(--color-neutral-500)]">Notes / remarks</label>
            <textarea
              className="w-full min-h-[72px] rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('notes')}
              placeholder="Optional remarks for this stock batch"
            />
            <FieldError message={fieldError('notes')} />
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {mode === 'create' ? 'Register batch' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
