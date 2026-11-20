import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paperclip, Send, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  ACKNOWLEDGEMENT_UPLOAD_OPTIONS,
  handleValidatedMultiFileInput,
} from '@/lib/fileUploadValidation';
import { isUuid } from '@/lib/isUuid';
import { useAuthStore } from '@/store/authStore';
import { openPdfBlobInNewTab } from '@/features/files/utils/pdfBranding';
import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import {
  openBlankPreviewTab,
  openBlobInNewTab,
  triggerBlobDownload,
} from '@/features/files/utils/triggerBlobDownload';
import { ApiDataView } from '../ApiDataView';
import { jobService } from '../../services/job.service';
import { jobKeys, useJob, useJobContainers } from '../../hooks/useJobs';
import { isAirwayBillJobType } from '../../utils/jobDetailTabs';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { pickAcknowledgementFromView } from '../../utils/normalizeJob';
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

/** Admin delivery acknowledgement — send → proof attach / resend → customer → receive. */
export function JobAcknowledgementPanel({ jobId }: JobAcknowledgementPanelProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenantId = useAuthStore((s) => s.user?.tenantId);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const proofRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: job } = useJob(jobId);
  const { data: containers = [], isLoading: containersLoading } = useJobContainers(jobId);
  const isAir = isAirwayBillJobType(job?.job_type);
  /** Air jobs use the containers API as MAWB rows — label only; wire still uses container_id. */
  const unitLabel = isAir ? 'MAWB' : 'Container';
  const unitLabelLower = isAir ? 'MAWB' : 'container';

  const [containerId, setContainerId] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [receiveNotes, setReceiveNotes] = useState('');

  // Full envelope once — BE returns containers[] each with nested acknowledgement.
  const viewQuery = useQuery({
    queryKey: [...jobKeys.all, 'acknowledgement', jobId, 'view'] as const,
    queryFn: () => jobService.getAcknowledgementView(jobId),
    enabled: Boolean(accessToken) && isUuid(jobId) && !containersLoading,
  });

  const containerOptions = useMemo(() => {
    const fromView = (viewQuery.data?.containers ?? [])
      .filter((c) => isUuid(c.id))
      .map((c) => ({
        value: c.id,
        label: c.container_number?.trim() || c.id.slice(0, 8).toUpperCase(),
      }));
    if (fromView.length) return fromView;
    return containers
      .filter((c) => isUuid(c.id))
      .map((c) => ({
        value: c.id,
        label: c.container_number?.trim() || c.id.slice(0, 8).toUpperCase(),
      }));
  }, [viewQuery.data?.containers, containers]);
  const hasContainers = containerOptions.length > 0;
  const containerRequired = hasContainers;
  const containerReady = !containerRequired || isUuid(containerId);

  const ack: DeliveryAcknowledgement | undefined = useMemo(() => {
    if (!viewQuery.data) return undefined;
    if (hasContainers && !isUuid(containerId)) return undefined;
    return pickAcknowledgementFromView(
      viewQuery.data,
      hasContainers ? containerId : null,
    );
  }, [viewQuery.data, hasContainers, containerId]);

  const status = (ack?.status || 'DRAFT').toUpperCase();
  const customerMarked =
    ack?.customer_marked_received === true ||
    status === 'ACKNOWLEDGED_BY_CUSTOMER' ||
    status === 'RECEIVED_BY_ADMIN';
  const fieldsLocked =
    ack?.fields_locked === true ||
    (ack?.fields_locked !== false &&
      Boolean(ack?.id) &&
      status !== 'DRAFT' &&
      status !== '');
  const canAttachProof =
    ack?.can_attach_proof === true ||
    (ack?.can_attach_proof !== false && fieldsLocked && status !== 'RECEIVED_BY_ADMIN');
  const canResendWithProof =
    ack?.can_resend_with_proof === true ||
    (ack?.can_resend_with_proof !== false && fieldsLocked && status === 'SENT_TO_CUSTOMER');
  const hasProof =
    ack?.has_proof === true ||
    (ack?.attachments?.length ?? 0) > 0;
  const canFirstSend = !fieldsLocked && (status === 'DRAFT' || !ack?.id);
  const waitingOnCustomer = status === 'SENT_TO_CUSTOMER';
  const canReceive =
    status === 'ACKNOWLEDGED_BY_CUSTOMER' ||
    status === 'SUBMITTED' ||
    (customerMarked && status !== 'RECEIVED_BY_ADMIN');
  const closed = status === 'RECEIVED_BY_ADMIN';
  const adminText = ack?.admin_message || ack?.template_message || ack?.remarks;

  const attachmentsQuery = useQuery({
    queryKey: [
      ...jobKeys.all,
      'acknowledgement',
      jobId,
      containerId || 'none',
      'attachments',
    ] as const,
    queryFn: () =>
      jobService.listAcknowledgementAttachments(jobId, {
        ...(isUuid(containerId) ? { container_id: containerId } : {}),
      }),
    enabled:
      Boolean(accessToken) &&
      isUuid(jobId) &&
      containerReady &&
      (canAttachProof || hasProof || fieldsLocked),
  });
  const query = viewQuery;
  const send = useMutation({
    mutationFn: (opts?: { proofOnly?: boolean; proof?: File[] }) => {
      if (containerRequired && !isUuid(containerId)) {
        throw new Error(`Select a ${unitLabelLower} before sending acknowledgement.`);
      }
      return jobService.sendAcknowledgement(jobId, {
        ...(opts?.proofOnly
          ? {
              proof_only: true,
              files: opts.proof?.length ? opts.proof : undefined,
              ...(isUuid(containerId) ? { container_id: containerId } : {}),
            }
          : {
              message: message.trim(),
              ...(isUuid(containerId) ? { container_id: containerId } : {}),
              ...(files.length ? { files } : {}),
            }),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...jobKeys.all, 'acknowledgement', jobId],
      });
      setFiles([]);
      setProofFiles([]);
      if (fileRef.current) fileRef.current.value = '';
      if (proofRef.current) proofRef.current.value = '';
    },
  });

  const uploadProof = useMutation({
    mutationFn: (picked: File[]) =>
      jobService.uploadAcknowledgementAttachments(jobId, picked, {
        ...(isUuid(containerId) ? { container_id: containerId } : {}),
      }),
    onSuccess: () => {
      void attachmentsQuery.refetch();
      void qc.invalidateQueries({ queryKey: [...jobKeys.all, 'acknowledgement', jobId] });
    },
  });

  const downloadProof = useMutation({
    mutationFn: async ({
      attachment,
      open,
      previewWindow,
    }: {
      attachment: {
        id?: string;
        file_name?: string;
        file_url?: string;
        s3_key?: string;
        download_url?: string;
        download_path?: string;
        url?: string;
      };
      /** Open in a new tab (PDF/image) instead of forcing a download. */
      open?: boolean;
      /** Sync-opened tab from click — required on live so Open is not left on about:blank. */
      previewWindow?: Window | null;
    }) => {
      const name = attachment.file_name || 'acknowledgement-proof';
      try {
        const blob = await jobService.fetchAcknowledgementProofBlob(
          jobId,
          attachment,
          tenantId,
        );
        if (open) {
          if (blob.size < 64) {
            throw new Error('Downloaded file is empty or not a viewable document.');
          }
          // Proof files: open as-is (no invoice PDF branding stamp).
          if (await blobLooksLikePdf(blob)) {
            openPdfBlobInNewTab(blob, previewWindow ?? undefined, name);
            return;
          }
          await openBlobInNewTab(blob, previewWindow ?? null, { filename: name });
          return;
        }
        triggerBlobDownload(blob, name);
      } catch (err) {
        if (previewWindow && !previewWindow.closed) {
          try {
            previewWindow.close();
          } catch {
            /* ignore */
          }
        }
        throw err;
      }
    },
  });

  const receive = useMutation({
    mutationFn: () =>
      jobService.receiveAcknowledgement(jobId, {
        ...(receiveNotes.trim() ? { notes: receiveNotes.trim() } : {}),
        ...(isUuid(containerId) ? { container_id: containerId } : {}),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: [...jobKeys.all, 'acknowledgement', jobId],
      });
    },
  });

  const generatePdf = useMutation({
    mutationFn: () =>
      jobService.generateAcknowledgementPdf(jobId, {
        ...(isUuid(containerId) ? { container_id: containerId } : {}),
      }),
  });

  // Auto-select single container; keep multi selection valid.
  useEffect(() => {
    if (!hasContainers) {
      if (containerId) setContainerId('');
      return;
    }
    if (containerOptions.length === 1) {
      const only = containerOptions[0].value;
      if (containerId !== only) setContainerId(only);
      return;
    }
    if (containerId && !containerOptions.some((o) => o.value === containerId)) {
      setContainerId('');
    }
  }, [hasContainers, containerOptions, containerId]);

  useEffect(() => {
    if (!canFirstSend || message.trim()) return;
    const seed = (ack?.template_message || ack?.admin_message || '').trim();
    if (seed) setMessage(seed);
  }, [canFirstSend, ack?.template_message, ack?.admin_message, message]);

  const firstSendDisabled =
    send.isPending ||
    !message.trim() ||
    (containerRequired && !isUuid(containerId));

  const proofRows = useMemo(() => {
    const fromApi = attachmentsQuery.data ?? [];
    if (fromApi.length) return fromApi;
    return ack?.attachments ?? [];
  }, [attachmentsQuery.data, ack?.attachments]);

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
          {fieldsLocked ? <Badge variant="neutral">Message locked</Badge> : null}
          {hasProof ? <Badge variant="info">Has proof</Badge> : null}
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

        {hasContainers && !isUuid(containerId) && containerOptions.length > 1 ? (
          <p className="text-[13px] text-[var(--color-neutral-500)]">
            Select a {unitLabelLower} to load or send its acknowledgement.
          </p>
        ) : null}

        {waitingOnCustomer ? (
          <p className="rounded-sm border border-[var(--color-warning-200,#FDE68A)] bg-[var(--color-warning-50,#FFFBEB)] px-3 py-2 text-[13px] text-[var(--color-neutral-700)]">
            Sent to customer — waiting for them to mark received in the portal.
            {ack?.sent_at ? ` Sent at ${ack.sent_at}.` : ''}
            {fieldsLocked
              ? ` Message and ${unitLabelLower} are locked; you can still attach proof or resend with a file.`
              : ''}
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
              Message to customer{fieldsLocked ? ' (locked)' : ''}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-[13px] text-[#0f172a]">{adminText}</p>
            {ack?.container_id ? (
              <p className="mt-1 text-[12px] text-[#64748b]">
                {unitLabel}:{' '}
                {containerOptions.find((o) => o.value === ack.container_id)?.label ||
                  ack.container_id.slice(0, 8)}
              </p>
            ) : null}
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
            ].map((row) => (
              <li
                key={row.label}
                className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
              >
                <span className="text-[12px] font-medium text-[#64748b]">{row.label}</span>
                <span className="break-words text-[13px] font-medium text-[#0f172a]">
                  {row.value?.trim() || '—'}
                </span>
              </li>
            ))}
          </ul>
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

        {hasContainers ? (
          <label className="block text-sm">
            <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
              {unitLabel}
              {containerRequired ? ' *' : ''}
            </span>
            <select
              className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
              value={containerId}
              onChange={(e) => {
                setContainerId(e.target.value);
                setMessage('');
                setError(null);
                setMsg(null);
              }}
              disabled={containersLoading}
            >
              {containerOptions.length > 1 ? (
                <option value="">Select {unitLabelLower}…</option>
              ) : null}
              {containerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[var(--color-neutral-400)]">
              Acknowledgement is sent per {unitLabelLower}. Switch {unitLabelLower} to view or send
              another.
            </p>
          </label>
        ) : null}

        {canFirstSend ? (
          <div className="grid gap-3 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] p-3 sm:grid-cols-2">
            <p className="sm:col-span-2 text-[12px] text-[#64748b]">
              Compose a written acknowledgement for the customer
              {hasContainers ? ` for the selected ${unitLabelLower}` : ''}. After the first send,
              message and {unitLabelLower} lock; proof can still be attached later.
            </p>
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
            <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  handleValidatedMultiFileInput(
                    e.target.files,
                    setFiles,
                    (msg) => setError(msg),
                    ACKNOWLEDGEMENT_UPLOAD_OPTIONS,
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
                {files.length
                  ? `${files.length} file${files.length === 1 ? '' : 's'} selected`
                  : 'Optional attachments with send'}
              </Button>
              <Button
                type="button"
                size="sm"
                leftIcon={<Send className="h-3.5 w-3.5" />}
                disabled={firstSendDisabled}
                onClick={() =>
                  void run(() => send.mutateAsync({}), 'Acknowledgement sent to customer.')
                }
              >
                {send.isPending ? 'Sending…' : 'Send to customer'}
              </Button>
            </div>
          </div>
        ) : null}

        {(canAttachProof || canResendWithProof || proofRows.length > 0) && (
          <div className="space-y-2 rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[#F8FAFC] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
                <Paperclip className="h-3.5 w-3.5" aria-hidden />
                Acknowledgement attachments
              </p>
              <span className="text-[11px] text-[var(--color-neutral-500)]">
                {proofRows.length} file{proofRows.length === 1 ? '' : 's'}
              </span>
            </div>

            {attachmentsQuery.isLoading ? (
              <p className="text-[12px] text-[var(--color-neutral-400)]">Loading files…</p>
            ) : proofRows.length === 0 ? (
              <p className="text-[12px] text-[var(--color-neutral-400)]">No proof files yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {proofRows.map((row) => {
                  const rec = row as Record<string, unknown>;
                  const id = String(rec.id ?? rec.attachment_id ?? '');
                  const name = String(
                    (rec.file_name ??
                      rec.fileName ??
                      rec.filename ??
                      rec.name ??
                      id.slice(0, 8)) ||
                      'proof',
                  );
                  const attachment = {
                    id: id || undefined,
                    file_name: name,
                    file_url:
                      (typeof rec.file_url === 'string' && rec.file_url) ||
                      (typeof rec.fileUrl === 'string' && rec.fileUrl) ||
                      undefined,
                    url: typeof rec.url === 'string' ? rec.url : undefined,
                    s3_key:
                      (typeof rec.s3_key === 'string' && rec.s3_key) ||
                      (typeof rec.s3Key === 'string' && rec.s3Key) ||
                      undefined,
                    download_url:
                      typeof rec.download_url === 'string'
                        ? rec.download_url
                        : typeof rec.downloadUrl === 'string'
                          ? rec.downloadUrl
                          : undefined,
                    download_path:
                      typeof rec.download_path === 'string'
                        ? rec.download_path
                        : typeof rec.downloadPath === 'string'
                          ? rec.downloadPath
                          : undefined,
                  };
                  const canFetch = Boolean(
                    attachment.id ||
                      attachment.file_url ||
                      attachment.url ||
                      attachment.s3_key ||
                      attachment.download_url ||
                      attachment.download_path,
                  );
                  const busy = downloadProof.isPending;
                  // Never use raw file_url as <a href> — /files/… paths hit SPA 404.
                  return (
                    <li
                      key={id || name}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-white px-2 py-1.5 text-[12px]"
                    >
                      <span className="truncate font-medium text-[#0f172a]">{name}</span>
                      <div className="flex gap-1">
                        {canFetch ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => {
                              setError(null);
                              let preview: Window | null = null;
                              try {
                                // Must open synchronously on click — after await, live browsers
                                // leave about:blank / block the popup.
                                preview = openBlankPreviewTab({ filename: name });
                              } catch (err) {
                                setError(getErrorMessage(err));
                                return;
                              }
                              void downloadProof
                                .mutateAsync({
                                  attachment,
                                  open: true,
                                  previewWindow: preview,
                                })
                                .catch((err) => setError(getErrorMessage(err)));
                            }}
                          >
                            Open
                          </Button>
                        ) : null}
                        {canFetch ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => {
                              setError(null);
                              void downloadProof
                                .mutateAsync({ attachment, open: false })
                                .catch((err) => setError(getErrorMessage(err)));
                            }}
                          >
                            Download
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {canAttachProof ? (
              <div className="flex flex-wrap items-center gap-2 border-t border-[var(--fresa-border,#C9D3DF)] pt-2">
                <input
                  ref={proofRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    handleValidatedMultiFileInput(
                      e.target.files,
                      setProofFiles,
                      (msg) => setError(msg),
                      ACKNOWLEDGEMENT_UPLOAD_OPTIONS,
                    )
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                  disabled={uploadProof.isPending}
                  onClick={() => proofRef.current?.click()}
                >
                  {proofFiles.length
                    ? `${proofFiles.length} file${proofFiles.length === 1 ? '' : 's'} selected`
                    : 'Choose proof files'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="create"
                  disabled={!proofFiles.length || uploadProof.isPending}
                  onClick={() =>
                    void run(async () => {
                      if (!proofFiles.length) return;
                      await uploadProof.mutateAsync(proofFiles);
                      setProofFiles([]);
                      if (proofRef.current) proofRef.current.value = '';
                    }, 'Proof attached.')
                  }
                >
                  {uploadProof.isPending ? 'Uploading…' : 'Attach proof'}
                </Button>
                {canResendWithProof ? (
                  <Button
                    type="button"
                    size="sm"
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                    disabled={!proofFiles.length || send.isPending}
                    onClick={() =>
                      void run(
                        () =>
                          send.mutateAsync({
                            proofOnly: true,
                            proof: proofFiles,
                          }),
                        'Proof resent to customer.',
                      )
                    }
                  >
                    {send.isPending ? 'Sending…' : 'Resend with proof'}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        {canReceive ? (
          <Input
            label="Admin notes (optional)"
            value={receiveNotes}
            onChange={(e) => setReceiveNotes(e.target.value)}
            placeholder="Verified against POD"
          />
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
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
