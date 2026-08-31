import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageSquare } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { ATTACHMENT_UPLOAD_OPTIONS, handleValidatedFileInput } from '@/lib/fileUploadValidation';
import { PortalApiError } from '@/lib/portalApiClient';
import {
  PortalAnimatedList,
  PortalAnimatedListItem,
  PortalEmptyState,
  PortalLoadingState,
  PortalPageHeader,
  PortalPanel,
} from '@/features/portal-auth/components/portal-ui';
import {
  useCreatePortalMessage,
  useDownloadPortalMessageAttachment,
  usePortalMessage,
  usePortalMessages,
  useReplyPortalMessage,
} from '../hooks/usePortalMessages';
import type { PortalMessage } from '../types/portalMessages.types';

const optionalUuid = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || isUuid(v), 'Enter a valid UUID');

const createMessageSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be at most 200 characters'),
  body: z.string().trim().min(5, 'Message must be at least 5 characters'),
  job_id: optionalUuid,
  invoice_id: optionalUuid,
});

type CreateMessageValues = z.infer<typeof createMessageSchema>;

function MessageThreadRow({ message }: { message: PortalMessage }) {
  const [open, setOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const detail = usePortalMessage(message.id, open);
  const reply = useReplyPortalMessage();
  const download = useDownloadPortalMessageAttachment();
  const thread = detail.data ?? message;
  const replies = thread.replies ?? [];
  const hasAttachment = Boolean(
    message.hasAttachment || thread.hasAttachment || thread.attachmentName || message.attachmentName,
  );

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="text-sm font-semibold">{message.subject}</div>
          {message.body ? (
            <p className="mt-1 text-sm text-[var(--color-neutral-600)] whitespace-pre-wrap line-clamp-2">
              {message.body}
            </p>
          ) : null}
          <div className="mt-1 text-xs text-[var(--color-neutral-500)]">
            {[
              message.senderName || message.senderEmail,
              message.partyName ? `Shared with ${message.partyName}` : 'Shared with your company',
              message.createdAt,
            ]
              .filter(Boolean)
              .join(' · ')}
            {open ? ' · Hide thread' : ' · Open thread'}
          </div>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {message.readByStaff ? (
            <Badge variant="success">Read</Badge>
          ) : (
            <Badge variant="neutral">Sent</Badge>
          )}
          {hasAttachment && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={download.isPending}
              onClick={() => {
                setLocalError(null);
                void download
                  .mutateAsync({
                    id: message.id,
                    name: thread.attachmentName || message.attachmentName || 'message-attachment',
                  })
                  .catch((err) =>
                    setLocalError(
                      err instanceof PortalApiError || err instanceof Error
                        ? err.message
                        : 'Could not download attachment.',
                    ),
                  );
              }}
            >
              {download.isPending ? 'Downloading…' : 'Download attachment'}
            </Button>
          )}
        </div>
      </div>
      {localError ? (
        <p className="mt-2 text-xs text-[var(--color-danger-600)]" role="alert">
          {localError}
        </p>
      ) : null}

      {open && (
        <div className="mt-3 space-y-3 border-t border-[var(--color-neutral-100)] pt-3">
          {detail.isLoading ? (
            <p className="text-xs text-[var(--color-neutral-400)]">Loading thread…</p>
          ) : detail.isError ? (
            <p className="text-xs text-[var(--color-danger-600)]">Could not load replies.</p>
          ) : (
            <>
              {thread.body ? (
                <p className="text-sm text-[var(--color-neutral-700)] whitespace-pre-wrap">
                  {thread.body}
                </p>
              ) : null}
              {replies.length > 0 ? (
                <ul className="space-y-2">
                  {replies.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-md bg-[var(--color-neutral-50)] px-3 py-2 text-sm"
                    >
                      <div className="text-xs text-[var(--color-neutral-500)]">
                        {[r.authorName || r.authorType || 'Reply', r.createdAt]
                          .filter(Boolean)
                          .join(' · ')}
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
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  setLocalError(null);
                  const trimmed = replyBody.trim();
                  if (!trimmed) {
                    setLocalError('Reply is required.');
                    return;
                  }
                  void reply
                    .mutateAsync({
                      id: message.id,
                      dto: { body: trimmed, file: replyFile ?? undefined },
                    })
                    .then(() => {
                      setReplyBody('');
                      setReplyFile(null);
                    })
                    .catch((err) => {
                      setLocalError(
                        err instanceof PortalApiError || err instanceof Error
                          ? err.message
                          : 'Could not send reply.',
                      );
                    });
                }}
              >
                <textarea
                  className="min-h-[72px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                  placeholder="Write a reply…"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  required
                  minLength={1}
                />
                <input
                  type="file"
                  key={replyFile ? replyFile.name : 'reply-no-file'}
                  className="block w-full text-sm text-[var(--color-neutral-700)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-neutral-100)] file:px-3 file:py-1.5 file:text-sm"
                  onChange={(e) =>
                    handleValidatedFileInput(
                      e.target.files,
                      setReplyFile,
                      undefined,
                      ATTACHMENT_UPLOAD_OPTIONS,
                    )
                  }
                />
                <Button type="submit" size="sm" disabled={reply.isPending || !replyBody.trim()}>
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

export default function PortalMessagesPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const params = useMemo(() => ({ page, limit: 20 }), [page]);
  const { data, isLoading, isError, error, refetch } = usePortalMessages(params);
  const create = useCreatePortalMessage();
  const [formError, setFormError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const form = useForm<CreateMessageValues>({
    resolver: zodResolver(createMessageSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { subject: '', body: '', job_id: '', invoice_id: '' },
  });

  useEffect(() => {
    const jobId = searchParams.get('job_id')?.trim();
    const invoiceId = searchParams.get('invoice_id')?.trim();
    if (jobId) form.setValue('job_id', jobId);
    if (invoiceId) form.setValue('invoice_id', invoiceId);
  }, [form, searchParams]);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Messages"
        description="Party-shared inbox — everyone at your company sees the same threads and staff replies."
      />

      <PortalPanel padded>
        {formError && (
          <p role="alert" className="mb-4 text-sm text-[var(--color-danger-600)]">
            {formError}
          </p>
        )}
        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            setFormError(null);
            void create
              .mutateAsync({
                subject: values.subject.trim(),
                body: values.body.trim(),
                job_id: values.job_id?.trim() || undefined,
                invoice_id: values.invoice_id?.trim() || undefined,
                file: attachment ?? undefined,
              })
              .then(() => {
                form.reset({ subject: '', body: '', job_id: '', invoice_id: '' });
                setAttachment(null);
              })
              .catch((err) => {
                setFormError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Could not send message.',
                );
              });
          })}
        >
          <Input
            label="Subject"
            required
            maxLength={200}
            hint="3–200 characters"
            error={form.formState.errors.subject?.message}
            {...form.register('subject')}
          />
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Message <span className="text-[var(--color-danger-500)]">*</span>
            </span>
            <textarea
              className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              {...form.register('body')}
            />
            {form.formState.errors.body ? (
              <p className="mt-1 text-xs text-[var(--color-danger-500)]">
                {form.formState.errors.body.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-neutral-400)]">At least 5 characters</p>
            )}
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Job ID (optional)"
              hint="UUID"
              error={form.formState.errors.job_id?.message}
              {...form.register('job_id')}
            />
            <Input
              label="Invoice ID (optional)"
              hint="UUID"
              error={form.formState.errors.invoice_id?.message}
              {...form.register('invoice_id')}
            />
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]">
              Attachment (optional)
            </span>
            <input
              type="file"
              key={attachment ? attachment.name : 'message-no-file'}
              className="block w-full text-sm text-[var(--color-neutral-700)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-neutral-100)] file:px-3 file:py-1.5 file:text-sm"
              onChange={(e) =>
                handleValidatedFileInput(
                  e.target.files,
                  setAttachment,
                  (message) => setFormError(message),
                  ATTACHMENT_UPLOAD_OPTIONS,
                )
              }
            />
            {attachment ? (
              <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{attachment.name}</p>
            ) : (
              <p className="mt-1 text-xs text-[var(--color-neutral-400)]">
                Optional supporting file (PDF, image, or spreadsheet).
              </p>
            )}
          </label>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </PortalPanel>

      <PortalPanel>
        {isLoading ? (
          <PortalLoadingState />
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
            description="Threads you or a colleague send are shared across your company portal users."
            Icon={MessageSquare}
          />
        ) : (
          <PortalAnimatedList className="divide-y divide-[var(--color-neutral-100)]">
            {items.map((m) => (
              <PortalAnimatedListItem key={m.id}>
                <MessageThreadRow message={m} />
              </PortalAnimatedListItem>
            ))}
          </PortalAnimatedList>
        )}
      </PortalPanel>
      {meta && meta.totalPages > 1 && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
