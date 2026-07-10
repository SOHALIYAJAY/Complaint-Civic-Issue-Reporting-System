'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Home, Building2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAllDistricts, getTalukasByDistrict } from '@/lib/districts-talukas'

export default function UserDetailsPage() {
  const [formData, setFormData] = useState({
    mobileNumber: '',
    address: '',
    district: '',
    taluka: '',
    wardNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const getRedirectPath = (user: any) => {
    const userRole = user.User_Role || user.role || 'Civic-User'
    
    switch (userRole) {
      case 'Department-User':
        return '/department'
      case 'Admin-User':
        return '/admin'
      case 'Officer':
        return '/officer'
      case 'Civic-User':
      default:
        return '/dashboard'
    }
  }

  useEffect(() => {
    const checkUserDetails = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const apiUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
        const response = await fetch(`${apiUrl}/api/userdetails/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const user = data.data
            
            // Check if user has already filled details (for Civic Users)
            if (user.User_Role === 'Civic-User' || user.role === 'Civic-User') {
              // For Civic Users, check if they have filled details
              if (user.mobile_number && user.address && user.district && user.taluka && user.ward_number) {
                const redirectPath = getRedirectPath(user)
                router.push(redirectPath)
              }
            } else {
              // For Department and Admin Users, redirect directly to their dashboard
              const redirectPath = getRedirectPath(user)
              router.push(redirectPath)
            }
          }
        }
      } catch (error) {
        console.error('Error checking user details:', error)
      }
    }

    checkUserDetails()
  }, [router])

  const districts = getAllDistricts()
  const talukas = formData.district ? getTalukasByDistrict(formData.district) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!formData.mobileNumber.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      return
    }
    if (!formData.district) {
      setError('Please select a district')
      return
    }
    if (!formData.taluka) {
      setError('Please select a taluka')
      return
    }
    if (!formData.wardNumber || formData.wardNumber === '') {
      setError('Please enter a ward number')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('Please log in first')
        return
      }
      
      const apiUrl = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      console.log('[v0] Submitting user details to:', apiUrl)
      
      const response = await fetch(`${apiUrl}/api/update-userdetails/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mobile_number: formData.mobileNumber,
          address: formData.address,
          district: formData.district,
          taluka: formData.taluka,
          ward_number: formData.wardNumber
        }),
        mode: 'cors',
        credentials: 'include'
      })
      
      console.log('[v0] Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('[v0] Response data:', data)
      
      setSuccess(true)
      setTimeout(() => {
        // Get user data and redirect based on role
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          const redirectPath = getRedirectPath(user)
          router.push(redirectPath)
        } else {
          router.push('/dashboard') // Fallback
        }
      }, 2000)
    } catch (err) {
      console.error('[v0] User details error:', err)
      if (err instanceof TypeError && (err as TypeError).message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please ensure the backend API is running.')
      } else {
        setError('Failed to save details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="text-white text-center space-y-8 max-w-lg relative z-10 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-4">
            <h2 className="text-6xl font-bold drop-shadow-lg">Your Location Details</h2>
            <p className="text-xl text-white/90 leading-relaxed">Help us serve you better with accurate location information</p>
          </div>
          <div className="space-y-4 pt-8 text-left">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 hover:bg-white/20 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Precise Location</p>
                <p className="text-sm text-white/80">Get faster service with exact location</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 hover:bg-white/20 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Quick Contact</p>
                <p className="text-sm text-white/80">Easy communication with authorities</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 hover:bg-white/20 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Ward Assignment</p>
                <p className="text-sm text-white/80">Route complaints to right department</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center space-y-2">
            <div className="inline-block p-3 bg-primary/10 rounded-2xl mb-4">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Location Details</h1>
            <p className="text-muted-foreground text-lg">Complete your profile information</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              Details saved successfully! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Mobile Number *</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Enter 10 digits</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Address *</label>
              <div className="relative group">
                <Home className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="Enter your full address"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">District *</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value, taluka: ''})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select a district</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Taluka *</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  value={formData.taluka}
                  onChange={(e) => setFormData({...formData, taluka: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.district}
                  required
                >
                  <option value="">
                    {formData.district ? 'Select a taluka' : 'Select district first'}
                  </option>
                  {talukas.map((taluka) => (
                    <option key={taluka} value={taluka}>
                      {taluka}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">Ward Number *</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="number"
                  value={formData.wardNumber}
                  onChange={(e) => setFormData({...formData, wardNumber: e.target.value})}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Enter ward number"
                  min="0"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all group mt-6" 
              disabled={loading}
            >
              {loading ? 'Saving details...' : (
                <span className="flex items-center justify-center gap-2">
                  Save Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            Your information is secure and will help us serve you better
          </p>
        </div>
      </div>
    </div>
  )
}
