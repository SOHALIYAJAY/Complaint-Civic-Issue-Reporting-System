'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, User, Phone, Mail, Clock,
  CheckCircle2, AlertTriangle, FileText, Image as ImageIcon,
  Calendar, Tag, Building, Map, RefreshCw, Activity, X
} from 'lucide-react'
import Link from 'next/link'
import StatusTimeline, { StatusHistoryEntry } from '@/components/status-timeline'

interface ComplaintDetails {
  comp_name: string
  filed_on: string
  description: string
  upload_image?: string
  status: string
  priority: string
  location_address: string
  location_district: string
  location_taluk: string
  officer_id?: string
  assignedOfficer?: { id: number; name?: string; email?: string | null; phone?: string | null; is_available?: boolean }
}

const statusColors: Record<string, string> = {
  'Pending':    'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Process': 'bg-blue-100 text-blue-800 border-blue-200',
  'Completed':  'bg-green-100 text-green-800 border-green-200',
  // legacy
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved':    'bg-green-100 text-green-800 border-green-200',
}

const priorityColors: Record<string, string> = {
  'High':   'bg-red-500',
  'Medium': 'bg-yellow-500',
  'Low':    'bg-green-500',
}

const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('access_token') || localStorage.getItem('adminToken'))
    : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`
  return headers
}

export default function ComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) || { id: undefined }
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
  const [officers, setOfficers] = useState<Array<{ id: number; name: string; officer_id: string }>>([])
  const [selectedOfficer, setSelectedOfficer] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [loadingOfficers, setLoadingOfficers] = useState(false)
  const [deptName, setDeptName] = useState('')

  const complaintImageUrl = complaint?.upload_image
    ? complaint.upload_image.startsWith('http')
      ? complaint.upload_image
      : `${API_BASE}${complaint.upload_image}`
    : '/placeholder-image.png'

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token || token === 'undefined' || token === 'null') return
    const API_BASE_LOCAL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
    fetch(`${API_BASE_LOCAL}/api/department/dashboard/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.department?.category) setDeptName(data.department.category) })
      .catch(() => {})
  }, [])

  if (!id || isNaN(Number(id))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Complaint ID</h2>
          <Link href="/department/assigned" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4" />Back to Complaints
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => { fetchComplaintDetails() }, [id])

  const fetchComplaintDetails = async () => {
    setLoading(true)
    try {
      const [detailRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/complaintindetails/${id}/`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/officer/complaints/${id}/history/`, { headers: getAuthHeaders() }),
      ])

      if (!detailRes.ok) throw new Error(`Failed to fetch: ${detailRes.status}`)
      const data = await detailRes.json()
      if (data.error) throw new Error(data.error)

      setComplaint({
        comp_name: data.comp_name,
        filed_on: data.filed_on,
        description: data.description,
        upload_image: data.upload_image,
        status: data.status,
        priority: data.priority,
        location_address: data.location_address,
        location_district: data.location_district,
        location_taluk: data.location_taluk,
        officer_id: data.officer_id,
        assignedOfficer: data.assigned_officer || null,
      })

      if (historyRes.ok) {
        const hData = await historyRes.json()
        setHistory(hData.history || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const fetchOfficers = async () => {
    setLoadingOfficers(true)
    try {
      const resp = await fetch(`${API_BASE}/api/department/officers/`, { headers: getAuthHeaders() })
      if (!resp.ok) { setOfficers([]); return }
      const data = await resp.json()
      const list = (data || []).map((o: any) => ({ id: o.id, name: o.name || String(o.id), officer_id: o.officer_id || o.id }))
      setOfficers(list)
      if (list.length > 0) setSelectedOfficer(list[0].officer_id)
    } catch { setOfficers([]) }
    finally { setLoadingOfficers(false) }
  }

  const submitAssign = async () => {
    if (!complaint || !selectedOfficer) return alert('Please select an officer')
    setLoading(true)
    try {
      const resp = await fetch(`${API_BASE}/api/assigncomp/${id}/`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ officer_id: selectedOfficer }),
      })
      if (!resp.ok) throw new Error(`Assign failed: ${resp.status}`)
      setComplaint({ ...complaint, officer_id: selectedOfficer })
      alert('Officer assigned successfully')
    } catch (err) {
      alert('Failed to assign: ' + (err instanceof Error ? err.message : String(err)))
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Complaint not found'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchComplaintDetails} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />Retry
            </button>
            <Link href="/department/assigned" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4" />Back
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusClass = statusColors[complaint.status] || 'bg-gray-100 text-gray-800 border-gray-200'
  const priorityDot = priorityColors[complaint.priority] || 'bg-gray-400'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/department/assigned" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />Back to Complaints
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Complaint Details</h1>
                {deptName && <p className="text-xs text-gray-500">{deptName} Department</p>}
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusClass}`}>
              <div className={`w-2 h-2 rounded-full ${priorityDot}`} />
              {complaint.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Main Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Complaint Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{complaint.comp_name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>Filed on {complaint.filed_on}</span></div>
                    <div className="flex items-center gap-1"><Tag className="w-4 h-4" /><span className="font-medium">{complaint.priority} Priority</span></div>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${priorityDot}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />Location Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm font-medium text-gray-900">Address</p><p className="text-gray-700">{complaint.location_address}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Map className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm font-medium text-gray-900">District</p><p className="text-gray-700">{complaint.location_district}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><p className="text-sm font-medium text-gray-900">Taluk</p><p className="text-gray-700">{complaint.location_taluk}</p></div>
                </div>
              </div>
            </div>

            {/* Media block removed to avoid duplicate image display (sidebar has it). */}

            {/* â”€â”€ Complaint Status Timeline â”€â”€ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />Complaint Status
              </h3>
              <StatusTimeline
                currentStatus={complaint.status}
                submittedAt={complaint.filed_on}
                history={history}
              />
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">

            {/* Uploaded Image (Right panel) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint Image</h3>
              {complaint.upload_image ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="block w-full text-left"
                >
                  <img
                    src={complaintImageUrl}
                    alt="Uploaded complaint"
                    className="w-full h-60 object-contain rounded-md border border-gray-200 bg-gray-50 p-1"
                    style={{ maxHeight: '360px', minHeight: '250px' }}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.src = '/placeholder-image.png'
                    }}
                  />
                </button>
              ) : (
                <div className="flex h-44 items-center justify-center text-center rounded-md border border-dashed border-gray-300 bg-gray-50">
                  <p className="text-sm text-gray-500">No image uploaded by user</p>
                </div>
              )}
            </div>

            {/* Assigned Officer */}
            {complaint.assignedOfficer && complaint.assignedOfficer.id ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Officer</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-lg">
                        {complaint.assignedOfficer.name || `Officer #${complaint.assignedOfficer.id}`}
                      </p>
                      <p className="text-sm text-gray-500">ID: {complaint.assignedOfficer.id}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    {complaint.assignedOfficer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{complaint.assignedOfficer.email}</span>
                      </div>
                    )}
                    {complaint.assignedOfficer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{complaint.assignedOfficer.phone}</span>
                      </div>
                    )}
                    {!complaint.assignedOfficer.email && !complaint.assignedOfficer.phone && (
                      <p className="text-sm text-gray-500 italic">No contact information available</p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${complaint.assignedOfficer.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${complaint.assignedOfficer.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {complaint.assignedOfficer.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Officer</h3>
                <p className="text-sm text-gray-500 mb-4">No officer assigned yet.</p>

                {/* Assign form */}
                {officers.length === 0 ? (
                  <button
                    onClick={fetchOfficers}
                    disabled={loadingOfficers}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingOfficers ? 'Loading...' : 'Load Officers to Assign'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <select
                      value={selectedOfficer}
                      onChange={e => setSelectedOfficer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {officers.map(o => (
                        <option key={o.officer_id} value={o.officer_id}>{o.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={submitAssign}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Assign Officer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Priority Level</span>
                  <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${priorityDot}`} />
                    <span className="text-sm font-medium">{complaint.priority}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filed On</span>
                  <span className="text-sm font-medium">{complaint.filed_on}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && complaint.upload_image && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-5xl w-full max-h-full overflow-auto rounded-lg bg-white shadow-lg">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-3 top-3 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={complaintImageUrl}
              alt="Uploaded complaint large"
              className="w-full h-auto max-h-[85vh] object-contain rounded-b-lg"
              onError={(e) => {
                const target = e.currentTarget
                target.src = '/placeholder-image.png'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

