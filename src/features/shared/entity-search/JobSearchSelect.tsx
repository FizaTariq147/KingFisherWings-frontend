import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { isUuid } from '@/lib/isUuid';

interface JobSearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (jobId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Job picker by job number / type — stores job UUID, displays human label.
 */
export function JobSearchSelect({
  name = 'job_id',
  label = 'Job',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search by job number…',
}: JobSearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useJobs({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
    order: 'desc',
  });

  const options = useMemo(() => {
    const jobs = data?.jobs ?? [];
    return jobs
      .filter((j) => isUuid(j.id))
      .map((j) => {
        const number = String(j.job_number ?? '').trim();
        const type = String(j.job_type ?? '').trim();
        const labelText = [number || 'Job', type].filter(Boolean).join(' · ');
        return { value: j.id, label: labelText };
      });
  }, [data?.jobs]);

  return (
    <SearchableSelect
      name={name}
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      onQueryChange={setSearch}
      required={required}
      error={error}
      placeholder={placeholder}
      emptyMessage="No jobs found"
      allowManualUuid={false}
    />
  );
}
