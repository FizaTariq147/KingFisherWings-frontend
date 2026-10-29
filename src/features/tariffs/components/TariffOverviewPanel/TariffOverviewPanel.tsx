import { isUuid } from '@/lib/isUuid';
import { TARIFF_SERVICE_TYPE_LABELS } from '../../constants/tariff.constants';
import type { Tariff } from '../../types/tariff.types';
import { TariffStatusBadge } from '../TariffStatusBadge';

function displayName(name?: string | null, idOrCode?: string | null): string | undefined {
  const n = String(name ?? '').trim();
  if (n && !isUuid(n)) return n;
  const fallback = String(idOrCode ?? '').trim();
  if (fallback && !isUuid(fallback)) return fallback;
  return undefined;
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm border-b border-[var(--color-neutral-100)] last:border-0">
      <dt className="text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="col-span-2 text-[var(--color-neutral-800)]">{value ?? '—'}</dd>
    </div>
  );
}

export function TariffOverviewPanel({ tariff: t }: { tariff: Tariff }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TariffStatusBadge tariff={t} />
      </div>
      <section>
        <h3 className="text-sm font-semibold mb-2">Basic information</h3>
        <dl>
          <Row
            label="Service type"
            value={TARIFF_SERVICE_TYPE_LABELS[t.service_type] ?? t.service_type}
          />
          <Row label="Charge" value={displayName(t.charge_name, t.charge_code) || displayName(undefined, t.charge_code_id)} />
          <Row label="Customer" value={displayName(t.customer_name, t.customer_id) || 'All customers'} />
          <Row label="Unit" value={t.unit} />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Location</h3>
        <dl>
          <Row
            label="Origin"
            value={
              displayName(t.origin_port_name, t.origin_port_code) ||
              displayName(undefined, t.origin_port_id)
            }
          />
          <Row
            label="Destination"
            value={
              displayName(t.dest_port_name, t.dest_port_code) ||
              displayName(undefined, t.dest_port_id)
            }
          />
          <Row
            label="Container type"
            value={displayName(undefined, t.container_type_code) || displayName(undefined, t.container_type_id)}
          />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Pricing</h3>
        <dl>
          <Row label="Currency" value={t.currency_code} />
          <Row label="Sale rate" value={t.sale_rate} />
          <Row label="Cost rate" value={t.cost_rate} />
          <Row
            label="Margin"
            value={(t.sale_rate - t.cost_rate).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          />
        </dl>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Validity</h3>
        <dl>
          <Row label="Valid from" value={t.valid_from} />
          <Row label="Valid to" value={t.valid_to} />
          <Row label="Remarks" value={t.remarks} />
        </dl>
      </section>
    </div>
  );
}
