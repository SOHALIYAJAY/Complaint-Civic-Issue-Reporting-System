'use client'

import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatData {
  total_complaints: number
  resolved_complaints: number
  pending_complaints: number
  in_progress_complaints: number
  sla_compliance: number
}

interface StatCard {
  label: string
  value: number | string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  borderColor: string
  suffix?: string
}

function AnimatedCounter({ targetValue }: { targetValue: number | undefined | null }) {
  const [count, setCount] = useState(0)
  
  // Ensure targetValue is a valid number
  const safeTargetValue = (targetValue === undefined || targetValue === null || isNaN(targetValue)) ? 0 : targetValue

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = safeTargetValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= safeTargetValue) {
        setCount(safeTargetValue)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [safeTargetValue])

  return <span>{count}</span>
}

export default function StatisticsCards() {
  const [stats, setStats] = useState<StatData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
  
  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('access_token')
      const isTokenValid = Boolean(token && token !== 'undefined' && token !== 'null')
      
      let endpoint = `${API_BASE_URL}/api/getcompinfo/`
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (isTokenValid) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        // If not logged in, we can't show personal stats
        setStats({
          total_complaints: 0,
          resolved_complaints: 0,
          pending_complaints: 0,
          in_progress_complaints: 0,
          sla_compliance: 0
        })
        setLoading(false)
        return
      }
      
      const response = await fetch(endpoint, { headers })
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token invalid, clear it and show empty stats
          localStorage.removeItem('access_token')
          setStats({
            total_complaints: 0,
            resolved_complaints: 0,
            pending_complaints: 0,
            in_progress_complaints: 0,
            sla_compliance: 0
          })
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } else {
        const data = await response.json()
        setStats({
          total_complaints: data.total_complaints || 0,
          resolved_complaints: data.Resolved_complaints || 0,
          pending_complaints: data.Pending_complaints || 0,
          in_progress_complaints: data.in_progress_complaints || 0,
          sla_compliance: data.SLA_complaince || 0
        })
      }
      
    } catch (error) {
      console.error("Error fetching statistics:", error)
      setError('Failed to load statistics')
      setStats({
        total_complaints: 0,
        resolved_complaints: 0,
        pending_complaints: 0,
        in_progress_complaints: 0,
        sla_compliance: 0
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
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-t-blue-400'
    },
    {
      label: 'Resolved',
      value: formatNumber(stats.resolved_complaints || 0),
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-t-green-400'
    },
    {
      label: 'Pending',
      value: formatNumber(stats.pending_complaints || 0),
      icon: <Clock className="w-5 h-5" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-t-yellow-400'
    },
    {
      label: 'In Progress',
      value: formatNumber(stats.in_progress_complaints || 0),
      icon: <TrendingUp className="w-5 h-5" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-t-purple-400'
    }
  ] : []

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl border border-gray-200 border-t-4 ${card.borderColor} p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 h-full`}
        >
          <div className={`${card.bgColor} ${card.textColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
            {card.icon}
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedCounter targetValue={typeof card.value === 'string' ? parseInt(card.value) || 0 : card.value} />
              {card.suffix && <span className="text-lg font-normal text-gray-600">{card.suffix}</span>}
            </p>
            <p className="text-sm text-gray-600">{card.label}</p>
          </div>
        </div>
      ))}
      
    </div>
  )
}

