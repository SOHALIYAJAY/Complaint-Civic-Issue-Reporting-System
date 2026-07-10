"use client"

import React, { useState, useEffect } from 'react'
import { Users, Activity, AlertCircle, TrendingUp, Search, Edit, Trash2, Shield, RefreshCw } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
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

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalComplaints: number
  monthlyRegistrations: Array<{month: string, users: number}>
  roleDistribution: RoleData[]
}

export default function DepartmentUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState<string | 'rolling'>('rolling')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    password: ''
  })
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalComplaints: 0,
    monthlyRegistrations: [],
    roleDistribution: []
  })

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  // Calculate monthly registrations from users.
  // If `year` === 'rolling' => last 12 months (oldest -> newest).
  // If `year` is a numeric string like '2020' => Jan..Dec for that year.
  const calculateMonthlyFromUsers = (users: User[], year: string | 'rolling' = 'rolling') => {
    const now = new Date()
    const currentYear = now.getFullYear()

    if (year === 'rolling') {
      const months: { month: number; year: number; label: string }[] = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthShort = d.toLocaleString('default', { month: 'short' })
        const y = d.getFullYear()
        const label = y === currentYear ? monthShort : `${monthShort} ${y}`
        months.push({ month: d.getMonth(), year: y, label })
      }

      return months.map(m => {
        const monthUsers = users.filter((user: User) => {
          const userDate = new Date(user.date_joined)
          return userDate.getFullYear() === m.year && userDate.getMonth() === m.month
        })

        return { month: m.label, users: monthUsers.length }
      })
    }

    // Specific calendar year
    const parsedYear = parseInt(year, 10)
    const months = Array.from({ length: 12 }).map((_, idx) => {
      const d = new Date(parsedYear, idx, 1)
      const monthShort = d.toLocaleString('default', { month: 'short' })
      const label = parsedYear === currentYear ? monthShort : `${monthShort}`
      return { month: idx, year: parsedYear, label }
    })

    return months.map(m => {
      const monthUsers = users.filter((user: User) => {
        const userDate = new Date(user.date_joined)
        return userDate.getFullYear() === m.year && userDate.getMonth() === m.month
      })
      return { month: m.label, users: monthUsers.length }
    })
  }

  // Fetch monthly registrations from API
  const fetchMonthlyRegistrations = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/api/user-registrations/monthly/`, { headers })
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Monthly registrations data:', responseData)
        
        // Handle different response formats
        let monthlyData = []
        if (Array.isArray(responseData)) {
          monthlyData = responseData
        } else if (responseData.data && Array.isArray(responseData.data)) {
          monthlyData = responseData.data
        } else if (responseData.monthly_data && Array.isArray(responseData.monthly_data)) {
          monthlyData = responseData.monthly_data
        }
        
        // Transform data if needed
        return monthlyData.map((item: any) => ({
          month: item.month || item.name || 'Unknown',
          users: item.users || item.count || item.value || 0
        }))
      }
    } catch (error) {
      console.error('Error fetching monthly registrations:', error)
      return null
    }
    return null
  }

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/api/users/`, {
        method: 'GET',
        headers
      })

      let processedUsers: User[] = []
      
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
        
        // Add missing fields with defaults and filter out admin users
        processedUsers = users.map((user: any) => ({
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
        })).filter((user: any) => {
          // Filter out admin users - only show Civic Users and Department Users
          const userRole = user.role?.toLowerCase() || ''
          return !userRole.includes('admin') && !userRole.includes('administrator')
        })
        
        console.log('Processed users (filtered):', processedUsers)
        // Debug: show minimal join-date info for tracing
        console.log('Processed users dates:', processedUsers.map(u => ({ id: u.id, date_joined: u.date_joined, role: u.role })))
        setUsers(processedUsers)

        // Calculate analytics
        const totalUsers = processedUsers.length
        const activeUsers = processedUsers.filter((u: User) => u.is_active).length
        const inactiveUsers = totalUsers - activeUsers
        const totalComplaints = processedUsers.reduce((sum: number, u: User) => sum + (u.complaint_count || 0), 0)

        // Role distribution
        const calculateRoleDistribution = (users: User[]): RoleData[] => {
          const roleCounts = users.reduce((acc: Record<string, number>, user: User) => {
            const role = user.role || 'User'
            acc[role] = (acc[role] || 0) + 1
            return acc
          }, {})

          return Object.entries(roleCounts).map(([name, value]) => ({
            name,
            value: Number(value),
            color: name === 'Admin' ? '#8b5cf6' : name === 'Department-User' ? '#3b82f6' : '#10b981'
          }))
        }

        const roleDistribution = calculateRoleDistribution(processedUsers)

        // Calculate monthly registrations from the processed users (DB source)
        // processedUsers already excludes admin/administrator roles above,
        // so this ensures Admin users are not counted in the chart.
        const monthlyRegistrations = calculateMonthlyFromUsers(processedUsers, yearFilter)
        console.log('Computed monthlyRegistrations:', monthlyRegistrations)

        setAnalyticsData({
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalComplaints,
          roleDistribution,
          monthlyRegistrations
        })
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      // Set fallback data (excluding admin users)
      const fallbackUsers = [
        {
          id: 1,
          username: 'civic_user',
          email: 'civic@example.com',
          first_name: 'Civic',
          last_name: 'User',
          role: 'Civic User',
          is_active: true,
          date_joined: '2024-01-01',
          last_login: '2024-12-01',
          complaint_count: 5
        },
        {
          id: 2,
          username: 'dept_user',
          email: 'dept@example.com',
          first_name: 'Department',
          last_name: 'User',
          role: 'Department User',
          is_active: true,
          date_joined: '2024-01-01',
          last_login: '2024-12-01',
          complaint_count: 3
        }
      ]
      
      // Calculate analytics for fallback data
      const totalUsers = fallbackUsers.length
      const activeUsers = fallbackUsers.filter((u: User) => u.is_active).length
      const inactiveUsers = totalUsers - activeUsers
      const totalComplaints = fallbackUsers.reduce((sum: number, u: User) => sum + (u.complaint_count || 0), 0)

      // Role distribution
      const calculateRoleDistribution = (users: User[]): RoleData[] => {
        const roleCounts = users.reduce((acc: Record<string, number>, user: User) => {
          const role = user.role || 'User'
          acc[role] = (acc[role] || 0) + 1
          return acc
        }, {})

        return Object.entries(roleCounts).map(([name, value]) => ({
          name,
          value: Number(value),
          color: name === 'Admin' ? '#8b5cf6' : name === 'Department-User' ? '#3b82f6' : '#10b981'
        }))
      }

      const roleDistribution = calculateRoleDistribution(fallbackUsers)

      // Generate fallback monthly data
      const monthlyRegistrations = [
        { month: 'Jan', users: 2 },
        { month: 'Feb', users: 1 },
        { month: 'Mar', users: 3 },
        { month: 'Apr', users: 1 },
        { month: 'May', users: 2 },
        { month: 'Jun', users: 1 },
        { month: 'Jul', users: 0 },
        { month: 'Aug', users: 1 },
        { month: 'Sep', users: 2 },
        { month: 'Oct', users: 1 },
        { month: 'Nov', users: 3 },
        { month: 'Dec', users: 1 }
      ]

      setUsers(fallbackUsers)
      setAnalyticsData({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalComplaints,
        roleDistribution,
        monthlyRegistrations
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  // Recompute monthly registrations when users or yearFilter change
  useEffect(() => {
    setAnalyticsData(prev => ({
      ...prev,
      monthlyRegistrations: calculateMonthlyFromUsers(users, yearFilter)
    }))
  }, [users, yearFilter])

  const handleCreateUser = async () => {
    // Validate required fields
    if (!newUser.username?.trim()) {
      alert('Username is required')
      return
    }
    if (!newUser.email?.trim()) {
      alert('Email is required')
      return
    }
    if (!newUser.password?.trim()) {
      alert('Password is required')
      return
    }
    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      alert('Please enter a valid email address')
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

      const response = await fetch(`${API_BASE}/api/users/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        const responseData = await response.json()
        const createdUser = responseData.data || responseData
        
        // Add to new user to list with proper error handling
        if (createdUser && createdUser.id) {
          setUsers(prev => [...prev, createdUser])
        }
        
        setShowCreateModal(false)
        setNewUser({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          role: 'user',
          password: ''
        })
        
        // Show success message
        alert('User created successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to create user:', errorData)
        const errorMessage = errorData.message || errorData.error || errorData.email || errorData.username || 'Failed to create user. Please check console for details.'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Network error. Please check your connection and try again.')
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
        // Remove deleted user from list
        setUsers(users.filter(user => user.id !== userId))
        alert('User deleted successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to delete user:', errorData)
        alert('Failed to delete user. Please check console for details.')
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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}/api/users/${editingUser.id}/`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editingUser)
      })

      if (response.ok) {
        const responseData = await response.json()
        const updatedUser = responseData.data || responseData
        
        // Update user in list
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...updatedUser } : user
        ))
        setShowEditModal(false)
        setEditingUser(null)
        
        // Show success message
        alert('User updated successfully!')
      } else {
        const errorData = await response.json()
        console.error('Failed to update user:', errorData)
        alert('Failed to update user. Please check console for details.')
      }
    } catch (error) {
      console.error('Error updating user:', error)
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
      case 'civic user':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Normalize role filter to accept backend role variants like 'Admin-User', 'Civic-User', 'Department-User'
    const roleMap: Record<string, string[]> = {
      admin: ['admin', 'admin-user'],
      officer: ['officer', 'department-user'],
      'civic user': ['user', 'civic-user', 'civic user']
    }

    const matchesRole = (() => {
      if (roleFilter === 'all') return true
      const userRole = (user.role || '').toString().toLowerCase()
      const mapped = roleMap[roleFilter.toLowerCase()] || [roleFilter.toLowerCase()]
      return mapped.some(r => userRole.includes(r))
    })()
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)

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
              onClick={fetchUsers}
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
              <Users className="w-4 h-4" />
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
          title="Civic Users"
          value={analyticsData.inactiveUsers}
          icon={<AlertCircle className="w-6 h-6" />}
          color="text-blue-600"
          bgColor="bg-blue-100"
          borderColor="border-t-[#3b82f6]"
        />
        
        <StatsCard
          title="Department Users"
          value={analyticsData.totalComplaints}
          icon={<TrendingUp className="w-6 h-6" />}
          color="text-green-600"
          bgColor="bg-green-100"
          borderColor="border-t-[#16a34a]"
        />
      </div>

      {/* Charts Section: Bar and Pie side-by-side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registrations Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly User Registrations</h3>
              <p className="text-sm text-gray-500">New user registrations per month</p>
            </div>
            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white"
                aria-label="Select year for registrations"
              >
                <option value="rolling">Last 12 months</option>
                {(() => {
                  const start = 2020
                  const cur = new Date().getFullYear()
                  return Array.from({ length: cur - start + 1 }, (_, i) => start + i).map(y => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))
                })()}
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                />
                <Bar 
                  dataKey="users" 
                  fill="#2563eb" 
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
          <div className="mb-6 w-full">
            <h3 className="text-lg font-semibold text-gray-900">User Role Distribution</h3>
            <p className="text-sm text-gray-500">Distribution of users by role</p>
          </div>
          <div className="w-full flex justify-center">
            <div style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.roleDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={64}
                    innerRadius={28}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analyticsData.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${value} users`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-6 w-full">
            <div className="flex flex-col gap-2">
              {analyticsData.roleDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-700">{entry.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
              <option value="user">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
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
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
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
                          className="text-sidebar-primary hover:text-sidebar-primary/80"
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
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNumber
                            ? 'bg-sidebar-primary text-white border-sidebar-primary'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                >
                  <option value="user">User</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
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
                className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingUser.first_name}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.last_name}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                >
                  <option value="user">User</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

