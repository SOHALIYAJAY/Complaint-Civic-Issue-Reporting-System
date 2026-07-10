"use client"

import { useState, useEffect } from "react"
import { X, UserPlus } from "lucide-react"
import { apiPost } from '@/lib/api'

interface AddOfficerModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Department { id: number; name: string; code: string }
interface UserEmail   { id: number; email: string; name: string; role: string }

interface FormData {
  officer_id: string; name: string; email: string
  phone: string; password: string; department_code: string; is_available: boolean
}
interface FormErrors { [key: string]: string }

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('adminToken') ||
    localStorage.getItem('departmentToken') ||
    localStorage.getItem('access_token')
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token && token !== 'undefined' && token !== 'null')
    h['Authorization'] = `Bearer ${token}`
  return h
}

const ROLE_BADGE: Record<string, string> = {
  'Admin-User':      'bg-red-100 text-red-700',
  'Officer':         'bg-[#eef1f7] text-[#1e3a5f]',
  'Department-User': 'bg-indigo-100 text-indigo-700',
  'Civic-User':      'bg-amber-100 text-amber-700',
}

export default function AddOfficerModal({ open, onClose, onSuccess }: AddOfficerModalProps) {
  const API = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const [formData, setFormData] = useState<FormData>({
    officer_id: '', name: '', email: '', phone: '',
    password: '', department_code: '', is_available: true,
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [userEmails,  setUserEmails]  = useState<UserEmail[]>([])
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [animateIn,  setAnimateIn]  = useState(false)

  // â”€â”€ Fetch on open â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!open) { setAnimateIn(false); return }
    requestAnimationFrame(() => setAnimateIn(true))
    resetForm()

    // Hardcoded fallback â€” all 16 departments matching the DB
    const FALLBACK_DEPTS: Department[] = [
      { id: 1,  code: 'ROADS',                name: 'Roads & Infrastructure' },
      { id: 2,  code: 'TRAFFIC',              name: 'Traffic & Road Safety' },
      { id: 3,  code: 'WATER',                name: 'Water Supply' },
      { id: 4,  code: 'SEWERAGE',             name: 'Sewerage & Drainage' },
      { id: 5,  code: 'SANITATION',           name: 'Sanitation & Garbage' },
      { id: 6,  code: 'LIGHTING',             name: 'Street Lighting' },
      { id: 7,  code: 'HEALTH',               name: 'Public Health Hazard' },
      { id: 8,  code: 'PARKS',                name: 'Parks & Public Spaces' },
      { id: 9,  code: 'ANIMALS',              name: 'Stray Animals' },
      { id: 10, code: 'ILLEGAL_CONSTRUCTION', name: 'Illegal Construction' },
      { id: 11, code: 'ENCROACHMENT',         name: 'Encroachment' },
      { id: 12, code: 'PROPERTY_DAMAGE',      name: 'Public Property Damage' },
      { id: 13, code: 'NOISE',                name: 'Noise Pollution' },
      { id: 14, code: 'ELECTRICITY',          name: 'Electricity & Power Issues' },
      { id: 15, code: 'VENDORS',              name: 'Street Vendor / Hawker Issues' },
      { id: 16, code: 'OTHER',                name: 'Other' },
    ]
    setDepartments(FALLBACK_DEPTS)

    // Try to load from API (overrides fallback if successful)
    setLoadingDepts(true)
    fetch(`${API}/api/department/list/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setDepartments(data) })
      .catch(() => {})
      .finally(() => setLoadingDepts(false))

    setLoadingUsers(true)
    // Try dedicated emails endpoint first, fallback to /api/users/
    fetch(`${API}/api/users/emails/`, { headers: getAuthHeaders() })
      .then(r => {
        if (r.ok) return r.json()
        // fallback
        return fetch(`${API}/api/users/`, { headers: getAuthHeaders() })
          .then(r2 => r2.ok ? r2.json() : [])
          .then(data => {
            const list = Array.isArray(data) ? data : (data.results ?? data.data ?? [])
            return list.map((u: any) => ({
              id: u.id,
              email: u.email,
              name: (u.first_name && u.last_name)
                ? `${u.first_name} ${u.last_name}`.trim()
                : u.name || u.username || u.email,
              role: u.User_Role || u.role || 'Civic-User',
            }))
          })
      })
      .then(data => { if (Array.isArray(data) && data.length > 0) setUserEmails(data) })
      .catch(() => {})
      .finally(() => setLoadingUsers(false))
  }, [open, API])

  const resetForm = () => {
    setFormData({ officer_id: '', name: '', email: '', phone: '', password: '', department_code: '', is_available: true })
    setErrors({})
  }

  // When email is selected from dropdown, auto-fill name if blank
  const handleEmailSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value
    const user  = userEmails.find(u => u.email === email)
    setFormData(prev => ({
      ...prev,
      email,
      name: prev.name || (user?.name ?? ''),
    }))
    if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!formData.officer_id.trim()) e.officer_id = 'Officer ID is required'
    if (!formData.name.trim())       e.name       = 'Name is required'
    if (!formData.email.trim())      e.email      = 'Select an email'
    if (!formData.phone.trim())      e.phone      = 'Phone is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) e.phone = 'Phone must be 10 digits'
    if (!formData.password.trim())   e.password   = 'Password is required'
    else if (formData.password.length < 6) e.password = 'Min 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      setSubmitting(true)
      await apiPost('/api/create-officer/', {
        officer_id:      formData.officer_id.trim(),
        name:            formData.name.trim(),
        email:           formData.email.trim().toLowerCase(),
        phone:           formData.phone.replace(/\D/g, ''),
        password:        formData.password,
        department_code: formData.department_code || undefined,
        is_available:    formData.is_available,
      })
      handleClose()
      onSuccess?.()
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message || 'Failed to add officer'
      alert(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setAnimateIn(false)
    setTimeout(() => { resetForm(); onClose() }, 300)
  }

  if (!open) return null

  const inputCls = (field: string) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-gray-300 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]'
    }`

  // Selected user info for preview badge
  const selectedUser = userEmails.find(u => u.email === formData.email)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className={`bg-white rounded-xl shadow-xl max-w-lg w-full transition-all duration-300 ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#eef1f7] rounded-lg">
              <UserPlus className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Add New Officer</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Officer ID + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Officer ID <span className="text-red-500">*</span>
              </label>
              <input type="text" name="officer_id" value={formData.officer_id}
                onChange={handleChange} placeholder="e.g. OFC001" className={inputCls('officer_id')} />
              {errors.officer_id && <p className="text-xs text-red-500 mt-1">{errors.officer_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="name" value={formData.name}
                onChange={handleChange} placeholder="Enter full name" className={inputCls('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Email â€” select from registered users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
              {loadingUsers && <span className="text-xs text-amber-500 ml-2">Loading users...</span>}
            </label>
            <select
              name="email"
              value={formData.email}
              onChange={handleEmailSelect}
              className={inputCls('email')}
            >
              <option value="">
                {loadingUsers ? 'Loading emails...' : userEmails.length === 0 ? 'No users found' : 'â€” Select registered user email â€”'}
              </option>
              {userEmails.map(u => (
                <option key={u.id} value={u.email}>
                  {u.email}{u.name && u.name !== u.email ? ` (${u.name})` : ''} Â· {u.role}
                </option>
              ))}
            </select>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}

            {/* Selected user preview */}
            {selectedUser && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[#eef1f7] rounded-lg">
                <div className="w-7 h-7 rounded-full bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[selectedUser.role] ?? 'bg-gray-100 text-gray-600'}`}>
                  {selectedUser.role}
                </span>
              </div>
            )}
          </div>

          {/* Phone + Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="10 digit number" className={inputCls('phone')} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder="Min 6 characters" className={inputCls('password')} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
              {loadingDepts && <span className="text-xs text-amber-500 ml-2">Loading...</span>}
            </label>
            <select name="department_code" value={formData.department_code}
              onChange={handleChange} className={inputCls('department_code')}>
              <option value="">â€” Select Department â€”</option>
              {departments.map(d => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 py-1">
            <input type="checkbox" name="is_available" id="is_available"
              checked={formData.is_available} onChange={handleChange}
              className="w-4 h-4 accent-[#1e3a5f]" />
            <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
              Available for assignment
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#162d4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitting ? 'Adding...' : 'Add Officer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

