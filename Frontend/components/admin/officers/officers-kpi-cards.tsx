"use client"

import { useEffect, useState } from "react"
import {
  Users,
  UserCheck,
  FileText,
  AlertCircle,
} from "lucide-react"
import { getCardColors } from "@/lib/card-colors"

interface KpiCard {
  label: string
  value: string
  trendUp: boolean
  icon: React.ReactNode
  colorType: "users" | "officers" | "total" | "inProgress" | "pending" | "resolved" | "escalated" | "sla" | "admins" | "high" | "medium" | "low"
  suffix?: string
}

function AnimatedValue({ target, suffix }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0")
  const numericTarget = parseFloat(target.replace(/,/g, ""))

  useEffect(() => {
    if (isNaN(numericTarget)) {
      setDisplay(target)
      return
    }
    const duration = 1400
    const steps = 40
    const increment = numericTarget / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numericTarget) {
        setDisplay(target)
        clearInterval(timer)
      } else {
        setDisplay(
          numericTarget >= 100
            ? Math.floor(current).toLocaleString()
            : current.toFixed(1)
        )
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [numericTarget, target])

  return (
    <span>
      {display}
      {suffix}
    </span>
  )
}

import axios from "@/lib/axios"

export default function OfficersKpiCards() {
  const [kpiData, setKpiData] = useState<KpiCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKpi() {
      setLoading(true)
      try {
        const res = await axios.get("/api/officer-kpi/")
        const data = res.data
        const total = Number(data.total_officers ?? 0)
        const active = Number(data.active_officers ?? 0)
        const inactive =
          data.inactive_officers !== undefined && data.inactive_officers !== null
            ? Number(data.inactive_officers)
            : Math.max(0, total - active)
        const assigned = Number(data.total_assigned ?? 0)
        setKpiData([
          {
            label: "Total Officers",
            value: String(total),
            trendUp: true,
            icon: <Users className="w-5 h-5" />,
            colorType: "total",
          },
          {
            label: "Active Officers",
            value: String(active),
            trendUp: true,
            icon: <UserCheck className="w-5 h-5" />,
            colorType: "resolved",
          },
          {
            label: "In-Active Officers",
            value: String(inactive),
            trendUp: false,
            icon: <AlertCircle className="w-5 h-5" />,
            colorType: "pending",
          },
          {
            label: "Total Assigned",
            value: String(assigned),
            trendUp: true,
            icon: <FileText className="w-5 h-5" />,
            colorType: "inProgress",
          },
        ])
      } catch (e) {
        setKpiData([])
      } finally {
        setLoading(false)
      }
    }
    fetchKpi()
  }, [])

  if (loading) return <div>Loading KPI cards...</div>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((card, i) => {
        const colors = getCardColors(card.colorType)
        return (
          <div
            key={i}
            className={`bg-white rounded-xl border border-gray-200 border-t-4 ${colors.borderColor} shadow-sm hover:shadow-md transition-shadow p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`${colors.iconBg} ${colors.iconColor} p-2.5 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              <AnimatedValue target={card.value} suffix={card.suffix} />
            </p>
          </div>
        )
      })}
    </div>
  )
}
