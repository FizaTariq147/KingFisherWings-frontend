import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const axiosInstance = axios.create({
  baseURL:         import.meta.env.VITE_API_URL,
  withCredentials: true,   // sends httpOnly refresh-token cookie
  timeout:         15_000,
})

// ── Request: attach access token ───────────────────────────────────────────
axiosInstance.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: silent refresh on 401 ───────────────────────────────────────
let isRefreshing   = false
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

    // Don't retry auth endpoints or already-retried requests
    if (!original || original._retry) return Promise.reject(error)
    if (original.url?.includes('/auth/login'))   return Promise.reject(error)
    if (original.url?.includes('/auth/refresh')) return Promise.reject(error)
    if (original.url?.includes('/auth/logout'))  return Promise.reject(error)

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
    isRefreshing    = true

    try {
      await useAuthStore.getState().refreshAccessToken()
      const newToken = useAuthStore.getState().accessToken!
      processQueue(null, newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ── DEV-ONLY: mock unreachable backend so frontend work isn't blocked ──────
// Activate by setting VITE_MOCK_API=true in your .env.local (gitignored).
// import.meta.env.DEV is stripped to false in production builds, so this
// block never runs outside local dev regardless of the env var.
if (import.meta.env.DEV && import.meta.env.VITE_MOCK_API === 'true') {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Only intercept true network failures (server unreachable) —
      // real 401s, 403s, validation errors etc. still reject normally
      // so your login/permission UI keeps behaving correctly.
      const isUnreachable = !error.response

      if (!isUnreachable) return Promise.reject(error)

      const url = error.config?.url ?? ''
      console.warn(`[mock] backend unreachable — returning fixture data for ${url}`)

      return Promise.resolve({
        data:       getMockResponse(url),
        status:     200,
        statusText: 'OK (mocked)',
        headers:    {},
        config:     error.config,
      })
    },
  )
}

function getMockResponse(url: string): unknown {
  if (url.includes('homepage-config')) {
    return {
      config: {
        userId: 'dev-user-1',
        columns: 3,
        widgets: [
          { id: 'open_jobs',           visible: true, position: 0 },
          { id: 'pending_quotations',  visible: true, position: 1 },
          { id: 'shipments_by_mode',   visible: true, position: 2 },
          { id: 'upcoming_etds',       visible: true, position: 3 },
          { id: 'pending_tasks',       visible: true, position: 4 },
          { id: 'recent_jobs',         visible: true, position: 5 },
        ],
        financialVisibility: {
          canSeeRevenue:   false,
          canSeeGP:        false,
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