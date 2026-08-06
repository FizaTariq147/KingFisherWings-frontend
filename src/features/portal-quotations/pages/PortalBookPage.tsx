import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { JOB_TYPES, JOB_TYPE_LABELS } from '@/features/quotations/constants/quotation.constants';
import {
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { useRequestPortalQuotation } from '../hooks/usePortalQuotations';

const schema = z.object({
  job_type: z.string().min(1, 'Job type is required'),
  currency_code: z.string().trim().length(3, 'Use a 3-letter currency code'),
  origin_port_id: z.string().optional(),
  dest_port_id: z.string().optional(),
  commodity: z.string().optional(),
  gross_weight: z.string().optional(),
  chargeable_weight: z.string().optional(),
  volume_cbm: z.string().optional(),
  pieces: z.string().optional(),
  special_requirements: z.string().optional(),
  valid_until: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function parseOptionalNumber(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseOptionalUuid(value?: string): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
    ? v
    : undefined;
}

export default function PortalBookPage() {
  const navigate = useNavigate();
  const requestQuote = useRequestPortalQuotation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_type: 'AIR_EXPORT',
      currency_code: 'AED',
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
                currency_code: values.currency_code.trim().toUpperCase(),
                origin_port_id: parseOptionalUuid(values.origin_port_id),
                dest_port_id: parseOptionalUuid(values.dest_port_id),
                commodity: values.commodity?.trim() || undefined,
                gross_weight: parseOptionalNumber(values.gross_weight),
                chargeable_weight: parseOptionalNumber(values.chargeable_weight),
                volume_cbm: parseOptionalNumber(values.volume_cbm),
                pieces: parseOptionalNumber(values.pieces),
                special_requirements: values.special_requirements?.trim() || undefined,
                valid_until: values.valid_until || undefined,
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
              Job type
            </span>
            <select className={portalSelectClassName} {...form.register('job_type')}>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t] ?? t}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Currency code"
            error={form.formState.errors.currency_code?.message}
            {...form.register('currency_code')}
          />
          <Input
            label="Origin port ID (optional UUID)"
            error={form.formState.errors.origin_port_id?.message}
            {...form.register('origin_port_id')}
          />
          <Input
            label="Destination port ID (optional UUID)"
            error={form.formState.errors.dest_port_id?.message}
            {...form.register('dest_port_id')}
          />
          <Input label="Commodity" {...form.register('commodity')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Gross weight" type="number" step="any" {...form.register('gross_weight')} />
            <Input
              label="Chargeable weight"
              type="number"
              step="any"
              {...form.register('chargeable_weight')}
            />
            <Input label="Volume (CBM)" type="number" step="any" {...form.register('volume_cbm')} />
            <Input label="Pieces" type="number" {...form.register('pieces')} />
          </div>
          <Input label="Valid until" type="date" {...form.register('valid_until')} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Special requirements
            </span>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
              {...form.register('special_requirements')}
            />
          </label>

          <Button type="submit" className="w-full sm:w-auto" disabled={requestQuote.isPending}>
            {requestQuote.isPending ? 'Submitting…' : 'Submit quote request'}
          </Button>
        </form>
      </PortalPanel>
    </div>
  );
}
