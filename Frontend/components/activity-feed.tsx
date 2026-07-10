'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, User } from 'lucide-react'
import Link from "next/link"

interface Complaint {
  id: string
  title: string
  Description: string
  location_address: string
  status: 'Pending'| 'in-progress' | 'resolved'
  Category: string
  current_time: string
  priority_level: 'Low' | 'Medium' | 'High'
}

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  Pending:      { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending',    icon: '🟡' },
  'In Process': { color: 'bg-blue-50 text-blue-700 border-blue-200',       label: 'In Process', icon: '🔵' },
  Completed:    { color: 'bg-green-50 text-green-700 border-green-200',    label: 'Completed',  icon: '🟢' },
  // legacy values
  'in-progress': { color: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'In Process', icon: '🔵' },
  resolved:      { color: 'bg-green-50 text-green-700 border-green-200',   label: 'Completed',  icon: '🟢' },
}

const priorityConfig = {
  High: { color: 'bg-red-100 text-red-800', label: 'High' },
  Medium: { color: 'bg-amber-100 text-amber-800', label: 'Medium' },
  Low: { color: 'bg-blue-100 text-blue-800', label: 'Low' },
}

export default function ActivityFeed() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const getApiBase = () => {
    return (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
  }

useEffect(() => {
  setLoading(true)
  const API_BASE_URL = getApiBase()
  const token = localStorage.getItem('access_token')
  const isTokenValid = Boolean(token && token !== 'undefined' && token !== 'null')
  setIsLoggedIn(isTokenValid)
  
  // If user is logged in, show their complaints; otherwise show public complaints
  const endpoint = isTokenValid ? `${API_BASE_URL}/api/getcomplaintlimit/` : `${API_BASE_URL}/api/getpubliccomplaints/`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  if (isTokenValid) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  fetch(endpoint, { headers })
    .then((res) => {
      if (!res.ok) {
        // If we get a 401 on the authenticated endpoint, fall back to public complaints
        if (res.status === 401 && isTokenValid) {
          console.warn('Token expired or invalid, falling back to public complaints')
          // Clear invalid token
          localStorage.removeItem('access_token')
          setIsLoggedIn(false)
          // Retry with public endpoint
          return fetch(`${API_BASE_URL}/api/getpubliccomplaints/`, {
            headers: { 'Content-Type': 'application/json' }
          })
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
    .then((data) => { 
      console.log('Activity feed data:', data)
      // Handle different response structures
      if (Array.isArray(data)) {
        setComplaints(data)
      } else if (data && Array.isArray(data.results)) {
        setComplaints(data.results)
      } else {
        console.warn('Unexpected data format:', data)
        setComplaints([])
      }
    })
    .catch((error) => {
      console.error("Error fetching complaints:", error)
      // If error occurs and we were trying authenticated endpoint, try public
      if (isTokenValid && error.message.includes('401')) {
        console.warn('Authentication failed, showing public complaints')
        localStorage.removeItem('access_token')
        setIsLoggedIn(false)
        // Try public complaints as fallback
        fetch(`${API_BASE_URL}/api/getpubliccomplaints/`, {
          headers: { 'Content-Type': 'application/json' }
        })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setComplaints(data)
          } else if (data && Array.isArray(data.results)) {
            setComplaints(data.results)
          } else {
            setComplaints([])
          }
        })
        .catch((fallbackError) => {
          console.error("Fallback also failed:", fallbackError)
          setComplaints([])
        })
      } else {
        setComplaints([])
      }
    })
    .finally(() => {
      setLoading(false)
    })
}, [])
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {isLoggedIn ? "Your Complaints" : "Live Complaint Activity"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {isLoggedIn 
              ? "Track the status of your submitted civic complaints"
              : "Real-time dashboard showing recent civic complaints and their status"
            }
          </p>
        </div>

        <div className="grid gap-4">
          {loading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`loading-${index}`} className="bg-white rounded-lg border border-border p-6">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))
          ) : complaints.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isLoggedIn ? "You haven't raised any complaints yet" : "No complaints yet"}
              </h3>
              <p className="text-muted-foreground">
                {isLoggedIn 
                  ? "Start by reporting a civic issue in your area!" 
                  : "Be the first to raise a civic issue in your area!"
                }
              </p>
              <Link href="/raise-complaint" className="inline-block mt-4">
                <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  {isLoggedIn ? "Raise Your First Complaint" : "Raise a Complaint"}
                </button>
              </Link>
            </div>
          ) : (
            // Complaints list
            complaints.map((complaint, index) => {
            // Create a unique key using multiple fields to ensure uniqueness
            const uniqueKey = complaint.id || 
              `${complaint.title}-${complaint.Category}-${index}`.replace(/\s+/g, '-').toLowerCase();
            
            return (
            <div
              key={uniqueKey}
              className="group bg-white rounded-lg border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden hover:translate-y-[-2px] slide-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{statusConfig[complaint.status]?.icon || '⚪'}</span>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {complaint.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{complaint.Description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${statusConfig[complaint.status]?.color || 'bg-gray-50 text-gray-700 border-gray-200'} border`}>
                      {statusConfig[complaint.status]?.label || complaint.status}
                    </Badge>
                    <Badge className={priorityConfig[complaint.priority_level]?.color || 'bg-gray-100 text-gray-800'}>
                      {priorityConfig[complaint.priority_level]?.label || complaint.priority_level}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{complaint.location_address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-small">{ complaint.Category }</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{complaint.current_time}</span>
                  </div>
                </div>

                <div className="mt-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Complaint ID:</span> CIV-{complaint.id}
                  </p>
                </div>
              </div>
            </div>
            );
          })
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href='/my-complaints'>
          <button className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-secondary transition-colors"  >
            View All Complaints
          </button>
                   </Link>
        </div>
      </div>
    </section>
  )
}
