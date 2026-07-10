import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { superAdminApi } from './api/superAdminBaseApi';
import { usersUiReducer } from '@/features/users/store/usersUiSlice';
// Register RTK Query endpoints (side-effect import)
import '@/features/users/store/usersApi';

export const store = configureStore({
  reducer: {
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    usersUi: usersUiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(superAdminApi.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
