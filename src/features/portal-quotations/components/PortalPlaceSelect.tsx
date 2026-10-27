import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { AddPortModal } from '@/features/masters/components/AddPortModal';
import { masterPlaceLabel } from '@/features/masters/utils/placeLabel';
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
  /** Show + that POSTs a master port/airport (default true). */
  allowCreate?: boolean;
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
 * + (when ERP auth present) POSTs a master place and selects it.
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
  allowCreate = true,
}: PortalPlaceSelectProps) {
  const air = kind === 'airports' || (kind == null && isAirJobType(jobType));
  const resource: PortalPlaceKind = air ? 'airports' : 'ports';

  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 300);
  const placeQuery = usePortalRoutePlaceOptions(jobType, debounced, true);
  const [createOpen, setCreateOpen] = useState(false);
  const [extraOption, setExtraOption] = useState<{ value: string; label: string } | null>(
    null,
  );

  useEffect(() => {
    if (placeQuery.data?.length) onPlacesLoaded?.(placeQuery.data);
  }, [placeQuery.data, onPlacesLoaded]);

  const options = useMemo(() => {
    const rows = portalPortsToSelectOptions(placeQuery.data ?? []);
    return excludeId ? rows.filter((o) => o.value !== excludeId) : rows;
  }, [placeQuery.data, excludeId]);

  // Keep the selected UUID visible when it drops out of the current search page.
  const merged = useMemo(() => {
    let base = options;
    if (extraOption && !base.some((o) => o.value === extraOption.value)) {
      base = [extraOption, ...base];
    }
    if (!value || base.some((o) => o.value === value)) return base;
    const cached = placeQuery.data?.find((p) => p.id === value);
    return [{ value, label: cached?.label || value }, ...base];
  }, [options, value, placeQuery.data, extraOption]);

  const placeWord = air ? 'airport' : 'port';

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
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
          resource={resource}
          defaultMode={air ? 'AIR' : 'SEA'}
          title={`Add ${placeWord}`}
          onCreated={(record) => {
            const id = String(record.id ?? '');
            if (!id) return;
            const labelText = masterPlaceLabel(record);
            setExtraOption({ value: id, label: labelText });
            onPlacesLoaded?.([
              {
                id,
                label: labelText,
                name: String(record.name ?? ''),
                code: String(
                  record.un_locode ?? record.iata_code ?? record.code ?? '',
                ),
                countryCode: String(record.country_code ?? ''),
              },
            ]);
            onChange(id);
            setQuery('');
          }}
        />
      ) : null}
    </div>
  );
}
