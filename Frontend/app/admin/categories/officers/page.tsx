"use client"

import { useState } from "react"
import { ChevronRight, LayoutDashboard, Users, RefreshCw } from "lucide-react"
import OfficersKpiCards from "@/components/admin/officers/officers-kpi-cards"
import OfficersTable from "@/components/admin/officers/officers-table"
import type { Officer } from "@/components/admin/officers/officers-table"
import OfficerProfileModal from "@/components/admin/officers/officer-profile-modal"
import AssignComplaintToOfficerModal from "@/components/admin/officers/assign-complaint-modal"
// import OfficerPerformancePanel from "@/components/department/officer-performance-panel"

export default function OfficersPage() {
  const [profileOfficerId, setProfileOfficerId] = useState<string | null>(null)
  const [assignOfficer, setAssignOfficer] = useState<Officer | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setRefreshKey(prev => prev + 1)
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1e40af] font-medium flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          Officers
        </span>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Department Officers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage officer assignments and performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <OfficersKpiCards key={refreshKey} />

      {/* Table */}
      <div key={`table-${refreshKey}`}>
        <OfficersTable
          onViewProfile={(officerId) => setProfileOfficerId(officerId)}
          onAssignComplaint={(o) => setAssignOfficer(o)}
          onEditOfficer={(o) => console.log('Edit officer:', o)}
          onDeleteOfficer={(id) => console.log('Delete officer:', id)}
        />
      </div>

      {/* Modals */}
      {profileOfficerId && (
        <OfficerProfileModal
          officerId={profileOfficerId}
          open={!!profileOfficerId}
          onClose={() => setProfileOfficerId(null)}
        />
      )}

      {assignOfficer && (
        <AssignComplaintToOfficerModal
          officer={assignOfficer}
          open={!!assignOfficer}
          onClose={() => setAssignOfficer(null)}
        />
      )}
    </div>
  )
}
