import { useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalEmptyState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import {
  useCreatePortalCreditRequest,
  usePortalCreditRequests,
} from '../hooks/usePortalCreditRequests';

export default function PortalCreditRequestsPage() {
  const { data, isLoading, isError, error, refetch } = usePortalCreditRequests();
  const create = useCreatePortalCreditRequest();
  const [requestedLimit, setRequestedLimit] = useState('');
  const [justification, setJustification] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
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
          onSubmit={(e) => {
            e.preventDefault();
            setFormError(null);
            const limit = Number(requestedLimit);
            if (!Number.isFinite(limit) || limit <= 0) {
              setFormError('Enter a valid requested limit.');
              return;
            }
            if (!justification.trim()) {
              setFormError('Justification is required.');
              return;
            }
            void create
              .mutateAsync({ requested_limit: limit, justification: justification.trim() })
              .then(() => {
                setRequestedLimit('');
                setJustification('');
              })
              .catch((err) => {
                setFormError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not submit request.',
                );
              });
          }}
        >
          <Input
            label="Requested limit"
            type="number"
            step="any"
            value={requestedLimit}
            onChange={(e) => setRequestedLimit(e.target.value)}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Justification
            </span>
            <textarea
              className="min-h-[88px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Submitting…' : 'Submit request'}
          </Button>
        </form>
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
            title="No requests yet"
            description="Submitted credit limit requests appear here."
            Icon={CircleDollarSign}
          />
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((req) => (
              <li key={req.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
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
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
    </div>
  );
}
