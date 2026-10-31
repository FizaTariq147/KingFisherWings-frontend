import { useState, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { ErrorState } from '@/components/erp';
import { Button } from '@/components/ui/Button';
import { erpForm } from '@/lib/erpForm';
import { erpTable } from '@/lib/erpTypography';
import { JobContainersPanel } from '@/features/jobs/components/JobContainersPanel';
import { isUuid } from '@/lib/isUuid';
import { ShowAllEditModal } from '@/features/shared/show-all/ShowAllEditModal';
import { mergeShowAllSavedOverlay } from '@/features/shared/show-all/extractPatchShowAllDefaults';
import type { PatchShowAllDto } from '@/features/jobs/types/job.types';
import { isShipmentShowAllTab } from '../api/shipment.api';
import {
  usePatchShipmentShowAll,
  useShipment,
  useShipmentDetailTab,
  useShipmentShowAll,
} from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';
import { isShipmentCostingTab } from '../utils/normalizeShipmentCharges';
import { EntitySectionFilesPanel } from '@/features/shared/section-attachments';
import { ShipmentChargesPanel } from './ShipmentChargesPanel';
import { ShipmentCustomsRefsPanel } from './ShipmentCustomsRefsPanel';
import { ShipmentDepartmentPanel } from './ShipmentDepartmentPanel';
import { ShipmentDimensionsPanel } from './ShipmentDimensionsPanel';
import { ShipmentExchangeRatesPanel } from './ShipmentExchangeRatesPanel';
import { ShipmentPartyPanel } from './ShipmentPartyPanel';
import { ShipmentRoutingLegsPanel } from './ShipmentRoutingLegsPanel';

function formatKey(key: string): string {
  const norm = key
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-.\s]+/g, '_')
    .replace(/(_id|_uuid|_name|_label|_code)$/i, '');
  if (norm === 'organization' || norm === 'organisation') return 'Party';
  if (norm === 'information' || norm === 'info') return 'Info';
  return norm
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
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
  // Backend stub metadata — not for end-user display
  'path_hints',
  'pathhints',
  'hints',
  'path_hint',
]);

function isUuidish(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return isUuid(value.trim());
}

function formatScalar(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (isUuid(value.trim())) return '—';
    return value;
  }
  return '—';
}

function nestedEntityLabel(value: unknown): string {
  const row = asRecord(value);
  if (!row) return '';
  const code = readableScalar(row.code ?? row.un_locode ?? row.unLocode);
  const name = readableScalar(
    row.name ?? row.display_name ?? row.displayName ?? row.full_name ?? row.fullName,
  );
  if (code && name) return `${code} — ${name}`;
  return name || code || '';
}

/** Surface non-UUID strings from API catalog rows (org/party types) — never invent labels. */
function catalogRowLabel(row: Record<string, unknown>): string {
  const preferred = nestedEntityLabel(row);
  if (preferred) return preferred;
  for (const key of Object.keys(row)) {
    const lower = key.toLowerCase();
    if (lower === 'id' || lower.endsWith('_id') || lower.endsWith('_uuid')) continue;
    const v = row[key];
    if (typeof v === 'string' && v.trim() && !isUuidish(v)) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function readableScalar(value: unknown): string {
  if (typeof value !== 'string') return '';
  const t = value.trim();
  if (!t || isUuidish(t)) return '';
  return t;
}

function siblingNameLabel(key: string, data: Record<string, unknown>): string {
  const base = key.replace(/(_id|_uuid)$/i, '');
  const name = data[`${base}_name`] ?? data[`${base}_label`];
  if (typeof name === 'string' && name.trim() && !isUuidish(name)) {
    const code = data[`${base}_code`];
    if (typeof code === 'string' && code.trim() && !isUuidish(code)) {
      return `${code.trim()} — ${name.trim()}`;
    }
    return name.trim();
  }
  const nested = nestedEntityLabel(data[base]);
  if (nested) return nested;
  return '';
}

function FormFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[#e8edf2] py-2 sm:grid-cols-[minmax(8rem,14rem)_1fr] sm:gap-4">
      <span className="text-[12px] font-medium text-[#64748b]">{label}</span>
      <span className="whitespace-pre-wrap break-words text-[13px] font-medium text-[#0f172a]">
        {value}
      </span>
    </div>
  );
}

function ArrayTable({
  rows,
  title,
  showTitle = true,
}: {
  rows: unknown[];
  title: string;
  showTitle?: boolean;
}) {
  if (!rows.length) {
    return <p className="text-[13px] text-[#64748b]">No {title.toLowerCase()}.</p>;
  }

  const first = asRecord(rows[0]);
  const cols = first
    ? Object.keys(first).filter((k) => {
        const lower = k.toLowerCase();
        if (HIDDEN_KEYS.has(lower) || lower === 'id' || lower.endsWith('_id') || lower.endsWith('_uuid')) {
          return false;
        }
        const sample = first[k];
        if (isUuidish(sample)) return false;
        return sample == null || typeof sample !== 'object';
      })
    : [];

  if (!cols.length) {
    const labels = rows.map((row) => {
      const rec = asRecord(row);
      if (!rec) return '';
      return nestedEntityLabel(rec) || catalogRowLabel(rec);
    });
    const allLabeled = labels.every(Boolean);
    if (allLabeled) {
      return (
        <div className="space-y-2">
          {showTitle ? (
            <p className="text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
              {title}
            </p>
          ) : null}
          <ul className="space-y-1.5">
            {labels.map((label, index) => (
              <li
                key={index}
                className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[13px] font-medium text-[#0f172a]"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (!labels.some(Boolean)) {
      return (
        <p className="text-[13px] text-[#64748b]">
          {rows.length} {title.toLowerCase()} row{rows.length === 1 ? '' : 's'} returned, but only
          ids without names (backend).
        </p>
      );
    }
    return (
      <div className="space-y-2">
        {showTitle ? (
          <p className="text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
            {title}
          </p>
        ) : null}
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              {labels[index] || `${title} · ${index + 1}`}
            </p>
            <FormFieldsFromPayload data={row} depth={1} />
          </div>
        ))}
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
                {cols.map((c) => (
                  <td key={c} className={erpTable.td}>
                    {formatScalar(r[c])}
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

/**
 * Recursively render any shipment API payload as form fields / tables — never raw JSON.
 */
export function FormFieldsFromPayload({
  data,
  depth = 0,
}: {
  data: unknown;
  depth?: number;
}) {
  if (data == null) {
    return <p className="text-[13px] text-[#64748b]">—</p>;
  }

  if (typeof data !== 'object') {
    return <FormFieldRow label="Value" value={formatScalar(data)} />;
  }

  if (Array.isArray(data)) {
    if (!data.length) {
      return <p className="text-[13px] text-[#64748b]">None</p>;
    }
    const allScalar = data.every(
      (item) => item == null || ['string', 'number', 'boolean'].includes(typeof item),
    );
    if (allScalar) {
      return (
        <FormFieldRow
          label="Items"
          value={data.map((item) => formatScalar(item)).join(', ')}
        />
      );
    }
    return <ArrayTable rows={data} title="Items" showTitle={depth === 0} />;
  }

  const rec = data as Record<string, unknown>;
  const keys = Object.keys(rec);
  const skip = new Set<string>();
  const rows: { key: string; label: string; value: string }[] = [];
  const nested: { key: string; label: string; value: unknown }[] = [];
  const arrays: { key: string; label: string; rows: unknown[] }[] = [];

  for (const key of keys) {
    if (skip.has(key) || HIDDEN_KEYS.has(key.toLowerCase())) continue;
    const lower = key.toLowerCase();

    if (lower.endsWith('_id') || lower.endsWith('_uuid')) {
      const named = siblingNameLabel(key, rec);
      if (named) {
        const base = key.replace(/(_id|_uuid)$/i, '');
        skip.add(`${base}_name`);
        skip.add(`${base}_label`);
        skip.add(`${base}_code`);
        rows.push({ key, label: formatKey(base), value: named });
      }
      continue;
    }

    const value = rec[key];
    if (Array.isArray(value)) {
      if (value.length) {
        arrays.push({ key, label: formatKey(key), rows: value });
      }
      continue;
    }

    if (value != null && typeof value === 'object') {
      const entityLabel = nestedEntityLabel(value);
      if (entityLabel) {
        // Backend MasterLabelService nested { id, name, code } — show name, not UUID dump.
        if (keys.includes(`${key}_id`) || keys.includes(`${key}_uuid`)) {
          skip.add(`${key}_id`);
          skip.add(`${key}_uuid`);
          skip.add(`${key}_name`);
          skip.add(`${key}_label`);
          skip.add(`${key}_code`);
        }
        rows.push({ key, label: formatKey(key), value: entityLabel });
        continue;
      }
      nested.push({ key, label: formatKey(key), value });
      continue;
    }

    if (typeof value === 'string' && isUuid(value.trim())) continue;
    if (lower.endsWith('_name') || lower.endsWith('_label') || lower.endsWith('_code')) {
      const base = key.replace(/(_name|_label|_code)$/i, '');
      if (keys.includes(`${base}_id`) || keys.includes(`${base}_uuid`)) continue;
      if (asRecord(rec[base]) && nestedEntityLabel(rec[base])) continue;
    }

    rows.push({ key, label: formatKey(key), value: formatScalar(value) });
  }

  if (!rows.length && !nested.length && !arrays.length) {
    return <p className="text-[13px] text-[#64748b]">No fields</p>;
  }

  return (
    <div className={depth > 0 ? 'space-y-1' : 'space-y-3'}>
      {rows.length ? (
        <div className="space-y-0">
          {rows.map((row) => (
            <FormFieldRow key={row.key} label={row.label} value={row.value} />
          ))}
        </div>
      ) : null}
      {arrays.map((block) => (
        <ArrayTable key={block.key} rows={block.rows} title={block.label} />
      ))}
      {nested.map((block) => (
        <div key={block.key} className="border-b border-[#e8edf2] py-2 last:border-0">
          <p className="mb-1 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
            {block.label}
          </p>
          <div className="pl-0 sm:pl-2">
            <FormFieldsFromPayload data={block.value} depth={depth + 1} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shared renderer for KPI, Track & Trace, and detail/{tab} payloads. */
export function ShipmentApiPayloadView({
  data,
  emptyMessage = 'No data returned.',
}: {
  data: unknown;
  emptyMessage?: string;
}) {
  if (data == null) {
    return <p className="text-[13px] text-[#64748b]">{emptyMessage}</p>;
  }
  if (typeof data === 'object' && !Array.isArray(data) && !Object.keys(data as object).length) {
    return <p className="text-[13px] text-[#64748b]">{emptyMessage}</p>;
  }
  if (Array.isArray(data) && !data.length) {
    return <p className="text-[13px] text-[#64748b]">{emptyMessage}</p>;
  }
  return <FormFieldsFromPayload data={data} />;
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
  footer,
}: {
  shipmentId: string;
  siblingTabKeys: string[];
  /** Rendered after all Show All sections (e.g. Track & Trace). */
  footer?: ReactNode;
}) {
  const query = useShipmentShowAll(shipmentId, siblingTabKeys, true);
  const patchShowAll = usePatchShipmentShowAll(shipmentId);
  const [editOpen, setEditOpen] = useState(false);
  const [savedOverlay, setSavedOverlay] = useState<PatchShowAllDto>({});

  const saveShowAll = async (dto: PatchShowAllDto) => {
    const refreshed = await patchShowAll.mutateAsync(dto);
    setSavedOverlay((prev) => mergeShowAllSavedOverlay(prev, dto, refreshed));
    await query.refetch();
  };

  if (query.isLoading) {
    return (
      <div className="space-y-3 p-3">
        <div className="space-y-1.5" aria-busy>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded-sm bg-[var(--fresa-action-soft,#E9EEF2)]"
            />
          ))}
        </div>
        {footer}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="space-y-3 p-3">
        <ErrorState
          message={getErrorMessage(query.error) || 'Failed to load Show All.'}
          onRetry={() => void query.refetch()}
        />
        {footer}
      </div>
    );
  }

  const { sections = [], arrays = [] } = query.data ?? {};
  const editModal = (
    <ShowAllEditModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      title="Edit shipment Show All"
      sources={[savedOverlay, query.data, ...sections.map((s) => s.data)]}
      pending={patchShowAll.isPending}
      onSubmit={saveShowAll}
    />
  );

  if (!sections.length && !arrays.length && !footer) {
    return (
      <div className="space-y-3 p-3">
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            leftIcon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => setEditOpen(true)}
          >
            Edit Show All
          </Button>
        </div>
        <p className="text-center text-[13px] text-[#64748b]">
          No Show All data returned from shipment APIs.
        </p>
        {editModal}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          leftIcon={<Pencil className="h-3.5 w-3.5" />}
          onClick={() => setEditOpen(true)}
        >
          Edit Show All
        </Button>
      </div>
      {sections.map((section) => {
        const isDepartment = isShipmentDepartmentTab(section.key);
        return (
          <SectionCard key={section.key} title={section.title}>
            {isDepartment ? (
              <ShipmentDepartmentTabPanel shipmentId={shipmentId} />
            ) : (
              <ShipmentApiPayloadView
                data={section.data}
                emptyMessage="No fields for this section."
              />
            )}
          </SectionCard>
        );
      })}
      {arrays.map((block) => (
        <SectionCard key={block.key} title={block.title}>
          <ArrayTable rows={block.rows} title={block.title} showTitle={false} />
        </SectionCard>
      ))}
      {footer}
      {editModal}
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

  return (
    <div className="p-3">
      <ShipmentApiPayloadView
        data={query.data ?? {}}
        emptyMessage="No data for this tab."
      />
    </div>
  );
}

function isShipmentDepartmentTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return norm === 'department' || norm === 'departments';
}

function isShipmentOrganizationTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return norm === 'organization' || norm === 'organisation' || norm === 'party';
}

function isShipmentSectionFilesTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return norm === 'section_files' || norm === 'sectionfiles';
}

/** Planned/Actual container tabs — containers live on the linked job (`GET /jobs/:id/containers`). */
function isShipmentContainerTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return (
    norm === 'planned_container' ||
    norm === 'actual_container' ||
    norm === 'containers' ||
    norm === 'container'
  );
}

function isShipmentDimensionsTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return norm === 'dimensions' || norm === 'dimension';
}

function isShipmentExchangeRateTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return (
    norm === 'ex_rate' ||
    norm === 'exrate' ||
    norm === 'exchange_rate' ||
    norm === 'exchange_rates'
  );
}

function isShipmentCustomsRefsTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return (
    norm === 'shipping_bill_boe' ||
    norm === 'shipping_bill' ||
    norm === 'boe' ||
    norm === 'customs' ||
    norm === 'customs_refs' ||
    norm === 'customs_ref'
  );
}

function isShipmentRoutingTab(tabKey: string): boolean {
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  return norm === 'routing' || norm === 'routing_legs' || norm === 'legs';
}

/** Lazy-loaded shipment detail tab — Show All aggregates sibling detail/{tab} payloads. */
export function ShipmentTabPanel({
  shipmentId,
  tabKey,
  siblingTabKeys = [],
  showAllFooter,
}: {
  shipmentId: string;
  tabKey: string;
  /** Other tab keys from GET /shipments/:id/detail — used by Show All aggregation. */
  siblingTabKeys?: string[];
  /** Appended at the end of Show All (Track & Trace panel). */
  showAllFooter?: ReactNode;
}) {
  if (isShipmentShowAllTab(tabKey)) {
    return (
      <ShipmentShowAllPanel
        shipmentId={shipmentId}
        siblingTabKeys={siblingTabKeys}
        footer={showAllFooter}
      />
    );
  }
  /** Costing tab — interactive Fresa panel (only when API returns a costing tab key). */
  if (isShipmentCostingTab(tabKey)) {
    return <ShipmentCostingTabPanel shipmentId={shipmentId} tabKey={tabKey} />;
  }
  if (isShipmentDepartmentTab(tabKey)) {
    return <ShipmentDepartmentTabPanel shipmentId={shipmentId} />;
  }
  if (isShipmentOrganizationTab(tabKey)) {
    return <ShipmentPartyPanel shipmentId={shipmentId} />;
  }
  if (isShipmentSectionFilesTab(tabKey)) {
    return (
      <div className="p-3">
        <EntitySectionFilesPanel
          entity="shipments"
          entityId={shipmentId}
          title="Section files"
        />
      </div>
    );
  }
  if (isShipmentContainerTab(tabKey)) {
    return <ShipmentContainersTabPanel shipmentId={shipmentId} tabKey={tabKey} />;
  }
  if (isShipmentDimensionsTab(tabKey)) {
    return <ShipmentDimensionsPanel shipmentId={shipmentId} tabKey={tabKey} />;
  }
  if (isShipmentExchangeRateTab(tabKey)) {
    return <ShipmentExchangeRatesPanel shipmentId={shipmentId} tabKey={tabKey} />;
  }
  if (isShipmentCustomsRefsTab(tabKey)) {
    return <ShipmentCustomsRefsPanel shipmentId={shipmentId} tabKey={tabKey} />;
  }
  if (isShipmentRoutingTab(tabKey)) {
    return <ShipmentRoutingLegsPanel shipmentId={shipmentId} tabKey={tabKey} />;
  }
  return <SingleTabPanel shipmentId={shipmentId} tabKey={tabKey} />;
}

function ShipmentContainersTabPanel({
  shipmentId,
  tabKey,
}: {
  shipmentId: string;
  tabKey: string;
}) {
  const shipmentQuery = useShipment(shipmentId);
  const shipment = shipmentQuery.data;
  const jobId = shipment?.job_id?.trim() ?? '';
  const norm = tabKey.trim().toLowerCase().replace(/-/g, '_');
  const title =
    norm === 'actual_container'
      ? 'Actual containers'
      : norm === 'planned_container'
        ? 'Planned containers'
        : 'Containers';

  if (shipmentQuery.isLoading && !shipment) {
    return (
      <div className="space-y-1.5 p-3" aria-busy>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-sm bg-[var(--fresa-action-soft,#E9EEF2)]"
          />
        ))}
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-3">
        <ErrorState
          message={getErrorMessage(shipmentQuery.error) || 'Shipment not loaded.'}
          onRetry={() => void shipmentQuery.refetch()}
        />
      </div>
    );
  }

  if (!isUuid(jobId)) {
    return (
      <div className="space-y-2 p-3">
        <p className="text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
          {title}
        </p>
        <p className="text-[13px] text-[#64748b]">
          Containers are managed on the linked job. Generate a job from this shipment first,
          then use Planned / Actual Container.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <p className="text-[12px] text-[#64748b]">
        {title} · linked job containers (`GET /jobs/:id/containers`)
      </p>
      <JobContainersPanel jobId={jobId} />
    </div>
  );
}

function ShipmentDepartmentTabPanel({ shipmentId }: { shipmentId: string }) {
  const shipmentQuery = useShipment(shipmentId);
  const shipment = shipmentQuery.data;

  if (shipmentQuery.isLoading && !shipment) {
    return (
      <div className="space-y-1.5 p-3" aria-busy>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-sm bg-[var(--fresa-action-soft,#E9EEF2)]"
          />
        ))}
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-3">
        <ErrorState
          message={getErrorMessage(shipmentQuery.error) || 'Shipment not loaded.'}
          onRetry={() => void shipmentQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <ShipmentDepartmentPanel
      shipment={shipment}
      onChanged={() => {
        // Mutation already merges department into the detail cache; avoid a bare
        // refetch that can flash empty before remembered ids are re-applied.
        void shipmentQuery.refetch();
      }}
    />
  );
}

function ShipmentCostingTabPanel({
  shipmentId,
  tabKey = 'costing',
}: {
  shipmentId: string;
  tabKey?: string;
}) {
  const shipmentQuery = useShipment(shipmentId);
  const shipment = shipmentQuery.data;

  if (shipmentQuery.isLoading && !shipment) {
    return (
      <div className="space-y-1.5 p-3" aria-busy>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-sm bg-[var(--fresa-action-soft,#E9EEF2)]"
          />
        ))}
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-3">
        <ErrorState
          message={getErrorMessage(shipmentQuery.error) || 'Shipment not loaded.'}
          onRetry={() => void shipmentQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <ShipmentChargesPanel
      shipment={shipment}
      tabKey={tabKey}
      onChanged={() => void shipmentQuery.refetch()}
    />
  );
}
