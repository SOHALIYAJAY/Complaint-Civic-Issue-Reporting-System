"use client"

import React from "react"
import { CheckCircle, Clock, FileText, Activity, AlertCircle } from "lucide-react"

type DashboardStats = {
  totalComplaints: number
  resolvedComplaints: number
  pendingComplaints: number
  inProgressComplaints: number
}

export default function DashboardStatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: 'Total Assigned',
      value: stats.totalComplaints || 0,
      icon: FileText,
      iconBg: 'bg-[#eef1f7]',
      iconColor: 'text-[#1e3a5f]',
      valueColor: 'text-gray-900',
      borderTop: 'border-t-[#1e3a5f]',
    },
    {
      label: 'Resolved',
      value: stats.resolvedComplaints || 0,
      icon: CheckCircle,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
      borderTop: 'border-t-emerald-500',
    },
    {
      label: 'In Progress',
      value: stats.inProgressComplaints || 0,
      icon: Activity,
      iconBg: 'bg-[#eef1f7]',
      iconColor: 'text-[#1e3a5f]',
      valueColor: 'text-[#1e3a5f]',
      borderTop: 'border-t-indigo-500',
    },
    {
      label: 'Pending',
      value: stats.pendingComplaints || 0,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
      borderTop: 'border-t-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-200 border-t-4 ${card.borderTop} shadow-sm p-5 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.iconBg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.valueColor}`}>{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
