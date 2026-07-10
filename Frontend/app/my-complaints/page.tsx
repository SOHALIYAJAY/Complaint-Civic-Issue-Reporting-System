 'use client'

import { useState, useEffect } from 'react'
import UtilityBar from '@/components/utility-bar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import MyComplaintsHeader from '@/components/my-complaints/header'
import ComplaintsSummary from '@/components/my-complaints/summary'
import ComplaintsFilter from '@/components/my-complaints/filter'
import ComplaintsList from '@/components/my-complaints/list'
import ComplaintDetailsModal from '@/components/my-complaints/details-modal'
import RequireAuth from '@/components/auth/RequireAuth'

interface Complaint {
  id: string
  title: string
  category_name: string
  Description: string
  location_address: string
  location_District: string
  location_taluk: string
  current_time: string
  status: 'Pending' | 'in-progress' | 'resolved'
  priority_level: 'Low' | 'Medium' | 'High'
  image_video?: string
  slaCompliance?: number
  officerRemarks?: string
  timeline?: Array<{ step: string; date: string; status: 'completed' | 'pending' }>
  estimatedResolution?: string
}

export default function MyComplaintsPage() {

  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)

  
  const [complaints, setComplaints] = useState<Complaint[]>([])
  
    // Use environment variable for API base so we can switch hosts/protocols.
    // Resolve at runtime to match the page protocol and avoid mixed-content issues.
    const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
  
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const isTokenValid = Boolean(token && token !== 'undefined' && token !== 'null')
        
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
        
        if (isTokenValid) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        // Build query params from active filters/search
        const params = new URLSearchParams()
        if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus)
        if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter)
        if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter)
        if (searchTerm && searchTerm.trim() !== '') params.append('search', searchTerm.trim())

        const url = `${API_BASE}/api/getcomplaint/${params.toString() ? `?${params.toString()}` : ''}`

        const res = await fetch(url, {
          headers,
          mode: 'cors',
        })
  
        if (!res.ok) {
          const text = await res.text()
          console.error('API Error Response:', text?.substring?.(0, 500) ?? text)
          
          if (res.status === 401) {
            console.warn('Authentication failed, clearing invalid token')
            localStorage.removeItem('access_token')
            // Redirect to login or show empty state
            setComplaints([])
            return
          }
          
          throw new Error(`API returned ${res.status}`)
        }
  
        const text = await res.text()
        let data
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error('Failed to parse JSON:', text?.substring?.(0, 500) ?? text)
          throw new Error('Invalid JSON response from API')
        }
  
        console.log('API Response:', data)
        setComplaints(Array.isArray(data) ? data : data.results || [])
      } catch (error) {
        console.error('Failed to fetch complaints:', error)
        setComplaints([])
      }
    }

    fetchComplaints()
  // Re-run fetch when any filter/search changes so server-side filtering can be applied
  }, [API_BASE, filterStatus, categoryFilter, priorityFilter, searchTerm])
  return (
    <RequireAuth>
      <main className="min-h-screen bg-background">
        <UtilityBar />
        <Header />

        {/* Breadcrumb */}
        <section className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              <span>/</span>
              <span className="text-foreground font-medium">My Complaints</span>
            </div>
          </div>
        </section>

        {/* Header Section */}
        <MyComplaintsHeader />

        {/* Summary Cards */}
        <section className="py-6 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ComplaintsSummary />
          </div>
        </section>

        {/* Filter Section */}
        <ComplaintsFilter
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        {/* Complaints List */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ComplaintsList
              filterStatus={filterStatus}
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              priorityFilter={priorityFilter}
              onSelectComplaint={setSelectedComplaint}
              complaints={complaints}
            />
          </div>
        </section>

        {/* Complaint Details Modal */}
        {selectedComplaint && (
          <ComplaintDetailsModal
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
          />
        )}

        <Footer />
      </main>
    </RequireAuth>
  )
}

