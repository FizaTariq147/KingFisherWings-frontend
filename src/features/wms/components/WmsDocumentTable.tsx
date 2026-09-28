import { useMemo } from 'react';
import type { WmsDocument } from '../types/wms.types';
import {
  useWmsJobOptions,
  useWmsPartyOptions,
  useWmsWarehouseOptions,
} from './WmsFormHelpers';
import { displayDocNumber } from '../utils/normalizeWms';

interface WmsDocumentTableProps {
  documents: WmsDocument[];
  isLoading?: boolean;
  onView: (doc: WmsDocument) => void;
  emptyLabel?: string;
}

function statusClass(status?: string): string {
  const s = (status ?? '').toLowerCase();
  if (
    s.includes('confirm') ||
    s.includes('post') ||
    s.includes('complete') ||
    s.includes('unload') ||
    s.includes('dispatch') ||
    s.includes('pick')
  ) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (s.includes('cancel') || s.includes('reject')) {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-slate-100 text-slate-700';
}

function buildLabelMap(options: Array<{ value: string; label: string }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const opt of options) {
    if (opt.value) map.set(opt.value, opt.label);
  }
  return map;
}

function resolveLabel(
  id: string | undefined,
  explicit: string | undefined,
  map: Map<string, string>,
): string {
  if (explicit?.trim()) return explicit.trim();
  if (id && map.has(id)) return map.get(id)!;
  return '—';
}

function warehouseLabel(doc: WmsDocument, map: Map<string, string>): string {
  const code = doc.warehouse_code?.trim();
  const name = doc.warehouse_name?.trim();
  if (code || name) return [code, name].filter(Boolean).join(' — ');
  return resolveLabel(doc.warehouse_id, undefined, map);
}

export function WmsDocumentTable({
  documents,
  isLoading,
  onView,
  emptyLabel = 'No documents found.',
}: WmsDocumentTableProps) {
  const { options: warehouseOptions } = useWmsWarehouseOptions();
  const { options: partyOptions } = useWmsPartyOptions();
  const { options: jobOptions } = useWmsJobOptions();

  const warehouseMap = useMemo(() => buildLabelMap(warehouseOptions), [warehouseOptions]);
  const partyMap = useMemo(() => buildLabelMap(partyOptions), [partyOptions]);
  const jobMap = useMemo(() => buildLabelMap(jobOptions), [jobOptions]);

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">Loading…</p>;
  }
  if (!documents.length) {
    return <p className="py-10 text-center text-sm text-[var(--color-neutral-400)]">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-neutral-200)] text-left text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
            <th className="px-3 py-2 font-medium">Document</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Warehouse</th>
            <th className="px-3 py-2 font-medium">Party</th>
            <th className="px-3 py-2 font-medium">Job</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]"
            >
              <td className="px-3 py-2.5 text-sm font-normal text-[var(--color-neutral-800)]">
                {displayDocNumber(doc)}
              </td>
              <td className="px-3 py-2.5 text-sm font-normal">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(doc.status)}`}
                >
                  {doc.status ?? '—'}
                </span>
              </td>
              <td className="px-3 py-2.5 text-sm font-normal text-[var(--color-neutral-800)]">
                {warehouseLabel(doc, warehouseMap)}
              </td>
              <td className="px-3 py-2.5 text-sm font-normal text-[var(--color-neutral-800)]">
                {resolveLabel(doc.party_id, doc.party_name, partyMap)}
              </td>
              <td className="px-3 py-2.5 text-sm font-normal text-[var(--color-neutral-800)]">
                {resolveLabel(doc.job_id, doc.job_number, jobMap)}
              </td>
              <td className="px-3 py-2.5 text-sm font-normal text-[var(--color-neutral-800)]">
                {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--color-primary-600)] hover:underline"
                  onClick={() => onView(doc)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
