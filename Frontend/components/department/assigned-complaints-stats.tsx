"use client"

import { useEffect, useState } from "react"
import api, { apiGet } from '@/lib/api'
import {
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface StatCard {
  label: string
  value: string
  trend: string
  trendUp: boolean
  icon: React.ReactNode
  borderColor: string
  iconBg: string
  iconColor: string
}

function AnimatedValue({ target }: { target: string }) {
  const [display, setDisplay] = useState("0")
  const numericTarget = parseFloat(target.replace(/,/g, ""))

  useEffect(() => {
    if (isNaN(numericTarget)) {
      setDisplay(target)
      return
    }
    const duration = 1200
    const steps = 36
    const increment = numericTarget / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericTarget) {
        setDisplay(target)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current).toLocaleString())
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericTarget, target])

  return <span>{display}</span>
}


export default function AssignedComplaintsStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await apiGet('/api/department/dashboard/')
      
      // Extract stats from the response
      setStats({
        total: data.stats?.total || 0,
        pending: data.stats?.pending || 0,
        inProgress: data.stats?.inProgress || 0,
        resolved: data.stats?.resolved || 0
      })
    } catch (error) {
      console.error('Error fetching department stats:', error)
      // Set fallback data on error
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total Assigned",
      value: stats.total.toString(),
      icon: <FileText className="w-5 h-5" />,
      borderColor: "border-t-slate-500",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
    {
      label: "Pending",
      value: stats.pending.toString(),
      icon: <Clock className="w-5 h-5" />,
      borderColor: "border-t-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "In Progress",
      value: stats.inProgress.toString(),
      icon: <Loader2 className="w-5 h-5" />,
      borderColor: "border-t-indigo-400",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      label: "Resolved",
      value: stats.resolved.toString(),
      icon: <CheckCircle2 className="w-5 h-5" />,
      borderColor: "border-t-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-4 animate-pulse">
            <div className="h-20"></div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, i) => (
        <div
          key={i}
          className={`bg-white rounded-lg border border-[#e2e8f0] border-t-4 ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.iconBg} ${card.iconColor} p-2 rounded-lg`}>
              {card.icon}
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            {card.label}
          </p>
          <p className="text-2xl font-bold text-slate-800">
            <AnimatedValue target={card.value} />
          </p>
        </div>
      ))}
    </div>
  )
}
