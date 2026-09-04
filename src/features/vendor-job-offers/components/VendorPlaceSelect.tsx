import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import {
  useVendorAirportOptions,
  useVendorPortOptions,
} from '@/features/vendor-job-offers/hooks/useVendorJobOffers';
import { vendorPlacesToSelectOptions } from '@/features/vendor-job-offers/utils/loadVendorLookupOptions';
import { useEffect, useMemo, useState } from 'react';

type PlaceKind = 'ports' | 'airports';

interface VendorPlaceSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind?: PlaceKind;
  jobType?: string | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  excludeId?: string;
}

function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Vendor portal place picker — GET /vendor/lookups/ports|airports with search=.
 */
export function VendorPlaceSelect({
  name,
  label,
  value,
  onChange,
  kind,
  jobType,
  error,
  required,
  placeholder,
  hint,
  excludeId,
}: VendorPlaceSelectProps) {
  const resolved: PlaceKind = kind ?? (isAirJobType(jobType) ? 'airports' : 'ports');
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 300);
  const portsQuery = useVendorPortOptions(debounced, resolved === 'ports');
  const airportsQuery = useVendorAirportOptions(debounced, resolved === 'airports');
  const placeQuery = resolved === 'airports' ? airportsQuery : portsQuery;

  const options = useMemo(() => {
    const rows = vendorPlacesToSelectOptions(placeQuery.data ?? []);
    return excludeId ? rows.filter((o) => o.value !== excludeId) : rows;
  }, [placeQuery.data, excludeId]);

  // Keep selected value visible if it dropped out of the current search page.
  const merged = useMemo(() => {
    if (!value || options.some((o) => o.value === value)) return options;
    return [{ value, label: value }, ...options];
  }, [options, value]);

  const placeWord = resolved === 'airports' ? 'airport' : 'port';

  return (
    <SearchableSelect
      name={name}
      label={label}
      value={value}
      options={merged}
      onChange={onChange}
      onQueryChange={setQuery}
      required={required}
      error={error}
      allowManualUuid
      placeholder={placeholder ?? `Search ${placeWord} by name or code…`}
      hint={
        hint ??
        (placeQuery.isFetching
          ? `Searching ${placeWord}s…`
          : `Type to search world ${placeWord}s (up to 500).`)
      }
    />
  );
}
