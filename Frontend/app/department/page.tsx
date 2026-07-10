"use client"

import { useState, useEffect, useCallback } from "react"
import {
  BarChart3, TrendingUp, Users, FileText, Clock, CheckCircle2,
  Activity, AlertTriangle, Calendar, Target, RefreshCw, Eye, ChevronDown
} from "lucide-react"
import {
  ResponsiveContainer, PieChart, Pie, Tooltip, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts"
import Link from "next/link"

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Stats {
  total: number
  pending: number
  inProgress: number
  resolved: number
}

interface Performance {
  avgResolutionTime: number
  slaCompliance: number
  officerWorkload: number
  citizenSatisfaction: number
}

interface RecentComplaint {
  id: number
  title: string
  description: string
  status: string
  priority: string
  current_time: string
  location_address: string
  Category: string
}

interface ActivityItem {
  id: string
  type: string
  description: string
  time: string
  officer?: string
}

interface DashboardData {
  department?: { name: string; category: string; email: string; phone: string; head: string; officer_count: number }
  stats: Stats
  performance: Performance
  monthlyCounts: Record<string, number>
  recentComplaints: RecentComplaint[]
  recentActivity: ActivityItem[]
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

const STATUS_STYLES: Record<string, string> = {
  "Pending":    "bg-amber-100 text-amber-800 border border-amber-200",
  "In Process": "bg-blue-100 text-blue-800 border border-blue-200",
  "Completed":  "bg-emerald-100 text-emerald-800 border border-emerald-200",
}

const PRIORITY_STYLES: Record<string, string> = {
  "High":   "bg-red-100 text-red-700",
  "Medium": "bg-orange-100 text-orange-700",
  "Low":    "bg-green-100 text-green-700",
}

const PIE_COLORS = ["#f59e0b", "#6366f1", "#10b981"]
const AREA_GRADIENT_ID = "deptAreaGrad"

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("departmentToken") ||
    localStorage.getItem("access_token")
  return token && token !== "undefined" && token !== "null"
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" }
}

function statusStyle(s: string) {
  return STATUS_STYLES[s] ?? "bg-gray-100 text-gray-700 border border-gray-200"
}

function priorityStyle(p: string) {
  return PRIORITY_STYLES[p] ?? "bg-gray-100 text-gray-700"
}

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function KpiCard({
  label, value, sub, icon, iconBg, borderColor,
}: {
  label: string; value: number | string; sub: string
  icon: React.ReactNode; iconBg: string; borderColor: string
}) {
  return (
    <div className={`bg-white rounded-xl border-t-4 ${borderColor} border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBg} p-2.5 rounded-lg`}>{icon}</div>
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  )
}

function SectionCard({ title, subtitle, icon, iconBg, children }: {
  title: string; subtitle?: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className={`${iconBg} p-2 rounded-lg`}>{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DepartmentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [chartYear, setChartYear] = useState(CURRENT_YEAR)
  const [yearOpen, setYearOpen] = useState(false)
  // Store all years' monthly data keyed by year
  const [allMonthlyData, setAllMonthlyData] = useState<Record<number, Record<string, number>>>({})

  const API = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/api/department/dashboard/`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      setData(json)
      // Cache current year monthly counts from dashboard response
      if (json.monthlyCounts) {
        setAllMonthlyData(prev => ({ ...prev, [CURRENT_YEAR]: json.monthlyCounts }))
      }
      setLastUpdated(new Date())
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [API])

  // Fetch monthly data for a specific year via complaint-status-trends
  const fetchYearData = useCallback(async (year: number) => {
    if (allMonthlyData[year]) return // already cached
    try {
      const res = await fetch(`${API}/api/complaint-status-trends/?year=${year}`, { headers: getAuthHeaders() })
      if (!res.ok) return
      const json = await res.json()
      const monthly: Record<string, number> = {}
      ;(json.monthly_data ?? []).forEach((d: any, i: number) => {
        monthly[String(i + 1)] = Number(d.complaints ?? 0)
      })
      setAllMonthlyData(prev => ({ ...prev, [year]: monthly }))
    } catch {}
  }, [API, allMonthlyData])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30_000)
    return () => clearInterval(id)
  }, [fetchData])

  useEffect(() => {
    fetchYearData(chartYear)
  }, [chartYear])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  // â”€â”€ Derived data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const monthlyChartData = MONTH_NAMES.map((name, i) => ({
    name,
    complaints: (allMonthlyData[chartYear] ?? data?.monthlyCounts ?? {})[String(i + 1)] ?? 0,
  }))

  const pieData = data
    ? [
        { name: "Pending",     value: data.stats.pending,    color: PIE_COLORS[0] },
        { name: "In Progress", value: data.stats.inProgress, color: PIE_COLORS[1] },
        { name: "Resolved",    value: data.stats.resolved,   color: PIE_COLORS[2] },
      ]
    : []

  const totalPie = pieData.reduce((s, e) => s + e.value, 0)

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-32">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-72">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-48 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // â”€â”€ Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { stats, performance, recentComplaints, recentActivity } = data

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {data.department?.category
              ? `${data.department.category} Department Head Dashboard`
              : 'Department Head Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.department?.category
              ? `Real-time overview of ${data.department.category} Department operations`
              : 'Real-time overview of department operations'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <span className="text-xs text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</span>}
          <button onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* â”€â”€ Dept Info Banner â”€â”€ */}
      {data.department && data.department.name !== 'All Departments' && (
        <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wider">Your Department</p>
                <p className="text-lg font-bold">
                  {data.department.category ? `${data.department.category} Department` : data.department.name}
                </p>
                <p className="text-sm text-white/70">Department Head Portal</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              {data.department.email && <div><p className="text-white/60 text-xs">Email</p><p className="font-semibold">{data.department.email}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ KPI Cards â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Complaints"
          value={stats.total}
          sub="All complaints in system"
          icon={<FileText className="w-5 h-5" />}
          iconBg="bg-[#eef1f7] text-[#1e3a5f]"
          borderColor="border-t-[#1e3a5f]"
        />
        <KpiCard
          label="Pending"
          value={stats.pending}
          sub="Awaiting action"
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-amber-50 text-amber-600"
          borderColor="border-t-amber-500"
        />
        <KpiCard
          label="In Progress"
          value={stats.inProgress}
          sub="Currently being addressed"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-[#eef1f7] text-[#1e3a5f]"
          borderColor="border-t-[#1e3a5f]"
        />
        <KpiCard
          label="Resolved"
          value={stats.resolved}
          sub="Successfully completed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          borderColor="border-t-emerald-500"
        />
      </div>

      {/* â”€â”€ Charts Row â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Donut Chart â€” 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Breakdown</p>
              <h3 className="text-base font-bold text-gray-900 mt-0.5">Complaint Distribution</h3>
            </div>
            <div className="bg-[#eef1f7] text-[#1e3a5f] p-2 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          {totalPie > 0 ? (
            <>
              {/* Donut with center label */}
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={58} outerRadius={88}
                      dataKey="value"
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => {
                        const pct = totalPie ? ((val / totalPie) * 100).toFixed(1) : "0"
                        return [`${val} (${pct}%)`, name]
                      }}
                      contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-900">{totalPie}</span>
                  <span className="text-xs text-gray-400 font-medium">Total</span>
                </div>
              </div>

              {/* Legend rows */}
              <div className="px-5 pb-5 space-y-2.5 mt-1">
                {pieData.map((e, i) => {
                  const pct = totalPie ? Math.round((e.value / totalPie) * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                      <span className="text-sm text-gray-600 flex-1">{e.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: e.color }} />
                        </div>
                        <span className="text-xs font-bold text-gray-900 w-6 text-right">{e.value}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FileText className="w-10 h-10 text-gray-200" />
              <p className="text-sm">No complaint data yet</p>
            </div>
          )}
        </div>

        {/* Area Chart â€” 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trend Analysis</p>
              <h3 className="text-base font-bold text-gray-900 mt-0.5">Monthly Complaints â€” {chartYear}</h3>
            </div>
            {/* Year dropdown */}
            <div className="relative">
              <button
                onClick={() => setYearOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {chartYear}
                <ChevronDown className={`w-4 h-4 transition-transform ${yearOpen ? 'rotate-180' : ''}`} />
              </button>
              {yearOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {YEAR_OPTIONS.map(y => (
                    <button
                      key={y}
                      onClick={() => { setChartYear(y); setYearOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        chartYear === y ? 'bg-[#eef1f7] text-[#1e3a5f] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={248}>
              <AreaChart data={monthlyChartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  cursor={{ stroke: "#1e3a5f", strokeWidth: 1, strokeDasharray: "4 4" }}
                  formatter={(v: any) => [`${v} complaints`, "Count"]}
                />
                <Area
                  type="monotone"
                  dataKey="complaints"
                  stroke="#1e3a5f"
                  strokeWidth={2.5}
                  fill={`url(#${AREA_GRADIENT_ID})`}
                  dot={{ r: 3.5, fill: "#1e3a5f", strokeWidth: 0 }}
                  activeDot={{ r: 5.5, fill: "#1e3a5f", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* â”€â”€ Performance + Activity Row â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Performance Metrics */}
        <SectionCard
          title="Performance Metrics"
          subtitle="Department efficiency indicators"
          icon={<Target className="w-5 h-5" />}
          iconBg="bg-purple-50 text-purple-600"
        >
          <div className="p-5 space-y-1">
            {[
              {
                label: "SLA Compliance",
                value: `${performance.slaCompliance.toFixed(1)}%`,
                bar: performance.slaCompliance,
                color: performance.slaCompliance >= 80 ? "bg-emerald-500" : performance.slaCompliance >= 60 ? "bg-amber-500" : "bg-red-500",
              },
              {
                label: "Avg Resolution Time",
                value: `${performance.avgResolutionTime} days`,
                bar: Math.min(100, performance.avgResolutionTime * 10),
                color: "bg-[#1e3a5f]",
              },
              {
                label: "Officer Workload",
                value: `${performance.officerWorkload} / officer`,
                bar: Math.min(100, performance.officerWorkload * 5),
                color: "bg-orange-500",
              },
              {
                label: "Citizen Satisfaction",
                value: `${performance.citizenSatisfaction} / 5.0`,
                bar: (performance.citizenSatisfaction / 5) * 100,
                color: "bg-purple-500",
              },
            ].map((m, i) => (
              <div key={i} className="py-2.5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-600">{m.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, m.bar)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          subtitle="Latest department actions"
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        >
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {recentActivity.length > 0 ? recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.type === "resolution" ? "bg-emerald-100" : "bg-[#eef1f7]"
                }`}>
                  {a.type === "resolution"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    : <FileText className="w-3.5 h-3.5 text-[#1e3a5f]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{a.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{a.time}</span>
                    {a.officer && (
                      <>
                        <span className="text-gray-300">â€¢</span>
                        <span className="text-xs text-gray-400">{a.officer}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-gray-400">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* â”€â”€ Recent Complaints Table â”€â”€ */}
      <SectionCard
        title="Recent Complaints"
        subtitle="Latest complaints submitted to department"
        icon={<FileText className="w-5 h-5" />}
        iconBg="bg-gray-100 text-gray-600"
      >
        <div className="flex items-center justify-end px-5 pt-3">
          <Link href="/department/assigned" className="inline-flex items-center gap-1 text-sm text-[#1e3a5f] hover:text-[#2d5a9e] font-medium">
            View All <Eye className="w-4 h-4" />
          </Link>
        </div>
        {recentComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#1e3a5f] font-semibold">#{c.id}</td>
                    <td className="px-5 py-3 text-gray-900 max-w-[180px] truncate">{c.title}</td>
                    <td className="px-5 py-3 text-gray-500">{c.Category || "â€”"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{c.current_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No recent complaints</p>
          </div>
        )}
      </SectionCard>

      {/* â”€â”€ Status Overview â”€â”€ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Department Status Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Systems Operational</p>
              <p className="text-xs text-emerald-700">No active issues</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {stats.pending > 10 ? "High Volume Alert" : "Normal Volume"}
              </p>
              <p className="text-xs text-amber-700">{stats.pending} pending complaints</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-[#eef1f7] rounded-lg border border-[#c5d0e0]">
            <TrendingUp className="w-5 h-5 text-[#1e3a5f] flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#1e3a5f]">
                SLA:{" "}
                <span className={
                  performance.slaCompliance >= 80 ? "text-emerald-600" :
                  performance.slaCompliance >= 60 ? "text-amber-600" : "text-red-600"
                }>
                  {performance.slaCompliance >= 80 ? "Excellent" :
                   performance.slaCompliance >= 60 ? "Good" : "Needs Improvement"}
                </span>
              </p>
              <p className="text-xs text-[#1e3a5f]/70">{performance.slaCompliance.toFixed(1)}% compliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-refresh note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-2">
        <RefreshCw className="w-3 h-3" />
        Auto-refreshing every 30 seconds
      </div>
    </div>
  )
}
