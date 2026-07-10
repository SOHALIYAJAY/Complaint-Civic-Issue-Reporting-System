"use client"

import { useState, useEffect } from "react"
import { UserPlus } from "lucide-react"
import { apiGet } from '@/lib/api'
import OfficersKpiCards from "@/components/admin/officers/officers-kpi-cards"
import OfficersTable from "@/components/admin/officers/officers-table"
import OfficerProfileModal from "@/components/admin/officers/officer-profile-modal"
import AddOfficerModal from "@/components/department/add-officer-modal"
import EditOfficerModal from "@/components/admin/officers/edit-officer-modal"
import DeleteOfficerModal from "@/components/admin/officers/delete-officer-modal"
import { Officer } from "@/components/admin/officers/officers-table"

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [profileOfficerId, setProfileOfficerId] = useState<string | null>(null)
  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null)
  const [deletingOfficer, setDeletingOfficer] = useState<Officer | null>(null)

  // Fetch officers from API
  useEffect(() => {
    fetchOfficers()
  }, [])

  const fetchOfficers = async () => {
    try {
      setLoading(true)
      const response = await apiGet('/api/officerinfo/')
      setOfficers(response)
    } catch (error) {
      console.error('Error fetching officers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditOfficer = (officer: Officer) => {
    setEditingOfficer(officer)
  }

  const handleDeleteOfficer = (officerId: string) => {
    const officer = officers.find(o => o.officer_id === officerId)
    if (officer) {
      setDeletingOfficer(officer)
    }
  }

  const handleSaveOfficer = (updatedOfficer: Officer) => {
    // Update officers list
    setOfficers(prev => prev.map(o => 
      o.officer_id === updatedOfficer.officer_id ? updatedOfficer : o
    ))
    setEditingOfficer(null)
  }

  const handleConfirmDelete = () => {
    if (deletingOfficer) {
      setOfficers(prev => prev.filter(o => o.officer_id !== deletingOfficer.officer_id))
      setDeletingOfficer(null)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-[#1e3a5f] shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Officers Management</h1>
            <p className="text-gray-500 mt-1 text-sm">Monitor and manage all department officers</p>
          </div>
          <button
            onClick={() => setShowAddOfficer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Officer
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <OfficersKpiCards />

      {/* Officers Table */}
      <OfficersTable
        onViewProfile={(officerId) => setProfileOfficerId(officerId)}
        onAssignComplaint={() => {}}
        onEditOfficer={handleEditOfficer}
        onDeleteOfficer={handleDeleteOfficer}
      />

      {/* Profile Modal */}
      {profileOfficerId && (
        <OfficerProfileModal
          officerId={profileOfficerId}
          open={!!profileOfficerId}
          onClose={() => setProfileOfficerId(null)}
        />
      )}

      {/* Edit Officer Modal */}
      {editingOfficer && (
        <EditOfficerModal
          officer={editingOfficer}
          isOpen={!!editingOfficer}
          onClose={() => setEditingOfficer(null)}
          onSave={handleSaveOfficer}
        />
      )}

      {/* Delete Officer Modal */}
      {deletingOfficer && (
        <DeleteOfficerModal
          officer={deletingOfficer}
          isOpen={!!deletingOfficer}
          onClose={() => setDeletingOfficer(null)}
          onDelete={handleConfirmDelete}
        />
      )}

      {/* Add Officer Modal */}
      <AddOfficerModal
        open={showAddOfficer}
        onClose={() => setShowAddOfficer(false)}
        onSuccess={() => setShowAddOfficer(false)}
      />
    </div>
  )
}
