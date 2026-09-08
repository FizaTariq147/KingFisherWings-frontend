import { useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { useAppForm } from '@/lib/validation';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import type { JobType } from '../constants/quotation.constants';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import { useCreateOnlineQuote } from '../hooks/useQuotations';
import { createOnlineQuoteSchema } from '../schemas/quotation.schema';
import type { CreateOnlineQuoteFormValues } from '../types/quotation.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { quotationDisplayNumber } from '../utils/normalizeQuotation';
import {
  JobTypeSelectGrid,
  QuotationWizardNav,
  QuotationWizardStepper,
} from '../components/quotation-wizard';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

const labelClass = 'text-xs font-medium text-[var(--color-neutral-500)]';

const PORT_FIELDS: (keyof CreateOnlineQuoteFormValues)[] = [
  'tenant_slug',
  'contact_name',
  'contact_email',
  'origin_port_id',
  'dest_port_id',
  'currency_code',
  'valid_until',
];

export default function QuotationOnlineQuotePage() {
  const navigate = useNavigate();
  const create = useCreateOnlineQuote();
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [step, setStep] = useState(0);

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

  const submitQuote = handleValidatedSubmit(async (values) => {
    setError(null);
    setResultMsg(null);
    try {
      const q = await create.mutateAsync(values);
      const label =
        q && typeof q === 'object' && 'id' in q
          ? quotationDisplayNumber(q as Parameters<typeof quotationDisplayNumber>[0])
          : 'Quote created';
      setResultMsg(`${label} created via online-quote.`);
      if (q && typeof q === 'object' && 'id' in q) {
        navigate(`/quotations/${(q as { id: string }).id}`);
      }
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
    if (step === 0) {
      const ok = await trigger('job_type');
      if (!ok || !jobType) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(PORT_FIELDS);
      if (!ok) return;
      setStep(2);
      return;
    }
    await submitQuote();
  };

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

        {step === 0 ? (
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

        {step === 1 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-4">
                <Input
                  label="Tenant slug *"
                  error={errors.tenant_slug?.message as string | undefined}
                  {...register('tenant_slug')}
                />
                <Input label="Contact name" {...register('contact_name')} />
                <Input label="Contact email" type="email" {...register('contact_email')} />
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
                <Input label="Currency *" {...register('currency_code')} />
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

        {step === 2 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-neutral-800)]">
              Planned Container / Consignment
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Commodity" {...register('commodity')} />
              <Input
                label="Gross weight"
                type="number"
                step="any"
                {...register('gross_weight', { valueAsNumber: true })}
              />
              <Input
                label="Volume (CBM)"
                type="number"
                step="any"
                {...register('volume_cbm', { valueAsNumber: true })}
              />
              <Input
                label="Pieces"
                type="number"
                step="any"
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
              </div>
            </div>
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={() => navigate('/quotations')}
          onNext={() => void goNext()}
          isSubmitting={create.isPending}
          nextLabel={step === 2 ? 'Request online quote' : 'Next'}
          disableNext={step === 0 && !jobType}
        />
      </form>
    </div>
  );
}
