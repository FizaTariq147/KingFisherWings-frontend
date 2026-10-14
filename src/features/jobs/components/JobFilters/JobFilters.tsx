import { FilterBar } from '@/components/erp';
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  type JobStatus,
  type JobType,
} from '../../constants/job.constants';

const fieldClass =
  'h-8 rounded-sm border border-[#c5cdd6] bg-white px-2.5 text-[13px] focus:outline-none focus:border-[var(--color-primary-500)]';

interface JobFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: '' | JobStatus;
  onStatusChange: (v: '' | JobStatus) => void;
  jobType: '' | JobType;
  onJobTypeChange: (v: '' | JobType) => void;
  jobTypeOptions: JobType[];
  /** Label for empty job-type filter (default: segment-scoped lists). */
  jobTypeAllLabel?: string;
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
  jobTypeAllLabel = 'All types in segment',
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
    <FilterBar>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search job no…"
        aria-label="Search jobs"
        className={`${fieldClass} w-full max-w-md sm:mr-auto`}
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as '' | JobStatus)}
        className={fieldClass}
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
        className={fieldClass}
        aria-label="Filter by job type"
      >
        <option value="">{jobTypeAllLabel}</option>
        {jobTypeOptions.map((t) => (
          <option key={t} value={t}>
            {JOB_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      {onFromDateChange ? (
        <input
          type="date"
          value={fromDate}
          onChange={(e) => onFromDateChange(e.target.value)}
          className={fieldClass}
          aria-label="From date"
        />
      ) : null}
      {onToDateChange ? (
        <input
          type="date"
          value={toDate}
          onChange={(e) => onToDateChange(e.target.value)}
          className={fieldClass}
          aria-label="To date"
        />
      ) : null}
      {onMastersOnlyChange ? (
        <label className="flex items-center gap-1.5 text-[13px] text-[#64748b]">
          <input
            type="checkbox"
            checked={mastersOnly}
            onChange={(e) => onMastersOnlyChange(e.target.checked)}
          />
          Masters only
        </label>
      ) : null}
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        className={fieldClass}
        aria-label="Sort order"
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </FilterBar>
  );
}
