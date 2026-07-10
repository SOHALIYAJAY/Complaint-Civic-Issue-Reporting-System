'use client'

import { Eye, Edit, Trash, FileText } from 'lucide-react'

interface Complaint {
  id:number
  title: string
  Category: string
  Description: string
  image_video?: string
  location_address: string
  location_District: string
  location_taluk: string
  priority_level: string
  status: string
  officer_id?: number
  current_time?: string
}

interface ComplaintsTableProps {
  complaints: Complaint[]
  loading: boolean
  searchQuery: string
  selectedDepartment: string
  selectedStatus: string
  selectedPriority: string
  selectedDateRange: string
  departments: Array<{ id: number; name: string }>
  onView: (complaint: Complaint) => void
  onUpdate: (complaint: Complaint) => void
  onDelete: (complaint: Complaint) => void
}

export default function ComplaintsTable({
  complaints,
  loading,
  searchQuery,
  selectedDepartment,
  selectedStatus,
  selectedPriority,
  selectedDateRange,
  departments,
  onView,
  onUpdate,
  onDelete
}: ComplaintsTableProps) {
  // Note: No client-side filtering needed since backend handles pagination with filters
  // Just display the complaints that are passed to this component
  
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Complaint ID</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Location</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">District</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Priority</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-[#1E293B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr key="loading-row">
                <td colSpan={9} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[#2563EB]">Loading complaints...</span>
                  </div>
                </td>
              </tr>
            ) : complaints.length > 0 ? (
              complaints.map((complaint, index) => {
                // Create a unique key using multiple fields to ensure uniqueness
                const uniqueKey = complaint.id
                  ? complaint.id.toString()
                  : `${complaint.title}-${index}`;
                
                return (
                  <tr key={uniqueKey} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono text-[#2563EB] font-semibold">{complaint.id}</td>
                    <td className="px-4 py-3 text-[#1E293B]">{complaint.title}</td>
                    <td className="px-4 py-3 text-[#64748B]">{(complaint as any).category_name || (complaint as any).Category}</td>
                    <td className="px-4 py-3 text-[#64748B]">{complaint.location_address}</td>
                    <td className="px-4 py-3 text-[#64748B]">{complaint.location_District}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        complaint.priority_level === 'High' ? 'bg-red-100 text-red-700' :
                          complaint.priority_level === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                      }`}>
                        {complaint.priority_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        complaint.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          complaint.status === 'In Process' || complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-sm">
                      {complaint.current_time ? new Date(complaint.current_time).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(complaint)}
                          className="p-1 text-[#2563EB] hover:text-[#1D4ED8] hover:bg-[#F8FAFC] rounded transition-colors"
                          title="View complaint"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdate(complaint)}
                          className="p-1 text-[#22C55E] hover:text-[#16A34A] hover:bg-[#F8FAFC] rounded transition-colors"
                          title="Update complaint"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(complaint)}
                          className="p-1 text-[#EF4444] hover:text-[#DC2626] hover:bg-[#F8FAFC] rounded transition-colors"
                          title="Delete complaint"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr key="no-data-row">
                <td colSpan={9} className="px-4 py-8 text-center text-[#64748B]">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-[#94A3B8] mx-auto mb-2" />
                    <p className="text-lg font-medium text-[#64748B]">No complaints found</p>
                    <p className="text-sm text-[#94A3B8]">Try adjusting your filters or search terms</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
