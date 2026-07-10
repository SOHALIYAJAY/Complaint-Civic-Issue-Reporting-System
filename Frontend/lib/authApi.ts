import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getApiBaseUrl } from './config'

// Enhanced token management
class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string | null> | null = null

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('access_token')
    return token && token !== 'undefined' && token !== 'null' ? token : null
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('refresh_token')
    return token && token !== 'undefined' && token !== 'null' ? token : null
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('adminToken')
    localStorage.removeItem('departmentToken')
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp < now
    } catch {
      return true
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    this.refreshPromise = this.performRefresh(refreshToken)
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(refreshToken: string): Promise<string | null> {
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/api/token/refresh/`,
        { refresh: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      )

      const { access } = response.data
      if (access) {
        localStorage.setItem('access_token', access)
        return access
      }

      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearTokens()
      
      // Redirect to login if refresh fails
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      
      return null
    }
  }
}

// Create authenticated API instance
const createAuthenticatedApi = (): AxiosInstance => {
  const api = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 60000,
    withCredentials: false, // CORS handled by backend
  })

  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const tokenManager = TokenManager.getInstance()
      const token = tokenManager.getAccessToken()
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // Log request details in development
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
      }
      
      return config
    },
    (error) => {
      console.error('[API] Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor with token refresh
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses in development
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`)
      }
      return response
    },
    async (error) => {
      const originalRequest = error.config
      
      // Log error details
      if (typeof window !== 'undefined') {
        console.error('[API Error]', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        })
      }

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        const tokenManager = TokenManager.getInstance()
        
        // Check if we have a refresh token
        const refreshToken = tokenManager.getRefreshToken()
        if (!refreshToken) {
          console.log('[API] No refresh token, redirecting to login')
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }

        // Mark request to prevent infinite retry
        originalRequest._retry = true

        try {
          console.log('[API] Attempting token refresh...')
          const newAccessToken = await tokenManager.refreshAccessToken()
          
          if (newAccessToken) {
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            console.log('[API] Token refreshed, retrying request...')
            return api(originalRequest)
          }
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError)
          tokenManager.clearTokens()
          
          // Redirect to login if refresh fails
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshError)
        }
      }

      // Handle network errors
      if (!error.response && error.request) {
        console.error('[API] Network error - no response received')
      } else if (!error.response && !error.request) {
        console.error('[API] Request configuration error:', error.message)
      }

      return Promise.reject(error)
    }
  )

  return api
}

// Public API instance (no auth required)
const createPublicApi = (): AxiosInstance => {
  return axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  })
}

// Export instances and utilities
export const authApi = createAuthenticatedApi()
export const publicApi = createPublicApi()
export const tokenManager = TokenManager.getInstance()

// Helper functions
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  tokenManager.setTokens(accessToken, refreshToken)
}

export const clearAuthTokens = () => {
  tokenManager.clearTokens()
}

export const getValidAccessToken = async (): Promise<string | null> => {
  const tokenManager = TokenManager.getInstance()
  const currentToken = tokenManager.getAccessToken()
  
  if (!currentToken) {
    return null
  }
  
  if (tokenManager.isTokenExpired(currentToken)) {
    console.log('Access token expired, attempting refresh...')
    return await tokenManager.refreshAccessToken()
  }
  
  return currentToken
}

// API methods
export const apiGet = async (url: string, params?: any) => {
  try {
    const response = await authApi.get(url, { params })
    return response.data
  } catch (error) {
    console.error(`GET ${url} failed:`, error)
    throw error
  }
}

export const apiPost = async (url: string, data?: any) => {
  try {
    const response = await authApi.post(url, data)
    return response.data
  } catch (error) {
    console.error(`POST ${url} failed:`, error)
    throw error
  }
}

export const apiPut = async (url: string, data?: any) => {
  try {
    const response = await authApi.put(url, data)
    return response.data
  } catch (error) {
    console.error(`PUT ${url} failed:`, error)
    throw error
  }
}

export const apiDelete = async (url: string) => {
  try {
    const response = await authApi.delete(url)
    return response.data
  } catch (error) {
    console.error(`DELETE ${url} failed:`, error)
    throw error
  }
}

export const publicApiGet = async (url: string, params?: any) => {
  try {
    const response = await publicApi.get(url, { params })
    return response.data
  } catch (error) {
    console.error(`Public GET ${url} failed:`, error)
    throw error
  }
}

export default authApi
