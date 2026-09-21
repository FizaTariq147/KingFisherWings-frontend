import { listAccountsFormats } from '../../constants/accountsFormatCatalog';
import type { AccountsFormatKind } from '../../constants/accountsFormatCatalog';
import { filterCatalogStripRows } from '../../utils/filterCatalogStripRows';

type AccountsFormatBrowseStripProps = {
  selectedCode?: string;
  onSelect: (code: string) => void;
  visible: boolean;
  searchQuery?: string;
  allowedCodes?: ReadonlySet<string> | null;
};

const DEFAULT_TONE = {
  bg: 'bg-[#EEF6FF]',
  border: 'border-[#0F4D96]/25',
  accent: 'bg-[#0F4D96]',
  label: 'text-[#0F4D96]',
};

const KIND_TONES: Partial<
  Record<AccountsFormatKind, { bg: string; border: string; accent: string; label: string }>
> = {
  journal_voucher: {
    bg: 'bg-[var(--color-primary-100)]',
    border: 'border-[var(--color-primary-500)]/30',
    accent: 'bg-[var(--color-primary-500)]',
    label: 'text-[var(--color-primary-600)]',
  },
  payment_voucher: {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  payment_voucher_vietnam: {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  profit_loss: {
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/30',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  receipt_voucher: {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/35',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
  },
  trial_balance: {
    bg: 'bg-[var(--color-danger-50)]',
    border: 'border-[var(--color-danger-500)]/25',
    accent: 'bg-[var(--color-danger-500)]',
    label: 'text-[var(--color-danger-600)]',
  },
  outstanding_letter: {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#0F4D96]/25',
    accent: 'bg-[#0F4D96]',
    label: 'text-[#0F4D96]',
  },
  ap_aging: {
    bg: 'bg-[var(--color-secondary-100)]',
    border: 'border-[var(--color-secondary-700)]/30',
    accent: 'bg-[var(--color-secondary-700)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  ar_aging: {
    bg: 'bg-[var(--color-success-50)]',
    border: 'border-[var(--color-success-500)]/30',
    accent: 'bg-[var(--color-success-500)]',
    label: 'text-[var(--color-success-500)]',
  },
  ap_outstanding: {
    bg: 'bg-[var(--color-warning-50)]',
    border: 'border-[var(--color-warning-500)]/30',
    accent: 'bg-[var(--color-warning-500)]',
    label: 'text-[var(--color-warning-500)]',
  },
  ar_job_not_invoice: {
    bg: 'bg-[var(--color-danger-50)]',
    border: 'border-[var(--color-danger-500)]/25',
    accent: 'bg-[var(--color-danger-500)]',
    label: 'text-[var(--color-danger-600)]',
  },
  bank_cash_book: {
    bg: 'bg-[#E8F4FC]',
    border: 'border-[#2286C8]/35',
    accent: 'bg-[#2286C8]',
    label: 'text-[#0F4D96]',
  },
  purchase_invoice: {
    bg: 'bg-[#FFF4EC]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
  gl_listing: {
    bg: 'bg-[var(--color-primary-100)]',
    border: 'border-[var(--color-primary-600)]/30',
    accent: 'bg-[var(--color-primary-600)]',
    label: 'text-[var(--color-primary-600)]',
  },
  gl_report: {
    bg: 'bg-[#E6F7F2]',
    border: 'border-[#1F8A57]/30',
    accent: 'bg-[#1F8A57]',
    label: 'text-[#166B42]',
  },
  statement_of_accounts: {
    bg: 'bg-[#FFF4EC]',
    border: 'border-[var(--color-secondary)]/35',
    accent: 'bg-[var(--color-secondary)]',
    label: 'text-[var(--color-secondary-700)]',
  },
};

function toneForKind(kind: string) {
  if (KIND_TONES[kind]) return KIND_TONES[kind]!;
  if (kind.includes('outstanding')) return KIND_TONES.outstanding_letter ?? DEFAULT_TONE;
  if (kind.includes('profit')) return KIND_TONES.profit_loss ?? DEFAULT_TONE;
  if (kind.includes('trial')) return KIND_TONES.trial_balance ?? DEFAULT_TONE;
  return DEFAULT_TONE;
}

/** Compact strip for Accounts / Finance formats from Fresa sample-report-formats. */
export function AccountsFormatBrowseStrip({
  selectedCode,
  onSelect,
  visible,
  searchQuery = '',
  allowedCodes = null,
}: AccountsFormatBrowseStripProps) {
  if (!visible) return null;

  const all = listAccountsFormats();
  const { items, scopedTotal, filterActive } = filterCatalogStripRows(all, {
    searchQuery,
    allowedCodes,
    selectedCode,
  });

  return (
    <div className="space-y-2.5 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] p-3.5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary-700)]">
          Accounts formats
        </h3>
        <p className="text-[10px] text-[var(--color-neutral-400)]">
          {filterActive ? `${items.length} of ${scopedTotal} formats` : `${all.length} formats`}
        </p>
      </div>
      {items.length === 0 ? (
        <p className="px-1 py-2 text-xs text-[var(--color-neutral-500)]">
          No Accounts formats match the current filters.
        </p>
      ) : (
        <div className="-mx-0.5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {items.map((row) => {
            const active = selectedCode === row.code;
            const tone = toneForKind(row.kind);
            return (
              <button
                key={row.code}
                type="button"
                onClick={() => onSelect(row.code)}
                title={row.name}
                className={[
                  'relative min-w-[8.75rem] max-w-[11rem] shrink-0 overflow-hidden rounded-lg border px-2.5 py-2.5 text-left transition',
                  tone.bg,
                  tone.border,
                  active
                    ? 'ring-2 ring-[var(--color-secondary)] ring-offset-1 shadow-md'
                    : 'hover:-translate-y-0.5 hover:shadow-sm',
                ].join(' ')}
              >
                <span
                  className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`}
                  aria-hidden
                />
                <p className={`pl-1.5 text-[10px] font-bold uppercase tracking-wide ${tone.label}`}>
                  #{row.sortOrder}
                </p>
                <p className="mt-0.5 line-clamp-2 pl-1.5 text-[11px] font-medium leading-snug text-[var(--color-neutral-800)]">
                  {row.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
