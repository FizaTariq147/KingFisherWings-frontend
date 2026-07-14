import type { AwbStockBatch } from '../../types/awbStock.types';
import { AwbStockStatusBadge } from '../AwbStockStatusBadge';

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm border-b border-[var(--color-neutral-100)] last:border-0">
      <dt className="text-[var(--color-neutral-400)]">{label}</dt>
      <dd className="col-span-2 text-[var(--color-neutral-800)] break-words">
        {value == null || value === '' ? '—' : String(value)}
      </dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export function AwbStockOverviewPanel({ batch }: { batch: AwbStockBatch }) {
  return (
    <div className="space-y-6">
      <AwbStockStatusBadge batch={batch} />

      <section>
        <h3 className="text-sm font-semibold mb-2">Basic information</h3>
        <dl>
          <Row label="Airline" value={batch.airline_name || batch.airline_code || batch.airline_id} />
          <Row label="Airline code" value={batch.airline_code} />
          <Row label="Prefix" value={batch.prefix} />
          <Row label="Branch" value={batch.branch_name || batch.branch_id} />
          <Row label="Notes" value={batch.notes} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">AWB range</h3>
        <dl>
          <Row label="Start AWB" value={batch.range_from} />
          <Row label="End AWB" value={batch.range_to} />
          <Row label="Total count" value={batch.total_count} />
          <Row label="Remaining" value={batch.remaining} />
          <Row label="Next number" value={batch.next_number} />
          <Row label="Allocated" value={batch.allocated_count} />
          <Row label="Used" value={batch.used_count} />
          <Row label="Low stock threshold" value={batch.low_stock_threshold} />
        </dl>
      </section>

      <section>
        <h3 className="text-sm font-semibold mb-2">System</h3>
        <dl>
          <Row label="Created" value={formatDate(batch.created_at)} />
          <Row label="Updated" value={formatDate(batch.updated_at)} />
          {batch.deleted_at ? <Row label="Deleted" value={formatDate(batch.deleted_at)} /> : null}
        </dl>
      </section>
    </div>
  );
}
