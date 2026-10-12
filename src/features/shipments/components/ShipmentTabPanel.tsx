import type { ReactNode } from 'react';
import { ErrorState } from '@/components/erp';
import { erpForm } from '@/lib/erpForm';
import { erpTable } from '@/lib/erpTypography';
import { isUuid } from '@/lib/isUuid';
import { isShipmentShowAllTab } from '../api/shipment.api';
import { useShipmentDetailTab, useShipmentShowAll } from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';

function formatKey(key: string): string {
  return key
    .replace(/(_name|_label|_code)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

const HIDDEN_KEYS = new Set([
  'raw',
  'id',
  'shipment_id',
  'tenant_id',
  'company_id',
  'created_by',
  'updated_by',
  'deleted_at',
  'actions',
  'tabs',
  'header',
  'links',
  'sections',
]);

function isIdKey(key: string): boolean {
  const k = key.toLowerCase();
  if (HIDDEN_KEYS.has(k)) return true;
  if (k === 'uuid' || k.endsWith('_uuid')) return true;
  return k === 'id' || k.endsWith('_id');
}

function isUuidish(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return isUuid(value.trim());
}

function displayLabelForKey(key: string, data: Record<string, unknown>): string {
  const base = key.replace(/(_id|_uuid)$/i, '');
  const nameKey = `${base}_name`;
  const labelKey = `${base}_label`;
  const codeKey = `${base}_code`;
  const name = data[nameKey] ?? data[labelKey];
  if (typeof name === 'string' && name.trim() && !isUuidish(name)) {
    const code = data[codeKey];
    if (typeof code === 'string' && code.trim() && !isUuidish(code)) {
      return `${code.trim()} — ${name.trim()}`;
    }
    return name.trim();
  }
  return '';
}

/**
 * Build display entries for Show All / tab grids.
 * Shows every scalar field (empty → —); skips raw UUIDs when a name exists.
 */
function buildDisplayEntries(
  data: Record<string, unknown>,
  opts: { includeEmpty?: boolean } = {},
): Array<[string, string]> {
  const includeEmpty = opts.includeEmpty ?? true;
  const keys = Object.keys(data);
  const skip = new Set<string>();
  const out: Array<[string, string]> = [];

  for (const key of keys) {
    if (skip.has(key)) continue;

    if (isIdKey(key)) {
      if (key.toLowerCase().endsWith('_id')) {
        const label = displayLabelForKey(key, data);
        if (label) {
          const base = key.replace(/_id$/i, '');
          skip.add(`${base}_name`);
          skip.add(`${base}_label`);
          skip.add(`${base}_code`);
          out.push([formatKey(base), label]);
        }
      }
      continue;
    }

    const value = data[key];
    if (typeof value === 'object' && value !== null) continue;

    if (value == null || value === '') {
      if (includeEmpty) out.push([formatKey(key), '—']);
      continue;
    }
    if (typeof value === 'boolean') {
      out.push([formatKey(key), value ? 'Yes' : 'No']);
      continue;
    }
    if (typeof value === 'number') {
      out.push([formatKey(key), String(value)]);
      continue;
    }
    const text = String(value).trim();
    if (isUuidish(text)) continue;
    out.push([formatKey(key), text || '—']);
  }

  return out;
}

function FieldGrid({
  data,
  includeEmpty = true,
}: {
  data: Record<string, unknown>;
  includeEmpty?: boolean;
}) {
  const entries = buildDisplayEntries(data, { includeEmpty });
  if (!entries.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
      {entries.map(([label, value], i) => (
        <div key={`${label}-${i}`}>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">
            {label}
          </dt>
          <dd className="mt-0.5 break-words text-[13px] text-[#0f172a]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ArrayTable({
  rows,
  title,
  showTitle = true,
}: {
  rows: unknown[];
  title: string;
  /** When false, omit inner heading (parent SectionCard already titles the block). */
  showTitle?: boolean;
}) {
  if (!rows.length) {
    return <p className="text-[13px] text-[#64748b]">No {title.toLowerCase()}.</p>;
  }
  const first = asRecord(rows[0]);
  const cols = first
    ? Object.keys(first).filter((k) => {
        if (isIdKey(k)) return false;
        const sample = first[k];
        if (isUuidish(sample)) return false;
        return sample == null || typeof sample !== 'object';
      })
    : [];
  if (!cols.length) {
    return (
      <div>
        {showTitle ? (
          <p className="mb-2 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
            {title}
          </p>
        ) : null}
        <pre className="overflow-x-auto rounded-sm bg-[#f8fafc] p-2 text-[11px] text-[#334155]">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      {showTitle ? (
        <p className="mb-2 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
          {title}
        </p>
      ) : null}
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
                {cols.map((c) => {
                  const raw = r[c];
                  const shown =
                    raw == null || raw === ''
                      ? '—'
                      : typeof raw === 'object' || isUuidish(raw)
                        ? '—'
                        : String(raw);
                  return (
                    <td key={c} className={erpTable.td}>
                      {shown}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={erpForm.section}>
      <div className={erpForm.sectionHeader}>{title}</div>
      <div className={erpForm.sectionBody}>{children}</div>
    </div>
  );
}

function ShipmentShowAllPanel({
  shipmentId,
  siblingTabKeys,
}: {
  shipmentId: string;
  siblingTabKeys: string[];
}) {
  const query = useShipmentShowAll(shipmentId, siblingTabKeys, true);

  if (query.isLoading) {
    return (
      <div className="space-y-1.5 p-3" aria-busy>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded-sm bg-[var(--fresa-action-soft,#E9EEF2)]" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="p-3">
        <ErrorState
          message={getErrorMessage(query.error) || 'Failed to load Show All.'}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const { sections = [], arrays = [] } = query.data ?? {};
  if (!sections.length && !arrays.length) {
    return (
      <p className="p-3 text-center text-[13px] text-[#64748b]">
        No Show All data returned from shipment APIs.
      </p>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {sections.map((section) => (
        <SectionCard key={section.key} title={section.title}>
          <FieldGrid data={section.data} includeEmpty />
        </SectionCard>
      ))}
      {arrays.map((block) => (
        <SectionCard key={block.key} title={block.title}>
          <ArrayTable rows={block.rows} title={block.title} showTitle={false} />
        </SectionCard>
      ))}
    </div>
  );
}

function SingleTabPanel({ shipmentId, tabKey }: { shipmentId: string; tabKey: string }) {
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
  const key = tabKey.toLowerCase().replace(/_/g, '-');

  const containers =
    (Array.isArray(data.containers) && data.containers) ||
    (Array.isArray(data.planned_containers) && data.planned_containers) ||
    (Array.isArray(data.actual_containers) && data.actual_containers) ||
    (Array.isArray(data.items) &&
      (key.includes('container') || key.includes('planned') || key.includes('actual')) &&
      data.items) ||
    null;

  // Prefer a single charges table — backend may return charges, lines, and/or items.
  const isCostingTab = key.includes('cost') || key.includes('charge');
  const charges =
    (Array.isArray(data.charges) && data.charges) ||
    (isCostingTab && Array.isArray(data.lines) && data.lines) ||
    (isCostingTab && Array.isArray(data.items) && data.items) ||
    null;

  const legs =
    (Array.isArray(data.legs) && data.legs) ||
    (Array.isArray(data.routing_legs) && data.routing_legs) ||
    (Array.isArray(data.items) && key.includes('routing') && data.items) ||
    null;

  const root = asRecord(data) ?? {};
  // Strip arrays already rendered as tables from the field grid
  const scalarRoot = { ...root };
  for (const k of Object.keys(scalarRoot)) {
    if (Array.isArray(scalarRoot[k])) delete scalarRoot[k];
  }
  // Avoid repeating charge line scalars when the table already shows them
  if (charges) {
    delete scalarRoot.charge_count;
    delete scalarRoot.charges_count;
    delete scalarRoot.line_count;
    delete scalarRoot.attachment_count;
  }
  const displayEntries = buildDisplayEntries(scalarRoot, { includeEmpty: true });

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
      <FieldGrid data={scalarRoot} includeEmpty />
      {!containers && !charges && !legs && !displayEntries.length ? (
        <p className="text-center text-[13px] text-[#64748b]">No data for this tab.</p>
      ) : null}
    </div>
  );
}

/** Lazy-loaded shipment detail tab — Show All aggregates every related API. */
export function ShipmentTabPanel({
  shipmentId,
  tabKey,
  siblingTabKeys = [],
}: {
  shipmentId: string;
  tabKey: string;
  /** Other tab keys from GET /shipments/:id/detail — used by Show All aggregation. */
  siblingTabKeys?: string[];
}) {
  if (isShipmentShowAllTab(tabKey)) {
    return (
      <ShipmentShowAllPanel shipmentId={shipmentId} siblingTabKeys={siblingTabKeys} />
    );
  }
  return <SingleTabPanel shipmentId={shipmentId} tabKey={tabKey} />;
}
