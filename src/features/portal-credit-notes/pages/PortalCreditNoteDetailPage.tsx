import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel, PortalStatCard } from '@/features/portal-auth/components/portal-ui';
import { usePortalCreditNote } from '../hooks/usePortalCreditNotes';

export default function PortalCreditNoteDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = usePortalCreditNote(id);

  if (isLoading) return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Not found.'}</p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        <Link to="/portal/credit-notes" className="block text-sm underline text-[var(--color-primary)]">Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/portal/credit-notes" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={14} /> Back to credit notes
      </Link>
      <PortalPageHeader
        title={data.number}
        description={data.creditedInvoiceNumber ? `Against ${data.creditedInvoiceNumber}` : 'Credit note detail'}
        actions={data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <PortalStatCard label="Total" value={data.totalAmount ?? '—'} />
        <PortalStatCard label="Currency" value={data.currencyCode || '—'} />
        <PortalStatCard label="Date" value={data.creditDate || '—'} />
      </div>
      {data.remarks ? <PortalPanel padded><p className="text-sm">{data.remarks}</p></PortalPanel> : null}
      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold">Lines</h2>
        {!data.lines.length ? <p className="text-sm text-[var(--color-neutral-400)]">No lines.</p> : (
          <ul className="space-y-2">
            {data.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-3 border-b border-[var(--color-neutral-100)] pb-2 text-sm last:border-0">
                <span>{line.description}</span>
                <span className="font-medium tabular-nums">{line.lineTotal ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
    </div>
  );
}
