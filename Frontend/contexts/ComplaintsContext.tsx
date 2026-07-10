'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Complaint {
  id: number
  title: string
  description: string
  Category?: string
  priority_level: string
  status: string
  location_District: string
  location_address: string
  current_time: string
  assigned_to?: string
  Category__category_name?: string
}

interface ComplaintsContextType {
  complaints: Complaint[]
  setComplaints: (complaints: Complaint[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  refetchComplaints: () => Promise<void>
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined)

export function useComplaints() {
  const context = useContext(ComplaintsContext)
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintsProvider')
  }
  return context
}

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaintsState] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetchComplaints = async (page: number = 1, limit: number = 6) => {
    try {
      setLoading(true)
      setError(null)
      
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      const response = await fetch(`${API_BASE}/api/admincomplaints/?${params.toString()}`, { headers })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.results) {
        setComplaintsState(data.results)
      } else {
        setComplaintsState(Array.isArray(data) ? data : [])
      }
    } catch (err: any) {
      console.error('Error fetching complaints:', err)
      setError(err.message || 'Failed to fetch complaints')
      setComplaintsState([])
    } finally {
      setLoading(false)
    }
  }

  const value: ComplaintsContextType = {
    complaints,
    setComplaints: setComplaintsState,
    loading,
    setLoading,
    error,
    setError,
    refetchComplaints
  }

  return (
    <ComplaintsContext.Provider value={value}>
      {children}
    </ComplaintsContext.Provider>
  )
}

export default ComplaintsProvider
