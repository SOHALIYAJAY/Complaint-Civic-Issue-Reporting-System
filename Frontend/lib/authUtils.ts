import { tokenRefreshService } from './tokenRefresh'

// Check if token is expired (simple check)
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Date.now() / 1000
    return payload.exp < now
  } catch {
    return true
  }
}

// Get valid access token (refresh if needed)
export const getValidAccessToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('access_token')
  
  if (!token || token === 'undefined' || token === 'null') {
    return null
  }
  
  if (isTokenExpired(token)) {
    console.log('Access token expired, attempting refresh...')
    return await tokenRefreshService.refreshAccessToken()
  }
  
  return token
}

// Setup periodic token refresh (optional - refresh 5 minutes before expiry)
export const setupTokenRefresh = () => {
  if (typeof window === 'undefined') return
  
  setInterval(async () => {
    const token = localStorage.getItem('access_token')
    
    if (token && token !== 'undefined' && token !== 'null') {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Date.now() / 1000
        const timeUntilExpiry = payload.exp - now
        
        // Refresh if less than 5 minutes remaining
        if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
          console.log('Token expiring soon, refreshing...')
          await tokenRefreshService.refreshAccessToken()
        }
      } catch (error) {
        console.error('Error checking token expiry:', error)
      }
    }
  }, 60000) // Check every minute
}
