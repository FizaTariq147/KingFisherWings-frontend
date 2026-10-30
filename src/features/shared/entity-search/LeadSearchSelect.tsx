import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useCrmLeads } from '@/features/crm/hooks/useCrmLeads';
import { isUuid } from '@/lib/isUuid';

interface LeadSearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (leadId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * CRM lead picker by company / contact — stores lead UUID, displays name.
 */
export function LeadSearchSelect({
  name = 'lead_id',
  label = 'Lead',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search lead by company…',
}: LeadSearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useCrmLeads({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const options = useMemo(() => {
    return (data?.items ?? [])
      .filter((l) => isUuid(l.id))
      .map((l) => {
        const company = String(l.company_name ?? '').trim();
        const contact = String(l.contact_name ?? '').trim();
        const labelText = [company || 'Lead', contact].filter(Boolean).join(' · ');
        return { value: l.id, label: labelText };
      });
  }, [data?.items]);

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
      emptyMessage="No leads found"
      allowManualUuid={false}
    />
  );
}
