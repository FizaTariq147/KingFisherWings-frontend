import { Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
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
  const active = item.is_active !== false;

  return (
    <KebabMenu disabled={disabled} aria-label="Zip distance actions">
      {(close) => (
        <>
          <MenuItem
            label="View"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(item);
            }}
          />
          <MenuItem
            label="Edit"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onEdit(item);
            }}
          />
          {active ? (
            <MenuItem
              label="Deactivate"
              icon={<PowerOff className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onDeactivate(item);
              }}
            />
          ) : (
            <MenuItem
              label="Activate"
              icon={<Power className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onActivate(item);
              }}
            />
          )}
          <MenuItem
            label="Delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            danger
            onClick={() => {
              close();
              onDelete(item);
            }}
          />
        </>
      )}
    </KebabMenu>
  );
}
