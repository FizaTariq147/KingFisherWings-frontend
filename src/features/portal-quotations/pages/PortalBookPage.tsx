import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { PortalApiError } from '@/lib/portalApiClient';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/features/quotations/constants/quotation.constants';
import {
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import {
  usePortalLocaleCurrency,
  useRequestPortalQuotation,
} from '../hooks/usePortalQuotations';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || isUuid(v), 'Enter a valid UUID');

const optionalNonNegative = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((v) => {
    if (!v?.trim()) return true;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0;
  }, 'Must be 0 or greater');

const schema = z.object({
  job_type: z.enum(JOB_TYPES, { required_error: 'Job type is required' }),
  currency_code: z
    .string()
    .trim()
    .min(1, 'Select a country to set currency')
    .transform((v) => v.toUpperCase())
    .pipe(z.string().length(3, 'Currency could not be resolved for this country')),
  origin_port_id: optionalUuid,
  dest_port_id: optionalUuid,
  commodity: z.string().trim().max(500, 'Commodity is too long').optional().or(z.literal('')),
  gross_weight: optionalNonNegative,
  chargeable_weight: optionalNonNegative,
  volume_cbm: optionalNonNegative,
  pieces: optionalNonNegative,
  special_requirements: z
    .string()
    .trim()
    .max(2000, 'Special requirements are too long')
    .optional()
    .or(z.literal('')),
  valid_until: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => {
      if (!v) return true;
      const d = Date.parse(v);
      if (Number.isNaN(d)) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today.getTime();
    }, 'Valid-until date must be today or later'),
});

type FormValues = z.input<typeof schema>;

function parseOptionalNumber(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default function PortalBookPage() {
  const navigate = useNavigate();
  const requestQuote = useRequestPortalQuotation();
  const portalUser = usePortalAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('AE');

  const {
    data: localeCurrency,
    isLoading: currencyLoading,
    isError: currencyError,
    error: currencyQueryError,
  } = usePortalLocaleCurrency(countryCode);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      job_type: 'AIR_EXPORT',
      currency_code: '',
      origin_port_id: '',
      dest_port_id: '',
      commodity: '',
      gross_weight: '',
      chargeable_weight: '',
      volume_cbm: '',
      pieces: '',
      special_requirements: '',
      valid_until: '',
    },
  });

  const { setValue, watch } = form;
  const currencyCode = watch('currency_code');

  useEffect(() => {
    if (!localeCurrency) {
      setValue('currency_code', '', { shouldValidate: false });
      return;
    }
    setValue('currency_code', localeCurrency, { shouldValidate: true });
  }, [localeCurrency, setValue]);

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
          onSubmit={form.handleSubmit(async (values) => {
            setError(null);
            try {
              const created = await requestQuote.mutateAsync({
                job_type: values.job_type,
                currency_code: String(values.currency_code).trim().toUpperCase(),
                origin_port_id: values.origin_port_id?.trim() || undefined,
                dest_port_id: values.dest_port_id?.trim() || undefined,
                commodity: values.commodity?.trim() || undefined,
                gross_weight: parseOptionalNumber(values.gross_weight),
                chargeable_weight: parseOptionalNumber(values.chargeable_weight),
                volume_cbm: parseOptionalNumber(values.volume_cbm),
                pieces: parseOptionalNumber(values.pieces),
                special_requirements: values.special_requirements?.trim() || undefined,
                valid_until: values.valid_until || undefined,
                contact_name: portalUser?.fullName?.trim() || undefined,
                contact_email: portalUser?.email?.trim() || undefined,
              });
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
            <select className={portalSelectClassName} {...form.register('job_type')}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
            {form.formState.errors.job_type && (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">
                {form.formState.errors.job_type.message}
              </p>
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
              error={form.formState.errors.currency_code?.message}
              hint={
                currencyLoading
                  ? 'Resolving currency…'
                  : currencyCode
                    ? `Quote currency: ${currencyCode}`
                    : 'Select a country to set the quote currency'
              }
            />
            <input type="hidden" {...form.register('currency_code')} />
            {currencyError && (
              <p className="text-xs text-[var(--color-danger-500)]">
                {currencyQueryError instanceof Error
                  ? currencyQueryError.message
                  : 'Could not resolve currency for this country.'}
              </p>
            )}
          </div>
          <Input
            label="Origin port ID (optional)"
            hint="UUID"
            error={form.formState.errors.origin_port_id?.message}
            {...form.register('origin_port_id')}
          />
          <Input
            label="Destination port ID (optional)"
            hint="UUID"
            error={form.formState.errors.dest_port_id?.message}
            {...form.register('dest_port_id')}
          />
          <Input
            label="Commodity"
            error={form.formState.errors.commodity?.message}
            {...form.register('commodity')}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Gross weight"
              type="number"
              step="any"
              min={0}
              error={form.formState.errors.gross_weight?.message}
              {...form.register('gross_weight')}
            />
            <Input
              label="Chargeable weight"
              type="number"
              step="any"
              min={0}
              error={form.formState.errors.chargeable_weight?.message}
              {...form.register('chargeable_weight')}
            />
            <Input
              label="Volume (CBM)"
              type="number"
              step="any"
              min={0}
              error={form.formState.errors.volume_cbm?.message}
              {...form.register('volume_cbm')}
            />
            <Input
              label="Pieces"
              type="number"
              min={0}
              step={1}
              error={form.formState.errors.pieces?.message}
              {...form.register('pieces')}
            />
          </div>
          <Input
            label="Valid until"
            type="date"
            error={form.formState.errors.valid_until?.message}
            {...form.register('valid_until')}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Special requirements
            </span>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
              {...form.register('special_requirements')}
            />
            {form.formState.errors.special_requirements && (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">
                {form.formState.errors.special_requirements.message}
              </p>
            )}
          </label>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={requestQuote.isPending || currencyLoading || !currencyCode}
          >
            {requestQuote.isPending ? 'Submitting…' : 'Submit quote request'}
          </Button>
        </form>
      </PortalPanel>
    </div>
  );
}
