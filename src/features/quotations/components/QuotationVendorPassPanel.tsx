import { useMemo, useState } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useParties } from '@/features/parties/hooks/useParties';
import { PartySearchSelect } from '@/features/shared/entity-search';
import { axiosInstance } from '@/lib/axios';
import { isUuid } from '@/lib/isUuid';
import { getErrorMessage } from '@/features/jobs/utils/getErrorMessage';
import { QUOTATION_API } from '../api/quotation.api';

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
  const [vendorIds, setVendorIds] = useState<string[]>([]);
  const [pendingPick, setPendingPick] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { data: partiesData } = useParties({
    page: 1,
    limit: 100,
    party_type: 'VENDOR',
    order: 'asc',
  });
  const vendorLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of partiesData?.parties ?? []) {
      if (!isUuid(p.id)) continue;
      const name = String(p.name ?? '').trim();
      const code = String(p.code ?? '').trim();
      map.set(p.id, name && code ? `${name} (${code})` : name || code || 'Vendor');
    }
    return map;
  }, [partiesData?.parties]);

  if (!open) return null;

  const addVendor = (id: string) => {
    if (!isUuid(id)) return;
    setVendorIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPendingPick('');
  };

  const send = async () => {
    if (!vendorIds.length) {
      setError('Select at least one vendor.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await axiosInstance.post(QUOTATION_API.sendToVendor(quotationId), {
        vendor_party_id: vendorIds[0],
        ...(vendorIds.length > 1 ? { vendor_party_ids: vendorIds } : {}),
      });
      setVendorIds([]);
      setPendingPick('');
      onSuccess?.(
        vendorIds.length > 1
          ? `Sent to ${vendorIds.length} vendors.`
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
            disabled={vendorIds.length === 0 || pending}
            onClick={() => void send()}
          >
            {pending
              ? 'Sending…'
              : vendorIds.length > 1
                ? `Send to ${vendorIds.length} vendors`
                : 'Send approved quote to vendor'}
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-[13px] text-[#475569]">
        Pass this approved quotation to one or more vendors without sharing customer sell prices.
        Search vendors by name.
      </p>
      <PartySearchSelect
        name="vendor_party_pick"
        label="Add vendor"
        value={pendingPick}
        onChange={addVendor}
        partyType="VENDOR"
        placeholder="Search vendor by name…"
      />
      {vendorIds.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {vendorIds.map((id) => (
            <li
              key={id}
              className="flex items-center justify-between rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-sm"
            >
              <span className="truncate text-[var(--color-neutral-700)]">
                {vendorLabelById.get(id) ?? 'Vendor'}
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => setVendorIds((prev) => prev.filter((x) => x !== id))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="mt-2 text-sm text-[var(--color-danger-600)]">{error}</p> : null}
    </Modal>
  );
}
