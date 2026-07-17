import { useEffect, useRef } from 'react';
import { type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { isUuid } from '@/lib/isUuid';
import {
  applyLocaleFromCountry,
  resolveLocaleCatalog,
  type LocaleCatalog,
} from '@/lib/locale';
import { axiosInstance } from '@/lib/axios';
import { useAppForm } from '@/lib/validation';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import {
  PARTY_TYPES,
  PARTY_TYPE_LABELS,
} from '../../constants/party.constants';
import { createPartySchema, updatePartySchema } from '../../schemas/party.schema';
import type { CreatePartyFormValues, UpdatePartyFormValues } from '../../types/party.types';
import { loadPartyCurrencyOptions } from '../../utils/partyCurrencyOptions';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

const FORM_DEFAULTS: Partial<CreatePartyFormValues> = {
  party_type: 'CUSTOMER',
  code: '',
  name: '',
  short_name: '',
  vat_number: '',
  cr_number: '',
  country_code: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  currency_code: 'AED',
  portal_access: false,
  marketing_subscription: true,
  is_active: true,
  tags: [],
  notes: '',
  iata_code: '',
  scac_code: '',
};

interface PartyFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<CreatePartyFormValues>;
  onSubmit: (values: CreatePartyFormValues | UpdatePartyFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PartyForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: PartyFormProps) {
  const schema = mode === 'create' ? createPartySchema : updatePartySchema;
  const { data: companies = [] } = useTenantCompanies(true);

  const { data: currencies = [] } = useQuery({
    queryKey: ['tenant', 'parties', 'currency-options'],
    queryFn: loadPartyCurrencyOptions,
    staleTime: 60_000,
  });

  const { data: salespeople = [] } = useQuery({
    queryKey: ['tenant', 'users', 'salesperson-options'],
    queryFn: async () => {
      const res = await axiosInstance.get<unknown>('/users', {
        params: { page: 1, limit: 100 },
      });
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as { data?: unknown }).data)
          ? ((raw as { data: unknown[] }).data)
          : [];
      return list
        .map((item) => {
          const row = item as Record<string, unknown>;
          const id = String(row.id ?? '');
          if (!isUuid(id)) return null;
          const first = String(row.first_name ?? row.firstName ?? '');
          const last = String(row.last_name ?? row.lastName ?? '');
          const email = String(row.email ?? '');
          const label = [first, last].filter(Boolean).join(' ') || email || id;
          return { value: id, label };
        })
        .filter((o): o is { value: string; label: string } => Boolean(o));
    },
    staleTime: 60_000,
  });

  const form = useAppForm<CreatePartyFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<CreatePartyFormValues>,
    defaultValues: {
      ...FORM_DEFAULTS,
      ...defaultValues,
    },
  });

  const {
    register,
    handleValidatedSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const partyType = watch('party_type');
  const tagsText = (watch('tags') ?? []).join(', ');
  const countryCode = watch('country_code') ?? '';
  const phone = watch('phone') ?? '';
  const locale = resolveLocaleCatalog(countryCode);
  const prevLocaleRef = useRef<LocaleCatalog | null>(null);
  const skipLocaleApply = useRef(true);

  useEffect(() => {
    if (!countryCode) return;
    if (skipLocaleApply.current) {
      skipLocaleApply.current = false;
      prevLocaleRef.current = resolveLocaleCatalog(countryCode);
      return;
    }
    const current = getValues();
    const applied = applyLocaleFromCountry(countryCode, {
      previousCatalog: prevLocaleRef.current,
      current: { base_currency: current.currency_code },
      applyTimezone: false,
      applyLanguage: false,
    });
    if (!applied) return;
    prevLocaleRef.current = applied.catalog;
    if (applied.base_currency) {
      setValue('currency_code', applied.base_currency, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [countryCode, getValues, setValue]);

  const fieldError = (name: keyof CreatePartyFormValues) => {
    const err = errors[name];
    return err?.message ? String(err.message) : undefined;
  };

  return (
    <form
      className="space-y-4"
      onSubmit={handleValidatedSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <label className="text-xs font-medium text-[var(--color-neutral-500)] space-y-1">
            Party type *
            <select className={selectClass} {...register('party_type')}>
              {PARTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PARTY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            {fieldError('party_type') && (
              <span className="text-[var(--color-danger-600)]">{fieldError('party_type')}</span>
            )}
          </label>
          <Input label="Code *" error={fieldError('code')} {...register('code')} />
          <Input label="Name *" error={fieldError('name')} {...register('name')} className="sm:col-span-2" />
          <Input label="Short name" error={fieldError('short_name')} {...register('short_name')} />
          <label className="text-xs font-medium text-[var(--color-neutral-500)] space-y-1">
            Company
            <select className={selectClass} {...register('company_id')}>
              <option value="">Select…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `${c.name} (${c.code})` : c.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            label={locale?.taxIdLabel ?? 'VAT number'}
            hint={locale?.taxIdExample ? `e.g. ${locale.taxIdExample}` : undefined}
            error={fieldError('vat_number')}
            {...register('vat_number')}
          />
          <Input label="CR number" {...register('cr_number')} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & contact</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <CountrySelect
            label="Country"
            name="country_code"
            value={countryCode}
            error={fieldError('country_code')}
            onChange={(iso) =>
              setValue('country_code', iso, { shouldValidate: true, shouldDirty: true })
            }
          />
          <Input label="City" {...register('city')} />
          <div className="sm:col-span-2">
            <label htmlFor="party-address" className="text-xs font-medium text-[var(--color-neutral-500)]">Address</label>
            <textarea
              id="party-address"
              className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm min-h-[72px]"
              {...register('address')}
            />
          </div>
          <PhoneInput
            label="Phone"
            name="phone"
            value={phone}
            countryIso={countryCode || undefined}
            error={fieldError('phone')}
            onChange={(v) => setValue('phone', v, { shouldValidate: true, shouldDirty: true })}
            onCountryChange={(iso) => {
              if (!countryCode) {
                setValue('country_code', iso, { shouldValidate: true, shouldDirty: true });
              }
            }}
          />
          <Input label="Email" error={fieldError('email')} {...register('email')} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit & assignment</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <Input
            label="Credit limit"
            type="number"
            error={fieldError('credit_limit')}
            {...register('credit_limit')}
          />
          <Input
            label="Credit days"
            type="number"
            error={fieldError('credit_days')}
            {...register('credit_days')}
          />
          <label className="text-xs font-medium text-[var(--color-neutral-500)] space-y-1">
            Currency
            <select className={selectClass} {...register('currency_code')}>
              <option value="">Select…</option>
              {!locale?.defaultCurrency ||
              currencies.some((c) => c.value === locale.defaultCurrency) ? null : (
                <option value={locale.defaultCurrency}>{locale.defaultCurrency}</option>
              )}
              {currencies.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-[var(--color-neutral-500)] space-y-1">
            Salesperson
            <select className={selectClass} {...register('salesperson_id')}>
              <option value="">Select…</option>
              {salespeople.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {(partyType === 'AIRLINE' || partyType === 'SHIPPING_LINE') && (
        <Card>
          <CardHeader>
            <CardTitle>Carrier codes</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
            {partyType === 'AIRLINE' && <Input label="IATA code" {...register('iata_code')} />}
            {partyType === 'SHIPPING_LINE' && <Input label="SCAC code" {...register('scac_code')} />}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Flags & notes</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 pt-0">
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" {...register('is_active')} /> Active
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" {...register('portal_access')} /> Portal access
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
            <input type="checkbox" {...register('marketing_subscription')} /> Marketing subscription
          </label>
          <label className="text-xs font-medium text-[var(--color-neutral-500)] space-y-1 sm:col-span-2">
            Tags (comma-separated)
            <input
              className={selectClass}
              value={tagsText}
              onChange={(e) =>
                setValue(
                  'tags',
                  e.target.value
                    .split(/[,|]/)
                    .map((t) => t.trim())
                    .filter(Boolean),
                  { shouldDirty: true },
                )
              }
            />
          </label>
          <div className="sm:col-span-2">
            <label htmlFor="party-notes" className="text-xs font-medium text-[var(--color-neutral-500)]">Notes</label>
            <textarea
              id="party-notes"
              className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm min-h-[72px]"
              {...register('notes')}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create party' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
