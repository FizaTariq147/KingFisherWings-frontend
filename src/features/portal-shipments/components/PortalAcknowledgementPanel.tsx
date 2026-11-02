import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Paperclip, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import {
  usePortalAcknowledgementAttachmentMutations,
  usePortalAcknowledgementAttachments,
  usePortalShipmentAcknowledgement,
  useSubmitPortalShipmentAcknowledgement,
  useUploadPortalAcknowledgementSignature,
} from '../hooks/usePortalShipments';
import {
  portalAckToListRows,
  type PortalAckListRow,
} from '../utils/portalAckDisplay';

function AckList({ rows, title }: { rows: PortalAckListRow[]; title?: string }) {
  if (!rows.length) return null;
  return (
    <div className="space-y-1">
      {title ? (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
          {title}
        </p>
      ) : null}
      <ul className="divide-y divide-[#e8edf2] rounded-sm border border-[var(--color-neutral-200)] bg-white">
        {rows.map((row, index) => (
          <li
            key={`${row.label}-${index}`}
            className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
          >
            <span className="text-[12px] font-medium text-[var(--color-neutral-500)]">
              {row.label}
            </span>
            <span className="break-words text-[13px] font-medium text-[var(--color-neutral-900)]">
              {row.value || '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Extra list/template blocks from acknowledgement payload (names only — no UUIDs). */
function acknowledgementTemplateBlocks(ack: {
  template_snapshot?: string | Record<string, unknown>;
  raw?: Record<string, unknown>;
}): Array<{ key: string; title: string; rows: PortalAckListRow[] }> {
  const blocks: Array<{ key: string; title: string; rows: PortalAckListRow[] }> = [];
  if (ack.template_snapshot != null && ack.template_snapshot !== '') {
    const rows = portalAckToListRows(ack.template_snapshot);
    if (rows.length) blocks.push({ key: 'template', title: 'Template', rows });
  }
  const raw = ack.raw;
  if (!raw) return blocks;
  const skip = new Set([
    'id',
    'job_id',
    'jobId',
    'status',
    'receiver_name',
    'receiverName',
    'receiver_title',
    'receiverTitle',
    'goods_condition',
    'goodsCondition',
    'remarks',
    'notes',
    'acknowledged_at',
    'acknowledgedAt',
    'signature_url',
    'signatureUrl',
    'signature_s3_key',
    'signatureS3Key',
    'template_snapshot',
    'templateSnapshot',
    'received_at',
    'receivedAt',
    'actual_delivery_date',
    'actualDeliveryDate',
    'path_hints',
    'pathHints',
    'submitted_by_party_id',
    'submittedByPartyId',
    'received_by_user_id',
    'receivedByUserId',
  ]);
  for (const [key, value] of Object.entries(raw)) {
    if (skip.has(key)) continue;
    if (value == null) continue;
    const rows = portalAckToListRows(value);
    if (!rows.length) continue;
    const title = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    blocks.push({ key, title, rows });
  }
  return blocks;
}

interface PortalAcknowledgementPanelProps {
  shipmentId: string;
  /** Status from shipment detail when acknowledgement not yet loaded. */
  statusHint?: string;
  /** Containers on the shipment/job — required when more than one. */
  containers?: Array<{ id: string; label: string }>;
}

/** Customer delivery acknowledgement — load template fields, signature, submit. */
export function PortalAcknowledgementPanel({
  shipmentId,
  statusHint,
  containers = [],
}: PortalAcknowledgementPanelProps) {
  const query = usePortalShipmentAcknowledgement(shipmentId);
  const submit = useSubmitPortalShipmentAcknowledgement(shipmentId);
  const uploadSig = useUploadPortalAcknowledgementSignature(shipmentId);
  const attachmentsQuery = usePortalAcknowledgementAttachments(shipmentId);
  const attachmentMutations = usePortalAcknowledgementAttachmentMutations(shipmentId);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [receiverName, setReceiverName] = useState('');
  const [receiverTitle, setReceiverTitle] = useState('');
  const [goodsCondition, setGoodsCondition] = useState('GOOD');
  const [remarks, setRemarks] = useState('');
  const [containerId, setContainerId] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const ack = query.data;
  const status = (ack?.status || statusHint || 'DRAFT').toUpperCase();
  const canMarkReceived = status === 'SENT_TO_CUSTOMER';
  const readOnly =
    status === 'SUBMITTED' ||
    status === 'ACKNOWLEDGED_BY_CUSTOMER' ||
    status === 'RECEIVED_BY_ADMIN' ||
    !canMarkReceived;
  const waitingForForwarder = status === 'DRAFT' || (!ack?.id && status !== 'SENT_TO_CUSTOMER');
  const adminMessage =
    ack?.admin_message || ack?.template_message || undefined;
  const ackAttachments = ack?.attachments ?? [];
  const containerOptions = useMemo(() => {
    if (containers.length) {
      return containers
        .filter((c) => c.id.trim())
        .map((c) => ({ value: c.id, label: c.label || c.id.slice(0, 8).toUpperCase() }));
    }
    const raw = ack?.raw;
    const list =
      (Array.isArray(raw?.containers) ? raw!.containers : null) ??
      (Array.isArray(raw?.job_containers) ? raw!.job_containers : null) ??
      [];
    return list
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const r = row as Record<string, unknown>;
        const id = typeof r.id === 'string' ? r.id.trim() : '';
        if (!id) return null;
        const number =
          (typeof r.container_number === 'string' && r.container_number.trim()) ||
          (typeof r.containerNumber === 'string' && r.containerNumber.trim()) ||
          id.slice(0, 8).toUpperCase();
        return { value: id, label: number };
      })
      .filter((r): r is { value: string; label: string } => Boolean(r));
  }, [ack?.raw, containers]);
  const templateBlocks = useMemo(
    () => (ack ? acknowledgementTemplateBlocks(ack) : []),
    [ack],
  );

  useEffect(() => {
    if (!ack || hydrated) return;
    if (ack.receiver_name) setReceiverName(ack.receiver_name);
    if (ack.receiver_title) setReceiverTitle(ack.receiver_title);
    if (ack.goods_condition) setGoodsCondition(ack.goods_condition);
    if (ack.remarks) setRemarks(ack.remarks);
    if (ack.container_id) setContainerId(ack.container_id);
    setHydrated(true);
  }, [ack, hydrated]);

  const onSubmit = async () => {
    setError(null);
    setMsg(null);
    if (!receiverName.trim()) {
      setError('Receiver name is required.');
      return;
    }
    if (containerOptions.length > 1 && !containerId.trim()) {
      setError('Select the container you are acknowledging.');
      return;
    }
    try {
      await submit.mutateAsync({
        receiver_name: receiverName.trim(),
        ...(containerId.trim() ? { container_id: containerId.trim() } : {}),
        receiver_title: receiverTitle.trim() || undefined,
        goods_condition: goodsCondition.trim() || undefined,
        remarks: remarks.trim() || undefined,
        acknowledged_at: new Date().toISOString(),
      });
      setMsg('Acknowledgement submitted. Your forwarder has been notified.');
      await query.refetch();
    } catch (err) {
      setError(
        err instanceof PortalApiError || err instanceof Error
          ? err.message
          : 'Could not submit acknowledgement.',
      );
    }
  };

  return (
    <PortalPanel padded>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
          Delivery acknowledgement
        </h2>
        <Badge
          variant={
            status === 'RECEIVED_BY_ADMIN'
              ? 'success'
              : status === 'ACKNOWLEDGED_BY_CUSTOMER' || status === 'SUBMITTED'
                ? 'info'
                : 'neutral'
          }
        >
          {status.replaceAll('_', ' ')}
        </Badge>
      </div>
      <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
        Your forwarder sends a written acknowledgement first. When status is Sent to customer, mark
        it received below. Staff will then close it on their side.
      </p>
      {error ? <p className="mb-2 text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="mb-2 text-sm text-[var(--color-success-700)]">{msg}</p> : null}
      {waitingForForwarder && !canMarkReceived ? (
        <p className="mb-3 rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-sm text-[var(--color-neutral-600)]">
          Waiting for forwarder — acknowledgement has not been sent yet.
        </p>
      ) : null}
      {status === 'ACKNOWLEDGED_BY_CUSTOMER' || status === 'SUBMITTED' ? (
        <p className="mb-3 rounded-md border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] px-3 py-2 text-sm text-[var(--color-neutral-700)]">
          You marked this received
          {ack?.customer_acknowledged_at || ack?.acknowledged_at
            ? ` at ${ack.customer_acknowledged_at || ack.acknowledged_at}`
            : ''}
          . Waiting for the forwarder to close it.
        </p>
      ) : null}
      {status === 'RECEIVED_BY_ADMIN' ? (
        <p className="mb-3 rounded-md border border-[var(--color-success-200,#BBF7D0)] bg-[var(--color-success-50,#F0FDF4)] px-3 py-2 text-sm text-[var(--color-neutral-700)]">
          Already completed — forwarder marked this acknowledgement received.
        </p>
      ) : null}
      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {adminMessage ? (
            <div className="sm:col-span-2 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                Message from forwarder
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-neutral-900)]">
                {adminMessage}
              </p>
            </div>
          ) : null}
          {ackAttachments.length > 0 ? (
            <div className="sm:col-span-2 space-y-1">
              <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-neutral-800)]">
                <Paperclip className="h-3.5 w-3.5" aria-hidden />
                Forwarder attachments
              </p>
              <ul className="space-y-1 text-[13px]">
                {ackAttachments.map((a) => (
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
                      a.file_name || 'Attachment'
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {templateBlocks.length ? (
            <div className="sm:col-span-2 space-y-3">
              {templateBlocks.map((block) => (
                <AckList key={block.key} title={block.title} rows={block.rows} />
              ))}
            </div>
          ) : null}
          {readOnly && !canMarkReceived ? (
            <ul className="sm:col-span-2 divide-y divide-[#e8edf2] rounded-sm border border-[var(--color-neutral-200)] bg-white">
              {[
                { label: 'Receiver name', value: receiverName },
                { label: 'Title', value: receiverTitle },
                { label: 'Goods condition', value: goodsCondition },
                { label: 'Remarks', value: remarks },
                ...(ack?.acknowledged_at
                  ? [{ label: 'Acknowledged at', value: ack.acknowledged_at }]
                  : []),
              ].map((row) => (
                <li
                  key={row.label}
                  className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4"
                >
                  <span className="text-[12px] font-medium text-[var(--color-neutral-500)]">
                    {row.label}
                  </span>
                  <span className="break-words text-[13px] font-medium text-[var(--color-neutral-900)]">
                    {row.value?.trim() || '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              {containerOptions.length > 1 ? (
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                    Container *
                  </span>
                  <select
                    className="h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm"
                    disabled={submit.isPending}
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
              <label className="block text-sm sm:col-span-1">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Receiver name *
                </span>
                <Input
                  disabled={submit.isPending}
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Title
                </span>
                <Input
                  disabled={submit.isPending}
                  value={receiverTitle}
                  onChange={(e) => setReceiverTitle(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Goods condition
                </span>
                <Input
                  disabled={submit.isPending}
                  value={goodsCondition}
                  onChange={(e) => setGoodsCondition(e.target.value)}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Remarks
                </span>
                <Input
                  disabled={submit.isPending}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
                  Signature image
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  disabled={uploadSig.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setError(null);
                    void uploadSig
                      .mutateAsync(file)
                      .then(() => setMsg('Signature uploaded.'))
                      .catch((err) =>
                        setError(
                          err instanceof Error ? err.message : 'Signature upload failed.',
                        ),
                      );
                  }}
                />
              </label>
            </>
          )}
          <div className="sm:col-span-2 space-y-2 rounded-sm border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-neutral-800)]">
              <Paperclip className="h-3.5 w-3.5" aria-hidden />
              Attachments
            </p>
            {attachmentsQuery.isLoading ? (
              <p className="text-[12px] text-[var(--color-neutral-400)]">Loading files…</p>
            ) : (attachmentsQuery.data?.length ?? 0) === 0 && pendingFiles.length === 0 ? (
              <p className="text-[12px] text-[var(--color-neutral-400)]">No attachments yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {(attachmentsQuery.data ?? []).map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-[13px]"
                  >
                    <span className="truncate">{row.file_name || 'Attachment'}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      leftIcon={<Download className="h-3.5 w-3.5" />}
                      disabled={attachmentMutations.download.isPending}
                      onClick={() =>
                        void attachmentMutations.download.mutateAsync({
                          attachmentId: row.id,
                          fileName: row.file_name,
                        })
                      }
                    >
                      Download
                    </Button>
                  </li>
                ))}
                {pendingFiles.map((file, i) => (
                  <li key={`pending-${file.name}-${i}`} className="text-[13px] text-[var(--color-neutral-600)]">
                    Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            )}
            {!readOnly ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (!files.length) return;
                    setPendingFiles((prev) => [...prev, ...files]);
                    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                  disabled={attachmentMutations.upload.isPending}
                  onClick={() => attachmentInputRef.current?.click()}
                >
                  Choose files
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  disabled={
                    attachmentMutations.upload.isPending || pendingFiles.length === 0
                  }
                  onClick={() => {
                    setError(null);
                    void (async () => {
                      try {
                        for (const file of pendingFiles) {
                          await attachmentMutations.upload.mutateAsync(file);
                        }
                        setPendingFiles([]);
                        setMsg('Attachments uploaded.');
                        await attachmentsQuery.refetch();
                      } catch (err) {
                        setError(
                          err instanceof Error ? err.message : 'Attachment upload failed.',
                        );
                      }
                    })();
                  }}
                >
                  {attachmentMutations.upload.isPending ? 'Uploading…' : 'Upload selected'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {canMarkReceived ? (
        <div className="mt-4">
          <Button
            type="button"
            size="sm"
            disabled={submit.isPending || !receiverName.trim()}
            onClick={() => void onSubmit()}
          >
            {submit.isPending ? 'Submitting…' : 'Mark received'}
          </Button>
        </div>
      ) : null}
    </PortalPanel>
  );
}
