import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { usePortalShipmentLookup } from '../hooks/usePortalShipments';

export default function PortalTrackPage() {
  const navigate = useNavigate();
  const [ref, setRef] = useState('');
  const [error, setError] = useState<string | null>(null);
  const lookup = usePortalShipmentLookup();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PortalPageHeader
        title="Track"
        description="Enter a job or document reference to open the matching shipment."
      />

      <PortalPanel padded>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary)]">
          <Search size={20} aria-hidden="true" />
        </div>
        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="space-y-4">
          <Input
            label="Reference"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. KFW-J-00042"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ref.trim().length >= 2 && !lookup.isPending) {
                e.currentTarget.form?.requestSubmit?.();
              }
            }}
          />
          <Button
            type="button"
            className="w-full"
            disabled={lookup.isPending || ref.trim().length < 2}
            onClick={async () => {
              setError(null);
              try {
                const result = await lookup.mutateAsync(ref.trim());
                if (!result) {
                  setError('No shipment found for that reference.');
                  return;
                }
                navigate(`/portal/shipments/${result.id}`);
              } catch (err) {
                setError(
                  err instanceof PortalApiError || err instanceof Error
                    ? err.message
                    : 'Lookup failed.',
                );
              }
            }}
          >
            {lookup.isPending ? 'Searching…' : 'Track shipment'}
          </Button>
        </div>
      </PortalPanel>
    </div>
  );
}
