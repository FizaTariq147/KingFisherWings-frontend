import { useEffect, useRef } from 'react';
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
import { createCompanySchema, updateCompanySchema } from '../../schemas/company.schema';
import type { CreateCompanyFormValues, UpdateCompanyFormValues } from '../../types/company.types';

interface CompanyFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateCompanyFormValues>;
  onSubmit: (values: CreateCompanyFormValues | UpdateCompanyFormValues) => void | Promise<void>;
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

export function CompanyForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CompanyFormProps) {
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
    formState: { errors },
  } = form;

  const fieldError = (name: keyof CreateCompanyFormValues) => errors[name]?.message;
  const countryCode = watch('country_code') ?? '';
  const phone = watch('phone') ?? '';
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

  return (
    <form onSubmit={handleValidatedSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Company details</CardTitle>
        </CardHeader>
        <Grid>
          {mode === 'create' && (
            <Input
              label="Company code"
              hint="Uppercase letters, numbers, hyphens (e.g. OCE-DXB)"
              error={fieldError('code')}
              className="font-mono uppercase"
              {...register('code')}
            />
          )}
          <Input label="Company name" error={fieldError('name')} {...register('name')} />
          <Input label="Legal name" error={fieldError('legal_name')} {...register('legal_name')} />
          <Input
            label="Registration number"
            error={fieldError('registration_number')}
            {...register('registration_number')}
          />
          <Input
            label={locale?.taxIdLabel ?? 'VAT / TRN'}
            hint={locale?.taxIdExample ? `e.g. ${locale.taxIdExample}` : undefined}
            error={fieldError('vat_number')}
            {...register('vat_number')}
          />
        </Grid>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Contact & location</CardTitle>
        </CardHeader>
        <Grid>
          <Input label="Address" error={fieldError('address')} {...register('address')} />
          <Input label="City" error={fieldError('city')} {...register('city')} />
          <CountrySelect
            label="Country"
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
            label="Phone"
            required
            name="phone"
            value={phone}
            countryIso={countryCode || undefined}
            hint={locale ? `Dial ${locale.dialCode}` : 'Any valid international number (+…)'}
            error={fieldError('phone')}
            onChange={(v) => setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
            onCountryChange={(iso) =>
              setValue('country_code', iso, { shouldValidate: true, shouldDirty: true })
            }
          />
          <Input label="Email" type="email" error={fieldError('email')} {...register('email')} />
        </Grid>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
              {...register('is_default')}
            />
            Default company
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
              {...register('is_active')}
            />
            Company is active
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
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
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}
