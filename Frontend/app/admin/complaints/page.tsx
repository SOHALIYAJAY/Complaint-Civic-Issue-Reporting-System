"use client"

import { useState, useEffect, useContext } from 'react'
import { Download, Filter, RefreshCw, FileText } from 'lucide-react'
import ComplaintsTable from '../../../components/admin/complaints/ComplaintsTable'
import ComplaintsFilters from '../../../components/admin/complaints/ComplaintsFilters'
import ComplaintsKPI from '../../../components/admin/complaints/ComplaintsKPI'
import api from '@/lib/axios'
import { ComplaintsProvider, useComplaints } from '@/contexts/ComplaintsContext'

interface Complaint {
  id: number
  comp_id?: string
  title: string
  Category: string
  Description: string
  image_video?: string
  location_address: string
  location_District: string
  location_taluk: string
  priority_level: string
  status: string
  officer_id?: number
  current_time?: string
}

interface KPIData {
  total_comp: number
  Pending_comp: number
  resolved_comp: number
  inprogress_comp: number
  rejected_comp: number
  sla_compliance: number
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'text-amber-700 border-amber-300',
  'In Process': 'text-blue-700 border-blue-300',
  'Completed': 'text-green-700 border-green-300',
  'Rejected': 'text-red-700 border-red-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'text-green-700 border-green-300',
  'medium': 'text-amber-700 border-amber-300',
  'high': 'text-red-700 border-red-300',
}

export default function AllComplaintsPage() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedAssigned, setSelectedAssigned] = useState('')

  // State for data
  const [kpi, setKpi] = useState<KPIData>({
    total_comp: 0,
    Pending_comp: 0,
    resolved_comp: 0,
    inprogress_comp: 0,
    rejected_comp: 0,
    sla_compliance: 0,
  })

  const [complaintsList, setComplaintsList] = useState<Complaint[]>([])
  const [loadingKPI, setLoadingKPI] = useState(true)
  const [loadingComplaints, setLoadingComplaints] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [serverStart, setServerStart] = useState<number | null>(null)
  const [serverEnd, setServerEnd] = useState<number | null>(null)
  const itemsPerPage = 6

  // Departments will be loaded from backend
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>> ([])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
        const res = await fetch(`${API_BASE_URL}/api/departments/`)
        if (!res.ok) throw new Error('Failed to fetch departments')
        const data = await res.json()
        // API returns [{id,name},...]
        setDepartments(
          (Array.isArray(data) ? data : [])
            .map((d: any) => ({ id: Number(d.id), name: String(d.name) }))
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      } catch (err) {
        console.error('Failed to load departments:', err)
        setDepartments([])
      }
    }
    
    fetchDepartments()
  }, [])

  // Fetch KPI data from backend
  useEffect(() => {
    const fetchKPI = async () => {
      try {
        setLoadingKPI(true)
        setError(null)

        const response = await api.get('/api/admindashboardcard/')
        const data = response.data

        const transformedData: KPIData = {
          total_comp: data.total_comp ?? data.total_complaints ?? 0,
          Pending_comp: data.Pending_comp ?? data.pending_comp ?? 0,
          resolved_comp: data.resolved_comp ?? data.resolved_complaints ?? 0,
          inprogress_comp: data.inprogress_comp ?? data.inprogress_complaints ?? 0,
          rejected_comp: data.rejected_comp ?? data.rejected_complaints ?? 0,
          sla_compliance: data.sla_compliance ?? 0,
        }

        setKpi(transformedData)
      } catch (err: any) {
        console.error('âŒ KPI fetch error:', err)
        setError('Failed to fetch KPI data')
        setKpi({
          total_comp: 0,
          Pending_comp: 0,
          resolved_comp: 0,
          inprogress_comp: 0,
          rejected_comp: 0,
          sla_compliance: 0,
        })
      } finally {
        setLoadingKPI(false)
      }
    }

    fetchKPI()
  }, [])

  // Fetch complaints data from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoadingComplaints(true)
        setError(null)
        
        // Build query parameters for pagination and filters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          department: selectedDepartment,
          status: selectedStatus,
          priority: selectedPriority,
          date_range: selectedDateRange,
          district: selectedDistrict,
          assigned: selectedAssigned,
          search: searchQuery
        })

        // Helpful debug logs for diagnosing 404s
        const requestPath = `/api/admincomplaints/?${params.toString()}`
        console.log('Fetching admin complaints:', api.defaults.baseURL, requestPath)

        try {
          const response = await api.get(requestPath)
          const data = response.data

          // Handle paginated response
          if (data.results) {
            const total = typeof data.count === 'number' ? data.count : (Array.isArray(data.results) ? data.results.length : 0)
            const computedTotalPages = total > 0 ? Math.ceil(total / itemsPerPage) : 1

            // If current page is out of range (e.g., after filters reduced results), clamp it and refetch
            if (currentPage > computedTotalPages && computedTotalPages > 0) {
              setTotalItems(total)
              setTotalPages(computedTotalPages)
              setServerStart(typeof data.start === 'number' ? data.start : null)
              setServerEnd(typeof data.end === 'number' ? data.end : null)
              setCurrentPage(computedTotalPages)
              return
            }

            setComplaintsList(data.results)
            setTotalItems(total)
            setTotalPages(computedTotalPages)
            setServerStart(typeof data.start === 'number' ? data.start : null)
            setServerEnd(typeof data.end === 'number' ? data.end : null)
          } else {
            // Fallback for non-paginated response
            const list = Array.isArray(data) ? data : []
            setComplaintsList(list)
            setTotalItems(list.length)
            setTotalPages(list.length > 0 ? Math.ceil(list.length / itemsPerPage) : 1)
          }
        } catch (err: any) {
          // Log rich error info for debugging 404/403 issues
          console.error('âŒ Complaints fetch request failed:', {
            url: `${api.defaults.baseURL}${requestPath}`,
            status: err?.response?.status,
            data: err?.response?.data,
            message: err?.message
          })
          // If backend returns 404 for an out-of-range page, step the page back and retry via effect
          if (err?.response?.status === 404 && currentPage > 1) {
            console.warn(`Page ${currentPage} out of range â€” stepping back to previous page`)
            setCurrentPage(prev => Math.max(1, prev - 1))
            return
          }
          throw err
        }
        // (Handled above inside the request try/catch)
      } catch (err: any) {
        console.error('âŒ Complaints fetch error:', err)
        setError('Failed to fetch complaints data')
        setComplaintsList([])
      } finally {
        setLoadingComplaints(false)
      }
    }

    fetchComplaints()
  }, [currentPage, selectedDepartment, selectedStatus, selectedPriority, selectedDateRange, selectedDistrict, selectedAssigned, searchQuery])

  // State for selected complaint (for modal)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingComplaint, setDeletingComplaint] = useState<Complaint | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Event handlers
  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setIsModalOpen(true)
  }

  const handleUpdateComplaint = (complaint: Complaint) => {
    // Open edit modal with a shallow copy to edit
    setEditingComplaint({ ...complaint })
    setIsEditModalOpen(true)
  }

  const saveEditedComplaint = async () => {
    if (!editingComplaint) return
    const pk = editingComplaint.id
    if (!pk) { alert('Cannot determine complaint id for update'); return }
    try {
      const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const payload = {
        title: editingComplaint.title,
        Description: editingComplaint.Description,
        priority_level: editingComplaint.priority_level,
        status: editingComplaint.status,
        location_address: editingComplaint.location_address,
        location_District: editingComplaint.location_District,
        location_taluk: editingComplaint.location_taluk,
      }
      const res = await fetch(`${API_BASE_URL}/api/complaintupdate/${pk}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(`Failed to update: ${result.error || res.statusText}`)
        return
      }
      setComplaintsList(prev => prev.map(c => c.id === pk ? { ...c, ...payload } : c))
      setIsEditModalOpen(false)
      setEditingComplaint(null)
      alert('Complaint updated successfully')
    } catch (err: any) {
      console.error('Update error:', err)
      alert('Error updating complaint')
    }
  }

  const handleDeleteComplaint = (complaint: Complaint) => {
    setDeletingComplaint(complaint)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingComplaint) return
    const pk = deletingComplaint.id
    if (!pk) { alert('Cannot determine complaint id for delete'); return }
    try {
      const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const res = await fetch(`${API_BASE_URL}/api/complaintdelete/${pk}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`${res.status}`)
      setComplaintsList(prev => prev.filter(c => c.id !== pk))
      setIsDeleteModalOpen(false)
      setDeletingComplaint(null)
    } catch (err: any) {
      alert('Error deleting complaint: ' + err.message)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedComplaint(null)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('all')
    setSelectedStatus('all')
    setSelectedPriority('all')
    setSelectedDateRange('all')
  }

  const handleRefreshKPI = async () => {
    try {
      setLoadingKPI(true)
      setError(null)

      const response = await api.get('/api/admindashboardcard/')
      const data = response.data

      const transformedData: KPIData = {
        total_comp: data.total_comp ?? data.total_complaints ?? 0,
        Pending_comp: data.Pending_comp ?? data.pending_comp ?? 0,
        resolved_comp: data.resolved_comp ?? data.resolved_complaints ?? 0,
        inprogress_comp: data.inprogress_comp ?? data.inprogress_complaints ?? 0,
        rejected_comp: data.rejected_comp ?? data.rejected_complaints ?? 0,
        sla_compliance: data.sla_compliance ?? 0,
      }
      setKpi(transformedData)
    } catch (err: any) {
      console.error('âŒ KPI refresh error:', err)
      setError('Failed to refresh KPI data')
      setKpi({
        total_comp: 0,
        Pending_comp: 0,
        resolved_comp: 0,
        inprogress_comp: 0,
        rejected_comp: 0,
        sla_compliance: 0,
      })
    } finally {
      setLoadingKPI(false)
    }
  }

  const handleRefresh = async () => {
    // Refetch both KPI and complaints data
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sidebar-primary">All Complaints</h1>
            <p className="text-sidebar-primary mt-1">Manage and monitor all civic complaints</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8">
        <ComplaintsKPI 
          kpi={kpi} 
          loading={loadingKPI} 
          error={error} 
          onRefresh={handleRefreshKPI}
        />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ComplaintsFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedAssigned={selectedAssigned}
          setSelectedAssigned={setSelectedAssigned}
        />
      </div>

      {/* Complaints Table */}
      <div className="mb-8">
        <ComplaintsTable
          complaints={complaintsList}
          loading={loadingComplaints}
          searchQuery={searchQuery}
          selectedDepartment={selectedDepartment}
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
          selectedDateRange={selectedDateRange}
          departments={departments}
          onView={handleViewComplaint}
          onUpdate={handleUpdateComplaint}
          onDelete={handleDeleteComplaint}
        />
      </div>
      
      {/* Pagination Controls */}
      {!loadingComplaints && complaintsList.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-700">
            {(() => {
              const computedStart = totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1
              const computedEnd = totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems)
              const start = serverStart ?? computedStart
              const end = serverEnd ?? computedEnd
              return `Showing ${start} to ${end} of ${totalItems} complaints`
            })()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {(() => {
                const maxVisiblePages = 5
                let startPage = Math.max(1, currentPage - 2)
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
                
                // Adjust for edge cases
                if (endPage - startPage < maxVisiblePages - 1) {
                  endPage = startPage + maxVisiblePages - 1
                }
                
                return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                  const pageNum = startPage + i
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${
                        pageNum === currentPage
                          ? 'bg-sidebar-primary text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })
              })()}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/90 ${STATUS_COLORS[selectedComplaint.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {selectedComplaint.status}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-white/90 ${PRIORITY_COLORS[selectedComplaint.priority_level?.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                      {selectedComplaint.priority_level} Priority
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-snug">{selectedComplaint.title}</h2>
                  <p className="text-white/60 text-xs mt-1">
                    {selectedComplaint.current_time ? new Date(selectedComplaint.current_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date unknown'}
                  </p>
                </div>
                <button onClick={handleCloseModal} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors flex-shrink-0">
                  <span className="text-lg leading-none">&times;</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto bg-gray-50">
              {/* Info grid */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Complaint Info</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                  {[
                    { label: 'Category', value: selectedComplaint.Category },
                    { label: 'Priority', value: selectedComplaint.priority_level },
                    { label: 'Status', value: selectedComplaint.status },
                    { label: 'District', value: selectedComplaint.location_District },
                    { label: 'Taluk', value: selectedComplaint.location_taluk },
                    { label: 'Filed On', value: selectedComplaint.current_time ? new Date(selectedComplaint.current_time).toLocaleDateString() : 'N/A' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-gray-900">{value || 'â€”'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Location</p>
                <p className="text-sm text-gray-800">{selectedComplaint.location_address || 'â€”'}</p>
              </div>

              {/* Description */}
              {(selectedComplaint as any).Description && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{(selectedComplaint as any).Description}</p>
                </div>
              )}

              {/* Media */}
              {(selectedComplaint as any).image_video && (() => {
                const imgUrl = (selectedComplaint as any).image_video
                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(imgUrl)
                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}${imgUrl}`
                return (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Attached Media</p>
                    {isImg ? (
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                        <img src={fullUrl} alt="attachment" className="w-full max-h-52 object-cover rounded-lg border border-gray-100 hover:opacity-90 transition-opacity" />
                      </a>
                    ) : (
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-colors">
                        <FileText className="w-5 h-5 text-sidebar-primary" />
                        <span className="text-sm text-gray-700">View attached file</span>
                      </a>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white">
              <button onClick={handleCloseModal} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-sidebar-primary">Edit Complaint</h2>
                <p className="text-xs text-slate-500 mt-0.5">ID: {editingComplaint.id}</p>
              </div>
              <button onClick={() => { setIsEditModalOpen(false); setEditingComplaint(null) }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 text-xl">&times;</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input value={editingComplaint.title} onChange={(e) => setEditingComplaint({ ...editingComplaint, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={3} value={editingComplaint.Description} onChange={(e) => setEditingComplaint({ ...editingComplaint, Description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-transparent resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select value={editingComplaint.priority_level} onChange={(e) => setEditingComplaint({ ...editingComplaint, priority_level: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-transparent">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={editingComplaint.status} onChange={(e) => setEditingComplaint({ ...editingComplaint, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-transparent">
                    <option value="Pending">Pending</option>
                    <option value="In Process">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location Address</label>
                  <input value={editingComplaint.location_address} onChange={(e) => setEditingComplaint({ ...editingComplaint, location_address: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  <input value={editingComplaint.location_District} onChange={(e) => setEditingComplaint({ ...editingComplaint, location_District: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sidebar-primary focus:border-transparent" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button onClick={() => { setIsEditModalOpen(false); setEditingComplaint(null) }} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={saveEditedComplaint} className="px-4 py-2 bg-sidebar-primary text-white rounded-lg text-sm font-medium hover:bg-sidebar-primary transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-sidebar-primary">Delete Complaint</h2>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                Are you sure you want to delete <span className="font-semibold">&ldquo;{deletingComplaint.title}&rdquo;</span>?
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <button onClick={() => { setIsDeleteModalOpen(false); setDeletingComplaint(null) }} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

