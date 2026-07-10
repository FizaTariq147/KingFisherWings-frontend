import { Badge } from '@/components/ui/Badge';
import type { User } from '../../types/user.types';

const STATUS_VARIANT: Record<
  User['status'],
  'success' | 'warning' | 'danger' | 'info' | 'neutral'
> = {
  ACTIVE: 'success',
  INVITED: 'info',
  INACTIVE: 'neutral',
  SUSPENDED: 'warning',
  LOCKED: 'danger',
};

interface UserStatusBadgeProps {
  user: Pick<User, 'status' | 'deleted_at'>;
}

export function UserStatusBadge({ user }: UserStatusBadgeProps) {
  if (user.deleted_at) {
    return <Badge variant="neutral">Deleted</Badge>;
  }

  return (
    <Badge variant={STATUS_VARIANT[user.status]}>
      {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
    </Badge>
  );
}
