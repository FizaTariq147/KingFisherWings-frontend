import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePublicTrackEmbed } from '../hooks/usePublicTrack';
import { PublicTrackTimeline } from '../components/PublicTrackTimeline';
import { publicTrackService } from '../services/publicTrack.service';
import type { PublicTrackResult } from '../types/publicTrack.types';
import {
  resolveRefFromLocation,
  resolveTenantSlugFromLocation,
} from '../utils/publicTrackContext';
import { isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { toTrackResult } from '../utils/toTrackResult';

/**
 * Public Track & Trace — search + result panel (no map background).
 */
export default function PublicTrackPage() {
  const [searchParams] = useSearchParams();
  const initialTenant = useMemo(
    () => resolveTenantSlugFromLocation(searchParams.toString()),
    [searchParams],
  );
  const initialRef = useMemo(() => resolveRefFromLocation(searchParams.toString()), [searchParams]);

  const [ref, setRef] = useState(initialRef);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackResult | null>(null);
  const [pending, setPending] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  const embed = usePublicTrackEmbed(initialTenant || undefined);

  const branding = embed.data;
  const resolvedTenant = branding?.tenantSlug || initialTenant || undefined;
  const title = branding?.companyName ? `Track with ${branding.companyName}` : 'Find your shipment';
  const canSearch = ref.trim().length >= 2;

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const runLookup = async () => {
    setError(null);
    setPending(true);
    try {
      const raw = await publicTrackService.trackRaw(resolvedTenant, ref.trim());
      setResult(toTrackResult(raw, ref.trim()));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    if (autoRan || initialRef.trim().length < 2) return;
    setAutoRan(true);
    void runLookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-run once when URL ref is present
  }, [autoRan, initialRef]);

  return (
    <div
      className="min-h-[100dvh] w-full bg-[linear-gradient(180deg,#F4F7FB_0%,#EEF2F7_100%)]"
      style={
        branding?.primaryColor
          ? { ['--color-primary' as string]: branding.primaryColor }
          : undefined
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10">
        {!result ? (
          <div className="rounded-2xl border border-[#D8DEE6] bg-white p-5 shadow-sm sm:p-6">
            {branding?.logoUrl && isSafeHttpUrl(branding.logoUrl) ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName ?? 'Company logo'}
                className="mb-3 h-9 w-auto object-contain"
              />
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Track &amp; Trace
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#0A2942] sm:text-2xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Search by job, shipment, container, BL, or AWB.
            </p>

            <div className="mt-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-100,#DBEAFE)] text-[var(--color-primary,#2563EB)]">
                <Search size={18} aria-hidden="true" />
              </div>
              {embed.isError ? (
                <p className="mb-3 text-xs text-neutral-500">
                  Using default branding — workspace could not be resolved from this domain.
                </p>
              ) : null}
              {error ? (
                <p
                  role="alert"
                  className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}
              <form
                className="space-y-3"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  void runLookup();
                }}
              >
                <Input
                  label="Reference"
                  required
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="Job / shipment / container / BL / AWB"
                  hint="Enter the exact reference (e.g. MSCU1000001)"
                />
                <Button type="submit" className="w-full" disabled={pending || !canSearch}>
                  {pending ? 'Searching…' : 'Track'}
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <PublicTrackTimeline
            variant="panel"
            className="overflow-hidden rounded-2xl border border-[#D8DEE6] shadow-sm"
            result={result}
            pdfSource={{
              kind: 'public',
              ref: result.reference || ref.trim(),
              tenantSlug: resolvedTenant,
            }}
            onNewSearch={() => {
              clearResult();
              setRef('');
            }}
          />
        )}
      </div>
    </div>
  );
}
