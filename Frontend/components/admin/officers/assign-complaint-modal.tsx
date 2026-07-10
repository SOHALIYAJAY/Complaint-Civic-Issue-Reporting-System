"use client"

import { useState, useEffect } from "react"
import api from '@/lib/axios'
import { X, FileText } from "lucide-react"
import type { Officer } from "./officers-table"

interface AssignComplaintModalProps {
  officer: Officer
  open: boolean
  onClose: () => void
}

// const unassignedComplaints = [
//   { id: "PWD-1006", title: "Bridge railing missing section", priority: "Critical", district: "Bhavnagar" },
//   { id: "PWD-1012", title: "Water pipe leak flooding road", priority: "Critical", district: "Gandhinagar" },
//   { id: "PWD-1015", title: "Manhole cover missing on main road", priority: "High", district: "Ahmedabad" },
//   { id: "PWD-1018", title: "Cracked wall on government building", priority: "Medium", district: "Surat" },
// ]

const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-[#dc2626] border-red-200",
  High: "bg-orange-50 text-orange-600 border-orange-200",
  Medium: "bg-amber-50 text-[#f59e0b] border-amber-200",
  Low: "bg-slate-50 text-slate-500 border-slate-200",
}

export default function AssignComplaintToOfficerModal({ officer, open, onClose }: AssignComplaintModalProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null)
  const [remarks, setRemarks] = useState("")
  const [unassignedComplaints, setUnassignedComplaints] = useState<Array<{id:string,title:string,priority:string,district:string}>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let mounted = true
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await api.get('/api/getcomplaint/')
        // expect array of complaints; filter those not assigned
        const data = Array.isArray(res.data) ? res.data : []
        const unassigned = data.filter((c: any) => !c.is_assignd).map((c: any) => ({
          id: `CVT-${c.id}`,
          title: c.title || 'Untitled',
          priority: c.priority_level || 'Medium',
          district: c.location_District || ''
        }))
        if (mounted) setUnassignedComplaints(unassigned)
      } catch (err) {
        console.error('Failed to load complaints', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetch()
    return () => { mounted = false }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Assign Complaint</h2>
            <p className="text-sm text-slate-500">Assign to: <span className="font-medium text-[#1e40af]">{officer.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Officer workload warning */}
          {officer.activeComplaints && officer.maxCapacity && (officer.activeComplaints / officer.maxCapacity) >= 0.8 && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-xs text-[#dc2626] font-medium">
                Warning: This officer is currently overloaded ({officer.activeComplaints}/{officer.maxCapacity} complaints).
              </p>
            </div>
          )}

          {/* Unassigned Complaints */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Select Complaint</label>
            <div className="space-y-2">
              {loading && <div className="text-sm text-slate-500">Loading complaints...</div>}
              {!loading && unassignedComplaints.length === 0 && (
                <div className="text-sm text-slate-500">No unassigned complaints available.</div>
              )}
              {!loading && unassignedComplaints.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedComplaint === c.id
                      ? "border-[#1e40af] bg-blue-50/50"
                      : "border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="complaint"
                    value={c.id}
                    checked={selectedComplaint === c.id}
                    onChange={() => setSelectedComplaint(c.id)}
                    className="accent-[#1e40af]"
                  />
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#1e40af] font-semibold">{c.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${priorityColors[c.priority]}`}>
                        {c.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-500">{c.district}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Assignment Remarks</label>
            <textarea
              rows={3}
              placeholder="Add notes for the officer..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#1e40af]/20 text-slate-700 placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#e2e8f0]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-[#e2e8f0] rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedComplaint}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1e40af] rounded-lg hover:bg-[#1e3a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Complaint
          </button>
        </div>
      </div>
    </div>
  )
}
