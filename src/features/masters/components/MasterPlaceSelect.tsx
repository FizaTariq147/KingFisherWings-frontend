import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import {
  useMasterPlaceOptions,
  usePlaceSearchQuery,
} from '@/features/masters/hooks/useMasterResource';

export type MasterPlaceKind = 'ports' | 'airports';

interface MasterPlaceSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Explicit ports vs airports; or pass jobType for auto. */
  kind?: MasterPlaceKind;
  jobType?: string | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  /** Exclude this UUID from the option list (e.g. other leg already chosen). */
  excludeId?: string;
}

/**
 * Staff quote/job place picker — GET /masters/ports|airports with search= typeahead.
 */
export function MasterPlaceSelect({
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
}: MasterPlaceSelectProps) {
  const resolved: MasterPlaceKind =
    kind ?? (isAirJobType(jobType) ? 'airports' : 'ports');
  const { setQuery, debouncedSearch } = usePlaceSearchQuery(300);
  const { options, isFetching } = useMasterPlaceOptions(
    resolved,
    debouncedSearch,
    true,
    value ? [value] : [],
  );

  const filtered = excludeId ? options.filter((o) => o.value !== excludeId) : options;
  const placeWord = resolved === 'airports' ? 'airport' : 'port';

  return (
    <SearchableSelect
      name={name}
      label={label}
      value={value}
      options={filtered}
      onChange={onChange}
      onQueryChange={setQuery}
      required={required}
      error={error}
      allowManualUuid
      placeholder={placeholder ?? `Search ${placeWord} by name or code…`}
      hint={
        hint ??
        (isFetching
          ? `Searching ${placeWord}s…`
          : `Type to search world ${placeWord}s (up to 500).`)
      }
    />
  );
}
