'use client'

import { useState } from 'react'
import { Search, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TrackComplaintPage() {
  const [complaintId, setComplaintId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const handleTrack = async () => {
    if (!complaintId.trim()) {
      setError('Please enter a complaint ID')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      const response = await fetch(`${API_BASE}/api/trackcomplaint/${complaintId}/`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Complaint not found')
        } else {
          setError('Failed to track complaint')
        }
        return
      }

      const data = await response.json()
      setResult(data)
      setError('')
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Complaint</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your complaint ID to get real-time status updates and track resolution progress
          </p>
        </div>

        {/* Tracking Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="max-w-2xl mx-auto">
            {/* Search Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Complaint ID
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter complaint ID (e.g., CMP-2024-001)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
                <Button
                  onClick={handleTrack}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Track'
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Results */}
            {result && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Complaint Found</h2>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        result.status === 'resolved' 
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <p className="font-medium text-gray-900">{result.category || result.Category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Priority</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        result.priority_level === 'High'
                          ? 'bg-red-100 text-red-800'
                          : result.priority_level === 'Medium'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {result.priority_level}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="font-medium text-gray-900">{result.Description}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="font-medium text-gray-900">
                        {result.location_address}, {result.location_District}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Filed Date</p>
                      <p className="font-medium text-gray-900">
                        {result.current_time ? new Date(result.current_time).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {result.updated_at ? new Date(result.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => router.push('/my-complaints')}
                      variant="outline"
                      className="flex-1"
                    >
                      View All My Complaints
                    </Button>
                    <Button
                      onClick={() => router.push('/')}
                      className="flex-1"
                    >
                      File New Complaint
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
            <p className="text-blue-700 mb-4">
              If you're having trouble finding your complaint, contact our support team or check your email for the complaint confirmation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  Contact Support
                </Button>
              </Link>
              <Link href="/my-complaints">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  View All Complaints
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

