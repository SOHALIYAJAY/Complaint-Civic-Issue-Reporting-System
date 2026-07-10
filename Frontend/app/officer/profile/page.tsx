"use client"

import React, { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit,
  Save,
  X,
  Shield,
  Award,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock
} from 'lucide-react'
import ChangePasswordModal from '@/components/profile/change-password-modal'

interface OfficerProfile {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  department?: string
  designation?: string
  joinDate: string
  totalComplaintsHandled: number
  complaintsResolved: number
  pendingComplaints: number
  averageResolutionTime: number
  performanceScore: number
  isAvailable: boolean
  lastLogin?: string
}

export default function OfficerProfilePage() {
  const [profile, setProfile] = useState<OfficerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  // Fetch officer profile
  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      console.log('Fetching profile with token:', token ? 'Token exists' : 'No token')
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      console.log('Making request to:', `${API_BASE}/api/officer/profile/`)
      const response = await fetch(`${API_BASE}/api/officer/profile/`, { headers })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data)
        setProfile(data)
        setEditForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      } else {
        const errorData = await response.text()
        console.log('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/api/officer/profile/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editForm)
      })
      
      if (response.ok) {
        alert('Profile updated successfully!')
        setEditing(false)
        fetchProfile()
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'OF'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const toggleAvailability = async () => {
    if (!profile) return
    try {
      setAvailabilityUpdating(true)
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_BASE}/api/officer/profile/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isAvailable: !profile.isAvailable })
      })

      if (response.ok) {
        setProfile({ ...profile, isAvailable: !profile.isAvailable })
      }
    } catch (e) {
      console.error('Failed to toggle availability', e)
    } finally {
      setAvailabilityUpdating(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading profile...</p>
          <p className="mt-1 text-gray-400 text-sm">Loading state: {loading.toString()}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Unable to load profile</p>
          <p className="mt-2 text-gray-400 text-sm">Profile state: {profile ? 'exists' : 'null'}</p>
          <p className="mt-1 text-gray-400 text-sm">Loading state: {loading.toString()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-800">
              {getInitials(profile.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-sm text-gray-500 mt-1">Officer â€¢ {profile.department || 'Department'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleAvailability}
              disabled={availabilityUpdating}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${profile.isAvailable ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {profile.isAvailable ? 'Available' : 'Unavailable'}
            </button>

            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {editing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {profile.email}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {profile.phone || 'Not provided'}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {profile.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
              
              {editing && (
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditForm({
                        name: profile.name || '',
                        phone: profile.phone || '',
                        address: profile.address || ''
                      })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Professional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-sm text-gray-900">{profile.department || 'Not assigned'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <p className="text-sm text-gray-900">{profile.designation || 'Officer'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <div className="flex items-center text-sm text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {profile.joinDate}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.isAvailable 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {profile.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-6">
          {/* Performance Score */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Performance Score</h2>
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getPerformanceBg(profile.performanceScore)} mr-4`}> 
                  <span className={`text-2xl font-bold ${getPerformanceColor(profile.performanceScore)}`}>{profile.performanceScore}</span>
                </div>
                <div className="mt-2">
                  <div className="w-48 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-3 bg-primary" style={{ width: `${Math.min(Math.max(profile.performanceScore, 0), 100)}%` }} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Overall Performance Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complaint Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Complaint Statistics</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Handled</span>
                <span className="text-sm font-medium text-gray-900">{profile.totalComplaintsHandled}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Resolved</span>
                <span className="text-sm font-medium text-green-600">{profile.complaintsResolved}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{profile.pendingComplaints}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Resolution Time</span>
                <span className="text-sm font-medium text-gray-900">{profile.averageResolutionTime} days</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Resolution Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile.totalComplaintsHandled > 0 
                      ? Math.round((profile.complaintsResolved / profile.totalComplaintsHandled) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Last login: {profile.lastLogin || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">Profile updated recently</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">Performance score updated</span>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Keep your account secure by updating your password regularly.</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Lock className="w-4 h-4" /> Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

