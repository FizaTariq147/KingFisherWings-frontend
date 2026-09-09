import { useEffect, useRef, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { resolveLocaleCatalog } from '@/lib/locale';
import { useAppForm } from '@/lib/validation';
import { QuotationWizardNav } from '@/features/quotations/components/quotation-wizard';
import { COMPANY_CREATE_WIZARD_STEPS } from '../../constants/companyWizard.constants';
import { createCompanySchema, updateCompanySchema } from '../../schemas/company.schema';
import type { CreateCompanyFormValues, UpdateCompanyFormValues } from '../../types/company.types';
import { CompanyWizardStepper } from '../company-wizard';

interface CompanyFormProps {
  mode: 'create' | 'edit';
  /** `wizard` = create multi-step UI; `flat` = edit / default. */
  layout?: 'flat' | 'wizard';
  defaultValues?: Partial<CreateCompanyFormValues>;
  onSubmit: (values: CreateCompanyFormValues | UpdateCompanyFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const CREATE_DEFAULTS: Partial<CreateCompanyFormValues> = {
  country_code: 'AE',
  phone: '',
  is_default: false,
  is_active: true,
  legal_name: '',
  registration_number: '',
  vat_number: '',
};

const DETAILS_FIELDS: (keyof CreateCompanyFormValues)[] = [
  'code',
  'name',
  'legal_name',
  'registration_number',
  'vat_number',
];

const CONTACT_FIELDS: (keyof CreateCompanyFormValues)[] = [
  'address',
  'city',
  'country_code',
  'phone',
  'email',
];

export function CompanyForm({
  mode,
  layout = 'flat',
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: CompanyFormProps) {
  const isWizard = layout === 'wizard' && mode === 'create';
  const [step, setStep] = useState(0);
  const schema = mode === 'create' ? createCompanySchema : updateCompanySchema;
  const form = useAppForm<CreateCompanyFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CreateCompanyFormValues>,
    defaultValues: {
      ...(mode === 'create' ? CREATE_DEFAULTS : {}),
      ...defaultValues,
    },
  });

  const {
    register,
    handleValidatedSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = form;

  const fieldError = (name: keyof CreateCompanyFormValues) => errors[name]?.message;
  const countryCode = watch('country_code') ?? '';
  const phone = watch('phone') ?? '';
  const watched = watch();
  const locale = resolveLocaleCatalog(countryCode);
  const skipPhoneClear = useRef(true);

  useEffect(() => {
    if (skipPhoneClear.current) {
      skipPhoneClear.current = false;
      return;
    }
    if (!(phone || '').trim()) {
      setValue('phone', '', { shouldDirty: true });
    }
  }, [countryCode, phone, setValue]);

  const submitForm = handleValidatedSubmit(async (values) => {
    await onSubmit(values);
  });

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger(DETAILS_FIELDS);
      if (!ok) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger(CONTACT_FIELDS);
      if (!ok) return;
      setStep(2);
      return;
    }
    await submitForm();
  };

  const detailsFields = (
    <Grid>
      {mode === 'create' && (
        <Input
          label="Company code *"
          error={fieldError('code')}
          className="font-mono uppercase"
          {...register('code')}
        />
      )}
      <Input label="Company name *" error={fieldError('name')} {...register('name')} />
      <Input label="Legal name" error={fieldError('legal_name')} {...register('legal_name')} />
      <Input
        label="Registration number"
        error={fieldError('registration_number')}
        {...register('registration_number')}
      />
      <Input
        label={locale?.taxIdLabel ?? 'VAT / TRN'}
        error={fieldError('vat_number')}
        {...register('vat_number')}
      />
    </Grid>
  );

  const contactFields = (
    <Grid>
      <Input label="Address *" error={fieldError('address')} {...register('address')} />
      <Input label="City *" error={fieldError('city')} {...register('city')} />
      <CountrySelect
        label="Country *"
        required
        allowEmpty={false}
        name="country_code"
        value={countryCode}
        error={fieldError('country_code')}
        onChange={(iso) => {
          setValue('country_code', iso, { shouldValidate: true, shouldDirty: true });
        }}
      />
      <PhoneInput
        label="Phone *"
        required
        name="phone"
        value={phone}
        countryIso={countryCode || undefined}
        error={fieldError('phone')}
        onChange={(v) => setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
        onCountryChange={(iso) =>
          setValue('country_code', iso, { shouldValidate: true, shouldDirty: true })
        }
      />
      <Input label="Email *" type="email" error={fieldError('email')} {...register('email')} />
    </Grid>
  );

  const statusFields = (
    <div className="flex flex-wrap gap-6">
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
          {...register('is_default')}
        />
        Default company
      </label>
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--color-neutral-700)]">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
          {...register('is_active')}
        />
        Company is active
      </label>
    </div>
  );

  const summaryPanel = (
    <div className="space-y-4 text-sm">
      {statusFields}
      <dl className="grid grid-cols-1 gap-2 border-t border-[var(--color-neutral-100)] pt-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--color-neutral-400)]">Code</dt>
          <dd className="mt-0.5 font-mono text-[var(--color-neutral-800)]">
            {getValues('code') || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-neutral-400)]">Name</dt>
          <dd className="mt-0.5 text-[var(--color-neutral-800)]">{watched.name || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-neutral-400)]">Country</dt>
          <dd className="mt-0.5 text-[var(--color-neutral-800)]">{watched.country_code || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-neutral-400)]">Email</dt>
          <dd className="mt-0.5 text-[var(--color-neutral-800)]">{watched.email || '—'}</dd>
        </div>
      </dl>
    </div>
  );

  if (isWizard) {
    const totalSteps = COMPANY_CREATE_WIZARD_STEPS.length;
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
        className="mx-auto max-w-5xl space-y-6"
        noValidate
      >
        <CompanyWizardStepper currentStep={step} />

        {step === 0 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {detailsFields}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {contactFields}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
            {summaryPanel}
          </div>
        ) : null}

        <QuotationWizardNav
          currentStep={step}
          totalSteps={totalSteps}
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          onCancel={onCancel ?? (() => undefined)}
          onNext={() => void goNext()}
          isSubmitting={isSubmitting}
          nextLabel={
            step === totalSteps - 1
              ? submitLabel ?? 'Create company'
              : 'Next'
          }
        />
      </form>
    );
  }

  return (
    <form onSubmit={submitForm} className="space-y-4" noValidate>
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        {detailsFields}
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Contact & location</CardTitle>
        </CardHeader>
        {contactFields}
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        {statusFields}
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving…'
            : submitLabel ?? (mode === 'create' ? 'Create company' : 'Save changes')}
        </Button>
      </div>
    </form>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}
