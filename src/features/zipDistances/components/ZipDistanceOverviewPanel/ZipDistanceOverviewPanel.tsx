import type { ZipDistance } from '../../types/zipDistance.types';
import { ZipDistanceStatusBadge } from '../ZipDistanceStatusBadge';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm border-b border-[var(--color-neutral-100)] last:border-0">
      <dt className="text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="col-span-2 text-[var(--color-neutral-800)]">{value ?? '—'}</dd>
    </div>
  );
}

export function ZipDistanceOverviewPanel({ item }: { item: ZipDistance }) {
  return (
    <div className="space-y-6">
      <ZipDistanceStatusBadge item={item} />
      <section>
        <h3 className="text-sm font-semibold mb-2">Origin</h3>
        <dl>
          <Row label="ZIP" value={item.from_zip} />
          <Row label="City" value={item.from_city} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Destination</h3>
        <dl>
          <Row label="ZIP" value={item.to_zip} />
          <Row label="City" value={item.to_city} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Distance</h3>
        <dl>
          <Row label="Value" value={item.distance} />
          <Row label="Unit" value={item.unit} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">System</h3>
        <dl>
          <Row label="Created" value={item.created_at} />
          <Row label="Updated" value={item.updated_at} />
        </dl>
      </section>
    </div>
  );
}
