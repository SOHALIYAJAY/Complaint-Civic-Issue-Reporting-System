import React from 'react'
import { Users as UsersIcon } from 'lucide-react'

export default function UsersKPI({ kpiCards }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card: any, index: number) => {
        const Icon = card.icon || UsersIcon
        return (
          <div key={index} className={`${card.color} rounded-lg border-t-4 ${card.borderColor} border border-slate-200 p-6 shadow-sm`}>
            <div className="flex items-start justify-between mb-2">
              <Icon className="w-5 h-5 text-slate-600" />
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">{card.change}</span>
            </div>
            <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}
