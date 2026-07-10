"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Trash2,
  Calendar,
} from "lucide-react"

export interface SentNotification {
  id: string
  complaintId: string | null
  userName: string
  title: string
  type: "Complaint Update" | "Escalation" | "General" | "Warning"
  priority: "Normal" | "High" | "Urgent"
  sentDate: string
  readStatus: "Read" | "Unread"
  message: string
  deliveryStatus: "Delivered" | "Pending" | "Failed"
  readTimestamp: string | null
  userEmail: string
  userPhone: string
}

export const notificationsData: SentNotification[] = [
  { id: "NTF-001", complaintId: "CMP-2025-001", userName: "Rajesh Patel", title: "Complaint status updated to In Progress", type: "Complaint Update", priority: "Normal", sentDate: "2025-06-15 09:30", readStatus: "Read", message: "Dear Citizen, your complaint regarding pothole on MG Road has been assigned to a field officer and work will begin within 48 hours. We appreciate your patience.", deliveryStatus: "Delivered", readTimestamp: "2025-06-15 10:15", userEmail: "rajesh.p@gmail.com", userPhone: "+91 98765 43210" },
  { id: "NTF-002", complaintId: "CMP-2025-002", userName: "Priya Shah", title: "Complaint escalated to Senior Officer", type: "Escalation", priority: "High", sentDate: "2025-06-15 10:45", readStatus: "Unread", message: "Dear Citizen, your complaint about the broken streetlight has been escalated to the Senior Engineering Officer for immediate attention due to public safety concerns.", deliveryStatus: "Delivered", readTimestamp: null, userEmail: "priya.s@gmail.com", userPhone: "+91 98765 43211" },
  { id: "NTF-003", complaintId: null, userName: "All Department Users", title: "Scheduled maintenance this weekend", type: "General", priority: "Normal", sentDate: "2025-06-14 16:00", readStatus: "Read", message: "Please note that scheduled maintenance work on the portal will be performed this Saturday from 2 AM to 6 AM. During this period, complaint submission will be temporarily unavailable.", deliveryStatus: "Delivered", readTimestamp: "2025-06-14 17:30", userEmail: "broadcast", userPhone: "broadcast" },
  { id: "NTF-004", complaintId: "CMP-2025-003", userName: "Amit Desai", title: "SLA breach warning - Immediate action required", type: "Warning", priority: "Urgent", sentDate: "2025-06-14 14:20", readStatus: "Read", message: "Dear Citizen, we regret the delay in resolving your complaint about waterlogging in Satellite area. This has been flagged for urgent attention and an officer will visit the site today.", deliveryStatus: "Delivered", readTimestamp: "2025-06-14 14:35", userEmail: "amit.d@gmail.com", userPhone: "+91 98765 43212" },
  { id: "NTF-005", complaintId: "CMP-2025-004", userName: "Sunita Verma", title: "Complaint resolved - Verification pending", type: "Complaint Update", priority: "Normal", sentDate: "2025-06-14 11:00", readStatus: "Read", message: "Dear Citizen, the garbage collection issue in Navrangpura has been resolved. Please verify and confirm the resolution through the app or contact us if the issue persists.", deliveryStatus: "Delivered", readTimestamp: "2025-06-14 12:20", userEmail: "sunita.v@gmail.com", userPhone: "+91 98765 43213" },
  { id: "NTF-006", complaintId: "CMP-2025-005", userName: "Vikram Joshi", title: "Officer assigned to your complaint", type: "Complaint Update", priority: "Normal", sentDate: "2025-06-13 15:30", readStatus: "Unread", message: "Dear Citizen, Officer Amit Patel has been assigned to handle your complaint about the damaged footpath near SG Highway. Expected resolution within 5 working days.", deliveryStatus: "Delivered", readTimestamp: null, userEmail: "vikram.j@gmail.com", userPhone: "+91 98765 43214" },
  { id: "NTF-007", complaintId: "CMP-2025-006", userName: "Kavita Mehta", title: "Urgent: Sewer overflow - Emergency team dispatched", type: "Warning", priority: "Urgent", sentDate: "2025-06-13 08:15", readStatus: "Read", message: "Dear Citizen, an emergency team has been dispatched to address the sewer overflow at Maninagar. Please stay clear of the affected area. We aim to resolve this within 24 hours.", deliveryStatus: "Delivered", readTimestamp: "2025-06-13 08:22", userEmail: "kavita.m@gmail.com", userPhone: "+91 98765 43215" },
  { id: "NTF-008", complaintId: null, userName: "All Civic Users", title: "New feature: Track complaints in real-time", type: "General", priority: "Normal", sentDate: "2025-06-12 10:00", readStatus: "Read", message: "We are excited to announce a new real-time tracking feature for all civic complaints. You can now see live status updates and officer locations for your active complaints.", deliveryStatus: "Delivered", readTimestamp: "2025-06-12 14:00", userEmail: "broadcast", userPhone: "broadcast" },
  { id: "NTF-009", complaintId: "CMP-2025-007", userName: "Deepak Trivedi", title: "Park maintenance scheduled for next week", type: "Complaint Update", priority: "Normal", sentDate: "2025-06-12 09:00", readStatus: "Unread", message: "Dear Citizen, your park maintenance request has been scheduled for next Monday. Our team will be on-site from 8 AM to complete the work.", deliveryStatus: "Pending", readTimestamp: null, userEmail: "deepak.t@gmail.com", userPhone: "+91 98765 43216" },
  { id: "NTF-010", complaintId: "CMP-2025-001", userName: "Rajesh Patel", title: "Complaint resolved successfully", type: "Complaint Update", priority: "Normal", sentDate: "2025-06-11 16:45", readStatus: "Read", message: "Dear Citizen, the pothole on MG Road has been repaired. Please verify the resolution. Thank you for your patience and for using Gujarat Civic Portal.", deliveryStatus: "Delivered", readTimestamp: "2025-06-11 17:10", userEmail: "rajesh.p@gmail.com", userPhone: "+91 98765 43210" },
]

const typeColors: Record<string, string> = {
  "Complaint Update": "bg-blue-50 text-[#1e40af] border-blue-200",
  Escalation: "bg-amber-50 text-[#f59e0b] border-amber-200",
  General: "bg-slate-100 text-slate-600 border-slate-200",
  Warning: "bg-red-50 text-[#dc2626] border-red-200",
}

const priorityColors: Record<string, string> = {
  Normal: "bg-green-50 text-[#16a34a]",
  High: "bg-amber-50 text-[#f59e0b]",
  Urgent: "bg-red-50 text-[#dc2626]",
}

const readStatusColors: Record<string, string> = {
  Read: "bg-green-50 text-[#16a34a]",
  Unread: "bg-slate-100 text-slate-500",
}

export default function SentNotificationsTable({
  onViewNotification,
}: {
  onViewNotification: (notif: SentNotification) => void
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [readFilter, setReadFilter] = useState("All")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const perPage = 6

  const filtered = useMemo(() => {
    return notificationsData.filter((n) => {
      const matchesSearch =
        n.id.toLowerCase().includes(search.toLowerCase()) ||
        n.userName.toLowerCase().includes(search.toLowerCase()) ||
        n.title.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "All" || n.type === typeFilter
      const matchesRead = readFilter === "All" || n.readStatus === readFilter
      let matchesDate = true
      if (dateFrom) {
        matchesDate = matchesDate && n.sentDate >= dateFrom
      }
      if (dateTo) {
        matchesDate = matchesDate && n.sentDate <= dateTo + " 23:59"
      }
      return matchesSearch && matchesType && matchesRead && matchesDate
    })
  }, [search, typeFilter, readFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Sent Notifications</h3>
            <p className="text-sm text-slate-500">{filtered.length} notifications found</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#f1f5f9] px-3 py-2 rounded-lg border border-[#e2e8f0] flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, user or title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20"
            >
              <option value="All">All Types</option>
              <option value="Complaint Update">Complaint Update</option>
              <option value="Escalation">Escalation</option>
              <option value="General">General</option>
              <option value="Warning">Warning</option>
            </select>
          </div>

          {/* Read status filter */}
          <select
            value={readFilter}
            onChange={(e) => { setReadFilter(e.target.value); setPage(1) }}
            className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20"
          >
            <option value="All">All Status</option>
            <option value="Read">Read</option>
            <option value="Unread">Unread</option>
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="text-sm border border-[#e2e8f0] rounded-lg px-2 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="text-sm border border-[#e2e8f0] rounded-lg px-2 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Notif ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Complaint</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Title</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Priority</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden xl:table-cell">Sent Date</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {paginated.map((n) => (
              <tr key={n.id} className="hover:bg-blue-50/40 transition-colors">
                <td className="px-4 py-3.5 font-mono text-[#1e40af] font-semibold text-xs">{n.id}</td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  {n.complaintId ? (
                    <span className="font-mono text-xs text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded">{n.complaintId}</span>
                  ) : (
                    <span className="text-xs text-slate-400">Broadcast</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-medium text-slate-800 text-sm">{n.userName}</span>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <span className="text-slate-600 truncate block max-w-[220px]">{n.title}</span>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${typeColors[n.type]}`}>
                    {n.type}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center hidden md:table-cell">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${priorityColors[n.priority]}`}>
                    {n.priority}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-500 text-xs hidden xl:table-cell whitespace-nowrap">{n.sentDate}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${readStatusColors[n.readStatus]}`}>
                    {n.readStatus}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      title="View Details"
                      onClick={() => onViewNotification(n)}
                      className="p-1.5 text-[#3b82f6] hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button title="Resend" className="p-1.5 text-[#f59e0b] hover:bg-amber-50 rounded transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button title="Delete" className="p-1.5 text-[#dc2626] hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                  No notifications match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  n === page ? "bg-[#1e40af] text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
