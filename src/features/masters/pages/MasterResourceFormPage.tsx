import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { getCountry, getDialCodeOptions } from '@/lib/countries';
import { isUuid } from '@/lib/isUuid';
import { useOrganizationProfile } from '@/features/organization/hooks/useOrganizationProfile';
import { useTenantCompanies } from '@/features/users/hooks/useTenantCompanies';
import { getMasterResource } from '../config/masterResources';
import {
  useMasterDetail,
  useMasterMutations,
  useMasterOptions,
} from '../hooks/useMasterResource';
import {
  useMasterPageRoute,
  type MasterPageRouteProps,
} from '../hooks/useMasterPageRoute';
import { focusFirstInvalidField, getServerErrorMessage, suggestCodeFromName, suggestContainerTypeCode, suggestDepartmentCode, suggestBranchCode, suggestWarehouseCode } from '@/lib/validation';
import { getContainerTypeSizeMeta, normalizeContainerTypeSize } from '../constants/containerTypeSizes';
import { DEPARTMENT_NAME_OPTIONS } from '../constants/departmentNames';
import { DESIGNATION_NAME_OPTIONS } from '../constants/designationNames';
import { normalizeUomCategory, UOM_CATEGORY_OPTIONS } from '../constants/uomCategories';
import { validateMasterValues } from '../schemas/master.schema';
import { currenciesAreSame, EXCHANGE_RATE_SAME_CURRENCY } from '../utils/exchangeRateRules';
import { fetchMarketExchangeRate } from '../utils/fetchMarketExchangeRate';
import { masterDisplayValue, pickCountryIsoCode, pickMasterField } from '../utils/normalizeMasterRecord';
import type { MasterFieldConfig } from '../types/master.types';
import { MASTER_PATHS, type MasterResourceKey } from '../api/masterPaths';
import { SearchableSelect } from '../components/SearchableSelect';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

function FieldInput({
  field,
  value,
  onChange,
  options,
  error,
  countryIso,
  resourceKey,
  baseCurrencyLocked,
  onCountryIsoChange,
  onBlurValidate,
}: {
  field: MasterFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  options: { value: string; label: string }[];
  error?: string;
  countryIso?: string;
  resourceKey?: string;
  /** When set, exchange-rate base_currency is tenant-locked. */
  baseCurrencyLocked?: string;
  onCountryIsoChange?: (iso: string) => void;
  onBlurValidate?: (fieldName: string, value: unknown) => void;
}) {
  const errorClass = error
    ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)]'
    : '';

  if (
    resourceKey === 'exchange-rates' &&
    field.name === 'base_currency' &&
    baseCurrencyLocked
  ) {
    return (
      <Input
        label={`${field.label} (tenant base)`}
        name={field.name}
        value={baseCurrencyLocked}
        readOnly
        className="bg-[var(--color-neutral-50)]"
        hint="Exchange rates must use the organization base currency"
        error={error}
      />
    );
  }

  if (field.name === 'country_code' || field.name === 'flag_country') {
    return (
      <CountrySelect
        label={field.label}
        required={field.required}
        allowEmpty={!field.required}
        name={field.name}
        value={value == null ? '' : String(value)}
        error={error}
        onChange={(iso) => onChange(iso)}
      />
    );
  }

  if (field.name === 'dial_code') {
    const dialOptions = getDialCodeOptions();
    const current = value == null ? '' : String(value);
    const withCurrent =
      current && !dialOptions.some((o) => o.value === current)
        ? [{ value: current, label: `${current} (current)` }, ...dialOptions]
        : dialOptions;
    return (
      <SearchableSelect
        name={field.name}
        label={field.label}
        required={field.required}
        value={current}
        options={withCurrent}
        onChange={(next) => onChange(next)}
        error={error}
        placeholder={field.placeholder ?? 'Search or select dial code…'}
        emptyMessage="No matching dial codes"
        allowManualUuid={false}
        allowManualValue={false}
        hint="Select the international dialing code for this country"
      />
    );
  }

  if (field.name === 'phone' || field.name.endsWith('_phone')) {
    return (
      <PhoneInput
        label={field.label}
        required={field.required}
        name={field.name}
        value={value == null ? '' : String(value)}
        countryIso={countryIso || 'AE'}
        error={error}
        onChange={(v) => onChange(v)}
        onCountryChange={onCountryIsoChange}
      />
    );
  }

  if (resourceKey === 'departments' && field.name === 'name') {
    const current = value == null ? '' : String(value);
    const withCurrent =
      current && !DEPARTMENT_NAME_OPTIONS.some((o) => o.value === current)
        ? [{ value: current, label: current }, ...DEPARTMENT_NAME_OPTIONS]
        : [...DEPARTMENT_NAME_OPTIONS];
    return (
      <SearchableSelect
        name={field.name}
        label={field.label}
        required={field.required}
        value={current}
        options={withCurrent}
        onChange={(next) => {
          onChange(next);
          onBlurValidate?.(field.name, next);
        }}
        error={error}
        placeholder={field.placeholder ?? 'Select or type a department name…'}
        emptyMessage="No matches — type your own name and press Enter"
        allowManualUuid={false}
        allowManualValue
        hint="Pick a common department or type your own valid name"
      />
    );
  }

  if (resourceKey === 'designations' && field.name === 'name') {
    const current = value == null ? '' : String(value);
    const withCurrent =
      current && !DESIGNATION_NAME_OPTIONS.some((o) => o.value === current)
        ? [{ value: current, label: current }, ...DESIGNATION_NAME_OPTIONS]
        : [...DESIGNATION_NAME_OPTIONS];
    return (
      <SearchableSelect
        name={field.name}
        label={field.label}
        required={field.required}
        value={current}
        options={withCurrent}
        onChange={(next) => {
          onChange(next);
          onBlurValidate?.(field.name, next);
        }}
        error={error}
        placeholder={field.placeholder ?? 'Select or type a designation…'}
        emptyMessage="No matches — type your own name and press Enter"
        allowManualUuid={false}
        allowManualValue
        hint="Pick a common designation or type your own valid name"
      />
    );
  }

  if (field.type === 'boolean') {
    const hsHint =
      resourceKey === 'hs-codes' && field.name === 'is_prohibited'
        ? 'Banned for import/export under any circumstances'
        : resourceKey === 'hs-codes' && field.name === 'is_restricted'
          ? 'May move only with permits, licenses, or extra controls'
          : undefined;
    return (
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-700)]">
          <input
            type="checkbox"
            name={field.name}
            data-field={field.name}
            aria-invalid={Boolean(error)}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.label}
        </label>
        {hsHint && (
          <p className="pl-6 text-[11px] text-[var(--color-neutral-400)]">{hsHint}</p>
        )}
        {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
      </div>
    );
  }

  if (field.type === 'select') {
    const isEmpty = options.length === 0;
    const isDepartmentSelect = field.optionsFrom === 'departments';
    const isContainerSize =
      resourceKey === 'container-types' && field.name === 'size';
    const isUomCategory =
      resourceKey === 'units-of-measure' && field.name === 'category';

    if (isDepartmentSelect || isContainerSize || isUomCategory) {
      return (
        <SearchableSelect
          name={field.name}
          label={field.label}
          required={field.required}
          value={value == null ? '' : String(value)}
          options={isUomCategory ? UOM_CATEGORY_OPTIONS : options}
          onChange={(next) =>
            onChange(isUomCategory ? normalizeUomCategory(next) : next)
          }
          error={error}
          placeholder={
            field.placeholder ??
            (isContainerSize
              ? 'Pick a size or type your own…'
              : isUomCategory
                ? 'Pick a category or type your own…'
                : 'Type to search or select a department…')
          }
          emptyMessage={
            isContainerSize
              ? 'No matching sizes — type your own and press Enter'
              : isUomCategory
                ? 'No matching categories — type your own and press Enter'
                : isEmpty
                  ? 'No departments available'
                  : 'No matching departments'
          }
          allowManualUuid={!isContainerSize && !isUomCategory}
          allowManualValue={isContainerSize || isUomCategory}
          hint={
            isContainerSize
              ? 'Pick from the dropdown or type your own size (saved in the size field).'
              : isUomCategory
                ? 'Common categories: Weight, Volume, Length, Count (custom allowed)'
                : undefined
          }
        />
      );
    }

    return (
      <div className="space-y-1">
        <label htmlFor={`master-select-${field.name}`} className="text-xs font-medium text-[var(--color-neutral-500)]">{field.label}</label>
        <select
          id={`master-select-${field.name}`}
          name={field.name}
          data-field={field.name}
          aria-invalid={Boolean(error)}
          className={`${selectClass} ${errorClass}`}
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value)}
          disabled={isEmpty && Boolean(field.optionsFrom)}
        >
          <option value="">
            {isEmpty && field.optionsFrom ? 'No options available' : 'Select…'}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
        {isEmpty && field.optionsFrom === 'countries' && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            Create the country under Masters → Countries first (ISO code is sent as country_code).
          </p>
        )}
        {isEmpty && field.optionsFrom === 'tax-rates' && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            Create a Tax Rate first under Masters → Tax Rates, then return here.
          </p>
        )}
        {isEmpty &&
          field.optionsFrom &&
          field.optionsFrom !== 'countries' &&
          field.optionsFrom !== 'tax-rates' && (
            <p className="text-[11px] text-[var(--color-neutral-400)]">
              No options loaded for this field yet.
            </p>
          )}
      </div>
    );
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value)
      ? value.map(String)
      : typeof value === 'string' && value
        ? value.split(/[,\s]+/).filter(Boolean)
        : [];
    return (
      <div className="space-y-2">
        <span className="text-xs font-medium text-[var(--color-neutral-500)]">
          {field.label}
          {field.required ? ' *' : ''}
        </span>
        <div className="flex flex-wrap gap-3" data-field={field.name}>
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 text-sm text-[var(--color-neutral-700)]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value];
                    onChange(next);
                  }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
        {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1">
        <label htmlFor={`master-textarea-${field.name}`} className="text-xs font-medium text-[var(--color-neutral-500)]">{field.label}</label>
        <textarea
          id={`master-textarea-${field.name}`}
          name={field.name}
          data-field={field.name}
          aria-invalid={Boolean(error)}
          className={`min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ${
            error
              ? 'border-[var(--color-danger-500)]'
              : 'border-[var(--color-neutral-200)]'
          }`}
          value={value == null ? '' : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {resourceKey === 'hs-codes' && field.name === 'description' && !error && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            2–500 characters — clear commodity description for customs
          </p>
        )}
        {resourceKey === 'warehouses' && field.name === 'address' && !error && (
          <p className="text-[11px] text-[var(--color-neutral-400)]">
            Optional street / facility address (max 500 characters)
          </p>
        )}
        {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
      </div>
    );
  }

  return (
    <Input
      label={field.label}
      name={field.name}
      data-field={field.name}
      aria-invalid={Boolean(error)}
      required={field.required}
      error={error}
      hint={
        resourceKey === 'departments' && field.name === 'code'
          ? 'Format: COMPANY-DEPARTMENT-NAME (e.g. KF-HUMAN-RESOURCES)'
          : resourceKey === 'branches' && field.name === 'code'
            ? 'Format: COMPANY-BRANCH-PREFIX (e.g. KF-DHO for Dubai Head Office)'
            : resourceKey === 'hs-codes' && field.name === 'hs_code'
              ? '4–10 digits, optional dots (e.g. 8471.30 or 847130)'
              : resourceKey === 'hs-codes' &&
                  (field.name === 'import_duty_rate' || field.name === 'export_duty_rate')
                ? 'Percent from 0 to 100'
                : resourceKey === 'hs-codes' && field.name === 'dg_class'
                  ? 'Dangerous goods class 1–9 (e.g. 3 or 2.1)'
                  : resourceKey === 'hs-codes' && field.name === 'un_number'
                    ? '4 digits, optional UN prefix (e.g. UN1203)'
                    : (resourceKey === 'ports' ||
                          resourceKey === 'seaport' ||
                          resourceKey === 'landport') &&
                        field.name === 'un_locode'
                      ? '5 characters preferred: country ISO + location (e.g. AEJEA)'
                      : (resourceKey === 'ports' ||
                            resourceKey === 'seaport' ||
                            resourceKey === 'landport') &&
                          field.name === 'latitude'
                        ? 'Decimal degrees, -90 to 90'
                        : (resourceKey === 'ports' ||
                              resourceKey === 'seaport' ||
                              resourceKey === 'landport') &&
                            field.name === 'longitude'
                          ? 'Decimal degrees, -180 to 180'
                          : resourceKey === 'units-of-measure' && field.name === 'code'
                            ? 'Short code related to the name (e.g. CBM, KG)'
                            : resourceKey === 'warehouses' && field.name === 'code'
                              ? 'Uppercase code, max 20 chars (e.g. WH-JA3)'
                              : resourceKey === 'warehouses' && field.name === 'capacity_sqm'
                                ? 'Floor area in square meters (0 or greater)'
                                : undefined
      }
      type={
        field.type === 'number'
          ? 'number'
          : field.type === 'date'
            ? 'date'
            : field.type === 'email'
              ? 'email'
              : field.type === 'url'
                ? 'url'
                : 'text'
      }
      value={value == null ? '' : String(value)}
      placeholder={field.placeholder}
      onChange={(e) =>
        onChange(
          field.type === 'number'
            ? e.target.value === ''
              ? ''
              : Number(e.target.value)
            : e.target.value,
        )
      }
      onBlur={() => {
        if (resourceKey === 'branches' && field.name === 'name') {
          onBlurValidate?.(field.name, value);
        }
      }}
    />
  );
}

function useFieldOptions(field: MasterFieldConfig) {
  const fromCompanies = field.optionsFrom === 'companies';
  const fromDepartments = field.optionsFrom === 'departments';
  const optionsKey = !fromCompanies
    ? (field.optionsFrom as MasterResourceKey | undefined)
    : undefined;
  const basePath = optionsKey ? MASTER_PATHS[optionsKey] : '';
  const { data: items = [] } = useMasterOptions(
    optionsKey ?? '',
    basePath,
    Boolean(optionsKey),
    fromDepartments,
  );
  const { data: companies = [] } = useTenantCompanies(fromCompanies);

  return useMemo(() => {
    if (field.options?.length) return field.options;
    if (fromCompanies) {
      const opts: Array<{ value: string; label: string }> = [];
      for (const c of companies) {
        if (!isUuid(c.id)) continue;
        opts.push({
          value: c.id,
          label: c.code ? `${c.name} (${c.code})` : c.name,
        });
      }
      return opts;
    }
    if (!optionsKey) return [];
    const valueKey = field.optionsValueKey ?? 'id';
    const labelKey = field.optionsLabelKey ?? 'name';
    const opts: Array<{ value: string; label: string }> = [];
    for (const item of items) {
      // Departments: show all (including inactive). Other masters: active only.
      if (!fromDepartments && item.is_active === false) continue;
      if (item.deleted_at) continue;

      const name = masterDisplayValue(item, labelKey);
      const code = typeof item.code === 'string' ? item.code : '';
      const rate = item.rate != null && item.rate !== '' ? String(item.rate) : '';
      const inactive = item.is_active === false;

      // Holidays / country lookups must submit ISO alpha-2, never the row UUID.
      if (optionsKey === 'countries' || valueKey === 'iso_code') {
        const iso = pickCountryIsoCode(item);
        if (!iso) continue;
        opts.push({ value: iso, label: name !== '—' ? `${name} (${iso})` : iso });
        continue;
      }

      const value = String(item[valueKey] ?? '');
      // UUID FK selects must only expose real UUIDs (Nest ParseUUIDPipe / @IsUUID).
      if (valueKey === 'id' && !isUuid(value)) continue;

      if (optionsKey === 'currencies') {
        const c =
          typeof item.code === 'string' && item.code
            ? item.code.toUpperCase()
            : value.toUpperCase();
        const displayName = masterDisplayValue(item, 'name');
        const label =
          displayName !== '—' && displayName.toUpperCase() !== c
            ? `${c} — ${displayName}`
            : c;
        const currencyValue = valueKey === 'code' ? c : value;
        if (!currencyValue) continue;
        opts.push({
          value: currencyValue,
          label,
        });
        continue;
      }

      let label = name;
      if (optionsKey === 'tax-rates') {
        label = [name !== '—' ? name : code, code && name !== code ? `(${code})` : '', rate ? `${rate}%` : '']
          .filter(Boolean)
          .join(' ');
      } else if (code && name !== '—' && name !== code) {
        label = `${name} (${code})`;
      }
      if (fromDepartments && inactive) {
        label = `${label || value} — inactive`;
      }
      const finalValue = value;
      const finalLabel = label || value;
      if (!finalValue) continue;
      opts.push({ value: finalValue, label: finalLabel });
    }
    return opts;
  }, [
    companies,
    field.options,
    field.optionsLabelKey,
    field.optionsValueKey,
    fromCompanies,
    fromDepartments,
    items,
    optionsKey,
  ]);
}

function DynamicField(props: {
  field: MasterFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  countryIso?: string;
  resourceKey?: string;
  baseCurrencyLocked?: string;
  onCountryIsoChange?: (iso: string) => void;
  onBlurValidate?: (fieldName: string, value: unknown) => void;
}) {
  const options = useFieldOptions(props.field);
  return <FieldInput {...props} options={options} />;
}

function ExchangeRateAssist({
  currencyId,
  baseCurrency,
  onRateFetched,
  onPairError,
}: {
  currencyId: string;
  baseCurrency: string;
  onRateFetched: (payload: { rate: number; source: string; rate_date?: string }) => void;
  onPairError: (message: string | null) => void;
}) {
  const { data: currencies = [] } = useMasterOptions(
    'currencies',
    MASTER_PATHS.currencies,
    true,
  );
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastSource, setLastSource] = useState<string | null>(null);
  const requestId = useRef(0);
  const onRateFetchedRef = useRef(onRateFetched);
  const onPairErrorRef = useRef(onPairError);
  onRateFetchedRef.current = onRateFetched;
  onPairErrorRef.current = onPairError;

  const selectedCode = useMemo(() => {
    const row = currencies.find((c) => String(c.id) === currencyId);
    return typeof row?.code === 'string' ? row.code.toUpperCase() : '';
  }, [currencies, currencyId]);

  const base = String(baseCurrency ?? '')
    .trim()
    .toUpperCase();

  useEffect(() => {
    if (!selectedCode || !base) {
      onPairErrorRef.current(null);
      return;
    }
    if (currenciesAreSame(selectedCode, base)) {
      onPairErrorRef.current(EXCHANGE_RATE_SAME_CURRENCY);
      return;
    }
    onPairErrorRef.current(null);

    const id = ++requestId.current;
    setFetching(true);
    setFetchError(null);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await fetchMarketExchangeRate(selectedCode, base);
          if (id !== requestId.current) return;
          onRateFetchedRef.current({
            rate: result.rate,
            source: result.source,
            rate_date: result.date,
          });
          setLastSource(result.source);
          setFetchError(null);
        } catch (err) {
          if (id !== requestId.current) return;
          setFetchError(err instanceof Error ? err.message : 'Failed to fetch market rate');
        } finally {
          if (id === requestId.current) setFetching(false);
        }
      })();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedCode, base]);

  const refetchNow = async () => {
    if (!selectedCode || !base || currenciesAreSame(selectedCode, base)) return;
    setFetching(true);
    setFetchError(null);
    try {
      const result = await fetchMarketExchangeRate(selectedCode, base);
      onRateFetchedRef.current({
        rate: result.rate,
        source: result.source,
        rate_date: result.date,
      });
      setLastSource(result.source);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch market rate');
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="sm:col-span-2 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[var(--color-neutral-700)]">
            Live market rate
          </p>
          <p className="text-[11px] text-[var(--color-neutral-500)]">
            {selectedCode && base && !currenciesAreSame(selectedCode, base)
              ? `1 ${selectedCode} → ${base} (Frankfurter/ECB, fallback open.er-api.com)`
              : 'Select different currency and base currency to auto-fetch the rate.'}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={
            fetching ||
            !selectedCode ||
            !base ||
            currenciesAreSame(selectedCode, base)
          }
          onClick={() => void refetchNow()}
        >
          {fetching ? 'Fetching…' : 'Fetch rate'}
        </Button>
      </div>
      {lastSource && !fetchError && (
        <p className="text-[11px] text-[var(--color-neutral-500)]">
          Last source: {lastSource}
        </p>
      )}
      {fetchError && (
        <p className="text-xs text-[var(--color-danger-600)]">{fetchError}</p>
      )}
    </div>
  );
}

export default function MasterResourceFormPage(props: MasterPageRouteProps = {}) {
  const navigate = useNavigate();
  const { resourceKey, id, listPath, detailPath } = useMasterPageRoute(props);
  const resource = getMasterResource(resourceKey);
  const isEdit = Boolean(id);
  const { data: existing, isLoading } = useMasterDetail(
    resource?.key ?? resourceKey,
    resource?.basePath ?? '',
    id ?? '',
  );
  const mutations = useMasterMutations(resource?.key ?? resourceKey, resource?.basePath ?? '');

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  /** When true, create-mode department code follows the name suggestion. */
  const [codeAutoFilled, setCodeAutoFilled] = useState(true);

  const { data: currencyRows = [] } = useMasterOptions(
    'currencies',
    MASTER_PATHS.currencies,
    resource?.key === 'exchange-rates',
  );

  const { data: tenantCompanies = [] } = useTenantCompanies(
    resource?.key === 'departments' || resource?.key === 'branches',
  );

  const { data: orgProfile } = useOrganizationProfile();
  const tenantBaseCurrency = String(orgProfile?.base_currency ?? '')
    .trim()
    .toUpperCase() || 'AED';

  const selectedCurrencyCode = useMemo(() => {
    if (resource?.key !== 'exchange-rates') return undefined;
    const id = String(values.currency_id ?? '');
    const row = currencyRows.find((c) => String(c.id) === id);
    return typeof row?.code === 'string' ? row.code.toUpperCase() : undefined;
  }, [resource?.key, values.currency_id, currencyRows]);

  const selectedCompanyCode = useMemo(() => {
    if (resource?.key !== 'departments' && resource?.key !== 'branches') return undefined;
    const companyId = String(values.company_id ?? '');
    const row = tenantCompanies.find((c) => c.id === companyId);
    return row?.code?.trim() || undefined;
  }, [resource?.key, values.company_id, tenantCompanies]);

  // Exchange rates MUST use tenant base currency from organization profile.
  useEffect(() => {
    if (resource?.key !== 'exchange-rates' || isEdit) return;
    setValues((prev) => {
      if (String(prev.base_currency ?? '').toUpperCase() === tenantBaseCurrency) return prev;
      return { ...prev, base_currency: tenantBaseCurrency };
    });
  }, [resource?.key, isEdit, tenantBaseCurrency]);

  useEffect(() => {
    if (!resource) return;
    if (isEdit && existing) {
      const next: Record<string, unknown> = {};
      for (const field of resource.fields) {
        const raw = pickMasterField(existing, field.name);
        if (field.type === 'boolean') {
          next[field.name] = raw ?? false;
        } else if (field.type === 'multiselect') {
          next[field.name] = Array.isArray(raw)
            ? raw.map(String)
            : typeof raw === 'string' && raw
              ? raw.split(/[,\s]+/).filter(Boolean)
              : [];
        } else if (
          (field.name === 'customer_id' || field.name.endsWith('_id')) &&
          (raw == null || raw === '' || (typeof raw === 'string' && !isUuid(raw)))
        ) {
          next[field.name] = '';
        } else if (field.type === 'number') {
          next[field.name] =
            typeof raw === 'number'
              ? raw
              : typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))
                ? Number(raw)
                : '';
        } else {
          next[field.name] = raw ?? '';
        }
      }
      setValues(next);
      setCodeAutoFilled(false);
      return;
    }
    const defaults: Record<string, unknown> = {};
    for (const field of resource.fields) {
      if (field.type === 'boolean') defaults[field.name] = field.name === 'is_active' ? true : false;
      else if (field.type === 'multiselect') defaults[field.name] = [];
      else if (field.name === 'charge_group') defaults[field.name] = 'OTHER';
      else if (field.name === 'tax_type') defaults[field.name] = 'VAT';
      else if (field.name === 'service_type') defaults[field.name] = 'SEA_FCL_EXPORT';
      else if (resource.key === 'container-types' && field.name === 'size') {
        defaults.size = 'SIZE_20GP';
      } else if (resource.key === 'exchange-rates' && field.name === 'base_currency') {
        defaults.base_currency = tenantBaseCurrency;
      } else if (resource.key === 'exchange-rates' && field.name === 'rate_date') {
        defaults.rate_date = new Date().toISOString().slice(0, 10);
      }       else if (resource.key === 'exchange-rates' && field.name === 'source') {
        defaults.source = '';
      } else if (resource.key === 'branches' && field.name === 'country_code') {
        defaults.country_code = 'AE';
      } else if (
        (resource.key === 'ports' ||
          resource.key === 'seaport' ||
          resource.key === 'landport') &&
        field.name === 'mode'
      ) {
        defaults.mode = 'SEA';
      } else defaults[field.name] = '';
    }
    if (resource.key === 'container-types') {
      defaults.teu = getContainerTypeSizeMeta(String(defaults.size ?? 'SIZE_20GP'))?.teu ?? 1;
    }
    if (resource.listDefaults) {
      Object.assign(defaults, resource.listDefaults);
    }
    setValues(defaults);
    setCodeAutoFilled(true);
  }, [resource, isEdit, existing, tenantBaseCurrency]);

  if (!resource) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Unknown master resource.</p>;
  }

  if (isEdit && resource.createOnly) {
    return (
      <p className="text-sm text-[var(--color-neutral-500)]">
        This master does not support edit by id.
      </p>
    );
  }

  if (isEdit && isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const validation = validateMasterValues(resource.fields, values, resource.key, {
      selectedCurrencyCode,
      companyCode: selectedCompanyCode,
    });
    if (!validation.ok) {
      setError(validation.message);
      setFieldErrors(validation.fieldErrors);
      const rhfShape = Object.fromEntries(
        Object.entries(validation.fieldErrors).map(([key, message]) => [
          key,
          { message, type: 'validation' },
        ]),
      );
      focusFirstInvalidField(rhfShape);
      return;
    }
    const payload =
      resource.key === 'exchange-rates'
        ? { ...validation.data, base_currency: tenantBaseCurrency }
        : validation.data;
    setSubmitting(true);
    try {
      if (isEdit && id) {
        await mutations.update.mutateAsync({ id, dto: payload });
        navigate(detailPath(id));
      } else {
        const created = await mutations.create.mutateAsync(payload);
        if (resource.createOnly || !created?.id) {
          navigate(listPath);
        } else {
          navigate(detailPath(created.id));
        }
      }
    } catch (err) {
      setError(getServerErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <button
        type="button"
        className="text-xs font-medium text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
        onClick={() => navigate(listPath)}
      >
        ← Back to {resource.title}
      </button>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit' : 'Create'} {resource.title}
          </CardTitle>
        </CardHeader>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border px-4 py-3 text-sm"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resource.key === 'exchange-rates' && (
              <ExchangeRateAssist
                currencyId={String(values.currency_id ?? '')}
                baseCurrency={String(values.base_currency ?? '')}
                onPairError={(message) => {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (message) next.base_currency = message;
                    else delete next.base_currency;
                    return next;
                  });
                }}
                onRateFetched={({ rate, source, rate_date }) => {
                  setValues((prev) => ({
                    ...prev,
                    rate,
                    source,
                    ...(rate_date && !prev.rate_date ? { rate_date } : {}),
                  }));
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.rate;
                    delete next.source;
                    delete next.base_currency;
                    return next;
                  });
                }}
              />
            )}
            {resource.fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === 'textarea' || field.type === 'multiselect'
                    ? 'sm:col-span-2'
                    : ''
                }
              >
                <DynamicField
                  field={field}
                  value={
                    resource.key === 'exchange-rates' && field.name === 'base_currency'
                      ? tenantBaseCurrency
                      : values[field.name]
                  }
                  error={fieldErrors[field.name]}
                  resourceKey={resource.key}
                  baseCurrencyLocked={
                    resource.key === 'exchange-rates' ? tenantBaseCurrency : undefined
                  }
                  countryIso={
                    typeof values.country_code === 'string' && values.country_code
                      ? values.country_code
                      : undefined
                  }
                  onCountryIsoChange={(iso) => {
                    setValues((prev) => ({ ...prev, country_code: iso }));
                  }}
                  onBlurValidate={(fieldName, fieldValue) => {
                    if (
                      (resource.key !== 'departments' &&
                        resource.key !== 'designations' &&
                        resource.key !== 'branches') ||
                      fieldName !== 'name'
                    ) {
                      return;
                    }
                    const result = validateMasterValues(
                      resource.fields.filter((f) => f.name === 'name'),
                      { name: fieldValue },
                      resource.key,
                    );
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      if (result.ok) delete next.name;
                      else if (result.fieldErrors.name) next.name = result.fieldErrors.name;
                      return next;
                    });
                  }}
                  onChange={(next) => {
                    const usesNameCodeSync =
                      resource.key === 'departments' ||
                      resource.key === 'container-types' ||
                      resource.key === 'branches' ||
                      resource.key === 'units-of-measure' ||
                      resource.key === 'warehouses';
                    if (!isEdit && usesNameCodeSync && field.name === 'code') {
                      setCodeAutoFilled(false);
                    }
                    setValues((prev) => {
                      const updated: Record<string, unknown> = {
                        ...prev,
                        [field.name]: next,
                      };
                      if (resource.key === 'exchange-rates' && field.name === 'base_currency') {
                        updated.base_currency = tenantBaseCurrency;
                      }
                      // Countries: when ISO-2 is entered, suggest dial code from locale catalog.
                      if (
                        resource.key === 'countries' &&
                        field.name === 'iso_code' &&
                        typeof next === 'string'
                      ) {
                        const match = getCountry(next.trim().toUpperCase());
                        if (match) {
                          updated.dial_code = `+${match.dial}`;
                        }
                      }
                      // Ports: UN/LOCODE country prefix suggests country_code when known.
                      if (
                        (resource.key === 'ports' ||
                          resource.key === 'seaport' ||
                          resource.key === 'landport') &&
                        field.name === 'un_locode' &&
                        typeof next === 'string'
                      ) {
                        const cleaned = next.trim().toUpperCase().replace(/[\s-]+/g, '');
                        updated.un_locode = cleaned;
                        const iso = cleaned.slice(0, 2);
                        if (/^[A-Z]{2}$/.test(iso) && getCountry(iso)) {
                          updated.country_code = iso;
                        }
                      }
                      // Create mode: keep code in sync with name until user edits code.
                      if (
                        !isEdit &&
                        usesNameCodeSync &&
                        field.name === 'name' &&
                        codeAutoFilled &&
                        typeof next === 'string'
                      ) {
                        if (resource.key === 'departments') {
                          const companyId = String(updated.company_id ?? prev.company_id ?? '');
                          const company = tenantCompanies.find((c) => c.id === companyId);
                          updated.code = company?.code
                            ? suggestDepartmentCode(company.code, next)
                            : suggestCodeFromName(next);
                        } else if (resource.key === 'branches') {
                          const companyId = String(updated.company_id ?? prev.company_id ?? '');
                          const company = tenantCompanies.find((c) => c.id === companyId);
                          updated.code = company?.code
                            ? suggestBranchCode(company.code, next)
                            : suggestCodeFromName(next);
                        } else if (resource.key === 'warehouses') {
                          updated.code = suggestWarehouseCode(next);
                        } else if (resource.key === 'units-of-measure') {
                          updated.code = suggestCodeFromName(next);
                        } else {
                          updated.code =
                            resource.key === 'container-types'
                              ? suggestContainerTypeCode(next)
                              : suggestCodeFromName(next);
                        }
                      }
                      // Company change regenerates prefixed code while auto-fill is on.
                      if (
                        !isEdit &&
                        (resource.key === 'departments' || resource.key === 'branches') &&
                        field.name === 'company_id' &&
                        codeAutoFilled
                      ) {
                        const company = tenantCompanies.find((c) => c.id === String(next ?? ''));
                        const entityName = String(updated.name ?? prev.name ?? '');
                        if (company?.code && entityName) {
                          updated.code =
                            resource.key === 'branches'
                              ? suggestBranchCode(company.code, entityName)
                              : suggestDepartmentCode(company.code, entityName);
                        }
                      }
                      // Size is a single API field — enum pick or custom text.
                      if (
                        resource.key === 'container-types' &&
                        field.name === 'size' &&
                        typeof next === 'string'
                      ) {
                        const normalized = normalizeContainerTypeSize(next);
                        updated.size = normalized;
                        const meta = getContainerTypeSizeMeta(normalized);
                        if (meta) {
                          updated.teu = meta.teu;
                          if (!isEdit && codeAutoFilled) {
                            updated.code = meta.codeHint;
                          }
                        }
                      }
                      return updated;
                    });
                    if (
                      fieldErrors[field.name] ||
                      (field.name === 'name' && fieldErrors.code) ||
                      (field.name === 'company_id' && (fieldErrors.code || fieldErrors.company_id))
                    ) {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy[field.name];
                        if (
                          (resource.key === 'departments' || resource.key === 'branches') &&
                          (field.name === 'name' || field.name === 'company_id')
                        ) {
                          delete copy.code;
                          delete copy.company_id;
                        } else if (usesNameCodeSync && field.name === 'name') {
                          delete copy.code;
                        }
                        return copy;
                      });
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(listPath)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
