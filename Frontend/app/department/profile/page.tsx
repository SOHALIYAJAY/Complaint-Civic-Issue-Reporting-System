"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  User, Camera, Shield, Lock, Mail, Phone, MapPin, Building, Calendar, Clock, 
  RefreshCw, Save, CheckCircle2, FileText, TrendingUp, Users, Award, Edit2,
  AlertTriangle, Activity, Target, Briefcase, Upload, Image as ImageIcon
} from "lucide-react"
import api from '@/lib/axios'
import ChangePasswordModal from '@/components/profile/change-password-modal'

// Types
interface DepartmentInfo {
  name: string
  category: string
  description: string
  contact_email: string
  contact_phone: string
}

interface ComplaintStats {
  total: number
  resolved: number
  pending: number
  in_progress: number
  performance_score: number
}

interface UserProfile {
  id: number
  username: string
  name: string
  email: string
  phone: string
  role: string
  department: DepartmentInfo | null
  address: string
  district: string
  taluka: string
  ward_number: string
  joined_date: string
  last_login: string
  is_active: boolean
  complaint_stats: ComplaintStats
}

interface EditableFields {
  name: string
  phone: string
  address: string
  district: string
  taluka: string
  ward_number: string
}

export default function DepartmentProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditableFields>({
    name: '',
    phone: '',
    address: '',
    district: '',
    taluka: '',
    ward_number: ''
  })

  // Image states
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [departmentImage, setDepartmentImage] = useState<string | null>(null)
  const [performanceImage, setPerformanceImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Fetch user profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/api/department/user-profile/')
      
      if (response.data) {
        setProfile(response.data)
        setEditForm({
          name: response.data.name || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          district: response.data.district || '',
          taluka: response.data.taluka || '',
          ward_number: response.data.ward_number || ''
        })
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.response?.data?.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Handle profile update
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      const response = await api.put('/api/department/user-profile/', editForm)
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Refresh profile data
        await fetchProfile()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: keyof EditableFields, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Cancel editing
  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        district: profile.district || '',
        taluka: profile.taluka || '',
        ward_number: profile.ward_number || ''
      })
    }
    setIsEditing(false)
    setError(null)
  }

  // Handle image upload
  const handleImageUpload = async (imageType: string, file: File) => {
    try {
      setUploadingImage(imageType)
      
      const formData = new FormData()
      formData.append('image', file)
      formData.append('image_type', imageType)
      
      const response = await api.post('/api/department/upload-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.image_url) {
        switch (imageType) {
          case 'profile':
            setProfileImage(response.data.image_url)
            break
          case 'department':
            setDepartmentImage(response.data.image_url)
            break
          case 'performance':
            setPerformanceImage(response.data.image_url)
            break
        }
      }
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError('Failed to upload image')
    } finally {
      setUploadingImage(null)
    }
  }

  // Handle image change
  const handleImageChange = (imageType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageUpload(imageType, file)
    }
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'Department-User':
        return 'Department Officer'
      case 'Admin-User':
        return 'System Administrator'
      case 'Civic-User':
        return 'Civic User'
      default:
        return role
    }
  }

  // Get status color
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200'
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-sidebar-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.department?.name
                    ? `${profile.department.name} Department — Profile`
                    : 'Department Profile'}
                </h1>
                <p className="text-sm text-gray-600">Manage your professional information</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-sidebar-primary" />
                  Personal Information
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="text-gray-900">{profile.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">{profile.phone || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <p className="text-gray-900">{profile.address || 'Not specified'}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.district || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.taluka}
                        onChange={(e) => handleInputChange('taluka', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.taluka || 'Not specified'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.ward_number}
                        onChange={(e) => handleInputChange('ward_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.ward_number || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture Card — first */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-sidebar-primary" />
                  Profile Picture
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-sidebar-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span>{profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : profile.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <input
                      type="file"
                      id="profile-image-input"
                      accept="image/*"
                      onChange={(e) => handleImageChange('profile', e)}
                      className="hidden"
                    />
                    <button 
                      onClick={() => document.getElementById('profile-image-input')?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-sidebar-primary text-white rounded-full flex items-center justify-center hover:bg-sidebar-primary/90 transition-colors shadow-lg"
                      title="Change Profile Picture"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Click camera icon to change</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Info Card — second */}
            {profile.department && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-sidebar-primary" />
                    Department
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department Name</p>
                    <p className="text-base font-semibold text-gray-900">
                      {profile.department.name} Department
                    </p>
                  </div>
                  {profile.department.description && (
                    <p className="text-sm text-gray-600">{profile.department.description}</p>
                  )}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {profile.department.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{profile.department.contact_email}</span>
                      </div>
                    )}
                    {profile.department.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{profile.department.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sidebar-primary" />
                  Account Status
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(profile.is_active)}`}>
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(profile.is_active)}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {profile.joined_date || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Clock className="w-4 h-4" />
                    <span>Last Login: {profile.last_login || 'Never'}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Security Settings Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-sidebar-primary" />
                  Security Settings
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Verification</p>
                        <p className="text-xs text-gray-500">Verified</p>
                      </div>
                    </div>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Login Alerts</p>
                        <p className="text-xs text-gray-500">Enabled</p>
                      </div>
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-700">Configure</button>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors text-sm font-medium" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
