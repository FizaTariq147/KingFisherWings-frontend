import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPanel } from '@/features/portal-auth/components/portal-ui';
import {
  usePortalShipmentAcknowledgement,
  useSubmitPortalShipmentAcknowledgement,
  useUploadPortalAcknowledgementSignature,
} from '../hooks/usePortalShipments';

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

  const [receiverName, setReceiverName] = useState('');
  const [receiverTitle, setReceiverTitle] = useState('');
  const [goodsCondition, setGoodsCondition] = useState('GOOD');
  const [remarks, setRemarks] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const ack = query.data;
  const status = (ack?.status || statusHint || 'DRAFT').toUpperCase();
  const readOnly = status === 'SUBMITTED' || status === 'RECEIVED_BY_ADMIN';

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
