import { useState } from 'react';
import type { User } from '../types/user.types';
import type { UserConfirmAction } from '../components/UserConfirmModal';

export type UserConfirmState = {
  action: UserConfirmAction;
  user: User;
} | null;

export function useUserConfirmState() {
  const [confirm, setConfirm] = useState<UserConfirmState>(null);

  const requestConfirm = (action: UserConfirmAction, user: User) => {
    setConfirm({ action, user });
  };

  const closeConfirm = () => setConfirm(null);

  return { confirm, requestConfirm, closeConfirm };
}
