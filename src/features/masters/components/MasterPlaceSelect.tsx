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
  /** Defaults to ports (job/quote FKs). Pass airports only when the API field is airport-scoped. */
  kind?: MasterPlaceKind;
  jobType?: string | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  /** Exclude this UUID from the option list (e.g. other leg already chosen). */
  excludeId?: string;
  /**
   * Staff only — open inline create for missing ports
   * (`create_origin_port` / `create_dest_port` on quote/job DTOs).
   */
  onCreateClick?: () => void;
  /** Label when a create_*_port draft is pending (clears on select). */
  pendingCreateLabel?: string;
  onClearPendingCreate?: () => void;
}

/**
 * Staff quote/job place picker.
 * CreateJobDto / CreateQuotationDto `origin_port_id` / `dest_port_id` resolve against
 * `/masters/ports` only (AIR places are ports with mode=AIR). Do not default to
 * `/masters/airports` — those UUIDs are a different table and BE returns
 * "Origin port not found".
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
  onCreateClick,
  pendingCreateLabel,
  onClearPendingCreate,
}: MasterPlaceSelectProps) {
  // jobType only affects UX labels in callers; FK fields always need port IDs unless kind is forced.
  const resolved: MasterPlaceKind = kind ?? 'ports';
  const airLabel = isAirJobType(jobType);
  const { setQuery, debouncedSearch } = usePlaceSearchQuery(300);
  const { options, isFetching } = useMasterPlaceOptions(
    resolved,
    debouncedSearch,
    true,
    value ? [value] : [],
  );

  const filtered = excludeId ? options.filter((o) => o.value !== excludeId) : options;
  const placeWord =
    resolved === 'airports' || (resolved === 'ports' && airLabel) ? 'airport' : 'port';

  return (
    <div className="space-y-1">
      <SearchableSelect
        name={name}
        label={label}
        value={value}
        options={filtered}
        onChange={(next) => {
          if (next && onClearPendingCreate) onClearPendingCreate();
          onChange(next);
        }}
        onQueryChange={setQuery}
        required={required}
        error={error}
        placeholder={placeholder ?? `Search ${placeWord} by name or code…`}
        hint={
          isFetching
            ? `${hint ? `${hint} · ` : ''}Searching…`
            : hint
        }
      />
      {pendingCreateLabel ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-primary-700)]">
          <span className="rounded-md border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] px-2 py-1">
            New {placeWord}: {pendingCreateLabel}
          </span>
          {onClearPendingCreate ? (
            <button
              type="button"
              className="underline"
              onClick={onClearPendingCreate}
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
      {onCreateClick && resolved === 'ports' ? (
        <button
          type="button"
          className="text-xs font-medium text-[var(--color-primary-700)] hover:underline"
          onClick={onCreateClick}
        >
          + Add missing {placeWord}
        </button>
      ) : null}
    </div>
  );
}
