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