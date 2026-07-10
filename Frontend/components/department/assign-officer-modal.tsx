"use client"

import { useState, useEffect } from "react"
import { X, UserPlus } from "lucide-react"
import api from '@/lib/axios'

interface AssignModalProps {
  open: boolean
  onClose: () => void
  complaint: { id: string; title: string; officer: string } | null
  onAssignmentComplete?: () => void
}

interface Officer {
  officer_id: string
  name: string
  email: string
  is_available: boolean
}

export default function AssignOfficerModal({
  open,
  onClose,
  complaint,
  onAssignmentComplete,
}: AssignModalProps) {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [selectedOfficer, setSelectedOfficer] = useState("")
  const [priority, setPriority] = useState("High")
  const [remarks, setRemarks] = useState("")
  const [animateIn, setAnimateIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setAnimateIn(true))
      setSelectedOfficer("")
      setPriority("High")
      setRemarks("")
      fetchOfficers()
    } else {
      setAnimateIn(false)
    }
  }, [open])

  const fetchOfficers = async () => {
    try {
      setLoading(true)
      // Fetch only officers belonging to the logged-in user's department
      const response = await api.get('/api/department/officers/')
      const data: any[] = Array.isArray(response.data) ? response.data : []
      setOfficers(data.map((o: any) => ({
        officer_id: o.id || o.officer_id,
        name: o.name,
        email: o.email,
        is_available: o.status === 'Active' || o.is_available,
      })))
    } catch (error) {
      console.error('Error fetching officers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedOfficer || !complaint) return
    
    try {
      setSubmitting(true)
      // Ensure we send a numeric complaint primary key to the API.
      const complaintId = Number(complaint.id) || parseInt(String(complaint.id).replace(/\D/g, ''), 10)

      await api.post('/api/assign-officer/', {
        complaint: complaintId,
        officer: selectedOfficer,
        priority,
        remarks,
      })
      
      alert('Officer assigned successfully!')
      if (onAssignmentComplete) {
        onAssignmentComplete()
      }
      handleClose()
    } catch (error: any) {
      // Log full response body when available for easier debugging
      console.error('Error assigning officer:', error)
      if (error?.response?.data) console.error('Server response:', error.response.data)
      const msg = error?.response?.data?.detail || error?.response?.data || error?.message || 'Failed to assign officer'
      alert(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !complaint) return null

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-xl border border-[#e2e8f0] w-full max-w-md transition-all duration-200 ${
          animateIn
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Assign Officer
              </h3>
              <p className="text-xs text-slate-500">{complaint.id}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Complaint info */}
          <div className="bg-[#f1f5f9] rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">Complaint</p>
            <p className="text-sm font-medium text-slate-800">
              {complaint.title}
            </p>
          </div>

          {/* Select officer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Officer
            </label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              disabled={loading}
            >
              <option value="">{loading ? 'Loading officers...' : 'Choose an officer...'}</option>
              {officers.map((o) => (
                <option key={o.officer_id} value={o.officer_id}>
                  {o.name} - {o.email}
                </option>
              ))}
            </select>
          </div>

          {/* Set priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {["Critical", "High", "Medium", "Low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    priority === p
                      ? p === "Critical"
                        ? "bg-red-50 text-[#dc2626] border-red-200"
                        : p === "High"
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : p === "Medium"
                            ? "bg-amber-50 text-[#f59e0b] border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                      : "bg-white text-slate-500 border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add any notes for the assigned officer..."
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm bg-white text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#e2e8f0]">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-[#e2e8f0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedOfficer || submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Assigning...' : 'Assign Officer'}
          </button>
        </div>
      </div>
    </div>
  )
}
