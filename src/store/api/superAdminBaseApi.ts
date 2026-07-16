import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

/**
 * Shared RTK Query API for Super Admin modules.
 * Feature modules inject endpoints via `superAdminApi.injectEndpoints()`.
 */
export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User', 'Users'],
  endpoints: () => ({}),
});
