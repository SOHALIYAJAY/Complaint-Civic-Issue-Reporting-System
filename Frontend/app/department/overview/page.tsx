"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Building2, Users, FileText, CheckCircle2, Clock, TrendingUp,
  AlertTriangle, RefreshCw, Mail, Phone, User, ChevronRight,
  Home, BarChart3, Award, Shield
} from "lucide-react"
import Link from "next/link"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell
} from "recharts"

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DeptInfo {
  id: number; name: string; code: string; description: string
  email: string; phone: string; head: string
}
interface Stats {
  total: number; pending: number; inProgress: number; resolved: number
  slaCompliance: number; totalOfficers: number; activeOfficers: number
}
interface OfficerRow {
  id: number; name: string; email: string; status: string
  handled: number; resolved: number; score: number
}
interface BreakdownItem { name: string; count: number; color: string }
interface RecentComplaint {
  id: number; title: string; category: string; status: string
  priority: string; date: string; officer: string; location: string
}
interface OverviewData {
  department: DeptInfo | null; stats: Stats; officers: OfficerRow[]
  categoryBreakdown: BreakdownItem[]; priorityBreakdown: BreakdownItem[]
  monthlyCounts: Record<string, number>; recentComplaints: RecentComplaint[]
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

// Real DB status values
const STATUS_CLS: Record<string, string> = {
  "Pending":    "bg-amber-100 text-amber-800",
  "In Process": "bg-blue-100 text-blue-800",
  "Completed":  "bg-emerald-100 text-emerald-800",
}
const PRIORITY_CLS: Record<string, string> = {
  "High":   "bg-red-100 text-red-700",
  "Medium": "bg-orange-100 text-orange-700",
  "Low":    "bg-green-100 text-green-700",
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem("departmentToken") || localStorage.getItem("access_token")
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (token && token !== "undefined" && token !== "null") h["Authorization"] = `Bearer ${token}`
  return h
}
const sc = (s: string) => STATUS_CLS[s] ?? "bg-gray-100 text-gray-700"
const pc = (p: string) => PRIORITY_CLS[p] ?? "bg-gray-100 text-gray-700"

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function KpiCard({ label, value, sub, icon, iconCls, border }: {
  label: string; value: number | string; sub: string
  icon: React.ReactNode; iconCls: string; border: string
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 border-t-4 ${border} shadow-sm p-5`}>
      <div className={`${iconCls} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function Card({ title, icon, iconCls, children, action }: {
  title: string; icon: React.ReactNode; iconCls: string
  children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className={`${iconCls} p-2 rounded-lg`}>{icon}</div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function DepartmentOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const API = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API}/api/department/overview/`, { headers: getHeaders() })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setData(await res.json())
    } catch (e: any) {
      setError(e.message || "Failed to load overview")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [API])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = () => { setRefreshing(true); fetchData() }

  const monthlyChart = MONTHS.map((name, i) => ({
    name,
    complaints: data?.monthlyCounts?.[String(i + 1)] ?? 0,
  }))

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // â”€â”€ Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Failed to load overview</h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { department, stats, officers, categoryBreakdown, priorityBreakdown, recentComplaints } = data
  const totalCat = categoryBreakdown.reduce((s, e) => s + e.count, 0)

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/department" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <Home className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Department Overview</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {department ? department.name : "All Departments"} â€” complete operational snapshot
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Department Banner */}
      {department && (
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a9e] rounded-xl p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{department.name}</h2>
                <p className="text-blue-100 text-sm mt-0.5">{department.description || "Government Department"}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="w-3.5 h-3.5 text-blue-200" />
                  <span className="text-xs text-blue-200">Code: {department.code}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-blue-100"><User className="w-4 h-4" /><span>{department.head}</span></div>
              <div className="flex items-center gap-2 text-blue-100"><Mail className="w-4 h-4" /><span>{department.email}</span></div>
              <div className="flex items-center gap-2 text-blue-100"><Phone className="w-4 h-4" /><span>{department.phone}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Complaints" value={stats.total} sub="All time"
          icon={<FileText className="w-5 h-5" />} iconCls="bg-[#eef1f7] text-[#1e3a5f]" border="border-t-[#1e3a5f]" />
        <KpiCard label="Pending" value={stats.pending} sub="Awaiting action"
          icon={<Clock className="w-5 h-5" />} iconCls="bg-amber-50 text-amber-600" border="border-t-amber-500" />
        <KpiCard label="In Process" value={stats.inProgress} sub="Being addressed"
          icon={<TrendingUp className="w-5 h-5" />} iconCls="bg-[#eef1f7] text-[#1e3a5f]" border="border-t-indigo-500" />
        <KpiCard label="Completed" value={stats.resolved} sub={`${stats.slaCompliance}% SLA`}
          icon={<CheckCircle2 className="w-5 h-5" />} iconCls="bg-emerald-50 text-emerald-600" border="border-t-emerald-500" />
      </div>

      {/* Officers strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Officers",  value: stats.totalOfficers,  cls: "text-gray-900" },
          { label: "Active Officers", value: stats.activeOfficers, cls: "text-emerald-600" },
          { label: "Inactive",        value: stats.totalOfficers - stats.activeOfficers, cls: "text-red-500" },
          { label: "SLA Compliance",  value: `${stats.slaCompliance}%`,
            cls: stats.slaCompliance >= 80 ? "text-emerald-600" : stats.slaCompliance >= 60 ? "text-amber-600" : "text-red-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Monthly Complaints" icon={<BarChart3 className="w-4 h-4" />} iconCls="bg-[#eef1f7] text-[#1e3a5f]">
            <div className="p-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyChart} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} cursor={{ fill: "#EFF6FF" }} />
                  <Bar dataKey="complaints" fill="#1e3a5f" radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card title="By Category" icon={<FileText className="w-4 h-4" />} iconCls="bg-purple-50 text-purple-600">
          <div className="p-5">
            {totalCat > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="count" cx="50%" cy="50%"
                      innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {categoryBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [`${v}`, n]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {categoryBreakdown.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                        <span className="text-gray-600 truncate max-w-[120px]">{e.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{e.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data</div>
            )}
          </div>
        </Card>
      </div>

      {/* Priority + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Priority Breakdown" icon={<AlertTriangle className="w-4 h-4" />} iconCls="bg-red-50 text-red-500">
          <div className="p-5 space-y-3">
            {priorityBreakdown.map((p, i) => {
              const total = priorityBreakdown.reduce((s, e) => s + e.count, 0)
              const pct = total > 0 ? Math.round((p.count / total) * 100) : 0
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{p.name}</span>
                    <span className="font-semibold text-gray-900">{p.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card title="Performance Summary" icon={<Award className="w-4 h-4" />} iconCls="bg-amber-50 text-amber-600">
          <div className="p-5 space-y-4">
            {[
              { label: "SLA Compliance", value: `${stats.slaCompliance}%`, bar: stats.slaCompliance,
                color: stats.slaCompliance >= 80 ? "#10b981" : stats.slaCompliance >= 60 ? "#f59e0b" : "#ef4444" },
              { label: "Resolution Rate",
                value: stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : "0%",
                bar: stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0, color: "#1e3a5f" },
              { label: "Officer Utilisation",
                value: stats.totalOfficers > 0 ? `${Math.round((stats.activeOfficers / stats.totalOfficers) * 100)}%` : "0%",
                bar: stats.totalOfficers > 0 ? (stats.activeOfficers / stats.totalOfficers) * 100 : 0, color: "#8b5cf6" },
            ].map((m, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{m.label}</span>
                  <span className="font-semibold text-gray-900">{m.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, m.bar)}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Officers Table */}
      <Card title="Officers" icon={<Users className="w-4 h-4" />} iconCls="bg-[#eef1f7] text-[#1e3a5f]"
        action={
          <Link href="/department/officers" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }>
        {officers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Officer","Email","Status","Handled","Completed","Score"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {officers.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{o.name}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{o.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{o.handled}</td>
                    <td className="px-5 py-3 text-emerald-600 font-medium">{o.resolved}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                          <div className="h-full rounded-full bg-[#1e3a5f]" style={{ width: `${o.score}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 w-10">{o.score}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No officers assigned</p>
          </div>
        )}
      </Card>

      {/* Recent Complaints */}
      <Card title="Recent Complaints" icon={<FileText className="w-4 h-4" />} iconCls="bg-gray-100 text-gray-600"
        action={
          <Link href="/department/assigned" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }>
        {recentComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["ID","Title","Category","Priority","Status","Officer","Date"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#1e3a5f] font-semibold">#{c.id}</td>
                    <td className="px-5 py-3 text-gray-900 max-w-[160px] truncate">{c.title}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{c.category}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc(c.priority)}`}>{c.priority}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{c.officer}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No complaints found</p>
          </div>
        )}
      </Card>

    </div>
  )
}

