import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedGrid,
  PortalAnimatedGridItem,
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
  PortalStatCard,
} from '@/features/portal-auth/components/portal-ui';
import { usePortalCreditNote } from '../hooks/usePortalCreditNotes';
import type { PortalNoteKind } from '../services/portalCreditNotes.service';

export default function PortalCreditNoteDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const kind: PortalNoteKind = location.pathname.includes('/debit-notes') ? 'debit' : 'credit';
  const listPath = kind === 'debit' ? '/portal/debit-notes' : '/portal/credit-notes';
  const { data, isLoading, isError, error, refetch } = usePortalCreditNote(id, kind);

  if (isLoading) return <PortalLoadingState label="Loading…" />;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">
          {error instanceof PortalApiError || error instanceof Error ? error.message : 'Not found.'}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
        <Link to={listPath} className="block text-sm underline text-[var(--color-primary)]">
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        to={listPath}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={14} /> Back to {kind === 'debit' ? 'debit notes' : 'credit notes'}
      </Link>
      <PortalPageHeader
        title={data.number}
        description={
          data.creditedInvoiceNumber
            ? `Against ${data.creditedInvoiceNumber}`
            : kind === 'debit'
              ? 'Debit note detail'
              : 'Credit note detail'
        }
        actions={data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
      />
      <PortalAnimatedGrid className="grid gap-4 sm:grid-cols-3">
        <PortalAnimatedGridItem><PortalStatCard label="Total" value={data.totalAmount ?? '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Currency" value={data.currencyCode || '—'} /></PortalAnimatedGridItem>
        <PortalAnimatedGridItem><PortalStatCard label="Date" value={data.creditDate || '—'} /></PortalAnimatedGridItem>
      </PortalAnimatedGrid>
      {data.remarks ? (
        <PortalPanel padded>
          <p className="text-sm">{data.remarks}</p>
        </PortalPanel>
      ) : null}
      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold">Lines</h2>
        {!data.lines.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No lines.</p>
        ) : (
          <PortalAnimatedList className="space-y-2">
            {data.lines.map((line) => (
              <PortalAnimatedListItem
                key={line.id}
                className="flex justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-2 text-sm last:border-0"
              >
                <span>{line.description}</span>
                <span className="font-medium tabular-nums">{line.lineTotal ?? '—'}</span>
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
    </div>
  );
}
