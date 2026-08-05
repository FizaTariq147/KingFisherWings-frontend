import { Card } from '@/components/ui/Card';
import { usePortalAuthStore } from '../store/portalAuthStore';

export default function PortalAccountPage() {
  const user = usePortalAuthStore((s) => s.user);

  return (
    <Card className="p-6">
      <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">
        Account
      </h1>
      <p className="mt-2 text-sm text-[var(--color-neutral-400)]">
        Signed in as <span className="font-medium text-[var(--color-neutral-800)]">{user?.email || '—'}</span>.
      </p>
    </Card>
  );
}

