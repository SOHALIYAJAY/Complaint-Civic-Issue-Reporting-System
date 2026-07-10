'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Clock, MessageSquare, Share2, MapPin, Calendar, User, FileText, AlertCircle, Download, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StatusTimeline, { StatusHistoryEntry } from '@/components/status-timeline'

interface Complaint {
  id: string
  title: string
  category_name: string
  Description: string
  location_address: string
  location_District: string
  location_taluk: string
  priority_level: string
  status: string
  current_time?: string
  image_video?: string
  officer_id?: string
  officer_name?: string
  estimated_resolution?: string
  sla_compliance?: number
}

interface ComplaintDetailsModalProps {
  complaint: Complaint | null
  open: boolean
  onClose: () => void
}

const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

export default function ComplaintDetailsModal({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('details')
  const [history, setHistory] = useState<StatusHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'status' && complaint?.id) {
      setHistoryLoading(true)
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      fetch(`${API_BASE}/api/officer/complaints/${complaint.id}/history/`, { headers })
        .then(r => r.ok ? r.json() : { history: [] })
        .then(data => setHistory(data.history || []))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false))
    }
  }, [activeTab, complaint?.id])

  if (!complaint) return null

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'resolved') return 'bg-green-100 text-green-800 border-green-200'
    if (s === 'in process' || s === 'in-progress') return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':   return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      default:       return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'resolved') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (s === 'in process' || s === 'in-progress') return <Activity className="w-5 h-5 text-blue-600" />
    return <AlertCircle className="w-5 h-5 text-yellow-600" />
  }

  const copyComplaintId = () => {
    if (complaint.id) navigator.clipboard.writeText(complaint.id)
  }

  const shareComplaint = () => {
    if (navigator.share) {
      navigator.share({ title: complaint.title, text: `Complaint ID: ${complaint.id}\n${complaint.Description}`, url: window.location.href })
    } else {
      copyComplaintId()
    }
  }

  const downloadComplaint = () => {
    const content = `COMPLAINT DETAILS\n=================\nID: ${complaint.id}\nTitle: ${complaint.title}\nCategory: ${complaint.category_name}\nPriority: ${complaint.priority_level}\nStatus: ${complaint.status}\nDate: ${complaint.current_time || 'N/A'}\n\nDESCRIPTION:\n${complaint.Description}\n\nLOCATION:\nAddress: ${complaint.location_address}\nDistrict: ${complaint.location_District}\nTaluk: ${complaint.location_taluk}\n${complaint.officer_name ? `\nASSIGNED OFFICER: ${complaint.officer_name}` : ''}`.trim()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `complaint-${complaint.id}.txt`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); window.URL.revokeObjectURL(url)
  }

  const TABS = [
    { key: 'details', label: 'Details',        Icon: FileText },
    { key: 'status',  label: 'Complaint Status', Icon: Activity },
    { key: 'actions', label: 'Actions',         Icon: AlertCircle },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(complaint.status)}
                <h2 className="text-2xl font-bold text-gray-900">{complaint.title}</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" />ID: {complaint.id}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-gray-50">

          {/* â”€â”€ Details Tab â”€â”€ */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Priority</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getPriorityColor(complaint.priority_level)}`}>
                    {complaint.priority_level}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-500">Filed On</span>
                  </div>
                  <p className="text-sm text-gray-900">{complaint.current_time || 'Not specified'}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Title</label>
                    <p className="text-sm text-gray-900 font-medium">{complaint.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Category</label>
                    <p className="text-sm text-gray-900">{complaint.category_name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{complaint.Description}</p>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />Location Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Address</label>
                    <p className="text-sm text-gray-900">{complaint.location_address}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">District</label>
                      <p className="text-sm text-gray-900">{complaint.location_District}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Taluk</label>
                      <p className="text-sm text-gray-900">{complaint.location_taluk}</p>
                    </div>
                  </div>
                </div>
              </div>

              {complaint.officer_name && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />Assigned Officer
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{complaint.officer_name}</p>
                      <p className="text-xs text-gray-500">Officer ID: {complaint.officer_id}</p>
                    </div>
                  </div>
                </div>
              )}

              {complaint.image_video && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attached Media</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Media file attached</p>
                        <p className="text-xs text-gray-500">Click to view or download</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ Status Tab â”€â”€ */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Current status badge */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-semibold text-gray-900">Current Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Filed on {complaint.current_time || 'â€”'}</p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Complaint Progress
                </h3>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                ) : (
                  <StatusTimeline
                    currentStatus={complaint.status}
                    submittedAt={complaint.current_time}
                    history={history}
                  />
                )}
              </div>
            </div>
          )}

          {/* â”€â”€ Actions Tab â”€â”€ */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={shareComplaint} className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />Share Complaint
                  </Button>
                  <Button variant="outline" onClick={downloadComplaint} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />Download Details
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about this complaint or need further assistance, please contact our support team.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md border border-yellow-300 text-yellow-700 hover:bg-yellow-100 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />Complaint ID: {complaint.id}
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

