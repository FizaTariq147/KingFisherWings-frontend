import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PortalApiError } from '@/lib/portalApiClient';
import { PortalPageHeader, PortalPanel } from '@/features/portal-auth/components/portal-ui';
import { usePortalShipmentLookup } from '../hooks/usePortalShipments';

export default function PortalTrackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ref, setRef] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lookup = usePortalShipmentLookup();

  useEffect(() => {
    const preset = (location.state as { ref?: string } | null)?.ref?.trim();
    if (preset) setRef(preset);
  }, [location.state]);

  const validateRef = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return 'Reference is required.';
    if (trimmed.length < 2) return 'Enter at least 2 characters.';
    if (trimmed.length > 100) return 'Reference is too long.';
    return null;
  };

  const runLookup = async () => {
    setError(null);
    const validation = validateRef(ref);
    setFieldError(validation);
    if (validation) return;

    try {
      const result = await lookup.mutateAsync(ref.trim());
      if (!result) {
        setError('No shipment found for that reference.');
        return;
      }
      navigate(`/portal/shipments/${result.id}`);
    } catch (err) {
      setError(
        err instanceof PortalApiError || err instanceof Error ? err.message : 'Lookup failed.',
      );
    }
  };

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
            placeholder="e.g. KFW-J-00042"
            error={fieldError ?? undefined}
            hint="At least 2 characters"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={lookup.isPending || ref.trim().length < 2}
          >
            {lookup.isPending ? 'Searching…' : 'Track shipment'}
          </Button>
        </form>
      </PortalPanel>
    </div>
  );
}
