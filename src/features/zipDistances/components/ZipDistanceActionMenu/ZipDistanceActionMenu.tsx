import { useEffect, useRef, useState } from 'react';
import { Eye, MoreVertical, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import type { ZipDistance } from '../../types/zipDistance.types';

interface ZipDistanceActionMenuProps {
  item: ZipDistance;
  disabled?: boolean;
  onView: (item: ZipDistance) => void;
  onEdit: (item: ZipDistance) => void;
  onActivate: (item: ZipDistance) => void;
  onDeactivate: (item: ZipDistance) => void;
  onDelete: (item: ZipDistance) => void;
}

export function ZipDistanceActionMenu({
  item,
  disabled,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: ZipDistanceActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = item.is_active !== false;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const row = (label: string, icon: React.ReactNode, onClick: () => void, danger = false) => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-neutral-50)] ${
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
        className="p-1.5 rounded-md text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {row('View', <Eye className="h-3.5 w-3.5" />, () => onView(item))}
          {row('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(item))}
          {active
            ? row('Deactivate', <PowerOff className="h-3.5 w-3.5" />, () => onDeactivate(item))
            : row('Activate', <Power className="h-3.5 w-3.5" />, () => onActivate(item))}
          {row('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(item), true)}
        </div>
      )}
    </div>
  );
}
