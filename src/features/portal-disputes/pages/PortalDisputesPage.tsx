import { useMemo, useState } from 'react';
import { Scale } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalEmptyState,
  PortalPageHeader,
  PortalPanel,
  portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { PORTAL_DISPUTE_STATUSES } from '../api/portalDisputes.api';
import { useCreatePortalDispute, usePortalDisputes } from '../hooks/usePortalDisputes';

export default function PortalDisputesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const params = useMemo(
    () => ({ page, limit: 20, status: status || undefined }),
    [page, status],
  );
  const { data, isLoading, isError, error, refetch } = usePortalDisputes(params);
  const create = useCreatePortalDispute();
  const [invoiceId, setInvoiceId] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
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
          onSubmit={(e) => {
            e.preventDefault();
            setFormError(null);
            if (!invoiceId.trim() || !reason.trim() || !description.trim()) {
              setFormError('Invoice ID, reason, and description are required.');
              return;
            }
            void create
              .mutateAsync({
                invoice_id: invoiceId.trim(),
                reason: reason.trim(),
                description: description.trim(),
              })
              .then(() => {
                setInvoiceId('');
                setReason('');
                setDescription('');
              })
              .catch((err) => {
                setFormError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not raise dispute.',
                );
              });
          }}
        >
          <Input
            label="Invoice ID"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="UUID of the invoice"
          />
          <Input label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Description
            </span>
            <textarea
              className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
          <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
