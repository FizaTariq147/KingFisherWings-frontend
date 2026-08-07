import { useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalEmptyState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import { useCreatePortalMessage, usePortalMessages } from '../hooks/usePortalMessages';

export default function PortalMessagesPage() {
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, error, refetch } = usePortalMessages(params);
  const create = useCreatePortalMessage();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [jobId, setJobId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader title="Messages" description="Contact your forwarder about jobs or invoices." />

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
            if (!subject.trim() || !body.trim()) {
              setFormError('Subject and message are required.');
              return;
            }
            void create
              .mutateAsync({
                subject: subject.trim(),
                body: body.trim(),
                job_id: jobId.trim() || undefined,
                invoice_id: invoiceId.trim() || undefined,
              })
              .then(() => {
                setSubject('');
                setBody('');
                setJobId('');
                setInvoiceId('');
              })
              .catch((err) => {
                setFormError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not send message.',
                );
              });
          }}
        >
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Message
            </span>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Job ID (optional)"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
            <Input
              label="Invoice ID (optional)"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Sending…' : 'Send message'}
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
            title="No messages"
            description="Messages you send to your forwarder appear here."
            Icon={MessageSquare}
          />
        ) : (
          <ul className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((m) => (
              <li key={m.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{m.subject}</div>
                    {m.body ? (
                      <p className="mt-1 text-sm text-[var(--color-neutral-600)] whitespace-pre-wrap">
                        {m.body}
                      </p>
                    ) : null}
                    <div className="mt-1 text-xs text-[var(--color-neutral-500)]">
                      {m.createdAt || '—'}
                    </div>
                  </div>
                  {m.readByStaff ? <Badge variant="success">Read</Badge> : <Badge variant="neutral">Sent</Badge>}
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
