'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'
import GoogleLoginBtn from '@/components/GoogleLoginBtn'
import { useRouter } from 'next/navigation'
import { getApiBaseUrl } from '../../lib/config'

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) router.push('/dashboard')
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const username = formData.username.trim()
    const email = formData.email.trim().toLowerCase()
    if (!username) {
      setError('Username is required.')
      return
    }
    if (!email) {
      setError('Email is required.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters (stricter rules may apply).')
      return
    }
    setLoading(true)
    try {
      const payload = {
        username,
        email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        confirmPassword: formData.confirmPassword,
        role: 'Civic-User',
      }
      const registerUrl = `${getApiBaseUrl()}/api/register/`

      const attemptRegister = async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000)
        try {
          return await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })
        } finally {
          clearTimeout(timeoutId)
        }
      }

      let res: Response
      try {
        res = await attemptRegister()
      } catch (firstError: any) {
        const retryable =
          firstError?.name === 'AbortError' ||
          (firstError instanceof TypeError) ||
          (typeof firstError?.message === 'string' && firstError.message.toLowerCase().includes('network'))
        if (!retryable) throw firstError
        console.warn('[Signup] First attempt failed, retrying in 5s...')
        await new Promise((resolve) => setTimeout(resolve, 5000))
        res = await attemptRegister()
      }
      const text = await res.text()
      let data: Record<string, unknown> = {}
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
      } catch {
        setError('Invalid response from server. Please try again.')
        return
      }
      if (!res.ok) {
        const msg =
          typeof data.message === 'string'
            ? data.message
            : 'Registration failed. Please check your details.'
        setError(msg)
        return
      }
      if (data.success) {
        const em = typeof data.email === 'string' ? data.email : email
        router.push(`/verify-email?email=${encodeURIComponent(em)}`)
        return
      }
      setError(typeof data.message === 'string' ? data.message : 'Registration failed.')
    } catch (err: any) {
      console.error('[Signup] register request failed:', err)
      if (err?.name === 'AbortError') {
        setError('Server is starting, please try again in a few seconds.')
      } else {
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'Network error. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="text-white text-center space-y-8 max-w-lg relative z-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-4">
            <h2 className="text-6xl font-bold drop-shadow-lg">Join Gujarat Civic Portal</h2>
            <p className="text-xl text-white/90 leading-relaxed">Be part of transparent governance and make your voice heard</p>
          </div>
          <div className="space-y-4 pt-8 text-left">
            {[
              { title: 'Report Issues Instantly', sub: '24/7 complaint registration' },
              { title: 'Track Progress', sub: 'Real-time status updates' },
              { title: 'Direct Communication', sub: 'Connect with departments' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 hover:bg-white/20 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{item.title}</p>
                  <p className="text-sm text-white/80">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create Account</h1>
            <p className="text-muted-foreground text-lg">Sign up to get started — we&apos;ll email you a code to verify</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Username</label>
              <div className="relative group">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input type="text" value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter your username" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input type="email" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="your@email.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Role</label>
              <div className="rounded-xl border-2 border-input bg-background/50 px-4 py-3 text-sm text-foreground">
                Civic User
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Create a password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters; use a mix of letters and numbers if you can</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input type={showPassword ? 'text' : 'password'} value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Confirm your password" required />
              </div>
            </div>

            <Button type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all group"
              disabled={loading}>
              {loading ? 'Creating account...' : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-background text-muted-foreground uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLoginBtn />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
