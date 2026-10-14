import { FilterBar } from '@/components/erp';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useUsers } from '@/features/users/hooks/useUsers';
import { isUuid } from '@/lib/isUuid';
import {
  JOB_TYPE_LABELS,
  JOB_TYPES,
  QUOTATION_STATUS_FILTERS,
  STATUS_LABELS,
  type JobType,
  type QuotationStatus,
} from '../../constants/quotation.constants';

const fieldClass =
  'h-8 rounded-sm border border-[#c5cdd6] bg-white px-2.5 text-[13px] text-[var(--color-neutral-800)] focus:outline-none focus:border-[var(--color-primary-500)]';

interface QuotationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: QuotationStatus | 'all';
  onStatusChange: (value: QuotationStatus | 'all') => void;
  jobType: JobType | 'all';
  onJobTypeChange: (value: JobType | 'all') => void;
  departmentId: string;
  onDepartmentIdChange: (value: string) => void;
  salespersonId: string;
  onSalespersonIdChange: (value: string) => void;
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
  departmentId,
  onDepartmentIdChange,
  salespersonId,
  onSalespersonIdChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  order,
  onOrderChange,
}: QuotationFiltersProps) {
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: usersResult } = useUsers({
    tenantId: '',
    page: 1,
    limit: 100,
    order: 'asc',
  });

  return (
    <FilterBar>
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search quote no…"
        aria-label="Search quotations"
        className={`${fieldClass} w-full max-w-md sm:mr-auto`}
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as QuotationStatus | 'all')}
        aria-label="Filter by status"
        className={fieldClass}
      >
        <option value="all">All statuses</option>
        {QUOTATION_STATUS_FILTERS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select
        value={jobType}
        onChange={(e) => onJobTypeChange(e.target.value as JobType | 'all')}
        aria-label="Filter by job type"
        className={fieldClass}
      >
        <option value="all">All job types</option>
        {JOB_TYPES.map((t) => (
          <option key={t} value={t}>
            {JOB_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <select
        value={departmentId}
        onChange={(e) => onDepartmentIdChange(e.target.value)}
        aria-label="Filter by department"
        className={fieldClass}
      >
        <option value="">All departments</option>
        {departments
          .filter((d) => isUuid(String(d.id)))
          .map((d) => (
            <option key={String(d.id)} value={String(d.id)}>
              {String(d.name ?? d.code ?? d.id)}
            </option>
          ))}
      </select>
      <select
        value={salespersonId}
        onChange={(e) => onSalespersonIdChange(e.target.value)}
        aria-label="Filter by salesperson"
        className={fieldClass}
      >
        <option value="">All salespeople</option>
        {(usersResult?.users ?? [])
          .filter((u) => isUuid(u.id))
          .map((u) => (
            <option key={u.id} value={u.id}>
              {u.full_name ||
                [u.first_name, u.last_name].filter(Boolean).join(' ') ||
                u.email ||
                u.id.slice(0, 8)}
            </option>
          ))}
      </select>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => onFromDateChange(e.target.value)}
        aria-label="From date"
        className={fieldClass}
      />
      <input
        type="date"
        value={toDate}
        onChange={(e) => onToDateChange(e.target.value)}
        aria-label="To date"
        className={fieldClass}
      />
      <select
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
        aria-label="Sort order"
        className={fieldClass}
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </FilterBar>
  );
}
