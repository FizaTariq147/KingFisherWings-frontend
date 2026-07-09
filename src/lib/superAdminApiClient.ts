// REPLACE THIS ENTIRE FILE AT: src/lib/superAdminApiClient.ts
//
// Rebuilt from what superAdminAuth.service.ts and SuperAdminLoginPage.tsx
// already expect (ApiError, ApiEnvelope<T>) — the original content of this
// file was never in git history, so this is a reconstruction, not a restore.
//
// ASSUMPTION: ApiEnvelope shape is `{ data: T }` plus optional metadata —
// confirmed by `res.data.data` in superAdminAuth.service.ts, but verify the
// full shape (message/success/statusCode fields) against your actual backend
// response if anything else consumes those fields.
//
// ASSUMPTION: env var name VITE_API_BASE_URL — check .env.example for the
// real name your team is already using elsewhere.

import axios from 'axios';
import { useSuperAdminAuthStore } from '../features/superadmin/store/superAdminAuthStore';

export interface ApiEnvelope<T, M = undefined> {
  data: T;
  meta?: M;
  message?: string;
  success?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const superAdminApiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/api',
  timeout: 15000,
});

superAdminApiClient.interceptors.request.use((config) => {
  const token = useSuperAdminAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

superAdminApiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status ?? 0;
    const message = err.response?.data?.message ?? err.message ?? 'Something went wrong';

    // Only force logout+redirect if a session actually expired mid-use.
    // A 401 on the login request itself just means wrong credentials —
    // redirecting away from the login page on a failed login would be a bug.
    if (status === 401 && useSuperAdminAuthStore.getState().isAuthenticated) {
      useSuperAdminAuthStore.getState().logout();
      window.location.href = '/superadmin/login';
    }

    return Promise.reject(new ApiError(message, status));
  }
);