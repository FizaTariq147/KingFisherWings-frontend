import {
  PURCHASE_INVOICE_STATUSES,
  PURCHASE_INVOICE_STATUS_LABELS,
  PURCHASE_INVOICE_TYPES,
  PURCHASE_INVOICE_TYPE_LABELS,
  type PurchaseInvoiceStatus,
  type PurchaseInvoiceType,
} from '../../constants/purchaseInvoice.constants';

const selectClass =
  'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

interface PurchaseInvoiceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: PurchaseInvoiceStatus | 'all';
  onStatusChange: (value: PurchaseInvoiceStatus | 'all') => void;
  invoiceType: PurchaseInvoiceType | 'all';
  onInvoiceTypeChange: (value: PurchaseInvoiceType | 'all') => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
}

export function PurchaseInvoiceFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  invoiceType,
  onInvoiceTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: PurchaseInvoiceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search invoice no, vendor…"
        aria-label="Search purchase invoices"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as PurchaseInvoiceStatus | 'all')}
        aria-label="Filter by status"
        className={selectClass}
      >
        <option value="all">All statuses</option>
        {PURCHASE_INVOICE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PURCHASE_INVOICE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        value={invoiceType}
        onChange={(e) => onInvoiceTypeChange(e.target.value as PurchaseInvoiceType | 'all')}
        aria-label="Filter by invoice type"
        className={selectClass}
      >
        <option value="all">All types</option>
        {PURCHASE_INVOICE_TYPES.map((t) => (
          <option key={t} value={t}>
            {PURCHASE_INVOICE_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
        aria-label="From date"
        className={selectClass}
      />
      <input
        type="date"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
        aria-label="To date"
        className={selectClass}
      />
    </div>
  );
}
