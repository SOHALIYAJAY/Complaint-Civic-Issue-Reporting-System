"use client"

import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Trophy, Medal, Award } from "lucide-react"

interface OfficerWorkload {
  officer_id: string
  name: string
  active_complaints: number
  resolved_complaints?: number
  is_available: boolean
}

interface AnalyticsData {
  total_officers: number
  available_officers: number
  unavailable_officers: number
  officers_with_complaints: number
  workload_data: OfficerWorkload[]
  availability_percentage: number
}

interface DashboardStats {
  stats: { total: number; pending: number; inProgress: number; resolved: number }
}

const STATUS_COLORS = ["#f59e0b", "#6366f1", "#10b981"]
const RANK_ICONS = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200", label: "1st" },
  { icon: Medal, color: "text-slate-400",   bg: "bg-slate-50",  border: "border-slate-200",  label: "2nd" },
  { icon: Award, color: "text-orange-400",  bg: "bg-orange-50", border: "border-orange-200", label: "3rd" },
]

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
      <h4 className="text-sm font-semibold text-slate-800 mb-4">{title}</h4>
      {children}
    </div>
  )
}

export default function OfficersAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token && token !== "undefined" && token !== "null") {
        headers["Authorization"] = `Bearer ${token}`
      }

      const [officerRes, dashRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/officeranalytics/`, { headers }),
        fetch(`${API_BASE}/api/department/dashboard/`, { headers }),
      ])

      if (officerRes.status === "fulfilled" && officerRes.value.ok) {
        setAnalyticsData(await officerRes.value.json())
      }
      if (dashRes.status === "fulfilled" && dashRes.value.ok) {
        setDashboardStats(await dashRes.value.json())
      }
    } catch (e) {
      console.error("Error fetching analytics:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-slate-400">Loading analytics...</div>

  // â”€â”€ Complaint status pie data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const s = dashboardStats?.stats
  const pieData = [
    { name: "Pending",     value: s?.pending    ?? 0, color: STATUS_COLORS[0] },
    { name: "In Progress", value: s?.inProgress ?? 0, color: STATUS_COLORS[1] },
    { name: "Resolved",    value: s?.resolved   ?? 0, color: STATUS_COLORS[2] },
  ]
  const totalComplaints = pieData.reduce((acc, d) => acc + d.value, 0)

  // â”€â”€ Top 3 officers by resolved complaints â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const top3 = [...(analyticsData?.workload_data ?? [])]
    .sort((a, b) => (b.resolved_complaints ?? 0) - (a.resolved_complaints ?? 0))
    .slice(0, 3)

  // â”€â”€ Key metrics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const metrics = [
    { label: "Total Officers",    value: analyticsData?.total_officers ?? 0,          bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-700" },
    { label: "Available",         value: analyticsData?.available_officers ?? 0,       bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    { label: "With Complaints",   value: analyticsData?.officers_with_complaints ?? 0, bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700" },
    { label: "Availability",      value: `${analyticsData?.availability_percentage ?? 0}%`, bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700" },
  ]

  return (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className={`${m.bg} rounded-lg p-4 border ${m.border}`}>
            <p className={`text-xs font-medium ${m.text} mb-1`}>{m.label}</p>
            <p className={`text-2xl font-bold ${m.text}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Complaint Status Donut */}
        <Card title="Department Complaint Status">
          {totalComplaints > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => {
                      const pct = totalComplaints ? ((val / totalComplaints) * 100).toFixed(1) : "0"
                      return [`${val} (${pct}%)`, name]
                    }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-5 mt-1">
                {pieData.map((d) => (
                  <div key={d.name} className="text-center">
                    <p className="text-lg font-bold text-slate-800">{d.value}</p>
                    <p className="text-xs text-slate-500">{d.name}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No complaint data available
            </div>
          )}
        </Card>

        {/* Top 3 Officers */}
        <Card title="Top 3 Officers â€” Most Resolved">
          {top3.length > 0 ? (
            <div className="space-y-3">
              {top3.map((officer, i) => {
                const rank = RANK_ICONS[i]
                const Icon = rank.icon
                const resolved = officer.resolved_complaints ?? 0
                const total = (officer.active_complaints ?? 0) + resolved
                const pct = total > 0 ? Math.round((resolved / total) * 100) : 0
                return (
                  <div
                    key={officer.officer_id}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${rank.border} ${rank.bg}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${rank.bg} border ${rank.border}`}>
                      <Icon className={`w-5 h-5 ${rank.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{officer.name}</p>
                        <span className="text-xs font-bold text-slate-600 ml-2">{resolved} resolved</span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{pct}% resolution rate</p>
                    </div>
                    <span className={`text-xs font-bold ${rank.color} flex-shrink-0`}>{rank.label}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No officer data available
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

