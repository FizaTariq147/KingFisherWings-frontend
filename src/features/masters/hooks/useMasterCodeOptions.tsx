import { useMemo } from 'react';
import { MASTER_PATHS } from '../api/masterPaths';
import { useMasterOptions } from './useMasterResource';

type CodeMasterKey = 'units-of-measure' | 'currencies' | 'air-pallet-types' | 'warehouses';

export interface MasterCodeOption {
  code: string;
  name: string;
  /** Currencies master only — tenant base currency. */
  isBase: boolean;
}

/**
 * Code/name pairs from a master (units, currencies, pallet types, warehouses) so
 * form inputs suggest tenant master data instead of hardcoded literals.
 */
export function useMasterCodeOptions(resource: CodeMasterKey, enabled = true) {
  const { data = [] } = useMasterOptions(resource, MASTER_PATHS[resource], enabled);
  return useMemo<MasterCodeOption[]>(
    () =>
      data
        .map((row) => ({
          code: String(row.code ?? '').trim(),
          name: String(row.name ?? '').trim(),
          isBase: row.is_base === true,
        }))
        .filter((o) => o.code),
    [data],
  );
}

/** Tenant base currency code from the currencies master, or '' when not configured. */
export function baseCurrencyCode(options: MasterCodeOption[]): string {
  return options.find((o) => o.isBase)?.code ?? '';
}

/** `<datalist>` for an `<input list={id}>` — keeps free text, suggests master codes. */
export function MasterCodeDatalist({ id, options }: { id: string; options: MasterCodeOption[] }) {
  return (
    <datalist id={id}>
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {o.name && o.name !== o.code ? o.name : null}
        </option>
      ))}
    </datalist>
  );
}
