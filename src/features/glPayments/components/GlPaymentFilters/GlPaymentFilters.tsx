import { Input } from '@/components/ui/Input';
import {
  GL_PAYMENT_STATUSES,
  GL_PAYMENT_STATUS_LABELS,
  PAYMENT_DIRECTIONS,
  PAYMENT_DIRECTION_LABELS,
  type GlPaymentStatus,
  type PaymentDirection,
} from '../../constants/glPayment.constants';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface GlPaymentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  direction: PaymentDirection | 'all';
  onDirectionChange: (v: PaymentDirection | 'all') => void;
  status: GlPaymentStatus | 'all';
  onStatusChange: (v: GlPaymentStatus | 'all') => void;
  fromDate: string;
  onFromDateChange: (v: string) => void;
  toDate: string;
  onToDateChange: (v: string) => void;
}

export function GlPaymentFilters({
  search,
  onSearchChange,
  direction,
  onDirectionChange,
  status,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: GlPaymentFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <Input
        label="Search"
        placeholder="Number or narration…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Direction</label>
        <select
          className={selectClass}
          value={direction}
          onChange={(e) => onDirectionChange(e.target.value as PaymentDirection | 'all')}
        >
          <option value="all">All</option>
          {PAYMENT_DIRECTIONS.map((d) => (
            <option key={d} value={d}>
              {PAYMENT_DIRECTION_LABELS[d]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-[var(--color-neutral-700)]">Status</label>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as GlPaymentStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {GL_PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {GL_PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="From date"
        type="date"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
      />
      <Input
        label="To date"
        type="date"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
      />
    </div>
  );
}
