import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useCrmEnquiries } from '@/features/crm/hooks/useCrmEnquiries';
import { isUuid } from '@/lib/isUuid';

interface EnquirySearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (enquiryId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * CRM enquiry picker by number / party — stores enquiry UUID, displays name.
 */
export function EnquirySearchSelect({
  name = 'enquiry_id',
  label = 'Enquiry',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search enquiry by number…',
}: EnquirySearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useCrmEnquiries({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const options = useMemo(() => {
    return (data?.items ?? [])
      .filter((e) => isUuid(e.id))
      .map((e) => {
        const number = String(e.enquiry_number ?? '').trim();
        const party = String(e.party_name ?? e.company_name ?? '').trim();
        const labelText = [number || 'Enquiry', party].filter(Boolean).join(' · ');
        return { value: e.id, label: labelText };
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
      emptyMessage="No enquiries found"
      allowManualUuid={false}
    />
  );
}
