import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/features/quotations/constants/quotation.constants';
import {
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import {
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
import { portalPortsToSelectOptions } from '../utils/loadPortalPortOptions';
import { applyPortalRouteFields } from '../utils/preparePortalQuotationRequest';

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

export default function PortalBookPage() {
  const navigate = useNavigate();
  const requestQuote = useRequestPortalQuotation();
  const estimateQuote = usePortalQuotationEstimate();
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('AE');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [estimatePreview, setEstimatePreview] = useState<string | null>(null);

  const {
    data: localeCurrency,
    isLoading: currencyLoading,
    isError: currencyError,
    error: currencyQueryError,
  } = usePortalLocaleCurrency(countryCode);

  const portsQuery = usePortalPortOptions();
  const portOptions = useMemo(
    () => portalPortsToSelectOptions(portsQuery.data ?? []),
    [portsQuery.data],
  );

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
  const serviceCatalog = usePortalServiceCatalog(jobType);
  const { errors } = formState;

  useEffect(() => {
    if (!localeCurrency) {
      setValue('currency_code', '', { shouldValidate: false });
      return;
    }
    setValue('currency_code', localeCurrency, { shouldValidate: true });
  }, [localeCurrency, setValue]);

  const portHint =
    portsQuery.isLoading
      ? 'Loading port list…'
      : portsQuery.isError
        ? 'Port list unavailable — type the exact port or airport name (e.g. Dubai, Jebel Ali).'
        : portOptions.length > 0
          ? 'Search by port code or name, or type your own.'
          : 'Type origin port name or code (e.g. DXB — Dubai).';

  const submitDisabled =
    requestQuote.isPending || currencyLoading || currencyError || !resolvedCurrencyCode;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PortalPageHeader
        title="Request a quote"
        description="Submit freight details and your forwarder will follow up with pricing."
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
              const payload = applyPortalRouteFields(
                {
                  job_type: values.job_type,
                  currency_code: values.currency_code || resolvedCurrencyCode || 'AED',
                  commodity: values.commodity?.trim() || undefined,
                  gross_weight: values.gross_weight,
                  chargeable_weight: values.chargeable_weight,
                  volume_cbm: values.volume_cbm,
                  pieces: values.pieces,
                  special_requirements: values.special_requirements?.trim() || undefined,
                  valid_until: values.valid_until || undefined,
                  ...(selectedServices.length ? { service_codes: selectedServices } : {}),
                },
                {
                  origin_port: values.origin_port,
                  dest_port: values.dest_port,
                },
                portsQuery.data ?? [],
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
                  : 'Could not submit quote request.',
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
                label="Origin port"
                required
                value={typeof field.value === 'string' ? field.value : ''}
                options={portOptions}
                onChange={field.onChange}
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
                label="Destination port"
                required
                value={typeof field.value === 'string' ? field.value : ''}
                options={portOptions}
                onChange={field.onChange}
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
            <div className="space-y-2 rounded-md border border-[var(--color-neutral-200)] p-3">
              <p className="text-sm font-medium">Optional services</p>
              {serviceCatalog.data.map((service) => (
                <label key={service.code} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.code)}
                    onChange={(e) => {
                      setSelectedServices((prev) =>
                        e.target.checked
                          ? [...prev, service.code]
                          : prev.filter((code) => code !== service.code),
                      );
                    }}
                  />
                  <span>
                    {service.name} ({service.currencyCode || ''} {service.unitPrice ?? ''})
                  </span>
                </label>
              ))}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={estimateQuote.isPending}
                onClick={() => {
                  setEstimatePreview(null);
                  const values = form.getValues() as PortalBookQuotePayload;
                  void estimateQuote
                    .mutateAsync({
                      job_type: values.job_type,
                      currency_code: values.currency_code,
                      gross_weight: values.gross_weight,
                      chargeable_weight: values.chargeable_weight,
                      volume_cbm: values.volume_cbm,
                      pieces: values.pieces,
                      valid_until: values.valid_until || undefined,
                      ...(selectedServices.length ? { service_codes: selectedServices } : {}),
                    })
                    .then((result) => {
                      const total =
                        result.total ??
                        result.lines.reduce((sum, line) => sum + (line.amount ?? 0), 0);
                      setEstimatePreview(
                        `Estimated ${result.currencyCode || values.currency_code} ${total} · CBM ${result.volumeCbm ?? '—'}`,
                      );
                    })
                    .catch((err) =>
                      setError(
                        err instanceof PortalApiError || err instanceof Error
                          ? err.message
                          : 'Estimate failed.',
                      ),
                    );
                }}
              >
                {estimateQuote.isPending ? 'Estimating…' : 'Preview estimate'}
              </Button>
              {estimatePreview ? (
                <p className="text-xs text-[var(--color-neutral-600)]">{estimatePreview}</p>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" className="w-full sm:w-auto" disabled={submitDisabled}>
            {requestQuote.isPending ? 'Submitting…' : 'Submit quote request'}
          </Button>
        </form>
      </PortalPanel>
    </div>
  );
}
