import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { ApiDataView } from '@/features/jobs/components/ApiDataView';
import { usePortalTrackByReference } from '../hooks/usePortalShipments';
import type { PortalTrackByRefResult } from '../types/portalShipments.types';

export default function PortalTrackPage() {
  const location = useLocation();
  const [ref, setRef] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PortalTrackByRefResult | null>(null);
  const track = usePortalTrackByReference();
  const autoRanFor = useRef<string | null>(null);

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
    setResult(null);
    const validation = validateRef(next);
    setFieldError(validation);
    if (validation) return;

    try {
      const data = await track.mutateAsync(next);
      setResult(data);
    } catch (err) {
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
    <div className="mx-auto max-w-3xl space-y-5">
      <PortalPageHeader
        title="Track & Trace"
        description="Enter a job, shipment, or quotation number to see status and full history on this page."
      />

      <PortalPanel padded>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary)]">
          <Search size={20} aria-hidden="true" />
        </div>
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
          <Input
            label="Reference"
            required
            value={ref}
            onChange={(e) => {
              setRef(e.target.value);
              if (fieldError) setFieldError(validateRef(e.target.value));
            }}
            onBlur={() => setFieldError(validateRef(ref))}
            placeholder="Job, shipment, HBL/HAWB, booking, or quotation no."
            error={fieldError ?? undefined}
            hint="At least 2 characters — results stay on this page"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={track.isPending || ref.trim().length < 2}
          >
            {track.isPending ? 'Searching…' : 'Track'}
          </Button>
        </form>
      </PortalPanel>

      {result ? (
        <PortalPanel padded>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
                {result.kind === 'quotation' ? 'Quotation' : 'Shipment track & trace'}
              </p>
              <p className="text-lg font-semibold text-[var(--color-neutral-900)]">
                {result.reference}
              </p>
            </div>
          </div>
          <ApiDataView
            data={result.data ?? {}}
            emptyLabel="No tracking data returned."
          />
        </PortalPanel>
      ) : null}
    </div>
  );
}
