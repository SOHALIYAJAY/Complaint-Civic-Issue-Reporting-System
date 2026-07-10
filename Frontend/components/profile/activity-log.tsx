'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, UserCheck, LogIn, Zap, Loader2, ExternalLink } from 'lucide-react'

interface Activity {
  id: string
  type: 'submitted' | 'resolved' | 'updated' | 'login' | 'other'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  // Fallback activities for demo purposes
  const fallbackActivities: Activity[] = [
    {
      id: '1',
      type: 'submitted',
      title: 'Complaint Submitted',
      description: 'Reported pothole on MG Road',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: '2',
      type: 'resolved',
      title: 'Complaint Resolved',
      description: 'Water supply issue fixed in Zone 5',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: '3',
      type: 'updated',
      title: 'Profile Updated',
      description: 'Changed mobile number',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      id: '4',
      type: 'login',
      title: 'Login',
      description: 'Successfully logged in from Windows',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: <LogIn className="w-5 h-5" />,
    },
    {
      id: '5',
      type: 'submitted',
      title: 'Complaint Submitted',
      description: 'Reported street light malfunction',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: <FileText className="w-5 h-5" />,
    },
  ]

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        if (!token) {
          setActivities(fallbackActivities)
          setLoading(false)
          return
        }

        // Fetch user activity from backend
        const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/user-activity/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          
          const activityData = data.data || data || []
          
          // Transform activity data to match our interface
          const transformedActivities = activityData.map((item: any) => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            type: item.type || 'login',
            description: item.description || 'Activity logged',
            timestamp: item.timestamp || new Date().toISOString(),
            icon: getActivityIcon(item.type)
          }))
          
          setActivities(transformedActivities)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch activity data:', errorText)
        }
      } catch (error) {
        console.error('Error fetching activity data:', error)
        
        // Set fallback data for demo
        setActivities(fallbackActivities)
      } finally {
        setLoading(false)
      }
    }

    fetchActivityData()
  }, [])

  const getActivityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'submitted':
        return <FileText className="w-5 h-5" />
      case 'resolved':
        return <CheckCircle className="w-5 h-5" />
      case 'updated':
        return <UserCheck className="w-5 h-5" />
      case 'login':
        return <LogIn className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'submitted':
        return 'bg-blue-100 text-blue-600'
      case 'resolved':
        return 'bg-green-100 text-green-600'
      case 'updated':
        return 'bg-purple-100 text-purple-600'
      case 'login':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border border-slate-200 shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading activity log...</span>
        </div>
      </Card>
    )
  }
}

