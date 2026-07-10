"use client"

import React from "react"
import { BarChart3, Activity } from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts"

type MonthlyDataItem = { month: string; complaints: number }

export default function MonthlyTrendPanel({ data }: { data: MonthlyDataItem[] }) {
  const hasData = Array.isArray(data) && data.some(d => d.complaints > 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Monthly Complaint Trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">Complaints handled per month</p>
        </div>
        <div className="bg-[#eef1f7] p-2 rounded-lg">
          <BarChart3 className="w-4 h-4 text-[#1e3a5f]" />
        </div>
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="officerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1e3a5f" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }}
              cursor={{ stroke: "#1e3a5f", strokeWidth: 1, strokeDasharray: "4 4" }}
              formatter={(v: any) => [`${v} complaints`, "Count"]}
            />
            <Area
              type="monotone"
              dataKey="complaints"
              stroke="#1e3a5f"
              strokeWidth={2.5}
              fill="url(#officerAreaGrad)"
              dot={{ r: 3.5, fill: "#1e3a5f", strokeWidth: 0 }}
              activeDot={{ r: 5.5, fill: "#1e3a5f", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex flex-col items-center justify-center text-gray-400 gap-2">
          <Activity className="w-10 h-10 text-gray-200" />
          <p className="text-sm">No monthly data available</p>
        </div>
      )}
    </div>
  )
}
