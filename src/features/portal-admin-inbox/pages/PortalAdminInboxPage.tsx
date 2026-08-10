import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/parties/utils/getErrorMessage';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalLoadingState,
} from '@/features/portal-auth/components/portal-ui';
import {
  useAdminCreditLimitRequests,
  useAdminPortalDisputes,
  useAdminPortalMessage,
  useAdminPortalMessages,
  useMarkAdminPortalMessageRead,
  useReplyAdminPortalMessage,
  useReviewAdminCreditLimitRequest,
  useReviewAdminPortalDispute,
} from '../hooks/usePortalAdminInbox';
import type { AdminCreditLimitRequest, AdminPortalDispute, AdminPortalMessage } from '../types/portalAdminInbox.types';

type Tab = 'messages' | 'disputes' | 'credit';

type CreditDraft = { status: string; review_notes: string; approved_limit: string };

function AdminMessageRow({
  message,
  onMarkRead,
  markPending,
}: {
  message: AdminPortalMessage;
  onMarkRead: (id: string) => void;
  markPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const detail = useAdminPortalMessage(message.id, open);
  const reply = useReplyAdminPortalMessage();
  const thread = detail.data ?? message;
  const replies = thread.replies ?? [];

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen((v) => !v)}>
          <div className="text-sm font-semibold">{message.subject}</div>
          <div className="text-xs text-[var(--color-neutral-500)]">
            {[message.partyName, message.senderEmail, message.createdAt].filter(Boolean).join(' · ')}
            {open ? ' · Hide' : ' · Open'}
          </div>
          {message.body ? (
            <p className="mt-1 text-sm text-[var(--color-neutral-700)] whitespace-pre-wrap line-clamp-2">
              {message.body}
            </p>
          ) : null}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {message.isRead ? (
            <Badge variant="neutral">Read</Badge>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={markPending}
              onClick={() => onMarkRead(message.id)}
            >
              Mark read
            </Button>
          )}
        </div>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-[var(--color-neutral-100)] pt-3">
          {localError && (
            <p className="text-xs text-[var(--color-danger-600)]" role="alert">
              {localError}
            </p>
          )}
          {detail.isLoading ? (
            <p className="text-xs text-[var(--color-neutral-400)]">Loading thread…</p>
          ) : (
            <>
              {replies.length > 0 ? (
                <ul className="space-y-2">
                  {replies.map((r) => (
                    <li key={r.id} className="rounded-md bg-[var(--color-neutral-50)] px-3 py-2 text-sm">
                      <div className="text-xs text-[var(--color-neutral-500)]">
                        {[r.authorName || r.authorType || 'Reply', r.createdAt].filter(Boolean).join(' · ')}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap">{r.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[var(--color-neutral-400)]">No replies yet.</p>
              )}
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setLocalError(null);
                  if (!replyBody.trim()) {
                    setLocalError('Reply is required.');
                    return;
                  }
                  void reply
                    .mutateAsync({ id: message.id, dto: { body: replyBody.trim() } })
                    .then(() => setReplyBody(''))
                    .catch((err) => setLocalError(getErrorMessage(err) || 'Reply failed.'));
                }}
              >
                <textarea
                  className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  placeholder="Staff reply…"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />
                <Button type="submit" size="sm" disabled={reply.isPending}>
                  {reply.isPending ? 'Sending…' : 'Reply'}
                </Button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

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
            <PortalLoadingState />
          ) : messages.isError ? (
            <p className="p-6 text-sm text-[var(--color-danger-600)]">Failed to load messages.</p>
          ) : !(messages.data?.items.length) ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">No messages.</p>
          ) : (
            <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
              {messages.data.items.map((m) => (
                <PortalAnimatedListItem key={m.id}>
                  <AdminMessageRow
                    message={m}
                    markPending={markRead.isPending}
                    onMarkRead={(id) => void markRead.mutateAsync(id)}
                  />
                </PortalAnimatedListItem>
              ))}
            </PortalAnimatedList>
          )}
        </Card>
      )}

      {tab === 'disputes' && (
        <Card className="p-0 overflow-hidden">
          {disputes.isLoading ? (
            <PortalLoadingState />
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
            <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
              {disputes.data.map((d) => (
                <PortalAnimatedListItem key={d.id}>
                  <DisputeRow
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
                </PortalAnimatedListItem>
              ))}
            </PortalAnimatedList>
          )}
        </Card>
      )}

      {tab === 'credit' && (
        <Card className="p-0 overflow-hidden">
          {creditRequests.isLoading ? (
            <PortalLoadingState />
          ) : creditRequests.isError ? (
            <p className="p-6 text-sm text-[var(--color-danger-600)]">Failed to load requests.</p>
          ) : !(creditRequests.data?.length) ? (
            <p className="p-6 text-sm text-[var(--color-neutral-400)]">No credit limit requests.</p>
          ) : (
            <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
              {creditRequests.data.map((req) => {
                const draft = creditDrafts[req.id] ?? defaultCreditDraft(req);
                const alreadyDecided =
                  String(req.status || '').toUpperCase() === 'APPROVED' ||
                  String(req.status || '').toUpperCase() === 'REJECTED';
                return (
                  <PortalAnimatedListItem key={req.id}>
                    <CreditRow
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
                  </PortalAnimatedListItem>
                );
              })}
            </PortalAnimatedList>
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
    <div className="px-4 py-4 space-y-3">
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
    </div>
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
    <div className="px-4 py-4 space-y-3">
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
    </div>
  );
}
