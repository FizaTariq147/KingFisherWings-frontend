import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { PORTAL_AUTH_API } from '@/features/portal-auth/api/portalAuth.api';
import { usePortalAuthStore } from '@/features/portal-auth/store/portalAuthStore';
import { normalizePortalTokenPair } from '@/features/portal-auth/utils/normalizePortalAuth';

export interface ApiEnvelope<T, M = undefined> {
  data: T;
  meta?: M;
  message?: string;
  success?: boolean;
}

export class PortalApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'PortalApiError';
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

  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error;
  }

  return fallback;
}

export const portalApiClient = axios.create({
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

const PORTAL_AUTH_BOOTSTRAP = [
  PORTAL_AUTH_API.login,
  PORTAL_AUTH_API.refresh,
];

function isPortalAuthBootstrap(url?: string): boolean {
  if (!url) return false;
  return PORTAL_AUTH_BOOTSTRAP.some((path) => url.includes(path));
}

function isPortalAuthNoRefresh(url?: string): boolean {
  if (!url) return false;
  return (
    isPortalAuthBootstrap(url) ||
    url.includes(PORTAL_AUTH_API.logout)
  );
}

portalApiClient.interceptors.request.use((config) => {
  if (isPortalAuthBootstrap(config.url)) {
    if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
    return config;
  }

  const token = usePortalAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

portalApiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status ?? 0;
    const message = formatApiErrorMessage(
      err.response?.data,
      err.message ?? 'Something went wrong',
    );
    const original = err.config as RetryConfig | undefined;
    const url = original?.url ?? '';

    if (status === 401 && original && !original._retry && !isPortalAuthNoRefresh(url)) {
      const refreshToken = usePortalAuthStore.getState().refreshToken;
      if (!refreshToken) {
        usePortalAuthStore.getState().logout();
        window.location.href = '/portal/login';
        return Promise.reject(new PortalApiError(message, status));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return portalApiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${portalApiClient.defaults.baseURL}${PORTAL_AUTH_API.refresh}`,
          { refresh_token: refreshToken },
        );
        const pair = normalizePortalTokenPair(res.data);
        if (!pair) throw new Error('Refresh failed');
        usePortalAuthStore
          .getState()
          .setTokens(pair.accessToken, pair.refreshToken || refreshToken);
        processQueue(null, pair.accessToken);
        original.headers.Authorization = `Bearer ${pair.accessToken}`;
        return portalApiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        usePortalAuthStore.getState().logout();
        window.location.href = '/portal/login';
        return Promise.reject(new PortalApiError('Session expired. Please sign in again.', 401));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new PortalApiError(message, status));
  },
);
