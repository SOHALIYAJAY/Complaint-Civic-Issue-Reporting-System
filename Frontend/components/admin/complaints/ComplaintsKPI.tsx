'use client'

import { TrendingUp, TrendingDown, Users, FileText, Target, Activity, RefreshCw } from 'lucide-react'

interface KPIData {
  total_comp: number
  Pending_comp: number
  inprogress_comp: number
  resolved_comp: number
  rejected_comp?: number
  sla_compliance: number
}

interface ComplaintsKPIProps {
  kpi: KPIData
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

export default function ComplaintsKPI({ kpi, loading, error, onRefresh }: ComplaintsKPIProps) {
  // Calculate additional metrics

  // const resolvedComplaints = Math.round(kpi.total_comp * (kpi.sla_compliance / 100))
  // const pendingComplaints = kpi.total_comp - resolvedComplaints
  // const avgComplaintsPerDept = Math.round(kpi.total_comp / kpi.total_dept)

  const kpiCards = [
    {
      title: 'Total Complaints',
      value: kpi.total_comp?.toLocaleString() || '0',
      badge: 'All Time',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      // subtitle: `${pendingComplaints} pending`
    },
    {
      title: 'Resolved Complaints',
      value: kpi.resolved_comp?.toString() || '0',
      badge: 'Active',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-700',
      icon: <Target className="w-5 h-5 text-purple-600" />,
      // subtitle: `${avgComplaintsPerDept} avg/dept`
    },
    {
      title: 'Pending Complaint',
      value: kpi.Pending_comp?.toString() || '0',
      badge: 'Available',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: <Users className="w-5 h-5 text-green-600" />,
      // subtitle:  `${resolvedComplaints} resolved`
    },
    {
      title: 'In-progress Complaint',
      value: kpi.inprogress_comp?.toString() || '0',
      badge: 'Available',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: <Users className="w-5 h-5 text-green-600" />,
      // subtitle:  `${resolvedComplaints} resolved`
    }
    // {
    //   title: 'SLA Compliance',
    //   value: `${kpi.sla_compliance?.toFixed(1) || '0'}%`,
    //   trend: kpi.sla_compliance >= 90 ? '+1.2%' : '-0.5%',
    //   trendUp: kpi.sla_compliance >= 90,
    //   badge: kpi.sla_compliance >= 90 ? 'On Target' : 'Needs Attention',
    //   bgColor: kpi.sla_compliance >= 90 ? 'bg-indigo-50' : 'bg-orange-50',
    //   borderColor: kpi.sla_compliance >= 90 ? 'border-indigo-500' : 'border-orange-500',
    //   textColor: kpi.sla_compliance >= 90 ? 'text-indigo-700' : 'text-orange-700',
    //   icon: <Activity className="w-5 h-5" style={{ color: kpi.sla_compliance >= 90 ? '#4f46e5' : '#ea580c' }} />,
    //   // subtitle: `${resolvedComplaints} resolved`
    // },
  ]

  // Performance indicators calculated from actual data
  const total = kpi.total_comp || 0
  const safeDivide = (num: number) => (total > 0 ? (num / total) * 100 : 0)

  const responseRate = safeDivide(kpi.resolved_comp + kpi.inprogress_comp)
  const resolutionRate = safeDivide(kpi.resolved_comp)
  const pendingRate = safeDivide(kpi.Pending_comp)

  const performanceIndicators = [
    {
      label: 'Response Rate',
      value: `${responseRate.toFixed(1)}%`,
      color: responseRate > 80 ? 'bg-green-500' : 'bg-orange-500',
      status: responseRate > 80 ? 'Excellent' : 'Needs Improvement',
    },
    {
      label: 'Resolution Rate',
      value: `${resolutionRate.toFixed(1)}%`,
      color: resolutionRate > 70 ? 'bg-blue-500' : 'bg-orange-500',
      status: resolutionRate > 70 ? 'Good' : 'Needs Attention',
    },
    {
      label: 'Pending Rate',
      value: `${pendingRate.toFixed(1)}%`,
      color: pendingRate < 30 ? 'bg-green-500' : 'bg-orange-500',
      status: pendingRate < 30 ? 'Under Control' : 'High',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Performance Overview</h2>
          <p className="text-sm text-slate-600 mt-1">Real-time metrics from your database</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="bg-white rounded-lg border-t-4 border-slate-300 shadow-sm p-5 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-12"></div>
                <div className="h-3 bg-slate-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      {!loading && !error && (
        <div className="space-y-4">
          {/* Live data indicator */}
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-medium">Live data from database</span>
            <span className="text-xs text-green-500 ml-auto">Last updated: Just now</span>
          </div>

          {/* Main KPI Cards - always 4 in a single row on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map((card, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-lg border-t-4 ${card.borderColor} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 p-5`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                    {/* <p className="text-xs text-slate-600 mt-1">{card.subtitle}</p> */}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`${card.bgColor} ${card.textColor} p-2 rounded-lg`}>
                      {card.icon}
                    </div>
                    <div className={`${card.bgColor} ${card.textColor} px-2 py-1 rounded text-xs font-semibold`}>
                      {card.badge}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
  
            <div className="flex-1">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
              <p className="text-red-600 text-sm mt-1">Please try refreshing the page or contact support if the issue persists.</p>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
