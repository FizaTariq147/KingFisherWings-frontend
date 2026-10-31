import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Paperclip, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiDataView } from '@/features/jobs/components/ApiDataView';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import {
  usePortalAcknowledgementAttachmentMutations,
  usePortalAcknowledgementAttachments,
  usePortalShipmentAcknowledgement,
  useSubmitPortalShipmentAcknowledgement,
  useUploadPortalAcknowledgementSignature,
} from '../hooks/usePortalShipments';

/** Extra list/template blocks from acknowledgement payload (same shape as Show All). */
function acknowledgementTemplateBlocks(ack: {
  template_snapshot?: string | Record<string, unknown>;
  raw?: Record<string, unknown>;
}): Array<{ key: string; title: string; data: unknown }> {
  const blocks: Array<{ key: string; title: string; data: unknown }> = [];
  if (ack.template_snapshot != null && ack.template_snapshot !== '') {
    blocks.push({ key: 'template', title: 'Template', data: ack.template_snapshot });
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
  ]);
  for (const [key, value] of Object.entries(raw)) {
    if (skip.has(key)) continue;
    if (value == null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length) {
      continue;
    }
    if (typeof value === 'string' && !value.trim()) continue;
    const title = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    blocks.push({ key, title, data: value });
  }
  return blocks;
}

interface PortalAcknowledgementPanelProps {
  shipmentId: string;
  /** Status from shipment detail when acknowledgement not yet loaded. */
  statusHint?: string;
}

/** Customer delivery acknowledgement — load template fields, signature, submit. */
export function PortalAcknowledgementPanel({
  shipmentId,
  statusHint,
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const ack = query.data;
  const status = (ack?.status || statusHint || 'DRAFT').toUpperCase();
  const readOnly = status === 'SUBMITTED' || status === 'RECEIVED_BY_ADMIN';
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
    setHydrated(true);
  }, [ack, hydrated]);

  const onSubmit = async () => {
    setError(null);
    setMsg(null);
    if (!receiverName.trim()) {
      setError('Receiver name is required.');
      return;
    }
    try {
      await submit.mutateAsync({
        receiver_name: receiverName.trim(),
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
        <Badge variant={status === 'RECEIVED_BY_ADMIN' ? 'success' : 'info'}>
          {status.replaceAll('_', ' ')}
        </Badge>
      </div>
      <p className="mb-3 text-xs text-[var(--color-neutral-500)]">
        Confirm receipt of goods. Staff will mark the acknowledgement as received.
      </p>
      {error ? <p className="mb-2 text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="mb-2 text-sm text-[var(--color-success-700)]">{msg}</p> : null}
      {query.isLoading ? (
        <p className="text-sm text-[var(--color-neutral-400)]">Loading…</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templateBlocks.length ? (
            <div className="sm:col-span-2 space-y-3">
              {templateBlocks.map((block) => (
                <div
                  key={block.key}
                  className="rounded-sm border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3"
                >
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                    {block.title}
                  </p>
                  <ApiDataView
                    data={block.data}
                    emptyLabel="No fields returned for this block."
                    maxHeightClass="max-h-72"
                  />
                </div>
              ))}
            </div>
          ) : null}
          <label className="block text-sm sm:col-span-1">
            <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
              Receiver name *
            </span>
            <Input
              disabled={readOnly || submit.isPending}
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
              Title
            </span>
            <Input
              disabled={readOnly || submit.isPending}
              value={receiverTitle}
              onChange={(e) => setReceiverTitle(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
              Goods condition
            </span>
            <Input
              disabled={readOnly || submit.isPending}
              value={goodsCondition}
              onChange={(e) => setGoodsCondition(e.target.value)}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-[11px] font-semibold uppercase text-[var(--color-neutral-500)]">
              Remarks
            </span>
            <Input
              disabled={readOnly || submit.isPending}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </label>
          {!readOnly ? (
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
          ) : null}
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
      {!readOnly ? (
        <div className="mt-4">
          <Button
            type="button"
            size="sm"
            disabled={submit.isPending || !receiverName.trim()}
            onClick={() => void onSubmit()}
          >
            {submit.isPending ? 'Submitting…' : 'Submit acknowledgement'}
          </Button>
        </div>
      ) : null}
    </PortalPanel>
  );
}
