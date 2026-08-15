import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePublicTrackEmbed, usePublicTrackLookup } from '../hooks/usePublicTrack';
import type { PublicTrackResult } from '../types/publicTrack.types';
import { resolveRefFromLocation, resolveTenantSlugFromLocation } from '../utils/publicTrackContext';

export default function PublicTrackPage() {
  const [searchParams] = useSearchParams();
  const initialTenant = useMemo(
    () => resolveTenantSlugFromLocation(searchParams.toString()),
    [searchParams],
  );
  const initialRef = useMemo(() => resolveRefFromLocation(searchParams.toString()), [searchParams]);

  const [tenantSlug, setTenantSlug] = useState(initialTenant);
  const [ref, setRef] = useState(initialRef);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackResult | null>(null);
  const [autoRan, setAutoRan] = useState(false);

  const embed = usePublicTrackEmbed(tenantSlug || undefined);
  const lookup = usePublicTrackLookup();

  const branding = embed.data;
  const resolvedTenant = branding?.tenantSlug || tenantSlug.trim();
  const showTenantField = !branding?.tenantSlug;
  const title = branding?.companyName ? `Track with ${branding.companyName}` : 'Find your shipment';
  const canSearch = ref.trim().length >= 2;

  const runLookup = async () => {
    setError(null);
    setResult(null);
    try {
      const data = await lookup.mutateAsync({
        tenantSlug: resolvedTenant || undefined,
        ref: ref.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed.');
    }
  };

  useEffect(() => {
    if (branding?.tenantSlug && !tenantSlug.trim()) {
      setTenantSlug(branding.tenantSlug);
    }
  }, [branding?.tenantSlug, tenantSlug]);

  useEffect(() => {
    if (autoRan || initialRef.trim().length < 2) return;
    setAutoRan(true);
    void runLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-run once when URL ref is present
  }, [autoRan, initialRef]);

  return (
    <div
      className="min-h-screen bg-[var(--color-surface)]"
      style={branding?.primaryColor ? { ['--color-primary' as string]: branding.primaryColor } : undefined}
    >
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        {branding?.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.companyName ?? 'Company logo'}
            className="mb-4 h-10 w-auto object-contain"
          />
        ) : null}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
          Track &amp; Trace
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Enter your shipment reference (job number, HAWB, MAWB, HBL, MBL, or booking #).
        </p>

        <div className="mt-8 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary)]">
            <Search size={20} aria-hidden="true" />
          </div>
          {embed.isError && (
            <p className="mb-4 text-xs text-[var(--color-neutral-500)]">
              Using default branding — workspace could not be resolved from this domain.
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void runLookup();
            }}
          >
            {showTenantField ? (
              <Input
                label="Workspace (tenant slug)"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                placeholder="e.g. kingfisher"
                hint="Optional when opened on your company domain"
              />
            ) : null}
            <Input
              label="Reference"
              required
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. KFW-J-00042"
            />
            <Button type="submit" className="w-full" disabled={lookup.isPending || !canSearch}>
              {lookup.isPending ? 'Searching…' : 'Track shipment'}
            </Button>
          </form>
        </div>

        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{result.reference}</div>
                <div className="text-sm text-[var(--color-neutral-500)]">
                  {[result.origin, result.destination].filter(Boolean).join(' → ') ||
                    result.jobType ||
                    '—'}
                </div>
                {result.partyName ? (
                  <div className="mt-1 text-xs text-[var(--color-neutral-500)]">{result.partyName}</div>
                ) : null}
              </div>
              {result.status ? (
                <Badge variant="info">{result.status.replaceAll('_', ' ')}</Badge>
              ) : null}
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold">Milestones</h2>
              {result.milestones.length === 0 ? (
                <p className="text-sm text-[var(--color-neutral-400)]">No milestones yet.</p>
              ) : (
                <ol className="space-y-3">
                  {result.milestones.map((m) => (
                    <li key={m.id} className="border-l-2 border-[var(--color-secondary)] pl-3">
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="text-xs text-[var(--color-neutral-500)]">
                        {[m.occurredAt, m.location, m.status].filter(Boolean).join(' · ') || '—'}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
