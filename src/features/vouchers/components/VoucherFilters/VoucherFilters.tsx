import { Input } from '@/components/ui/Input';
import {
  VOUCHER_STATUSES,
  VOUCHER_STATUS_LABELS,
  VOUCHER_TYPES,
  VOUCHER_TYPE_LABELS,
  type VoucherStatus,
  type VoucherType,
} from '../../constants/voucher.constants';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface VoucherFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  voucherType: VoucherType | 'all';
  onVoucherTypeChange: (v: VoucherType | 'all') => void;
  status: VoucherStatus | 'all';
  onStatusChange: (v: VoucherStatus | 'all') => void;
  fromDate: string;
  onFromDateChange: (v: string) => void;
  toDate: string;
  onToDateChange: (v: string) => void;
}

export function VoucherFilters({
  search,
  onSearchChange,
  voucherType,
  onVoucherTypeChange,
  status,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: VoucherFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <Input
        label="Search"
        placeholder="Number or narration…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="space-y-1">
        <label htmlFor="voucher-filter-type" className="text-sm font-medium text-[var(--color-neutral-700)]">Type</label>
        <select
          id="voucher-filter-type"
          className={selectClass}
          value={voucherType}
          onChange={(e) => onVoucherTypeChange(e.target.value as VoucherType | 'all')}
        >
          <option value="all">All types</option>
          {VOUCHER_TYPES.map((t) => (
            <option key={t} value={t}>
              {VOUCHER_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="voucher-filter-status" className="text-sm font-medium text-[var(--color-neutral-700)]">Status</label>
        <select
          id="voucher-filter-status"
          className={selectClass}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as VoucherStatus | 'all')}
        >
          <option value="all">All statuses</option>
          {VOUCHER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {VOUCHER_STATUS_LABELS[s]}
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
