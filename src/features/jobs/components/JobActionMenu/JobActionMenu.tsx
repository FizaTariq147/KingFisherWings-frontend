import { Ban, CheckCircle2, Eye, Pencil, Trash2, XCircle } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
import { useAuth } from '@/hooks/useAuth';
import type { Job } from '../../types/job.types';
import {
  canCancelJob,
  canDeleteJob,
  canEditJob,
} from '../../utils/canDeleteJob';

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
  const { user } = useAuth();
  const editable = canEditJob(job, user);
  const canDelete = canDeleteJob(job, user);
  const canClose =
    job.actions?.can_close === false
      ? false
      : editable && job.status !== 'ENQUIRY';
  const canCancel = canCancelJob(job, user);

  return (
    <KebabMenu disabled={disabled} aria-label="Job actions">
      {(close) => (
        <>
          <MenuItem
            label="View"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(job);
            }}
          />
          {editable && (
            <MenuItem
              label="Edit"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onEdit(job);
              }}
            />
          )}
          {canClose && (
            <MenuItem
              label="Close job"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onClose(job);
              }}
            />
          )}
          {canCancel && (
            <MenuItem
              label="Cancel job"
              icon={<XCircle className="h-3.5 w-3.5" />}
              danger
              onClick={() => {
                close();
                onCancel(job);
              }}
            />
          )}
          {canDelete && (
            <MenuItem
              label="Delete"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              danger
              onClick={() => {
                close();
                onDelete(job);
              }}
            />
          )}
          {!editable && !canDelete && (
            <p className="px-3 py-2 text-xs text-[var(--color-neutral-400)]">
              <Ban className="inline h-3 w-3 mr-1" />
              No actions available
            </p>
          )}
        </>
      )}
    </KebabMenu>
  );
}
