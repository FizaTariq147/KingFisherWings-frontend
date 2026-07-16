import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  type JobStatus,
  type JobType,
} from '../../constants/job.constants';

const selectClass =
  'h-9 rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]';

interface JobFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: '' | JobStatus;
  onStatusChange: (v: '' | JobStatus) => void;
  jobType: '' | JobType;
  onJobTypeChange: (v: '' | JobType) => void;
  jobTypeOptions: JobType[];
  order: 'asc' | 'desc';
  onOrderChange: (v: 'asc' | 'desc') => void;
  fromDate?: string;
  onFromDateChange?: (v: string) => void;
  toDate?: string;
  onToDateChange?: (v: string) => void;
  mastersOnly?: boolean;
  onMastersOnlyChange?: (v: boolean) => void;
}

export function JobFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  jobType,
  onJobTypeChange,
  jobTypeOptions,
  order,
  onOrderChange,
  fromDate = '',
  onFromDateChange,
  toDate = '',
  onToDateChange,
  mastersOnly = false,
  onMastersOnlyChange,
}: JobFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search job number, shipper…"
        aria-label="Search jobs"
        className="h-9 w-full lg:w-72 rounded-md border border-[var(--color-neutral-200)] px-3 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as '' | JobStatus)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {JOB_STATUSES.map((s) => (
          <option key={s} value={s}>
            {JOB_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        value={jobType}
        onChange={(e) => onJobTypeChange(e.target.value as '' | JobType)}
        className={selectClass}
        aria-label="Filter by job type"
      >
        <option value="">All types in segment</option>
        {jobTypeOptions.map((t) => (
          <option key={t} value={t}>
            {JOB_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      {onFromDateChange && (
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className={selectClass}
          aria-label="From date"
        />
      )}
      {onToDateChange && (
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className={selectClass}
          aria-label="To date"
        />
      )}
      {onMastersOnlyChange && (
        <label className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)]">
          <input
            type="checkbox"
            checked={mastersOnly}
            onChange={(e) => onMastersOnlyChange(e.target.checked)}
          />
          Masters only
        </label>
      )}
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        className={selectClass}
        aria-label="Sort order"
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </div>
  );
}
