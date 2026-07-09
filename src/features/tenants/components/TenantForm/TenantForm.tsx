import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createTenantSchema, updateTenantSchema } from '../../schemas/tenant.schema';
import type { CreateTenantFormValues, UpdateTenantFormValues } from '../../types/tenant.types';

interface TenantFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreateTenantFormValues>;
  onSubmit: (values: CreateTenantFormValues | UpdateTenantFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const CREATE_DEFAULTS: Partial<CreateTenantFormValues> = {
  primary_color: '#0A2942',
  language: 'en',
  base_currency: 'AED',
  timezone: 'Asia/Dubai',
  country_code: 'AE',
  financial_year_start: 1,
  subscription_plan: 'starter',
  status: 'trial',
  max_users: 10,
  max_branches: 3,
  max_storage_gb: 50,
  is_active: true,
  domain: '',
  website: '',
  logo_url: '',
  vat_number: '',
  cr_number: '',
  company_code: '',
  company_name: '',
  company_legal_name: '',
  company_registration_number: '',
};

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]';

export function TenantForm({ mode, defaultValues, onSubmit, isSubmitting }: TenantFormProps) {
  const schema = mode === 'create' ? createTenantSchema : updateTenantSchema;
  const form = useForm<CreateTenantFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CreateTenantFormValues>,
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

  const fieldError = (name: keyof CreateTenantFormValues) =>
    errors[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>1. Basic Information</CardTitle>
        </CardHeader>
        <Grid>
          <Input label="Legal company name" error={fieldError('name')} {...register('name')} />
          <Input label="Display name" error={fieldError('display_name')} {...register('display_name')} />
          {mode === 'create' && (
            <>
              <Input
                label="Tenant code"
                hint="Uppercase letters, numbers, hyphens (3–20)"
                error={fieldError('code')}
                className="font-mono uppercase"
                {...register('code')}
              />
              <Input
                label="Workspace slug"
                hint="Path-style slug with leading and trailing slashes, e.g. /abc-xyz/"
                error={fieldError('slug')}
                className="font-mono"
                {...register('slug')}
              />
            </>
          )}
        </Grid>
      </Card>

      {mode === 'create' && (
        <Card>
          <CardHeader className="mb-0 pb-3">
            <CardTitle>2. Admin Information</CardTitle>
          </CardHeader>
          <Grid>
            <Input
              label="Admin first name"
              error={fieldError('admin_first_name')}
              {...register('admin_first_name')}
            />
            <Input
              label="Admin last name"
              error={fieldError('admin_last_name')}
              {...register('admin_last_name')}
            />
            <Input
              label="Admin email"
              type="email"
              autoComplete="off"
              error={fieldError('email')}
              {...register('email')}
            />
            <Input
              label="Temporary password"
              type="password"
              autoComplete="new-password"
              hint="Minimum 8 characters"
              error={fieldError('password')}
              {...register('password')}
            />
          </Grid>
        </Card>
      )}

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>{mode === 'create' ? '3. Company Information' : '2. Company Information'}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Grid>
            <Input
              label="Company code"
              error={fieldError('company_code')}
              className="font-mono uppercase"
              {...register('company_code')}
            />
            <Input
              label="Company name"
              error={fieldError('company_name')}
              {...register('company_name')}
            />
            <Input
              label="Company legal name"
              error={fieldError('company_legal_name')}
              {...register('company_legal_name')}
            />
            <Input
              label="Company registration number"
              error={fieldError('company_registration_number')}
              {...register('company_registration_number')}
            />
          </Grid>
          <Grid>
            <Input label="Custom domain" {...register('domain')} />
            <Input label="Website" type="url" placeholder="https://" {...register('website')} />
            <Input label="Logo URL" type="url" error={fieldError('logo_url')} {...register('logo_url')} />
            <Input
              label="Brand color"
              placeholder="#0A2942"
              error={fieldError('primary_color')}
              {...register('primary_color')}
            />
          </Grid>
          <Grid cols={4}>
            <Input
              label="Country code"
              maxLength={2}
              className="uppercase"
              error={fieldError('country_code')}
              {...register('country_code')}
            />
            <Input label="Currency" error={fieldError('base_currency')} {...register('base_currency')} />
            <Input label="Timezone" error={fieldError('timezone')} {...register('timezone')} />
            <Input label="Language" error={fieldError('language')} {...register('language')} />
          </Grid>
          <Grid>
            <Input label="VAT / TRN" {...register('vat_number')} />
            <Input label="CR number" {...register('cr_number')} />
            <Input
              label="Financial year start (month)"
              type="number"
              min={1}
              max={12}
              error={fieldError('financial_year_start')}
              {...register('financial_year_start', { valueAsNumber: true })}
            />
            {mode === 'edit' && (
              <Input
                label="Contact email"
                type="email"
                error={fieldError('email')}
                {...register('email')}
              />
            )}
          </Grid>
          <Grid>
            <Input label="Address" error={fieldError('address')} {...register('address')} />
            <Input label="City" error={fieldError('city')} {...register('city')} />
            <Input label="Phone" type="tel" error={fieldError('phone')} {...register('phone')} />
          </Grid>
        </div>
      </Card>

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>{mode === 'create' ? '4. Subscription Information' : '3. Subscription Information'}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Grid cols={3}>
            <FormSelect label="Plan" error={fieldError('subscription_plan')} {...register('subscription_plan')}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="enterprise">Enterprise</option>
            </FormSelect>
            <FormSelect label="Status" error={fieldError('status')} {...register('status')}>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
            </FormSelect>
            <Input
              label="Trial ends"
              type="date"
              {...register('trial_ends')}
            />
            <Input
              label="Subscription ends"
              type="date"
              {...register('subscription_ends')}
            />
            <Input
              label="Max users"
              type="number"
              min={1}
              error={fieldError('max_users')}
              {...register('max_users', { valueAsNumber: true })}
            />
            <Input
              label="Max branches"
              type="number"
              min={1}
              error={fieldError('max_branches')}
              {...register('max_branches', { valueAsNumber: true })}
            />
            <Input
              label="Storage (GB)"
              type="number"
              min={1}
              error={fieldError('max_storage_gb')}
              {...register('max_storage_gb', { valueAsNumber: true })}
            />
          </Grid>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-neutral-700)] cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--color-neutral-300)] text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
              {...register('is_active')}
            />
            Tenant is active
          </label>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create tenant' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

function Grid({ cols = 2, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const colClass =
    cols === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : cols === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2';
  return <div className={`grid ${colClass} gap-4`}>{children}</div>;
}

function FormSelect({
  label,
  error,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-neutral-600)]">
        {label}
      </label>
      <select
        id={id}
        className={`${selectClass} ${error ? 'border-[var(--color-danger-500)]' : ''} ${className ?? ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
    </div>
  );
}
