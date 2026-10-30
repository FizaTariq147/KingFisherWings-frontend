import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { isUuid } from '@/lib/isUuid';

interface InvoiceSearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (invoiceId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  hint?: string;
}

/**
 * Invoice picker by number / party — stores invoice UUID, displays human label.
 */
export function InvoiceSearchSelect({
  name = 'invoice_id',
  label = 'Invoice',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search by invoice number…',
  hint,
}: InvoiceSearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useInvoices({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const options = useMemo(() => {
    return (data?.invoices ?? [])
      .filter((inv) => isUuid(inv.id))
      .map((inv) => {
        const number = String(inv.invoice_number ?? '').trim();
        const party = String(inv.party_name ?? '').trim();
        const labelText = [number || 'Invoice', party].filter(Boolean).join(' · ');
        return { value: inv.id, label: labelText };
      });
  }, [data?.invoices]);

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
      hint={hint}
      emptyMessage="No invoices found"
      allowManualUuid={false}
    />
  );
}
