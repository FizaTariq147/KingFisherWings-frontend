import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  TENANT_ENABLED_MODULE_KEYS,
  TENANT_ENABLED_MODULE_OPTIONS,
} from '../../constants/tenantModules.constants';
import { useUpdateTenantFeatures } from '../../hooks/useTenants';
import { tenantService } from '../../services/tenant.service';
import type { Tenant } from '../../types/tenant.types';

interface TenantFeaturesPanelProps {
  tenant: Tenant;
}

type ModuleOption = { key: string; label: string };

const FALLBACK_OPTIONS: ModuleOption[] = TENANT_ENABLED_MODULE_OPTIONS.map((m) => ({
  key: m.key,
  label: m.label,
}));

function defaultSelectedModules(tenant: Tenant, catalogKeys: Set<string>): string[] {
  if (tenant.enabled_modules?.length) {
    return tenant.enabled_modules.filter((key) => catalogKeys.has(key));
  }
  // Missing/empty from API = unrestricted workspace → show full catalog checked.
  return [...catalogKeys];
}

export function TenantFeaturesPanel({ tenant }: TenantFeaturesPanelProps) {
  const updateFeatures = useUpdateTenantFeatures(tenant.id);

  const productModulesQuery = useQuery({
    queryKey: ['superadmin', 'tenants', 'product-modules'],
    queryFn: () => tenantService.listProductModules(),
    staleTime: 60_000,
  });

  const moduleOptions = useMemo(() => {
    const fromApi = productModulesQuery.data ?? [];
    if (!fromApi.length) return FALLBACK_OPTIONS;
    const map = new Map<string, ModuleOption>();
    for (const row of FALLBACK_OPTIONS) map.set(row.key, row);
    for (const row of fromApi) {
      const key = row.key.trim();
      if (!key) continue;
      map.set(key, { key, label: row.label?.trim() || key });
    }
    // Prefer static label order, then any API-only keys.
    const preferred = FALLBACK_OPTIONS.map((m) => map.get(m.key)!).filter(Boolean);
    const extras = [...map.values()].filter(
      (m) => !FALLBACK_OPTIONS.some((f) => f.key === m.key),
    );
    return [...preferred, ...extras];
  }, [productModulesQuery.data]);

  const catalogKeys = useMemo(
    () => new Set(moduleOptions.map((m) => m.key)),
    [moduleOptions],
  );

  const validKeys = useMemo(() => {
    const set = new Set<string>(TENANT_ENABLED_MODULE_KEYS);
    for (const key of catalogKeys) set.add(key);
    return set;
  }, [catalogKeys]);

  const unknownModules = useMemo(
    () => (tenant.enabled_modules ?? []).filter((key) => !catalogKeys.has(key)),
    [tenant.enabled_modules, catalogKeys],
  );

  const [selected, setSelected] = useState<string[]>(() =>
    defaultSelectedModules(tenant, new Set(FALLBACK_OPTIONS.map((m) => m.key))),
  );
  const [bridge, setBridge] = useState(Boolean(tenant.quote_requests_bridge));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelected(defaultSelectedModules(tenant, catalogKeys));
    setBridge(Boolean(tenant.quote_requests_bridge));
  }, [tenant.id, tenant.enabled_modules, tenant.quote_requests_bridge, catalogKeys]);

  const allCatalogSelected =
    moduleOptions.length > 0 && moduleOptions.every((m) => selected.includes(m.key));

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const save = async () => {
    setError(null);
    setMessage(null);
    const enabled_modules = selected.filter((key) => validKeys.has(key));
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
        'Features saved. Permission matrix, role presets, and reports filter to these modules. Ask tenant users to sign in again so JWT picks up the change. Run Sync permissions after enabling Shipments so roles receive shipments.view / create / update / generate.',
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
            Checked modules are the allow-list sent as{' '}
            <code className="text-[10px]">enabled_modules</code> (
            <code className="text-[10px]">PATCH /tenants/:id/features</code>). Catalog from{' '}
            <code className="text-[10px]">GET /tenants/product-modules</code> when available —
            includes <strong>shipments</strong>. After enabling, use Sync permissions so JWT keys
            (shipments.view / create / update / generate) are seeded.
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
            onClick={() => setSelected(moduleOptions.map((m) => m.key))}
          >
            {allCatalogSelected ? 'All selected' : 'Select all'}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {moduleOptions.map((mod) => (
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
        {tenant.available_modules?.length ? (
          <p className="text-xs text-[var(--color-neutral-500)]">
            API available_modules: {tenant.available_modules.join(', ')}.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
