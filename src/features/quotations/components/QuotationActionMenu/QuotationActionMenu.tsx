import {
  Archive,
  CheckCircle,
  Copy,
  Eye,
  Pencil,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
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
  const status = quotation.status;
  const canEdit = status === 'DRAFT' || status === 'REJECTED';
  const canSubmit = status === 'DRAFT' || status === 'REJECTED';
  const canApprove = status === 'SUBMITTED';
  const canSend = status === 'APPROVED';
  const canDelete = status === 'DRAFT';
  const canArchive = ['WON', 'LOST', 'EXPIRED', 'CONVERTED'].includes(status);

  return (
    <KebabMenu disabled={disabled} menuClassName="w-52" aria-label="Quotation actions">
      {(close) => (
        <>
          <MenuItem
            label="View"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(quotation);
            }}
          />
          {canEdit && (
            <MenuItem
              label="Edit"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onEdit(quotation);
              }}
            />
          )}
          <MenuItem
            label="Duplicate"
            icon={<Copy className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onDuplicate(quotation);
            }}
          />
          {canSubmit && (
            <MenuItem
              label="Submit"
              icon={<Send className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onSubmit(quotation);
              }}
            />
          )}
          {canApprove && (
            <>
              <MenuItem
                label="Approve"
                icon={<ThumbsUp className="h-3.5 w-3.5" />}
                onClick={() => {
                  close();
                  onApprove(quotation);
                }}
              />
              <MenuItem
                label="Reject"
                icon={<ThumbsDown className="h-3.5 w-3.5" />}
                danger
                onClick={() => {
                  close();
                  onReject(quotation);
                }}
              />
            </>
          )}
          {canSend && (
            <MenuItem
              label="Send to customer"
              icon={<CheckCircle className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onSend(quotation);
              }}
            />
          )}
          {canArchive && (
            <MenuItem
              label="Archive"
              icon={<Archive className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onArchive(quotation);
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
                onDelete(quotation);
              }}
            />
          )}
          {status === 'SENT' ? (
            <span className="px-3 py-1.5 text-[11px] text-[var(--color-neutral-400)] block">
              Use detail page for Won / Lost
            </span>
          ) : null}
        </>
      )}
    </KebabMenu>
  );
}
