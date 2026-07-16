import { useEffect, useRef, useState } from 'react';
import {
  Archive,
  CheckCircle,
  Copy,
  Eye,
  MoreVertical,
  Pencil,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import type { Quotation } from '../../types/quotation.types';

interface QuotationActionMenuProps {
  quotation: Quotation;
  disabled?: boolean;
  onView: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
  onDuplicate: (q: Quotation) => void;
  onSubmit: (q: Quotation) => void;
  onApprove: (q: Quotation) => void;
  onReject: (q: Quotation) => void;
  onSend: (q: Quotation) => void;
  onDelete: (q: Quotation) => void;
  onArchive: (q: Quotation) => void;
}

export function QuotationActionMenu({
  quotation,
  disabled,
  onView,
  onEdit,
  onDuplicate,
  onSubmit,
  onApprove,
  onReject,
  onSend,
  onDelete,
  onArchive,
}: QuotationActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const status = quotation.status;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const item = (label: string, icon: React.ReactNode, onClick: () => void, danger = false) => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--color-neutral-50)] ${
        danger ? 'text-[var(--color-danger-600)]' : 'text-[var(--color-neutral-700)]'
      }`}
    >
      {icon} {label}
    </button>
  );

  const canEdit = status === 'DRAFT' || status === 'REJECTED';
  const canSubmit = status === 'DRAFT' || status === 'REJECTED';
  const canApprove = status === 'SUBMITTED';
  const canSend = status === 'APPROVED';
  const canDelete = status === 'DRAFT';
  const canArchive = ['WON', 'LOST', 'EXPIRED', 'CONVERTED'].includes(status);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-md text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {item('View', <Eye className="h-3.5 w-3.5" />, () => onView(quotation))}
          {canEdit && item('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(quotation))}
          {item('Duplicate', <Copy className="h-3.5 w-3.5" />, () => onDuplicate(quotation))}
          {canSubmit &&
            item('Submit', <Send className="h-3.5 w-3.5" />, () => onSubmit(quotation))}
          {canApprove && (
            <>
              {item('Approve', <ThumbsUp className="h-3.5 w-3.5" />, () => onApprove(quotation))}
              {item('Reject', <ThumbsDown className="h-3.5 w-3.5" />, () => onReject(quotation), true)}
            </>
          )}
          {canSend &&
            item('Send to customer', <CheckCircle className="h-3.5 w-3.5" />, () =>
              onSend(quotation),
            )}
          {canArchive &&
            item('Archive', <Archive className="h-3.5 w-3.5" />, () => onArchive(quotation))}
          {canDelete &&
            item('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(quotation), true)}
          {status === 'SENT' ? (
            <span className="px-3 py-1.5 text-[11px] text-[var(--color-neutral-400)] block">
              Use detail page for Won / Lost
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
