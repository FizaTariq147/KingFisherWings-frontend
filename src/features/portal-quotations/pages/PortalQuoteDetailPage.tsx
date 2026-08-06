import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { usePortalQuotation } from '../hooks/usePortalQuotations';

export default function PortalQuoteDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = usePortalQuotation(id);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-neutral-400)]">Loading quotation…</p>;
  }

  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {error instanceof PortalApiError || error instanceof Error
            ? error.message
            : 'Quotation not found.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <Link to="/portal/quotes" className="block text-sm underline text-[var(--color-primary)]">
          Back to quotes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to="/portal/quotes"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to quotes
      </Link>

      <PortalPageHeader
        title={data.number}
        description={
          [data.origin, data.destination].filter(Boolean).join(' → ') || data.jobType || 'Quotation detail'
        }
        actions={data.status ? <Badge variant="info">{data.status}</Badge> : null}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard label="Currency" value={data.currencyCode || '—'} />
        <PortalStatCard label="Valid until" value={data.validUntil || '—'} />
        <PortalStatCard label="Weight" value={data.grossWeight ?? '—'} />
        <PortalStatCard label="Pieces" value={data.pieces ?? '—'} />
      </div>

      {data.commodity || data.specialRequirements ? (
        <PortalPanel padded className="space-y-2 text-sm">
          {data.commodity ? (
            <p>
              <span className="text-[var(--color-neutral-500)]">Commodity: </span>
              {data.commodity}
            </p>
          ) : null}
          {data.specialRequirements ? (
            <p>
              <span className="text-[var(--color-neutral-500)]">Requirements: </span>
              {data.specialRequirements}
            </p>
          ) : null}
        </PortalPanel>
      ) : null}

      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Lines</h2>
        {!data.lines?.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No charge lines.</p>
        ) : (
          <ul className="space-y-2">
            {data.lines.map((line) => (
              <li
                key={line.id}
                className="flex justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-2 text-sm last:border-0"
              >
                <span>{line.description}</span>
                <span className="font-medium tabular-nums">
                  {line.amount != null
                    ? `${line.currencyCode || data.currencyCode || ''} ${line.amount}`
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
    </div>
  );
}
