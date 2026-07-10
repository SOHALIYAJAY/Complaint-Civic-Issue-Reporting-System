"use client"

import { BarChart3, TrendingUp, Clock } from "lucide-react"

const officerWorkload = [
  { name: "Rajesh Kumar", load: 18, max: 25 },
  { name: "Priya Sharma", load: 14, max: 25 },
  { name: "Amit Patel", load: 22, max: 25 },
  { name: "Neha Singh", load: 10, max: 25 },
  { name: "Vikram Desai", load: 16, max: 25 },
]

export default function AssignedAnalyticsSidebar() {
  return (
    <>
      {/* Officer Workload */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#1e40af]" />
          <h4 className="text-sm font-semibold text-slate-800">Officer Workload</h4>
        </div>
        <div className="space-y-3">
          {officerWorkload.map((o) => {
            const pct = Math.round((o.load / o.max) * 100)
            const barColor = pct >= 85 ? "bg-[#dc2626]" : pct >= 60 ? "bg-[#f59e0b]" : "bg-[#16a34a]"
            return (
              <div key={o.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{o.name}</span>
                  <span className="text-[11px] text-slate-500">{o.load}/{o.max}</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resolution Rate */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#16a34a]" />
          <h4 className="text-sm font-semibold text-slate-800">Resolution Rate</h4>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#16a34a]">87.3%</span>
          <span className="text-xs text-slate-500 mb-1">this month</span>
        </div>
        <div className="bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
          <div className="bg-[#16a34a] h-full rounded-full" style={{ width: "87.3%" }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">674 of 772 complaints resolved</p>
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-[#3b82f6]" />
          <h4 className="text-sm font-semibold text-slate-800">Avg. Resolution Time</h4>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold text-[#1e40af]">18.5h</span>
          <span className="text-xs text-slate-500 mb-1">avg. turnaround</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Critical</span>
            <span className="font-semibold text-slate-700">6.2h</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">High</span>
            <span className="font-semibold text-slate-700">12.8h</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Medium</span>
            <span className="font-semibold text-slate-700">22.4h</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Low</span>
            <span className="font-semibold text-slate-700">36.1h</span>
          </div>
        </div>
      </div>
    </>
  )
}
