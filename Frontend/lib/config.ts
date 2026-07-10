/**
 * Safely get the API base URL with runtime fallback
 * This function is evaluated at runtime, ensuring process.env is always available
 */
export function getApiBaseUrl(): string {
  // Support both Next.js and Vite-style env names (safe no-op when missing).
  const envUrl =
    (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) ||
    (typeof process !== 'undefined' ? process.env.VITE_API_URL : undefined) ||
    'https://civic-backend-iob6.onrender.com'
  const productionFallback = 'https://civic-backend-iob6.onrender.com'
  
  const apiUrl = (envUrl || productionFallback).replace(/\/+$/, '')
  
  // Debug logging only on client side
  if (typeof window !== 'undefined') {
    console.log('[API Config] Using API URL:', apiUrl)
    if (!envUrl) {
      console.warn('[API Config] API env URL not set, using fallback:', productionFallback)
    }
  }
  
  return apiUrl
}

// Export for use in components
export const API_BASE_URL = typeof window !== 'undefined' 
  ? getApiBaseUrl() 
  : (
      (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) ||
      (typeof process !== 'undefined' ? process.env.VITE_API_URL : undefined) ||
      'https://civic-backend-iob6.onrender.com'
    ).replace(/\/+$/, '')
