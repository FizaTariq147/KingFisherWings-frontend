import { useEffect, useRef } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import {
  applyLocaleFromCountry,
  resolveLocaleCatalog,
  type LocaleCatalog,
} from '@/lib/locale';
import { cn } from '@/lib/utils';
import { useAppForm } from '@/lib/validation';
import { TIMEZONE_OPTIONS } from '@/features/organization/constants/organization.constants';
import { usePlatformOnboardingStore } from '@/features/platform/store/platformOnboardingStore';
import { useCompanyRegistry } from '@/features/companies/hooks/useCompanies';
import { createTenantSchema, updateTenantSchema, SUBSCRIPTION_PLANS, TENANT_STATUSES } from '../../schemas/tenant.schema';
import type { CreateTenantFormValues, UpdateTenantFormValues } from '../../types/tenant.types';
import { applyCompanyToTenantForm, companyOptionLabel } from '../../utils/applyCompanyToTenantForm';

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
  country_code: '',
  phone: '',
  financial_year_start: 1,
  subscription_plan: 'STANDARD',
  status: 'ACTIVE',
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
  selected_company_id: '',
};

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]';

export function TenantForm({ mode, defaultValues, onSubmit, isSubmitting }: TenantFormProps) {
  const schema = mode === 'create' ? createTenantSchema : updateTenantSchema;
  const form = useAppForm<CreateTenantFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CreateTenantFormValues>,
    defaultValues: {
      ...(mode === 'create' ? CREATE_DEFAULTS : {}),
      ...defaultValues,
    },
  });

  const {
    register,
    handleValidatedSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form;

  const { data: companiesData, isLoading: companiesLoading, isError: companiesError } = useCompanyRegistry({ limit: 200 });
  const draftCompanies = usePlatformOnboardingStore((s) => s.draftCompanies);
  const registryCompanies = companiesData?.companies ?? [];
  const companies = [...draftCompanies, ...registryCompanies];
  const selectedCompanyId = watch('selected_company_id');
  const countryCode = watch('country_code') ?? '';
  const phone = watch('phone') ?? '';
  const timezone = watch('timezone') ?? '';
  const isDraftSelection = draftCompanies.some((company) => company.id === selectedCompanyId);
  const locale = resolveLocaleCatalog(countryCode);
  const prevLocaleRef = useRef<LocaleCatalog | null>(null);
  const skipLocaleApply = useRef(true);

  useEffect(() => {
    if (mode !== 'create' || draftCompanies.length === 0 || selectedCompanyId) return;
    applyCompanyToTenantForm(draftCompanies[0], setValue);
  }, [mode, draftCompanies, selectedCompanyId, setValue]);

  // Locale catalog resolve only when country_code is set.
  useEffect(() => {
    if (skipLocaleApply.current) {
      skipLocaleApply.current = false;
      prevLocaleRef.current = countryCode ? resolveLocaleCatalog(countryCode) : null;
      return;
    }
    if (!countryCode) {
      prevLocaleRef.current = null;
      return;
    }
    const current = getValues();
    const applied = applyLocaleFromCountry(countryCode, {
      previousCatalog: prevLocaleRef.current,
      current: {
        base_currency: current.base_currency,
        timezone: current.timezone,
        language: current.language,
      },
      applyLanguage: true,
    });
    if (!applied) return;
    prevLocaleRef.current = applied.catalog;
    if (applied.base_currency) {
      setValue('base_currency', applied.base_currency, { shouldDirty: true, shouldValidate: true });
    }
    if (applied.timezone) {
      setValue('timezone', applied.timezone, { shouldDirty: true, shouldValidate: true });
    }
    if (applied.language) {
      setValue('language', applied.language, { shouldDirty: true, shouldValidate: true });
    }
    if (!(current.phone || '').trim()) {
      setValue('phone', '', { shouldDirty: true });
    }
  }, [countryCode, getValues, setValue]);

  const handleCompanySelect = (companyId: string) => {
    const draft = draftCompanies.find((company) => company.id === companyId);
    if (draft) {
      applyCompanyToTenantForm(draft, setValue);
      return;
    }

    const company = registryCompanies.find((c) => c.id === companyId);
    if (!company) {
      setValue('selected_company_id', '', { shouldValidate: true });
      return;
    }
    applyCompanyToTenantForm(company, setValue);
  };

  const fieldError = (name: keyof CreateTenantFormValues) =>
    errors[name]?.message;

  return (
    <form onSubmit={handleValidatedSubmit(onSubmit)} className="space-y-4">
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
                hint="Lowercase letters, numbers, and hyphens only (e.g. oceanic-dxb)"
                error={fieldError('slug')}
                className="font-mono lowercase"
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
              hint="Used for Tenant Admin login with the workspace slug (not SuperAdmin login)"
              error={fieldError('password')}
              {...register('password')}
            />
          </Grid>
        </Card>
      )}

      <Card>
        <CardHeader className="mb-0 pb-3">
          <CardTitle>{mode === 'create' ? '3. Company reference' : '2. Company Information'}</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {mode === 'create' && (
            <div className="space-y-2">
              <FormSelect
                label="Company profile"
                error={fieldError('selected_company_id')}
                value={selectedCompanyId ?? ''}
                onChange={(e) => handleCompanySelect(e.target.value)}
                disabled={companiesLoading}
              >
                <option value="">
                  {companiesLoading ? 'Loading companies…' : 'Select a company profile…'}
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {companyOptionLabel(company)}
                  </option>
                ))}
              </FormSelect>
              {!companiesLoading && companiesError && (
                <p className="text-xs text-[var(--color-danger-500)]">
                  Could not load registered companies. You can still use a company profile from step 1.
                </p>
              )}
              {!companiesLoading && !companiesError && companies.length === 0 && (
                <p className="text-xs text-[var(--color-neutral-500)]">
                  Please create a company before creating a tenant.{' '}
                  <Link
                    to="/superadmin/companies/new"
                    className="font-medium text-[var(--color-primary-500)] hover:underline"
                  >
                    Create company
                  </Link>
                </p>
              )}
              {isDraftSelection && (
                <p className="text-xs text-[var(--color-neutral-500)]">
                  Using a draft company profile from step 1. The tenant will be provisioned with these details.
                </p>
              )}
            </div>
          )}

          <Grid>
            <Input
              label="Company code"
              error={fieldError('company_code')}
              className={cn(
                'font-mono uppercase',
                mode === 'create' && selectedCompanyId && !isDraftSelection && 'bg-[var(--color-neutral-50)]',
              )}
              readOnly={mode === 'create' && !!selectedCompanyId && !isDraftSelection}
              {...register('company_code')}
            />
            <Input
              label="Company name"
              error={fieldError('company_name')}
              className={
                mode === 'create' && selectedCompanyId && !isDraftSelection
                  ? 'bg-[var(--color-neutral-50)]'
                  : undefined
              }
              readOnly={mode === 'create' && !!selectedCompanyId && !isDraftSelection}
              {...register('company_name')}
            />
            <Input
              label="Company legal name"
              error={fieldError('company_legal_name')}
              className={
                mode === 'create' && selectedCompanyId && !isDraftSelection
                  ? 'bg-[var(--color-neutral-50)]'
                  : undefined
              }
              readOnly={mode === 'create' && !!selectedCompanyId && !isDraftSelection}
              {...register('company_legal_name')}
            />
            <Input
              label="Company registration number"
              error={fieldError('company_registration_number')}
              className={
                mode === 'create' && selectedCompanyId && !isDraftSelection
                  ? 'bg-[var(--color-neutral-50)]'
                  : undefined
              }
              readOnly={mode === 'create' && !!selectedCompanyId && !isDraftSelection}
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
            <CountrySelect
              label="Country"
              allowEmpty
              name="country_code"
              value={countryCode}
              hint="Optional — sets dial, currency, timezone, and tax patterns when selected"
              error={fieldError('country_code')}
              onChange={(iso) =>
                setValue('country_code', iso, { shouldValidate: true, shouldDirty: true })
              }
            />
            <Input
              label="Base currency"
              hint={
                locale
                  ? `Suggested for ${locale.iso2}: ${locale.defaultCurrency}`
                  : 'Set independently when no country is selected'
              }
              error={fieldError('base_currency')}
              {...register('base_currency')}
            />
            {locale ? (
              <FormSelect label="Timezone" error={fieldError('timezone')} {...register('timezone')}>
                {locale.timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
                {timezone && !locale.timezones.includes(timezone) ? (
                  <option value={timezone}>{timezone} (current)</option>
                ) : null}
              </FormSelect>
            ) : (
              <FormSelect label="Timezone" error={fieldError('timezone')} {...register('timezone')}>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
                {timezone && !TIMEZONE_OPTIONS.includes(timezone as (typeof TIMEZONE_OPTIONS)[number]) ? (
                  <option value={timezone}>{timezone} (current)</option>
                ) : null}
              </FormSelect>
            )}
            <Input label="Language" error={fieldError('language')} {...register('language')} />
          </Grid>
          <Grid>
            <Input
              label={locale?.taxIdLabel ?? 'VAT / Tax number'}
              hint={locale?.taxIdExample ? `e.g. ${locale.taxIdExample}` : undefined}
              error={fieldError('vat_number')}
              {...register('vat_number')}
            />
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
            <PhoneInput
              label="Phone"
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
              {SUBSCRIPTION_PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan.charAt(0) + plan.slice(1).toLowerCase()}
                </option>
              ))}
            </FormSelect>
            <FormSelect label="Status" error={fieldError('status')} {...register('status')}>
              {TENANT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
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
