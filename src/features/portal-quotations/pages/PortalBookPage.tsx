import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { getServerErrorMessage } from '@/lib/validation';
import type { JobType } from '@/features/quotations/constants/quotation.constants';
import { JOB_TYPE_LABELS } from '@/features/quotations/constants/quotation.constants';
import {
  QUOTATION_WIZARD_STEPS,
  isQuotationWizardLastStep,
  quotationWizardStepKey,
} from '@/features/quotations/constants/jobTypeCardStyles';
import {
  JobTypeSelectGrid,
  QuotationWizardNav,
  QuotationWizardStepper,
} from '@/features/quotations/components/quotation-wizard';
import {
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { PortalPlaceSelect } from '../components/PortalPlaceSelect';
import {
  usePortalLocaleCurrency,
  usePortalCostingOptions,
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
import { isAirJobType, type PortalPortOption } from '../utils/loadPortalPortOptions';
import {
  buildPortalCustomerLines,
  buildPortalEstimateSnapshot,
  calcCustomerServiceLineAmount,
  parseCustomerUnitPrice,
  portalServiceQuantity,
} from '../utils/portalCustomerServicePrices';
import { applyPortalRouteFields, resolvePortalPortId } from '../utils/preparePortalQuotationRequest';
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

const CREATE_FIELDS: (keyof PortalBookQuoteFormValues)[] = ['job_type'];

const PORT_DETAILS_FIELDS: (keyof PortalBookQuoteFormValues)[] = [
  'origin_port',
  'dest_port',
  'currency_code',
  'commodity',
  'valid_until',
  'special_requirements',
];

const CONSIGNMENT_FIELDS: (keyof PortalBookQuoteFormValues)[] = [
  'gross_weight',
  'chargeable_weight',
  'volume_cbm',
  'pieces',
];

export default function PortalBookPage() {
  const navigate = useNavigate();
  const requestQuote = useRequestPortalQuotation();
  const estimateQuote = usePortalQuotationEstimate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('AE');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, string>>({});
  const [estimatePreview, setEstimatePreview] = useState<string | null>(null);
  const [packages, setPackages] = useState<PortalPackageDraft[]>([emptyPortalPackageDraft()]);
  const [placeCache, setPlaceCache] = useState<PortalPortOption[]>([]);

  const rememberPlaces = useCallback((places: PortalPortOption[]) => {
    setPlaceCache((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      let changed = false;
      for (const place of places) {
        const existing = map.get(place.id);
        if (!existing || existing.label !== place.label) {
          map.set(place.id, place);
          changed = true;
        }
      }
      return changed ? [...map.values()] : prev;
    });
  }, []);

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

  const { setValue, watch, control, register, formState, trigger, handleSubmit, getValues } = form;
  const currencyCode = watch('currency_code');
  const resolvedCurrencyCode =
    typeof currencyCode === 'string' && currencyCode.trim() ? currencyCode.trim() : '';
  const jobType = watch('job_type');
  const useAirports = isAirJobType(jobType);
  const originPort = watch('origin_port');
  const destPort = watch('dest_port');
  const formGrossWeight = watch('gross_weight');
  const formChargeableWeight = watch('chargeable_weight');
  const formVolumeCbm = watch('volume_cbm');
  const formPieces = watch('pieces');
  const commodity = watch('commodity');
  const validUntil = watch('valid_until');
  const packagesCbm = useMemo(() => sumPackageDraftCbm(packages), [packages]);
  const packagesWeight = useMemo(() => sumPackageDraftWeightKg(packages), [packages]);
  const packagesPieces = useMemo(() => sumPackageDraftPieces(packages), [packages]);
  const serviceCatalog = usePortalServiceCatalog(jobType);
  const costingDto = useMemo(() => {
    if (!jobType || !resolvedCurrencyCode) return null;
    const { packages: packageDtos } = buildPortalEstimatePackages(packages);
    return {
      job_type: jobType,
      currency_code: resolvedCurrencyCode,
      origin_port_id: resolvePortalPortId(originPort, placeCache),
      dest_port_id: resolvePortalPortId(destPort, placeCache),
      gross_weight: optionalNumberValue(formGrossWeight) ?? packagesWeight,
      chargeable_weight: optionalNumberValue(formChargeableWeight),
      volume_cbm: optionalNumberValue(formVolumeCbm) ?? packagesCbm,
      pieces: optionalNumberValue(formPieces) ?? packagesPieces,
      ...(packageDtos.length ? { packages: packageDtos } : {}),
    };
  }, [
    jobType,
    resolvedCurrencyCode,
    originPort,
    destPort,
    placeCache,
    formGrossWeight,
    formChargeableWeight,
    formVolumeCbm,
    formPieces,
    packagesWeight,
    packagesCbm,
    packagesPieces,
    packages,
  ]);
  const wizardStepKey = quotationWizardStepKey(step);
  const costingOptions = usePortalCostingOptions(costingDto, wizardStepKey === 'costing' || wizardStepKey === 'summary');
  const { errors } = formState;
  const catalogItems = useMemo(() => {
    const opts = costingOptions.data ?? [];
    const base = serviceCatalog.data ?? [];
    // Prefer lane/tariff costing-options; merge catalog for any missing codes.
    if (!opts.length) return base;
    const map = new Map<string, PortalServiceCatalogItem>();
    for (const opt of opts) {
      if (opt.code) map.set(opt.code, opt);
    }
    for (const item of base) {
      if (!item.code || map.has(item.code)) continue;
      map.set(item.code, item);
    }
    return [...map.values()];
  }, [serviceCatalog.data, costingOptions.data]);
  const catalogCodes = useMemo(
    () => new Set(catalogItems.map((s) => s.code).filter(Boolean)),
    [catalogItems],
  );
  const catalogByCode = useMemo(() => {
    const map = new Map<string, PortalServiceCatalogItem>();
    for (const item of catalogItems) {
      if (item.code) map.set(item.code, item);
    }
    return map;
  }, [catalogItems]);

  useEffect(() => {
    setSelectedServices([]);
    setServicePrices({});
    setEstimatePreview(null);
    setValue('origin_port', '');
    setValue('dest_port', '');
    setPlaceCache([]);
  }, [jobType, setValue]);

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
        typeof formGrossWeight === 'number' ? formGrossWeight : packagesWeight,
      volumeCbm: typeof formVolumeCbm === 'number' ? formVolumeCbm : packagesCbm,
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

  const mergeCustomerLines = () => {
    const serviceCodesForJob = selectedServices.filter((code) => catalogCodes.has(code));
    const priceDrafts = serviceCodesForJob.map((code) => ({
      code,
      unit_price: servicePrices[code] ?? '',
    }));
    return buildPortalCustomerLines(priceDrafts, catalogByCode, qtyInputs);
  };

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

    const values = getValues() as PortalBookQuotePayload;
    const currency = values.currency_code || resolvedCurrencyCode;
    if (!currency) {
      setError('Select a country so quote currency is set before estimating.');
      return;
    }

    const serviceCodesForJob = selectedServices.filter((code) => catalogCodes.has(code));
    const customerLines = mergeCustomerLines();
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
        volume_cbm: hasDimensions ? undefined : values.volume_cbm ?? packagesCbm,
        pieces: values.pieces,
        special_requirements: values.special_requirements?.trim() || undefined,
        valid_until: values.valid_until || undefined,
        packages: packageDtos,
        ...(serviceCodesForJob.length ? { service_codes: serviceCodesForJob } : {}),
        ...(customerLines.length ? { customer_lines: customerLines } : {}),
      },
      {
        origin_port: values.origin_port,
        dest_port: values.dest_port,
      },
      placeCache,
    );

    void estimateQuote
      .mutateAsync(base)
      .then((result) => {
        const total =
          result.total ?? result.lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
        const yourTotal =
          customerTotal != null ? ` · Your prices ${currency} ${customerTotal}` : '';
        setEstimatePreview(
          `Catalog estimate ${result.currencyCode || currency} ${total} · CBM ${result.volumeCbm ?? packagesCbm ?? '—'}${yourTotal}`,
        );
      })
      .catch((err) => setError(getServerErrorMessage(err) || 'Estimate failed.'));
  };

  const onFinalSubmit = handleSubmit(async (rawValues) => {
    setError(null);
    const values = rawValues as PortalBookQuotePayload;
    try {
      const currency = values.currency_code || resolvedCurrencyCode || 'AED';
      const serviceCodesForJob = selectedServices.filter((code) => catalogCodes.has(code));
      const customerLines = mergeCustomerLines();
      const estimateSnapshot = buildPortalEstimateSnapshot(currency, customerTotal);

      const { packages: packageDtos, hasDimensions } = buildPortalEstimatePackages(packages);
      const volumeCbm = hasDimensions ? undefined : values.volume_cbm ?? packagesCbm;

      const payload = applyPortalRouteFields(
        {
          job_type: values.job_type,
          currency_code: currency,
          commodity: values.commodity?.trim() || undefined,
          gross_weight: values.gross_weight ?? packagesWeight,
          chargeable_weight: values.chargeable_weight,
          volume_cbm: volumeCbm,
          pieces: values.pieces ?? packagesPieces,
          special_requirements: values.special_requirements?.trim() || undefined,
          valid_until: values.valid_until || undefined,
          ...(packageDtos.length ? { packages: packageDtos } : {}),
          ...(serviceCodesForJob.length ? { service_codes: serviceCodesForJob } : {}),
          ...(customerLines.length ? { customer_lines: customerLines } : {}),
          ...(estimateSnapshot ? { estimate_snapshot: estimateSnapshot } : {}),
        },
        {
          origin_port: values.origin_port,
          dest_port: values.dest_port,
        },
        placeCache,
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
  });

  const goNext = async () => {
    setError(null);
    if (isQuotationWizardLastStep(step)) {
      await onFinalSubmit();
      return;
    }

    const key = quotationWizardStepKey(step);
    if (key === 'create') {
      const ok = await trigger(CREATE_FIELDS);
      if (!ok || !jobType) return;
    } else if (key === 'ports') {
      const ok = await trigger(PORT_DETAILS_FIELDS);
      if (!ok || !resolvedCurrencyCode) {
        if (!resolvedCurrencyCode) {
          setError('Select a country so quote currency is set before continuing.');
        }
        return;
      }
    } else if (key === 'consignment') {
      const ok = await trigger(CONSIGNMENT_FIELDS);
      if (!ok) return;
    }

    setStep((current) => Math.min(current + 1, QUOTATION_WIZARD_STEPS.length - 1));
  };

  const placeLabel = (value: unknown) => {
    if (typeof value !== 'string' || !value) return '—';
    const fromCache = placeCache.find((p) => p.id === value);
    return fromCache?.label || value;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PortalPageHeader title="Request a quote" />

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
          className="space-y-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void goNext();
          }}
        >
          <QuotationWizardStepper currentStep={step} />

          {wizardStepKey === 'create' ? (
            <div className="space-y-5">
              <JobTypeSelectGrid
                value={jobType}
                onChange={(jt: JobType) =>
                  setValue('job_type', jt, { shouldValidate: true, shouldDirty: true })
                }
                error={errors.job_type?.message}
                heading="What type of Quotation would you like to request?"
              />
              <p className="text-xs text-[var(--color-neutral-500)]">
                Choose a job type first. Services and pricing are configured on the Costing step.
              </p>
            </div>
          ) : null}

          {wizardStepKey === 'ports' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="origin_port"
                control={control}
                render={({ field }) => (
                  <PortalPlaceSelect
                    name="origin_port"
                    label={useAirports ? 'Origin airport' : 'Origin port'}
                    required
                    jobType={jobType}
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={field.onChange}
                    onPlacesLoaded={rememberPlaces}
                    excludeId={typeof destPort === 'string' && destPort ? destPort : undefined}
                    placeholder={
                      useAirports ? 'Search airport e.g. DXB — Dubai' : 'Search port e.g. Jebel Ali'
                    }
                    error={errors.origin_port?.message}
                  />
                )}
              />
              <Controller
                name="dest_port"
                control={control}
                render={({ field }) => (
                  <PortalPlaceSelect
                    name="dest_port"
                    label={useAirports ? 'Destination airport' : 'Destination port'}
                    required
                    jobType={jobType}
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={field.onChange}
                    onPlacesLoaded={rememberPlaces}
                    excludeId={
                      typeof originPort === 'string' && originPort ? originPort : undefined
                    }
                    placeholder={
                      useAirports
                        ? 'Search airport e.g. LHR — London Heathrow'
                        : 'Search port e.g. Rotterdam'
                    }
                    error={errors.dest_port?.message}
                  />
                )}
              />
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
              <Input
                label="Valid until"
                type="date"
                error={errors.valid_until?.message}
                {...register('valid_until')}
              />
              <Input
                label="Commodity"
                error={errors.commodity?.message}
                {...register('commodity')}
              />
              <label className="block text-sm md:col-span-2">
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
            </div>
          ) : null}

          {wizardStepKey === 'consignment' ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">
                Planned Container / Consignment
              </h3>
              <div className="space-y-3 rounded-md border border-[var(--color-neutral-200)] p-3">
                <div>
                  <p className="text-sm font-medium">Packages</p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    Enter L × W × H in cm — CBM is calculated as metres × pieces. Gross weight is
                    required for estimate preview.
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
                          <p className="flex h-9 items-center text-sm text-[var(--color-neutral-800)]">
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
                  readOnly={packagesCbm != null}
                  {...numberInputProps(errors.volume_cbm?.message)}
                  {...register('volume_cbm', { setValueAs: optionalNumberValue })}
                />
                <Input
                  label="Pieces"
                  type="number"
                  step={1}
                  min={0}
                  error={errors.pieces?.message}
                  {...register('pieces', { setValueAs: optionalNumberValue })}
                />
              </div>
            </div>
          ) : null}

          {wizardStepKey === 'costing' ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Costing</h3>
              <p className="text-xs text-[var(--color-neutral-500)]">
                Choose services for this shipment and optionally enter the unit prices you want to
                propose. You can also continue without selecting services (lean enquiry).
              </p>
              {costingOptions.isError ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Could not load lane pricing options
                  {costingOptions.error instanceof Error
                    ? `: ${costingOptions.error.message}`
                    : '.'}{' '}
                  Showing the service catalog when available.
                </p>
              ) : null}
              {catalogItems.length ? (
                <div className="space-y-3 rounded-md border border-[var(--color-neutral-200)] p-3">
                  <div>
                    <p className="text-sm font-medium">Services &amp; your prices</p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      For{' '}
                      <strong>
                        {JOB_TYPE_LABELS[jobType as keyof typeof JOB_TYPE_LABELS] ?? jobType}
                      </strong>
                      , select a service then enter your proposed unit price.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {catalogItems.map((service) => {
                      const checked = selectedServices.includes(service.code);
                      const row = customerPriceRows.find((r) => r.code === service.code);
                      const entered = parseCustomerUnitPrice(servicePrices[service.code] ?? '');
                      const catalogPrice = service.unitPrice;
                      const isOwnPrice =
                        entered != null &&
                        (catalogPrice == null ||
                          !Number.isFinite(catalogPrice) ||
                          entered !== catalogPrice);
                      return (
                        <div
                          key={service.code}
                          className="space-y-2 rounded-md border border-[var(--color-neutral-100)] p-3"
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
                                {catalogPrice != null
                                  ? ` · suggested ${service.currencyCode || resolvedCurrencyCode || ''} ${catalogPrice}`
                                  : ''}
                              </span>
                            </span>
                          </label>
                          {checked ? (
                            <div className="grid gap-2 pl-6 sm:grid-cols-3">
                              <Input
                                id={`svc-price-${service.code}`}
                                label="Your unit price"
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
                                <p className="flex h-9 items-center text-sm">{row?.qty ?? '—'}</p>
                              </div>
                              <div className="flex flex-col justify-end">
                                <p className="text-xs font-medium text-[var(--color-neutral-600)]">
                                  Line total
                                  {isOwnPrice ? ' · your price' : ''}
                                </p>
                                <p className="flex h-9 items-center text-sm font-medium">
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
                      Your proposed total: {resolvedCurrencyCode} {customerTotal}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-neutral-500)]">
                  {serviceCatalog.isLoading || costingOptions.isLoading
                    ? 'Loading services for this job type…'
                    : 'No portal services are available for this job type yet. You can still submit a lean enquiry without pricing.'}
                </p>
              )}

              {selectedServices.length ? (
                <div className="space-y-2">
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
              ) : null}
            </div>
          ) : null}

          {wizardStepKey === 'summary' ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--color-neutral-800)]">Summary</h3>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Job type</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {JOB_TYPE_LABELS[jobType as keyof typeof JOB_TYPE_LABELS] ?? jobType}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Currency</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {resolvedCurrencyCode || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Origin</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {placeLabel(originPort)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Destination</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {placeLabel(destPort)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Commodity</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {commodity || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Valid until</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {validUntil || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Packages / cargo</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {[
                      `${packages.length} package${packages.length === 1 ? '' : 's'}`,
                      packagesWeight != null ? `${packagesWeight} kg` : null,
                      packagesCbm != null ? `${formatCbmDisplay(packagesCbm)} CBM` : null,
                      packagesPieces != null ? `${packagesPieces} pcs` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--color-neutral-500)]">Costing</dt>
                  <dd className="font-medium text-[var(--color-neutral-800)]">
                    {[
                      selectedServices.length
                        ? `${selectedServices.length} service${selectedServices.length === 1 ? '' : 's'}`
                        : null,
                      customerTotal != null
                        ? `your total ${resolvedCurrencyCode} ${customerTotal}`
                        : null,
                      estimatePreview ? 'catalog estimate ready' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'Lean enquiry (no services selected)'}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <QuotationWizardNav
            currentStep={step}
            totalSteps={QUOTATION_WIZARD_STEPS.length}
            onPrevious={() => setStep((s) => Math.max(0, s - 1))}
            onCancel={() => navigate('/portal/quotes')}
            onNext={() => void goNext()}
            isSubmitting={requestQuote.isPending}
            submitLabel="Submit quote request"
            disableNext={
              (wizardStepKey === 'create' && !jobType) ||
              ((wizardStepKey === 'ports' ||
                wizardStepKey === 'consignment' ||
                wizardStepKey === 'costing' ||
                wizardStepKey === 'summary') &&
                submitDisabled)
            }
          />
        </form>
      </PortalPanel>
    </div>
  );
}
