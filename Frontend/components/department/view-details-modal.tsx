'use client'

import { Eye } from "lucide-react"
import type { Complaint } from "./assigned-complaints-table"
import { useRouter } from "next/navigation"

interface ViewDetailsButtonProps {
  complaint?: Complaint | null
  className?: string
}

export default function ViewDetailsButton({ complaint, className = "" }: ViewDetailsButtonProps) {
  const router = useRouter()

  const handleClick = async () => {
    if (!complaint || !complaint.id) {
      console.log('Invalid complaint data')
      return
    }

    const route = `/department/complaint-details/${complaint.id}`
    
    try {
      await router.push(route)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback navigation
      window.location.href = route
    }
  }

  if (!complaint || !complaint.id) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 rounded-lg ${className}`}>
        {complaint?.id ? 'No ID' : 'No complaint data available'}
      </span>
    )
  }

  return (
    <button
      type="button"
      title={`View details for complaint #${complaint.id}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Eye className="w-3.5 h-3.5" />
      <span>View Details</span>
    </button>
  )
}
