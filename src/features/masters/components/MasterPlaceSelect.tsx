import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { isAirJobType } from '@/features/jobs/constants/job.constants';
import {
  useMasterPlaceOptions,
  usePlaceSearchQuery,
} from '@/features/masters/hooks/useMasterResource';
import { masterPlaceLabel } from '@/features/masters/utils/placeLabel';
import { parsePlaceLabel } from '@/features/shared/routing/routingPlace';
import { AddPortModal } from './AddPortModal';

export type MasterPlaceKind = 'ports' | 'airports';

export type MasterPlaceSelection = {
  id: string;
  label: string;
  code?: string;
  name?: string;
};

interface MasterPlaceSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Fired with parsed code/name when a place is chosen or cleared. */
  onPlaceChange?: (place: MasterPlaceSelection | null) => void;
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
   * Show + control that POSTs a new port/airport and selects it.
   * Default true for staff quote/job/admin/customer forms.
   */
  allowCreate?: boolean;
}

/**
 * Staff quote/job place picker.
 * CreateJobDto / CreateQuotationDto `origin_port_id` / `dest_port_id` resolve against
 * `/masters/ports` only (AIR places are ports with mode=AIR). Do not default to
 * `/masters/airports` — those UUIDs are a different table and BE returns
 * "Origin port not found".
 *
 * + opens AddPortModal → POST /masters/ports|airports → select new id → list refreshes.
 */
export function MasterPlaceSelect({
  name,
  label,
  value,
  onChange,
  onPlaceChange,
  kind,
  jobType,
  error,
  required,
  placeholder,
  hint,
  excludeId,
  allowCreate = true,
}: MasterPlaceSelectProps) {
  // jobType only affects UX labels / default mode; FK fields need port IDs unless kind is forced.
  const resolved: MasterPlaceKind = kind ?? 'ports';
  const airLabel = isAirJobType(jobType);
  const { setQuery, debouncedSearch } = usePlaceSearchQuery(300);
  const { options, isFetching } = useMasterPlaceOptions(
    resolved,
    debouncedSearch,
    true,
    value ? [value] : [],
  );
  const [createOpen, setCreateOpen] = useState(false);
  /** Keep just-created row visible before list refetch lands. */
  const [extraOption, setExtraOption] = useState<{ value: string; label: string } | null>(
    null,
  );

  const filtered = excludeId ? options.filter((o) => o.value !== excludeId) : options;
  const merged =
    extraOption && !filtered.some((o) => o.value === extraOption.value)
      ? [extraOption, ...filtered]
      : filtered;

  const placeWord =
    resolved === 'airports' || (resolved === 'ports' && airLabel) ? 'airport' : 'port';
  const defaultMode = airLabel || resolved === 'airports' ? 'AIR' : 'SEA';

  const emitChange = (id: string, labelText?: string) => {
    onChange(id);
    if (!onPlaceChange) return;
    if (!id) {
      onPlaceChange(null);
      return;
    }
    const optLabel =
      labelText ??
      merged.find((o) => o.value === id)?.label ??
      '';
    const parsed = parsePlaceLabel(optLabel);
    onPlaceChange({ id, label: optLabel, ...parsed });
  };

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <SearchableSelect
            name={name}
            label={label}
            value={value}
            options={merged}
            onChange={(id) => emitChange(id)}
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
        </div>
        {allowCreate ? (
          <button
            type="button"
            className="mt-[22px] flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-neutral-200)] bg-white text-[var(--color-primary-700)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]"
            title={`Add ${placeWord}`}
            aria-label={`Add ${placeWord}`}
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
          </button>
        ) : null}
      </div>

      {allowCreate ? (
        <AddPortModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          resource={resolved}
          defaultMode={defaultMode}
          title={`Add ${placeWord}`}
          onCreated={(record) => {
            const id = String(record.id ?? '');
            if (!id) return;
            const createdLabel = masterPlaceLabel(record);
            setExtraOption({ value: id, label: createdLabel });
            emitChange(id, createdLabel);
            setQuery('');
          }}
        />
      ) : null}
    </div>
  );
}
