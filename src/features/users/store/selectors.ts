import { createSelector } from '@reduxjs/toolkit';
import { canManageUsers } from '../constants/userPermissions';
import { selectUsersListParams, type UsersUiState } from './usersUiSlice';

export const selectUsersUi = (state: { usersUi: UsersUiState }) => state.usersUi;

export const selectUsersListQueryParams = createSelector(
  [(state: { usersUi: UsersUiState }) => state.usersUi],
  (usersUi) => selectUsersListParams({ usersUi }),
);

export function selectCanManageUsersFromAuth(): boolean {
  // Super Admin must never manage tenant users from the platform console.
  return canManageUsers(false);
}

export function getRtkErrorMessage(error: unknown): string {
  if (!error) return 'Request failed';
  if (error instanceof Error) return error.message || 'Request failed';
  if (typeof error !== 'object') return 'Request failed';

  const record = error as Record<string, unknown>;
  const message = record.message;

  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message)) return message.map(String).join('; ');
  if (typeof record.error === 'string' && record.error.trim()) return record.error;

  return 'Request failed';
}
