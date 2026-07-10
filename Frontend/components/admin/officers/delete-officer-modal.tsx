'use client'

import { useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'

interface Officer {
  officer_id: string
  name: string
  email: string
  phone: string
  is_available: boolean
}

interface DeleteOfficerModalProps {
  officer: Officer | null
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

export default function DeleteOfficerModal({ officer, isOpen, onClose, onDelete }: DeleteOfficerModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!officer) return

    try {
      setLoading(true)
      setError('')
      
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const response = await fetch(`${API_BASE}/api/officerdelete/${officer.officer_id}/`, {
        method: 'DELETE',
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete officer')
      }

      onDelete()
      onClose()
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete officer')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !officer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Delete Officer</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Officer Information:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID:</span> {officer.officer_id}</p>
              <p><span className="font-medium">Name:</span> {officer.name}</p>
              <p><span className="font-medium">Email:</span> {officer.email}</p>
              <p><span className="font-medium">Phone:</span> {officer.phone}</p>
              <p><span className="font-medium">Status:</span> {officer.is_available ? 'Available' : 'Unavailable'}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Deleting this officer will remove all their assignments and data. This action is permanent.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Officer
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

