"use client"

import { useState, useEffect } from "react"
import {
  User, Lock, Shield, Globe, Bell, Database, Users, Building,
  Save, Eye, EyeOff, ChevronRight, LayoutDashboard, Settings, Mail, 
  Phone, Camera, AlertTriangle, CheckCircle, Trash2, Edit, Plus,
  Activity, FileText, MapPin, Calendar, Clock, Search, Filter,
  Download, Upload, RefreshCw, X, Check, AlertCircle
} from "lucide-react"
import ChangePasswordModal from '@/components/profile/change-password-modal'

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "query", label: "Query", icon: FileText },
]

const filteredLogs: any[] = []
function handleBackup(_type: string) {}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Query State
  const [queries, setQueries] = useState<any[]>([])
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryError, setQueryError] = useState("")

  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    avatar: ""
  })

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: "",
    siteDescription: "",
    maintenanceMode: false,
    allowRegistration: false,
    emailNotifications: true,
    smsNotifications: false,
    defaultLanguage: "en",
    timezone: "Asia/Kolkata",
    maxFileSize: 10,
    sessionTimeout: 30
  })

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailComplaints: true,
    emailResolutions: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
    criticalAlerts: true
  })

  // Log filter state
  const [logFilter, setLogFilter] = useState("all")

  // Fetch initial data
  useEffect(() => {
    fetchProfileData()
    fetchSystemSettings()
    fetchNotifications()
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    try {
      setQueryLoading(true)
      setQueryError("")
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/contact/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setQueries(result.results || [])
        } else {
          setQueryError(result.error || "Failed to fetch queries")
        }
      } else {
        setQueryError("Failed to fetch queries")
      }
    } catch (err) {
      setQueryError("Network error while fetching queries")
    } finally {
      setQueryLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/admin/notification-settings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setNotifications(prev => ({
            ...prev,
            ...result.data
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/admin/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const data = result.data
          setProfile({
            name: data.name || "Admin User",
            email: data.email || "admin@civic.gov.in",
            phone: data.phone || "+91 98765 00000",
            role: data.role || "Super Admin",
            department: data.department || "System Administration",
            avatar: data.avatar || ""
          })
        }
      } else {
        // Set fallback data for demo
        setProfile({
          name: "Admin User",
          email: "admin@civic.gov.in",
          phone: "+91 98765 00000",
          role: "Super Admin",
          department: "System Administration",
          avatar: ""
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Set fallback data
      setProfile({
        name: "Admin User",
        email: "admin@civic.gov.in",
        phone: "+91 98765 00000",
        role: "Super Admin",
        department: "System Administration",
        avatar: ""
      })
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/admin/system-settings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const d = result.data
          setSystemSettings((prev) => ({
            ...prev,
            siteName: d.siteName ?? prev.siteName,
            siteDescription: d.siteDescription ?? prev.siteDescription,
            maintenanceMode: d.maintenanceMode ?? prev.maintenanceMode,
            allowRegistration: d.allowRegistration ?? prev.allowRegistration,
            emailNotifications: d.emailNotifications ?? prev.emailNotifications,
            smsNotifications: d.smsNotifications ?? prev.smsNotifications,
            defaultLanguage: d.defaultLanguage ?? prev.defaultLanguage,
            timezone: d.timezone ?? prev.timezone,
            maxFileSize: d.maxFileSize ?? prev.maxFileSize,
            sessionTimeout: d.sessionTimeout ?? prev.sessionTimeout,
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
    }
  }

  // The following helper fetches (users/departments/logs) referenced non-existent admin APIs.
  // They have been removed to keep this page fully functional with existing backend endpoints only.

  const handleSave = async (section: string = "all") => {
    setLoading(true)
    setError("")
    setSuccess("")
    
    try {
      const token = localStorage.getItem('access_token')
      
      if (section === "profile" || section === "all") {
        const profileResponse = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/admin/update-profile/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: profile.name.split(' ')[0] || '',
            last_name: profile.name.split(' ').slice(1).join(' ') || '',
            email: profile.email,
            phone: profile.phone
          })
        })
        
        if (profileResponse.ok) {
          const result = await profileResponse.json()
          if (result.success) {
            setSuccess("Profile updated successfully!")
          } else {
            setError(result.error || "Failed to update profile")
          }
        } else {
          setError("Failed to update profile")
        }
      }
      
      if (section === "system" || section === "all") {
        const systemResponse = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/admin/system-settings/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(systemSettings)
        })
        
        if (systemResponse.ok) {
          const result = await systemResponse.json()
          if (result.success) {
            setSuccess("System settings updated successfully!")
          } else {
            setError(result.error || "Failed to update system settings")
          }
        } else {
          setError("Failed to update system settings")
        }
      }

      if (section === "notifications" || section === "all") {
        const notificationsResponse = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/admin/notification-settings/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(notifications)
        })
        
        if (notificationsResponse.ok) {
          const result = await notificationsResponse.json()
          if (result.success) {
            setSuccess("Notification preferences updated successfully!")
          } else {
            setError(result.error || "Failed to update notification preferences")
          }
        } else {
          setError("Failed to update notification preferences")
        }
      }
      
    } catch (error) {
      console.error('Error saving:', error)
      setError("An error occurred while saving")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuery = async (queryId: number) => {
    if (!confirm('Delete this query?')) return
    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(
        `${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/contact/?id=${queryId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      )
      if (res.ok) {
        setQueries(prev => (prev as any[]).filter((q: any) => q.id !== queryId))
      } else {
        alert('Failed to delete query')
      }
    } catch {
      alert('Error deleting query')
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1e40af] font-medium flex items-center gap-1.5">
          <Settings className="w-4 h-4" />
          Settings
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system configuration and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-4 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-[#1e40af] border-[#1e40af]"
                      : "text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
              <h2 className="text-base font-semibold text-slate-800 mb-1 pb-3 border-b border-[#e2e8f0]">Security Settings</h2>
              <div className="mt-4 flex items-center justify-between p-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-[#1e40af]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Change Password</p>
                    <p className="text-xs text-slate-500">Update your admin account password</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a] transition-colors"
                >
                  Change Password
                </button>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#1e40af] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1e40af]">Security Tip</p>
                  <p className="text-xs text-slate-600 mt-0.5">Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.</p>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <>
              <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-[#e2e8f0]">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1e40af] to-[hsl(var(--sidebar-primary))] flex items-center justify-center text-white font-bold text-2xl">
                      {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "AD"}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1e40af] rounded-full flex items-center justify-center border-2 border-white hover:bg-[#1e3a8a] transition-colors">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-800">{profile.name}</p>
                    <p className="text-sm text-slate-500">{profile.role}</p>
                    <button className="text-sm text-[#1e40af] hover:underline mt-1">Change photo</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-[#f8fafc]">
                      <User className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="bg-transparent text-sm outline-none w-full text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Email Address</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-[#f8fafc]">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="bg-transparent text-sm outline-none w-full text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone Number</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-[#f8fafc]">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="bg-transparent text-sm outline-none w-full text-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Department</label>
                    <div className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-3 py-2.5 bg-[#f8fafc]">
                      <Building className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        className="bg-transparent text-sm outline-none w-full text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button 
                  onClick={() => handleSave("profile")}
                  disabled={loading}
                  className="px-6 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>

              {/* Role Badge */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#1e40af]" />
                <div>
                  <p className="text-sm font-semibold text-[#1e40af]">Role: {profile.role}</p>
                  <p className="text-xs text-slate-500">You have full access to all admin features</p>
                </div>
              </div>
            </>
          )}

          {/* QUERY TAB */}
          {activeTab === "query" && (
            <>
              <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e2e8f0]">
                  <h2 className="text-base font-semibold text-slate-800">User & Department Queries</h2>
                  <button 
                    onClick={fetchQueries}
                    disabled={queryLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium rounded-lg hover:bg-sidebar-primary/90 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${queryLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {queryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-sidebar-primary animate-spin mr-2" />
                    <span className="text-sm text-slate-600">Loading queries...</span>
                  </div>
                ) : queryError ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                      <p className="text-sm text-red-600 mb-2">{queryError}</p>
                      <button 
                        onClick={fetchQueries}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : queries.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No queries found</p>
                      <p className="text-xs text-slate-400 mt-1">Queries from users and departments will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queries.map((query: any, index: number) => (
                      <div key={query.id || index} className="border border-[#e2e8f0] rounded-lg p-4 bg-[#f8fafc] hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                query.subject === 'general' ? 'bg-blue-100 text-blue-700' :
                                query.subject === 'complaint' ? 'bg-red-100 text-red-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {query.subject?.charAt(0).toUpperCase() + query.subject?.slice(1) || 'General'}
                              </span>
                              <span className="text-xs text-slate-500">
                                Query #{query.id || index + 1}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-1">{query.full_name}</h3>
                            <p className="text-xs text-slate-600 mb-2">{query.email}</p>
                            <p className="text-sm text-slate-700 mb-3 leading-relaxed">{query.message}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date().toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{query.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Reply">
                              <Mail className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"
                              onClick={() => handleDeleteQuery(query.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* SYSTEM SETTINGS TAB */}
          {activeTab === "system" && (
            <>
              <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-[#e2e8f0]">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Site Name</label>
                    <input
                      type="text"
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Site Description</label>
                    <textarea
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings({ ...systemSettings, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Default Language</label>
                      <select
                        value={systemSettings.defaultLanguage}
                        onChange={(e) => setSystemSettings({ ...systemSettings, defaultLanguage: e.target.value })}
                        className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="gu">Gujarati</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Timezone</label>
                      <select
                        value={systemSettings.timezone}
                        onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="Asia/Dubai">Asia/Dubai</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-[#e2e8f0]">System Configuration</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Maintenance Mode</p>
                      <p className="text-xs text-slate-500">Temporarily disable the system for maintenance</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, maintenanceMode: !systemSettings.maintenanceMode })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Allow User Registration</p>
                      <p className="text-xs text-slate-500">Let new users register on the platform</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, allowRegistration: !systemSettings.allowRegistration })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.allowRegistration ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Email Notifications</p>
                      <p className="text-xs text-slate-500">Send email notifications for system events</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, emailNotifications: !systemSettings.emailNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.emailNotifications ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">SMS Notifications</p>
                      <p className="text-xs text-slate-500">Send SMS notifications for critical events</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, smsNotifications: !systemSettings.smsNotifications })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        systemSettings.smsNotifications ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          systemSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Max File Size (MB)</label>
                      <input
                        type="number"
                        value={systemSettings.maxFileSize}
                        onChange={(e) => setSystemSettings({ ...systemSettings, maxFileSize: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1.5">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings({ ...systemSettings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

   
          {/* SAVE BUTTON for system tab */}
          {activeTab === "system" && (
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("system")}
                disabled={loading}
                className="px-6 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save Settings</>
                )}
              </button>
            </div>
          )}

          {/* ACTIVITY LOGS TAB */}
          {activeTab === "logs" && (
            <>
              <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-800">Activity Logs</h2>
                  <div className="flex items-center gap-3">
                    <select
                      value={logFilter}
                      onChange={(e) => setLogFilter(e.target.value)}
                      className="px-3 py-2 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-sm text-slate-700"
                    >
                      <option value="all">All Logs</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </select>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a] transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{log.user}</p>
                          <p className="text-xs text-slate-500">{log.action}</p>
                          <p className="text-xs text-slate-400">{log.ip} Â· {new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* BACKUP & RESTORE TAB */}
          {activeTab === "backup" && (
            <>
              <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-4 pb-3 border-b border-[#e2e8f0]">Backup & Restore</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-800 mb-3">Create Backup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleBackup('database')}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        <Database className="w-4 h-4" />
                        {loading ? 'Creating...' : 'Database Backup'}
                      </button>
                      <button
                        onClick={() => handleBackup('files')}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4" />
                        {loading ? 'Creating...' : 'Files Backup'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-800 mb-3">Restore Backup</h3>
                    <div className="border-2 border-dashed border-[#e2e8f0] rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-2">Upload backup file to restore</p>
                      <button className="px-4 py-2 bg-[#1e40af] text-white text-sm font-medium rounded-lg hover:bg-[#1e3a8a] transition-colors">
                        Choose File
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-800 mb-3">Recent Backups</h3>
                    <div className="space-y-2">
                      {[
                        { name: 'database-backup-2024-03-19.sql', size: '2.5 MB', date: '2024-03-19 10:30 AM', type: 'database' },
                        { name: 'files-backup-2024-03-18.zip', size: '15.2 MB', date: '2024-03-18 09:15 AM', type: 'files' },
                        { name: 'database-backup-2024-03-17.sql', size: '2.4 MB', date: '2024-03-17 08:45 AM', type: 'database' },
                      ].map((backup, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                          <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{backup.name}</p>
                              <p className="text-xs text-slate-500">{backup.size} Â· {backup.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-slate-100 rounded">
                              <Download className="w-4 h-4 text-slate-400" />
                            </button>
                            <button className="p-1 hover:bg-slate-100 rounded">
                              <RefreshCw className="w-4 h-4 text-slate-400" />
                            </button>
                            <button className="p-1 hover:bg-slate-100 rounded">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  )
}

