import { Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
import type { CompanyListItem } from '../../utils/mergeDraftCompanies';

interface CompanyActionMenuProps {
  company: CompanyListItem;
  disabled?: boolean;
  onView: (c: CompanyListItem) => void;
  onEdit: (c: CompanyListItem) => void;
  onDelete: (c: CompanyListItem) => void;
  onActivate?: (c: CompanyListItem) => void;
  onDeactivate?: (c: CompanyListItem) => void;
}

export function CompanyActionMenu({
  company,
  disabled,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: CompanyActionMenuProps) {
  const isDeleted = !!company.deleted_at;
  const isActive = company.is_active !== false;

  return (
    <KebabMenu disabled={disabled} menuClassName="w-44" aria-label="Company actions">
      {(close) => (
        <>
          <MenuItem
            label="View details"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(company);
            }}
          />
          {!isDeleted && (
            <MenuItem
              label="Edit"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onEdit(company);
              }}
            />
          )}
          {!isDeleted && isActive && onDeactivate && (
            <MenuItem
              label="Deactivate"
              icon={<PowerOff className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onDeactivate(company);
              }}
            />
          )}
          {!isDeleted && !isActive && onActivate && (
            <MenuItem
              label="Activate"
              icon={<Power className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onActivate(company);
              }}
            />
          )}
          {!isDeleted && (
            <MenuItem
              label="Delete"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              danger
              onClick={() => {
                close();
                onDelete(company);
              }}
            />
          )}
        </>
      )}
    </KebabMenu>
  );
}
