'use client'

import { useState, useEffect } from 'react'
import { 
  Layout, 
  FileText, 
  Users, 
  UserCheck, 
  Folder, 
  Settings, 
  Home,
  RefreshCw,
  TrendingUp,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

interface Complaint {
  id: string
  title: string
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected'
  location: string
  priority: 'Low' | 'Medium' | 'High'
  date: string
}

interface AnalyticsData {
  name: string
  value: number
  color: string
}

interface CategoryData {
  name: string
  complaints: number
}

export default function ModernDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'complaints', label: 'All Complaints', icon: FileText },
    { id: 'officers', label: 'Officers', icon: UserCheck },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const statusColors = {
    'Pending': '#f59e0b',
    'In Progress': '#8b5cf6',
    'Resolved': '#16a34a',
    'Rejected': '#ef4444'
  }

  const priorityColors = {
    'Low': '#16a34a',
    'Medium': '#f59e0b',
    'High': '#ef4444'
  }

  const analyticsColors = ['#3b82f6', '#16a34a', '#f59e0b', '#ef4444']
  const categoryColors = ['#3b82f6', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch recent complaints
      const token = localStorage.getItem('access_token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const [complaintsRes, statusRes, categoryRes] = await Promise.all([
        fetch(`${API_BASE}/api/getcomplaint/`, { headers }),
        fetch(`${API_BASE}/api/admindashboardcard/`, { headers }),
        fetch(`${API_BASE}/api/categories/`, { headers })
      ])

      // Handle recent complaints
      if (complaintsRes.ok) {
        const complaints = await complaintsRes.json()
        setRecentComplaints(Array.isArray(complaints) ? complaints.slice(0, 5) : getFallbackComplaints())
      } else {
        setRecentComplaints(getFallbackComplaints())
      }

      // Handle analytics data
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setAnalyticsData([
          { name: 'Pending', value: statusData.Pending_comp || 0, color: statusColors['Pending'] },
          { name: 'In Progress', value: statusData.inprogress_comp || 0, color: statusColors['In Progress'] },
          { name: 'Resolved', value: statusData.resolved_comp || 0, color: statusColors['Resolved'] },
          { name: 'Rejected', value: 0, color: statusColors['Rejected'] }
        ])
      } else {
        setAnalyticsData(getFallbackAnalytics())
      }

      // Handle category data
      if (categoryRes.ok) {
        const categories = await categoryRes.json()
        setCategoryData(
          Array.isArray(categories) 
            ? categories.slice(0, 6).map((cat, i) => ({
                name: cat.name || `Category ${i + 1}`,
                complaints: cat.total_comp || 0
              }))
            : getFallbackCategories()
        )
      } else {
        setCategoryData(getFallbackCategories())
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data
      setRecentComplaints(getFallbackComplaints())
      setAnalyticsData(getFallbackAnalytics())
      setCategoryData(getFallbackCategories())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackComplaints = (): Complaint[] => [
    { id: 'CMP-001', title: 'Pothole on Main Street', status: 'Pending', location: 'Ahmedabad', priority: 'High', date: '2024-03-18' },
    { id: 'CMP-002', title: 'Water Leakage Issue', status: 'In Progress', location: 'Surat', priority: 'Medium', date: '2024-03-18' },
    { id: 'CMP-003', title: 'Street Light Not Working', status: 'Resolved', location: 'Vadodara', priority: 'Low', date: '2024-03-17' },
    { id: 'CMP-004', title: 'Garbage Collection Delay', status: 'Pending', location: 'Rajkot', priority: 'Medium', date: '2024-03-17' },
    { id: 'CMP-005', title: 'Drainage Blockage', status: 'Resolved', location: 'Gandhinagar', priority: 'High', date: '2024-03-16' }
  ]

  const getFallbackAnalytics = (): AnalyticsData[] => [
    { name: 'Pending', value: 45, color: statusColors['Pending'] },
    { name: 'In Progress', value: 28, color: statusColors['In Progress'] },
    { name: 'Resolved', value: 89, color: statusColors['Resolved'] },
    { name: 'Rejected', value: 8, color: statusColors['Rejected'] }
  ]

  const getFallbackCategories = (): CategoryData[] => [
    { name: 'Roads & Infrastructure', complaints: 35 },
    { name: 'Water Supply', complaints: 28 },
    { name: 'Sanitation', complaints: 22 },
    { name: 'Street Lighting', complaints: 18 },
    { name: 'Drainage', complaints: 15 },
    { name: 'Other', complaints: 12 }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />
      case 'In Progress': return <AlertCircle className="w-4 h-4" />
      case 'Resolved': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const totalComplaints = analyticsData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CivicTrack</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === item.id
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Layout className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-sm text-gray-500">Monitor and manage civic complaints</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-xs font-medium text-gray-700">{new Date().toLocaleTimeString()}</p>
              </div>
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Row 1: Recent Complaints (70%) + Analytics (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Recent Complaints - 70% */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Complaints</h3>
                  <p className="text-sm text-gray-500">Latest submitted civic complaints</p>
                </div>
                
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-mono font-semibold text-blue-600">#{complaint.id}</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border`}
                              style={{
                                backgroundColor: `${statusColors[complaint.status]}20`,
                                color: statusColors[complaint.status],
                                borderColor: statusColors[complaint.status]
                              }}
                            >
                              {getStatusIcon(complaint.status)}
                              {complaint.status}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
                              style={{
                                backgroundColor: `${priorityColors[complaint.priority]}20`,
                                color: priorityColors[complaint.priority]
                              }}
                            >
                              {complaint.priority} Priority
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{complaint.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {complaint.location}
                            </div>
                            <span>{complaint.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Complaint Analytics - 30% */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Complaint Analytics</h3>
                  <p className="text-sm text-gray-500">Status distribution</p>
                </div>
                
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analyticsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {analyticsData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                        <p className="text-xs text-gray-500">
                          {totalComplaints > 0 ? Math.round((item.value / totalComplaints) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Categories Chart + Overview Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaints by Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Complaints by Category</h3>
                <p className="text-sm text-gray-500">Distribution across complaint types</p>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar 
                      dataKey="complaints" 
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Overview Statistics</h3>
                <p className="text-sm text-gray-500">Key performance metrics</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{totalComplaints}</p>
                  <p className="text-sm text-blue-700">Total Complaints</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {analyticsData.find(d => d.name === 'Resolved')?.value || 0}
                  </p>
                  <p className="text-sm text-green-700">Resolved</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {analyticsData.find(d => d.name === 'Pending')?.value || 0}
                  </p>
                  <p className="text-sm text-orange-700">Pending</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {analyticsData.find(d => d.name === 'In Progress')?.value || 0}
                  </p>
                  <p className="text-sm text-purple-700">In Progress</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

