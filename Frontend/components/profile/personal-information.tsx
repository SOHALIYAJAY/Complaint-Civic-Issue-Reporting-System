'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit2, Save, X, Loader2 } from 'lucide-react'

interface UserData {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  User_Role: string
  mobile_number?: string
  address?: string
  district?: string
  taluka?: string
  ward_number?: string
  date_joined: string
}

const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
  'Jamnagar', 'Junagadh', 'Gandhinagar', 'Kutch', 'Surendranagar',
  'Bharuch', 'Patan', 'Amreli', 'Botad', 'Gir Somnath',
  'Devbhoomi Dwarka', 'Morbi', 'Mahisagar', 'Aravalli', 'Tapi',
  'Dahod', 'Chhota Udaipur', 'Kheda', 'Anand', 'Valsad',
  'Narmada', 'Sabarkantha', 'Banaskantha', 'Panchmahal', 'Navsari',
  'Porbandar', 'Dang', 'Vav-Tharad'
]

export default function PersonalInformation() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    address: '',
    district: '',
    taluka: '',
    ward_number: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        if (!token) {
          return
        }

        const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/userdetails/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setUserData(result.data)
          setFormData({
            first_name: result.data.first_name || '',
            last_name: result.data.last_name || '',
            email: result.data.email || '',
            mobile_number: result.data.mobile_number || '',
            address: result.data.address || '',
            district: result.data.district || '',
            taluka: result.data.taluka || '',
            ward_number: result.data.ward_number || '',
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${(typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'}/api/update-userdetails/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local user data
        if (userData) {
          setUserData({ ...userData, ...formData })
        }
        setIsEditing(false)
        alert('Personal information updated successfully!')
      } else {
        throw new Error(result.error || 'Failed to update user information')
      }
    } catch (error) {
      console.error('Error saving user data:', error)
      alert('Failed to update personal information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original data
    if (userData) {
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        mobile_number: userData.mobile_number || '',
        address: userData.address || '',
        district: userData.district || '',
        taluka: userData.taluka || '',
        ward_number: userData.ward_number || '',
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <Card className="bg-white border border-slate-200 shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading personal information...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-slate-700 font-semibold">
            First Name
          </Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            disabled={!isEditing}
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-slate-700 font-semibold">
            Last Name
          </Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            disabled={!isEditing}
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-semibold">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={true} // Email is read-only
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label htmlFor="mobile_number" className="text-slate-700 font-semibold">
            Mobile Number
          </Label>
          <Input
            id="mobile_number"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            disabled={!isEditing}
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="text-slate-700 font-semibold">
            Address
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-slate-700 font-semibold">
            District
          </Label>
          <Select value={formData.district} onValueChange={(value) => handleSelectChange('district', value)} disabled={!isEditing}>
            <SelectTrigger id="district" className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {GUJARAT_DISTRICTS.map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Taluka */}
        <div className="space-y-2">
          <Label htmlFor="taluka" className="text-slate-700 font-semibold">
            Taluka
          </Label>
          <Input
            id="taluka"
            name="taluka"
            value={formData.taluka}
            onChange={handleChange}
            disabled={!isEditing}
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>

        {/* Ward Number */}
        <div className="space-y-2">
          <Label htmlFor="ward_number" className="text-slate-700 font-semibold">
            Ward Number
          </Label>
          <Input
            id="ward_number"
            name="ward_number"
            value={formData.ward_number}
            onChange={handleChange}
            disabled={!isEditing}
            className="border-slate-300 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-100"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-300">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-slate-300 hover:bg-slate-100 gap-2"
            disabled={saving}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  )
}

