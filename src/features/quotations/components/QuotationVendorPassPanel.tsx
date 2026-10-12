import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { axiosInstance } from '@/lib/axios';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { QUOTATION_API } from '../api/quotation.api';

/** Pass an approved quotation to a vendor without sharing customer sell prices. */
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
  const [vendorPartyId, setVendorPartyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) return null;

  const send = async () => {
    setPending(true);
    setError(null);
    try {
      await axiosInstance.post(QUOTATION_API.sendToVendor(quotationId), {
        vendor_party_id: vendorPartyId.trim(),
      });
      setVendorPartyId('');
      onSuccess?.('Sent to vendor.');
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
            disabled={!vendorPartyId.trim() || pending}
            onClick={() => void send()}
          >
            {pending ? 'Sending…' : 'Send approved quote to vendor'}
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-[13px] text-[#475569]">
        Pass this approved quotation to a vendor without sharing customer sell prices.
      </p>
      <Input
        label="Vendor party id"
        value={vendorPartyId}
        onChange={(e) => setVendorPartyId(e.target.value)}
      />
      {error ? <p className="mt-2 text-sm text-[var(--color-danger-600)]">{error}</p> : null}
    </Modal>
  );
}
