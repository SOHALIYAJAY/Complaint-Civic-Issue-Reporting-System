'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Complaints{
  id: string
  title: string
  category: string
  status: 'open' | 'in-progress' | 'resolved' | 'pending'
  dateSubmitted: string
  slaRemaining: string
}

export default function RecentComplaints() {
  const [complaint, setComplaint] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
  
  useEffect(() => {
    const fetchComplaints = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        console.log('No authentication token found - showing fallback data')
        // Set fallback demo data instead of empty array
        setComplaint([
          {
            id: '1',
            title: 'Street Light Not Working',
            category: 'Infrastructure',
            status: 'pending',
            dateSubmitted: new Date().toISOString(),
            slaRemaining: '2 days'
          },
          {
            id: '2', 
            title: 'Garbage Collection Issue',
            category: 'Sanitation',
            status: 'in-progress',
            dateSubmitted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            slaRemaining: '1 day'
          },
          {
            id: '3',
            title: 'Water Supply Problem',
            category: 'Water',
            status: 'resolved',
            dateSubmitted: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
            slaRemaining: 'Resolved'
          }
        ])
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/getcomplaintlimit/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('Recent complaints data:', data)
        
        // Handle different response structures
        if (Array.isArray(data)) {
          setComplaint(data)
        } else if (data && Array.isArray(data.results)) {
          setComplaint(data.results)
        } else {
          console.warn('Unexpected data format:', data)
          setComplaint([])
        }
      } catch (error) {
        console.error("Error fetching complaints:", error)
        // Set fallback data on error
        setComplaint([
          {
            id: '1',
            title: 'Street Light Not Working',
            category: 'Infrastructure',
            status: 'pending',
            dateSubmitted: new Date().toISOString(),
            slaRemaining: '2 days'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])
  

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      'open': { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: <AlertCircle className="w-4 h-4" /> },
      'in-progress': { bg: 'bg-orange-500/10', text: 'text-orange-600', icon: <Clock className="w-4 h-4" /> },
      'resolved': { bg: 'bg-green-500/10', text: 'text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
      'pending': { bg: 'bg-purple-500/10', text: 'text-purple-600', icon: <AlertCircle className="w-4 h-4" /> },
    }

    const config = statusConfig[status] || statusConfig['open']
    return (
      <span className={`${config.bg} ${config.text} text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-fit`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Recent Complaints</h2>

      <div className="glass-effect rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Complaint ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">SLA Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                // Loading state
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`loading-${index}`}>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></td>
                  </tr>
                ))
              ) : complaint.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No complaints found</p>
                      <Link href="/raise-complaint" className="text-primary hover:text-secondary transition-colors text-sm">
                        Raise your first complaint â†’
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                // Complaints list
                complaint.map((comp, index) => (
                  <tr key={index} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-primary">{comp.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{comp.title}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{comp.category_name || comp.Category}</td>
                    <td className="px-6 py-4">{getStatusBadge(comp.status)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{comp.slaRemaining || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/my-complaints">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            View All Complaints
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

