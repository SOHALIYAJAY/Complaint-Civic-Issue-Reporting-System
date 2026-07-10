"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone, MapPin, Clock, FileText, AlertTriangle, Award, TrendingUp } from "lucide-react"
import api from '@/lib/axios'

interface OfficerProfileModalProps {
  officerId: string
  open: boolean
  onClose: () => void
}

interface OfficerData {
  officer_id: string
  name: string
  email: string
  phone: string
  is_available: boolean
}

interface ComplaintData {
  id: number
  title: string
  status: string
  priority_level: string
  current_time: string
}

const priorityColors: Record<string, string> = {
  Critical: "bg-red-50 text-[#dc2626]",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-amber-50 text-[#f59e0b]",
  Low: "bg-slate-50 text-slate-500",
}

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  "in-progress": "bg-blue-100 text-[#1e40af]",
  resolved: "bg-green-100 text-[#16a34a]",
}

export default function OfficerProfileModal({ officerId, open, onClose }: OfficerProfileModalProps) {
  const [tab, setTab] = useState<"overview" | "complaints">("overview")
  const [loading, setLoading] = useState(false)
  const [officer, setOfficer] = useState<OfficerData | null>(null)
  const [stats, setStats] = useState({ total_comp: 0, resolved_comp: 0, pending_comp: 0, in_progress_comp: 0 })
  const [complaints, setComplaints] = useState<ComplaintData[]>([])

  useEffect(() => {
    if (open && officerId) {
      fetchOfficerData()
    }
  }, [open, officerId])

  const fetchOfficerData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/officer/${officerId}/`)
      setOfficer(response.data.officer)
      setStats({
        total_comp: response.data.total_comp,
        resolved_comp: response.data.resolved_comp,
        pending_comp: response.data.pending_comp,
        in_progress_comp: response.data.in_progress_comp
      })
      setComplaints(response.data.assigned_complaints || [])
    } catch (error) {
      console.error('Error fetching officer data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {loading || !officer ? (
          <div className="p-10 text-center text-slate-500">Loading...</div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg bg-[#1e40af]">
                  {officer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{officer.name}</h2>
                  <p className="text-sm text-slate-500">{officer.officer_id}</p>
                  <span className={`inline-block mt-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                    officer.is_available ? "bg-green-100 text-[#16a34a]" : "bg-slate-100 text-slate-500"
                  }`}>
                    {officer.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e2e8f0] px-5">
              {(["overview", "complaints"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                    tab === t
                      ? "text-[#1e40af] border-[#1e40af]"
                      : "text-slate-500 border-transparent hover:text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {tab === "overview" && (
                <div className="space-y-5">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg">
                        <Mail className="w-4 h-4 text-[#3b82f6]" />
                        <div>
                          <p className="text-[11px] text-slate-500">Email</p>
                          <p className="text-sm text-slate-800">{officer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#f1f5f9] rounded-lg">
                        <Phone className="w-4 h-4 text-[#16a34a]" />
                        <div>
                          <p className="text-[11px] text-slate-500">Phone</p>
                          <p className="text-sm text-slate-800">{officer.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Performance Metrics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                        <FileText className="w-5 h-5 text-[#1e40af] mx-auto mb-1" />
                        <p className="text-xl font-bold text-slate-800">{stats.total_comp}</p>
                        <p className="text-[11px] text-slate-500">Total</p>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                        <TrendingUp className="w-5 h-5 text-[#16a34a] mx-auto mb-1" />
                        <p className="text-xl font-bold text-slate-800">{stats.resolved_comp}</p>
                        <p className="text-[11px] text-slate-500">Resolved</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
                        <AlertTriangle className="w-5 h-5 text-[#f59e0b] mx-auto mb-1" />
                        <p className="text-xl font-bold text-slate-800">{stats.pending_comp}</p>
                        <p className="text-[11px] text-slate-500">Pending</p>
                      </div>
                      <div className="bg-violet-50 border border-violet-100 rounded-lg p-3 text-center">
                        <Clock className="w-5 h-5 text-[#7c3aed] mx-auto mb-1" />
                        <p className="text-xl font-bold text-slate-800">{stats.in_progress_comp}</p>
                        <p className="text-[11px] text-slate-500">In Progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "complaints" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Assigned Complaints ({complaints.length})</h3>
                  {complaints.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">No complaints assigned</p>
                  ) : (
                    complaints.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] hover:bg-blue-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-[#1e40af] font-semibold">#{c.id}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{c.title}</p>
                            <p className="text-[11px] text-slate-500">{new Date(c.current_time).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityColors[c.priority_level]}`}>
                            {c.priority_level}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[c.status]}`}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
