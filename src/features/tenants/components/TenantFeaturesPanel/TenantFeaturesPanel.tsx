import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  TENANT_ENABLED_MODULE_KEYS,
  TENANT_ENABLED_MODULE_OPTIONS,
} from '../../constants/tenantModules.constants';
import { useUpdateTenantFeatures } from '../../hooks/useTenants';
import type { Tenant } from '../../types/tenant.types';

interface TenantFeaturesPanelProps {
  tenant: Tenant;
}

const VALID_MODULE_KEYS = new Set<string>(TENANT_ENABLED_MODULE_KEYS);

function defaultSelectedModules(tenant: Tenant): string[] {
  if (tenant.enabled_modules?.length) {
    // Only pre-check keys the API accepts.
    return tenant.enabled_modules.filter((key) => VALID_MODULE_KEYS.has(key));
  }
  // Missing/empty from API = unrestricted workspace → show full catalog checked.
  return TENANT_ENABLED_MODULE_OPTIONS.map((m) => m.key);
}

export function TenantFeaturesPanel({ tenant }: TenantFeaturesPanelProps) {
  const updateFeatures = useUpdateTenantFeatures(tenant.id);
  const catalogKeys = useMemo(
    () => new Set<string>(TENANT_ENABLED_MODULE_OPTIONS.map((m) => m.key)),
    [],
  );

  const unknownModules = useMemo(
    () => (tenant.enabled_modules ?? []).filter((key) => !catalogKeys.has(key)),
    [tenant.enabled_modules, catalogKeys],
  );

  const [selected, setSelected] = useState<string[]>(() => defaultSelectedModules(tenant));
  const [bridge, setBridge] = useState(Boolean(tenant.quote_requests_bridge));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelected(defaultSelectedModules(tenant));
    setBridge(Boolean(tenant.quote_requests_bridge));
  }, [tenant.id, tenant.enabled_modules, tenant.quote_requests_bridge]);

  const allCatalogSelected =
    TENANT_ENABLED_MODULE_OPTIONS.length > 0 &&
    TENANT_ENABLED_MODULE_OPTIONS.every((m) => selected.includes(m.key));

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const save = async () => {
    setError(null);
    setMessage(null);
    const enabled_modules = selected.filter((key) => VALID_MODULE_KEYS.has(key));
    if (enabled_modules.length === 0) {
      setError('Select at least one module. An empty allow-list would lock out the workspace.');
      return;
    }
    try {
      await updateFeatures.mutateAsync({
        enabled_modules,
        quote_requests_bridge: bridge,
      });
      setMessage(
        'Features saved. Permission matrix, role presets, and reports filter to these modules. Ask tenant users to sign in again so JWT picks up the change.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update features.');
    }
  };

  return (
    <Card>
      <CardHeader className="mb-0 pb-3 flex flex-row items-start justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>Enabled modules</CardTitle>
          <p className="mt-1 text-xs text-[var(--color-neutral-500)] max-w-xl">
            Checked modules are the allow-list sent as <code className="text-[10px]">enabled_modules</code>.
            Valid keys: operations, sales, finance, masters, admin, hr, wms, transport, nvocc,
            documentation, support, logistics. They control the permission matrix, role presets, and
            report catalog. Empty selection cannot be saved.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={updateFeatures.isPending}
          onClick={() => void save()}
        >
          {updateFeatures.isPending ? 'Saving…' : 'Save features'}
        </Button>
      </CardHeader>

      <div className="space-y-4 px-1 pb-1">
        {error ? (
          <p className="text-sm text-[var(--color-danger-600)]" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-[var(--color-success-700)]" role="status">
            {message}
          </p>
        ) : null}

        <label className="flex items-start gap-2 text-sm text-[var(--color-neutral-800)]">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={bridge}
            onChange={(e) => setBridge(e.target.checked)}
          />
          <span>
            <span className="font-medium">Quote requests bridge</span>
            <span className="block text-xs text-[var(--color-neutral-500)]">
              Enables the quote-requests bridge feature flag for this tenant.
            </span>
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setSelected(TENANT_ENABLED_MODULE_OPTIONS.map((m) => m.key))}
          >
            {allCatalogSelected ? 'All selected' : 'Select all'}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {TENANT_ENABLED_MODULE_OPTIONS.map((mod) => (
            <li key={mod.key}>
              <label className="flex items-center gap-2 rounded-md border border-[var(--color-neutral-100)] px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(mod.key)}
                  onChange={() => toggle(mod.key)}
                />
                <span>
                  <span className="font-medium text-[var(--color-neutral-800)]">{mod.label}</span>
                  <span className="ml-1 font-mono text-[10px] text-[var(--color-neutral-400)]">
                    {mod.key}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {unknownModules.length > 0 ? (
          <p className="text-xs text-[var(--color-neutral-500)]">
            Ignoring unknown keys from API (not sent on save): {unknownModules.join(', ')}.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
