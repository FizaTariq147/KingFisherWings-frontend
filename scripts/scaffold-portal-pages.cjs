/**
 * Generate portal pages. Run: node scripts/scaffold-portal-pages.cjs
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src', 'features');
function write(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n');
  console.log('+', rel);
}

write('portal-invoices/pages/PortalInvoicesPage.tsx', `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalEmptyState, PortalPageHeader, PortalPanel, PortalStatCard, portalSelectClassName,
} from '@/features/portal-auth/components/portal-ui';
import { PORTAL_INVOICE_STATUSES } from '../api/portalInvoices.api';
import {
  useDownloadPortalInvoicePdf, usePortalInvoiceSummary, usePortalInvoices,
} from '../hooks/usePortalInvoices';

export default function PortalInvoicesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const params = useMemo(() => ({
    page, limit: 20, search: search.trim() || undefined, status: status || undefined, order: undefined,
  }), [page, search, status]);
  const summary = usePortalInvoiceSummary();
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalInvoices(params);
  const download = useDownloadPortalInvoicePdf();
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Invoices" description="Customer invoices for your account." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Total" value={summary.data?.total ?? (summary.isLoading ? '…' : 0)} Icon={FileText} />
        <PortalStatCard label="Outstanding" value={summary.data?.outstanding ?? (summary.isLoading ? '…' : 0)} />
        <PortalStatCard label="Overdue" value={summary.data?.overdue ?? (summary.isLoading ? '…' : 0)} />
        <PortalStatCard label="Paid" value={summary.data?.paid ?? (summary.isLoading ? '…' : 0)} tone="accent" />
      </div>
      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Search" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Status</span>
            <select className={portalSelectClassName} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All</option>
              {PORTAL_INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
        </div>
      </PortalPanel>
      <PortalPanel>
        {isFetching && <div className="h-0.5 bg-[var(--color-secondary)]/80 animate-pulse" />}
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading invoices…</p>
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Failed to load invoices.'}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState title="No invoices" description="Invoices appear here once posted for your party." Icon={FileText} />
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <Link to={\`/portal/invoices/\${inv.id}\`} className="min-w-0 flex-1 hover:opacity-80">
                  <div className="text-sm font-semibold truncate">{inv.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[inv.invoiceDate, inv.dueDate ? \`Due \${inv.dueDate}\` : null, inv.currencyCode].filter(Boolean).join(' · ') || '—'}
                  </div>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                  {inv.status ? <Badge variant="info">{inv.status.replaceAll('_', ' ')}</Badge> : null}
                  <Button type="button" size="sm" variant="secondary" disabled={download.isPending}
                    onClick={() => void download.mutateAsync({ id: inv.id, name: \`\${inv.number}.pdf\` })}>
                    <Download size={14} aria-hidden="true" /> PDF
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button type="button" size="sm" variant="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
`);

write('portal-invoices/pages/PortalInvoiceDetailPage.tsx', `
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel, PortalStatCard } from '@/features/portal-auth/components/portal-ui';
import { useDownloadPortalInvoicePdf, usePortalInvoice } from '../hooks/usePortalInvoices';

export default function PortalInvoiceDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading, isError, error, refetch } = usePortalInvoice(id);
  const download = useDownloadPortalInvoicePdf();

  if (isLoading) return <p className="text-sm text-[var(--color-neutral-400)]">Loading invoice…</p>;
  if (isError || !data) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Invoice not found.'}</p>
        <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
        <Link to="/portal/invoices" className="block text-sm text-[var(--color-primary)] underline">Back to invoices</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/portal/invoices" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-neutral-500)] hover:text-[var(--color-primary)]">
        <ArrowLeft size={14} aria-hidden="true" /> Back to invoices
      </Link>
      <PortalPageHeader
        title={data.number}
        description={[data.invoiceDate, data.dueDate ? \`Due \${data.dueDate}\` : null].filter(Boolean).join(' · ') || 'Invoice detail'}
        actions={
          <>
            {data.status ? <Badge variant="info">{data.status.replaceAll('_', ' ')}</Badge> : null}
            <Button type="button" size="sm" variant="secondary" disabled={download.isPending}
              onClick={() => void download.mutateAsync({ id: data.id, name: \`\${data.number}.pdf\` })}>
              <Download size={14} /> Download PDF
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard label="Total" value={data.totalAmount ?? '—'} />
        <PortalStatCard label="Outstanding" value={data.outstandingBalance ?? '—'} />
        <PortalStatCard label="Paid" value={data.paidAmount ?? '—'} />
        <PortalStatCard label="Currency" value={data.currencyCode || '—'} />
      </div>
      {data.remarks ? <PortalPanel padded><p className="text-sm text-[var(--color-neutral-700)]">{data.remarks}</p></PortalPanel> : null}
      <PortalPanel padded>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-neutral-900)]">Lines</h2>
        {!data.lines.length ? (
          <p className="text-sm text-[var(--color-neutral-400)]">No lines.</p>
        ) : (
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
`);

write('portal-credit-notes/pages/PortalCreditNotesPage.tsx', `
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalEmptyState, PortalPageHeader, PortalPanel, portalSelectClassName } from '@/features/portal-auth/components/portal-ui';
import { usePortalCreditNotes } from '../hooks/usePortalCreditNotes';

const STATUSES = ['DRAFT', 'POSTED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'VOID'];

export default function PortalCreditNotesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const params = useMemo(() => ({
    page, limit: 20, search: search.trim() || undefined, status: status || undefined,
  }), [page, search, status]);
  const { data, isLoading, isError, error, refetch, isFetching } = usePortalCreditNotes(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Credit notes" description="Credit notes applied to your account." />
      <PortalPanel padded>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Search" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">Status</span>
            <select className={portalSelectClassName} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
        </div>
      </PortalPanel>
      <PortalPanel>
        {isFetching && <div className="h-0.5 bg-[var(--color-secondary)]/80 animate-pulse" />}
        {isLoading ? (
          <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
        ) : isError ? (
          <div className="p-6 space-y-2">
            <p className="text-sm text-[var(--color-danger-600)]">{error instanceof PortalApiError || error instanceof Error ? error.message : 'Failed to load.'}</p>
            <Button type="button" size="sm" variant="secondary" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : items.length === 0 ? (
          <PortalEmptyState title="No credit notes" description="Credit notes will appear here when issued." Icon={Receipt} />
        ) : (
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((cn) => (
              <Link key={cn.id} to={\`/portal/credit-notes/\${cn.id}\`} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-[var(--color-neutral-50)]">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{cn.number}</div>
                  <div className="text-xs text-[var(--color-neutral-500)]">
                    {[cn.creditedInvoiceNumber, cn.creditDate, cn.currencyCode, cn.totalAmount].filter((v) => v != null && v !== '').join(' · ') || '—'}
                  </div>
                </div>
                {cn.status ? <Badge variant="info">{cn.status.replaceAll('_', ' ')}</Badge> : null}
              </Link>
            ))}
          </div>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-neutral-500)]">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button type="button" size="sm" variant="secondary" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
`);

write('portal-credit-notes/pages/PortalCreditNoteDetailPage.tsx', `
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
        description={data.creditedInvoiceNumber ? \`Against \${data.creditedInvoiceNumber}\` : 'Credit note detail'}
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
`);

console.log('pages chunk1');
