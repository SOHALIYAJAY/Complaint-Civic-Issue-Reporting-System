'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackendResponse {
  total_comp: number
  resolved_comp: number
  pending_comp: number
  inprogress_comp: number
}

function AnimatedCounter({ targetValue }: { targetValue: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const increment = targetValue / (1200 / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= targetValue) { setCount(targetValue); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [targetValue])
  return <>{count}</>
}

const CARD_CONFIG = [
  { key: 'total_comp',      label: 'Total',       icon: AlertCircle, iconBg: 'bg-[#eef1f7] text-[#1e3a5f]', iconColor: 'text-[#1e3a5f]', border: 'border-t-[#1e3a5f]'  },
  { key: 'resolved_comp',   label: 'Resolved',    icon: CheckCircle, iconBg: 'bg-emerald-50 text-emerald-600', iconColor: 'text-emerald-600', border: 'border-t-emerald-500' },
  { key: 'pending_comp',    label: 'Pending',     icon: Clock,       iconBg: 'bg-amber-50 text-amber-600',   iconColor: 'text-amber-600',   border: 'border-t-amber-500'   },
  { key: 'inprogress_comp', label: 'In Progress', icon: Zap,         iconBg: 'bg-[#eef1f7] text-[#1e3a5f]', iconColor: 'text-[#1e3a5f]',  border: 'border-t-indigo-500'  },
] as const

export default function ComplaintsSummary() {
  const [data, setData] = useState<BackendResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const fetchStats = async () => {
    setLoading(true); setError(false)
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Accept': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${API_BASE}/complaintsinfo/`, { headers, signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [API_BASE])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="rounded-xl border bg-muted/40 animate-pulse h-28" />)}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-center justify-between">
        <p className="text-red-700 text-sm font-medium">Could not load statistics. Backend may be offline.</p>
        <Button size="sm" variant="outline" onClick={fetchStats} className="border-red-300 text-red-700 gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARD_CONFIG.map(({ key, label, icon: Icon, iconBg, iconColor, border }) => {
        const value = data[key]
        return (
          <div key={key} className={`bg-card rounded-xl border-t-4 ${border} border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`${iconBg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground">
              <AnimatedCounter targetValue={value} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total {label.toLowerCase()} complaints</p>
          </div>
        )
      })}
    </div>
  )
}

