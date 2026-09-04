import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { getServerErrorMessage } from '@/lib/validation';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/features/quotations/constants/quotation.constants';
import {
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import {
  usePortalAirportOptions,
  usePortalLocaleCurrency,
  usePortalPortOptions,
  usePortalQuotationEstimate,
  usePortalServiceCatalog,
  useRequestPortalQuotation,
} from '../hooks/usePortalQuotations';
import {
  portalBookQuoteSchema,
  type PortalBookQuoteFormValues,
  type PortalBookQuotePayload,
} from '../schemas/portalQuotation.schema';
import {
  buildPortalEstimatePackages,
  calcPackageDraftCbm,
  emptyPortalPackageDraft,
  formatCbmDisplay,
  sumPackageDraftCbm,
  sumPackageDraftPieces,
  sumPackageDraftWeightKg,
  type PortalPackageDraft,
} from '../utils/buildPortalEstimatePackages';
import {
  isAirJobType,
  portalPortsToSelectOptions,
} from '../utils/loadPortalPortOptions';
import {
  buildCustomerPriceNote,
  calcCustomerServiceLineAmount,
  parseCustomerUnitPrice,
  portalServiceQuantity,
} from '../utils/portalCustomerServicePrices';
import { applyPortalRouteFields } from '../utils/preparePortalQuotationRequest';
import type { PortalServiceCatalogItem } from '../types/portalQuotations.types';

function numberInputProps(fieldError?: string) {
  return {
    type: 'number' as const,
    step: 'any' as const,
    min: 0,
    error: fieldError,
  };
}

function optionalNumberValue(value: unknown): number | undefined {
  if (value === '' || value == null) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function mergeSpecialRequirements(base: string | undefined, note: string | undefined): string | undefined {
  const a = base?.trim();
  const b = note?.trim();
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  const merged = `${a}\n\n${b}`;
  return merged.length > 2000 ? merged.slice(0, 2000) : merged;
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function PortalBookPage() {
  const navigate = useNavigate();
  const requestQuote = useRequestPortalQuotation();
  const estimateQuote = usePortalQuotationEstimate();
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('AE');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  /** Customer-entered unit prices keyed by service code. */
  const [servicePrices, setServicePrices] = useState<Record<string, string>>({});
  const [estimatePreview, setEstimatePreview] = useState<string | null>(null);
  const [packages, setPackages] = useState<PortalPackageDraft[]>([emptyPortalPackageDraft()]);
  const [placeSearch, setPlaceSearch] = useState('');
  const debouncedPlaceSearch = useDebouncedValue(placeSearch, 300);

  const {
    data: localeCurrency,
    isLoading: currencyLoading,
    isError: currencyError,
    error: currencyQueryError,
  } = usePortalLocaleCurrency(countryCode);

  const form = useForm<PortalBookQuoteFormValues>({
    resolver: zodResolver(portalBookQuoteSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      job_type: 'AIR_EXPORT',
      currency_code: '',
      origin_port: '',
      dest_port: '',
      commodity: '',
      gross_weight: undefined,
      chargeable_weight: undefined,
      volume_cbm: undefined,
      pieces: undefined,
      special_requirements: '',
      valid_until: '',
    },
  });

  const { setValue, watch, control, register, formState } = form;
  const currencyCode = watch('currency_code');
  const resolvedCurrencyCode =
    typeof currencyCode === 'string' && currencyCode.trim() ? currencyCode.trim() : '';
  const jobType = watch('job_type');
  const useAirports = isAirJobType(jobType);
  const portsQuery = usePortalPortOptions(debouncedPlaceSearch, !useAirports);
  const airportsQuery = usePortalAirportOptions(debouncedPlaceSearch, useAirports);
  const placeQuery = useAirports ? airportsQuery : portsQuery;
  const portOptions = useMemo(
    () => portalPortsToSelectOptions(placeQuery.data ?? []),
    [placeQuery.data],
  );
  const formGrossWeight = watch('gross_weight');
  const formChargeableWeight = watch('chargeable_weight');
  const formVolumeCbm = watch('volume_cbm');
  const formPieces = watch('pieces');
  const serviceCatalog = usePortalServiceCatalog(jobType);
  const { errors } = formState;
  const catalogCodes = useMemo(
    () => new Set((serviceCatalog.data ?? []).map((s) => s.code).filter(Boolean)),
    [serviceCatalog.data],
  );
  const catalogByCode = useMemo(() => {
    const map = new Map<string, PortalServiceCatalogItem>();
    for (const item of serviceCatalog.data ?? []) {
      if (item.code) map.set(item.code, item);
    }
    return map;
  }, [serviceCatalog.data]);

  const packagesCbm = useMemo(() => sumPackageDraftCbm(packages), [packages]);
  const packagesWeight = useMemo(() => sumPackageDraftWeightKg(packages), [packages]);
  const packagesPieces = useMemo(() => sumPackageDraftPieces(packages), [packages]);

  // Catalog services are per job type — drop selections when job type changes.
  useEffect(() => {
    setSelectedServices([]);
    setServicePrices({});
    setEstimatePreview(null);
  }, [jobType]);

  // Drop invalid codes when catalog refreshes.
  useEffect(() => {
    setSelectedServices((prev) => {
      if (!prev.length) return prev;
      if (!catalogCodes.size) return [];
      const next = prev.filter((code) => catalogCodes.has(code));
      return next.length === prev.length ? prev : next;
    });
  }, [catalogCodes]);

  useEffect(() => {
    if (!localeCurrency) {
      setValue('currency_code', '', { shouldValidate: false });
      return;
    }
    setValue('currency_code', localeCurrency, { shouldValidate: true });
  }, [localeCurrency, setValue]);

  // Auto-fill cargo totals from packages (CBM whenever L×W×H are present).
  useEffect(() => {
    if (packagesCbm != null) {
      setValue('volume_cbm', packagesCbm, { shouldValidate: true, shouldDirty: true });
    }
    if (packagesWeight != null) {
      setValue('gross_weight', packagesWeight, { shouldValidate: true, shouldDirty: true });
    }
    if (packagesPieces != null) {
      setValue('pieces', packagesPieces, { shouldValidate: true, shouldDirty: true });
    }
  }, [packagesCbm, packagesWeight, packagesPieces, setValue]);

  const qtyInputs = useMemo(
    () => ({
      chargeableWeightKg:
        typeof formChargeableWeight === 'number' ? formChargeableWeight : undefined,
      grossWeightKg:
        typeof formGrossWeight === 'number'
          ? formGrossWeight
          : packagesWeight,
      volumeCbm:
        typeof formVolumeCbm === 'number' ? formVolumeCbm : packagesCbm,
      pieces: typeof formPieces === 'number' ? formPieces : packagesPieces,
    }),
    [
      formChargeableWeight,
      formGrossWeight,
      formVolumeCbm,
      formPieces,
      packagesWeight,
      packagesCbm,
      packagesPieces,
    ],
  );

  const customerPriceRows = useMemo(() => {
    return selectedServices
      .filter((code) => catalogCodes.has(code))
      .map((code) => {
        const item = catalogByCode.get(code);
        const unitPrice = parseCustomerUnitPrice(servicePrices[code] ?? '');
        const amount =
          unitPrice != null
            ? calcCustomerServiceLineAmount(unitPrice, item?.pricingBasis, qtyInputs)
            : undefined;
        const qty = portalServiceQuantity(item?.pricingBasis, qtyInputs);
        return { code, item, unitPrice, amount, qty };
      });
  }, [selectedServices, catalogCodes, catalogByCode, servicePrices, qtyInputs]);

  const customerTotal = useMemo(() => {
    let total = 0;
    let any = false;
    for (const row of customerPriceRows) {
      if (row.amount == null) continue;
      total += row.amount;
      any = true;
    }
    return any ? Math.round(total * 100) / 100 : undefined;
  }, [customerPriceRows]);

  const portHint =
    placeQuery.isLoading
      ? `Loading ${useAirports ? 'airports' : 'ports'}…`
      : placeQuery.isError
        ? `${useAirports ? 'Airport' : 'Port'} list unavailable — type the exact name (e.g. Dubai, Jebel Ali).`
        : portOptions.length > 0
          ? `Search by ${useAirports ? 'IATA' : 'port'} code or name, or type your own.`
          : `Type ${useAirports ? 'airport' : 'port'} name or code.`;

  const submitDisabled =
    requestQuote.isPending || currencyLoading || currencyError || !resolvedCurrencyCode;

  const updatePackage = (index: number, patch: Partial<PortalPackageDraft>) => {
    setPackages((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setEstimatePreview(null);
  };

  const toggleService = (code: string, checked: boolean) => {
    setEstimatePreview(null);
    if (checked) {
      setSelectedServices((prev) => (prev.includes(code) ? prev : [...prev, code]));
      setServicePrices((prev) => {
        if (prev[code] != null && prev[code] !== '') return prev;
        const catalogPrice = catalogByCode.get(code)?.unitPrice;
        return {
          ...prev,
          [code]: catalogPrice != null && Number.isFinite(catalogPrice) ? String(catalogPrice) : '',
        };
      });
      return;
    }
    setSelectedServices((prev) => prev.filter((c) => c !== code));
  };

  const runEstimatePreview = () => {
    setError(null);
    setEstimatePreview(null);

    const values = form.getValues() as PortalBookQuotePayload;
    const currency = values.currency_code || resolvedCurrencyCode;
    if (!currency) {
      setError('Select a country so quote currency is set before estimating.');
      return;
    }

    const serviceCodesForJob = selectedServices.filter((code) => catalogCodes.has(code));
    if (!serviceCodesForJob.length) {
      setError('Select at least one service to preview an estimate.');
      return;
    }

    const { packages: packageDtos, error: packageError, hasDimensions } =
      buildPortalEstimatePackages(packages);
    if (packageError || !packageDtos.length) {
      setError(packageError || 'Add at least one package with gross weight for estimate.');
      return;
    }

    const base = applyPortalRouteFields(
      {
        job_type: values.job_type,
        currency_code: currency,
        commodity: values.commodity?.trim() || undefined,
        gross_weight: values.gross_weight,
        chargeable_weight: values.chargeable_weight,
        // Backend ignores client volume_cbm when package dims are present.
        volume_cbm: hasDimensions ? undefined : values.volume_cbm ?? packagesCbm,
        pieces: values.pieces,
        special_requirements: values.special_requirements?.trim() || undefined,
        valid_until: values.valid_until || undefined,
        packages: packageDtos,
        service_codes: serviceCodesForJob,
      },
      {
        origin_port: values.origin_port,
        dest_port: values.dest_port,
      },
      placeQuery.data ?? [],
    );

    void estimateQuote
      .mutateAsync(base)
      .then((result) => {
        const total =
          result.total ?? result.lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
        const yourTotal =
          customerTotal != null
            ? ` · Your prices ${currency} ${customerTotal}`
            : '';
        setEstimatePreview(
          `Catalog estimate ${result.currencyCode || currency} ${total} · CBM ${result.volumeCbm ?? packagesCbm ?? '—'}${yourTotal}`,
        );
      })
      .catch((err) => setError(getServerErrorMessage(err) || 'Estimate failed.'));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PortalPageHeader
        title="Request a quote"
        description="Enter package dimensions for automatic CBM, add your own service prices, then submit the enquiry."
      />

      <PortalPanel padded>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit(async (rawValues) => {
            setError(null);
            const values = rawValues as PortalBookQuotePayload;
            try {
              const currency = values.currency_code || resolvedCurrencyCode || 'AED';
              const priceNote = buildCustomerPriceNote(
                selectedServices
                  .filter((code) => catalogCodes.has(code))
                  .map((code) => ({
                    code,
                    unit_price: servicePrices[code] ?? '',
                  })),
                catalogByCode,
                currency,
                qtyInputs,
              );

              const hasPackageDims = packages.some(
                (pkg) =>
                  pkg.length_cm.trim() && pkg.width_cm.trim() && pkg.height_cm.trim(),
              );
              const volumeCbm = hasPackageDims ? undefined : values.volume_cbm ?? packagesCbm;

              // Enquiry only — OpenAPI PortalQuotationRequestDto forbids packages / service_codes.
              const payload = applyPortalRouteFields(
                {
                  job_type: values.job_type,
                  currency_code: currency,
                  commodity: values.commodity?.trim() || undefined,
                  gross_weight: values.gross_weight ?? packagesWeight,
                  chargeable_weight: values.chargeable_weight,
                  volume_cbm: volumeCbm,
                  pieces: values.pieces ?? packagesPieces,
                  special_requirements: mergeSpecialRequirements(
                    values.special_requirements,
                    priceNote,
                  ),
                  valid_until: values.valid_until || undefined,
                },
                {
                  origin_port: values.origin_port,
                  dest_port: values.dest_port,
                },
                placeQuery.data ?? [],
              );

              const created = await requestQuote.mutateAsync(payload);
              if (created.id && created.id !== 'new') {
                navigate(`/portal/quotes/${created.id}`);
              } else {
                navigate('/portal/quotes');
              }
            } catch (err) {
              setError(
                err instanceof PortalApiError || err instanceof Error
                  ? err.message
                  : getServerErrorMessage(err) || 'Could not submit quote request.',
              );
            }
          })}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Job type <span className="text-[var(--color-danger-500)]">*</span>
            </span>
            <select className={portalSelectClassName} {...register('job_type')}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
            {errors.job_type && (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">{errors.job_type.message}</p>
            )}
          </label>

          <div className="space-y-1">
            <CountrySelect
              label="Currency"
              required
              allowEmpty={false}
              value={countryCode}
              onChange={(iso) => {
                setCountryCode(iso);
                setValue('currency_code', '', { shouldValidate: false });
              }}
              error={errors.currency_code?.message}
              hint={
                currencyLoading
                  ? 'Resolving currency…'
                  : currencyCode
                    ? `Quote currency: ${currencyCode}`
                    : 'Select a country to set the quote currency'
              }
            />
            <input type="hidden" {...register('currency_code')} />
            {currencyError && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {currencyQueryError instanceof Error
                  ? currencyQueryError.message
                  : 'Could not resolve currency for this country.'}
              </p>
            )}
          </div>

          <Controller
            name="origin_port"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="origin_port"
                label={useAirports ? 'Origin airport' : 'Origin port'}
                required
                value={typeof field.value === 'string' ? field.value : ''}
                options={portOptions}
                onChange={field.onChange}
                onQueryChange={setPlaceSearch}
                allowManualValue
                allowManualUuid={false}
                placeholder="e.g. DXB — Dubai"
                hint={portHint}
                error={errors.origin_port?.message}
              />
            )}
          />

          <Controller
            name="dest_port"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                name="dest_port"
                label={useAirports ? 'Destination airport' : 'Destination port'}
                required
                value={typeof field.value === 'string' ? field.value : ''}
                options={portOptions}
                onChange={field.onChange}
                onQueryChange={setPlaceSearch}
                allowManualValue
                allowManualUuid={false}
                placeholder="e.g. LHR — London Heathrow"
                hint={portHint}
                error={errors.dest_port?.message}
              />
            )}
          />

          <Input
            label="Commodity"
            hint="Required if weight, volume, and pieces are all empty"
            error={errors.commodity?.message}
            {...register('commodity')}
          />

          <div className="space-y-3 rounded-md border border-[var(--color-neutral-200)] p-3">
            <div>
              <p className="text-sm font-medium">Packages</p>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Enter L × W × H in cm — CBM is calculated as metres × pieces
                ((L÷100) × (W÷100) × (H÷100) × pieces). Gross weight is required for estimate
                preview. When dimensions are sent, the server ignores manual volume_cbm.
              </p>
            </div>
            {packages.map((pkg, index) => {
              const pkgCbm = calcPackageDraftCbm(pkg);
              return (
                <div
                  key={index}
                  className="space-y-2 rounded-md border border-[var(--color-neutral-100)] bg-[var(--color-neutral-50)] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--color-neutral-600)]">
                      Package {index + 1}
                    </p>
                    {packages.length > 1 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPackages((prev) => prev.filter((_, i) => i !== index));
                          setEstimatePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input
                      id={`pkg-${index}-length`}
                      label="Length (cm)"
                      type="number"
                      step="any"
                      min={0}
                      value={pkg.length_cm}
                      onChange={(e) => updatePackage(index, { length_cm: e.target.value })}
                    />
                    <Input
                      id={`pkg-${index}-width`}
                      label="Width (cm)"
                      type="number"
                      step="any"
                      min={0}
                      value={pkg.width_cm}
                      onChange={(e) => updatePackage(index, { width_cm: e.target.value })}
                    />
                    <Input
                      id={`pkg-${index}-height`}
                      label="Height (cm)"
                      type="number"
                      step="any"
                      min={0}
                      value={pkg.height_cm}
                      onChange={(e) => updatePackage(index, { height_cm: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Input
                      id={`pkg-${index}-weight`}
                      label="Gross weight (kg)"
                      required
                      type="number"
                      step="any"
                      min={0}
                      value={pkg.gross_weight_kg}
                      onChange={(e) => updatePackage(index, { gross_weight_kg: e.target.value })}
                    />
                    <Input
                      id={`pkg-${index}-pieces`}
                      label="Pieces"
                      type="number"
                      step={1}
                      min={1}
                      value={pkg.pieces}
                      onChange={(e) => updatePackage(index, { pieces: e.target.value })}
                    />
                    <div className="flex flex-col justify-end">
                      <p className="text-xs font-medium text-[var(--color-neutral-600)]">CBM</p>
                      <p className="h-9 flex items-center text-sm text-[var(--color-neutral-800)]">
                        {formatCbmDisplay(pkgCbm)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setPackages((prev) => [...prev, emptyPortalPackageDraft()]);
                  setEstimatePreview(null);
                }}
              >
                Add package
              </Button>
              <p className="text-xs text-[var(--color-neutral-600)]">
                Total CBM: <strong>{formatCbmDisplay(packagesCbm)}</strong>
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Gross weight (kg)"
              hint={packagesWeight != null ? 'Filled from packages' : undefined}
              {...numberInputProps(errors.gross_weight?.message)}
              {...register('gross_weight', { setValueAs: optionalNumberValue })}
            />
            <Input
              label="Chargeable weight (kg)"
              {...numberInputProps(errors.chargeable_weight?.message)}
              {...register('chargeable_weight', { setValueAs: optionalNumberValue })}
            />
            <Input
              label="Volume (CBM)"
              hint={
                packagesCbm != null
                  ? 'Calculated from package L × W × H'
                  : 'Enter package dimensions to auto-calculate'
              }
              readOnly={packagesCbm != null}
              {...numberInputProps(errors.volume_cbm?.message)}
              {...register('volume_cbm', { setValueAs: optionalNumberValue })}
            />
            <Input
              label="Pieces"
              type="number"
              step={1}
              min={0}
              hint={packagesPieces != null ? 'Filled from packages' : undefined}
              error={errors.pieces?.message}
              {...register('pieces', { setValueAs: optionalNumberValue })}
            />
          </div>

          <Input
            label="Valid until"
            type="date"
            error={errors.valid_until?.message}
            {...register('valid_until')}
          />

          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Special requirements
            </span>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
              maxLength={2000}
              {...register('special_requirements')}
            />
            {errors.special_requirements && (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">
                {errors.special_requirements.message}
              </p>
            )}
          </label>

          {serviceCatalog.data?.length ? (
            <div className="space-y-3 rounded-md border border-[var(--color-neutral-200)] p-3">
              <div>
                <p className="text-sm font-medium">Services &amp; your prices</p>
                <p className="text-xs text-[var(--color-neutral-500)]">
                  Select services for{' '}
                  <strong>
                    {JOB_TYPE_LABELS[jobType as keyof typeof JOB_TYPE_LABELS] ?? jobType}
                  </strong>
                  , then enter <em>your</em> unit price. Line totals use the catalog pricing basis
                  (flat / per kg / per CBM / per piece). Your prices are included on the enquiry for
                  the forwarder.
                </p>
              </div>
              <div className="space-y-3">
                {serviceCatalog.data.map((service) => {
                  const checked = selectedServices.includes(service.code);
                  const row = customerPriceRows.find((r) => r.code === service.code);
                  return (
                    <div
                      key={service.code}
                      className="rounded-md border border-[var(--color-neutral-100)] p-3 space-y-2"
                    >
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          onChange={(e) => toggleService(service.code, e.target.checked)}
                        />
                        <span>
                          <span className="font-medium">{service.name}</span>
                          <span className="block text-xs text-[var(--color-neutral-500)]">
                            {service.code}
                            {service.pricingBasis ? ` · ${service.pricingBasis}` : ''}
                            {service.unitPrice != null
                              ? ` · catalog ${service.currencyCode || ''} ${service.unitPrice}`
                              : ''}
                          </span>
                        </span>
                      </label>
                      {checked ? (
                        <div className="grid gap-2 sm:grid-cols-3 pl-6">
                          <Input
                            id={`svc-price-${service.code}`}
                            label="Your unit price"
                            required
                            type="number"
                            step="any"
                            min={0}
                            value={servicePrices[service.code] ?? ''}
                            onChange={(e) => {
                              setServicePrices((prev) => ({
                                ...prev,
                                [service.code]: e.target.value,
                              }));
                              setEstimatePreview(null);
                            }}
                          />
                          <div className="flex flex-col justify-end">
                            <p className="text-xs font-medium text-[var(--color-neutral-600)]">
                              Qty ({service.pricingBasis || 'FLAT'})
                            </p>
                            <p className="h-9 flex items-center text-sm">
                              {row?.qty ?? '—'}
                            </p>
                          </div>
                          <div className="flex flex-col justify-end">
                            <p className="text-xs font-medium text-[var(--color-neutral-600)]">
                              Line total
                            </p>
                            <p className="h-9 flex items-center text-sm font-medium">
                              {row?.amount != null
                                ? `${resolvedCurrencyCode || ''} ${row.amount}`
                                : '—'}
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {customerTotal != null ? (
                <p className="text-sm font-medium text-[var(--color-neutral-800)]">
                  Your total: {resolvedCurrencyCode} {customerTotal}
                </p>
              ) : (
                <p className="text-xs text-[var(--color-neutral-500)]">
                  Select services and enter your unit prices to see a running total.
                </p>
              )}

              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={estimateQuote.isPending}
                onClick={runEstimatePreview}
              >
                {estimateQuote.isPending ? 'Estimating…' : 'Compare with catalog estimate'}
              </Button>
              {estimatePreview ? (
                <p className="text-xs text-[var(--color-neutral-600)]">{estimatePreview}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-[var(--color-neutral-500)]">
              {serviceCatalog.isLoading
                ? 'Loading services for this job type…'
                : 'No portal-visible services for this job type yet. You can still submit an enquiry; your forwarder will price it manually.'}
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={submitDisabled}>
            {requestQuote.isPending ? 'Submitting…' : 'Submit quote request'}
          </Button>
        </form>
      </PortalPanel>
    </div>
  );
}
