/// <reference types="vite/client" />
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track whether a refresh is in progress to guard against infinite loops
let isRefreshing = false

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const is401 = error.response?.status === 401
    const alreadyRetried = originalRequest._retry === true

    // Guard: if this is a refresh request returning 401, fail immediately
    if (is401 && originalRequest.url?.includes('/auth/refresh')) {
      isRefreshing = false
      return Promise.reject(error)
    }

    // If 401 and we haven't retried yet and we're not already refreshing
    if (is401 && !alreadyRetried && !isRefreshing) {
      isRefreshing = true
      originalRequest._retry = true

      try {
        await apiClient.post('/auth/refresh')
        isRefreshing = false
        return apiClient(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
