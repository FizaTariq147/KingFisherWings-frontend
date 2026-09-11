import { useMemo, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useAppForm } from '@/lib/validation';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useTariffs } from '@/features/tariffs/hooks/useTariffs';
import type { JobType } from '../constants/quotation.constants';
import { JOB_TYPE_LABELS } from '../constants/quotation.constants';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import { useCreateOnlineQuote } from '../hooks/useQuotations';
import { quotationService } from '../services/quotation.service';
import { createOnlineQuoteSchema } from '../schemas/quotation.schema';
import type { CreateOnlineQuoteFormValues } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  matchOnlineQuoteTariffs,
  tariffChargeLabel,
} from '../utils/matchOnlineQuoteTariffs';
import { quotationDisplayNumber } from '../utils/normalizeQuotation';
import {
  JobTypeSelectGrid,
  OnlineQuoteCostingPanel,
  QuotationWizardNav,
  QuotationWizardStepper,
} from '../components/quotation-wizard';
import {
  QUOTATION_WIZARD_STEPS,
  isQuotationWizardLastStep,
  quotationWizardStepKey,
} from '../constants/jobTypeCardStyles';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

const PORT_FIELDS: (keyof CreateOnlineQuoteFormValues)[] = [
  'tenant_slug',
  'contact_name',
  'contact_email',
  'origin_port_id',
  'dest_port_id',
  'valid_until',
];

const CONSIGNMENT_FIELDS: (keyof CreateOnlineQuoteFormValues)[] = [
  'commodity',
  'gross_weight',
  'chargeable_weight',
  'volume_cbm',
  'pieces',
  'container_type_id',
  'special_requirements',
];

const COSTING_FIELDS: (keyof CreateOnlineQuoteFormValues)[] = ['currency_code'];

const ONLINE_WIZARD_STEP_VALIDATE: Partial<
  Record<(typeof QUOTATION_WIZARD_STEPS)[number]['key'], (keyof CreateOnlineQuoteFormValues)[]>
> = {
  create: ['job_type'],
  ports: PORT_FIELDS,
  consignment: CONSIGNMENT_FIELDS,
  costing: COSTING_FIELDS,
};

export default function QuotationOnlineQuotePage() {
  const navigate = useNavigate();
  const create = useCreateOnlineQuote();
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [applyingTariff, setApplyingTariff] = useState(false);
  const { data: containers = [] } = useMasterOptions(
    'container-types',
    MASTER_PATHS['container-types'],
    true,
  );
  const tariffsQuery = useTariffs({ page: 1, limit: 200, is_active: true, order: 'desc' });

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    handleValidatedSubmit,
    applyApiErrors,
    formState: { errors },
  } = useAppForm<CreateOnlineQuoteFormValues>({
    resolver: zodResolver(createOnlineQuoteSchema) as Resolver<CreateOnlineQuoteFormValues>,
    defaultValues: {
      tenant_slug: '',
      job_type: 'SEA_FCL_EXPORT',
      currency_code: 'AED',
      contact_name: '',
      contact_email: '',
    },
  });

  const jobType = watch('job_type');
  const useAirports = isAirJobType(jobType);
  const originPortId = watch('origin_port_id');
  const destPortId = watch('dest_port_id');
  const currencyCode = watch('currency_code');
  const containerTypeId = watch('container_type_id');
  const watched = watch();

  const matchedTariffs = useMemo(
    () =>
      matchOnlineQuoteTariffs(tariffsQuery.data?.tariffs ?? [], {
        jobType,
        originPortId,
        destPortId,
        containerTypeId,
        currencyCode,
      }),
    [
      tariffsQuery.data?.tariffs,
      jobType,
      originPortId,
      destPortId,
      containerTypeId,
      currencyCode,
    ],
  );

  const laneReady = Boolean(jobType && originPortId && destPortId);

  const submitQuote = handleValidatedSubmit(async (values) => {
    setError(null);
    setResultMsg(null);
    try {
      let q = await create.mutateAsync(values);
      const hasLines = Array.isArray(q.lines) && q.lines.length > 0;

      // Online quote is tariff-driven: ensure charge line(s) via apply-tariff when header has none.
      if (!hasLines && q.id) {
        setApplyingTariff(true);
        try {
          q = await quotationService.applyTariff(q.id);
        } catch (tariffErr) {
          // Quote still created — surface warning but navigate.
          setResultMsg(
            `${quotationDisplayNumber(q)} created. Apply tariff: ${getErrorMessage(tariffErr)}`,
          );
        } finally {
          setApplyingTariff(false);
        }
      }

      const label = quotationDisplayNumber(q);
      const lineCount = q.lines?.length ?? 0;
      setResultMsg(
        lineCount > 0
          ? `${label} created with ${lineCount} charge line${lineCount === 1 ? '' : 's'} from tariff.`
          : `${label} created via online-quote.`,
      );
      navigate(`/quotations/${q.id}`);
    } catch (err) {
      applyApiErrors(err);
      const msg = getErrorMessage(err);
      setError(msg);
      if (/accepted by the server/i.test(msg)) {
        setResultMsg('Request accepted. Check All Quotations for the new draft.');
      }
    }
  });

  const goNext = async () => {
    if (isQuotationWizardLastStep(step)) {
      await submitQuote();
      return;
    }

    const key = quotationWizardStepKey(step);
    const fields = key ? ONLINE_WIZARD_STEP_VALIDATE[key] : undefined;
    if (fields?.length) {
      const ok = await trigger(fields);
      if (!ok) return;
      if (key === 'create' && !jobType) return;
    }

    setStep((current) => Math.min(current + 1, QUOTATION_WIZARD_STEPS.length - 1));
  };

  const wizardStepKey = quotationWizardStepKey(step);
  const containerLabel = (() => {
    const id = watched.container_type_id;
    if (!id) return null;
    const match = containers.find((c) => String(c.id) === id);
    return match ? String(match.code ?? match.name ?? id) : id;
  })();

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate('/quotations')}
      >
        ← Quotations
      </button>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--color-neutral-800)]">Online Quote</h2>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {error}
        </div>
      )}
      {resultMsg && (
        <div
          role="status"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-success-100)',
            borderColor: '#BBF7D0',
            color: 'var(--color-success-700)',
          }}
        >
          {resultMsg}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="space-y-6"
      >
        <QuotationWizardStepper currentStep={step} />

        {wizardStepKey === 'create' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <JobTypeSelectGrid
              value={jobType}
              onChange={(jt: JobType) =>
                setValue('job_type', jt, { shouldValidate: true, shouldDirty: true })
              }
              error={errors.job_type?.message as string | undefined}
            />
          </div>
        ) : null}

        {wizardStepKey === 'ports' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <Input
                  label="Tenant slug *"
                  error={errors.tenant_slug?.message as string | undefined}
                  {...register('tenant_slug')}
                />
                <Input
                  label="Contact name *"
                  error={errors.contact_name?.message as string | undefined}
                  {...register('contact_name')}
                />
                <Input
                  label="Contact email *"
                  type="email"
                  error={errors.contact_email?.message as string | undefined}
                  {...register('contact_email')}
                />
              </div>
              <div className="space-y-4">
                <Controller
                  name="origin_port_id"
                  control={control}
                  render={({ field }) => (
                    <MasterPlaceSelect
                      name="origin_port_id"
                      label={useAirports ? 'Origin airport' : 'Origin'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      jobType={jobType}
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
                      label={useAirports ? 'Destination airport' : 'Destination'}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      jobType={jobType}
                      excludeId={originPortId}
                    />
                  )}
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="valid_until" className={labelClass}>
                    Valid until
                  </label>
                  <input
                    id="valid_until"
                    type="date"
                    className={selectClass}
                    {...register('valid_until')}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Commodity"
                error={errors.commodity?.message as string | undefined}
                {...register('commodity')}
              />
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
                  {containers
                    .filter((c) => isUuid(String(c.id)))
                    .map((c) => (
                      <option key={String(c.id)} value={String(c.id)}>
                        {String(c.code ?? c.name ?? c.id)}
                      </option>
                    ))}
                </select>
                {errors.container_type_id?.message ? (
                  <p className="text-xs text-[var(--color-danger-600)]">
                    {String(errors.container_type_id.message)}
                  </p>
                ) : null}
              </div>
              <Input
                label="Gross weight"
                type="number"
                step="any"
                error={errors.gross_weight?.message as string | undefined}
                {...register('gross_weight', { valueAsNumber: true })}
              />
              <Input
                label="Chargeable weight"
                type="number"
                step="any"
                error={errors.chargeable_weight?.message as string | undefined}
                {...register('chargeable_weight', { valueAsNumber: true })}
              />
              <Input
                label="Volume (CBM)"
                type="number"
                step="any"
                error={errors.volume_cbm?.message as string | undefined}
                {...register('volume_cbm', { valueAsNumber: true })}
              />
              <Input
                label="Pieces"
                type="number"
                step="any"
                error={errors.pieces?.message as string | undefined}
                {...register('pieces', { valueAsNumber: true })}
              />
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="special_requirements" className={labelClass}>
                  Description / Special requirements
                </label>
                <textarea
                  id="special_requirements"
                  className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  {...register('special_requirements')}
                />
                {errors.special_requirements?.message ? (
                  <p className="text-xs text-[var(--color-danger-600)]">
                    {String(errors.special_requirements.message)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {wizardStepKey === 'costing' ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <OnlineQuoteCostingPanel
              currencyCode={currencyCode || 'AED'}
              currencyError={errors.currency_code?.message as string | undefined}
              onCurrencyChange={(value) =>
                setValue('currency_code', value, { shouldValidate: true, shouldDirty: true })
              }
              matchedTariffs={matchedTariffs}
              loading={tariffsQuery.isLoading}
              error={
                tariffsQuery.isError
                  ? getErrorMessage(tariffsQuery.error) || 'Could not load Online Tariff Master.'
                  : null
              }
              laneReady={laneReady}
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
                  {JOB_TYPE_LABELS[jobType as JobType] ?? jobType ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Tenant</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.tenant_slug || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Contact</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[watched.contact_name, watched.contact_email].filter(Boolean).join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Valid until</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.valid_until || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Route</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[watched.origin_port_id, watched.dest_port_id].filter(Boolean).join(' → ') ||
                    '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Currency</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.currency_code || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Container</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {containerLabel || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Commodity</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {watched.commodity || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-neutral-500)]">Weight / volume / pieces</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {[
                    watched.gross_weight != null ? `${watched.gross_weight} kg` : null,
                    watched.chargeable_weight != null
                      ? `chg ${watched.chargeable_weight} kg`
                      : null,
                    watched.volume_cbm != null ? `${watched.volume_cbm} CBM` : null,
                    watched.pieces != null ? `${watched.pieces} pcs` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--color-neutral-500)]">Tariff charge lines</dt>
                <dd className="font-medium text-[var(--color-neutral-800)]">
                  {matchedTariffs.length === 0
                    ? 'No matched Online Tariff Master rates (apply-tariff will still run after create).'
                    : matchedTariffs
                        .map(
                          (t) =>
                            `${tariffChargeLabel(t)} @ ${t.currency_code} ${Number(t.sale_rate).toLocaleString()}`,
                        )
                        .join(' · ')}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          totalSteps={QUOTATION_WIZARD_STEPS.length}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={() => navigate('/quotations')}
          onNext={() => void goNext()}
          isSubmitting={create.isPending || applyingTariff}
          submitLabel="Request online quote"
          disableNext={wizardStepKey === 'create' && !jobType}
        />
      </form>
    </div>
  );
}
