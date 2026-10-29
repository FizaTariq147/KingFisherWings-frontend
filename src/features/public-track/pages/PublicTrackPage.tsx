import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiDataView } from '@/features/jobs/components/ApiDataView';
import { usePublicTrackEmbed } from '../hooks/usePublicTrack';
import { publicTrackService } from '../services/publicTrack.service';
import type { PublicTrackResult } from '../types/publicTrack.types';
import {
  rememberPublicTrackTenantSlug,
  resolveRefFromLocation,
  resolveTenantSlugFromLocation,
} from '../utils/publicTrackContext';
import { isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { normalizePublicTrack } from '../utils/normalizePublicTrack';

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
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [pending, setPending] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  const embed = usePublicTrackEmbed(tenantSlug || undefined);

  const branding = embed.data;
  const resolvedTenant = branding?.tenantSlug || tenantSlug.trim();
  const showTenantField = !branding?.tenantSlug;
  const title = branding?.companyName ? `Track with ${branding.companyName}` : 'Find your shipment';
  const canSearch = ref.trim().length >= 2;

  const runLookup = async () => {
    setError(null);
    setResult(null);
    setRawPayload(null);
    const slug = (resolvedTenant || tenantSlug).trim();
    if (!slug) {
      setError('Enter your workspace (tenant slug) to look up a shipment.');
      return;
    }
    rememberPublicTrackTenantSlug(slug);
    setPending(true);
    try {
      const raw = await publicTrackService.trackRaw(slug, ref.trim());
      setRawPayload(raw);
      setResult(normalizePublicTrack(raw));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setPending(false);
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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {branding?.logoUrl && isSafeHttpUrl(branding.logoUrl) ? (
          <img
            src={branding.logoUrl}
            alt={branding.companyName ?? 'Company logo'}
            className="mb-4 h-10 w-auto object-contain"
          />
        ) : null}
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
          Track &amp; Trace
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Enter a job, shipment, HAWB, MAWB, HBL, MBL, booking, or container number — results stay
          on this page.
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
                label="Username"
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
            <Button type="submit" className="w-full" disabled={pending || !canSearch}>
              {pending ? 'Searching…' : 'Track'}
            </Button>
          </form>
        </div>

        {(result || rawPayload) && (
          <div className="mt-6 space-y-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5">
            {result ? (
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{result.reference}</div>
                  <div className="text-sm text-[var(--color-neutral-500)]">
                    {[result.origin, result.destination].filter(Boolean).join(' → ') ||
                      result.jobType ||
                      '—'}
                  </div>
                  {result.partyName ? (
                    <div className="mt-1 text-xs text-[var(--color-neutral-500)]">
                      {result.partyName}
                    </div>
                  ) : null}
                </div>
                {result.status ? (
                  <Badge variant="info">{result.status.replaceAll('_', ' ')}</Badge>
                ) : null}
              </div>
            ) : null}
            <ApiDataView
              data={rawPayload ?? result ?? {}}
              emptyLabel="No tracking data returned."
            />
          </div>
        )}
      </div>
    </div>
  );
}
