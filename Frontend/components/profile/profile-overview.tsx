'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Edit } from 'lucide-react'
import { useEffect, useState } from 'react'

interface UserData {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  User_Role: string
  mobile_number?: string
  address?: string
  district?: string
  taluka?: string
  ward_number?: string
  date_joined: string
  total_complaints: number
}

export default function ProfileOverview() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/userdetails/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setUserData(result.data)
        } else {
          throw new Error(result.error || 'Failed to fetch user data')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch user data')
        
        // Set fallback data for demo
        setUserData({
          id: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          User_Role: 'Civic-User',
          mobile_number: '9876543210',
          address: '123 Demo Street',
          district: 'Ahmedabad',
          taluka: 'Ahmedabad',
          ward_number: '1',
          date_joined: '2024-01-01',
          total_complaints: 5
        })
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '')
  }

  const getSignupYear = (date: string) => {
    return date ? new Date(date).getFullYear() : 'N/A'
  }

  const getRoleDisplayName = (role: string) => {
    return role?.replace('-', ' ') || 'User'
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </Card>
    )
  }

  if (error && !userData) {
    return (
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-0 shadow-lg p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error loading profile</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg p-8">
        <div className="text-center text-gray-600">No user data available</div>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
        {/* Profile Picture Section */}
        <div className="relative group">
          <Avatar className="w-32 h-32 border-4 border-blue-600">
            <AvatarImage 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} 
              alt="Profile" 
            />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {getInitials(userData.first_name, userData.last_name)}
            </AvatarFallback>
          </Avatar>
          <Button
            size="sm"
            className="absolute bottom-0 right-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Change profile picture"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {userData.first_name} {userData.last_name}
            </h2>
            <p className="text-slate-600 mt-1">{userData.email}</p>
            {userData.mobile_number && (
              <p className="text-slate-500 text-sm">{userData.mobile_number}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
              {getRoleDisplayName(userData.User_Role)}
            </Badge>
            <Badge className="bg-green-500 hover:bg-green-600 text-white">Active</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-300">
            <div>
              <p className="text-slate-500 text-sm">Total Complaints</p>
              <p className="text-slate-900 font-semibold text-lg">{userData.total_complaints}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Member Since</p>
              <p className="text-slate-900 font-semibold">{getSignupYear(userData.date_joined)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Location</p>
              <p className="text-slate-900 font-semibold">{userData.district || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

