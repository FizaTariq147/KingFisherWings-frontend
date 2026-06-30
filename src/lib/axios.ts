import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Lazy import breaks the circular dependency:
// authStore.ts -> axios.ts -> authStore.ts
axiosInstance.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import('@/store/authStore')
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { useAuthStore } = await import('@/store/authStore')
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default axiosInstance