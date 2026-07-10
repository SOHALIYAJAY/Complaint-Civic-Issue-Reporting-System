import { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export class AuthenticationError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Global error handler
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorCallbacks: Array<(error: ApiError) => void> = []

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  subscribe(callback: (error: ApiError) => void): () => void {
    this.errorCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  private notify(error: ApiError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    })
  }

  handleError(error: any, context?: string): ApiError {
    const apiError = this.parseError(error, context)
    
    // Log error for debugging
    console.error('API Error:', {
      error: apiError,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
    })

    // Notify subscribers
    this.notify(apiError)

    return apiError
  }

  private parseError(error: any, context?: string): ApiError {
    // Axios errors
    if (error.isAxiosError || error instanceof AxiosError) {
      return this.parseAxiosError(error, context)
    }

    // Network errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return {
        message: 'Unable to connect to server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        details: error
      }
    }

    // Authentication errors
    if (error instanceof AuthenticationError) {
      return {
        message: error.message,
        status: error.status,
        code: 'AUTH_ERROR',
        details: error
      }
    }

    // Validation errors
    if (error instanceof ValidationError) {
      return {
        message: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details
      }
    }

    // Generic errors
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }

  private parseAxiosError(error: AxiosError, context?: string): ApiError {
    const response = error.response
    const request = error.request

    // No response received (network error)
    if (!response && request) {
      return {
        message: 'No response from server. Please check your connection.',
        code: 'NO_RESPONSE',
        details: error
      }
    }

    // Request never sent (configuration error)
    if (!response && !request) {
      return {
        message: 'Request configuration error.',
        code: 'REQUEST_ERROR',
        details: error
      }
    }

    // Server responded with error
    const status = response?.status
    const data = response?.data || {}

    switch (status) {
      case 400:
        return {
          message: (data as any)?.message || 'Bad request. Please check your input.',
          status,
          code: 'BAD_REQUEST',
          details: data
        }

      case 401:
        return {
          message: (data as any)?.message || 'Authentication required. Please login.',
          status,
          code: 'UNAUTHORIZED',
          details: data
        }

      case 403:
        return {
          message: (data as any)?.message || 'Access denied. You don\'t have permission.',
          status,
          code: 'FORBIDDEN',
          details: data
        }

      case 404:
        return {
          message: (data as any)?.message || 'Resource not found.',
          status,
          code: 'NOT_FOUND',
          details: data
        }

      case 422:
        return {
          message: (data as any)?.message || 'Invalid data provided.',
          status,
          code: 'VALIDATION_ERROR',
          details: data
        }

      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          status,
          code: 'RATE_LIMIT',
          details: data
        }

      case 500:
        return {
          message: 'Server error. Please try again later.',
          status,
          code: 'SERVER_ERROR',
          details: data
        }

      case 502:
      case 503:
      case 504:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          status,
          code: 'SERVICE_UNAVAILABLE',
          details: data
        }

      default:
        return {
          message: (data as any)?.message || `Request failed with status ${status}.`,
          status,
          code: 'HTTP_ERROR',
          details: data
        }
    }
  }

  // Get user-friendly error message
  getUserMessage(error: ApiError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'NO_RESPONSE':
        return 'Connection issue. Please check your internet and try again.'
      
      case 'UNAUTHORIZED':
        return 'Please login to continue.'
      
      case 'FORBIDDEN':
        return 'You don\'t have permission to perform this action.'
      
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.'
      
      case 'RATE_LIMIT':
        return 'Too many requests. Please wait a moment and try again.'
      
      case 'SERVER_ERROR':
      case 'SERVICE_UNAVAILABLE':
        return 'Service temporarily unavailable. Please try again later.'
      
      default:
        return error.message || 'An error occurred. Please try again.'
    }
  }

  // Check if error is recoverable
  isRecoverable(error: ApiError): boolean {
    const recoverableCodes = [
      'NETWORK_ERROR',
      'NO_RESPONSE',
      'SERVER_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT'
    ]

    return recoverableCodes.includes(error.code || '')
  }

  // Check if error requires re-authentication
  requiresReauth(error: ApiError): boolean {
    return error.code === 'UNAUTHORIZED' || error.status === 401
  }

  // Check if error is a validation issue
  isValidationError(error: ApiError): boolean {
    return error.code === 'VALIDATION_ERROR' || 
           error.code === 'BAD_REQUEST' || 
           error.status === 400
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance()

// Convenience functions
export const handleError = (error: any, context?: string): ApiError => {
  return globalErrorHandler.handleError(error, context)
}

export const subscribeToErrors = (callback: (error: ApiError) => void): (() => void) => {
  return globalErrorHandler.subscribe(callback)
}

export const getUserErrorMessage = (error: any): string => {
  const apiError = handleError(error)
  return globalErrorHandler.getUserMessage(apiError)
}

export const isRecoverableError = (error: any): boolean => {
  const apiError = handleError(error)
  return globalErrorHandler.isRecoverable(apiError)
}

export const requiresReauthentication = (error: any): boolean => {
  const apiError = handleError(error)
  return globalErrorHandler.requiresReauth(apiError)
}

export default globalErrorHandler
