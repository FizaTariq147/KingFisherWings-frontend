import { useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usePublicTrackLookup } from '../hooks/usePublicTrack';
import type { PublicTrackResult } from '../types/publicTrack.types';

export default function PublicTrackPage() {
  const [tenantSlug, setTenantSlug] = useState('');
  const [ref, setRef] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublicTrackResult | null>(null);
  const lookup = usePublicTrackLookup();

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-neutral-500)]">
          Track &amp; Trace
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
          Find your shipment
        </h2>
        <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
          Enter your forwarder workspace and shipment reference.
        </p>

        <div className="mt-8 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 sm:p-6">
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
          <div className="space-y-4">
            <Input
              label="Workspace (tenant slug)"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              placeholder="e.g. kingfisher"
            />
            <Input
              label="Reference"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="e.g. KFW-J-00042"
            />
            <Button
              type="button"
              className="w-full"
              disabled={lookup.isPending || tenantSlug.trim().length < 2 || ref.trim().length < 2}
              onClick={async () => {
                setError(null);
                setResult(null);
                try {
                  const data = await lookup.mutateAsync({
                    tenantSlug: tenantSlug.trim(),
                    ref: ref.trim(),
                  });
                  setResult(data);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Lookup failed.');
                }
              }}
            >
              {lookup.isPending ? 'Searching…' : 'Track shipment'}
            </Button>
          </div>
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
