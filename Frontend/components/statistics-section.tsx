'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, Users, FileText, CheckCircle, Clock } from 'lucide-react'

interface StatData {
  total_complaints: number
  resolved_complaints: number
  pending_complaints: number
  in_progress_complaints: number
  sla_compliance: number
  total_categories: number
  total_users: number
  total_departments: number
}

type RawStatData = Partial<StatData> & {
  Resolved_complaints?: number
  Pending_complaints?: number
  SLA_complaince?: number
}

interface StatCard {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  suffix?: string
}

export default function StatisticsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<StatData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getApiBase = () => {
    const env = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com' as string
    if (!env) throw new Error('Missing NEXT_PUBLIC_API_URL')
    return env
  }
  
  useEffect(() => {
    setIsVisible(true)
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      const API_BASE_URL = getApiBase()
      const response = await fetch(`${API_BASE_URL}/api/stats/`, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data: RawStatData & Record<string, unknown> = await response.json()
      console.log('[Platform Statistics] API response:', data)

      setStats({
        total_complaints: Number(data.total_complaints ?? 0),
        resolved_complaints: Number(data.resolved ?? data.resolved_complaints ?? data.Resolved_complaints ?? 0),
        pending_complaints: Number(data.pending ?? data.pending_complaints ?? data.Pending_complaints ?? 0),
        in_progress_complaints: 0,
        sla_compliance: Number(data.sla ?? data.sla_compliance ?? data.SLA_complaince ?? 0),
        total_categories: Number(data.categories ?? data.total_categories ?? 0),
        total_users: Number(data.users ?? data.total_users ?? 0),
        total_departments: Number(data.total_departments ?? 0),
      })
      
    } catch (error) {
      console.error("Error fetching statistics:", error)
      setError('Failed to load statistics')
      
      // Set fallback data
      setStats({
        total_complaints: 0,
        resolved_complaints: 0,
        pending_complaints: 0,
        in_progress_complaints: 0,
        sla_compliance: 0,
        total_categories: 0,
        total_users: 0,
        total_departments: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return '0'
    }
    return num.toLocaleString()
  }

  const statCards: StatCard[] = stats ? [
    {
      label: 'Total Complaints',
      value: formatNumber(stats.total_complaints || 0),
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Resolved',
      value: formatNumber(stats.resolved_complaints || 0),
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'Pending',
      value: formatNumber(stats.pending_complaints || 0),
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'SLA Compliance',
      value: `${Number(stats.sla_compliance ?? 0).toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      label: 'Categories',
      value: formatNumber(stats.total_categories || 0),
      icon: <Users className="w-5 h-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      label: 'Users',
      value: formatNumber(stats.total_users || 0),
      icon: <Users className="w-5 h-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  ] : []

  if (loading) {
    return (
      <section className={`py-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <p className="text-gray-600">Loading statistics...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`py-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real-time insights into civic complaint management and resolution across Gujarat
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statCards.map((card, index) => (
            <div
              key={card.label}
              className={`bg-white rounded-xl border ${card.borderColor} p-6 min-h-[160px] flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className={`${card.bgColor} ${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                  {card.suffix && <span className="text-lg font-normal text-gray-600">{card.suffix}</span>}
                </p>
                <p className="text-sm text-gray-600">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
