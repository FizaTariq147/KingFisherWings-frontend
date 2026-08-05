import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuthStore } from '../store/portalAuthStore';
import { portalAuthService } from '../services/portalAuth.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Package } from 'lucide-react';

export default function PortalHomePage() {
  const navigate = useNavigate();
  const user = usePortalAuthStore((s) => s.user);
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const setUser = usePortalAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(accessToken) && !user);

  const firstName = useMemo(() => {
    const full = user?.fullName || '';
    const parts = full.split(' ').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[0];
    const email = user?.email || '';
    if (email.includes('@')) return email.split('@')[0];
    return 'Guest';
  }, [user?.fullName, user?.email]);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const me = await portalAuthService.me();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load profile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, setUser]);

  if (loading && accessToken && !user) {
    return <p className="text-sm text-[var(--color-neutral-500)]">Loading profile…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[var(--color-neutral-900)]">
          Welcome, {firstName}
        </h1>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Everything about your logistics in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="text-xs font-semibold text-[var(--color-primary)]">Need To Ship?</div>
          <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Start a new shipment booking from the portal.
          </p>
          <div className="mt-4">
            <Button type="button" className="w-full" onClick={() => navigate('/portal/book')}>
              Book Shipment
              <ArrowRight size={16} className="ml-1" aria-hidden="true" />
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs font-semibold text-[var(--color-primary)]">Track a Shipment</div>
          <p className="mt-2 text-sm text-[var(--color-neutral-500)]">
            Look up status and milestones for your consignments.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/portal/track')}
            >
              Go to Track
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-semibold text-[var(--color-neutral-900)]">Recent Shipments</div>
          <div className="text-xs text-[var(--color-neutral-400)]">Your latest activity</div>
        </div>

        <Card className="p-8">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
              <Package size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-[var(--color-neutral-800)]">No shipments yet</p>
            <p className="text-xs text-[var(--color-neutral-500)] max-w-sm">
              Shipments and quotations will appear here once portal data APIs are connected.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
