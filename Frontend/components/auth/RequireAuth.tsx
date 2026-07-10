'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type AllowedRole = 'Civic-User' | 'Admin-User' | 'Department-User' | 'Officer'

interface RequireAuthProps {
  children: React.ReactNode
  role?: AllowedRole | AllowedRole[]
}

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

      if (!token || token === 'undefined' || token === 'null') {
        const search = pathname ? `?next=${encodeURIComponent(pathname)}` : ''
        router.replace(`/login${search}`)
        return
      }

      if (role) {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        let userRole: string | null = null

        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            userRole = parsed?.role || parsed?.User_Role || null
          } catch {
            userRole = null
          }
        }

        let normalizedRole: string | null = null
        if (userRole) {
          const lower = String(userRole).toLowerCase()
          if (lower.includes('officer')) normalizedRole = 'Officer'
          else normalizedRole = userRole
        }

        const allowedRoles = Array.isArray(role) ? role : [role]
        if (!normalizedRole || !allowedRoles.includes(normalizedRole as AllowedRole)) {
           router.replace('/dashboard')
           return
         }
      }

      setChecking(false)
    } catch (error) {
      console.error('Auth check error:', error)
      setChecking(false)
    }
  }, [router, pathname, role])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold text-foreground">Checking your session…</p>
          <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
