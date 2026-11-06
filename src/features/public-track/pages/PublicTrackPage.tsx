import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePublicTrackEmbed } from '../hooks/usePublicTrack';
import { PublicTrackTimeline } from '../components/PublicTrackTimeline';
import { TrackMapBackground } from '../components/TrackMapBackground';
import { publicTrackService } from '../services/publicTrack.service';
import type { PublicTrackResult } from '../types/publicTrack.types';
import {
  resolveRefFromLocation,
  resolveTenantSlugFromLocation,
} from '../utils/publicTrackContext';
import { isSafeHttpUrl } from '@/lib/safeHttpUrl';
import { toTrackResult } from '../utils/toTrackResult';

/**
 * Public Track & Trace — full-bleed map background with floating search / result card.
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
  const [mapDark, setMapDark] = useState(false);

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
      className="relative h-[100dvh] w-full overflow-hidden bg-[#0B1220]"
      style={
        branding?.primaryColor
          ? { ['--color-primary' as string]: branding.primaryColor }
          : undefined
      }
    >
      <TrackMapBackground result={result} dark={mapDark} />

      {/* Map chrome */}
      <div className="pointer-events-none absolute inset-0 z-[500]">
        <button
          type="button"
          className="pointer-events-auto absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-[#0A2942] shadow-md backdrop-blur"
          onClick={() => setMapDark((v) => !v)}
        >
          {mapDark ? 'Light map' : 'Dark map'}
        </button>
      </div>

      {/* Left floating panel */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[600] flex w-full max-w-[440px] flex-col p-3 sm:max-w-[480px] sm:p-4 lg:max-w-[520px]">
        {!result ? (
          <div className="pointer-events-auto mt-[12vh] w-full rounded-2xl bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-6">
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
              Search by job, shipment, container, BL, or AWB. Route draws on the map when found.
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
          <div className="pointer-events-auto flex min-h-0 flex-1 flex-col">
            <PublicTrackTimeline
              variant="overlay"
              className="min-h-0 flex-1"
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
          </div>
        )}
      </div>

      <p className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[10px] text-white/90 backdrop-blur sm:left-auto sm:right-16 sm:translate-x-0">
        Map route is approximate from POL / POD · not live AIS
      </p>
    </div>
  );
}
