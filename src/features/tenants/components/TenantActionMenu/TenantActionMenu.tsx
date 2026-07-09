import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Pencil, Power, PowerOff, Trash2, RotateCcw } from 'lucide-react';
import type { Tenant } from '../../types/tenant.types';

interface TenantActionMenuProps {
  tenant: Tenant;
  disabled?: boolean;
  onView: (t: Tenant) => void;
  onEdit: (t: Tenant) => void;
  onActivate: (t: Tenant) => void;
  onDeactivate: (t: Tenant) => void;
  onDelete: (t: Tenant) => void;
  onRestore: (t: Tenant) => void;
}

export function TenantActionMenu({
  tenant,
  disabled,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
}: TenantActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDeleted = !!tenant.deleted_at;

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
        className="p-1.5 rounded-md text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {item('View details', <Eye className="h-3.5 w-3.5" />, () => onView(tenant))}
          {!isDeleted && item('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(tenant))}
          {!isDeleted &&
            (tenant.is_active
              ? item('Deactivate', <PowerOff className="h-3.5 w-3.5" />, () => onDeactivate(tenant))
              : item('Activate', <Power className="h-3.5 w-3.5" />, () => onActivate(tenant)))}
          {isDeleted
            ? item('Restore', <RotateCcw className="h-3.5 w-3.5" />, () => onRestore(tenant))
            : item('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(tenant), true)}
        </div>
      )}
    </div>
  );
}
