'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, CheckCircle } from 'lucide-react'

export default function AdminLogout() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [loggedOut, setLoggedOut] = useState(false)

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      localStorage.removeItem('user')
      sessionStorage.removeItem('adminToken')
      sessionStorage.removeItem('adminUser')
      setIsLoggingOut(false)
      setLoggedOut(true)
      setTimeout(() => router.push('/login'), 2000)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-6">
          {!loggedOut ? (
            <>
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <LogOut className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Logout</h1>
                <p className="text-muted-foreground">
                  Are you sure you want to logout from the Admin Portal?
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Logged Out Successfully</h2>
              <p className="text-muted-foreground">Redirecting to login page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
