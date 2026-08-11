import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { VENDOR_AUTH_API } from '@/features/vendor-auth/api/vendorAuth.api';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { normalizeVendorTokenPair } from '@/features/vendor-auth/utils/normalizeVendorAuth';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';

export interface VendorApiEnvelope<T, M = undefined> {
  data: T;
  meta?: M;
  message?: string;
  success?: boolean;
}

export class VendorApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'VendorApiError';
    this.status = status;
  }
}

function formatApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const record = data as Record<string, unknown>;
  const message = record.message;
  if (Array.isArray(message)) return message.map(String).join('; ');
  if (typeof message === 'string' && message.trim()) return message.trim();
  if (typeof record.error === 'string' && record.error.trim()) return record.error.trim();
  return fallback;
}

async function resolveVendorErrorMessage(err: AxiosError, fallback: string): Promise<string> {
  const data = err.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      if (text.trim()) {
        try {
          return formatApiErrorMessage(JSON.parse(text), fallback);
        } catch {
          if (text.length < 400) return text;
        }
      }
    } catch {
      /* keep fallback */
    }
    return fallback;
  }
  return formatApiErrorMessage(data, fallback);
}

export const vendorApiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    '/backend',
  withCredentials: false,
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

const VENDOR_AUTH_BOOTSTRAP = [VENDOR_AUTH_API.login, VENDOR_AUTH_API.refresh];

function isVendorAuthBootstrap(url?: string): boolean {
  if (!url) return false;
  return VENDOR_AUTH_BOOTSTRAP.some((path) => url.includes(path));
}

function isVendorAuthNoRefresh(url?: string): boolean {
  if (!url) return false;
  return isVendorAuthBootstrap(url) || url.includes(VENDOR_AUTH_API.logout);
}

vendorApiClient.interceptors.request.use((config) => {
  if (isVendorAuthBootstrap(config.url)) {
    if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
    return config;
  }
  const token = useVendorAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

vendorApiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status ?? 0;
    const message = await resolveVendorErrorMessage(err, err.message ?? 'Something went wrong');
    const original = err.config as RetryConfig | undefined;
    const url = original?.url ?? '';

    if (status === 401 && original && !original._retry && !isVendorAuthNoRefresh(url)) {
      const refreshToken = useVendorAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useVendorAuthStore.getState().logout();
        clearVendorQueryCache();
        window.location.href = '/vendor/login';
        return Promise.reject(new VendorApiError(message, status));
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return vendorApiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${vendorApiClient.defaults.baseURL}${VENDOR_AUTH_API.refresh}`, {
          refresh_token: refreshToken,
        });
        const pair = normalizeVendorTokenPair(res.data);
        if (!pair) throw new Error('Refresh failed');
        useVendorAuthStore.getState().setTokens(pair.accessToken, pair.refreshToken || refreshToken);
        processQueue(null, pair.accessToken);
        original.headers.Authorization = `Bearer ${pair.accessToken}`;
        return vendorApiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useVendorAuthStore.getState().logout();
        clearVendorQueryCache();
        window.location.href = '/vendor/login';
        return Promise.reject(new VendorApiError('Session expired. Please sign in again.', 401));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(new VendorApiError(message, status));
  },
);
