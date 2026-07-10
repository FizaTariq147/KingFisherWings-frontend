export {
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
  useRestoreUser,
  useAdminResetUserPassword,
  useForceUserLogout,
} from './useUsers';

import {
  useCreateUser,
  useDeleteUser,
  useRestoreUser,
  useUpdateUserStatus,
} from './useUsers';

/** Convenience bundle for list/detail action bars. */
export function useUserMutations(_tenantId?: string) {
  return {
    createUser: useCreateUser(),
    deleteUser: useDeleteUser(),
    updateUserStatus: useUpdateUserStatus(),
    restoreUser: useRestoreUser(),
  };
}
