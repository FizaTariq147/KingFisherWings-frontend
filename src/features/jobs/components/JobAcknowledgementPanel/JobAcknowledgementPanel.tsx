import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SectionAttachmentsPanel } from '@/features/shared/section-attachments';
import {
  ATTACHMENT_UPLOAD_OPTIONS,
  handleValidatedFileInput,
} from '@/lib/fileUploadValidation';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { ApiDataView } from '../ApiDataView';
import { jobService } from '../../services/job.service';
import { jobKeys, useJobContainers } from '../../hooks/useJobs';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { DeliveryAcknowledgement } from '../../types/job.types';

function statusVariant(
  status: string,
): 'neutral' | 'warning' | 'info' | 'success' {
  const s = status.toUpperCase();
  if (s === 'RECEIVED_BY_ADMIN') return 'success';
  if (s === 'ACKNOWLEDGED_BY_CUSTOMER' || s === 'SUBMITTED') return 'info';
  if (s === 'SENT_TO_CUSTOMER') return 'warning';
  if (s === 'DRAFT') return 'warning';
  return 'neutral';
}

interface JobAcknowledgementPanelProps {
  jobId: string;
}

/** Admin delivery acknowledgement — send → customer mark → admin receive. */
export function JobAcknowledgementPanel({ jobId }: JobAcknowledgementPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [...jobKeys.all, 'acknowledgement', jobId] as const,
    queryFn: () => jobService.getAcknowledgement(jobId),
    enabled: Boolean(accessToken) && isUuid(jobId),
  });
  const { data: containers = [] } = useJobContainers(jobId);

  const [containerId, setContainerId] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [receiveNotes, setReceiveNotes] = useState('');

  const containerOptions = useMemo(
    () =>
      containers
        .filter((c) => isUuid(c.id))
        .map((c) => ({
          value: c.id,
          label: c.container_number?.trim() || c.id.slice(0, 8).toUpperCase(),
        })),
    [containers],
  );

  const send = useMutation({
    mutationFn: () =>
      jobService.sendAcknowledgement(jobId, {
        message: message.trim(),
        ...(containerId.trim() ? { container_id: containerId.trim() } : {}),
        ...(file ? { file } : {}),
      }),
    onSuccess: (data) => {
      qc.setQueryData([...jobKeys.all, 'acknowledgement', jobId], data);
      void qc.invalidateQueries({ queryKey: [...jobKeys.all, 'acknowledgement', jobId] });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    },
  });

  const receive = useMutation({
    mutationFn: () =>
      jobService.receiveAcknowledgement(jobId, {
        ...(receiveNotes.trim() ? { notes: receiveNotes.trim() } : {}),
      }),
    onSuccess: (data) => {
      qc.setQueryData([...jobKeys.all, 'acknowledgement', jobId], data);
      void qc.invalidateQueries({ queryKey: [...jobKeys.all, 'acknowledgement', jobId] });
    },
  });

  const generatePdf = useMutation({
    mutationFn: () => jobService.generateAcknowledgementPdf(jobId),
  });

  const ack: DeliveryAcknowledgement | undefined = query.data;
  const status = (ack?.status || 'DRAFT').toUpperCase();
  const customerMarked =
    ack?.customer_marked_received === true ||
    status === 'ACKNOWLEDGED_BY_CUSTOMER' ||
    status === 'RECEIVED_BY_ADMIN';
  const canSend = status === 'DRAFT' || !ack?.id;
  const waitingOnCustomer = status === 'SENT_TO_CUSTOMER';
  const canReceive =
    status === 'ACKNOWLEDGED_BY_CUSTOMER' ||
    status === 'SUBMITTED' ||
    (customerMarked && status !== 'RECEIVED_BY_ADMIN');
  const closed = status === 'RECEIVED_BY_ADMIN';
  const adminText = ack?.admin_message || ack?.template_message || ack?.remarks;

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      await query.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          Delivery acknowledgement
          {ack ? (
            <Badge variant={statusVariant(status)}>{status.replaceAll('_', ' ')}</Badge>
          ) : null}
          {customerMarked && status !== 'RECEIVED_BY_ADMIN' ? (
            <Badge variant="info">Customer marked received</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <div className="px-4 pb-4 space-y-3 text-sm">
        {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
        {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
        {query.isLoading ? (
          <p className="text-[var(--color-neutral-400)]">Loading acknowledgement…</p>
        ) : null}

        {waitingOnCustomer ? (
          <p className="rounded-sm border border-[var(--color-warning-200,#FDE68A)] bg-[var(--color-warning-50,#FFFBEB)] px-3 py-2 text-[13px] text-[var(--color-neutral-700)]">
            Sent to customer — waiting for them to mark received in the portal.
            {ack?.sent_at ? ` Sent at ${ack.sent_at}.` : ''}
          </p>
        ) : null}

        {closed ? (
          <p className="rounded-sm border border-[var(--color-success-200,#BBF7D0)] bg-[var(--color-success-50,#F0FDF4)] px-3 py-2 text-[13px] text-[var(--color-neutral-700)]">
            Closed — acknowledgement received by admin
            {ack?.received_at ? ` at ${ack.received_at}` : ''}.
          </p>
        ) : null}

        {adminText ? (
          <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              Message to customer
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] text-[#0f172a]">{adminText}</p>
          </div>
        ) : null}

        {ack && (ack.receiver_name || customerMarked) ? (
          <ul className="divide-y divide-[#e8edf2] rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
            {[
              { label: 'Receiver', value: ack.receiver_name },
              { label: 'Title', value: ack.receiver_title },
              { label: 'Goods condition', value: ack.goods_condition },
              {
                label: 'Customer marked at',
                value: ack.customer_acknowledged_at || ack.acknowledged_at,
              },
              { label: 'Received by admin at', value: ack.received_at },
              ...(ack.remarks && ack.remarks !== adminText
                ? [{ label: 'Customer remarks', value: ack.remarks }]
                : []),
              ...(ack.signature_url || ack.signature_s3_key
                ? [
                    {
                      label: 'Signature',
                      value: ack.signature_url ? 'On file' : 'On file (key only)',
                      href: ack.signature_url,
                    },
                  ]
                : []),
            ].map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
              >
                <span className="text-[12px] font-medium text-[#64748b]">{row.label}</span>
                <span className="break-words text-[13px] font-medium text-[#0f172a]">
                  {'href' in row && row.href ? (
                    <a
                      className="text-[var(--color-primary)] underline"
                      href={row.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {row.value?.trim() || 'View'}
                    </a>
                  ) : (
                    row.value?.trim() || '—'
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {(ack?.attachments?.length ?? 0) > 0 ? (
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-neutral-700)]">
              <Paperclip className="h-3.5 w-3.5" aria-hidden />
              Acknowledgement files
            </p>
            <ul className="space-y-1 text-[13px]">
              {ack!.attachments!.map((a) => (
                <li key={a.id}>
                  {a.file_url ? (
                    <a
                      className="text-[var(--color-primary)] underline"
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.file_name || 'Attachment'}
                    </a>
                  ) : (
                    a.file_name || a.id.slice(0, 8)
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {ack?.template_snapshot ? (
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
              Template
            </p>
            <ApiDataView
              data={ack.template_snapshot}
              emptyLabel="No template fields returned."
              maxHeightClass="max-h-80"
            />
          </div>
        ) : null}

        <SectionAttachmentsPanel
          entity="jobs"
          entityId={jobId}
          section="acknowledgement"
          recordId={ack?.id}
          title="Acknowledgement attachments"
          compact
        />

        {canSend ? (
          <div className="grid gap-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] p-3 sm:grid-cols-2">
            <p className="sm:col-span-2 text-[12px] text-[#64748b]">
              Compose a written acknowledgement for the customer. Optional file attaches with the
              send. Customer can only mark received after this is sent.
            </p>
            {containerOptions.length > 1 ? (
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Container
                </span>
                <select
                  className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                  value={containerId}
                  onChange={(e) => setContainerId(e.target.value)}
                >
                  <option value="">Select container…</option>
                  {containerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                Message to customer *
              </span>
              <textarea
                className="min-h-[96px] w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please confirm receipt of the consignment for this job."
              />
            </label>
            <div className="sm:col-span-2">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) =>
                  handleValidatedFileInput(
                    e.target.files,
                    setFile,
                    undefined,
                    ATTACHMENT_UPLOAD_OPTIONS,
                  )
                }
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                leftIcon={<Paperclip className="h-3.5 w-3.5" />}
                onClick={() => fileRef.current?.click()}
              >
                {file ? file.name : 'Optional attachment'}
              </Button>
            </div>
          </div>
        ) : null}

        {canReceive ? (
          <Input
            label="Admin notes (optional)"
            value={receiveNotes}
            onChange={(e) => setReceiveNotes(e.target.value)}
            placeholder="Verified against POD"
          />
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {canSend ? (
            <Button
              type="button"
              disabled={
                send.isPending ||
                !message.trim() ||
                (containerOptions.length > 1 && !containerId.trim())
              }
              onClick={() =>
                void run(() => send.mutateAsync(), 'Acknowledgement sent to customer.')
              }
            >
              {send.isPending ? 'Sending…' : 'Send to customer'}
            </Button>
          ) : null}
          {canReceive ? (
            <Button
              type="button"
              disabled={receive.isPending}
              onClick={() =>
                void run(
                  () => receive.mutateAsync(),
                  'Acknowledgement marked received by admin.',
                )
              }
            >
              {receive.isPending ? 'Saving…' : 'Mark received by admin'}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            disabled={
              generatePdf.isPending ||
              !ack ||
              status === 'DRAFT' ||
              (!ack.id && !waitingOnCustomer && !customerMarked && !closed)
            }
            onClick={() =>
              void run(
                () => generatePdf.mutateAsync(),
                'Proof of delivery PDF queued (visible to customer).',
              )
            }
          >
            {generatePdf.isPending ? 'Generating…' : 'Generate POD PDF'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
