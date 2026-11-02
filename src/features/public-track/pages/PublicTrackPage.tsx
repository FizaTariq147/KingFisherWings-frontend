import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [autoRan, setAutoRan] = useState(false);

  const embed = usePublicTrackEmbed(initialTenant || undefined);

  const branding = embed.data;
  const resolvedTenant = branding?.tenantSlug || initialTenant || undefined;
  const title = branding?.companyName ? `Track with ${branding.companyName}` : 'Find your shipment';
  const canSearch = ref.trim().length >= 2;

  const closeModal = () => {
    setModalOpen(false);
  };

  const runLookup = async () => {
    setError(null);
    setPending(true);
    try {
      const raw = await publicTrackService.trackRaw(resolvedTenant, ref.trim());
      setResult(toTrackResult(raw, ref.trim()));
      setModalOpen(true);
    } catch (err) {
      setResult(null);
      setModalOpen(false);
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
      className="min-h-screen bg-[var(--color-surface)]"
      style={branding?.primaryColor ? { ['--color-primary' as string]: branding.primaryColor } : undefined}
    >
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
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
          Search by job number, shipment number, container number, BL number, or AWB number.
        </p>

        <div className="mt-8 rounded-xl bg-white p-5 sm:p-6">
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
            <Input
              label="Reference"
              required
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Job / shipment / container / BL / AWB"
              hint="Enter the exact job or shipment number (e.g. KFW-J-00042)"
            />
            <Button type="submit" className="w-full" disabled={pending || !canSearch}>
              {pending ? 'Searching…' : 'Track'}
            </Button>
          </form>
        </div>
      </div>

      <Modal open={modalOpen && Boolean(result)} onClose={closeModal} title="Track & Trace" size="full">
        {result ? (
          <PublicTrackTimeline
            result={result}
            onNewSearch={() => {
              closeModal();
              setResult(null);
              setError(null);
              setRef('');
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
