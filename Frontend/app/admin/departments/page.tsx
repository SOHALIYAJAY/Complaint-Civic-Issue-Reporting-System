'use client'

import { useState, useEffect } from 'react'
import { Edit2, Trash2, Search, RefreshCw, Building2, Users, Mail, Phone, Calendar, User, AlertTriangle, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

interface Department {
  id: number
  name: string
  category: string
  description: string
  contact_email: string
  contact_phone: string
  head_officer_name?: string
  officer_count: number
  created_at: string
}

interface DepartmentStats {
  total_departments: number
  total_officers: number
  departments_with_head: number
  departments_without_head: number
  category_distribution: Array<{ category: string; count: number }>
  department_statistics: Array<{
    name: string
    category: string
    complaint_count: number
    pending_count: number
    inprogress_count: number
    resolved_count: number
    officer_count: number
    resolution_rate: number
  }>
  pie_category_distribution: Array<{ name: string; value: number }>
  monthly_trend: Array<{ month: string; complaints: number; resolved: number; pending: number }>
  yearly_trend: Array<{ year: string; complaints: number; resolved: number; pending: number; inprogress: number }>
}

export default function DepartmentsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ id: number; name: string }>>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [stats, setStats] = useState<DepartmentStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Backend requires a category code; new departments default to OTHER (UI no longer collects it). */
  const DEFAULT_DEPARTMENT_CATEGORY = 'OTHER'

  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    contact_email: '', 
    contact_phone: '',
    head_officer: ''
  })

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
  const itemsPerPage = 10

  // Year selector for dept-wise complaints chart
  const CURRENT_YEAR = new Date().getFullYear()
  const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)
  const [compYear, setCompYear] = useState(CURRENT_YEAR)
  const [compYearOpen, setCompYearOpen] = useState(false)
  const [deptComplaintData, setDeptComplaintData] = useState<{ name: string; complaints: number }[]>([])
  const [deptOfficerData, setDeptOfficerData] = useState<{ name: string; officers: number }[]>([])
  const [chartsLoading, setChartsLoading] = useState(false)
  const [userEmails, setUserEmails] = useState<{id:number; email:string; name:string}[]>([])

  async function fetchUserEmails() {
    try {
      const res = await fetch(`${API_BASE}/api/users/emails/`, { headers: getAuthHeaders() })
      if (res.ok) setUserEmails(await res.json())
    } catch {}
  }

  const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6']

  const categoryChoices = [
    { value: 'ROADS',                label: 'Roads & Infrastructure' },
    { value: 'TRAFFIC',              label: 'Traffic & Road Safety' },
    { value: 'WATER',                label: 'Water Supply' },
    { value: 'SEWERAGE',             label: 'Sewerage & Drainage' },
    { value: 'SANITATION',           label: 'Sanitation & Garbage' },
    { value: 'LIGHTING',             label: 'Street Lighting' },
    { value: 'HEALTH',               label: 'Public Health Hazard' },
    { value: 'PARKS',                label: 'Parks & Public Spaces' },
    { value: 'ANIMALS',              label: 'Stray Animals' },
    { value: 'ILLEGAL_CONSTRUCTION', label: 'Illegal Construction' },
    { value: 'ENCROACHMENT',         label: 'Encroachment' },
    { value: 'PROPERTY_DAMAGE',      label: 'Public Property Damage' },
    { value: 'NOISE',                label: 'Noise Pollution' },
    { value: 'ELECTRICITY',          label: 'Electricity & Power Issues' },
    { value: 'VENDORS',              label: 'Street Vendor / Hawker Issues' },
    { value: 'OTHER',                label: 'Other' },
  ]

  function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('access_token')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async function fetchDepartments() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`Failed to fetch departments (${res.status})`)
      const data = await res.json()
      setDepartments(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Error fetching departments')
    } finally {
      setLoading(false)
    }
  }

  async function fetchDepartmentStatistics() {
    try {
      const res = await fetch(`${API_BASE}/api/departments/statistics/`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`Failed to fetch department statistics (${res.status})`)
      const data = await res.json()
      setStats(prev => prev ? {
        ...prev,
        department_statistics: data.department_statistics || [],
        pie_category_distribution: data.category_distribution || [],
        monthly_trend: data.monthly_trend || [],
        yearly_trend: data.yearly_trend || [],
      } : null)
    } catch (e: any) {
      console.error('Error fetching department statistics:', e.message)
    }
  }

  async function fetchDepartmentOptions() {
    try {
      const res = await fetch(`${API_BASE}/api/departments/`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`Failed to fetch departments (${res.status})`)
      const data = await res.json()
      const normalized = (Array.isArray(data) ? data : [])
        .filter((d: any) => d && (typeof d.id === 'number' || typeof d.id === 'string') && typeof d.name === 'string')
        .map((d: any) => ({ id: Number(d.id), name: d.name }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setDepartmentOptions(normalized)
    } catch (e) {
      console.error('Error fetching department options:', e)
      setDepartmentOptions([])
    }
  }

  function computeStats(depts: Department[]) {
    const categoryCount = depts.reduce((acc: any, dept) => {
      acc[dept.category] = (acc[dept.category] || 0) + 1
      return acc
    }, {})
    const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
      category: categoryChoices.find(c => c.value === category)?.label || category,
      count: count as number
    }))
    setStats({
      total_departments: depts.length,
      total_officers: depts.reduce((sum, dept) => sum + dept.officer_count, 0),
      departments_with_head: depts.filter(dept => dept.head_officer_name).length,
      departments_without_head: depts.filter(dept => !dept.head_officer_name).length,
      category_distribution: categoryDistribution,
      department_statistics: [],
      pie_category_distribution: [],
      monthly_trend: [],
      yearly_trend: [],
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const url = editingDepartment 
        ? `${API_BASE}/api/admin/departments/${editingDepartment.id}/`
        : `${API_BASE}/api/admin/departments/`
      
      const method = editingDepartment ? 'PUT' : 'POST'
      
      const payload = {
        ...form,
        category: editingDepartment ? editingDepartment.category : DEFAULT_DEPARTMENT_CATEGORY,
      }

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save department')
      
      await fetchDepartments()
      setShowAddForm(false)
      setEditingDepartment(null)
      setForm({ name: '', description: '', contact_email: '', contact_phone: '', head_officer: '' })
    } catch (e: any) {
      setError(e.message || 'Error saving department')
    }
  }

  async function handleDelete(department: Department) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/departments/${department.id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!res.ok) throw new Error('Failed to delete department')
      
      await fetchDepartments()
      setDeletingDepartment(null)
    } catch (e: any) {
      setError(e.message || 'Error deleting department')
    }
  }

  function handleEdit(department: Department) {
    setEditingDepartment(department)
    setForm({
      name: department.name,
      description: department.description,
      contact_email: department.contact_email,
      contact_phone: department.contact_phone,
      head_officer: department.head_officer_name || ''
    })
    setShowAddForm(true)
  }

  async function fetchDeptComplaintData(year: number) {
    setChartsLoading(true)
    try {
      // Try department_statistics first (real per-dept data)
      const res = await fetch(`${API_BASE}/api/departments/statistics/?year=${year}`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      const deptStats: any[] = data.department_statistics ?? []

      if (deptStats.length > 0) {
        // Use department_statistics â€” real data per Department record
        setDeptComplaintData(
          deptStats
            .sort((a, b) => String(a.name || a.category).localeCompare(String(b.name || b.category)))
            .map(d => ({ name: d.name || d.category, complaints: d.complaint_count }))
        )
      } else {
        // Fallback: use category_distribution (complaints per Category record)
        const catDist: any[] = data.category_distribution ?? []
        setDeptComplaintData(
          catDist
            .filter(d => d.value > 0)
            .map(d => ({ name: d.name, complaints: d.value }))
        )
      }
    } catch (e) {
      console.error('fetchDeptComplaintData error:', e)
      // Last fallback: totalcategories endpoint
      try {
        const res2 = await fetch(`${API_BASE}/api/totalcategories/`, { headers: getAuthHeaders() })
        if (res2.ok) {
          const data2: any[] = await res2.json()
          setDeptComplaintData(
            data2.filter(d => Number(d.total_comp ?? 0) > 0)
                 .map(d => ({ name: d.name, complaints: Number(d.total_comp) }))
          )
        } else { setDeptComplaintData([]) }
      } catch { setDeptComplaintData([]) }
    } finally {
      setChartsLoading(false)
    }
  }

  async function fetchDeptOfficerData() {
    try {
      const res = await fetch(`${API_BASE}/api/departments/statistics/`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      const deptStats: any[] = data.department_statistics ?? []

      if (deptStats.length > 0) {
        setDeptOfficerData(
          deptStats
            .sort((a, b) => String(a.name || a.category).localeCompare(String(b.name || b.category)))
            .map(d => ({ name: d.name || d.category, officers: d.officer_count }))
        )
      } else {
        // Fallback: use officer_count from departments list
        const deptList = [...departments].sort((a, b) => a.name.localeCompare(b.name))
        setDeptOfficerData(deptList.map(d => ({ name: d.name, officers: d.officer_count })))
      }
    } catch (e) {
      console.error('fetchDeptOfficerData error:', e)
      // Fallback: use officer_count from already-loaded departments list
      const deptList = [...departments].sort((a, b) => a.name.localeCompare(b.name))
      setDeptOfficerData(deptList.map(d => ({ name: d.name, officers: d.officer_count })))
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchDepartmentStatistics()
    fetchDeptComplaintData(compYear)
    fetchDeptOfficerData()
    fetchUserEmails()
    fetchDepartmentOptions()
  }, [])

  useEffect(() => {
    if (departments.length > 0) {
      computeStats(departments)
      // Re-run officer data once departments are loaded (for fallback)
      fetchDeptOfficerData()
    }
  }, [departments])

  useEffect(() => {
    fetchDeptComplaintData(compYear)
  }, [compYear])

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || dept.name === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-indigo-500 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage civic departments and their operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsRefreshing(true)
                fetchDepartments().finally(() => setIsRefreshing(false))
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => { setEditingDepartment(null); setForm({ name: '', description: '', contact_email: '', contact_phone: '', head_officer: '' }); setShowAddForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Add Department
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Departments', value: stats.total_departments, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-t-indigo-500', icon: <Building2 className="w-6 h-6 text-indigo-600" /> },
            { label: 'Total Officers',    value: stats.total_officers,    color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-t-green-500',  icon: <Users className="w-6 h-6 text-green-600" /> },
            { label: 'With Head Officer', value: stats.departments_with_head,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-t-blue-500',   icon: <User className="w-6 h-6 text-blue-600" /> },
            { label: 'Without Head',      value: stats.departments_without_head, color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-t-red-500',    icon: <AlertTriangle className="w-6 h-6 text-red-600" /> },
          ].map(({ label, value, color, bg, border, icon }) => (
            <div key={label} className={`bg-white rounded-xl border border-gray-200 border-t-4 ${border} shadow-sm p-6 h-[120px] flex items-center justify-between`}>
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
              <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Dept-wise Complaints Bar Chart with Year Selector */}
        <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-indigo-500 shadow-sm p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Department-wise Complaints</h3>
              <p className="text-xs text-gray-500 mt-0.5">Total complaints per department in {compYear}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setCompYearOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                {compYear}
                <ChevronDown className={`w-4 h-4 transition-transform ${compYearOpen ? 'rotate-180' : ''}`} />
              </button>
              {compYearOpen && (
                <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  {YEAR_OPTIONS.map(y => (
                    <button
                      key={y}
                      onClick={() => { setCompYear(y); setCompYearOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        compYear === y ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-[260px]">
            {chartsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-7 h-7 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : deptComplaintData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptComplaintData} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-35} textAnchor="end" height={70} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v: any) => [`${v} complaints`, 'Total']} />
                  <Bar dataKey="complaints" radius={[5, 5, 0, 0]}>
                    {deptComplaintData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Building2 className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm">No complaint data for {compYear}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dept-wise Officers Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-emerald-500 shadow-sm p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">Department-wise Officers</h3>
            <p className="text-xs text-gray-500 mt-0.5">Active officers assigned per department ({CURRENT_YEAR})</p>
          </div>
          <div className="flex-1 min-h-[260px]">
            {deptOfficerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptOfficerData} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-35} textAnchor="end" height={70} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v: any) => [`${v} officers`, 'Officers']} />
                  <Bar dataKey="officers" radius={[5, 5, 0, 0]}>
                    {deptOfficerData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Users className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm">No officer data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-gray-400 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
            >
              <option value="all">All Categories</option>
              {departmentOptions.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-xl border border-gray-200 border-t-4 border-t-slate-400 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Departments</h3>
          <p className="text-sm text-gray-500">Manage and monitor department operations</p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading departments...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head Officer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedDepartments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{dept.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {categoryChoices.find(c => c.value === dept.category)?.label || dept.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {dept.head_officer_name ? (
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{dept.head_officer_name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{dept.officer_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {dept.contact_email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {dept.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(dept.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Department"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingDepartment(dept)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Department"
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Department Modal */}
      {(showAddForm || editingDepartment) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  placeholder="e.g., Public Works Department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  placeholder="Department responsibilities and functions..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <select
                    required
                    value={form.contact_email}
                    onChange={(e) => setForm({...form, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                  >
                    <option value="">â€” Select user email â€”</option>
                    {userEmails.map(u => (
                      <option key={u.id} value={u.email}>
                        {u.email} ({u.name})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={form.contact_phone}
                    onChange={(e) => setForm({...form, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sidebar-primary focus:border-sidebar-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingDepartment(null)
                    setForm({ name: '', description: '', contact_email: '', contact_phone: '', head_officer: '' })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sidebar-primary text-white rounded-lg hover:bg-sidebar-primary/90"
                >
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDepartment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Department</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingDepartment.name}"? This action cannot be undone and may affect associated officers and complaints.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingDepartment(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingDepartment)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

