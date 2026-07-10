"use client"

import React from "react"
import { Activity, FileText } from "lucide-react"

type RecentComplaint = {
  id: number
  title: string
  category: string
  status: string
  priority: string
  date: string
  citizenName: string
  location: string
  isOverdue?: boolean
}

const STATUS_CLS: Record<string, string> = {
  "Pending":    "bg-amber-100 text-amber-800",
  "In Process": "bg-blue-100 text-blue-800",
  "Completed":  "bg-emerald-100 text-emerald-800",
  // legacy aliases
  "pending":     "bg-amber-100 text-amber-800",
  "in-progress": "bg-blue-100 text-blue-800",
  "resolved":    "bg-emerald-100 text-emerald-800",
}

const PRIORITY_CLS: Record<string, string> = {
  "High":   "bg-red-100 text-red-700",
  "Medium": "bg-orange-100 text-orange-700",
  "Low":    "bg-green-100 text-green-700",
}

const sc = (s: string) => STATUS_CLS[s] ?? "bg-gray-100 text-gray-700"
const pc = (p: string) => PRIORITY_CLS[p] ?? PRIORITY_CLS[p?.charAt(0).toUpperCase() + p?.slice(1).toLowerCase()] ?? "bg-gray-100 text-gray-700"

export default function RecentComplaintsPanel({ complaints }: { complaints: RecentComplaint[] }) {
  const hasData = Array.isArray(complaints) && complaints.length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent Complaints</h3>
          <p className="text-xs text-gray-500 mt-0.5">Latest assigned complaints</p>
        </div>
        <div className="bg-[#eef1f7] p-2 rounded-lg">
          <Activity className="w-4 h-4 text-[#1e3a5f]" />
        </div>
      </div>

      {hasData ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.map(c => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${c.isOverdue ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-3 font-mono text-xs text-[#1e3a5f] font-semibold">
                    #{c.id}
                    {c.isOverdue && (
                      <span className="ml-1 text-[10px] text-red-500 font-medium">overdue</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-900 max-w-[160px]">
                    <p className="truncate font-medium">{c.title}</p>
                    <p className="text-xs text-gray-400 truncate">{c.citizenName}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{c.category}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pc(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-10 text-center text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No recent complaints</p>
        </div>
      )}
    </div>
  )
}
