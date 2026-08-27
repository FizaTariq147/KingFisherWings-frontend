import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { useWmsItems } from '../hooks/useWms';
import { getErrorMessage } from '../utils/getErrorMessage';

/** Backend GET /wms/items enforces limit max 100. */
const WMS_ITEM_OPTIONS_LIMIT = 100;

export function useWmsWarehouseOptions() {
  const { data: warehouses = [], isLoading } = useMasterOptions(
    'warehouses',
    MASTER_PATHS.warehouses,
    true,
  );
  const options = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [{ value: '', label: 'Select warehouse…' }];
    for (const w of warehouses) {
      if (!isUuid(String(w.id))) continue;
      opts.push({
        value: String(w.id),
        label: [w.code, w.name].filter(Boolean).join(' — ') || String(w.id),
      });
    }
    return opts;
  }, [warehouses]);
  return { options, isLoading };
}

/** UOM picker options from Masters → Units of Measure (code is stored on WMS items). */
export function useWmsUomOptions() {
  const { data: uoms = [], isLoading } = useMasterOptions(
    'units-of-measure',
    MASTER_PATHS['units-of-measure'],
    true,
  );
  const options = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [{ value: '', label: 'Select UOM…' }];
    const seen = new Set<string>();
    for (const u of uoms) {
      const code = String(u.code ?? '')
        .trim()
        .toUpperCase();
      if (!code || seen.has(code)) continue;
      seen.add(code);
      opts.push({
        value: code,
        label: [code, u.name].filter(Boolean).join(' — '),
      });
    }
    return opts;
  }, [uoms]);
  const codes = useMemo(
    () => options.map((o) => o.value).filter(Boolean),
    [options],
  );
  return { options, codes, isLoading, isEmpty: !isLoading && codes.length === 0 };
}

/**
 * Item picker options from GET /wms/items (limit capped at API max 100).
 */
export function useWmsItemOptions(search = '') {
  const query = useWmsItems({
    page: 1,
    limit: WMS_ITEM_OPTIONS_LIMIT,
    search: search || undefined,
  });

  const items = query.data?.items ?? [];
  const isLoading = query.isLoading || query.isFetching;
  const isError = query.isError;

  const options = useMemo(() => {
    const opts: Array<{ value: string; label: string }> = [
      {
        value: '',
        label: isLoading
          ? 'Loading items…'
          : isError
            ? 'Failed to load items'
            : items.length
              ? 'Select item…'
              : 'No WMS items yet — create one first',
      },
    ];
    for (const item of items) {
      const id = String(item.id ?? '').trim();
      if (!id) continue;
      opts.push({
        value: id,
        label: [item.code, item.name].filter(Boolean).join(' — ') || id,
      });
    }
    return opts;
  }, [items, isLoading, isError]);

  return {
    options,
    isLoading,
    isError,
    errorMessage: isError ? getErrorMessage(query.error) : null,
    isEmpty: !isLoading && !isError && items.length === 0,
    itemCount: items.length,
    refetch: query.refetch,
  };
}

interface WmsSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  error?: string | null;
}

export function WmsSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  required,
  disabled,
  id,
  error,
}: WmsSelectProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-xs font-medium text-[var(--color-neutral-600)]">
        {label}
        {required ? <span className="text-[var(--color-danger-500)]"> *</span> : null}
      </label>
      <select
        id={fieldId}
        value={value}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`h-9 w-full rounded-md border bg-white px-3 text-sm text-[var(--color-neutral-800)] focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 ${
          error
            ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)]'
            : 'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]'
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value || `${fieldId}-empty`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-[var(--color-danger-500)]">{error}</p> : null}
    </div>
  );
}

/** Shown on ASN/GRN/GDO create when items failed to load or none exist. */
export function WmsItemsEmptyHint({
  isEmpty,
  isError,
  errorMessage,
  onRetry,
}: {
  isEmpty?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  if (isError) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
        Could not load WMS items{errorMessage ? `: ${errorMessage}` : '.'}{' '}
        {onRetry ? (
          <button type="button" className="font-medium underline" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </p>
    );
  }
  if (!isEmpty) return null;
  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      No WMS items found. Create SKUs under{' '}
      <Link className="font-medium underline" to={`${WMS_ROUTE_PREFIX}/items/new`}>
        Warehouse → WMS Items → New item
      </Link>
      , then refresh this page.
    </p>
  );
}
