"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Trophy, TrendingUp, ShieldCheck } from "lucide-react"

const workloadData = [
  { name: "R. Kumar", complaints: 18, fill: "#3b82f6" },
  { name: "P. Sharma", complaints: 22, fill: "#dc2626" },
  { name: "A. Patel", complaints: 12, fill: "#16a34a" },
  { name: "N. Singh", complaints: 8, fill: "#16a34a" },
  { name: "V. Desai", complaints: 24, fill: "#dc2626" },
  { name: "D. Joshi", complaints: 15, fill: "#f59e0b" },
  { name: "R. Trivedi", complaints: 20, fill: "#f59e0b" },
  { name: "A. Parikh", complaints: 10, fill: "#16a34a" },
  { name: "S. Bhatt", complaints: 23, fill: "#dc2626" },
  { name: "M. Chauhan", complaints: 5, fill: "#16a34a" },
]

const resolutionData = [
  { name: "R. Kumar", rate: 89 },
  { name: "P. Sharma", rate: 84 },
  { name: "A. Patel", rate: 94 },
  { name: "N. Singh", rate: 95 },
  { name: "V. Desai", rate: 78 },
  { name: "D. Joshi", rate: 90 },
  { name: "R. Trivedi", rate: 86 },
  { name: "A. Parikh", rate: 92 },
  { name: "S. Bhatt", rate: 73 },
  { name: "M. Chauhan", rate: 97 },
]

const slaRanking = [
  { rank: 1, name: "Meera Chauhan", sla: 98 },
  { rank: 2, name: "Amit Patel", sla: 96 },
  { rank: 3, name: "Neha Singh", sla: 92 },
  { rank: 4, name: "Rajesh Kumar", sla: 94 },
  { rank: 5, name: "Anjali Parikh", sla: 93 },
]

export default function OfficerPerformancePanel() {
  return (
    <div className="space-y-4">
      {/* Workload Comparison */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Workload Comparison</h3>
        <p className="text-xs text-slate-500 mb-4">Active complaints per officer</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={75} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
              />
              <Bar dataKey="complaints" radius={[0, 4, 4, 0]} barSize={14}>
                {workloadData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolution Rate */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Resolution Rate</h3>
        <p className="text-xs text-slate-500 mb-4">Percentage of complaints resolved</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolutionData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={75} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                formatter={(value: number) => [`${value}%`, "Resolution Rate"]}
              />
              <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performer */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-[#f59e0b]" />
          <h3 className="text-sm font-semibold text-slate-800">Top Performer</h3>
        </div>
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
          <div className="w-12 h-12 rounded-full bg-[#1e40af] flex items-center justify-center text-white font-bold text-sm">
            MC
          </div>
          <div>
            <p className="font-semibold text-slate-800">Meera Chauhan</p>
            <p className="text-xs text-slate-500">Executive Engineer</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-[#16a34a] font-semibold">
                <TrendingUp className="w-3 h-3" />245 resolved
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#7c3aed] font-semibold">
                <ShieldCheck className="w-3 h-3" />98% SLA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Ranking */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">SLA Compliance Ranking</h3>
        <p className="text-xs text-slate-500 mb-4">Top officers by SLA performance</p>
        <div className="space-y-2">
          {slaRanking.map((r) => (
            <div key={r.rank} className="flex items-center gap-3 p-2.5 bg-[#f1f5f9] rounded-lg">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                r.rank === 1 ? "bg-[#f59e0b] text-white" : r.rank === 2 ? "bg-slate-300 text-white" : r.rank === 3 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {r.rank}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{r.name}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                r.sla >= 95 ? "bg-green-50 text-[#16a34a]" : r.sla >= 90 ? "bg-blue-50 text-[#1e40af]" : "bg-amber-50 text-[#f59e0b]"
              }`}>
                {r.sla}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
