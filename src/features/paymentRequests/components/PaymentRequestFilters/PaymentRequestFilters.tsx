import { Input } from '@/components/ui/Input';
import {
  PAYMENT_REQUEST_STATUSES,
  PAYMENT_REQUEST_STATUS_LABELS,
  type PaymentRequestStatus,
} from '../../constants/paymentRequest.constants';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm';

interface PaymentRequestFiltersProps {
  status: PaymentRequestStatus | 'all';
  onStatusChange: (v: PaymentRequestStatus | 'all') => void;
  partyId: string;
  onPartyIdChange: (v: string) => void;
  jobId: string;
  onJobIdChange: (v: string) => void;
}

export function PaymentRequestFilters({
  status,
  onStatusChange,
  partyId,
  onPartyIdChange,
  jobId,
  onJobIdChange,
}: PaymentRequestFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="space-y-1">
        <label htmlFor="payment-request-filter-status" className="text-xs font-medium text-[var(--color-neutral-500)]">Status</label>
        <select
          id="payment-request-filter-status"
          className={selectClass}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as PaymentRequestStatus | 'all')}
        >
          <option value="all">All</option>
          {PAYMENT_REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_REQUEST_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Party ID"
        placeholder="UUID filter"
        value={partyId}
        onChange={(e) => onPartyIdChange(e.target.value)}
      />
      <Input
        label="Job ID"
        placeholder="UUID filter"
        value={jobId}
        onChange={(e) => onJobIdChange(e.target.value)}
      />
    </div>
  );
}
