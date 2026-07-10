import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
  const form = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CreateCompanyFormValues>,
    defaultValues: {
      ...(mode === 'create' ? CREATE_DEFAULTS : {}),
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const fieldError = (name: keyof CreateCompanyFormValues) => errors[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Input label="VAT / TRN" error={fieldError('vat_number')} {...register('vat_number')} />
        </Grid>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>Contact & location</CardTitle>
        </CardHeader>
        <Grid>
          <Input label="Address" error={fieldError('address')} {...register('address')} />
          <Input label="City" error={fieldError('city')} {...register('city')} />
          <Input
            label="Country code"
            maxLength={2}
            className="uppercase"
            error={fieldError('country_code')}
            {...register('country_code')}
          />
          <Input label="Phone" type="tel" error={fieldError('phone')} {...register('phone')} />
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
