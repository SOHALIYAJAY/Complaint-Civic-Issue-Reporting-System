'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, RefreshCw, ArrowUpDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import CategoryComplaintsChart from '@/components/admin/categories/CategoryComplaintsChart'

export default function CategoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ name: '', code: '', department: '' })
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('complaints')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '', description: '', department: '' })

  const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com' as string
  if (!API_BASE) throw new Error('Missing NEXT_PUBLIC_API_URL')

  async function fetchCategories() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/categorieslist/`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCategories(data)
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all departments from DB for filter dropdown
  async function fetchDepartments() {
    try {
      const res = await fetch(`${API_BASE}/api/departments/`)
      if (!res.ok) throw new Error('Failed to fetch departments')
      const data = await res.json()
      setDepartments(data)
    } catch (e: any) {
      console.error('Error fetching departments:', e)
    }
  }

  useEffect(() => { 
    fetchCategories()
    fetchDepartments()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCategories()
    setIsRefreshing(false)
  }

  async function createCategory() {
    // Validate required fields
    if (!form.name.trim()) {
      alert('Please enter a category name')
      return
    }
    if (!form.code.trim()) {
      alert('Please enter a category code')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, code: form.code }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('\n')
          throw new Error(errorMessages)
        }
        throw new Error(errorData.message || 'Create failed')
      }
      const created = await res.json()
      setCategories((s) => [created, ...s])
      setShowAddForm(false)
      setForm({ name: '', code: '', description: '', department: '' })
      alert('Category created successfully!')
    } catch (e: any) {
      alert('Create failed: ' + (e.message || e))
    }
  }

  async function updateCategory() {
    if (!editingCategory) return
    try {
      // Build update payload with only non-empty fields
      const updatePayload: any = {}
      if (editForm.name.trim()) updatePayload.name = editForm.name.trim()
      if (editForm.code.trim()) updatePayload.code = editForm.code.trim()
      if (editForm.department.trim()) updatePayload.department = editForm.department.trim()
      
      // Ensure department is not empty since backend requires it
      if (!updatePayload.department) {
        updatePayload.department = editingCategory.department || 'Unassigned'
      }

      console.log('Update payload:', updatePayload)
      
      const res = await fetch(`${API_BASE}/api/updatecategory/${editingCategory.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        const errorMessage = errorData.errors ? 
          Object.values(errorData.errors).flat().join(', ') : 
          (errorData.detail || errorData.message || 'Update failed')
        throw new Error(errorMessage)
      }
      
      const json = await res.json()
      const updated = json.data ?? json
      setCategories((s) => s.map((c) => (c.id === editingCategory.id ? { ...c, ...updated } : c)))
      setEditingCategory(null)
      alert('Category updated successfully!')
    } catch (e: any) {
      console.error('Update error:', e)
      alert('Update failed: ' + (e.message || e))
    }
  }

  async function deleteCategory(id: number) {
    try {
      const res = await fetch(`${API_BASE}/api/deletecategory/${id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setCategories((s) => s.filter((c) => c.id !== id))
      setDeletingCategory(null)
    } catch (e: any) {
      alert(e.message || 'Delete failed')
    }
  }

  const filteredCategories = categories
    .filter((cat) => {
      const matchSearch =
        (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.code || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchDept = filterDepartment === 'all' || (cat.department || '') === filterDepartment
      return matchSearch && matchDept
    })
    .sort((a, b) => {
      if (sortBy === 'complaints')
        return sortOrder === 'desc' ? (b.total_comp || 0) - (a.total_comp || 0) : (a.total_comp || 0) - (b.total_comp || 0)
      if (sortBy === 'name')
        return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
      return 0
    })

  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    else { setSortBy(field); setSortOrder('desc') }
    setCurrentPage(1)
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--sidebar-primary)/0.1)] to-[hsl(var(--sidebar-primary)/0.2)] rounded-lg border border-[hsl(var(--sidebar-primary)/0.3)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--sidebar-primary))]">Manage Categories</h1>
            <p className="text-sm text-[hsl(var(--sidebar-primary)/0.8)] mt-1">Create and configure complaint categories</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--sidebar-primary)/0.5)] text-[hsl(var(--sidebar-primary))] rounded-lg hover:bg-[hsl(var(--sidebar-primary)/0.1)] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-white rounded-lg hover:bg-[hsl(var(--sidebar-primary)/0.9)] transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Add New Category</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">âœ•</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
              <input
                type="text"
                placeholder="e.g., Water Supply"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--sidebar-primary))] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Code</label>
              <input
                type="text"
                placeholder="e.g., WS"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--sidebar-primary))] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={createCategory} className="px-6 py-2 bg-[hsl(var(--sidebar-primary))] text-white rounded-lg font-medium hover:bg-[hsl(var(--sidebar-primary)/0.9)] transition-colors">
              Save Category
            </button>
          </div>
        </div>
      )}

      {/* Category Complaints Chart */}
      <CategoryComplaintsChart />

      {/* Filter and Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories List</h2>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--sidebar-primary))] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => toggleSort('complaints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
              sortBy === 'complaints' ? 'bg-[hsl(var(--sidebar-primary))] text-white border-[hsl(var(--sidebar-primary))]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            No. of Complaints
            {sortBy === 'complaints' && <span className="text-xs">{sortOrder === 'desc' ? 'â†“' : 'â†‘'}</span>}
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading categoriesâ€¦</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error: {error}</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No categories found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Code</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Head of Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('complaints')}>
                    <div className="flex items-center gap-1">
                      Complaints
                      <ArrowUpDown className="w-4 h-4" />
                      {sortBy === 'complaints' && <span className="text-xs text-[hsl(var(--sidebar-primary))]">{sortOrder === 'desc' ? 'â†“' : 'â†‘'}</span>}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-gray-200 hover:bg-[hsl(var(--sidebar-primary)/0.05)] transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{cat.code || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {cat.department || <span className="text-orange-600 font-semibold text-xs">Not Assigned</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-semibold">{cat.total_comp ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 hover:bg-[hsl(var(--sidebar-primary)/0.1)] rounded transition-colors"
                          title="Edit"
                          onClick={() => { 
  setEditingCategory(cat); 
  setEditForm({ 
    name: cat.name, 
    code: cat.code || '', 
    department: cat.department || 'Unassigned' 
  }) 
}}
                        >
                          <Edit2 className="w-4 h-4 text-[hsl(var(--sidebar-primary))]" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                          onClick={() => setDeletingCategory(cat)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === i + 1 ? 'bg-[hsl(var(--sidebar-primary))] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Edit Category</h2>
              <button onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-700">âœ•</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Code</label>
                <input
                  type="text"
                  value={editForm.code}
                  onChange={(e) => setEditForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Head of Category</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--sidebar-primary))] focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setEditingCategory(null)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={updateCategory} className="px-5 py-2 bg-[hsl(var(--sidebar-primary))] text-white rounded-lg font-medium hover:bg-[hsl(var(--sidebar-primary)/0.9)] transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Delete Category</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                Are you sure you want to delete <span className="font-semibold">&ldquo;{deletingCategory.name}&rdquo;</span>?
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button onClick={() => setDeletingCategory(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteCategory(deletingCategory.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

