'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MoreVertical, Edit, Eye, UserPlus, Shield, AlertCircle, Users, TrendingUp, Activity, RefreshCw, Trash2, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api, { apiGet } from '@/lib/api'
import StatsCard from '@/components/ui/stats-card'

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  date_joined: string
  last_login?: string
  complaint_count?: number
}

interface RoleData {
  name: string
  value: number
  color: string
}

interface MonthlyData {
  month: string
  users: number
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Year selector for monthly registrations
  const CURRENT_YEAR = new Date().getFullYear()
  const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)
  const [regYear, setRegYear] = useState(CURRENT_YEAR)
  const [regYearOpen, setRegYearOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'Civic-User',
    password: ''
  })
  const router = useRouter()

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalComplaints: 0,
    roleDistribution: [] as RoleData[],
    monthlyRegistrations: [] as MonthlyData[]
  })

  useEffect(() => {
    processAnalytics()
  }, [])

  /** Prefer backend aggregation (12 months, matches DB); fallback to client if API fails. */
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const fromApi = await fetchMonthlyRegistrationsFromApi(regYear)
      if (cancelled) return
      setAnalyticsData((prev) => ({
        ...prev,
        monthlyRegistrations:
          fromApi ?? (users.length > 0 ? calculateMonthlyFromUsers(users, regYear) : MONTH_ABBR.map((m) => ({ month: m, users: 0 }))),
      }))
    }
    run()
    return () => {
      cancelled = true
    }
  }, [regYear, users])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  async function fetchMonthlyRegistrationsFromApi(year: number): Promise<MonthlyData[] | null> {
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`${API_BASE}/api/user-registrations/monthly/?year=${year}`, { headers })
      if (!response.ok) return null
      const responseData = await response.json()

      if (Array.isArray(responseData.monthly_users) && responseData.monthly_users.length === 12) {
        return MONTH_ABBR.map((month, i) => ({
          month,
          users: Number(responseData.monthly_users[i] ?? 0),
        }))
      }

      if (responseData.monthly_data && typeof responseData.monthly_data === 'object') {
        const full = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ]
        return MONTH_ABBR.map((abbr, i) => ({
          month: abbr,
          users: Number(responseData.monthly_data[full[i]] ?? 0),
        }))
      }
    } catch (error) {
      console.error('Error fetching monthly registrations:', error)
    }
    return null
  }

  const processAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Fetch user statistics from the new endpoint
      const statsResponse = await fetch(`${API_BASE}/api/admin-user-stats/`, { headers })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('User stats data:', statsData)
      } else {
        console.error('Failed to fetch user stats:', statsResponse.status)
      }

      // Still fetch users for the table and monthly calculations
      const response = await fetch(`${API_BASE}/api/users/`, { headers })
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Raw response data:', responseData)
        
        // Handle different response formats
        let users = []
        if (responseData.results) {
          users = responseData.results
        } else if (responseData.data) {
          users = responseData.data
        } else if (Array.isArray(responseData)) {
          users = responseData
        } else {
          users = []
        }
        
        // Add missing fields with defaults
        const processedUsers = users.map((user: any) => ({
          id: user.id || 0,
          username: user.username || user.email || '',
          email: user.email || '',
          first_name: user.first_name || user.first_name || '',
          last_name: user.last_name || user.last_name || '',
          role: user.role || 'user',
          is_active: user.is_active !== undefined ? user.is_active : true,
          date_joined: user.date_joined || user.created_at || new Date().toISOString(),
          last_login: user.last_login,
          complaint_count: user.complaint_count || 0
        }))
        
        console.log('Processed users:', processedUsers)
        setUsers(processedUsers)

        const monthlyFromApi = await fetchMonthlyRegistrationsFromApi(regYear)
        const monthlyRegistrations =
          monthlyFromApi ??
          calculateMonthlyFromUsers(processedUsers, regYear)

        const roleDist = calculateRoleDistribution(processedUsers)
        setAnalyticsData({
          totalUsers: processedUsers.length,
          activeUsers: processedUsers.filter((u: User) => u.is_active).length,
          inactiveUsers: processedUsers.filter((u: User) => !u.is_active).length,
          totalComplaints: processedUsers.reduce((sum: number, u: User) => sum + (u.complaint_count || 0), 0),
          roleDistribution: roleDist,
          monthlyRegistrations,
        })
      } else {
        console.error('Failed to fetch users:', response.status)
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      setUsers([])
      setAnalyticsData({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalComplaints: 0,
        roleDistribution: [],
        monthlyRegistrations: []
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyFromUsers = (userList: User[], year: number) => {
    const monthlyCounts: Record<string, number> = {}
    MONTH_ABBR.forEach((month) => {
      monthlyCounts[month] = 0
    })
    userList.forEach((user) => {
      if (user.date_joined) {
        try {
          const joinDate = new Date(user.date_joined)
          if (!isNaN(joinDate.getTime()) && joinDate.getFullYear() === year) {
            const monthName = joinDate.toLocaleString('en-US', { month: 'short' })
            if (Object.prototype.hasOwnProperty.call(monthlyCounts, monthName)) {
              monthlyCounts[monthName]++
            }
          }
        } catch {}
      }
    })
    return MONTH_ABBR.map((month) => ({ month, users: monthlyCounts[month] ?? 0 }))
  }

  const calculateRoleDistribution = (users: User[]) => {
    // Calculate role distribution from users
    const roleCounts: Record<string, number> = {}
    
    users.forEach((user: User) => {
      const role = user.role || 'Unknown'
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })
    
    return Object.entries(roleCounts).map(([name, value]) => ({
      name: name.replace('-', ' '),
      value,
      color: name === 'Admin-User' ? '#ef4444' : name === 'Civic-User' ? '#8b5cf6' : name === 'Department-User' ? '#10b981' : '#6b7280'
    }))
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Normalize role filter to accept backend role variants like 'Admin-User', 'Civic-User', 'Department-User'
    const roleMap: Record<string, string[]> = {
      admin: ['admin-user', 'admin'],
      officer: ['officer'],
      user: ['civic-user', 'user'],
      department: ['department-user'],
    }

    const matchesRole = (() => {
      if (roleFilter === 'all') return true
      const userRole = (user.role || '').toString().toLowerCase()
      const mapped = roleMap[roleFilter] || [roleFilter]
      return mapped.some(r => userRole.includes(r))
    })()
    const matchesStatus = statusFilter === 'all' || 
                        (statusFilter === 'active' && user.is_active) ||
                        (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/api/users/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        const responseData = await response.json()
        const createdUser = responseData.data || responseData
        
        // Add the new user to the list
        setUsers([...users, createdUser])
        setShowCreateModal(false)
        setNewUser({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          role: 'Civic-User',
          password: ''
        })
        
        // Refresh analytics to show updated counts
        processAnalytics()
        
        // Show success message
        alert('User created successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to create user:', errorData)
        alert(`Failed to create user: ${errorData.error || errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user. Please try again.')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}/`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        // Remove the deleted user from the list
        setUsers(users.filter(user => user.id !== userId))
        alert('User deleted successfully!')
      } else {
        let errorMessage = 'Failed to delete user'
        try {
          const errorData = await response.json()
          console.error('Failed to delete user:', errorData)
          
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (Object.keys(errorData).length > 0) {
            errorMessage = JSON.stringify(errorData)
          }
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        
        alert(`Failed to delete user: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && token !== 'undefined' && token !== 'null') headers['Authorization'] = `Bearer ${token}`

      // Only send role â€” all other fields are frozen
      const response = await fetch(`${API_BASE}/api/users/${editingUser.id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: editingUser.role })
      })

      if (response.ok) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: editingUser.role } : u))
        setShowEditModal(false)
        setEditingUser(null)
        alert('User role updated successfully!')
      } else {
        const err = await response.json().catch(() => ({}))
        alert(`Failed to update: ${err.error || err.message || response.statusText}`)
      }
    } catch (error) {
      alert('Error updating user. Please try again.')
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'officer':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getRoleProfileColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-500 text-white'
      case 'officer':
        return 'bg-blue-500 text-white'
      case 'department-user':
        return 'bg-green-500 text-white'
      case 'user':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-yellow-500 text-white'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage system users and permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={processAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={analyticsData.totalUsers}
          icon={<Users className="w-6 h-6" />}
          borderColor="border-t-[#1e40af]"
        />
        
        <StatsCard
          title="Active Users"
          value={analyticsData.activeUsers}
          icon={<Activity className="w-6 h-6" />}
          color="text-green-600"
          bgColor="bg-green-100"
          borderColor="border-t-[#f59e0b]"
        />
        
        <StatsCard
          title="Inactive Users"
          value={analyticsData.inactiveUsers}
          icon={<AlertCircle className="w-6 h-6" />}
          color="text-sidebar-primary"
          bgColor="bg-sidebar-primary/10"
          borderColor="border-t-[#1e40af]"
        />
        
        <StatsCard
          title="Total Complaints"
          value={analyticsData.totalComplaints}
          icon={<TrendingUp className="w-6 h-6" />}
          color="text-green-600"
          bgColor="bg-green-100"
          borderColor="border-t-[#16a34a]"
        />
      </div>

      {/* Charts Section â€” Monthly Registrations, 2/3 width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly User Registrations</h3>
              <p className="text-sm text-gray-500">New registrations per month in {regYear}</p>
            </div>
            {/* Year dropdown */}
            <div className="relative">
              <button
                onClick={() => setRegYearOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {regYear}
                <ChevronDown className={`w-4 h-4 transition-transform ${regYearOpen ? 'rotate-180' : ''}`} />
              </button>
              {regYearOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {YEAR_OPTIONS.map(y => (
                    <button
                      key={y}
                      onClick={() => { setRegYear(y); setRegYearOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        regYear === y ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {analyticsData.monthlyRegistrations && analyticsData.monthlyRegistrations.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={analyticsData.monthlyRegistrations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} formatter={(v: any) => [`${v} users`, 'Registrations']} />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} fill="url(#regGrad)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No registrations in {regYear}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
              <option value="department">Department</option>
              <option value="user">Civic User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complaints</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getRoleProfileColor(user.role)}`}>
                          <span className="text-xs font-medium">
                            {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.complaint_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user)
                            setShowEditModal(true)
                          }}
                          className="text-sidebar-primary hover:text-sidebar-primary/900"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-sidebar-primary text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Civic-User">Civic User</option>
                  <option value="Department-User">Department User</option>
                  <option value="Admin-User">Admin User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal â€” only Role is editable */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Edit User</h2>
            <p className="text-sm text-gray-500 mb-4">Only the Role field can be changed.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                <input type="text" value={editingUser.username} disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <input type="email" value={editingUser.email} disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                  <input type="text" value={editingUser.first_name} disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                  <input type="text" value={editingUser.last_name} disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-xs text-blue-600 font-normal ml-1">(editable)</span>
                </label>
                <select value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                  <option value="Civic-User">Civic User</option>
                  <option value="Department-User">Department User</option>
                  <option value="Officer">Officer</option>
                  <option value="Admin-User">Admin User</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button onClick={handleUpdateUser}
                className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90">
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

