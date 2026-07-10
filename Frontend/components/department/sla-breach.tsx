"use client"

import { AlertTriangle, Clock, ArrowUpRight } from "lucide-react"

interface SlaItem {
  id: string
  title: string
  remaining: string
  percent: number
  isBreached: boolean
  escalated: boolean
}

const slaItems: SlaItem[] = [
  { id: "PWD-1006", title: "Bridge railing missing section", remaining: "1h left", percent: 95, isBreached: false, escalated: true },
  { id: "PWD-1001", title: "Pothole on SG Highway", remaining: "4h left", percent: 85, isBreached: false, escalated: false },
  { id: "PWD-1042", title: "Collapsed wall near school", remaining: "BREACHED", percent: 100, isBreached: true, escalated: true },
  { id: "PWD-1033", title: "Water pipe burst on NH-48", remaining: "2h left", percent: 90, isBreached: false, escalated: false },
]

export default function SlaBreach() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              SLA Breach Alerts
            </h3>
            <p className="text-xs text-slate-500">
              Complaints nearing or past deadline
            </p>
          </div>
        </div>
        <span className="bg-red-50 text-[#dc2626] text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
          {slaItems.length} Urgent
        </span>
      </div>

      <div className="divide-y divide-[#e2e8f0]">
        {slaItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 hover:bg-red-50/30 transition-colors ${
              item.isBreached ? "bg-red-50/50" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-[#1e40af]">
                    {item.id}
                  </span>
                  {item.isBreached && (
                    <span className="bg-[#dc2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      BREACHED
                    </span>
                  )}
                  {item.escalated && (
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-orange-600">
                      <ArrowUpRight className="w-3 h-3" />
                      Escalated
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-800 font-medium truncate">
                  {item.title}
                </p>
              </div>
              <div className="flex items-center gap-1.5 ml-3">
                <Clock className="w-3.5 h-3.5 text-[#dc2626]" />
                <span
                  className={`text-xs font-semibold ${
                    item.isBreached ? "text-[#dc2626]" : "text-orange-600"
                  }`}
                >
                  {item.remaining}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.isBreached ? "bg-[#dc2626]" : "bg-[#f59e0b]"
                }`}
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
