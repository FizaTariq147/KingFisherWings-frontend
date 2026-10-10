import { ErrorState } from '@/components/erp';
import { erpForm } from '@/lib/erpForm';
import { erpTable } from '@/lib/erpTypography';
import { getErrorMessage } from '../utils/getErrorMessage';
import { useShipmentDetailTab } from '../hooks/useShipments';

function formatKey(key: string): string {
  return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function FieldGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([key, v]) =>
      !['raw', 'id', 'shipment_id'].includes(key) &&
      (v == null || ['string', 'number', 'boolean'].includes(typeof v)),
  );
  if (!entries.length) return null;
  return (
    <dl className={erpForm.grid2}>
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
            {formatKey(key)}
          </dt>
          <dd className="mt-0.5 text-[13px] text-[#0f172a]">
            {value == null || value === '' ? '—' : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ArrayTable({ rows, title }: { rows: unknown[]; title: string }) {
  if (!rows.length) {
    return <p className="text-[13px] text-[#64748b]">No {title.toLowerCase()}.</p>;
  }
  const first = asRecord(rows[0]);
  const cols = first
    ? Object.keys(first).filter((k) => !['id', 'shipment_id', 'raw'].includes(k)).slice(0, 8)
    : [];
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
        {title}
      </p>
      <table className="w-full text-[13px]">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} className={erpTable.th}>
                {formatKey(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const r = asRecord(row) ?? {};
            return (
              <tr key={i} className={erpTable.row}>
                {cols.map((c) => (
                  <td key={c} className={erpTable.td}>
                    {r[c] == null || typeof r[c] === 'object' ? '—' : String(r[c])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Lazy-loaded shipment detail tab — curated Fresa panels with key/value fallback. */
export function ShipmentTabPanel({
  shipmentId,
  tabKey,
}: {
  shipmentId: string;
  tabKey: string;
}) {
  const query = useShipmentDetailTab(shipmentId, tabKey);

  if (query.isLoading) {
    return (
      <div className="space-y-1.5 p-3" aria-busy>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded-sm bg-[var(--fresa-action-soft,#E9EEF2)]" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="p-3">
        <ErrorState
          message={getErrorMessage(query.error) || 'Failed to load tab.'}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const data = query.data ?? {};
  const key = tabKey.toLowerCase();

  const containers =
    (Array.isArray(data.containers) && data.containers) ||
    (Array.isArray(data.planned_containers) && data.planned_containers) ||
    (Array.isArray(data.actual_containers) && data.actual_containers) ||
    (Array.isArray(data.items) &&
      (key.includes('container') || key.includes('planned') || key.includes('actual')) &&
      data.items) ||
    null;

  const charges =
    (Array.isArray(data.charges) && data.charges) ||
    (Array.isArray(data.lines) && key.includes('cost') && data.lines) ||
    null;

  const legs =
    (Array.isArray(data.legs) && data.legs) ||
    (Array.isArray(data.routing_legs) && data.routing_legs) ||
    (Array.isArray(data.items) && key.includes('routing') && data.items) ||
    null;

  const root = asRecord(data) ?? {};

  return (
    <div className="space-y-3 p-3">
      {containers ? (
        <ArrayTable
          rows={containers}
          title={key.includes('actual') ? 'Actual containers' : 'Planned containers'}
        />
      ) : null}
      {charges ? <ArrayTable rows={charges} title="Costing / charges" /> : null}
      {legs ? <ArrayTable rows={legs} title="Routing legs" /> : null}
      <FieldGrid data={root} />
      {!containers &&
      !charges &&
      !legs &&
      !Object.keys(root).some(
        (k) =>
          root[k] == null || ['string', 'number', 'boolean'].includes(typeof root[k]),
      ) ? (
        <p className="text-center text-[13px] text-[#64748b]">No data for this tab.</p>
      ) : null}
    </div>
  );
}
