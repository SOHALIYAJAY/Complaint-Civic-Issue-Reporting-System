"use client"

import { useState, useEffect } from "react"
import { User, Home, Settings, LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardHeader() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('Token:', token ? 'exists' : 'missing')
      
      if (!token) {
        console.log('No token found, using guest user')
        setLoading(false)
        return
      }
      
      const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const response = await fetch(`${API_BASE_URL}/api/userdetails/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Response status:', response.status)
      
      if (response.status === 401) {
        console.log('Unauthorized - token may be expired')
        localStorage.removeItem('access_token')
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        if (response.status === 500) {
          console.error('Server error - backend may be down or has issues')
          // Don't throw error for 500, just use guest mode
          setLoading(false)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('User data received:', data)
      
      // Check if user has completed their details
      if (data.success && data.data) {
        const userData = data.data
        if (!userData.mobile_number || !userData.address || !userData.district || !userData.taluka || !userData.ward_number) {
          console.log('User details incomplete, redirecting to user-details page')
          router.push('/user-details')
          return
        }
      }
      
      setUser(data)
      
    } catch (error) {
      console.error("Error fetching user details:", error)
      // Clear invalid token
      localStorage.removeItem('access_token')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            Home
          </a>
          <span>/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load your information.</p>
          </div>
        </div>
      </div>
    )
  }

  // Show content when user data is available
  if (!user || !user.data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            Home
          </a>
          <span>/</span>
          <span className="text-foreground font-medium">Dashboard</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, User!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your complaints today.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="/" className="hover:text-primary transition-colors">
          <Home className="h-4 w-4" />
          Home
        </a>
        <span>/</span>
        <span className="text-foreground font-medium">Dashboard</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user?.data?.username || user?.data?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your complaints today.
          </p>
        </div>
      </div>
    </div>
  )
}

