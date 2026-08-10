import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CircleDollarSign } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import {
  useCreatePortalCreditRequest,
  usePortalCreditRequests,
} from '../hooks/usePortalCreditRequests';

const createCreditRequestSchema = z.object({
  requested_limit: z
    .string()
    .trim()
    .min(1, 'Requested limit is required')
    .refine((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1;
    }, 'Requested limit must be at least 1'),
  justification: z.string().trim().min(10, 'Justification must be at least 10 characters'),
});

type CreateCreditRequestValues = z.infer<typeof createCreditRequestSchema>;

export default function PortalCreditRequestsPage() {
  const { data, isLoading, isError, error, refetch } = usePortalCreditRequests();
  const create = useCreatePortalCreditRequest();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<CreateCreditRequestValues>({
    resolver: zodResolver(createCreditRequestSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { requested_limit: '', justification: '' },
  });
  const items = data ?? [];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Credit limit requests"
        description="Request a higher credit limit from your forwarder."
      />

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
                requested_limit: Number(values.requested_limit),
                justification: values.justification.trim(),
              })
              .then(() => form.reset({ requested_limit: '', justification: '' }))
              .catch((err) => {
                setFormError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not submit request.',
                );
              });
          })}
        >
          <Input
            label="Requested limit"
            required
            type="number"
            step="any"
            min={1}
            hint="Minimum 1"
            error={form.formState.errors.requested_limit?.message}
            {...form.register('requested_limit')}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Justification <span className="text-[var(--color-danger-500)]">*</span>
            </span>
            <textarea
              className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...form.register('justification')}
            />
            {form.formState.errors.justification ? (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">
                {form.formState.errors.justification.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-neutral-400)]">At least 10 characters</p>
            )}
          </label>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Submitting…' : 'Submit request'}
          </Button>
        </form>
      </PortalPanel>

      <PortalPanel>
        {isLoading ? (
          <PortalLoadingState />
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
            title="No requests yet"
            description="Submitted credit limit requests appear here."
            Icon={CircleDollarSign}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((req) => (
              <PortalAnimatedListItem
                key={req.id}
                className="flex items-center justify-between gap-3 px-4 py-3.5"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    Requested {req.requestedLimit ?? '—'}
                    {req.approvedLimit != null ? ` · Approved ${req.approvedLimit}` : ''}
                  </div>
                  <div className="text-xs text-[var(--color-neutral-500)] truncate">
                    {[req.createdAt, req.justification].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                {req.status ? <Badge variant="info">{req.status}</Badge> : null}
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
