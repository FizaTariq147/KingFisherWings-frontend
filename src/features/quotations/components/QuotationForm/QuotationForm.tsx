import { useEffect, useRef, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
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
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { loadPartyCurrencyOptions } from '@/features/parties/utils/partyCurrencyOptions';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import {
  INCOTERMS,
  JOB_TYPE_LABELS,
  JOB_TYPES,
  type JobType,
} from '../../constants/quotation.constants';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import { createQuotationSchema, updateQuotationSchema } from '../../schemas/quotation.schema';
import type { CreateQuotationFormValues, UpdateQuotationFormValues } from '../../types/quotation.types';
import { QUOTATION_FORM_DEFAULTS } from '../../utils/quotationToFormValues';
import {
  JobTypeSelectGrid,
  QuotationWizardCostingPanel,
  QuotationWizardNav,
  QuotationWizardStepper,
  toCostingPayload,
  type QuotationDraftChargeLine,
} from '../quotation-wizard';
import {
  QUOTATION_WIZARD_STEPS,
  isQuotationWizardLastStep,
  quotationWizardStepKey,
} from '../../constants/jobTypeCardStyles';
import type { QuotationWizardCostingPayload } from '../../types/quotationWizardCosting.types';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

const PORT_STEP_FIELDS: (keyof CreateQuotationFormValues)[] = [
  'company_id',
  'branch_id',
  'department_id',
  'customer_id',
  'salesperson_id',
  'carrier_id',
  'origin_port_id',
  'dest_port_id',
  'incoterm',
  'valid_until',
  'transit_time_days',
  'remarks',
  'routing_notes',
  'carrier_preference',
];

const COSTING_STEP_FIELDS: (keyof CreateQuotationFormValues)[] = [
  'currency_code',
  'exchange_rate',
  'discount_percent',
  'discount_amount',
];

const CONSIGNMENT_STEP_FIELDS: (keyof CreateQuotationFormValues)[] = [
  'container_type_id',
  'container_count',
  'pieces',
  'commodity',
  'hs_code',
  'gross_weight',
  'chargeable_weight',
  'volume_cbm',
  'is_dg',
  'dg_class',
  'special_requirements',
  'internal_notes',
];

/** Fields to validate before leaving a step. Summary only triggers full submit. */
const WIZARD_STEP_VALIDATE: Partial<
  Record<(typeof QUOTATION_WIZARD_STEPS)[number]['key'], (keyof CreateQuotationFormValues)[]>
> = {
  create: ['job_type'],
  ports: PORT_STEP_FIELDS,
  consignment: CONSIGNMENT_STEP_FIELDS,
  costing: COSTING_STEP_FIELDS,
};
interface QuotationFormProps {
  mode: 'create' | 'edit';
  /** `wizard` = FRESA-like 5-step create UI; `flat` = existing single-page (edit default). */
  layout?: 'flat' | 'wizard';
  defaultValues?: Partial<CreateQuotationFormValues>;
  onSubmit: (
    values: CreateQuotationFormValues | UpdateQuotationFormValues,
    options?: { costing?: QuotationWizardCostingPayload },
  ) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onValuesChange?: (values: CreateQuotationFormValues) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-[var(--color-danger-500)]">{message}</p>;
}

export function QuotationForm({
  mode,
  layout = 'flat',
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  onValuesChange,
}: QuotationFormProps) {
  const isWizard = layout === 'wizard' && mode === 'create';
  const [step, setStep] = useState(0);
  const [draftLines, setDraftLines] = useState<QuotationDraftChargeLine[]>([]);
  const [applyTariffAfterCreate, setApplyTariffAfterCreate] = useState(false);
  const schema = mode === 'create' ? createQuotationSchema : updateQuotationSchema;
  const { data: companies = [] } = useTenantCompanies(true);
  const {
    data: customersResult,
    isLoading: customersLoading,
    isError: customersError,
    error: customersErr,
  } = useParties({
    page: 1,
    limit: 100,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const { data: carriersResult } = useParties({
    page: 1,
    limit: 100,
    order: 'asc',
  });
  const {
    register,
    control,
    handleValidatedSubmit,
    applyApiErrors,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useAppForm<CreateQuotationFormValues>({
    resolver: zodResolver(schema) as Resolver<CreateQuotationFormValues>,
    defaultValues: { ...QUOTATION_FORM_DEFAULTS, ...defaultValues },
  });

  const watched = watch();
  const useAirports = isAirJobType(watched.job_type);
  const { data: containers = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'parties', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const customers = (customersResult?.parties ?? []).filter((p) => isUuid(p.id));
  const carrierTypes = new Set(['AIRLINE', 'SHIPPING_LINE', 'TRUCKER', 'CARRIER', 'TRANSPORTER']);
  const carriersFiltered = (carriersResult?.parties ?? []).filter(
    (p) => isUuid(p.id) && carrierTypes.has(String(p.party_type)),
  );
  const carriers =
    carriersFiltered.length > 0
      ? carriersFiltered
      : (carriersResult?.parties ?? []).filter((p) => isUuid(p.id));

  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;
  useEffect(() => {
    onValuesChangeRef.current?.(watched);
  }, [watched]);

  useEffect(() => {
    if (watched.company_id) return;
    const first = companies.find((c) => isUuid(c.id));
    if (first) setValue('company_id', first.id);
  }, [companies, watched.company_id, setValue]);

  const fieldError = (name: keyof CreateQuotationFormValues) =>
    errors[name]?.message as string | undefined;

  const companyOptions = companies
    .filter((c) => isUuid(c.id))
    .map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ));

  const branchOptions = branches
    .filter((b) => isUuid(String(b.id)))
    .map((b) => (
      <option key={String(b.id)} value={String(b.id)}>
        {String(b.name ?? b.code ?? b.id)}
      </option>
    ));

  const departmentOptions = departments
    .filter((d) => isUuid(String(d.id)))
    .map((d) => (
      <option key={String(d.id)} value={String(d.id)}>
        {String(d.name ?? d.code ?? d.id)}
      </option>
    ));

  const containerOptions = containers
    .filter((c) => isUuid(String(c.id)))
    .map((c) => (
      <option key={String(c.id)} value={String(c.id)}>
        {String(c.code ?? c.name ?? c.id)}
      </option>
    ));

  const submitForm = handleValidatedSubmit(async (values) => {
    try {
      const costing =
        isWizard
          ? toCostingPayload(draftLines, applyTariffAfterCreate)
          : undefined;
      await onSubmit(values, costing ? { costing } : undefined);
    } catch (err) {
      applyApiErrors(err);
      throw err;
    }
  });

  const wizardStepKey = quotationWizardStepKey(step);

  /** Advance UI steps only; POST create runs solely on the final wizard step. */
  const goNext = async () => {
    if (isQuotationWizardLastStep(step)) {
      await submitForm();
      return;
    }

    const key = quotationWizardStepKey(step);
    const fields = key ? WIZARD_STEP_VALIDATE[key] : undefined;
    if (fields?.length) {
      const ok = await trigger(fields);
      if (!ok) return;
      if (key === 'create' && !watched.job_type) return;
    }

    setStep((current) => Math.min(current + 1, QUOTATION_WIZARD_STEPS.length - 1));
  };
  const labelForCustomer = (id?: string) => {
    if (!id) return '—';
    const party = customers.find((c) => c.id === id);
    if (!party) return id;
    return party.code ? `${party.name} (${party.code})` : party.name;
  };

  const labelForCarrier = (id?: string) => {
    if (!id) return '—';
    return carriers.find((c) => c.id === id)?.name || id;
  };

  const labelForCompany = (id?: string) => {
    if (!id) return '—';
    return companies.find((c) => c.id === id)?.name || id;
  };

  const labelForContainer = (id?: string) => {
    if (!id) return '—';
    const row = containers.find((c) => String(c.id) === id);
    return row ? String(row.code ?? row.name ?? row.id) : id;
  };

  const currencyLabel =
    currencies.find((c) => c.value === watched.currency_code)?.label ||
    watched.currency_code ||
    '—';

  const customerBlock = (
    <>
      <div className="space-y-1">
        <label htmlFor="customer_id" className={labelClass}>
          Customer <span className="text-[var(--color-danger-500)]">*</span>
        </label>
        <select id="customer_id" className={selectClass} {...register('customer_id')}>
          <option value="">{customersLoading ? 'Loading customers…' : 'Select customer…'}</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code ? `${c.name} (${c.code})` : c.name}
            </option>
          ))}
        </select>
        <FieldError message={fieldError('customer_id')} />
        {customersError ? (
          <p className="text-xs text-[var(--color-danger-600)]">
            Could not load customers: {getErrorMessage(customersErr)}
          </p>
        ) : null}
        {!customersLoading && !customersError && customers.length === 0 ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            No customers found. Create one under{' '}
            <Link className="font-medium underline" to="/parties/new">
              Parties → New party
            </Link>
            , set <strong>Party type = Customer</strong>, then return here.
          </p>
        ) : null}
      </div>
    </>
  );

  const placeFields = (
    <>
      <Controller
        name="origin_port_id"
        control={control}
        render={({ field }) => (
          <MasterPlaceSelect
            name="origin_port_id"
            label={useAirports ? 'Origin airport' : 'Origin'}
            value={field.value ?? ''}
            onChange={field.onChange}
            jobType={watched.job_type}
            excludeId={watched.dest_port_id}
            error={fieldError('origin_port_id')}
          />
        )}
      />
      <Controller
        name="dest_port_id"
        control={control}
        render={({ field }) => (
          <MasterPlaceSelect
            name="dest_port_id"
            label={useAirports ? 'Destination airport' : 'Destination'}
            value={field.value ?? ''}
            onChange={field.onChange}
            jobType={watched.job_type}
            excludeId={watched.origin_port_id}
            error={fieldError('dest_port_id')}
          />
        )}
      />
    </>
  );

  if (isWizard) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="mx-auto max-w-5xl space-y-6"
      >
        <QuotationWizardStepper currentStep={step} />

        {wizardStepKey === 'create' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <JobTypeSelectGrid
              value={watched.job_type}
              onChange={(jobType: JobType) =>
                setValue('job_type', jobType, { shouldValidate: true, shouldDirty: true })
              }
              error={fieldError('job_type')}
            />
          </div>
        ) : null}

        {wizardStepKey === 'ports' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="branch_id" className={labelClass}>
                    Branch
                  </label>
                  <select id="branch_id" className={selectClass} {...register('branch_id')}>
                    <option value="">Select…</option>
                    {branchOptions}
                  </select>
                </div>
                {customerBlock}
                <div className="space-y-1">
                  <label htmlFor="company_id" className={labelClass}>
                    Company <span className="text-[var(--color-danger-500)]">*</span>
                  </label>
                  <select id="company_id" className={selectClass} {...register('company_id')}>
                    <option value="">Select…</option>
                    {companyOptions}
                  </select>
                  <FieldError message={fieldError('company_id')} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="incoterm" className={labelClass}>
                    INCO Terms
                  </label>
                  <select id="incoterm" className={selectClass} {...register('incoterm')}>
                    <option value="">Select…</option>
                    {INCOTERMS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Transit time (days)"
                  type="number"
                  error={fieldError('transit_time_days')}
                  {...register('transit_time_days', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="department_id" className={labelClass}>
                    Department
                  </label>
                  <select id="department_id" className={selectClass} {...register('department_id')}>
                    <option value="">Select…</option>
                    {departmentOptions}
                  </select>
                </div>
                {placeFields}
                <div className="space-y-1">
                  <label htmlFor="valid_until" className={labelClass}>
                    Valid To
                  </label>
                  <input
                    id="valid_until"
                    type="date"
                    className={selectClass}
                    {...register('valid_until')}
                  />
                  <FieldError message={fieldError('valid_until')} />
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Salesperson ID"
                  error={fieldError('salesperson_id')}
                  placeholder="Optional user UUID"
                  {...register('salesperson_id')}
                />
                <div className="space-y-1">
                  <label htmlFor="carrier_id" className={labelClass}>
                    Carrier
                  </label>
                  <select id="carrier_id" className={selectClass} {...register('carrier_id')}>
                    <option value="">Select…</option>
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Carrier preference"
                  error={fieldError('carrier_preference')}
                  {...register('carrier_preference')}
                />
                <div className="space-y-1">
                  <label htmlFor="remarks" className={labelClass}>
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                    {...register('remarks')}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="routing_notes" className={labelClass}>
                    Routing notes
                  </label>
                  <textarea
                    id="routing_notes"
                    className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                    {...register('routing_notes')}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {wizardStepKey === 'consignment' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-800)]">
              Planned Container / Consignment
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label htmlFor="container_type_id" className={labelClass}>
                  Container type
                </label>
                <select
                  id="container_type_id"
                  className={selectClass}
                  {...register('container_type_id')}
                >
                  <option value="">Select…</option>
                  {containerOptions}
                </select>
              </div>
              <Input
                label="No of Container"
                type="number"
                error={fieldError('container_count')}
                {...register('container_count', { valueAsNumber: true })}
              />
              <Input
                label="No of Packages / Pieces"
                type="number"
                error={fieldError('pieces')}
                {...register('pieces', { valueAsNumber: true })}
              />
              <Input label="Commodity" error={fieldError('commodity')} {...register('commodity')} />
              <Input label="HS code" error={fieldError('hs_code')} {...register('hs_code')} />
              <Input
                label="Gross weight"
                type="number"
                step="any"
                error={fieldError('gross_weight')}
                {...register('gross_weight', { valueAsNumber: true })}
              />
              <Input
                label="Chargeable weight"
                type="number"
                step="any"
                error={fieldError('chargeable_weight')}
                {...register('chargeable_weight', { valueAsNumber: true })}
              />
              <Input
                label="Volume (CBM)"
                type="number"
                step="any"
                error={fieldError('volume_cbm')}
                {...register('volume_cbm', { valueAsNumber: true })}
              />
              <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] sm:mt-6">
                <input type="checkbox" {...register('is_dg')} />
                Dangerous goods
              </label>
              <Input label="DG class" error={fieldError('dg_class')} {...register('dg_class')} />
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label htmlFor="special_requirements" className={labelClass}>
                  Description / Special requirements
                </label>
                <textarea
                  id="special_requirements"
                  className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  {...register('special_requirements')}
                />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label htmlFor="internal_notes" className={labelClass}>
                  Internal notes
                </label>
                <textarea
                  id="internal_notes"
                  className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  {...register('internal_notes')}
                />
              </div>
            </div>
          </div>
        ) : null}

        {wizardStepKey === 'costing' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                Costing / Charges
              </h3>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
                Set currency and discounts, then add charge lines. After create, the same Charges tab
                on the quotation detail page keeps working as today (add, edit, apply tariff).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="currency_code" className={labelClass}>
                  Currency <span className="text-[var(--color-danger-500)]">*</span>
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
                label="Exchange rate"
                type="number"
                step="any"
                error={fieldError('exchange_rate')}
                {...register('exchange_rate', { valueAsNumber: true })}
              />
              <Input
                label="Discount %"
                type="number"
                step="any"
                error={fieldError('discount_percent')}
                {...register('discount_percent', { valueAsNumber: true })}
              />
              <Input
                label="Discount amount"
                type="number"
                step="any"
                error={fieldError('discount_amount')}
                {...register('discount_amount', { valueAsNumber: true })}
              />
            </div>
            <QuotationWizardCostingPanel
              currencyCode={watched.currency_code || 'AED'}
              lines={draftLines}
              applyTariff={applyTariffAfterCreate}
              onLinesChange={setDraftLines}
              onApplyTariffChange={setApplyTariffAfterCreate}
            />
          </div>
        ) : null}

        {wizardStepKey === 'summary' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Summary</h3>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Job type</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {JOB_TYPE_LABELS[watched.job_type as JobType] ?? watched.job_type}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Customer</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {labelForCustomer(watched.customer_id)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Company</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {labelForCompany(watched.company_id)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Carrier</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {labelForCarrier(watched.carrier_id)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Incoterm</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.incoterm || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Valid until</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.valid_until || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Commodity</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.commodity || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Container</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    labelForContainer(watched.container_type_id) !== '—'
                      ? labelForContainer(watched.container_type_id)
                      : null,
                    watched.container_count != null ? `× ${watched.container_count}` : null,
                  ]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Pieces / weight / volume</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    watched.pieces != null ? `${watched.pieces} pcs` : null,
                    watched.gross_weight != null ? `${watched.gross_weight} kg` : null,
                    watched.volume_cbm != null ? `${watched.volume_cbm} CBM` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Currency / discount</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    currencyLabel,
                    watched.discount_percent != null && !Number.isNaN(watched.discount_percent)
                      ? `${watched.discount_percent}%`
                      : null,
                    watched.discount_amount != null && !Number.isNaN(watched.discount_amount)
                      ? `amt ${watched.discount_amount}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Costing</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    applyTariffAfterCreate ? 'Apply tariff' : null,
                    draftLines.length
                      ? `${draftLines.length} draft line${draftLines.length === 1 ? '' : 's'}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Header currency only'}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          totalSteps={QUOTATION_WIZARD_STEPS.length}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={onCancel}
          onNext={() => void goNext()}
          isSubmitting={isSubmitting}
          submitLabel="Create quotation"
          disableNext={wizardStepKey === 'create' && !watched.job_type}
        />
      </form>
    );
  }

  return (
    <form onSubmit={submitForm} className="space-y-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="job_type" className={labelClass}>
              Job type *
            </label>
            <select id="job_type" className={selectClass} {...register('job_type')}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <FieldError message={fieldError('job_type')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="valid_until" className={labelClass}>
              Valid until
            </label>
            <input id="valid_until" type="date" className={selectClass} {...register('valid_until')} />
            <FieldError message={fieldError('valid_until')} />
          </div>
          <div className="space-y-1">
            <label htmlFor="company_id" className={labelClass}>
              Company <span className="text-[var(--color-danger-500)]">*</span>
            </label>
            <select id="company_id" className={selectClass} {...register('company_id')}>
              <option value="">Select…</option>
              {companyOptions}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="branch_id" className={labelClass}>
              Branch
            </label>
            <select id="branch_id" className={selectClass} {...register('branch_id')}>
              <option value="">Select…</option>
              {branchOptions}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="department_id" className={labelClass}>
              Department
            </label>
            <select id="department_id" className={selectClass} {...register('department_id')}>
              <option value="">Select…</option>
              {departmentOptions}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <div className="sm:col-span-2">{customerBlock}</div>
          <Input
            label="Salesperson ID"
            error={fieldError('salesperson_id')}
            placeholder="Optional user UUID"
            {...register('salesperson_id')}
          />
          <div className="space-y-1">
            <label htmlFor="carrier_id" className={labelClass}>
              Carrier
            </label>
            <select id="carrier_id" className={selectClass} {...register('carrier_id')}>
              <option value="">Select…</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipment information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          {placeFields}
          <div className="space-y-1">
            <label htmlFor="incoterm" className={labelClass}>
              Incoterm
            </label>
            <select id="incoterm" className={selectClass} {...register('incoterm')}>
              <option value="">Select…</option>
              {INCOTERMS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <Input label="Commodity" error={fieldError('commodity')} {...register('commodity')} />
          <Input label="HS code" error={fieldError('hs_code')} {...register('hs_code')} />
          <Input
            label="Gross weight"
            type="number"
            step="any"
            error={fieldError('gross_weight')}
            {...register('gross_weight', { valueAsNumber: true })}
          />
          <Input
            label="Chargeable weight"
            type="number"
            step="any"
            error={fieldError('chargeable_weight')}
            {...register('chargeable_weight', { valueAsNumber: true })}
          />
          <Input
            label="Volume (CBM)"
            type="number"
            step="any"
            error={fieldError('volume_cbm')}
            {...register('volume_cbm', { valueAsNumber: true })}
          />
          <Input
            label="Pieces"
            type="number"
            error={fieldError('pieces')}
            {...register('pieces', { valueAsNumber: true })}
          />
          <Input
            label="Container count"
            type="number"
            error={fieldError('container_count')}
            {...register('container_count', { valueAsNumber: true })}
          />
          <div className="space-y-1">
            <label htmlFor="container_type_id" className={labelClass}>
              Container type
            </label>
            <select id="container_type_id" className={selectClass} {...register('container_type_id')}>
              <option value="">Select…</option>
              {containerOptions}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)] mt-6">
            <input type="checkbox" {...register('is_dg')} />
            Dangerous goods
          </label>
          <Input label="DG class" error={fieldError('dg_class')} {...register('dg_class')} />
          <Input
            label="Transit time (days)"
            type="number"
            error={fieldError('transit_time_days')}
            {...register('transit_time_days', { valueAsNumber: true })}
          />
          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="special_requirements" className={labelClass}>
              Special requirements
            </label>
            <textarea
              id="special_requirements"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('special_requirements')}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
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
            label="Exchange rate"
            type="number"
            step="any"
            error={fieldError('exchange_rate')}
            {...register('exchange_rate', { valueAsNumber: true })}
          />
          <Input
            label="Discount %"
            type="number"
            step="any"
            error={fieldError('discount_percent')}
            {...register('discount_percent', { valueAsNumber: true })}
          />
          <Input
            label="Discount amount"
            type="number"
            step="any"
            error={fieldError('discount_amount')}
            {...register('discount_amount', { valueAsNumber: true })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 p-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="remarks" className={labelClass}>
              Remarks
            </label>
            <textarea
              id="remarks"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('remarks')}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="internal_notes" className={labelClass}>
              Internal notes
            </label>
            <textarea
              id="internal_notes"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('internal_notes')}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="routing_notes" className={labelClass}>
              Routing notes
            </label>
            <textarea
              id="routing_notes"
              className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...register('routing_notes')}
            />
          </div>
          <Input
            label="Carrier preference"
            error={fieldError('carrier_preference')}
            {...register('carrier_preference')}
          />
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create quotation' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
