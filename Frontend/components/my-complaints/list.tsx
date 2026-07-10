'use client'

import { useState } from 'react'
import { ChevronRight, AlertTriangle, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Complaint {
  id: string
  title: string
  category_name: string
  category_code?: string
  Description: string
  location_address: string
  location_District: string
  location_taluk: string
  current_time: string
  status: 'Pending' | 'in-progress' | 'resolved'
  priority_level: 'Low' | 'Medium' | 'High'
  image_video?: string
  officerRemarks?: string
  timeline?: Array<{ step: string; date: string; status: 'completed' | 'pending' }>
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Pending: { bg: 'bg-orange-500/10', text: 'text-orange-700', border: 'border-orange-500/20' },
  'In Process': { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/20' },
  'in-progress': { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/20' },
  Completed: { bg: 'bg-green-500/10', text: 'text-green-700', border: 'border-green-500/20' },
  resolved: { bg: 'bg-green-500/10', text: 'text-green-700', border: 'border-green-500/20' },
}

const priorityColors: Record<string, string> = {
  Low: 'bg-blue-100 text-blue-800',
  Medium: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-800',
}

export default function ComplaintsList({
  filterStatus,
  searchTerm,
  categoryFilter,
  priorityFilter,
  onSelectComplaint,
  complaints,
}: {
  filterStatus: string
  searchTerm: string
  categoryFilter: string
  priorityFilter: string
  onSelectComplaint: (complaint: Complaint) => void
  complaints: Complaint[]
}) {
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6

  const normalizeStatus = (s: string) => {
    const v = (s || '').trim().toLowerCase()
    if (v === 'in process' || v === 'in-progress' || v === 'in_progress') return 'in-progress'
    if (v === 'completed' || v === 'resolved') return 'resolved'
    return 'pending'
  }

  const filteredComplaints = (complaints || [])
    .filter((c) => (filterStatus === 'all' ? true : normalizeStatus(c.status) === normalizeStatus(filterStatus)))
    .filter((c) => {
      if (categoryFilter === 'all') return true
      const categoryValue = c.category_name || ''
      return String(categoryValue) === String(categoryFilter)
    })
    .filter((c) => (priorityFilter === 'all' ? true : c.priority_level === priorityFilter))
    .filter(
      (c) =>
        String(c.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.title).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.current_time).getTime() - new Date(a.current_time).getTime())

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage))
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedComplaints = filteredComplaints.slice(startIdx, startIdx + itemsPerPage)

  if (filteredComplaints.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Complaints Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              No complaints match your current filters. Try adjusting your search criteria or resetting filters.
            </p>
            <Button className="mt-6 bg-primary hover:bg-secondary">Raise a New Complaint</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {paginatedComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="glass-effect rounded-lg border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-mono text-muted-foreground mb-1">{complaint.id}</p>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{complaint.title}</h3>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[complaint.priority_level] || 'bg-gray-100 text-gray-800'}`}>
                        {complaint.priority_level ? complaint.priority_level.charAt(0).toUpperCase() + complaint.priority_level.slice(1) : 'Unknown'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[complaint.status]?.bg || 'bg-gray-500/10'} ${statusColors[complaint.status]?.text || 'text-gray-700'} ${statusColors[complaint.status]?.border || 'border-gray-500/20'}`}
                      >
                        {normalizeStatus(complaint.status) === 'in-progress'
                          ? 'In Progress'
                          : normalizeStatus(complaint.status) === 'resolved'
                            ? 'Completed'
                            : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{complaint.Description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{complaint.location_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{new Date(complaint.current_time).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center lg:items-start flex-shrink-0">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-primary hover:text-primary-foreground group/btn cursor-pointer"
                    onClick={() => onSelectComplaint(complaint)}
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="border-border">
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? 'default' : 'outline'} onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-primary' : 'border-border'}>
                {page}
              </Button>
            ))}
            <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="border-border">
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
