import { Eye, Mail, Pencil, Power, PowerOff, RotateCcw, Trash2 } from 'lucide-react';
import { KebabMenu, MenuItem } from '@/components/ui/KebabMenu';
import type { User } from '../../types/user.types';
import { isDeletedUser } from '../../utils/deletedUsersRegistry';

interface UserActionMenuProps {
  user: User;
  disabled?: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onActivate: (user: User) => void;
  onDeactivate: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onInvite?: (user: User) => void;
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
  onInvite,
}: UserActionMenuProps) {
  const isDeleted = isDeletedUser(user);
  const isActive = user.status === 'ACTIVE';
  const isInvited = user.status === 'INVITED';

  return (
    <KebabMenu disabled={disabled} aria-label="User actions">
      {(close) => (
        <>
          <MenuItem
            label="View details"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => {
              close();
              onView(user);
            }}
          />
          {!isDeleted && (
            <MenuItem
              label="Edit"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onEdit(user);
              }}
            />
          )}
          {!isDeleted && isInvited && onInvite && (
            <MenuItem
              label="Send invite email"
              icon={<Mail className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onInvite(user);
              }}
            />
          )}
          {!isDeleted &&
            (isActive ? (
              <MenuItem
                label="Deactivate"
                icon={<PowerOff className="h-3.5 w-3.5" />}
                onClick={() => {
                  close();
                  onDeactivate(user);
                }}
              />
            ) : (
              <MenuItem
                label="Activate"
                icon={<Power className="h-3.5 w-3.5" />}
                onClick={() => {
                  close();
                  onActivate(user);
                }}
              />
            ))}
          {isDeleted ? (
            <MenuItem
              label="Restore"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => {
                close();
                onRestore(user);
              }}
            />
          ) : (
            <MenuItem
              label="Delete"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              danger
              onClick={() => {
                close();
                onDelete(user);
              }}
            />
          )}
        </>
      )}
    </KebabMenu>
  );
}
