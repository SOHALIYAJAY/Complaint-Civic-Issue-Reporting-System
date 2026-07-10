"use client"

import { useState, useEffect } from "react"
import {
  Building2, Users, FileText, CheckCircle2, Clock, TrendingUp,
  Mail, Phone, User, RefreshCw, AlertTriangle, Activity, Shield
} from "lucide-react"
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts"
import api from "@/lib/axios"

interface DeptStats {
  total_complaints: number
  pending_complaints: number
  in_progress_complaints: number
  resolved_complaints: number
  resolution_rate: number
}

interface Department {
  id: number
  name: string
  category: string
  description: string
  contact_email: string
  contact_phone: string
  head_officer: { id: number; name: string; email: string } | null
  officers: { total: number; active: number; inactive: number }
  statistics: DeptStats
  created_at: string | null
}

interface Overview {
  total_departments: number
  total_complaints: number
  total_resolved: number
  overall_resolution_rate: number
  total_officers: number
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b"]

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 border-t-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      </div>
    </div>
  )
}

export default function DepartmentsOverviewPage() {
  const [dept, setDept] = useState<Department | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get("/api/departments/overview/")
      const data = res.data
      setOverview(data.overview)
      if (data.departments?.length > 0) setDept(data.departments[0])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-28">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-8 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-800">Failed to load overview</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    </div>
  )

  if (!dept) return (
    <div className="p-6 text-center py-20">
      <Building2 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">No department assigned to your account.</p>
    </div>
  )

  const pieData = [
    { name: "Resolved",    value: dept.statistics.resolved_complaints,    color: PIE_COLORS[0] },
    { name: "In Progress", value: dept.statistics.in_progress_complaints, color: PIE_COLORS[1] },
    { name: "Pending",     value: dept.statistics.pending_complaints,     color: PIE_COLORS[2] },
  ]

  const barData = [
    { name: "Total",    value: dept.officers.total,    fill: "#6366f1" },
    { name: "Active",   value: dept.officers.active,   fill: "#10b981" },
    { name: "Inactive", value: dept.officers.inactive, fill: "#94a3b8" },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your department's performance at a glance</p>
        </div>
        <button onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Department Identity Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-indigo-200 uppercase tracking-widest mb-0.5">Your Department</p>
              <h2 className="text-xl font-bold">{dept.name}</h2>
              <p className="text-sm text-indigo-200">{dept.category}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="text-indigo-200 text-xs mb-0.5">Head Officer</p>
              <p className="font-semibold">{dept.head_officer?.name || "Not Assigned"}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs mb-0.5">Contact Email</p>
              <p className="font-semibold">{dept.contact_email || "—"}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs mb-0.5">Phone</p>
              <p className="font-semibold">{dept.contact_phone || "—"}</p>
            </div>
          </div>
        </div>
        {dept.description && (
          <p className="mt-4 text-sm text-indigo-100 border-t border-white/20 pt-4">{dept.description}</p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={dept.statistics.total_complaints}
          icon={<FileText className="w-5 h-5 text-indigo-600" />} color="border-t-indigo-500" />
        <StatCard label="Resolved" value={dept.statistics.resolved_complaints}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} color="border-t-emerald-500" />
        <StatCard label="Pending" value={dept.statistics.pending_complaints}
          icon={<Clock className="w-5 h-5 text-amber-600" />} color="border-t-amber-500" />
        <StatCard label="In Progress" value={dept.statistics.in_progress_complaints}
          icon={<Activity className="w-5 h-5 text-blue-600" />} color="border-t-blue-500" />
      </div>

      {/* Resolution Rate Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-800">Resolution Rate</span>
          </div>
          <span className={`text-sm font-bold ${dept.statistics.resolution_rate >= 70 ? "text-emerald-600" : dept.statistics.resolution_rate >= 40 ? "text-amber-600" : "text-red-600"}`}>
            {dept.statistics.resolution_rate}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${dept.statistics.resolution_rate >= 70 ? "bg-emerald-500" : dept.statistics.resolution_rate >= 40 ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${dept.statistics.resolution_rate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {dept.statistics.resolved_complaints} of {dept.statistics.total_complaints} complaints resolved
        </p>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Complaint Status Pie */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg"><FileText className="w-4 h-4 text-indigo-600" /></div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Complaint Status</p>
              <p className="text-xs text-gray-500">Distribution by status</p>
            </div>
          </div>
          {dept.statistics.total_complaints > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any) => [`${v} complaints`, n]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-2">
                {pieData.map((e, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                    <span className="text-xs text-gray-600">{e.name}</span>
                    <span className="text-xs font-bold text-gray-800">{e.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No complaints yet</div>
          )}
        </div>

        {/* Officers Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="w-4 h-4 text-purple-600" /></div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Officer Strength</p>
              <p className="text-xs text-gray-500">Total · Active · Inactive</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contact + Head Officer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" /> Contact Information
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{dept.contact_email || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">{dept.contact_phone || "Not provided"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" /> Head Officer
          </p>
          {dept.head_officer ? (
            <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {dept.head_officer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{dept.head_officer.name}</p>
                <p className="text-xs text-gray-500">{dept.head_officer.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-700">No head officer assigned</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
