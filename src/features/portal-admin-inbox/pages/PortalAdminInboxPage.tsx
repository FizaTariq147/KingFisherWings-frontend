import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Inbox,
  Mail,
  MessageSquare,
  Scale,
} from 'lucide-react';
import { PageBackLink } from '@/components/ui/PageBackLink';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">{children}</div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Inbox; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Icon size={20} />
      </span>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {hint ? <p className="max-w-sm text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

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
    <div className={`px-5 py-4 transition-colors ${open ? 'bg-orange-50/40' : 'hover:bg-gray-50/80'}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen((v) => !v)}>
          <div className="flex flex-wrap items-center gap-2">
            {!message.isRead ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#FF751F]" aria-label="Unread" />
            ) : null}
            <span className="text-sm font-semibold text-[#0A2942]">{message.subject}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            {message.partyName ? <span>{message.partyName}</span> : null}
            {message.senderEmail ? <span>· {message.senderEmail}</span> : null}
            {message.createdAt ? <span>· {message.createdAt}</span> : null}
            <span className="text-[#FF751F]">{open ? '· Hide thread' : '· Open thread'}</span>
          </div>
          {message.body ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap line-clamp-2">
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
        <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          {localError && (
            <p className="text-xs text-red-600" role="alert">
              {localError}
            </p>
          )}
          {detail.isLoading ? (
            <p className="text-xs text-gray-400">Loading thread…</p>
          ) : (
            <>
              {replies.length > 0 ? (
                <ul className="space-y-2">
                  {replies.map((r) => (
                    <li key={r.id} className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                      <div className="text-xs text-gray-500">
                        {[r.authorName || r.authorType || 'Reply', r.createdAt].filter(Boolean).join(' · ')}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-gray-700">{r.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">No replies yet.</p>
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
                  className="min-h-[80px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700
                             focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
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
  const disputes = useAdminPortalDisputes(true);
  const reviewDispute = useReviewAdminPortalDispute();
  const creditRequests = useAdminCreditLimitRequests();
  const reviewCredit = useReviewAdminCreditLimitRequest();

  const [disputeDrafts, setDisputeDrafts] = useState<
    Record<string, { status: string; staff_notes: string }>
  >({});
  const [creditDrafts, setCreditDrafts] = useState<Record<string, CreditDraft>>({});

  const unreadCount = useMemo(
    () => (messages.data?.items ?? []).filter((m) => !m.isRead).length,
    [messages.data?.items],
  );
  const openDisputeCount = useMemo(
    () =>
      (disputes.data ?? []).filter((d) => {
        const status = String(d.status ?? '').toUpperCase();
        return status !== 'RESOLVED' && status !== 'REJECTED';
      }).length,
    [disputes.data],
  );
  const pendingCreditCount = useMemo(
    () =>
      (creditRequests.data ?? []).filter((r) => {
        const status = String(r.status ?? 'PENDING').toUpperCase();
        return status === 'PENDING' || status === 'OPEN' || status === 'SUBMITTED';
      }).length,
    [creditRequests.data],
  );

  const tabs: { id: Tab; label: string; icon: typeof Mail; count?: number }[] = [
    { id: 'messages', label: 'Messages', icon: Mail, count: unreadOnly ? unreadCount : messages.data?.items.length },
    { id: 'disputes', label: 'Disputes', icon: Scale, count: openDisputeCount },
    { id: 'credit', label: 'Credit requests', icon: CreditCard, count: pendingCreditCount },
  ];

  return (
    <div className="space-y-5">
      <PageBackLink to="/customers" label="Back to Customers" />

      <div className="overflow-hidden rounded-xl border border-[#0A2942]/10 bg-[#0A2942] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
            <Inbox size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-white">Customer portal inbox</h1>
            <p className="mt-1 text-sm text-white/65">
              Review portal messages, invoice disputes, and credit limit requests.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70">
                {unreadCount} unread
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70">
                {openDisputeCount} open disputes
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/70">
                {pendingCreditCount} pending credit
              </span>
            </div>
          </div>
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActionError(null);
                setTab(t.id);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#0A2942] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A2942]'
              }`}
            >
              <Icon size={15} />
              {t.label}
              {t.count != null ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                    active ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === 'messages' && (
        <PanelShell>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0A2942]">
              <MessageSquare size={15} className="text-[#FF751F]" />
              Messages
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setPage(1);
                  setUnreadOnly(e.target.checked);
                }}
                className="rounded border-gray-300 text-[#FF751F] focus:ring-[#FF751F]"
              />
              Unread only
            </label>
          </div>
          {messages.isLoading ? (
            <PortalLoadingState />
          ) : messages.isError ? (
            <EmptyState icon={AlertCircle} title="Failed to load messages." />
          ) : !(messages.data?.items.length) ? (
            <EmptyState
              icon={Mail}
              title="No messages."
              hint={unreadOnly ? 'Try turning off “Unread only”.' : undefined}
            />
          ) : (
            <PortalAnimatedList className="divide-y divide-gray-100">
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
        </PanelShell>
      )}

      {tab === 'disputes' && (
        <PanelShell>
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-sm font-medium text-[#0A2942]">
            <Scale size={15} className="text-[#FF751F]" />
            Disputes
          </div>
          {disputes.isLoading ? (
            <PortalLoadingState />
          ) : disputes.isError ? (
            <div className="space-y-3 p-6">
              <p className="text-sm font-medium text-red-600">{getErrorMessage(disputes.error)}</p>
              <Button type="button" size="sm" variant="secondary" onClick={() => void disputes.refetch()}>
                Retry
              </Button>
            </div>
          ) : !(disputes.data?.length) ? (
            <EmptyState icon={Scale} title="No disputes." />
          ) : (
            <PortalAnimatedList className="divide-y divide-gray-100">
              {disputes.data.map((d) => (
                <PortalAnimatedListItem key={d.id}>
                  <DisputeRow
                    dispute={d}
                    draft={disputeDrafts[d.id] ?? { status: 'UNDER_REVIEW', staff_notes: '' }}
                    onChange={(next) => setDisputeDrafts((prev) => ({ ...prev, [d.id]: next }))}
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
        </PanelShell>
      )}

      {tab === 'credit' && (
        <PanelShell>
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-sm font-medium text-[#0A2942]">
            <CreditCard size={15} className="text-[#FF751F]" />
            Credit limit requests
          </div>
          {creditRequests.isLoading ? (
            <PortalLoadingState />
          ) : creditRequests.isError ? (
            <EmptyState icon={AlertCircle} title="Failed to load requests." />
          ) : !(creditRequests.data?.length) ? (
            <EmptyState icon={CreditCard} title="No credit limit requests." />
          ) : (
            <PortalAnimatedList className="divide-y divide-gray-100">
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
                      onChange={(next) => setCreditDrafts((prev) => ({ ...prev, [req.id]: next }))}
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
                          setActionError(
                            'Enter a valid approved limit (0 or greater), or leave it blank to use the requested amount.',
                          );
                          return;
                        }
                        void reviewCredit
                          .mutateAsync({
                            id: req.id,
                            dto: {
                              status: current.status as 'APPROVED' | 'REJECTED',
                              review_notes: current.review_notes.trim() || undefined,
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
        </PanelShell>
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
    <div className="space-y-3 px-5 py-4 hover:bg-gray-50/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#0A2942]">
            {dispute.invoiceNumber || dispute.invoiceId || 'Dispute'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {[dispute.partyName, dispute.reason, dispute.createdAt].filter(Boolean).join(' · ')}
          </div>
          {dispute.description ? (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{dispute.description}</p>
          ) : null}
        </div>
        {dispute.status ? <Badge variant="info">{dispute.status}</Badge> : null}
      </div>
      <div className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3 sm:grid-cols-[160px_1fr_auto]">
        <select
          className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
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
    <div className="space-y-3 px-5 py-4 hover:bg-gray-50/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#0A2942]">
            <span>{request.partyName || request.partyId || 'Party'}</span>
            <span className="rounded-full bg-[#FF751F]/10 px-2 py-0.5 text-xs font-semibold text-[#FF751F]">
              Requested {request.requestedLimit ?? '—'}
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {[request.createdAt, request.justification].filter(Boolean).join(' · ')}
          </div>
        </div>
        {request.status ? (
          <Badge
            variant={
              String(request.status).toUpperCase() === 'APPROVED'
                ? 'success'
                : String(request.status).toUpperCase() === 'REJECTED'
                  ? 'neutral'
                  : 'info'
            }
          >
            {request.status}
          </Badge>
        ) : null}
      </div>
      {disabled ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <CheckCircle2 size={14} />
          Already reviewed — no further action needed.
        </div>
      ) : (
        <div className="grid gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-3 sm:grid-cols-2 lg:grid-cols-[140px_1fr_140px_auto]">
          <select
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
            value={draft.status}
            disabled={pending}
            onChange={(e) => onChange({ ...draft, status: e.target.value })}
          >
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <Input
            value={draft.review_notes}
            disabled={pending}
            onChange={(e) => onChange({ ...draft, review_notes: e.target.value })}
            placeholder="Review notes"
          />
          <Input
            type="number"
            value={draft.approved_limit}
            disabled={pending || draft.status === 'REJECTED'}
            onChange={(e) => onChange({ ...draft, approved_limit: e.target.value })}
            placeholder="Approved limit"
          />
          <Button type="button" size="sm" disabled={pending} onClick={onSubmit}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
}
