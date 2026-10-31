import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { PortalConfirmPortTokenDto } from '../types/portalShipments.types';

function todayIsoDate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function PortalPortTokenModal({
  open,
  pending,
  defaults,
  onClose,
  onSubmit,
}: {
  open: boolean;
  pending?: boolean;
  defaults?: Partial<PortalConfirmPortTokenDto>;
  onClose: () => void;
  onSubmit: (dto: PortalConfirmPortTokenDto) => Promise<void>;
}) {
  const [blNumber, setBlNumber] = useState(defaults?.bl_number ?? '');
  const [containerNumber, setContainerNumber] = useState(defaults?.container_number ?? '');
  const [date, setDate] = useState(defaults?.date ?? todayIsoDate());
  const [deliveryLocation, setDeliveryLocation] = useState(defaults?.delivery_location ?? '');
  const [receiverName, setReceiverName] = useState(defaults?.receiver_name ?? '');
  const [receiverContact, setReceiverContact] = useState(defaults?.receiver_contact ?? '');
  const [portGateToken, setPortGateToken] = useState(defaults?.port_gate_token ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBlNumber(defaults?.bl_number ?? '');
    setContainerNumber(defaults?.container_number ?? '');
    setDate(defaults?.date ?? todayIsoDate());
    setDeliveryLocation(defaults?.delivery_location ?? '');
    setReceiverName(defaults?.receiver_name ?? '');
    setReceiverContact(defaults?.receiver_contact ?? '');
    setPortGateToken(defaults?.port_gate_token ?? '');
    setError(null);
    // Intentionally hydrate once per open from defaults snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open gate only
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    const dto: PortalConfirmPortTokenDto = {
      bl_number: blNumber.trim(),
      container_number: containerNumber.trim(),
      date: date.trim(),
      delivery_location: deliveryLocation.trim(),
      receiver_name: receiverName.trim(),
      receiver_contact: receiverContact.trim(),
      ...(portGateToken.trim() ? { port_gate_token: portGateToken.trim() } : {}),
    };
    if (
      !dto.bl_number ||
      !dto.container_number ||
      !dto.date ||
      !dto.delivery_location ||
      !dto.receiver_name ||
      !dto.receiver_contact
    ) {
      setError('Fill all required port token fields.');
      return;
    }
    setError(null);
    await onSubmit(dto);
  };

  return (
    <Modal
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      title="Confirm port token"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={pending} onClick={() => void submit()}>
            {pending ? 'Submitting…' : 'Confirm port token'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}
        <Input
          label="BL number *"
          value={blNumber}
          onChange={(e) => setBlNumber(e.target.value)}
        />
        <Input
          label="Container number *"
          value={containerNumber}
          onChange={(e) => setContainerNumber(e.target.value)}
        />
        <Input
          label="Date *"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Delivery location *"
          value={deliveryLocation}
          onChange={(e) => setDeliveryLocation(e.target.value)}
        />
        <Input
          label="Receiver name *"
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
        />
        <Input
          label="Receiver contact *"
          value={receiverContact}
          onChange={(e) => setReceiverContact(e.target.value)}
        />
        <Input
          label="Port gate token (optional)"
          value={portGateToken}
          onChange={(e) => setPortGateToken(e.target.value)}
        />
      </div>
    </Modal>
  );
}
