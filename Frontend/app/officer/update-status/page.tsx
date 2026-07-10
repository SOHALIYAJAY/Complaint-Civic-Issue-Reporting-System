"use client"

import React, { useState, useEffect } from 'react'
import {
  Search, Clock, CheckCircle, Activity, ChevronRight,
  RefreshCw, X, MapPin, User, Tag, ArrowRight, Flame,
  MessageSquare, Filter, TrendingUp, AlertCircle,
} from 'lucide-react'

interface Complaint {
  id: number
  title: string
  description: string
  category: string
  status: string
  priority: string
  date: string
  submittedDate: string
  location: string
  citizenName: string
  citizenEmail: string
  citizenPhone: string
  isOverdue: boolean
  image?: string
  remarks: string
  updatedAt?: string
}

const COLUMNS = [
  {
    key: 'Pending',
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    headerBg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    dot: 'bg-yellow-400',
    badgeBg: 'bg-yellow-100 text-yellow-700',
    nextStatus: 'In Process',
    nextLabel: 'Start Process',
    nextBtnClass: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  {
    key: 'In Process',
    label: 'In Process',
    icon: Activity,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    dot: 'bg-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700',
    nextStatus: 'Completed',
    nextLabel: 'Mark Completed',
    nextBtnClass: 'bg-green-500 hover:bg-green-600 text-white',
  },
  {
    key: 'Completed',
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    headerBg: 'bg-gradient-to-r from-green-500 to-emerald-600',
    dot: 'bg-green-500',
    badgeBg: 'bg-green-100 text-green-700',
    nextStatus: null,
    nextLabel: null,
    nextBtnClass: '',
  },
] as const

const PRIORITY_CONFIG: Record<string, { cls: string; dot: string }> = {
  High:   { cls: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500' },
  Medium: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  Low:    { cls: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
}

export default function StatusChangePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [statusCounts, setStatusCounts] = useState({ pending: 0, in_progress: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [remarksModal, setRemarksModal] = useState<{ complaint: Complaint; nextStatus: string } | null>(null)
  const [remarksText, setRemarksText] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const getHeaders = () => {
    const token = localStorage.getItem('access_token')
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token && token !== 'undefined' && token !== 'null') h['Authorization'] = `Bearer ${token}`
    return h
  }

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/officer/complaints/?page_size=1000`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        setComplaints(data.complaints || [])
        setStatusCounts(data.statusCounts || { pending: 0, in_progress: 0, completed: 0 })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchComplaints() }, [])

  const filtered = complaints.filter((c) => {
    const s = searchTerm.toLowerCase()
    const matchSearch = !s || c.title.toLowerCase().includes(s) ||
      c.citizenName.toLowerCase().includes(s) || c.category.toLowerCase().includes(s)
    return matchSearch && (priorityFilter === 'all' || c.priority === priorityFilter)
  })

  const byStatus = (key: string) => filtered.filter((c) => c.status === key)
  const totalCount = statusCounts.pending + statusCounts.in_progress + statusCounts.completed

  const openModal = (complaint: Complaint, nextStatus: string) => {
    setRemarksModal({ complaint, nextStatus })
    setRemarksText(complaint.remarks || '')
    setUpdateError('')
  }

  const closeModal = () => { setRemarksModal(null); setRemarksText(''); setUpdateError('') }

  const confirmUpdate = async () => {
    if (!remarksModal) return
    setUpdating(true)
    setUpdateError('')
    try {
      const prevStatus = remarksModal.complaint.status
      const nextStatus = remarksModal.nextStatus
      const res = await fetch(
        `${API_BASE}/api/officer/complaints/${remarksModal.complaint.id}/status/`,
        { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status: nextStatus, remarks: remarksText }) }
      )
      if (res.ok) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === remarksModal.complaint.id
              ? { ...c, status: nextStatus, remarks: remarksText }
              : c
          )
        )
        setStatusCounts((prev) => {
          const out = { ...prev }
          const toKey = (s: string) =>
            (s === 'Pending' ? 'pending' : s === 'In Process' ? 'in_progress' : 'completed') as 'pending' | 'in_progress' | 'completed'
          const from = toKey(prevStatus)
          const to = toKey(nextStatus)
          out[from] = Math.max(0, out[from] - 1)
          out[to] = out[to] + 1
          return out
        })
        closeModal()
      } else {
        const err = await res.json()
        setUpdateError(err.error || 'Failed to update.')
      }
    } catch { setUpdateError('Network error. Please try again.') }
    finally { setUpdating(false) }
  }

  const resolutionRate = totalCount > 0
    ? Math.round((statusCounts.completed / totalCount) * 100)
    : 0

  return (
    <div className="p-6 space-y-5">

      {/* â”€â”€ Page Header â”€â”€ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sidebar-primary to-sidebar-primary/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Status Change Board</h1>
              <p className="text-sm text-white/70 mt-0.5">Move complaints through the workflow</p>
            </div>
            <button
              onClick={() => { setIsRefreshing(true); fetchComplaints().finally(() => setIsRefreshing(false)) }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
          {[
            { label: 'Total', value: totalCount, color: 'text-gray-900', icon: Tag },
            { label: 'Pending',    value: statusCounts.pending,    color: 'text-yellow-600', icon: Clock },
            { label: 'In Process', value: statusCounts.in_progress, color: 'text-blue-600',   icon: Activity },
            { label: 'Completed',  value: statusCounts.completed,  color: 'text-green-600',  icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center py-4 px-3">
              <Icon className={`w-4 h-4 ${color} mb-1`} />
              <span className={`text-2xl font-bold ${color}`}>{value}</span>
              <span className="text-xs text-gray-500 mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Resolution Rate
            </span>
            <span className="text-xs font-semibold text-green-600">{resolutionRate}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* â”€â”€ Filters â”€â”€ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search title, citizen or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {['all', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  priorityFilter === p
                    ? p === 'all'
                      ? 'bg-gray-800 text-white border-gray-800'
                      : p === 'High'
                      ? 'bg-red-500 text-white border-red-500'
                      : p === 'Medium'
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Kanban Board â”€â”€ */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sidebar-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {COLUMNS.map((col) => {
            const Icon = col.icon
            const cards = byStatus(col.key)
            return (
              <div key={col.key} className="flex flex-col gap-3">

                {/* Column header */}
                <div className={`${col.headerBg} rounded-xl px-4 py-3 flex items-center justify-between shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="font-semibold text-sm text-white">{col.label}</span>
                  </div>
                  <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>

                {/* Cards list */}
                <div className="flex flex-col gap-3">
                  {cards.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed ${col.border} ${col.bg}`}>
                      <Icon className={`w-9 h-9 ${col.color} opacity-30 mb-2`} />
                      <p className="text-sm text-gray-400">No {col.label.toLowerCase()} complaints</p>
                    </div>
                  ) : (
                    cards.map((complaint) => (
                      <KanbanCard
                        key={complaint.id}
                        complaint={complaint}
                        col={col}
                        onAdvance={openModal}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* â”€â”€ Confirm Modal â”€â”€ */}
      {remarksModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirm Status Change</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  #{remarksModal.complaint.id} â€” {remarksModal.complaint.title}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-300 hover:text-gray-500 mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Transition arrow */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <StatusPill status={remarksModal.complaint.status} />
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <StatusPill status={remarksModal.nextStatus} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Remarks
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this update..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary resize-none bg-gray-50"
                />
              </div>

              {updateError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {updateError}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={updating}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                disabled={updating}
                className="px-5 py-2 bg-sidebar-primary text-white rounded-xl text-sm font-medium hover:bg-sidebar-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {updating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {updating ? 'Saving...' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// â”€â”€ Kanban Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function KanbanCard({
  complaint, col, onAdvance,
}: {
  complaint: Complaint
  col: (typeof COLUMNS)[number]
  onAdvance: (c: Complaint, next: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const pc = PRIORITY_CONFIG[complaint.priority] ?? { cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Left accent bar */}
      <div className={`flex`}>
        <div className={`w-1 flex-shrink-0 ${col.dot}`} />
        <div className="flex-1 p-4 space-y-3">

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs text-gray-400 font-mono">#{complaint.id}</span>
                {complaint.isOverdue && (
                  <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded font-medium">
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                {complaint.title}
              </p>
            </div>
            {/* Priority badge */}
            <div className={`flex items-center gap-1 flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${pc.cls}`}>
              {complaint.priority === 'High' && <Flame className="w-3 h-3" />}
              {complaint.priority}
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-gray-400" />
              {complaint.category}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-gray-400" />
              {complaint.citizenName}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              {complaint.location}
            </span>
          </div>

          {/* Date */}
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-2">
            Submitted: {complaint.submittedDate || complaint.date}
          </p>

          {/* Description */}
          {complaint.description && (
            <div>
              <p className={`text-xs text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                {complaint.description}
              </p>
              {complaint.description.length > 80 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-sidebar-primary mt-0.5 hover:underline"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Remarks */}
          {complaint.remarks && (
            <div className="flex items-start gap-1.5 bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
              <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500 italic line-clamp-2">{complaint.remarks}</p>
            </div>
          )}

          {/* Action button */}
          {col.nextStatus ? (
            <button
              onClick={() => onAdvance(complaint, col.nextStatus!)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${col.nextBtnClass}`}
            >
              {col.nextLabel}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700">Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Status Pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    Pending:      { label: 'Pending',    cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock },
    'In Process': { label: 'In Process', cls: 'bg-blue-100 text-blue-700 border-blue-200',       Icon: Activity },
    Completed:    { label: 'Completed',  cls: 'bg-green-100 text-green-700 border-green-200',    Icon: CheckCircle },
  }
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-700 border-gray-200', Icon: Clock }
  const Icon = s.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  )
}

