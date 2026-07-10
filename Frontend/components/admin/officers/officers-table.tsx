"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  MessageSquare,
  UserPlus,
  Power,
  SortAsc,
  SortDesc,
  Edit,
  Trash2,
} from "lucide-react"
import api, { apiGet } from '@/lib/api'

export interface Officer {
  officer_id: string
  name: string
  email: string
  phone: string
  is_available: boolean
  department?: string
  activeComplaints?: number
  maxCapacity?: number
}

type SortKey = "name"

export default function OfficersTable({
  onViewProfile,
  onAssignComplaint,
  onEditOfficer,
  onDeleteOfficer,
}: {
  onViewProfile: (officerId: string) => void
  onAssignComplaint: (officer: Officer) => void
  onEditOfficer: (officer: Officer) => void
  onDeleteOfficer: (officerId: string) => void
}) {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const perPage = 8

  useEffect(() => {
    fetchOfficers()
  }, [])

  const fetchOfficers = async () => {
    try {
      setLoading(true)
      const response = await apiGet('/api/officerinfo/')
      setOfficers(response)
    } catch (error) {
      console.error('Error fetching officers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    let result = officers.filter((o) => {
      const matchesSearch =
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.officer_id.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "All" || 
        (statusFilter === "Available" && o.is_available) ||
        (statusFilter === "Unavailable" && !o.is_available)
      return matchesSearch && matchesStatus
    })

    result.sort((a, b) => {
      return sortDir === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    })

    return result
  }, [officers, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const SortIcon = sortDir === "asc" ? SortAsc : SortDesc

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Officers Workforce</h3>
          <p className="text-sm text-slate-500">{filtered.length} officers in department</p>
        </div>
      </div>

      {/* Filter row */}
      <div className="p-5 flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#f1f5f9] px-3 py-2 rounded-lg border border-[#e2e8f0] flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          {/* Sort options */}
          <button
            onClick={() => handleSort("name")}
            className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
              sortKey === "name"
                ? "bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/30"
                : "text-slate-600 bg-white border-[#e2e8f0] hover:bg-slate-50"
            }`}
          >
            {sortKey === "name" && <SortIcon className="w-3.5 h-3.5" />}
            Name
          </button>
        </div>
    

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f1f5f9]">
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Officer</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  Loading officers...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                  No officers found.
                </td>
              </tr>
            ) : (
              paginated.map((o) => (
                <tr key={o.officer_id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[#1e40af] font-semibold text-xs">{o.officer_id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 bg-[#1e40af]">
                        {o.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-800 whitespace-nowrap">{o.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {o.department ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-[#eef1f7] text-[#1e3a5f] font-medium whitespace-nowrap">
                        {o.department}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{o.email}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{o.phone}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${
                      o.is_available ? "bg-green-100 text-[#16a34a] border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}>
                      {o.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <button title="View Profile" onClick={() => onViewProfile(o.officer_id)} className="p-1.5 text-[#3b82f6] hover:bg-blue-50 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button title="Edit Officer" onClick={() => onEditOfficer(o)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button title="Delete Officer" onClick={() => onDeleteOfficer(o.officer_id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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

