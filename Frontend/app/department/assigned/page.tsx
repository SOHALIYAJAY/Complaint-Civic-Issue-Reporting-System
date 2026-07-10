"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import AssignedComplaintsStats from "@/components/department/assigned-complaints-stats"
import AssignedComplaintsTable from "@/components/department/assigned-complaints-table"
import type { Complaint } from "@/components/department/assigned-complaints-table"
import AssignOfficerModal from "@/components/department/assign-officer-modal"
import AssignedAnalyticsSidebar from "@/components/department/assigned-analytics-sidebar"

export default function AssignedComplaintsPage() {
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const tableRef = useRef<{ refreshComplaints: () => void }>(null)
  const [deptName, setDeptName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token || token === 'undefined' || token === 'null') return
    const API = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
    fetch(`${API}/api/department/dashboard/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.department?.category) setDeptName(data.department.category) })
      .catch(() => {})
  }, [])

  const handleAssign = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setAssignModalOpen(true)
  }

  const handleViewDetails = (complaint: Complaint) => {
    console.log('Viewing details for complaint:', complaint.id)
    // Navigation is handled by ViewDetailsButton component
  }

  const handleAssignmentComplete = () => {
    // Refresh the table data after assignment
    if (tableRef.current) {
      tableRef.current.refreshComplaints()
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/department" className="flex items-center gap-1 text-slate-500 hover:text-[#1e3a5f] transition-colors">
          <Home className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#1e3a5f] font-medium">Assigned Complaints</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {deptName ? `${deptName} Department â€” Complaints` : 'Assigned Complaints'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {deptName
            ? `Manage and update complaints for the ${deptName} Department`
            : 'Manage and update department-level complaints'}
        </p>
      </div>

      {/* Summary Cards */}
      <AssignedComplaintsStats />

      {/* Main Content: Table Only */}
      <div>
        <AssignedComplaintsTable 
          ref={tableRef}
          onAssign={handleAssign} 
          onViewDetails={handleViewDetails} 
          initialView="category"
          onAssignmentComplete={handleAssignmentComplete}
        />
      </div>

      {/* Modals */}
      <AssignOfficerModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        complaint={selectedComplaint ? { id: selectedComplaint.id.toString(), title: selectedComplaint.title, officer: selectedComplaint.officer_id?.toString() || '' } : null}
        onAssignmentComplete={handleAssignmentComplete}
      />
    </div>
  )
}

