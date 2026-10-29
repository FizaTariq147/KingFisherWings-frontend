import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { QUOTATION_API } from '../api/quotation.api';

function parseVendorPartyIds(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter((id) => isUuid(id)),
    ),
  ];
}

/** Pass an approved quotation to vendor(s) without sharing customer sell prices. */
export function QuotationVendorPassModal({
  open,
  quotationId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  quotationId: string;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}) {
  const [vendorPartyIdsRaw, setVendorPartyIdsRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) return null;

  const selected = parseVendorPartyIds(vendorPartyIdsRaw);

  const send = async () => {
    if (!selected.length) {
      setError('Enter at least one valid vendor party UUID.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      // Same SendJobToVendorDto as job pass-to-vendor (vendor_party_id + optional vendor_party_ids).
      await axiosInstance.post(QUOTATION_API.sendToVendor(quotationId), {
        vendor_party_id: selected[0],
        ...(selected.length > 1 ? { vendor_party_ids: selected } : {}),
      });
      setVendorPartyIdsRaw('');
      onSuccess?.(
        selected.length > 1
          ? `Sent to ${selected.length} vendors.`
          : 'Sent to vendor.',
      );
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open
      onClose={() => {
        if (!pending) onClose();
      }}
      title="Send to vendor"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<X />}
            disabled={pending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            variant="success"
            leftIcon={<Send />}
            disabled={selected.length === 0 || pending}
            onClick={() => void send()}
          >
            {pending
              ? 'Sending…'
              : selected.length > 1
                ? `Send to ${selected.length} vendors`
                : 'Send approved quote to vendor'}
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-[13px] text-[#475569]">
        Pass this approved quotation to one or more vendors without sharing customer sell
        prices. Paste UUIDs separated by commas or spaces (
        <code className="text-[11px]">vendor_party_ids</code>).
      </p>
      <Input
        label="Vendor party id(s)"
        value={vendorPartyIdsRaw}
        onChange={(e) => setVendorPartyIdsRaw(e.target.value)}
        placeholder="Search vendors by name…"
      />
      {selected.length > 0 ? (
        <p className="mt-1 text-xs text-[var(--color-neutral-500)]">
          {selected.length} valid UUID{selected.length === 1 ? '' : 's'} ready to send.
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[var(--color-danger-600)]">{error}</p> : null}
    </Modal>
  );
}
