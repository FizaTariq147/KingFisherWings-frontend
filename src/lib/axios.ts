import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // Render free tier can cold-start for 30–90s+.
  timeout: 120_000,
})

const AUTH_PUBLIC_URLS = [
  '/auth/login',
  '/auth/tenant-login',
  '/auth/refresh',
  '/auth/super-admin/login',
  '/auth/super-admin/signup',
  '/health',
]

/** Logout needs Bearer — do not strip Authorization. Still skip 401 refresh retry. */
const AUTH_NO_REFRESH_RETRY = [
  ...AUTH_PUBLIC_URLS,
  '/auth/logout',
  '/auth/logout-all',
]

function isAuthPublicUrl(url?: string): boolean {
  if (!url) return false
  return AUTH_PUBLIC_URLS.some((path) => url.includes(path))
}

function isAuthNoRefreshRetryUrl(url?: string): boolean {
  if (!url) return false
  return AUTH_NO_REFRESH_RETRY.some((path) => url.includes(path))
}

// ── Request: attach access token (never on public login/refresh) ───────────
axiosInstance.interceptors.request.use(async (config) => {
  if (isAuthPublicUrl(config.url)) {
    // Login/refresh must be unauthenticated — leftover Bearer/Cookie can break
    // credential checks or crash Auth (Swagger Try-it-out does not send these).
    if (config.headers) {
      delete config.headers.Authorization
      delete config.headers.authorization
      delete config.headers.Cookie
      delete config.headers.cookie
    }
    return config
  }
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: silent refresh on 401 ───────────────────────────────────────
let isRefreshing = false
let pendingQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  )
  pendingQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined

    if (!original || original._retry) return Promise.reject(error)
    if (isAuthNoRefreshRetryUrl(original.url)) return Promise.reject(error)

    if (error.response?.status !== 401) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      await useAuthStore.getState().refreshAccessToken()
      const newToken = useAuthStore.getState().accessToken
      if (!newToken) throw new Error('No access token after refresh')
      processQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().markSessionExpired()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ── DEV-ONLY: mock unreachable backend so frontend work isn't blocked ──────
if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true') {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const isUnreachable = !error.response

      if (!isUnreachable) return Promise.reject(error)

      const url = error.config?.url ?? ''
      console.warn(`[mock] backend unreachable — returning fixture data for ${url}`)

      return Promise.resolve({
        data: getMockResponse(url),
        status: 200,
        statusText: 'OK (mocked)',
        headers: {},
        config: error.config,
      })
    },
  )
}

function getMockResponse(url: string): unknown {
  // Auth fixtures — never return [] for login (that surfaces as "no access token").
  if (url.includes('/auth/tenant-login') || url.includes('/auth/login') || url.includes('/auth/super-admin/login')) {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    const payload = btoa(
      JSON.stringify({
        sub: '00000000-0000-4000-8000-000000000001',
        role: 'TENANT_ADMIN',
        type: 'tenant',
        slug: 'demo-tenant',
        tenant_slug: 'demo-tenant',
      }),
    )
    const access = `${header}.${payload}.mock`
    const refresh = `${header}.${btoa(JSON.stringify({ typ: 'refresh' }))}.mock`
    return {
      data: {
        access_token: access,
        refresh_token: refresh,
        user: {
          id: '00000000-0000-4000-8000-000000000001',
          email: 'admin@demo.local',
          first_name: 'Demo',
          last_name: 'Admin',
          role: 'TENANT_ADMIN',
          tenant_id: '00000000-0000-4000-8000-000000000001',
        },
      },
    }
  }

  if (url.includes('/auth/refresh')) {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ sub: '00000000-0000-4000-8000-000000000001', role: 'TENANT_ADMIN' }))
    return {
      data: {
        access_token: `${header}.${payload}.mock`,
        refresh_token: `${header}.${btoa(JSON.stringify({ typ: 'refresh' }))}.mock`,
      },
    }
  }

  if (url.includes('/auth/me')) {
    return {
      data: {
        id: '00000000-0000-4000-8000-000000000001',
        email: 'admin@demo.local',
        first_name: 'Demo',
        last_name: 'Admin',
        role: { slug: 'TENANT_ADMIN', name: 'Tenant Admin' },
        tenant_id: '00000000-0000-4000-8000-000000000001',
        permissions: [],
        preferred_country_code: 'AE',
      },
    }
  }

  if (url.includes('/locale/defaults')) {
    const hasCountry = url.includes('country=')
    if (!hasCountry) {
      return {
        country_code: null,
        dial_code: null,
        base_currency: null,
        timezone: null,
        timezones: [],
        tax_id_label: null,
        has_postal_pattern: false,
        has_tax_pattern: false,
        country_required: false,
      }
    }
    return {
      country_code: 'AE',
      dial_code: '+971',
      base_currency: 'AED',
      timezone: 'Asia/Dubai',
      timezones: ['Asia/Dubai'],
      tax_id_label: 'UAE TRN (15 digits)',
      has_postal_pattern: true,
      has_tax_pattern: true,
      country_required: false,
    }
  }

  if (url.match(/\/locale\/[A-Z]{2}$/i)) {
    return {
      country_code: 'AE',
      dial_code: '+971',
      base_currency: 'AED',
      timezone: 'Asia/Dubai',
      timezones: ['Asia/Dubai'],
      tax_id_label: 'UAE TRN (15 digits)',
      has_postal_pattern: true,
      has_tax_pattern: true,
      country_required: false,
    }
  }

  if (url.includes('homepage-config')) {
    return {
      config: {
        userId: 'dev-user-1',
        columns: 3,
        widgets: [
          { id: 'open_jobs', visible: true, position: 0 },
          { id: 'pending_quotations', visible: true, position: 1 },
          { id: 'shipments_by_mode', visible: true, position: 2 },
          { id: 'upcoming_etds', visible: true, position: 3 },
          { id: 'pending_tasks', visible: true, position: 4 },
          { id: 'recent_jobs', visible: true, position: 5 },
        ],
        financialVisibility: {
          canSeeRevenue: false,
          canSeeGP: false,
          canSeeARBalance: false,
          canSeeAPBalance: false,
        },
      },
    }
  }

  if (url.includes('/jobs/summary/upcoming-etds')) {
    return [
      { jobNumber: 'JOB-2026-0451', vessel: 'MSC ISABELLA', etd: '2026-07-09', pol: 'JEBEL ALI', pod: 'ROTTERDAM' },
      { jobNumber: 'JOB-2026-0452', vessel: 'CMA CGM MARCO POLO', etd: '2026-07-11', pol: 'JEBEL ALI', pod: 'HAMBURG' },
      { jobNumber: 'JOB-2026-0453', vessel: 'MAERSK EDMONTON', etd: '2026-07-13', pol: 'JEBEL ALI', pod: 'FELIXSTOWE' },
    ]
  }

  if (url.includes('/tasks/pending')) {
    return [
      { id: 'task-1', title: 'Submit customs declaration for JOB-2026-0451', dueDate: '2026-07-07', priority: 'high' },
      { id: 'task-2', title: 'Follow up with agent on B/L release', dueDate: '2026-07-08', priority: 'medium' },
      { id: 'task-3', title: 'Confirm container return for JOB-2026-0439', dueDate: '2026-07-09', priority: 'low' },
      { id: 'task-4', title: 'Review pending quotation for ABC Traders', dueDate: '2026-07-10', priority: 'medium' },
    ]
  }

  return []
}
