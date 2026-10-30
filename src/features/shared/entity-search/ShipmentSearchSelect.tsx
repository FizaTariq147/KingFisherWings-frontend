import { useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useShipments } from '@/features/shipments/hooks/useShipments';
import { isUuid } from '@/lib/isUuid';

interface ShipmentSearchSelectProps {
  name?: string;
  label?: string;
  value: string;
  onChange: (shipmentId: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * Shipment picker by number — stores shipment UUID, displays human label.
 */
export function ShipmentSearchSelect({
  name = 'shipment_id',
  label = 'Shipment',
  value,
  onChange,
  required,
  error,
  placeholder = 'Search by shipment number…',
}: ShipmentSearchSelectProps) {
  const [search, setSearch] = useState('');
  const { data } = useShipments({
    page: 1,
    limit: 50,
    search: search.trim() || undefined,
  });

  const options = useMemo(() => {
    return (data?.shipments ?? [])
      .filter((s) => isUuid(s.id))
      .map((s) => {
        const number = String(s.shipment_number ?? '').trim();
        const type = String(s.job_type ?? '').trim();
        const labelText = [number || 'Shipment', type].filter(Boolean).join(' · ');
        return { value: s.id, label: labelText };
      });
  }, [data?.shipments]);

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
      emptyMessage="No shipments found"
      allowManualUuid={false}
    />
  );
}
