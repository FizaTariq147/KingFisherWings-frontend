import { Card } from '@/components/ui/Card';

export default function PortalShipmentsPage() {
  return (
    <Card className="p-6">
      <h1 className="text-lg font-semibold text-[var(--color-neutral-800)]">
        Shipments
      </h1>
      <p className="mt-2 text-sm text-[var(--color-neutral-400)]">
        Coming soon — shipment timeline and document links will be added when portal-scoped APIs are available.
      </p>
    </Card>
  );
}

