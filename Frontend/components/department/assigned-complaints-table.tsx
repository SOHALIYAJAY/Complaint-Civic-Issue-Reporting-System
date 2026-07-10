"use client"

import { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from "react"
import { useRouter } from "next/navigation"
import { apiGet } from '@/lib/api'
import {
  Search, Filter, ChevronLeft, ChevronRight, UserPlus, RefreshCw,
  ChevronDown, ChevronUp, Eye, MessageSquare, CheckCircle2, ArrowUpRight, Upload,
} from "lucide-react"

export interface Complaint {
  id: number
  title: string
  Category: string | number
  Description: string
  video_image: string
  image_video?: string
  location_District: string
  location_address: string
  category_code?: string
  category_name?: string
  priority_level: "High" | "Medium" | "Low"
  status: "Pending" | "in-progress" | "resolved"
  current_time: string
  is_assignd?: boolean
  officer_id?: string
  officer_name?: string
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  "In Process": "bg-indigo-50 text-indigo-600 border-indigo-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "in-progress": "bg-indigo-50 text-indigo-600 border-indigo-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

const priorityColors: Record<string, string> = {
  High: "bg-orange-50 text-orange-600 border-orange-200",
  Medium: "bg-amber-50 text-[#f59e0b] border-amber-200",
  Low: "bg-slate-50 text-slate-500 border-slate-200",
}

function ViewDetailsButton({ complaint, className = "" }: { complaint?: Complaint | null; className?: string }) {
  const router = useRouter()
  if (!complaint) return null
  return (
    <button
      type="button"
      title={`View details for complaint #${complaint.id}`}
      className={`inline-flex items-center justify-center p-2 text-sm text-slate-500 hover:bg-slate-100 rounded ${className}`}
      onClick={() => router.push(`/department/complaint-details/${complaint.id}`)}
    >
      <Eye className="w-4 h-4" />
    </button>
  )
}

const AssignedComplaintsTable = forwardRef<
  { refreshComplaints: () => void },
  {
    onAssign: (complaint: Complaint) => void
    onViewDetails?: (complaint: Complaint) => void
    initialView?: "list" | "category"
    onAssignmentComplete?: () => void
  }
>(({ onAssign, onViewDetails, initialView, onAssignmentComplete }, ref) => {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const [page, setPage] = useState(1)
  const [viewMode] = useState<"list" | "category">(initialView || "category")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const perPage = 7

  useEffect(() => { fetchComplaints() }, [])

  const fetchComplaints = async () => {
    try {
      const response = await apiGet("/api/department/complaints/")
      if (!response || !Array.isArray(response)) { setComplaints([]); return }
      const transformed: Complaint[] = response.map((item: any) => ({
        id: item.id,
        title: item.title,
        Category: item.category || 'Uncategorized',
        Description: item.description || '',
        video_image: '',
        image_video: '',
        location_District: item.location || 'Not specified',
        location_address: item.location || 'Not specified',
        category_code: item.category || '',
        category_name: item.category || 'Uncategorized',
        priority_level: item.priority || 'Medium',
        status: item.status || 'Pending',
        current_time: item.submittedDate || new Date().toISOString(),
        is_assignd: item.assignedOfficer !== 'Unassigned' && item.assignedOfficer !== null,
        officer_id: item.assignedOfficer || null,
        officer_name: item.assignedOfficer || null,
      }))
      setComplaints(transformed)
      // Auto-expand all categories that have complaints
      const cats = new Set(transformed.map(c => String(c.Category).toUpperCase()))
      setExpandedCategories(cats)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  const refreshComplaints = () => {
    setLoading(true)
    fetchComplaints()
  }

  useImperativeHandle(ref, () => ({ refreshComplaints }), [onAssignmentComplete])

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories)
    next.has(category) ? next.delete(category) : next.add(category)
    setExpandedCategories(next)
  }

  const filtered = useMemo(() => {
    let result = complaints.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toString().includes(search)
      const matchesStatus = statusFilter === "All" || c.status === statusFilter
      const matchesPriority = priorityFilter === "All" || c.priority_level === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
    result.sort((a, b) => {
      const dateA = new Date(a.current_time).getTime()
      const dateB = new Date(b.current_time).getTime()
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB
    })
    return result
  }, [complaints, search, statusFilter, priorityFilter, sortOrder])

  // Group by category — only categories that exist in the filtered complaints
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Complaint[]> = {}
    filtered.forEach((c) => {
      const key = String(c.Category).toUpperCase()
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    })
    return groups
  }, [filtered])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-12 text-center">
        <p className="text-slate-600">Loading complaints...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      {/* Header + Filters */}
      <div className="p-5 border-b border-[#e2e8f0]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Complaint Queue</h3>
            <p className="text-sm text-slate-500">{filtered.length} complaints in your department</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#f1f5f9] px-3 py-2 rounded-lg border border-[#e2e8f0] flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or Title..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Process">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }}
            className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Category View */}
      {viewMode === "category" ? (
        <div className="p-5 space-y-4">
          {Object.keys(groupedByCategory).length === 0 ? (
            <div className="text-center py-12 text-slate-400">No complaints found for your department.</div>
          ) : (
            Object.entries(groupedByCategory).map(([category, categoryComplaints]) => (
              <div key={category} className="border border-[#e2e8f0] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-800">{category}</span>
                    <span className="text-xs px-2 py-1 bg-slate-700 text-white rounded-full">
                      {categoryComplaints.length}
                    </span>
                  </div>
                  {expandedCategories.has(category)
                    ? <ChevronUp className="w-4 h-4 text-slate-600" />
                    : <ChevronDown className="w-4 h-4 text-slate-600" />}
                </button>
                {expandedCategories.has(category) && (
                  <div className="divide-y divide-[#e2e8f0]">
                    {categoryComplaints.map((c) => (
                      <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-mono font-semibold text-slate-600">CVT-{c.id}</span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${priorityColors[c.priority_level]}`}>
                                {c.priority_level}
                              </span>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${statusColors[c.status]}`}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-800 mb-1">{c.title}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>{c.location_District}</span>
                              <span>•</span>
                              <span>{c.location_address}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <ViewDetailsButton complaint={c} />
                            {c.officer_name && c.officer_name !== "Unassigned" && c.officer_name !== "null" && c.officer_name !== "" ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">Assigned</span>
                            ) : (
                              <button onClick={() => onAssign(c)} className="p-2 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                                <UserPlus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Officer</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold text-xs">{c.id}</td>
                    <td className="px-4 py-3.5 text-slate-800 font-medium max-w-[180px] truncate">{c.title}</td>
                    <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell">{c.Category}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden lg:table-cell max-w-[140px] truncate">{c.location_address}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={!c.officer_name || c.officer_name === "Unassigned" || c.officer_name === "null" || c.officer_name === "" ? "text-[#dc2626] italic text-xs" : "text-slate-600 text-xs"}>
                        {!c.officer_name || c.officer_name === "Unassigned" || c.officer_name === "null" || c.officer_name === "" ? "Not Assigned" : c.officer_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] px-2 py-1 rounded-full border font-semibold ${priorityColors[c.priority_level]}`}>
                        {c.priority_level}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${statusColors[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden md:table-cell">{c.current_time}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <ViewDetailsButton complaint={c} />
                        {c.officer_name && c.officer_name !== "Unassigned" && c.officer_name !== "null" && c.officer_name !== "" ? (
                          <button title="Assigned" disabled className="p-1.5 text-slate-400 rounded cursor-not-allowed">
                            <span className="text-xs font-medium">Assigned</span>
                          </button>
                        ) : (
                          <button title="Assign Officer" onClick={() => onAssign(c)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors">
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button title="Update Status" className="p-1.5 text-[#16a34a] hover:bg-green-50 rounded transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button title="Add Remarks" className="p-1.5 text-slate-500 hover:bg-slate-50 rounded transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button title="Mark Resolved" className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button title="Escalate" className="p-1.5 text-[#dc2626] hover:bg-red-50 rounded transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button title="Upload Proof" className="p-1.5 text-slate-400 hover:bg-slate-50 rounded transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                      No complaints match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${n === page ? "bg-slate-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
})

AssignedComplaintsTable.displayName = 'AssignedComplaintsTable'

export default AssignedComplaintsTable
