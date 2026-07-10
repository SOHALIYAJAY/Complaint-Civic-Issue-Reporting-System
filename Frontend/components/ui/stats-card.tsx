"use client"

import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
  bgColor?: string
  borderColor?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "text-sidebar-primary",
  bgColor = "bg-sidebar-primary/10",
  borderColor = "border-gray-200",
  trend,
  loading = false
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const topBorder = borderColor.startsWith('border-t') ? `border-t-4 ${borderColor}` : `border-t-4 border-t-${borderColor.replace('border-', '')}`

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${topBorder} shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 ${bgColor} rounded-lg flex-shrink-0`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
}
