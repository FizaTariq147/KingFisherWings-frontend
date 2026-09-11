import { useEffect, useMemo, useState } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import { usePortalRoutePlaceOptions } from '../hooks/usePortalQuotations';
import {
  portalPortsToSelectOptions,
  type PortalPortOption,
} from '../utils/loadPortalPortOptions';

export type PortalPlaceKind = 'ports' | 'airports';

interface PortalPlaceSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Explicit ports vs airports; or pass jobType for auto. */
  kind?: PortalPlaceKind;
  jobType?: string | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Exclude this UUID from the option list (e.g. other leg already chosen). */
  excludeId?: string;
  /** Called whenever lookup rows update so the parent can resolve IDs → labels. */
  onPlacesLoaded?: (places: PortalPortOption[]) => void;
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
 * Customer portal origin/destination picker.
 * Air jobs use the world airports catalog; sea uses ports.
 */
export function PortalPlaceSelect({
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
  onPlacesLoaded,
}: PortalPlaceSelectProps) {
  const air = kind === 'airports' || (kind == null && isAirJobType(jobType));
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 300);
  const placeQuery = usePortalRoutePlaceOptions(jobType, debounced, true);

  useEffect(() => {
    if (placeQuery.data?.length) onPlacesLoaded?.(placeQuery.data);
  }, [placeQuery.data, onPlacesLoaded]);

  const options = useMemo(() => {
    const rows = portalPortsToSelectOptions(placeQuery.data ?? []);
    return excludeId ? rows.filter((o) => o.value !== excludeId) : rows;
  }, [placeQuery.data, excludeId]);

  // Keep the selected UUID visible when it drops out of the current search page.
  const merged = useMemo(() => {
    if (!value || options.some((o) => o.value === value)) return options;
    const cached = placeQuery.data?.find((p) => p.id === value);
    return [{ value, label: cached?.label || value }, ...options];
  }, [options, value, placeQuery.data]);

  const placeWord = air ? 'airport' : 'port';

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
      allowManualUuid={false}
      allowManualValue={false}
      placeholder={placeholder ?? `Search ${placeWord} by name or code…`}
      hint={hint}
    />
  );
}
