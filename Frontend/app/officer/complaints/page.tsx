"use client"

import React, { useState, useEffect } from 'react'
import {
  Search, Eye, AlertTriangle, Calendar, MapPin,
  Phone, Mail, User, X, RefreshCw, CheckCircle, Clock,
  Activity, Tag, MessageSquare, Image as ImageIcon, Hash,
  FileText, ChevronLeft, ChevronRight,
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

/* â”€â”€ helpers â”€â”€ */
const STATUS_MAP: Record<string, { label: string; badge: string; icon: React.ElementType; bar: string }> = {
  Pending:       { label: 'Pending',    badge: 'bg-red-100 text-red-700 border-red-200',         icon: Clock,       bar: 'bg-red-500' },
  'In Process':  { label: 'In Process', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Activity,    bar: 'bg-yellow-500' },
  Completed:     { label: 'Completed',  badge: 'bg-green-100 text-green-700 border-green-200',   icon: CheckCircle, bar: 'bg-green-500' },
}
const PRIORITY_MAP: Record<string, { badge: string; dot: string }> = {
  High:   { badge: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500' },
  Medium: { badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  Low:    { badge: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, badge: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, bar: '' }
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  )
}
function PriorityBadge({ priority }: { priority: string }) {
  const p = PRIORITY_MAP[priority] ?? { badge: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${p.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />{priority}
    </span>
  )
}

/* â”€â”€ main page â”€â”€ */
export default function AllComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateRemarks, setUpdateRemarks] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalComplaints, setTotalComplaints] = useState(0)

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
  const itemsPerPage = 10

  const getHeaders = () => {
    const token = localStorage.getItem('access_token')
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token && token !== 'undefined' && token !== 'null') h['Authorization'] = `Bearer ${token}`
    return h
  }

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm, status: statusFilter, priority: priorityFilter,
        category: categoryFilter, page: currentPage.toString(), page_size: itemsPerPage.toString(),
      })
      const res = await fetch(`${API_BASE}/api/officer/complaints/?${params}`, { headers: getHeaders() })
      if (res.ok) {
        const data = await res.json()
        console.log('[Officer All Complaints] API response:', data)
        setComplaints(data.complaints || [])
        setCategories(data.categories || [])
        setTotalComplaints(data.total || 0)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchComplaints() }, [searchTerm, statusFilter, priorityFilter, categoryFilter, currentPage])

  const openUpdateModal = (c: Complaint) => {
    setEditingComplaint(c); setUpdateStatus(c.status); setUpdateRemarks(c.remarks || ''); setUpdateError('')
  }
  const closeUpdateModal = () => { setEditingComplaint(null); setUpdateStatus(''); setUpdateRemarks(''); setUpdateError('') }

  const handleUpdate = async () => {
    if (!editingComplaint) return
    setUpdating(true); setUpdateError('')
    try {
      const res = await fetch(`${API_BASE}/api/officer/complaints/${editingComplaint.id}/update/`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ status: updateStatus, remarks: updateRemarks }),
      })
      if (res.ok) {
        setComplaints(prev => prev.map(c => c.id === editingComplaint.id ? { ...c, status: updateStatus, remarks: updateRemarks } : c))
        closeUpdateModal()
      } else {
        const err = await res.json(); setUpdateError(err.error || 'Failed to update.')
      }
    } catch { setUpdateError('Network error. Please try again.') }
    finally { setUpdating(false) }
  }

  const totalPages = Math.ceil(totalComplaints / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalComplaints)

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your assigned complaints</p>
        </div>
        <button
          onClick={() => { setIsRefreshing(true); fetchComplaints().finally(() => setIsRefreshing(false)) }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search by title or description..."
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: statusFilter, onChange: (v: string) => { setStatusFilter(v); setCurrentPage(1) }, options: [['all','All Status'],['Pending','Pending'],['In Process','In Progress'],['Completed','Completed']] },
              { value: priorityFilter, onChange: (v: string) => { setPriorityFilter(v); setCurrentPage(1) }, options: [['all','All Priority'],['High','High'],['Medium','Medium'],['Low','Low']] },
              { value: categoryFilter, onChange: (v: string) => { setCategoryFilter(v); setCurrentPage(1) }, options: [['all','All Categories'], ...categories.map(c => [c, c])] },
            ].map((sel, i) => (
              <select key={i} value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sidebar-primary bg-white"
              >
                {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Complaint List</h3>
            <p className="text-xs text-gray-500 mt-0.5">Total: {totalComplaints} complaints</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No complaints found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['ID', 'Title', 'Category', 'Status', 'Priority', 'Citizen', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-mono font-medium text-gray-700">#{c.id}</span>
                        {c.isOverdue && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            <AlertTriangle className="w-3 h-3" />Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{c.description}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{c.category}</span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{c.citizenName}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{c.citizenEmail}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />{c.date}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedComplaint(c)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Showing {totalComplaints > 0 ? startIndex : 0}â€“{endIndex} of {totalComplaints}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-3 py-1 text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* â”€â”€ Complaint Details Modal â”€â”€ */}
      {selectedComplaint && (() => {
        const c = selectedComplaint
        const statusInfo = STATUS_MAP[c.status] ?? STATUS_MAP['Pending']
        const priorityInfo = PRIORITY_MAP[c.priority] ?? PRIORITY_MAP['Medium']
        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">

              {/* Modal header with status color bar */}
              <div className={`h-1.5 w-full ${statusInfo.bar}`} />
              <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sidebar-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-sidebar-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-snug">{c.title}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                        <Hash className="w-3 h-3" />{c.id}
                      </span>
                      {c.isOverdue && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Status + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Priority</p>
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>

                {/* Category + Date row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{c.category}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Submitted</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">{c.submittedDate || c.date}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.description || 'â€”'}</p>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{c.location}</span>
                  </div>
                </div>

                {/* Citizen info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">Citizen Information</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{c.citizenName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{c.citizenEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">{c.citizenPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Attached image */}
                {c.image && (() => {
                  const imgSrc = c.image!.startsWith('http') ? c.image! : `${API_BASE}${c.image}`
                  return (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />Attached Image
                      </p>
                      <a href={imgSrc} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <div className="w-full rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center overflow-hidden" style={{ minHeight: '220px' }}>
                          <img
                            src={imgSrc}
                            alt="Complaint attachment"
                            className="max-w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              const target = e.currentTarget
                              const wrapper = target.closest('div') as HTMLElement
                              if (wrapper) {
                                wrapper.innerHTML = '<div class="flex flex-col items-center justify-center gap-2 text-gray-400 py-10"><svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span class="text-xs">Image unavailable</span></div>'
                              }
                            }}
                          />
                        </div>
                      </a>
                      <p className="text-xs text-gray-400 mt-2 text-center">Click image to open full size</p>
                    </div>
                  )
                })()}

                {/* Remarks */}
                {c.remarks && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />Officer Remarks
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">"{c.remarks}"</p>
                  </div>
                )}

                {/* Last updated */}
                {c.updatedAt && (
                  <p className="text-xs text-gray-400 text-right">Last updated: {c.updatedAt}</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                <button onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                  Close
                </button>
                <button
                  onClick={() => { openUpdateModal(c); setSelectedComplaint(null) }}
                  className="px-5 py-2 bg-sidebar-primary text-white rounded-xl text-sm font-medium hover:bg-sidebar-primary/90 transition-colors flex items-center gap-2">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* â”€â”€ Update Status Modal â”€â”€ */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Update Complaint</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  #{editingComplaint.id} â€” {editingComplaint.title}
                </p>
              </div>
              <button onClick={closeUpdateModal} className="text-gray-300 hover:text-gray-500 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'Pending',     icon: Clock,        cls: 'border-red-300 bg-red-50 text-red-700',         ring: 'ring-red-400' },
                    { value: 'in-progress', icon: Activity,     cls: 'border-yellow-300 bg-yellow-50 text-yellow-700', ring: 'ring-yellow-400' },
                    { value: 'resolved',    icon: CheckCircle,  cls: 'border-green-300 bg-green-50 text-green-700',    ring: 'ring-green-400' },
                  ].map(({ value, icon: Icon, cls, ring }) => (
                    <button key={value} onClick={() => setUpdateStatus(value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        updateStatus === value ? `${cls} ring-2 ring-offset-1 ${ring}` : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}>
                      <Icon className="w-4 h-4" />
                      {value === 'in-progress' ? 'In Progress' : value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                <textarea value={updateRemarks} onChange={(e) => setUpdateRemarks(e.target.value)}
                  rows={3} placeholder="Add notes about this update..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary resize-none bg-gray-50"
                />
              </div>

              {updateError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{updateError}</p>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={closeUpdateModal} disabled={updating}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleUpdate} disabled={updating || !updateStatus}
                className="px-5 py-2 bg-sidebar-primary text-white rounded-xl text-sm font-medium hover:bg-sidebar-primary/90 disabled:opacity-50 flex items-center gap-2">
                {updating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

