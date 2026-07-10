'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, RotateCcw, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ComplaintsFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedDepartment: string
  setSelectedDepartment: (dept: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedPriority: string
  setSelectedPriority: (priority: string) => void
  selectedDateRange: string
  setSelectedDateRange: (range: string) => void
  selectedDistrict?: string
  setSelectedDistrict?: (d: string) => void
  selectedAssigned?: string
  setSelectedAssigned?: (a: string) => void
}

export default function ComplaintsFilters({
  searchQuery,
  setSearchQuery,
  selectedDepartment,
  setSelectedDepartment,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedDateRange,
  setSelectedDateRange,
  selectedDistrict,
  setSelectedDistrict,
  selectedAssigned,
  setSelectedAssigned,
}: ComplaintsFiltersProps) {
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com' as string
  if (!API_BASE) throw new Error('Missing NEXT_PUBLIC_API_URL')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`${API_BASE}/api/departments/`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch departments')
        return r.json()
      })
      .then((data) => {
        if (!mounted) return
        setDepartments(
          (Array.isArray(data) ? data : [])
            .map((d: any) => ({ id: Number(d.id), name: String(d.name) }))
            .sort((a, b) => a.name.localeCompare(b.name))
        )
      })
      .catch((error) => {
        console.error('Failed to fetch departments:', error)
        setDepartments([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [API_BASE])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('all')
    setSelectedStatus('all')
    setSelectedPriority('all')
    setSelectedDateRange('all')
  }

  const hasActiveFilters = searchQuery || selectedDepartment !== 'all' || selectedStatus !== 'all' || 
                           selectedPriority !== 'all' || selectedDateRange !== 'all' || (selectedDistrict && selectedDistrict !== '') || (selectedAssigned && selectedAssigned !== '')

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">All Complaints</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Active</span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetFilters}
          className="border-slate-300 hover:bg-slate-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Complaints
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, title, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={loading}
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Process">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Priority
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          <Calendar className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Date Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">District</label>
              <select
                value={selectedDistrict || ''}
                onChange={(e) => setSelectedDistrict && setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
              >
                <option value="">All Districts</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Rajkot">Rajkot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Officer</label>
              <select
                value={selectedAssigned || ''}
                onChange={(e) => setSelectedAssigned && setSelectedAssigned(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
              >
                <option value="">All Officers</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Active Filters:</span>
              <span className="ml-2">
                {searchQuery && `Search: "${searchQuery}"`}
                {selectedDepartment !== 'all' && ` | Department: ${selectedDepartment}`}
                {selectedStatus !== 'all' && ` | Status: ${selectedStatus}`}
                {selectedPriority !== 'all' && ` | Priority: ${selectedPriority}`}
                {selectedDateRange !== 'all' && ` | Date: ${selectedDateRange}`}
                {selectedDistrict && selectedDistrict !== '' && ` | District: ${selectedDistrict}`}
                {selectedAssigned && selectedAssigned !== '' && ` | Assigned: ${selectedAssigned}`}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

