"use client"

import { useState } from "react"
import {
  Send,
  Search,
  Paperclip,
  Radio,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

const complaintOptions = [
  { id: "CMP-2025-001", title: "Pothole on MG Road", user: "Rajesh Patel" },
  { id: "CMP-2025-002", title: "Broken streetlight near bus stand", user: "Priya Shah" },
  { id: "CMP-2025-003", title: "Waterlogging in Satellite area", user: "Amit Desai" },
  { id: "CMP-2025-004", title: "Garbage not collected - Navrangpura", user: "Sunita Verma" },
  { id: "CMP-2025-005", title: "Damaged footpath near SG Highway", user: "Vikram Joshi" },
  { id: "CMP-2025-006", title: "Sewer overflow - Maninagar", user: "Kavita Mehta" },
  { id: "CMP-2025-007", title: "Park maintenance request", user: "Deepak Trivedi" },
]

const notificationTypes = [
  { value: "complaint_update", label: "Complaint Update", color: "bg-[#3b82f6] text-white" },
  { value: "escalation", label: "Escalation", color: "bg-[#f59e0b] text-white" },
  { value: "general", label: "General", color: "bg-[#1e40af] text-white" },
  { value: "warning", label: "Warning", color: "bg-[#dc2626] text-white" },
]

const priorities = [
  { value: "normal", label: "Normal", color: "text-[#16a34a] border-[#16a34a] bg-green-50" },
  { value: "high", label: "High", color: "text-[#f59e0b] border-[#f59e0b] bg-amber-50" },
  { value: "urgent", label: "Urgent", color: "text-[#dc2626] border-[#dc2626] bg-red-50" },
]

export default function SendNotificationForm() {
  const [selectedComplaint, setSelectedComplaint] = useState("")
  const [complaintSearch, setComplaintSearch] = useState("")
  const [showComplaintDropdown, setShowComplaintDropdown] = useState(false)
  const [civicUser, setCivicUser] = useState("")
  const [notifType, setNotifType] = useState("complaint_update")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState("normal")
  const [fileName, setFileName] = useState("")
  const [broadcastMode, setBroadcastMode] = useState<"none" | "department" | "all">("none")
  const [showBroadcastConfirm, setShowBroadcastConfirm] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const filteredComplaints = complaintOptions.filter(
    (c) =>
      c.id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(complaintSearch.toLowerCase())
  )

  const handleSelectComplaint = (complaint: typeof complaintOptions[0]) => {
    setSelectedComplaint(complaint.id)
    setComplaintSearch(complaint.id + " - " + complaint.title)
    setCivicUser(complaint.user)
    setShowComplaintDropdown(false)
  }

  const handleSend = () => {
    if (broadcastMode !== "none") {
      setShowBroadcastConfirm(true)
      return
    }
    setSendSuccess(true)
    setTimeout(() => setSendSuccess(false), 3000)
  }

  const confirmBroadcast = () => {
    setShowBroadcastConfirm(false)
    setSendSuccess(true)
    setTimeout(() => setSendSuccess(false), 3000)
  }

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
      <div className="p-5 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Send className="w-5 h-5 text-[#1e40af]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Send Notification</h3>
            <p className="text-sm text-slate-500">Compose and send notification to civic users</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Broadcast Toggle */}
        <div className="bg-[#f1f5f9] rounded-lg p-4 border border-[#e2e8f0]">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-[#1e40af]" />
            <span className="text-sm font-semibold text-slate-700">Broadcast Mode</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "none" as const, label: "Individual User" },
              { value: "department" as const, label: "All Users in Department" },
              { value: "all" as const, label: "All Civic Users" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setBroadcastMode(opt.value)
                  if (opt.value !== "none") {
                    setSelectedComplaint("")
                    setComplaintSearch("")
                    setCivicUser("")
                  }
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-all font-medium ${
                  broadcastMode === opt.value
                    ? "bg-[#1e40af] text-white border-[#1e40af] shadow-sm"
                    : "bg-white text-slate-600 border-[#e2e8f0] hover:border-[#3b82f6] hover:text-[#1e40af]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Complaint selector - only for individual */}
        {broadcastMode === "none" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Complaint */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Select Complaint
              </label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-[#1e40af]/20 focus-within:border-[#3b82f6]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by complaint ID or title..."
                    value={complaintSearch}
                    onChange={(e) => {
                      setComplaintSearch(e.target.value)
                      setShowComplaintDropdown(true)
                    }}
                    onFocus={() => setShowComplaintDropdown(true)}
                    className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
                  />
                  {selectedComplaint && (
                    <button
                      onClick={() => {
                        setSelectedComplaint("")
                        setComplaintSearch("")
                        setCivicUser("")
                      }}
                      className="p-0.5 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
                {showComplaintDropdown && complaintSearch && !selectedComplaint && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e2e8f0] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSelectComplaint(c)}
                          className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-[#e2e8f0] last:border-0"
                        >
                          <span className="text-xs font-mono text-[#1e40af] font-semibold">{c.id}</span>
                          <p className="text-sm text-slate-700 truncate">{c.title}</p>
                          <p className="text-xs text-slate-400">{c.user}</p>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-sm text-slate-400 text-center">No complaints found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Civic User (auto-filled) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Civic User
              </label>
              <input
                type="text"
                value={civicUser}
                onChange={(e) => setCivicUser(e.target.value)}
                placeholder="Auto-filled from complaint"
                className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#3b82f6] placeholder:text-slate-400"
                readOnly={!!selectedComplaint}
              />
            </div>
          </div>
        )}

        {/* Type & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notification Type
            </label>
            <div className="flex flex-wrap gap-2">
              {notificationTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setNotifType(t.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all font-semibold ${
                    notifType === t.value
                      ? t.color + " border-transparent shadow-sm"
                      : "bg-white text-slate-600 border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all font-semibold ${
                    priority === p.value
                      ? p.color + " border-current"
                      : "bg-white text-slate-600 border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title..."
            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#3b82f6] placeholder:text-slate-400"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your notification message here..."
            rows={4}
            className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#1e40af]/20 focus:border-[#3b82f6] resize-none placeholder:text-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">{message.length}/500 characters</p>
        </div>

        {/* Attach + Send */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <label className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 border border-[#e2e8f0] rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Paperclip className="w-4 h-4" />
              {fileName || "Attach file"}
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
            </label>
            {fileName && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-slate-500">{fileName}</span>
                <button onClick={() => setFileName("")} className="text-slate-400 hover:text-[#dc2626]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1e40af] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a8a] active:scale-[0.98] transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            {broadcastMode !== "none" ? "Send Broadcast" : "Send Notification"}
          </button>
        </div>

        {/* Success toast */}
        {sendSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-[#16a34a] font-medium animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4" />
            Notification sent successfully!
          </div>
        )}
      </div>

      {/* Broadcast Confirmation Modal */}
      {showBroadcastConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-50 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-[#f59e0b]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Confirm Broadcast</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                You are about to send a broadcast notification to{" "}
                <span className="font-semibold text-[#1e40af]">
                  {broadcastMode === "department"
                    ? "all users in your department"
                    : "all civic users on the platform"}
                </span>
                . Are you sure you want to proceed?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowBroadcastConfirm(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-[#e2e8f0] rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBroadcast}
                  className="px-5 py-2 text-sm bg-[#1e40af] text-white rounded-lg font-semibold hover:bg-[#1e3a8a] transition-colors shadow-sm"
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
