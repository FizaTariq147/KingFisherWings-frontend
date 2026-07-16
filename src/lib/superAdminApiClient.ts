import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useSuperAdminAuthStore } from '../features/superadmin/store/superAdminAuthStore';
import { AUTH_API } from '../features/auth/api/auth.api';
import { normalizeTokenPair } from '../features/auth/utils/normalizeAuthResponse';

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

function formatApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;

  const record = data as Record<string, unknown>;
  const message = record.message;

  if (Array.isArray(message)) {
    return message.map(String).join('; ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  const statusCode = record.statusCode;
  if (statusCode === 500) {
    return 'Internal server error — the API may require tenant context. Check the Network tab for details.';
  }

  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error;
  }

  return fallback;
}

export const superAdminApiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/backend',
  withCredentials: true,
  timeout: 120_000,
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  pendingQueue = [];
};

superAdminApiClient.interceptors.request.use((config) => {
  const token = useSuperAdminAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

superAdminApiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status ?? 0;
    const message = formatApiErrorMessage(
      err.response?.data,
      err.message ?? 'Something went wrong',
    );
    const original = err.config as RetryConfig | undefined;
    const url = original?.url ?? '';

    const isAuthBootstrap =
      url.includes('/auth/super-admin/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (status === 401 && original && !original._retry && !isAuthBootstrap) {
      const refreshToken = useSuperAdminAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useSuperAdminAuthStore.getState().logout();
        window.location.href = '/superadmin/login';
        return Promise.reject(new ApiError(message, status));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return superAdminApiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${superAdminApiClient.defaults.baseURL}${AUTH_API.refresh}`,
          { refresh_token: refreshToken },
        );
        const pair = normalizeTokenPair(res.data);
        if (!pair) throw new Error('Refresh failed');
        useSuperAdminAuthStore
          .getState()
          .setTokens(pair.accessToken, pair.refreshToken || refreshToken);
        processQueue(null, pair.accessToken);
        original.headers.Authorization = `Bearer ${pair.accessToken}`;
        return superAdminApiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useSuperAdminAuthStore.getState().logout();
        window.location.href = '/superadmin/login';
        return Promise.reject(new ApiError('Session expired. Please sign in again.', 401));
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401 && useSuperAdminAuthStore.getState().isAuthenticated && isAuthBootstrap) {
      // login/refresh failures — don't force redirect loop
      return Promise.reject(new ApiError(message, status));
    }

    return Promise.reject(new ApiError(message, status));
  },
);
