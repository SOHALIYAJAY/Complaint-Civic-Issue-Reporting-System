"use client"

import React, { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import DashboardStatsCards from '@/components/officer/dashboard/dashboard-stats-cards'
import MonthlyTrendPanel from '@/components/officer/dashboard/monthly-trend'
import RecentComplaintsPanel from '@/components/officer/dashboard/recent-complaints-panel'

interface DashboardStats {
  totalComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  inProgressComplaints: number
  overdueComplaints: number
  averageResolutionTime: number
  performanceScore: number
  todayComplaints: number
  weeklyComplaints: number
}

interface RecentComplaint {
  id: number
  title: string
  category: string
  status: string
  priority: string
  date: string
  citizenName: string
  location: string
}

interface MonthlyData {
  month: string
  complaints: number
}

export default function OfficerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentComplaints, setRecentComplaints] = useState<RecentComplaint[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [departmentName, setDepartmentName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const defaultStats: DashboardStats = {
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    overdueComplaints: 0,
    averageResolutionTime: 0,
    performanceScore: 0,
    todayComplaints: 0,
    weeklyComplaints: 0,
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/api/officer/dashboard-stats/`, { headers })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        const errorData = await statsResponse.text()
        console.error('Stats error response:', errorData)
      }

      // Fetch recent complaints
      const complaintsResponse = await fetch(`${API_BASE}/api/officer/recent-complaints/`, { headers })
      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json()
        setRecentComplaints(complaintsData)
      } else {
        const errorData = await complaintsResponse.text()
        console.error('Complaints error response:', errorData)
      }

      // Fetch monthly trends
      const trendsResponse = await fetch(`${API_BASE}/api/officer/monthly-trends/`, { headers })
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        setMonthlyData(trendsData)
      } else {
        const errorData = await trendsResponse.text()
        console.error('Trends error response:', errorData)
      }

      // Fetch profile to show officer department in header
      const profileResponse = await fetch(`${API_BASE}/api/officer/profile/`, { headers })
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setDepartmentName(typeof profileData?.department === 'string' ? profileData.department : '')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sidebar-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
              {departmentName ? (
                <p className="text-sm text-gray-700 mt-1">Department: {departmentName}</p>
              ) : null}
              <p className="text-sm text-gray-500 mt-1">Monitor your complaint management performance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <DashboardStatsCards stats={stats || defaultStats} />

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <MonthlyTrendPanel data={monthlyData} />

          {/* Recent Complaints */}
          <RecentComplaintsPanel complaints={recentComplaints} />
        </div>

      </div>
  )
}
