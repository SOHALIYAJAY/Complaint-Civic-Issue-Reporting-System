'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import GoogleLoginBtn from '@/components/GoogleLoginBtn'
import { useRouter } from 'next/navigation'
import { publicApi } from '../../lib/authApi'
import { getApiBaseUrl } from '../../lib/config'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  const getRedirectPath = (user: any) => {
    const userRole = user.User_Role || user.role || 'Civic-User'
    
    switch (userRole) {
      case 'Department-User':
        return '/department'
      case 'Admin-User':
        return '/admin'
      case 'Officer':
        return '/officer'
      case 'Civic-User':
      default:
        return '/user-details' // First go to user details, then dashboard
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      const user = JSON.parse(userData)
      const redirectPath = getRedirectPath(user)
      router.push(redirectPath)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Enhanced logging for debugging
      const apiUrl = `${getApiBaseUrl()}/api/login/`
      console.log('[Login] Attempting login to:', apiUrl)
      console.log('[Login] Form data:', { email: formData.email, password: '***' })

      const isRetryableLoginError = (err: any) =>
        err?.code === 'ECONNABORTED' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('timeout')) ||
        (!err?.response && !!err?.request)

      let response: any = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          // Login should use public client (no auth-refresh interceptor side effects).
          response = await publicApi.post('/api/login/', {
            email: formData.email.trim(),
            password: formData.password
          })
          break
        } catch (err: any) {
          if (attempt === 1 && isRetryableLoginError(err)) {
            console.warn('[Login] First attempt failed, retrying in 5s...')
            await new Promise((resolve) => setTimeout(resolve, 5000))
            continue
          }
          throw err
        }
      }
      
      const data = response.data
      console.log('[Login] Response:', data)

      if (data.success) {
        // Store tokens securely
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        console.log('[Login] Authentication successful, redirecting...')
        const redirectPath = getRedirectPath(data.user)
        window.location.href = redirectPath
      } else {
        // Handle specific error cases
        if (data.requires_verification) {
          console.log('[Login] Email verification required')
          window.location.href = `/verify-email?email=${encodeURIComponent(data.email || formData.email)}`
          return
        }
        
        console.log('[Login] Login failed:', data.message)
        setError(data.message || 'Invalid email or password.')
      }
    } catch (error: any) {
      console.error('[Login] Error:', error)
      
      // Enhanced error handling
      let errorMessage = 'Cannot connect to server'
      let statusCode = ''
      
      if (error.response) {
        // Server responded with error status
        statusCode = ` (${error.response.status})`
        const responseData = error.response.data || {}

        // Important: backend returns 403 + requires_verification for unverified users.
        // Axios throws on non-2xx, so handle it in catch and continue OTP flow.
        if (responseData.requires_verification) {
          const verifyEmail = responseData.email || formData.email
          window.location.href = `/verify-email?email=${encodeURIComponent(verifyEmail)}`
          return
        }
        
        if (responseData?.message) {
          errorMessage = responseData.message
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid credentials'
        } else if (error.response.status === 403) {
          errorMessage = 'Access forbidden'
        } else if (error.response.status === 500) {
          errorMessage = 'Server error'
        } else if (error.response.status === 429) {
          errorMessage = 'Too many requests'
        }
      } else if (error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'))) {
        errorMessage = 'Server is starting, please try again in a few seconds'
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Server is starting, please try again in a few seconds'
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused'
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Server not found'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(`${errorMessage}${statusCode}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</h1>
            <p className="text-muted-foreground text-lg">Sign in to Gujarat Civic Portal</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all group" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {!isLoggedIn && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-background text-muted-foreground uppercase tracking-wider">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLoginBtn />
              </div>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-semibold transition-colors">
              Create account →
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="text-white text-center space-y-8 max-w-lg relative z-10 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="space-y-4">
            <h2 className="text-6xl font-bold drop-shadow-lg">Gujarat Civic Portal</h2>
            <p className="text-xl text-white/90 leading-relaxed">Transparent Governance. Citizen Empowerment. Smart Solutions.</p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
              <p className="text-4xl font-bold mb-1">24/7</p>
              <p className="text-sm text-white/80">Support</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
              <p className="text-4xl font-bold mb-1">94%</p>
              <p className="text-sm text-white/80">Success Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
              <p className="text-4xl font-bold mb-1">7-14</p>
              <p className="text-sm text-white/80">Days Resolution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
