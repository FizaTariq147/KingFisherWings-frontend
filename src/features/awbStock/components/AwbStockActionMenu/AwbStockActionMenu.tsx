import { Eye, Pencil, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
import type { AwbStockBatch } from '../../types/awbStock.types';

interface AwbStockActionMenuProps {
  batch: AwbStockBatch;
  disabled?: boolean;
  onView: (b: AwbStockBatch) => void;
  onEdit: (b: AwbStockBatch) => void;
  onDelete: (b: AwbStockBatch) => void;
}

export function AwbStockActionMenu({
  batch,
  disabled,
  onView,
  onEdit,
  onDelete,
}: AwbStockActionMenuProps) {
  return (
    <KebabMenu disabled={disabled} menuClassName="w-44" aria-label="AWB stock actions">
      {(close) => (
        <>
          <MenuItem
            label="View"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(batch);
            }}
          />
          <MenuItem
            label="Edit"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onEdit(batch);
            }}
          />
          <MenuItem
            label="Delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            danger
            onClick={() => {
              close();
              onDelete(batch);
            }}
          />
        </>
      )}
    </KebabMenu>
  );
}
