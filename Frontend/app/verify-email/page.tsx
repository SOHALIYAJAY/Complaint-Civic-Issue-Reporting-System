'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const API = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const emailFromQuery = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailFromQuery)

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery.trim().toLowerCase())
  }, [emailFromQuery])
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) { setOtp(text.split('')); otpRefs.current[5]?.focus() }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return }
    setError(''); setVerifying(true)
    try {
      const res = await fetch(`${API}/api/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setSuccess('Email verified! Redirecting...')
        setTimeout(() => {
          const role = data.user?.role
          if (role === 'Admin-User') window.location.href = '/admin'
          else if (role === 'Department-User') window.location.href = '/department'
          else if (role === 'Officer') window.location.href = '/officer'
          else window.location.href = '/dashboard'
        }, 1500)
      } else {
        setError((typeof data.error === 'string' ? data.error : null) || data.message || 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
    } catch { setError('Network error. Please try again.') }
    finally { setVerifying(false) }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return
    setResending(true); setError('')
    try {
      const res = await fetch(`${API}/api/resend-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) { setResendCooldown(60); setOtp(['', '', '', '', '', '']); otpRefs.current[0]?.focus() }
      else setError(data.message || 'Failed to resend OTP')
    } catch { setError('Network error.') }
    finally { setResending(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-border p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to<br />
            <span className="font-semibold text-foreground">{email || 'your email'}</span>
          </p>
        </div>

        {!email && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input key={i} ref={el => { otpRefs.current[i] = el }}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                ${digit ? 'border-primary bg-primary/5 text-primary' : 'border-input bg-background text-foreground'}
                focus:border-primary focus:ring-2 focus:ring-primary/20`}
            />
          ))}
        </div>

        <Button onClick={handleVerify} disabled={verifying || otp.join('').length < 6}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90">
          {verifying
            ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</span>
            : <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Verify Email</span>}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Didn't receive the OTP?{' '}
          {resendCooldown > 0
            ? <span>Resend in {resendCooldown}s</span>
            : <button onClick={handleResend} disabled={resending || !email}
                className="text-primary hover:underline font-semibold disabled:opacity-50">
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

