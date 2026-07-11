import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserLifecycleFilter } from '../components/UserFilters/UserFilters';
import type { UserRole, UserSortField, UserSortOrder } from '../constants/user.constants';
import type { UserListParams } from '../types/user.types';

export interface UsersUiState {
  tenantId: string;
  search: string;
  role: UserRole | 'all';
  status: UserLifecycleFilter;
  sortBy: UserSortField;
  order: UserSortOrder;
  page: number;
  limit: number;
}

const initialState: UsersUiState = {
  tenantId: '',
  search: '',
  role: 'all',
  status: 'all',
  sortBy: 'created_at',
  order: 'desc',
  page: 1,
  limit: 20,
};

export const usersUiSlice = createSlice({
  name: 'usersUi',
  initialState,
  reducers: {
    setUsersTenantId(state, action: PayloadAction<string>) {
      state.tenantId = action.payload;
      state.page = 1;
    },
    setUsersSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setUsersRoleFilter(state, action: PayloadAction<UserRole | 'all'>) {
      state.role = action.payload;
      state.page = 1;
    },
    setUsersStatusFilter(state, action: PayloadAction<UserLifecycleFilter>) {
      state.status = action.payload;
      state.page = 1;
    },
    setUsersSort(
      state,
      action: PayloadAction<{ sortBy: UserSortField; order: UserSortOrder }>,
    ) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
    },
    setUsersPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetUsersListFilters(state) {
      state.search = '';
      state.role = 'all';
      state.status = 'all';
      state.sortBy = 'created_at';
      state.order = 'desc';
      state.page = 1;
    },
  },
});

export const {
  setUsersTenantId,
  setUsersSearch,
  setUsersRoleFilter,
  setUsersStatusFilter,
  setUsersSort,
  setUsersPage,
  resetUsersListFilters,
} = usersUiSlice.actions;

export const usersUiReducer = usersUiSlice.reducer;

export function selectUsersListParams(state: { usersUi: UsersUiState }): UserListParams | null {
  const { tenantId, search, role, status, sortBy, order, page, limit } = state.usersUi;
  if (!tenantId) return null;

  return {
    tenantId,
    search: search.trim() || undefined,
    role: role === 'all' ? undefined : role,
    lifecycle: status,
    sortBy,
    order,
    page,
    limit,
  };
}
