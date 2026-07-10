import { tokenManager } from './authApi'

// Enhanced token refresh with queue management
class TokenRefreshService {
  private static instance: TokenRefreshService
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string | null) => void
    reject: (error: any) => void
  }> = []

  static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService()
    }
    return TokenRefreshService.instance
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true

    try {
      const newToken = await tokenManager.refreshAccessToken()
      this.processQueue(null, newToken)
      return newToken
    } catch (error) {
      this.processQueue(error, null)
      return null
    } finally {
      this.isRefreshing = false
    }
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    this.failedQueue = []
  }

  // Setup periodic token refresh
  setupPeriodicRefresh(): void {
    if (typeof window === 'undefined') return

    setInterval(async () => {
      const currentToken = tokenManager.getAccessToken()
      
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]))
          const now = Date.now() / 1000
          const timeUntilExpiry = payload.exp - now
          
          // Refresh if less than 5 minutes remaining
          if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
            console.log('Token expiring soon, proactive refresh...')
            await this.refreshAccessToken()
          }
        } catch (error) {
          console.error('Error checking token expiry:', error)
        }
      }
    }, 60000) // Check every minute
  }

  // Initialize the service
  initialize(): void {
    this.setupPeriodicRefresh()
    
    // Add visibility change listener to refresh when tab becomes active
    if (typeof window !== 'undefined' && 'document' in window) {
      document.addEventListener('visibilitychange', async () => {
        if (!document.hidden) {
          const currentToken = tokenManager.getAccessToken()
          if (currentToken && tokenManager.isTokenExpired(currentToken)) {
            console.log('Tab became active, refreshing expired token...')
            await this.refreshAccessToken()
          }
        }
      })
    }
  }
}

export const tokenRefreshService = TokenRefreshService.getInstance()

// Initialize the service when module is loaded
if (typeof window !== 'undefined') {
  tokenRefreshService.initialize()
}

export default tokenRefreshService
