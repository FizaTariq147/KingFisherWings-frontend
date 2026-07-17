import { Copy, Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
import type { Tariff } from '../../types/tariff.types';

interface TariffActionMenuProps {
  tariff: Tariff;
  disabled?: boolean;
  onView: (t: Tariff) => void;
  onEdit: (t: Tariff) => void;
  onDuplicate: (t: Tariff) => void;
  onActivate: (t: Tariff) => void;
  onDeactivate: (t: Tariff) => void;
  onDelete: (t: Tariff) => void;
}

export function TariffActionMenu({
  tariff,
  disabled,
  onView,
  onEdit,
  onDuplicate,
  onActivate,
  onDeactivate,
  onDelete,
}: TariffActionMenuProps) {
  const active = tariff.is_active !== false;

  return (
    <KebabMenu disabled={disabled} aria-label="Tariff actions">
      {(close) => (
        <>
          <MenuItem
            label="View"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(tariff);
            }}
          />
          <MenuItem
            label="Edit"
            icon={<Pencil className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onEdit(tariff);
            }}
          />
          <MenuItem
            label="Duplicate"
            icon={<Copy className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onDuplicate(tariff);
            }}
          />
          {active ? (
            <MenuItem
              label="Deactivate"
              icon={<PowerOff className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onDeactivate(tariff);
              }}
            />
          ) : (
            <MenuItem
              label="Activate"
              icon={<Power className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onActivate(tariff);
              }}
            />
          )}
          <MenuItem
            label="Delete"
            icon={<Trash2 className="h-3.5 w-3.5" />}
            danger
            onClick={() => {
              close();
              onDelete(tariff);
            }}
          />
        </>
      )}
    </KebabMenu>
  );
}
