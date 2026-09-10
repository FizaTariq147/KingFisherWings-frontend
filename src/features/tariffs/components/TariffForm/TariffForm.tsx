import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import type { JobType } from '@/features/quotations/constants/quotation.constants';
import {
  JobTypeSelectGrid,
  QuotationWizardNav,
  QuotationWizardStepper,
} from '@/features/quotations/components/quotation-wizard';
import {
  TARIFF_SERVICE_TYPE_LABELS,
  TARIFF_SERVICE_TYPES,
  type TariffServiceType,
} from '../../constants/tariff.constants';
import {
  TARIFF_WIZARD_STEPS,
  isTariffWizardLastStep,
  tariffWizardStepKey,
} from '../../constants/tariffWizard.constants';
import { createTariffSchema, updateTariffSchema } from '../../schemas/tariff.schema';
import type { CreateTariffFormValues, UpdateTariffFormValues } from '../../types/tariff.types';
import { TARIFF_FORM_DEFAULTS } from '../../utils/tariffToFormValues';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

const PANEL =
  'rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6 space-y-4';

interface TariffFormProps {
  mode: 'create' | 'edit';
  /** `wizard` = quotation-like multi-step create; `flat` = single page (edit default). */
  layout?: 'flat' | 'wizard';
  defaultValues?: Partial<CreateTariffFormValues>;
  onSubmit: (values: CreateTariffFormValues | UpdateTariffFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

const SERVICE_FIELDS: (keyof CreateTariffFormValues)[] = ['service_type'];
const PORT_FIELDS: (keyof CreateTariffFormValues)[] = ['origin_port_id', 'dest_port_id'];
const CHARGE_FIELDS: (keyof CreateTariffFormValues)[] = [
  'charge_code_id',
  'container_type_id',
  'unit',
  'customer_id',
];
const COSTING_FIELDS: (keyof CreateTariffFormValues)[] = [
  'currency_code',
  'sale_rate',
  'cost_rate',
  'valid_from',
  'valid_to',
];

const STEP_VALIDATE: Partial<
  Record<(typeof TARIFF_WIZARD_STEPS)[number]['key'], (keyof CreateTariffFormValues)[]>
> = {
  create: SERVICE_FIELDS,
  ports: PORT_FIELDS,
  charge: CHARGE_FIELDS,
  costing: COSTING_FIELDS,
};

export function TariffForm({
  mode,
  layout = 'flat',
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: TariffFormProps) {
  const isWizard = layout === 'wizard' && mode === 'create';
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const schema = mode === 'create' ? createTariffSchema : updateTariffSchema;
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
    control,
    handleValidatedSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitted, isValid },
  } = useAppForm<CreateTariffFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateTariffFormValues>,
    defaultValues: { ...TARIFF_FORM_DEFAULTS, ...defaultValues },
  });

  const serviceType = watch('service_type');
  const isAir = String(serviceType ?? '').startsWith('AIR_');
  const originPortId = watch('origin_port_id');
  const destPortId = watch('dest_port_id');
  const watched = watch();

  const fieldError = (name: keyof CreateTariffFormValues) =>
    errors[name]?.message as string | undefined;

  const showFormErrors = isSubmitted && !isValid;

  const uuidSelect = {
    setValueAs: (v: unknown) => {
      if (v == null) return undefined;
      const s = String(v).trim();
      return s && isUuid(s) ? s : undefined;
    },
  };

  const chargeLabel = (() => {
    const id = watched.charge_code_id;
    if (!id) return '—';
    const match = chargeCodes.find((c) => String(c.id) === id);
    return match ? String(match.code ?? match.name ?? id) : id;
  })();

  const containerLabel = (() => {
    const id = watched.container_type_id;
    if (!id) return '—';
    const match = containers.find((c) => String(c.id) === id);
    return match ? String(match.code ?? match.name ?? id) : id;
  })();

  const customerLabel = (() => {
    const id = watched.customer_id;
    if (!id) return 'All customers';
    const match = customers.find((c) => c.id === id);
    return match ? (match.code ? `${match.name} (${match.code})` : match.name) : id;
  })();

  const submitForm = handleValidatedSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Could not save tariff.');
    }
  });

  const goNext = async () => {
    setApiError(null);
    if (isTariffWizardLastStep(step)) {
      await submitForm();
      return;
    }
    const key = tariffWizardStepKey(step);
    const fields = key ? STEP_VALIDATE[key] : undefined;
    if (fields?.length) {
      const ok = await trigger(fields);
      if (!ok) return;
      if (key === 'create' && !serviceType) return;
    }
    setStep((s) => Math.min(s + 1, TARIFF_WIZARD_STEPS.length - 1));
  };

  const wizardStepKey = tariffWizardStepKey(step);

  const serviceTypeSelect = (
    <div className="space-y-1">
      <label htmlFor="service_type" className={labelClass}>
        Service type *
      </label>
      <select id="service_type" className={selectClass} {...register('service_type')}>
        {TARIFF_SERVICE_TYPES.map((t) => (
          <option key={t} value={t}>
            {TARIFF_SERVICE_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <FieldError message={fieldError('service_type')} />
    </div>
  );

  const chargeCodeSelect = (
    <div className="space-y-1">
      <label htmlFor="charge_code_id" className={labelClass}>
        Charge code *
      </label>
      <select
        id="charge_code_id"
        className={selectClass}
        {...register('charge_code_id', uuidSelect)}
      >
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
  );

  const customerSelect = (
    <div className="space-y-1 sm:col-span-2">
      <label htmlFor="customer_id" className={labelClass}>
        Customer (optional — omit for general rate)
      </label>
      <select id="customer_id" className={selectClass} {...register('customer_id', uuidSelect)}>
        <option value="">All customers</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.code ? `${c.name} (${c.code})` : c.name}
          </option>
        ))}
      </select>
    </div>
  );

  const portFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Controller
        name="origin_port_id"
        control={control}
        render={({ field }) => (
          <MasterPlaceSelect
            name="origin_port_id"
            label={isAir ? 'Origin airport' : 'Origin port'}
            value={field.value ?? ''}
            onChange={field.onChange}
            kind={isAir ? 'airports' : 'ports'}
            excludeId={destPortId}
          />
        )}
      />
      <Controller
        name="dest_port_id"
        control={control}
        render={({ field }) => (
          <MasterPlaceSelect
            name="dest_port_id"
            label={isAir ? 'Destination airport' : 'Destination port'}
            value={field.value ?? ''}
            onChange={field.onChange}
            kind={isAir ? 'airports' : 'ports'}
            excludeId={originPortId}
            error={fieldError('dest_port_id')}
          />
        )}
      />
    </div>
  );

  const containerAndUnit = (
    <>
      <div className="space-y-1">
        <label htmlFor="container_type_id" className={labelClass}>
          Container type
        </label>
        <select
          id="container_type_id"
          className={selectClass}
          {...register('container_type_id', uuidSelect)}
        >
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
        <label htmlFor="unit" className={labelClass}>
          Unit
        </label>
        {uoms.length > 0 ? (
          <select id="unit" className={selectClass} {...register('unit')}>
            <option value="">Select…</option>
            <option value="KG">KG</option>
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
          <Input id="unit" placeholder="KG" {...register('unit')} />
        )}
      </div>
    </>
  );

  const pricingFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="currency_code" className={labelClass}>
          Currency *
        </label>
        <select id="currency_code" className={selectClass} {...register('currency_code')}>
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
        min={0}
        error={fieldError('sale_rate')}
        placeholder="e.g. 850"
        {...register('sale_rate', { valueAsNumber: true })}
      />
      <Input
        label="Cost rate *"
        type="number"
        step="any"
        min={0}
        error={fieldError('cost_rate')}
        placeholder="e.g. 620"
        {...register('cost_rate', { valueAsNumber: true })}
      />
    </div>
  );

  const validityFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="valid_from" className={labelClass}>
          Valid from *
        </label>
        <input id="valid_from" type="date" className={selectClass} {...register('valid_from')} />
        <FieldError message={fieldError('valid_from')} />
      </div>
      <div className="space-y-1">
        <label htmlFor="valid_to" className={labelClass}>
          Valid to
        </label>
        <input id="valid_to" type="date" className={selectClass} {...register('valid_to')} />
        <FieldError message={fieldError('valid_to')} />
      </div>
    </div>
  );

  if (isWizard) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="mx-auto max-w-5xl space-y-6"
        noValidate
      >
        {apiError ? (
          <div
            role="alert"
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {apiError}
          </div>
        ) : null}

        <QuotationWizardStepper currentStep={step} steps={TARIFF_WIZARD_STEPS} />

        {wizardStepKey === 'create' ? (
          <div className={PANEL}>
            <JobTypeSelectGrid
              value={serviceType}
              heading="What type of tariff would you like to create?"
              onChange={(jt: JobType) =>
                setValue('service_type', jt as TariffServiceType, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              error={fieldError('service_type')}
            />
          </div>
        ) : null}

        {wizardStepKey === 'ports' ? (
          <div className={PANEL}>
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Port Details</h3>
            <p className="text-xs text-[var(--color-neutral-500)]">
              Optional lane ports. Leave blank for a general rate that applies across ports.
            </p>
            {portFields}
          </div>
        ) : null}

        {wizardStepKey === 'charge' ? (
          <div className={PANEL}>
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Charge / Unit</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {chargeCodeSelect}
              {containerAndUnit}
              {customerSelect}
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" {...register('is_active')} />
                Active
              </label>
            </div>
          </div>
        ) : null}

        {wizardStepKey === 'costing' ? (
          <div className={PANEL}>
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Pricing</h3>
            {pricingFields}
            <h3 className="pt-2 text-sm font-semibold text-[var(--color-neutral-800)]">Validity</h3>
            {validityFields}
          </div>
        ) : null}

        {wizardStepKey === 'summary' ? (
          <div className={PANEL}>
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Summary</h3>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Service type</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {TARIFF_SERVICE_TYPE_LABELS[watched.service_type as TariffServiceType] ??
                    watched.service_type}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Charge code</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">{chargeLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Customer</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">{customerLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Container / unit</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[containerLabel !== '—' ? containerLabel : null, watched.unit]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Sale / cost</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.currency_code || '—'} {watched.sale_rate ?? '—'} / {watched.cost_rate ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Valid</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[watched.valid_from || '—', watched.valid_to || 'open'].join(' → ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Status</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.is_active === false ? 'Inactive' : 'Active'}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          totalSteps={TARIFF_WIZARD_STEPS.length}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={onCancel}
          onNext={() => void goNext()}
          isSubmitting={isSubmitting}
          submitLabel="Create tariff"
          disableNext={wizardStepKey === 'create' && !serviceType}
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleValidatedSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="space-y-4 max-w-4xl"
      noValidate
    >
      {showFormErrors && (
        <div
          role="alert"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          Please fix the highlighted fields before saving.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2">
          {serviceTypeSelect}
          {chargeCodeSelect}
          {customerSelect}
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} />
            Active
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transportation & location</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 pt-0 sm:grid-cols-2">
          {portFields}
          {containerAndUnit}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0">{pricingFields}</div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validity</CardTitle>
        </CardHeader>
        <div className="p-4 pt-0">{validityFields}</div>
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
