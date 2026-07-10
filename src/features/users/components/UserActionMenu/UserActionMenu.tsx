import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Pencil, Power, PowerOff, Trash2, RotateCcw } from 'lucide-react';
import type { User } from '../../types/user.types';

interface UserActionMenuProps {
  user: User;
  disabled?: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onActivate: (user: User) => void;
  onDeactivate: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
}

export function UserActionMenu({
  user,
  disabled,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
}: UserActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDeleted = !!user.deleted_at;
  const isActive = user.status === 'ACTIVE';

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
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {item('View details', <Eye className="h-3.5 w-3.5" />, () => onView(user))}
          {!isDeleted && item('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(user))}
          {!isDeleted &&
            (isActive
              ? item('Deactivate', <PowerOff className="h-3.5 w-3.5" />, () => onDeactivate(user))
              : item('Activate', <Power className="h-3.5 w-3.5" />, () => onActivate(user)))}
          {isDeleted
            ? item('Restore', <RotateCcw className="h-3.5 w-3.5" />, () => onRestore(user))
            : item('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(user), true)}
        </div>
      )}
    </div>
  );
}
