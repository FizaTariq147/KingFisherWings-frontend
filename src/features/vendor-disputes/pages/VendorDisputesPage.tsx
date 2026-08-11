import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Scale } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { VendorQueryError } from '@/features/vendor-shared/VendorQueryError';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { VENDOR_DISPUTE_STATUSES } from '../api/vendorDisputes.api';
import { useCreateVendorDispute, useVendorDispute, useVendorDisputes } from '../hooks/useVendorDisputes';
import type { VendorDispute } from '../types/vendorDisputes.types';

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

function DisputeRow({ dispute }: { dispute: VendorDispute }) {
  const [open, setOpen] = useState(false);
  const detail = useVendorDispute(dispute.id, open);
  const shown = detail.data ?? dispute;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen((v) => !v)}>
          <div className="text-sm font-semibold">
            {shown.invoiceNumber || shown.invoiceId || 'Dispute'}
          </div>
          <div className="text-sm text-[var(--color-neutral-700)] mt-0.5">{shown.reason}</div>
          {shown.description ? (
            <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{shown.description}</p>
          ) : null}
          <div className="mt-1 text-xs text-[var(--color-neutral-400)]">
            {open ? 'Hide detail' : 'View detail'}
          </div>
        </button>
        {shown.status ? <Badge variant="info">{shown.status.replaceAll('_', ' ')}</Badge> : null}
      </div>
      {open ? (
        <div className="mt-3 space-y-2 border-t border-[var(--color-neutral-100)] pt-3">
          {detail.isLoading ? (
            <p className="text-xs text-[var(--color-neutral-400)]">Loading dispute…</p>
          ) : null}
          {detail.isError ? (
            <p className="text-xs text-[var(--color-danger-600)]">{vendorErrorMessage(detail.error)}</p>
          ) : null}
          {shown.createdAt ? (
            <p className="text-xs text-[var(--color-neutral-500)]">Opened {shown.createdAt}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function VendorDisputesPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const params = useMemo(
    () => ({ page, limit: 20, status: status || undefined }),
    [page, status],
  );
  const { data, isLoading, isError, error, refetch } = useVendorDisputes(params);
  const create = useCreateVendorDispute();
  const [formError, setFormError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const form = useForm<CreateDisputeValues>({
    resolver: zodResolver(createDisputeSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { invoice_id: '', reason: '', description: '' },
  });

  useEffect(() => {
    const invoiceId = searchParams.get('invoice_id')?.trim();
    if (invoiceId) form.setValue('invoice_id', invoiceId);
  }, [form, searchParams]);

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Disputes" description="Raise and track invoice disputes." />

      <PortalPanel padded>
        {formError ? (
          <p role="alert" className="mb-4 text-sm text-[var(--color-danger-600)]">
            {formError}
          </p>
        ) : null}
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
                file: attachment ?? undefined,
              })
              .then(() => {
                form.reset({ invoice_id: '', reason: '', description: '' });
                setAttachment(null);
              })
              .catch((err) => {
                setFormError(vendorErrorMessage(err, 'Could not raise dispute.'));
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
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Attachment (optional)
            </span>
            <input
              type="file"
              key={attachment ? attachment.name : 'dispute-no-file'}
              className="block w-full text-sm text-[var(--color-neutral-700)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-neutral-100)] file:px-3 file:py-1.5 file:text-sm"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            />
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
            {VENDOR_DISPUTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </PortalPanel>

      <PortalPanel>
        {isLoading ? (
          <PortalLoadingState />
        ) : isError ? (
          <VendorQueryError error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <PortalEmptyState title="No disputes" description="Disputes you raise appear here." Icon={Scale} />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((d) => (
              <PortalAnimatedListItem key={d.id} className="px-4 py-3.5">
                <DisputeRow dispute={d} />
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 ? (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
      ) : null}
    </div>
  );
}
