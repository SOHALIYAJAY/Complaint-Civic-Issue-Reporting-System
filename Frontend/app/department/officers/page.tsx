"use client"

import { useState, useEffect } from "react"
import { UserPlus } from "lucide-react"
import OfficersKpiCards from "@/components/admin/officers/officers-kpi-cards"
import OfficersTable from "@/components/admin/officers/officers-table"
import OfficerProfileModal from "@/components/admin/officers/officer-profile-modal"
import EditOfficerModal from "@/components/department/edit-officer-modal"
import AddOfficerModal from "@/components/department/add-officer-modal"

export default function DepartmentOfficersPage() {
  const [profileOfficerId, setProfileOfficerId] = useState<string | null>(null)
  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingOfficer, setEditingOfficer] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)
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

  const handleDeleteOfficer = async (officerId: string) => {
    console.log('Attempting to delete officer with ID:', officerId)
    
    if (!confirm('Are you sure you want to delete this officer?')) {
      return
    }

    try {
      const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const token = localStorage.getItem('access_token')
      
      const url = `${API_BASE_URL}/api/officerdelete/${officerId}/`
      console.log('Delete URL:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Delete response status:', response.status)
      console.log('Delete response ok:', response.ok)

      if (response.ok) {
        // Refresh the table
        setRefreshKey(prev => prev + 1)
        alert('Officer deleted successfully')
      } else {
        const errorData = await response.json()
        console.log('Delete error response:', errorData)
        alert(errorData.message || 'Failed to delete officer')
      }
    } catch (error) {
      console.error('Error deleting officer:', error)
      alert('Failed to delete officer. Please try again.')
    }
  }

  const handleEditOfficer = (officer: any) => {
    setEditingOfficer(officer)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingOfficer(null)
  }

  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1)
    handleCloseEditModal()
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {deptName ? `${deptName} Department â€” Officers` : 'Officers'}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {deptName
                ? `View and manage officers in the ${deptName} Department`
                : 'View and manage officers in your department'}
            </p>
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
        key={refreshKey}
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

      {/* Add Officer Modal */}
      <AddOfficerModal
        open={showAddOfficer}
        onClose={() => setShowAddOfficer(false)}
        onSuccess={() => {
          setShowAddOfficer(false)
          setRefreshKey(prev => prev + 1)
        }}
      />

      {/* Edit Officer Modal */}
      <EditOfficerModal
        officer={editingOfficer}
        open={showEditModal}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}

