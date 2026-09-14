import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { useJobs } from '@/features/jobs/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { WMS_ROUTE_PREFIX } from '../api/wms.api';
import { useWmsAsns, useWmsItems, useWmsWarehouses } from '../hooks/useWms';
import {
  displayDocNumber,
  mergeWarehouseSummaries,
  wmsWarehouseLabel,
} from '../utils/normalizeWms';
import { getErrorMessage } from '../utils/getErrorMessage';

/** Backend GET /wms/items enforces limit max 100. */
const WMS_ITEM_OPTIONS_LIMIT = 100;

type SelectOption = { value: string; label: string };

/**
 * Warehouse options — registered Masters → Warehouses (GET /masters/warehouses),
 * merged with WMS activity and any warehouse rows returned on GET /auth/me.
 */
export function useWmsWarehouseOptions() {
  const { user } = useAuth();

  const preferredId = useMemo(() => {
    const fromUser = user?.warehouseId ?? user?.assignedWarehouse?.id;
    return fromUser && isUuid(fromUser) ? fromUser : undefined;
  }, [user?.warehouseId, user?.assignedWarehouse?.id]);

  const authWarehouses = useMemo(
    () =>
      mergeWarehouseSummaries(
        user?.allowedWarehouses,
        user?.assignedWarehouse ? [user.assignedWarehouse] : undefined,
      ),
    [user?.allowedWarehouses, user?.assignedWarehouse],
  );

  const warehousesQuery = useWmsWarehouses(preferredId);

  const warehouses = useMemo(
    () => mergeWarehouseSummaries(authWarehouses, warehousesQuery.data),
    [authWarehouses, warehousesQuery.data],
  );

  const options = useMemo(() => {
    const opts: SelectOption[] = [];
    for (const w of warehouses) {
      opts.push({ value: w.id, label: wmsWarehouseLabel(w) });
    }

    const loading = warehousesQuery.isLoading;

    const placeholder: SelectOption = {
      value: '',
      label: loading
        ? 'Loading warehouses…'
        : opts.length
          ? 'Select warehouse…'
          : warehousesQuery.isError
            ? 'Could not load warehouses'
            : 'No master warehouses found',
    };

    return [placeholder, ...opts];
  }, [warehouses, warehousesQuery.isLoading, warehousesQuery.isError]);

  const isLoading = warehousesQuery.isLoading;
  const isError = warehousesQuery.isError && warehouses.length === 0;
  const errorMessage = isError ? getErrorMessage(warehousesQuery.error) : null;

  const refetch = () => {
    void warehousesQuery.refetch();
  };

  return {
    options,
    isLoading,
    isError,
    errorMessage,
    preferredId,
    selectableCount: options.filter((o) => o.value).length,
    refetch,
  };
}

/** Shown when master warehouses cannot be loaded into GRN/GDO/ASN forms. */
export function WmsWarehousesEmptyHint({
  selectableCount,
  isLoading,
  errorMessage,
  onRetry,
}: {
  selectableCount: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}) {
  if (isLoading || selectableCount > 0) return null;

  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      {errorMessage
        ? `Could not load master warehouses: ${errorMessage}. `
        : 'No master warehouses are available for this user. '}
      Register warehouses under <strong>Masters → Warehouses</strong>. Warehouse staff need{' '}
      <strong>WMS read</strong> and either <strong>GET /masters/warehouses</strong> access or a scoped
      warehouse list on <strong>GET /auth/me</strong>.{' '}
      {onRetry ? (
        <button type="button" className="font-medium underline" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </p>
  );
}

/** Party picker — same source as Payment Request / ERP forms. */
export function useWmsPartyOptions() {
  const { data, isLoading, isError } = useParties({ page: 1, limit: 200, order: 'asc' });
  const parties = data?.parties ?? [];
  const options = useMemo(() => {
    const opts: SelectOption[] = [
      {
        value: '',
        label: isLoading
          ? 'Loading parties…'
          : isError
            ? 'Failed to load parties'
            : parties.length
              ? 'Select party (optional)…'
              : 'No parties found',
      },
    ];
    for (const p of parties) {
      if (!isUuid(p.id)) continue;
      opts.push({
        value: p.id,
        label: p.code ? `${p.name} (${p.code})` : p.name,
      });
    }
    return opts;
  }, [parties, isLoading, isError]);
  return { options, isLoading, isError, selectableCount: options.filter((o) => o.value).length };
}

/** Job picker for optional job_id on ASN/GRN/GDO. */
export function useWmsJobOptions() {
  const { data, isLoading, isError } = useJobs({ page: 1, limit: 100 });
  const list = data?.jobs ?? [];
  const options = useMemo(() => {
    const opts: SelectOption[] = [
      {
        value: '',
        label: isLoading
          ? 'Loading jobs…'
          : isError
            ? 'Failed to load jobs'
            : list.length
              ? 'Select job (optional)…'
              : 'No jobs found',
      },
    ];
    for (const j of list) {
      if (!j.id || !isUuid(j.id)) continue;
      opts.push({
        value: j.id,
        label: j.job_number || j.id,
      });
    }
    return opts;
  }, [list, isLoading, isError]);
  return { options, isLoading, isError, selectableCount: options.filter((o) => o.value).length };
}

/** ASN picker for optional asn_id on GRN. */
export function useWmsAsnOptions() {
  const { data = [], isLoading, isError } = useWmsAsns();
  const options = useMemo(() => {
    const opts: SelectOption[] = [
      {
        value: '',
        label: isLoading
          ? 'Loading ASNs…'
          : isError
            ? 'Failed to load ASNs'
            : data.length
              ? 'Select ASN (optional)…'
              : 'No ASNs found',
      },
    ];
    for (const doc of data) {
      if (!doc.id || !isUuid(doc.id)) continue;
      opts.push({
        value: doc.id,
        label: displayDocNumber(doc),
      });
    }
    return opts;
  }, [data, isLoading, isError]);
  return { options, isLoading, isError, selectableCount: options.filter((o) => o.value).length };
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
      <label htmlFor={fieldId} className="text-xs font-medium text-[var(--color-neutral-500)]">
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
