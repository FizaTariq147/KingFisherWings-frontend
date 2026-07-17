import { useEffect, useRef, useState } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
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
import { getServerErrorMessage, useAppForm } from '@/lib/validation';
import {
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../../constants/organization.constants';
import {
  useOrganizationProfile,
  useUpdateOrganizationProfile,
} from '../../hooks/useOrganizationProfile';
import { updateOrganizationProfileSchema } from '../../schemas/organization.schema';
import type { OrganizationProfileFormValues } from '../../types/organization.types';
import { profileToFormValues } from '../../utils/prepareOrganizationPayload';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

const EMPTY: OrganizationProfileFormValues = {
  name: '',
  display_name: '',
  logo_url: '',
  primary_color: '#0A66C2',
  website: '',
  address: '',
  city: '',
  country_code: '',
  phone: '',
  email: '',
  language: 'en',
  base_currency: 'AED',
  timezone: 'Asia/Dubai',
  financial_year_start: 1,
  vat_number: '',
  cr_number: '',
  iata_cargo_agent_code: '',
  customs_code: '',
  customs_license_no: '',
};

export default function OrganizationProfilePage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useOrganizationProfile();
  const updateProfile = useUpdateOrganizationProfile();
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const prevLocaleRef = useRef<LocaleCatalog | null>(null);
  const skipLocaleApply = useRef(true);

  const {
    register,
    handleValidatedSubmit,
    reset,
    watch,
    setValue,
    getValues,
    applyApiErrors,
    formState: { errors, isDirty },
  } = useAppForm<OrganizationProfileFormValues>({
    resolver: zodResolver(updateOrganizationProfileSchema) as Resolver<OrganizationProfileFormValues>,
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (data) {
      const values = profileToFormValues(data);
      reset(values);
      prevLocaleRef.current = values.country_code
        ? resolveLocaleCatalog(values.country_code)
        : null;
      skipLocaleApply.current = true;
    }
  }, [data, reset]);

  const primaryColor = watch('primary_color');
  const phone = watch('phone') ?? '';
  const countryCode = watch('country_code') ?? '';
  const timezone = watch('timezone') ?? '';
  const locale = resolveLocaleCatalog(countryCode);

  useEffect(() => {
    if (skipLocaleApply.current) {
      skipLocaleApply.current = false;
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
  }, [countryCode, getValues, setValue]);

  const onSubmit = handleValidatedSubmit(async (values) => {
    setFormError(null);
    setSuccess(false);
    try {
      const updated = await updateProfile.mutateAsync(values);
      reset(profileToFormValues(updated));
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      applyApiErrors(err, { onRoot: setFormError });
      setFormError((prev) => prev || getServerErrorMessage(err));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-neutral-400)] py-8 text-center">
          Loading organization profile…
        </p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <div className="space-y-3 py-6 text-center">
          <p className="text-sm text-[var(--color-danger-700)]">
            {getServerErrorMessage(error) || 'Failed to load organization profile.'}
          </p>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--color-neutral-400)]">
          Update your tenant organization details.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {success && <Badge variant="success">Changes saved</Badge>}
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
            {updateProfile.isPending ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </div>

      {formError && (
        <div
          role="alert"
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            background: 'var(--color-danger-100)',
            borderColor: '#FECACA',
            color: 'var(--color-danger-700)',
          }}
        >
          {formError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Organization name *" error={errors.name?.message} {...register('name')} />
          </div>
          <Input
            label="Display name"
            error={errors.display_name?.message}
            {...register('display_name')}
          />
          <Input label="Website" error={errors.website?.message} {...register('website')} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CountrySelect
            label="Country"
            allowEmpty
            name="country_code"
            value={countryCode}
            hint="Optional — PATCH /organization country_code; drives locale when set"
            error={errors.country_code?.message}
            onChange={(iso) =>
              setValue('country_code', iso, { shouldValidate: true, shouldDirty: true })
            }
          />
          <PhoneInput
            label="Phone"
            name="phone"
            value={phone}
            countryIso={countryCode || undefined}
            error={errors.phone?.message}
            onChange={(v) => setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
            onCountryChange={(iso) =>
              setValue('country_code', iso, { shouldValidate: true, shouldDirty: true })
            }
          />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="City" error={errors.city?.message} {...register('city')} />
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label htmlFor="org-address" className="text-xs font-medium text-[var(--color-neutral-600)]">Address</label>
            <textarea
              id="org-address"
              rows={2}
              className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
              {...register('address')}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={locale?.taxIdLabel ?? 'VAT / Tax number'}
            hint={locale?.taxIdExample ? `e.g. ${locale.taxIdExample}` : undefined}
            error={errors.vat_number?.message}
            {...register('vat_number')}
          />
          <Input label="CR number" {...register('cr_number')} />
          <Input label="IATA cargo agent code" {...register('iata_cargo_agent_code')} />
          <Input label="Customs code" {...register('customs_code')} />
          <Input label="Customs license no." {...register('customs_license_no')} />
          <div className="flex flex-col gap-1">
            <label htmlFor="org-base-currency" className="text-xs font-medium text-[var(--color-neutral-600)]">
              Base currency
            </label>
            <select id="org-base-currency" className={selectClass} {...register('base_currency')}>
              {locale &&
                !CURRENCY_OPTIONS.includes(
                  locale.defaultCurrency as (typeof CURRENCY_OPTIONS)[number],
                ) && <option value={locale.defaultCurrency}>{locale.defaultCurrency}</option>}
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="org-language" className="text-xs font-medium text-[var(--color-neutral-600)]">Language</label>
            <select id="org-language" className={selectClass} {...register('language')}>
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="org-timezone" className="text-xs font-medium text-[var(--color-neutral-600)]">Timezone</label>
            <select id="org-timezone" className={selectClass} {...register('timezone')}>
              {(locale?.timezones ?? TIMEZONE_OPTIONS).map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
              {timezone &&
              locale &&
              !locale.timezones.includes(timezone) &&
              !TIMEZONE_OPTIONS.includes(timezone as (typeof TIMEZONE_OPTIONS)[number]) ? (
                <option value={timezone}>{timezone} (current)</option>
              ) : null}
              {!locale &&
              timezone &&
              !TIMEZONE_OPTIONS.includes(timezone as (typeof TIMEZONE_OPTIONS)[number]) ? (
                <option value={timezone}>{timezone} (current)</option>
              ) : null}
            </select>
            {errors.timezone && (
              <p className="text-xs text-[var(--color-danger-700)]">{errors.timezone.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="org-financial-year-start" className="text-xs font-medium text-[var(--color-neutral-600)]">
              Financial year start (month)
            </label>
            <select id="org-financial-year-start" className={selectClass} {...register('financial_year_start')}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {errors.financial_year_start && (
              <p className="text-xs text-[var(--color-danger-700)]">
                {errors.financial_year_start.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding Information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Logo URL" error={errors.logo_url?.message} {...register('logo_url')} />
          <div className="flex flex-col gap-1">
            <label htmlFor="org-primary-color" className="text-xs font-medium text-[var(--color-neutral-600)]">
              Primary color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label="Primary color picker"
                className="h-9 w-12 cursor-pointer rounded border border-[var(--color-neutral-200)] bg-white p-1"
                value={primaryColor || '#0A66C2'}
                onChange={(e) =>
                  setValue('primary_color', e.target.value, { shouldDirty: true })
                }
              />
              <input
                id="org-primary-color"
                className={selectClass}
                {...register('primary_color')}
                placeholder="#0A66C2"
              />
            </div>
          </div>
        </div>
      </Card>
    </form>
  );
}
