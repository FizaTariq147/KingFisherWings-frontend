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
 * Public Track & Trace — same shell as job Track & Trace tab:
 * white chrome header + map stage with left overlay card.
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
      className="min-h-[100dvh] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-4 sm:px-5 sm:py-6"
      style={
        branding?.primaryColor
          ? { ['--color-primary' as string]: branding.primaryColor }
          : undefined
      }
    >
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden rounded-sm bg-white shadow-[0_10px_30px_rgba(10,41,66,0.06)]">
        {/* Same chrome strip as job Track & Trace tab */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2">
          <div className="flex min-w-0 items-center gap-3">
            {branding?.logoUrl && isSafeHttpUrl(branding.logoUrl) ? (
              <img
                src={branding.logoUrl}
                alt={branding.companyName ?? 'Company logo'}
                className="h-7 w-auto object-contain"
              />
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              Track &amp; Trace
              {branding?.companyName ? (
                <span className="ms-2 font-medium normal-case tracking-normal text-[#64748b]">
                  · {branding.companyName}
                </span>
              ) : null}
            </p>
          </div>
          {result ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                clearResult();
                setRef('');
              }}
            >
              New search
            </Button>
          ) : null}
        </div>

        {/* Same map + left overlay shell as JobTrackTracePanel */}
        <div className="relative h-[min(70vh,640px)] min-h-[560px] overflow-hidden rounded-b-sm bg-[#0B1220]">
          <TrackMapBackground result={result} />

          <div className="absolute inset-y-0 left-0 z-[1] flex w-full max-w-[520px] flex-col p-3 sm:p-4">
            {result ? (
              <PublicTrackTimeline
                variant="overlay"
                className="h-full min-h-0 shadow-2xl"
                result={result}
                pdfSource={{
                  kind: 'public',
                  ref: result.reference || ref.trim(),
                  tenantSlug: resolvedTenant,
                }}
              />
            ) : (
              <div className="w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-100,#DBEAFE)] text-[var(--color-primary,#2563EB)]">
                  <Search size={18} aria-hidden="true" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-[#0A2942]">
                  Find your shipment
                </h1>
                <p className="mt-1 text-sm text-neutral-500">
                  Search by job, shipment, container, BL, or AWB. Route draws on the map when found.
                </p>
                {embed.isError ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    Using default branding — workspace could not be resolved from this domain.
                  </p>
                ) : null}
                {error ? (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {error}
                  </p>
                ) : null}
                <form
                  className="mt-5 space-y-3"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
