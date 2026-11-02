import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { PublicTrackTimeline } from '@/features/public-track/components/PublicTrackTimeline';
import { toTrackResult } from '@/features/public-track/utils/toTrackResult';
import { usePortalTrackByReference } from '../hooks/usePortalShipments';
import type { PortalTrackByRefResult } from '../types/portalShipments.types';
import { cn } from '@/lib/utils';

export default function PortalTrackPage() {
  const location = useLocation();
  const [ref, setRef] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PortalTrackByRefResult | null>(null);
  const track = usePortalTrackByReference();
  const autoRanFor = useRef<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateRef = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'Reference is required.';
    if (trimmed.length < 2) return 'Enter at least 2 characters.';
    if (trimmed.length > 100) return 'Reference is too long.';
    return null;
  };

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
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
    <div className="mx-auto max-w-[1100px] space-y-5">
      <PortalPageHeader
        title="Track & Trace"
        description="Search by job, shipment, container, BL, or quotation. Results open below."
      />

      <PortalPanel padded className="!p-5 sm:!p-8">
        <form
          className="space-y-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void runLookup();
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
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
                  'h-11 w-full rounded-full border-0 bg-[#F4F7F9] pl-11 pr-4 text-sm text-[#0A2942] shadow-[0_8px_24px_rgba(10,41,66,0.04)] outline-none placeholder:text-[#9AA8B5] focus:ring-2 focus:ring-[#0A2942]/12',
                  fieldError && 'ring-2 ring-red-300',
                )}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? 'portal-track-ref-error' : undefined}
              />
            </div>
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-full px-7"
              disabled={track.isPending || ref.trim().length < 2}
            >
              {track.isPending ? 'Searching…' : 'Track'}
            </Button>
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
        </form>

        {result ? (
          <div
            ref={resultsRef}
            className="mt-8 border-t border-[#EEF2F6] pt-8"
          >
            <PublicTrackTimeline
              result={toTrackResult(result.data, result.reference)}
              pdfSource={
                result.kind === 'shipment'
                  ? { kind: 'portal', shipmentId: result.id }
                  : { kind: 'public', ref: result.reference }
              }
              onNewSearch={() => {
                setResult(null);
                setError(null);
                setRef('');
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
            />
          </div>
        ) : null}
      </PortalPanel>
    </div>
  );
}
