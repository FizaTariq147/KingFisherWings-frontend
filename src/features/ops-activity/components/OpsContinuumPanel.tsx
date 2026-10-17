import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import {
  useOpsActivityMutations,
  useOpsAttachments,
  useOpsComments,
  useOpsComplaints,
  useOpsFollowUps,
  useOpsHistory,
  useOpsLikes,
  useOpsLinks,
  useOpsReferences,
  useOpsTags,
} from '../hooks/useOpsActivity';
import type { OpsContinuumTab, OpsEntityType } from '../types/opsActivity.types';
import {
  buildOpsLifecycleLinks,
  opsLifecycleHostLabel,
  resolveOpsContinuumEntity,
  type OpsLifecycleLinks,
} from '../utils/resolveOpsContinuumEntity';

const TABS: { key: OpsContinuumTab; label: string }[] = [
  { key: 'comments', label: 'Comments' },
  { key: 'follow-ups', label: 'Follow-ups' },
  { key: 'attachments', label: 'Attachments' },
  { key: 'references', label: 'References' },
  { key: 'tags', label: 'Tags' },
  { key: 'links', label: 'Links' },
  { key: 'likes', label: 'Likes' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'history', label: 'History' },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function rowId(row: Record<string, unknown>, i: number): string {
  return String(row.id ?? row.tag_id ?? row.attachment_id ?? i);
}

function cell(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '—';
}

function RowList({
  loading,
  empty,
  rows,
  render,
}: {
  loading: boolean;
  empty: string;
  rows: Record<string, unknown>[];
  render: (row: Record<string, unknown>, i: number) => ReactNode;
}) {
  if (loading) return <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--color-neutral-400)]">{empty}</p>;
  }
  return <ul className="space-y-2">{rows.map((row, i) => render(row, i))}</ul>;
}

export function OpsContinuumPanel({
  entityType,
  entityId,
  className = '',
  defaultTab = 'comments',
  hideTabBar = false,
  compact = false,
  opsContinuum,
  links: lifecycleLinks,
}: {
  entityType: OpsEntityType;
  entityId: string;
  className?: string;
  defaultTab?: OpsContinuumTab;
  /** When true (rail modal), show only the active resource body. */
  hideTabBar?: boolean;
  /** Skip outer card chrome when embedded in a modal. */
  compact?: boolean;
  /** Detail ops_continuum — used for explicit root_entity_* sync host. */
  opsContinuum?: Record<string, unknown> | null;
  /** Lifecycle ids so continuum hosts on earliest entity across the flow. */
  links?: OpsLifecycleLinks | null;
}) {
  const host = useMemo(
    () =>
      resolveOpsContinuumEntity({
        entityType,
        entityId,
        opsContinuum,
        links: lifecycleLinks,
      }),
    [entityType, entityId, opsContinuum, lifecycleLinks],
  );
  const hostEntityType = host.entityType;
  const hostEntityId = host.entityId;
  const normalizedLinks = useMemo(
    () => buildOpsLifecycleLinks(lifecycleLinks),
    [lifecycleLinks],
  );

  const [tab, setTab] = useState<OpsContinuumTab>(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setTab(defaultTab);
    setError(null);
    setMsg(null);
  }, [defaultTab]);

  const [commentBody, setCommentBody] = useState('');
  const [followSubject, setFollowSubject] = useState('');
  const [followNotes, setFollowNotes] = useState('');
  const [followDue, setFollowDue] = useState('');
  const [refType, setRefType] = useState('BOOKING_REF');
  const [refValue, setRefValue] = useState('');
  const [tagName, setTagName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintBody, setComplaintBody] = useState('');
  const [attachName, setAttachName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');

  const commentsQ = useOpsComments(hostEntityType, hostEntityId, tab === 'comments');
  const followUpsQ = useOpsFollowUps(hostEntityType, hostEntityId, tab === 'follow-ups');
  const attachmentsQ = useOpsAttachments(
    hostEntityType,
    hostEntityId,
    tab === 'attachments',
  );
  const referencesQ = useOpsReferences(hostEntityType, hostEntityId, tab === 'references');
  const tagsQ = useOpsTags(hostEntityType, hostEntityId, tab === 'tags');
  const linksQ = useOpsLinks(hostEntityType, hostEntityId, tab === 'links');
  const likesQ = useOpsLikes(hostEntityType, hostEntityId, tab === 'likes');
  const complaintsQ = useOpsComplaints(hostEntityType, hostEntityId, tab === 'complaints');
  const historyQ = useOpsHistory(hostEntityType, hostEntityId, tab === 'history');
  const mutations = useOpsActivityMutations(hostEntityType, hostEntityId);

  const toRows = (data: unknown): Record<string, unknown>[] => {
    if (!Array.isArray(data)) return [];
    return data
      .map(asRecord)
      .filter((r): r is Record<string, unknown> => Boolean(r));
  };

  const comments = useMemo(() => toRows(commentsQ.data), [commentsQ.data]);
  const followUps = useMemo(() => toRows(followUpsQ.data), [followUpsQ.data]);
  const attachments = useMemo(() => toRows(attachmentsQ.data), [attachmentsQ.data]);
  const references = useMemo(() => toRows(referencesQ.data), [referencesQ.data]);
  const tags = useMemo(() => toRows(tagsQ.data), [tagsQ.data]);
  const links = useMemo(() => toRows(linksQ.data), [linksQ.data]);
  const likes = useMemo(() => toRows(likesQ.data), [likesQ.data]);
  const complaints = useMemo(() => toRows(complaintsQ.data), [complaintsQ.data]);
  const history = useMemo(() => toRows(historyQ.data), [historyQ.data]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const body = (
      <div className={`space-y-3 ${compact ? '' : 'px-4 pb-4'}`}>
        {!hideTabBar ? (
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`rounded-sm px-2.5 py-1 text-[12px] font-medium ${
                  tab === t.key
                    ? 'bg-[var(--fresa-action,#0A2942)] text-white'
                    : 'border border-[var(--fresa-border,#C9D3DF)] bg-white text-[#334155]'
                }`}
                onClick={() => {
                  setTab(t.key);
                  setError(null);
                  setMsg(null);
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

        <p className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-2.5 py-1.5 text-[11px] text-[#475569]">
          {opsLifecycleHostLabel(host)}
        </p>

        {tab === 'comments' ? (
          <div className="space-y-3">
            <RowList
              loading={commentsQ.isLoading}
              empty="No comments."
              rows={comments}
              render={(row, i) => (
                <li
                  key={rowId(row, i)}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="whitespace-pre-wrap">
                      {cell(row, 'body', 'text', 'content', 'comment')}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-neutral-400)]">
                      {cell(row, 'author_name', 'created_by', 'user_name')} ·{' '}
                      {cell(row, 'created_at', 'updated_at')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={mutations.deleteComment.isPending}
                    onClick={() =>
                      void run(
                        () => mutations.deleteComment.mutateAsync(rowId(row, i)),
                        'Comment removed.',
                      )
                    }
                  >
                    Delete
                  </Button>
                </li>
              )}
            />
            <div className="flex flex-wrap items-end gap-2">
              <label className="block min-w-[16rem] flex-1 text-sm">
                <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
                  New comment
                </span>
                <textarea
                  className="min-h-[4rem] w-full rounded-sm border border-[var(--fresa-border,#C9D3DF)] px-2.5 py-2 text-[13px]"
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                />
              </label>
              <Button
                type="button"
                size="sm"
                variant="create"
                disabled={!commentBody.trim() || mutations.addComment.isPending}
                onClick={() =>
                  void run(async () => {
                    await mutations.addComment.mutateAsync({
                      body: commentBody.trim().slice(0, 4000),
                    });
                    setCommentBody('');
                  }, 'Comment added.')
                }
              >
                Post
              </Button>
            </div>
          </div>
        ) : null}

        {tab === 'follow-ups' ? (
          <div className="space-y-3">
            <RowList
              loading={followUpsQ.isLoading}
              empty="No follow-ups."
              rows={followUps}
              render={(row, i) => (
                <li
                  key={rowId(row, i)}
                  className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                >
                  <p className="font-medium">
                    {cell(row, 'subject', 'title', 'notes', 'note')}
                  </p>
                  {cell(row, 'notes', 'note') !== '—' &&
                  cell(row, 'subject', 'title') !== cell(row, 'notes', 'note') ? (
                    <p className="text-[12px] text-[var(--color-neutral-600)]">
                      {cell(row, 'notes', 'note')}
                    </p>
                  ) : null}
                  <p className="text-[12px] text-[var(--color-neutral-500)]">
                    Due {cell(row, 'due_date', 'due_at')} · {cell(row, 'status')}
                  </p>
                </li>
              )}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                label="Subject"
                value={followSubject}
                maxLength={200}
                onChange={(e) => setFollowSubject(e.target.value)}
              />
              <Input
                label="Due date"
                type="date"
                value={followDue}
                onChange={(e) => setFollowDue(e.target.value)}
              />
              <Input
                label="Notes (optional)"
                value={followNotes}
                onChange={(e) => setFollowNotes(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={
                    followSubject.trim().length < 1 ||
                    !followDue ||
                    mutations.createFollowUp.isPending
                  }
                  onClick={() =>
                    void run(async () => {
                      const subject = followSubject.trim().slice(0, 200);
                      const due_date = followDue.slice(0, 10);
                      await mutations.createFollowUp.mutateAsync({
                        subject,
                        due_date,
                        ...(followNotes.trim()
                          ? { notes: followNotes.trim() }
                          : {}),
                      });
                      setFollowSubject('');
                      setFollowNotes('');
                      setFollowDue('');
                    }, 'Follow-up created.')
                  }
                >
                  Add follow-up
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'attachments' ? (
          <div className="space-y-3">
            <RowList
              loading={attachmentsQ.isLoading}
              empty="No attachments."
              rows={attachments}
              render={(row, i) => {
                const id = rowId(row, i);
                const name = cell(row, 'file_name', 'name', 'label', 'original_name');
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{name}</span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={mutations.downloadAttachment.isPending}
                        onClick={() =>
                          void run(
                            () =>
                              mutations.downloadAttachment.mutateAsync({
                                attachmentId: id,
                                fallbackName: name !== '—' ? name : 'attachment',
                              }),
                            'Download started.',
                          )
                        }
                      >
                        Download
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={mutations.getAttachmentDownloadUrl.isPending}
                        onClick={() =>
                          void run(async () => {
                            const raw =
                              await mutations.getAttachmentDownloadUrl.mutateAsync(id);
                            const rec = asRecord(raw);
                            const url = String(
                              rec?.url ?? rec?.download_url ?? rec?.signed_url ?? '',
                            ).trim();
                            if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            else throw new Error('No download URL returned.');
                          }, 'Download URL opened.')
                        }
                      >
                        Link
                      </Button>
                    </div>
                  </li>
                );
              }}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                label="File name"
                value={attachName}
                onChange={(e) => setAttachName(e.target.value)}
              />
              <Input
                label="File URL"
                value={attachUrl}
                onChange={(e) => setAttachUrl(e.target.value)}
              />
              <div className="flex flex-wrap items-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={
                    !attachName.trim() ||
                    !attachUrl.trim() ||
                    mutations.registerAttachment.isPending
                  }
                  onClick={() =>
                    void run(async () => {
                      await mutations.registerAttachment.mutateAsync({
                        file_name: attachName.trim(),
                        file_url: attachUrl.trim(),
                      });
                      setAttachName('');
                      setAttachUrl('');
                    }, 'Attachment registered.')
                  }
                >
                  Register
                </Button>
                <label className="inline-flex cursor-pointer items-center">
                  <span className="sr-only">Upload file</span>
                  <input
                    type="file"
                    className="text-[12px]"
                    disabled={mutations.uploadAttachment.isPending}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      void run(
                        () => mutations.uploadAttachment.mutateAsync({ file }),
                        'File uploaded.',
                      );
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'references' ? (
          <div className="space-y-3">
            <RowList
              loading={referencesQ.isLoading}
              empty="No references."
              rows={references}
              render={(row, i) => (
                <li
                  key={rowId(row, i)}
                  className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium">
                    {cell(row, 'ref_type', 'reference_type', 'type', 'label')}
                  </span>
                  <span className="ml-2 text-[var(--color-neutral-600)]">
                    {cell(
                      row,
                      'ref_value',
                      'reference_no',
                      'value',
                      'reference_number',
                    )}
                  </span>
                </li>
              )}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                label="Ref type"
                value={refType}
                maxLength={80}
                onChange={(e) => setRefType(e.target.value)}
              />
              <Input
                label="Ref value"
                value={refValue}
                maxLength={300}
                onChange={(e) => setRefValue(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={
                    !refType.trim() ||
                    !refValue.trim() ||
                    mutations.addReference.isPending
                  }
                  onClick={() =>
                    void run(async () => {
                      await mutations.addReference.mutateAsync({
                        ref_type: refType.trim().slice(0, 80),
                        ref_value: refValue.trim().slice(0, 300),
                      });
                      setRefValue('');
                    }, 'Reference added.')
                  }
                >
                  Add reference
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'tags' ? (
          <div className="space-y-3">
            <RowList
              loading={tagsQ.isLoading}
              empty="No tags."
              rows={tags}
              render={(row, i) => {
                const id = rowId(row, i);
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                  >
                    <span>{cell(row, 'tag', 'name', 'label')}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={mutations.removeTag.isPending}
                      onClick={() =>
                        void run(
                          () => mutations.removeTag.mutateAsync(id),
                          'Tag removed.',
                        )
                      }
                    >
                      Remove
                    </Button>
                  </li>
                );
              }}
            />
            <div className="flex flex-wrap items-end gap-2">
              <Input
                label="Tag"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="create"
                disabled={!tagName.trim() || mutations.addTag.isPending}
                onClick={() =>
                  void run(async () => {
                    await mutations.addTag.mutateAsync({
                      tag: tagName.trim().slice(0, 100),
                    });
                    setTagName('');
                  }, 'Tag added.')
                }
              >
                Add tag
              </Button>
            </div>
          </div>
        ) : null}

        {tab === 'links' ? (
          <div className="space-y-3">
            {(normalizedLinks.enquiryId ||
              normalizedLinks.quotationId ||
              normalizedLinks.shipmentId ||
              normalizedLinks.jobId) && (
              <div className="space-y-1.5 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
                  Lifecycle
                </p>
                <ul className="space-y-1 text-[12px] text-[#334155]">
                  {normalizedLinks.enquiryId ? (
                    <li>
                      Enquiry ·{' '}
                      <a
                        className="text-[var(--color-primary-700)] hover:underline"
                        href={`/sales/enquiries/${normalizedLinks.enquiryId}`}
                      >
                        {normalizedLinks.enquiryId.slice(0, 8)}…
                      </a>
                    </li>
                  ) : null}
                  {normalizedLinks.quotationId ? (
                    <li>
                      Quotation ·{' '}
                      <a
                        className="text-[var(--color-primary-700)] hover:underline"
                        href={`/quotations/${normalizedLinks.quotationId}`}
                      >
                        {normalizedLinks.quotationId.slice(0, 8)}…
                      </a>
                    </li>
                  ) : null}
                  {normalizedLinks.shipmentId ? (
                    <li>
                      Shipment ·{' '}
                      <a
                        className="text-[var(--color-primary-700)] hover:underline"
                        href={`/operations/shipments/${normalizedLinks.shipmentId}`}
                      >
                        {normalizedLinks.shipmentId.slice(0, 8)}…
                      </a>
                    </li>
                  ) : null}
                  {normalizedLinks.jobId ? (
                    <li>
                      Job ·{' '}
                      <a
                        className="text-[var(--color-primary-700)] hover:underline"
                        href={`/jobs/${normalizedLinks.jobId}`}
                      >
                        {normalizedLinks.jobId.slice(0, 8)}…
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            )}
            <RowList
              loading={linksQ.isLoading}
              empty="No links."
              rows={links}
              render={(row, i) => {
                const url = cell(row, 'url', 'href', 'link');
                return (
                  <li
                    key={rowId(row, i)}
                    className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {cell(row, 'title', 'label', 'link_type')}
                    </p>
                    {url !== '—' ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-[var(--color-primary-700)] hover:underline"
                      >
                        {url}
                      </a>
                    ) : null}
                  </li>
                );
              }}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                label="Title"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
              <Input
                label="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={
                    !linkTitle.trim() ||
                    !linkUrl.trim() ||
                    mutations.addLink.isPending
                  }
                  onClick={() =>
                    void run(async () => {
                      await mutations.addLink.mutateAsync({
                        title: linkTitle.trim().slice(0, 200),
                        url: linkUrl.trim().slice(0, 1000),
                      });
                      setLinkUrl('');
                      setLinkTitle('');
                    }, 'Link added.')
                  }
                >
                  Add link
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'likes' ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--color-neutral-600)]">
              {likesQ.isLoading
                ? 'Loading likes…'
                : `${likes.length} like${likes.length === 1 ? '' : 's'}`}
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={mutations.toggleLike.isPending}
              onClick={() =>
                void run(() => mutations.toggleLike.mutateAsync({}), 'Like toggled.')
              }
            >
              Toggle like
            </Button>
            <RowList
              loading={false}
              empty=""
              rows={likes}
              render={(row, i) => (
                <li
                  key={rowId(row, i)}
                  className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                >
                  {cell(row, 'user_name', 'created_by', 'email', 'id')}
                </li>
              )}
            />
          </div>
        ) : null}

        {tab === 'complaints' ? (
          <div className="space-y-3">
            <RowList
              loading={complaintsQ.isLoading}
              empty="No complaints."
              rows={complaints}
              render={(row, i) => {
                const id = rowId(row, i);
                return (
                  <li
                    key={id}
                    className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {cell(row, 'subject', 'title')}
                    </p>
                    <p className="text-[12px] text-[var(--color-neutral-600)]">
                      {cell(row, 'body', 'description', 'notes')}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[12px]">
                        Status: {cell(row, 'status')}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="edit"
                        disabled={mutations.patchComplaint.isPending}
                        onClick={() =>
                          void run(
                            () =>
                              mutations.patchComplaint.mutateAsync({
                                complaintId: id,
                                body: { status: 'CLOSED' },
                              }),
                            'Complaint closed.',
                          )
                        }
                      >
                        Close
                      </Button>
                    </div>
                  </li>
                );
              }}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                label="Subject"
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
              />
              <Input
                label="Body"
                value={complaintBody}
                onChange={(e) => setComplaintBody(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={
                    !complaintSubject.trim() ||
                    !complaintBody.trim() ||
                    mutations.addComplaint.isPending
                  }
                  onClick={() =>
                    void run(async () => {
                      await mutations.addComplaint.mutateAsync({
                        subject: complaintSubject.trim().slice(0, 200),
                        body: complaintBody.trim(),
                      });
                      setComplaintSubject('');
                      setComplaintBody('');
                    }, 'Complaint logged.')
                  }
                >
                  Log complaint
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'history' ? (
          <RowList
            loading={historyQ.isLoading}
            empty="No history events."
            rows={history}
            render={(row, i) => (
              <li
                key={rowId(row, i)}
                className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {cell(row, 'event', 'action', 'type', 'summary')}
                </p>
                <p className="text-[12px] text-[var(--color-neutral-500)]">
                  {cell(row, 'created_at', 'timestamp', 'at')} ·{' '}
                  {cell(row, 'actor_name', 'user_name', 'created_by')}
                </p>
              </li>
            )}
          />
        ) : null}
      </div>
  );

  if (compact || hideTabBar) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ops continuum</CardTitle>
      </CardHeader>
      {body}
    </Card>
  );
}
