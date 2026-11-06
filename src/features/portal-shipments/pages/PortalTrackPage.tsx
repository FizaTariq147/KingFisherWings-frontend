import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader } from '@/features/portal-auth/components/portal-ui';
import { PublicTrackTimeline } from '@/features/public-track/components/PublicTrackTimeline';
import { TrackMapBackground } from '@/features/public-track/components/TrackMapBackground';
import { toTrackResult } from '@/features/public-track/utils/toTrackResult';
import { usePortalTrackByReference } from '../hooks/usePortalShipments';
import type { PortalTrackByRefResult } from '../types/portalShipments.types';
import { cn } from '@/lib/utils';

/**
 * Portal Track & Trace — same map + left overlay shell as job Track & Trace tab.
 */
export default function PortalTrackPage() {
  const location = useLocation();
  const [ref, setRef] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PortalTrackByRefResult | null>(null);
  const track = usePortalTrackByReference();
  const autoRanFor = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateRef = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'Reference is required.';
    if (trimmed.length < 2) return 'Enter at least 2 characters.';
    if (trimmed.length > 100) return 'Reference is too long.';
    return null;
  };

  const trackResult = result ? toTrackResult(result.data, result.reference) : null;

  const runLookup = async (value?: string) => {
    const next = (value ?? ref).trim();
    setError(null);
    const validation = validateRef(next);
    setFieldError(validation);
    if (validation) {
      setResult(null);
      return;
    }

    try {
      const data = await track.mutateAsync(next);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof PortalApiError || err instanceof Error
          ? err.message
          : 'Lookup failed.',
      );
    }
  };

  useEffect(() => {
    const preset = (location.state as { ref?: string } | null)?.ref?.trim();
    if (!preset || preset.length < 2) return;
    setRef(preset);
    if (autoRanFor.current === preset) return;
    autoRanFor.current = preset;
    void runLookup(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- auto-run once per preset ref
  }, [location.state]);

  return (
    <div className="space-y-4">
      <PortalPageHeader
        title="Track & Trace"
        description="Search by job, shipment, container, BL, or quotation."
      />

      <div className="overflow-hidden rounded-sm bg-white shadow-[0_10px_30px_rgba(10,41,66,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
            Track &amp; Trace
          </p>
          {result ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setResult(null);
                setError(null);
                setRef('');
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            >
              New search
            </Button>
          ) : null}
        </div>

        <div className="relative h-[min(70vh,640px)] min-h-[560px] overflow-hidden rounded-b-sm bg-[#0B1220]">
          <TrackMapBackground result={trackResult} />

          <div className="absolute inset-y-0 left-0 z-[1] flex w-full max-w-[520px] flex-col p-3 sm:p-4">
            {result && trackResult ? (
              <PublicTrackTimeline
                variant="overlay"
                className="h-full min-h-0 shadow-2xl"
                result={trackResult}
                pdfSource={
                  result.kind === 'shipment'
                    ? { kind: 'portal', shipmentId: result.id }
                    : { kind: 'public', ref: result.reference }
                }
              />
            ) : (
              <div className="w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
                  <Search size={18} aria-hidden />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-[#0A2942]">
                  Find your shipment
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Enter a reference to open tracking over the map.
                </p>
                <form
                  className="mt-5 space-y-3"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    void runLookup();
                  }}
                >
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA8B5]"
                      aria-hidden
                    />
                    <input
                      ref={inputRef}
                      value={ref}
                      onChange={(e) => {
                        setRef(e.target.value);
                        if (fieldError) setFieldError(validateRef(e.target.value));
                      }}
                      onBlur={() => setFieldError(validateRef(ref))}
                      placeholder="Search shipments, quotes, invoices…"
                      className={cn(
                        'h-11 w-full rounded-full border-0 bg-[#F4F7F9] pl-11 pr-4 text-sm text-[#0A2942] outline-none placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-[#0A2942]/12',
                        fieldError && 'ring-2 ring-red-300',
                      )}
                      aria-invalid={Boolean(fieldError)}
                      aria-describedby={fieldError ? 'portal-track-ref-error' : undefined}
                    />
                  </div>
                  {fieldError ? (
                    <p id="portal-track-ref-error" className="text-xs text-red-600">
                      {fieldError}
                    </p>
                  ) : null}
                  {error ? (
                    <p
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    className="h-11 w-full"
                    disabled={track.isPending || ref.trim().length < 2}
                  >
                    {track.isPending ? 'Searching…' : 'Track'}
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
