import { Eye, Pencil, Power, PowerOff, RotateCcw, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
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
  const isDeleted = !!tenant.deleted_at;

  return (
    <KebabMenu disabled={disabled} aria-label="Tenant actions">
      {(close) => (
        <>
          <MenuItem
            label="View details"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(tenant);
            }}
          />
          {!isDeleted && (
            <MenuItem
              label="Edit"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onEdit(tenant);
              }}
            />
          )}
          {!isDeleted &&
            (tenant.is_active ? (
              <MenuItem
                label="Deactivate"
                icon={<PowerOff className="h-3.5 w-3.5" />}
                onClick={() => {
                  close();
                  onDeactivate(tenant);
                }}
              />
            ) : (
              <MenuItem
                label="Activate"
                icon={<Power className="h-3.5 w-3.5" />}
                onClick={() => {
                  close();
                  onActivate(tenant);
                }}
              />
            ))}
          {isDeleted ? (
            <MenuItem
              label="Restore"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onRestore(tenant);
              }}
            />
          ) : (
            <MenuItem
              label="Delete"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              danger
              onClick={() => {
                close();
                onDelete(tenant);
              }}
            />
          )}
        </>
      )}
    </KebabMenu>
  );
}
