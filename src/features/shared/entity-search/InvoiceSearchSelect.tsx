import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useInvoice, useInvoices } from '@/features/invoices/hooks/useInvoices';
import { invoiceDisplayNumber } from '@/features/invoices/utils/normalizeInvoice';
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

function invoiceOptionLabel(
  invoiceNumber?: string | null,
  partyName?: string | null,
  fallbackId?: string,
): string {
  const number = String(invoiceNumber ?? '').trim();
  const party = String(partyName ?? '').trim();
  const primary = number || (fallbackId ? `Invoice ${fallbackId.slice(0, 8)}` : 'Invoice');
  return [primary, party].filter(Boolean).join(' · ');
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
  const { data: selectedInvoice } = useInvoice(isUuid(value) ? value : '');

  const options = useMemo(() => {
    const fromList = (data?.invoices ?? [])
      .filter((inv) => isUuid(inv.id))
      .map((inv) => ({
        value: inv.id,
        label: invoiceOptionLabel(inv.invoice_number, inv.party_name, inv.id),
      }));

    if (
      selectedInvoice &&
      isUuid(selectedInvoice.id) &&
      !fromList.some((o) => o.value === selectedInvoice.id)
    ) {
      return [
        {
          value: selectedInvoice.id,
          label: invoiceOptionLabel(
            invoiceDisplayNumber(selectedInvoice),
            selectedInvoice.party_name,
            selectedInvoice.id,
          ),
        },
        ...fromList,
      ];
    }
    return fromList;
  }, [data?.invoices, selectedInvoice]);

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
