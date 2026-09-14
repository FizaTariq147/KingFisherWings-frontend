import { listInvoiceFormatPreviews } from '../../data/invoiceFormatPreviews';

type InvoiceFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  /** When true, strip is shown (commercial + invoice context filters). */
  visible: boolean;
};

/**
 * Compact card strip for Invoice Report Format-1…61.
 * Selection still goes through the main catalog URL `code` param.
 */
export function InvoiceFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
}: InvoiceFormatBrowseStripProps) {
  if (!visible) return null;

  const items = listInvoiceFormatPreviews();

  return (
    <div className="space-y-2 rounded-md border border-[var(--color-neutral-200)] bg-white p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-600)]">
          Invoice report formats
        </h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {items.length} distinct layout styles
        </p>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {items.map((row) => {
          const active = selectedCode === row.code;
          return (
            <button
              key={row.code}
              type="button"
              onClick={() => onSelect(row.code)}
              title={row.name}
              className={`min-w-[7.5rem] shrink-0 rounded-md border px-2.5 py-2 text-left transition ${
                active
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] ring-1 ring-[var(--color-primary-500)]'
                  : 'border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] hover:border-[var(--color-neutral-300)]'
              }`}
            >
              <p className="text-[10px] font-semibold text-[var(--color-neutral-500)]">
                Format-{row.formatNumber}
              </p>
              <p className="line-clamp-2 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                {row.name.replace(/^Invoice Report Format-\d+\s*/i, '') || row.name}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-wide text-[var(--color-neutral-400)]">
                {row.layoutKind.replace(/_/g, ' ')}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
