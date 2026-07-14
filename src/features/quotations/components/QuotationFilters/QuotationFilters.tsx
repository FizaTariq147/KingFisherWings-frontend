import {
  JOB_TYPE_LABELS,
  JOB_TYPES,
  QUOTATION_STATUSES,
  STATUS_LABELS,
  type JobType,
  type QuotationStatus,
} from '../../constants/quotation.constants';

const selectClass =
  'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

interface QuotationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: QuotationStatus | 'all';
  onStatusChange: (value: QuotationStatus | 'all') => void;
  jobType: JobType | 'all';
  onJobTypeChange: (value: JobType | 'all') => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
  order: 'asc' | 'desc';
  onOrderChange: (value: 'asc' | 'desc') => void;
}

export function QuotationFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  jobType,
  onJobTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  order,
  onOrderChange,
}: QuotationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search quote no, customer…"
        aria-label="Search quotations"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as QuotationStatus | 'all')}
        aria-label="Filter by status"
        className={selectClass}
      >
        <option value="all">All statuses</option>
        {QUOTATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        value={jobType}
        onChange={(e) => onJobTypeChange(e.target.value as JobType | 'all')}
        aria-label="Filter by job type"
        className={selectClass}
      >
        <option value="all">All job types</option>
        {JOB_TYPES.map((t) => (
          <option key={t} value={t}>
            {JOB_TYPE_LABELS[t]}
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
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        aria-label="Sort order"
        className={selectClass}
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </div>
  );
}
