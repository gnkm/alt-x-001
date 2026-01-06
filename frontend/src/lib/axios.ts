import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

// Create axios instance
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })

  failedQueue = []
}

// Request interceptor: Add access token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Handle 401 errors and refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for login and refresh endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        await useAuthStore.getState().refreshAccessToken()
        processQueue(null)
        isRefreshing = false

        // Retry the original request with new token
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error)
        isRefreshing = false

        // Logout user and redirect to login
        useAuthStore.getState().logout()

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
