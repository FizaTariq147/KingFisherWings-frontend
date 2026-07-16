import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import type { CompanyListItem } from '../../utils/mergeDraftCompanies';

interface CompanyActionMenuProps {
  company: CompanyListItem;
  disabled?: boolean;
  onView: (c: CompanyListItem) => void;
  onEdit: (c: CompanyListItem) => void;
  onDelete: (c: CompanyListItem) => void;
  onActivate?: (c: CompanyListItem) => void;
  onDeactivate?: (c: CompanyListItem) => void;
}

export function CompanyActionMenu({
  company,
  disabled,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: CompanyActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDeleted = !!company.deleted_at;
  const isActive = company.is_active !== false;

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

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-md text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-40"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {item('View details', <Eye className="h-3.5 w-3.5" />, () => onView(company))}
          {!isDeleted && item('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(company))}
          {!isDeleted &&
            isActive &&
            onDeactivate &&
            item('Deactivate', <PowerOff className="h-3.5 w-3.5" />, () => onDeactivate(company))}
          {!isDeleted &&
            !isActive &&
            onActivate &&
            item('Activate', <Power className="h-3.5 w-3.5" />, () => onActivate(company))}
          {!isDeleted &&
            item('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(company), true)}
        </div>
      )}
    </div>
  );
}
