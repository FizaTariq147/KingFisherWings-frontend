import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useQuotations } from '@/features/quotations/hooks/useQuotations';
import { isUuid } from '@/lib/isUuid';

interface QuotationSearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (quotationId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * Quotation picker by number / customer — stores quotation UUID, displays human label.
 */
export function QuotationSearchSelect({
  name = 'quotation_id',
  label = 'Quotation',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search by quotation number…',
}: QuotationSearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useQuotations({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const options = useMemo(() => {
    return (data?.quotations ?? [])
      .filter((q) => isUuid(q.id))
      .map((q) => {
        const number = String(q.quotation_number ?? '').trim();
        const customer = String(q.customer_name ?? '').trim();
        const labelText = [number || 'Quotation', customer].filter(Boolean).join(' · ');
        return { value: q.id, label: labelText };
      });
  }, [data?.quotations]);

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
      emptyMessage="No quotations found"
      allowManualUuid={false}
    />
  );
}
