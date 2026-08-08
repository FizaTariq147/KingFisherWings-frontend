import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Scale } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalEmptyState,
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { PORTAL_DISPUTE_STATUSES } from '../api/portalDisputes.api';
import { useCreatePortalDispute, usePortalDisputes } from '../hooks/usePortalDisputes';
import { portalDisputesService } from '../services/portalDisputes.service';

const createDisputeSchema = z.object({
  invoice_id: z
    .string()
    .trim()
    .min(1, 'Invoice ID is required')
    .refine((v) => isUuid(v), 'Invoice ID must be a valid UUID'),
  reason: z
    .string()
    .trim()
    .min(3, 'Reason must be at least 3 characters')
    .max(200, 'Reason must be at most 200 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
});

type CreateDisputeValues = z.infer<typeof createDisputeSchema>;

export default function PortalDisputesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const params = useMemo(
    () => ({ page, limit: 20, status: status || undefined }),
    [page, status],
  );
  const { data, isLoading, isError, error, refetch } = usePortalDisputes(params);
  const create = useCreatePortalDispute();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CreateDisputeValues>({
    resolver: zodResolver(createDisputeSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { invoice_id: '', reason: '', description: '' },
  });
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Disputes" description="Raise and track invoice disputes." />

      <PortalPanel padded>
        {formError && (
          <p role="alert" className="mb-4 text-sm text-[var(--color-danger-600)]">
            {formError}
          </p>
        )}
        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            setFormError(null);
            void create
              .mutateAsync({
                invoice_id: values.invoice_id.trim(),
                reason: values.reason.trim(),
                description: values.description.trim(),
              })
              .then(() => form.reset({ invoice_id: '', reason: '', description: '' }))
              .catch((err) => {
                setFormError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not raise dispute.',
                );
              });
          })}
        >
          <Input
            label="Invoice ID"
            required
            hint="UUID of the invoice"
            placeholder="e.g. afece50f-dba6-4bb1-a05a-031b268d3a46"
            error={form.formState.errors.invoice_id?.message}
            {...form.register('invoice_id')}
          />
          <Input
            label="Reason"
            required
            maxLength={200}
            hint="3–200 characters"
            error={form.formState.errors.reason?.message}
            {...form.register('reason')}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Description <span className="text-[var(--color-danger-500)]">*</span>
            </span>
            <textarea
              className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...form.register('description')}
            />
            {form.formState.errors.description ? (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">
                {form.formState.errors.description.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-neutral-400)]">At least 10 characters</p>
            )}
          </label>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Submitting…' : 'Raise dispute'}
          </Button>
        </form>
      </PortalPanel>

      <PortalPanel padded>
        <label className="block text-sm max-w-xs">
          <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
            Filter status
          </span>
          <select
            className={portalSelectClassName}
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All</option>
            {PORTAL_DISPUTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </PortalPanel>

      <PortalPanel>
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">
              {error instanceof PortalApiError || error instanceof Error
                ? error.message
                : 'Failed to load.'}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState
            title="No disputes"
            description="Disputes you raise appear here."
            Icon={Scale}
          />
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((d) => (
              <li key={d.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {d.invoiceNumber || d.invoiceId || 'Dispute'}
                    </div>
                    <div className="text-sm text-[var(--color-neutral-700)] mt-0.5">
                      {d.reason}
                    </div>
                    {d.description ? (
                      <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{d.description}</p>
                    ) : null}
                    {d.hasAttachment ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mt-2"
                        onClick={() =>
                          void portalDisputesService.downloadAttachment(d.id).catch(() => {
                            /* keep list usable */
                          })
                        }
                      >
                        Download attachment
                      </Button>
                    ) : null}
                  </div>
                  {d.status ? (
                    <Badge variant="info">{d.status.replaceAll('_', ' ')}</Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
