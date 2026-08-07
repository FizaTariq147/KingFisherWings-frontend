import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import {
  useAdminCreditLimitRequests,
  useAdminPortalDisputes,
  useAdminPortalMessages,
  useMarkAdminPortalMessageRead,
  useReviewAdminCreditLimitRequest,
  useReviewAdminPortalDispute,
} from '../hooks/usePortalAdminInbox';
import type { AdminCreditLimitRequest, AdminPortalDispute } from '../types/portalAdminInbox.types';

type Tab = 'messages' | 'disputes' | 'credit';

type CreditDraft = { status: string; review_notes: string; approved_limit: string };

function defaultCreditDraft(req: AdminCreditLimitRequest): CreditDraft {
  return {
    status: 'APPROVED',
    review_notes: '',
    approved_limit:
      req.requestedLimit != null && Number.isFinite(req.requestedLimit)
        ? String(req.requestedLimit)
        : '',
  };
}

export default function PortalAdminInboxPage() {
  const [tab, setTab] = useState<Tab>('messages');
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const messageParams = useMemo(
    () => ({ page, limit: 20, unread_only: unreadOnly ? 'true' : undefined }),
    [page, unreadOnly],
  );
  const messages = useAdminPortalMessages(messageParams);
  const markRead = useMarkAdminPortalMessageRead();
  // Load like Credit requests (always on this page), not only when tab is open
  const disputes = useAdminPortalDisputes(true);
  const reviewDispute = useReviewAdminPortalDispute();
  const creditRequests = useAdminCreditLimitRequests();
  const reviewCredit = useReviewAdminCreditLimitRequest();

  const [disputeDrafts, setDisputeDrafts] = useState<
    Record<string, { status: string; staff_notes: string }>
  >({});
  const [creditDrafts, setCreditDrafts] = useState<Record<string, CreditDraft>>({});

  const tabs: { id: Tab; label: string }[] = [
    { id: 'messages', label: 'Messages' },
    { id: 'disputes', label: 'Disputes' },
    { id: 'credit', label: 'Credit requests' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">
          Customer portal inbox
        </h2>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Review portal messages, invoice disputes, and credit limit requests.
        </p>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-[var(--color-neutral-200)] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActionError(null);
              setTab(t.id);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'messages' && (
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-neutral-100)] px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setPage(1);
                  setUnreadOnly(e.target.checked);
                }}
              />
              Unread only
            </label>
          </div>
          {messages.isLoading ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
          ) : messages.isError ? (
            <p className="p-6 text-sm text-[var(--color-danger-600)]">Failed to load messages.</p>
          ) : !(messages.data?.items.length) ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">No messages.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {messages.data.items.map((m) => (
                <li key={m.id} className="px-4 py-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{m.subject}</div>
                    <div className="text-xs text-[var(--color-neutral-500)]">
                      {[m.partyName, m.senderEmail, m.createdAt].filter(Boolean).join(' · ')}
                    </div>
                    {m.body ? (
                      <p className="mt-1 text-sm text-[var(--color-neutral-700)] whitespace-pre-wrap">
                        {m.body}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.isRead ? (
                      <Badge variant="neutral">Read</Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={markRead.isPending}
                        onClick={() => void markRead.mutateAsync(m.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'disputes' && (
        <Card className="p-0 overflow-hidden">
          {disputes.isLoading ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
          ) : disputes.isError ? (
            <div className="space-y-3 p-6">
              <p className="text-sm font-medium text-[var(--color-danger-600)]">
                {getErrorMessage(disputes.error)}
              </p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => void disputes.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : !(disputes.data?.length) ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">No disputes.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {disputes.data.map((d) => (
                <DisputeRow
                  key={d.id}
                  dispute={d}
                  draft={disputeDrafts[d.id] ?? { status: 'UNDER_REVIEW', staff_notes: '' }}
                  onChange={(next) =>
                    setDisputeDrafts((prev) => ({ ...prev, [d.id]: next }))
                  }
                  onSubmit={() => {
                    setActionError(null);
                    const draft = disputeDrafts[d.id] ?? {
                      status: 'UNDER_REVIEW',
                      staff_notes: '',
                    };
                    void reviewDispute
                      .mutateAsync({
                        id: d.id,
                        dto: {
                          status: draft.status as 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED',
                          staff_notes: draft.staff_notes.trim() || undefined,
                        },
                      })
                      .catch((err) => setActionError(getErrorMessage(err)));
                  }}
                  pending={reviewDispute.isPending}
                />
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'credit' && (
        <Card className="p-0 overflow-hidden">
          {creditRequests.isLoading ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">Loading…</p>
          ) : creditRequests.isError ? (
            <p className="p-6 text-sm text-[var(--color-danger-600)]">Failed to load requests.</p>
          ) : !(creditRequests.data?.length) ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">No credit limit requests.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {creditRequests.data.map((req) => {
                const draft = creditDrafts[req.id] ?? defaultCreditDraft(req);
                const alreadyDecided =
                  String(req.status || '').toUpperCase() === 'APPROVED' ||
                  String(req.status || '').toUpperCase() === 'REJECTED';
                return (
                  <CreditRow
                    key={req.id}
                    request={req}
                    draft={draft}
                    disabled={alreadyDecided}
                    onChange={(next) =>
                      setCreditDrafts((prev) => ({ ...prev, [req.id]: next }))
                    }
                    onSubmit={() => {
                      setActionError(null);
                      if (alreadyDecided) {
                        setActionError('This request was already reviewed.');
                        return;
                      }
                      const current = creditDrafts[req.id] ?? defaultCreditDraft(req);
                      const trimmedLimit = current.approved_limit.trim();
                      const limit = trimmedLimit === '' ? undefined : Number(trimmedLimit);
                      if (
                        current.status === 'APPROVED' &&
                        limit !== undefined &&
                        (!Number.isFinite(limit) || limit < 0)
                      ) {
                        setActionError('Enter a valid approved limit (0 or greater), or leave it blank to use the requested amount.');
                        return;
                      }
                      void reviewCredit
                        .mutateAsync({
                          id: req.id,
                          dto: {
                            status: current.status as 'APPROVED' | 'REJECTED',
                            review_notes: current.review_notes.trim() || undefined,
                            // Omit when blank so backend defaults to requested_limit
                            approved_limit:
                              current.status === 'APPROVED' && limit !== undefined
                                ? limit
                                : undefined,
                          },
                        })
                        .then(() => {
                          setCreditDrafts((prev) => {
                            const next = { ...prev };
                            delete next[req.id];
                            return next;
                          });
                        })
                        .catch((err) => {
                          setActionError(getErrorMessage(err));
                        });
                    }}
                    pending={reviewCredit.isPending}
                  />
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

function DisputeRow({
  dispute,
  draft,
  onChange,
  onSubmit,
  pending,
}: {
  dispute: AdminPortalDispute;
  draft: { status: string; staff_notes: string };
  onChange: (next: { status: string; staff_notes: string }) => void;
  onSubmit: () => void;
  pending: boolean;
}) {
  return (
    <li className="px-4 py-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {dispute.invoiceNumber || dispute.invoiceId || 'Dispute'}
          </div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[dispute.partyName, dispute.reason, dispute.createdAt].filter(Boolean).join(' · ')}
          </div>
          {dispute.description ? (
            <p className="mt-1 text-sm text-[var(--color-neutral-700)]">{dispute.description}</p>
          ) : null}
        </div>
        {dispute.status ? <Badge variant="info">{dispute.status}</Badge> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
        <select
          className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
          value={draft.status}
          onChange={(e) => onChange({ ...draft, status: e.target.value })}
        >
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <Input
          value={draft.staff_notes}
          onChange={(e) => onChange({ ...draft, staff_notes: e.target.value })}
          placeholder="Staff notes"
        />
        <Button type="button" size="sm" disabled={pending} onClick={onSubmit}>
          Save
        </Button>
      </div>
    </li>
  );
}

function CreditRow({
  request,
  draft,
  onChange,
  onSubmit,
  pending,
  disabled,
}: {
  request: AdminCreditLimitRequest;
  draft: CreditDraft;
  onChange: (next: CreditDraft) => void;
  onSubmit: () => void;
  pending: boolean;
  disabled?: boolean;
}) {
  return (
    <li className="px-4 py-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {request.partyName || request.partyId || 'Party'} — requested{' '}
            {request.requestedLimit ?? '—'}
          </div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[request.createdAt, request.justification].filter(Boolean).join(' · ')}
          </div>
        </div>
        {request.status ? <Badge variant="info">{request.status}</Badge> : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[140px_1fr_140px_auto]">
        <select
          className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
          value={draft.status}
          disabled={disabled || pending}
          onChange={(e) => onChange({ ...draft, status: e.target.value })}
        >
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <Input
          value={draft.review_notes}
          disabled={disabled || pending}
          onChange={(e) => onChange({ ...draft, review_notes: e.target.value })}
          placeholder="Review notes"
        />
        <Input
          type="number"
          value={draft.approved_limit}
          disabled={disabled || pending || draft.status === 'REJECTED'}
          onChange={(e) => onChange({ ...draft, approved_limit: e.target.value })}
          placeholder="Approved limit"
        />
        <Button type="button" size="sm" disabled={disabled || pending} onClick={onSubmit}>
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </li>
  );
}
