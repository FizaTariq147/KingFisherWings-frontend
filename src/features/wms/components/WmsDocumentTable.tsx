import type { WmsDocument } from '../types/wms.types';
import { displayDocNumber } from '../utils/normalizeWms';

interface WmsDocumentTableProps {
  documents: WmsDocument[];
  isLoading?: boolean;
  onView: (doc: WmsDocument) => void;
  emptyLabel?: string;
}

function statusClass(status?: string): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('confirm') || s.includes('post') || s.includes('complete')) {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (s.includes('cancel') || s.includes('reject')) {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-slate-100 text-slate-700';
}

export function WmsDocumentTable({
  documents,
  isLoading,
  onView,
  emptyLabel = 'No documents found.',
}: WmsDocumentTableProps) {
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
              <td className="px-3 py-2.5 font-medium text-[var(--color-neutral-800)]">
                {displayDocNumber(doc)}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(doc.status)}`}
                >
                  {doc.status ?? '—'}
                </span>
              </td>
              <td className="px-3 py-2.5 text-[var(--color-neutral-600)]">
                {doc.warehouse_id ? String(doc.warehouse_id).slice(0, 8) : '—'}
              </td>
              <td className="px-3 py-2.5 text-[var(--color-neutral-500)]">
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
