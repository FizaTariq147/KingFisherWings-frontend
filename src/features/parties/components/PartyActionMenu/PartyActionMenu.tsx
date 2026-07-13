import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import type { Party } from '../../types/party.types';

interface PartyActionMenuProps {
  party: Party;
  disabled?: boolean;
  onView: (party: Party) => void;
  onEdit: (party: Party) => void;
  onActivate: (party: Party) => void;
  onDeactivate: (party: Party) => void;
  onCreditStatus: (party: Party) => void;
  onDelete: (party: Party) => void;
}

export function PartyActionMenu({
  party,
  disabled,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onCreditStatus,
  onDelete,
}: PartyActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = party.is_active !== false;

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
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {item('View details', <Eye className="h-3.5 w-3.5" />, () => onView(party))}
          {item('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(party))}
          {isActive
            ? item('Deactivate', <PowerOff className="h-3.5 w-3.5" />, () => onDeactivate(party))
            : item('Activate', <Power className="h-3.5 w-3.5" />, () => onActivate(party))}
          {item('Credit status', <ShieldAlert className="h-3.5 w-3.5" />, () =>
            onCreditStatus(party),
          )}
          {item('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(party), true)}
        </div>
      )}
    </div>
  );
}
