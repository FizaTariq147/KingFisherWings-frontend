import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { axiosInstance } from '@/lib/axios';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { QUOTATION_API } from '../api/quotation.api';

/** Pass an approved quotation to a vendor without sharing customer sell prices. */
export function QuotationVendorPassPanel({ quotationId }: { quotationId: string }) {
  const [vendorPartyId, setVendorPartyId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const send = async () => {
    setPending(true);
    setError(null);
    try {
      await axiosInstance.post(QUOTATION_API.sendToVendor(quotationId), {
        vendor_party_id: vendorPartyId.trim(),
      });
      setMessage('Sent to vendor.');
    } catch (err) {
      setMessage(null);
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="mb-3">
      <CardHeader>
        <CardTitle>Send to vendor</CardTitle>
      </CardHeader>
      <div className="space-y-2 px-4 pb-4">
        <Input
          label="Vendor party id"
          value={vendorPartyId}
          onChange={(e) => setVendorPartyId(e.target.value)}
        />
        <Button type="button" disabled={!vendorPartyId.trim() || pending} onClick={() => void send()}>
          Send approved quote to vendor
        </Button>
        {message ? <p className="text-sm text-[var(--color-success-700)]">{message}</p> : null}
        {error ? <p className="text-sm text-[var(--color-danger-600)]">{error}</p> : null}
      </div>
    </Card>
  );
}
