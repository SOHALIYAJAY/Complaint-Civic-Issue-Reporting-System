"use client"

import {
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react"

interface TimelineEntry {
  id: number
  type: "assigned" | "updated" | "resolved" | "escalated"
  message: string
  time: string
  complaint: string
}

const iconMap = {
  assigned: { icon: UserPlus, bg: "bg-blue-50", color: "text-[#1e40af]" },
  updated: { icon: RefreshCw, bg: "bg-amber-50", color: "text-[#f59e0b]" },
  resolved: { icon: CheckCircle2, bg: "bg-green-50", color: "text-[#16a34a]" },
  escalated: { icon: AlertTriangle, bg: "bg-red-50", color: "text-[#dc2626]" },
}

const activities: TimelineEntry[] = [
  { id: 1, type: "assigned", message: "Complaint assigned to Rajesh Kumar", time: "10 min ago", complaint: "PWD-1001" },
  { id: 2, type: "updated", message: "Status changed to In Progress", time: "25 min ago", complaint: "PWD-1004" },
  { id: 3, type: "resolved", message: "Complaint resolved by Amit Patel", time: "1h ago", complaint: "PWD-1003" },
  { id: 4, type: "escalated", message: "Escalation raised for SLA breach", time: "2h ago", complaint: "PWD-1042" },
  { id: 5, type: "assigned", message: "Complaint assigned to Priya Sharma", time: "3h ago", complaint: "PWD-1008" },
  { id: 6, type: "updated", message: "Priority changed to High", time: "4h ago", complaint: "PWD-1010" },
  { id: 7, type: "resolved", message: "Complaint resolved by Amit Patel", time: "5h ago", complaint: "PWD-1009" },
]

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#1e40af]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500">Department timeline</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-[#e2e8f0]" />

          <div className="space-y-5">
            {activities.map((a) => {
              const cfg = iconMap[a.type]
              const Icon = cfg.icon
              return (
                <div key={a.id} className="flex gap-4 relative">
                  <div
                    className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0 z-10`}
                  >
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-semibold text-[#1e40af]">
                        {a.complaint}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {a.time}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{a.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
