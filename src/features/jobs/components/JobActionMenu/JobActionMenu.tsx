import { useEffect, useRef, useState } from 'react';
import { Ban, CheckCircle2, Eye, MoreVertical, Pencil, Trash2, XCircle } from 'lucide-react';
import type { Job } from '../../types/job.types';
import { jobEditable } from '../../utils/jobRoute';

interface JobActionMenuProps {
  job: Job;
  disabled?: boolean;
  onView: (j: Job) => void;
  onEdit: (j: Job) => void;
  onCancel: (j: Job) => void;
  onClose: (j: Job) => void;
  onDelete: (j: Job) => void;
}

export function JobActionMenu({
  job,
  disabled,
  onView,
  onEdit,
  onCancel,
  onClose,
  onDelete,
}: JobActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const editable = jobEditable(job.status);
  const canDelete = job.status === 'COMPLETED' || job.status === 'CANCELLED';
  const canClose = editable && job.status !== 'ENQUIRY';
  const canCancel = editable;

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
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="p-1.5 rounded-md text-[var(--color-neutral-400)] hover:bg-[var(--color-neutral-50)] disabled:opacity-40"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[var(--color-neutral-200)] rounded-lg shadow-lg py-1 z-10">
          {item('View', <Eye className="h-3.5 w-3.5" />, () => onView(job))}
          {editable && item('Edit', <Pencil className="h-3.5 w-3.5" />, () => onEdit(job))}
          {canClose &&
            item('Close job', <CheckCircle2 className="h-3.5 w-3.5" />, () => onClose(job))}
          {canCancel &&
            item('Cancel job', <XCircle className="h-3.5 w-3.5" />, () => onCancel(job), true)}
          {canDelete &&
            item('Delete', <Trash2 className="h-3.5 w-3.5" />, () => onDelete(job), true)}
          {!editable && !canDelete && (
            <p className="px-3 py-2 text-xs text-[var(--color-neutral-400)]">
              <Ban className="inline h-3 w-3 mr-1" />
              No actions available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
