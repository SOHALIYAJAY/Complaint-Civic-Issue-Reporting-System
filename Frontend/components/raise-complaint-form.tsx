'use client'


import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MapPin, Upload, X, AlertCircle, Play } from 'lucide-react'

const ComplaintMap = dynamic(() => import('./complaint-map'), { ssr: false })

const districts = [
  'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
  'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
  'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
  'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
  'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
  'Tapi', 'Vadodara', 'Valsad'
]

type DepartmentOption = { id: number; name: string }

export default function RaiseComplaintForm() {
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [departmentsMessage, setDepartmentsMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    Category: '',
    Description: '',
    location_address: '',
    location_District: '',
    location_taluk: '',
    ward: '',
    priority_level: 'medium', // ↩️ REVERTED TO ORIGINAL
    latitude: 0,
    longitude: 0,
  })

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [filePreviews,  setFilePreviews] = useState<{ url: string; type: 'image' | 'video'; name: string }[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fileError, setFileError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Load departments from DB (Neon via Render API)
  useEffect(() => {
    const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
    setDepartmentsMessage('')
    fetch(`${API_BASE}/api/departments/`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fetch failed'))))
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setDepartments([])
          setDepartmentsMessage('No departments available')
          return
        }
        const normalized: DepartmentOption[] = data
          .filter((d: any) => d && (typeof d.id === 'number' || typeof d.id === 'string') && typeof d.name === 'string')
          .map((d: any) => ({ id: Number(d.id), name: d.name }))
        if (normalized.length === 0) {
          setDepartments([])
          setDepartmentsMessage('No departments available')
        } else {
          setDepartments(normalized)
        }
      })
      .catch(() => {
        setDepartments([])
        setDepartmentsMessage('No departments available')
      })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFilesSelected(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFilesSelected(files)
    }
  }

  const handleFilesSelected = (newFiles: File[]) => {
    setFileError('')
    const validFiles: File[] = []
    const newPreviews: { url: string; type: 'image' | 'video'; name: string }[] = []

    for (const file of newFiles) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError(`File "${file.name}" is too large (max 10MB)`)
        continue
      }

      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setFileError(`File "${file.name}" is not an image or video`)
        continue
      }

      // Check total files
      if (uploadedFiles.length + validFiles.length >= 3) {
        setFileError('You can upload maximum 3 files')
        break
      }

      validFiles.push(file)

      // Generate preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const type = file.type.startsWith('image/') ? 'image' : 'video'
        newPreviews.push({
          url: event.target?.result as string,
          type,
          name: file.name,
        })
        setFilePreviews((prev) => [...prev, { url: event.target?.result as string, type, name: file.name }])
      }
      reader.readAsDataURL(file)
    }

    setUploadedFiles((prev) => [...prev, ...validFiles].slice(0, 3))
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setFilePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const address = data.address?.road
        ? `${data.address.road}, ${data.address.city || data.address.town || ''}`
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      return address
    } catch (error) {
      console.error('Error getting address:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location_address: address || prev.location_address,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return
    }
    
    setIsSubmitting(true)
    
    // Validate required fields
    if (!formData.title || !formData.Category || !formData.Description || !formData.location_address || !formData.location_District || !formData.location_taluk || !formData.priority_level) {
      alert("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Validate priority level
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(formData.priority_level.toLowerCase())) {
      alert("Invalid priority level selected")
      setIsSubmitting(false)
      return
    }

    // Validate field lengths
    if (formData.title.length > 200) {
      alert("Title is too long (max 200 characters)")
      setIsSubmitting(false)
      return
    }
    if (formData.Description.length > 2000) {
      alert("Description is too long (max 2000 characters)")
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare data for backend - only send fields that exist in Django model
      const submitData = {
        title: formData.title,
        Category: formData.Category,
        Description: formData.Description,
        location_address: formData.location_address,
        location_District: formData.location_District,
        location_taluk: formData.location_taluk,
        priority_level: formData.priority_level.charAt(0).toUpperCase() + formData.priority_level.slice(1), // Convert to TitleCase
        status: 'Pending'
      }

      const formPayload = new FormData()
      Object.entries(submitData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formPayload.append(key, String(value))
        }
      })

      const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'
      
      if (uploadedFiles.length > 0) {
        // Option A Restored: Pipe standard binary packet globally to backend explicitly!
        formPayload.append('image_video', uploadedFiles[0])
      }

      const endpoint = `${API_BASE_URL}/api/raisecomplaint/`

      // Add retry logic for server errors
      let response: Response | undefined
      let retryCount = 0
      const maxRetries = 2
      
      while (retryCount <= maxRetries) {
        try {
          // Get authentication token
          const token = localStorage.getItem('access_token')
          const headers: Record<string, string> = {}
          
          if (token) {
            headers["Authorization"] = `Bearer ${token}`
          }
          
          response = await fetch(endpoint, {
            method: "POST",
            headers: headers,
            body: formPayload
          })
          
          // If successful, break out of retry loop
          if (response.ok) {
            break
          }
          
          // If 500 error and we haven't exhausted retries, wait and retry
          if (response.status === 500 && retryCount < maxRetries) {
            console.log(`Server error 500, retrying... (${retryCount + 1}/${maxRetries + 1})`)
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
            retryCount++
            continue
          }
          
          // For other errors or if we've exhausted retries, break
          break
        } catch (fetchError) {
          console.error('Fetch error:', fetchError)
          if (retryCount < maxRetries) {
            console.log(`Fetch failed, retrying... (${retryCount + 1}/${maxRetries + 1})`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
            retryCount++
            continue
          }
          throw fetchError
        }
      }

      // Ensure response is defined
      if (!response) {
        throw new Error('Failed to get response from server')
      }

      let data = {}
      try {
        const text = await response.text()
        
        // Check if response is HTML (error page) instead of JSON
        if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
          throw new Error('Server returned HTML error page instead of JSON')
        }
        
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.error('JSON parse error:', parseError)
          // If JSON parsing fails and response is not OK, it's likely a server error
          if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`)
          }
          // If response is OK but JSON parsing failed, it's a format issue
          throw new Error('Invalid response format from server')
        }
      } catch (jsonError) {
        console.error('Failed to parse response:', jsonError)
        // If JSON parsing fails and response is not OK, it's likely a server error
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
        // If response is OK but JSON parsing failed, it's a format issue
        throw new Error('Invalid response format from server')
      }

      // Check response status first
      if (!response.ok) {
        const errorMsg = (data as any)?.error || (data as any)?.message || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMsg)
      }
      // Do not show in-form banner or alert here; keep UX minimal and avoid duplicate messages
      setSubmitted(true)
      setSuccessMessage('Complaint submitted successfully.')
      // Auto-hide after 8 seconds
      setTimeout(() => setSuccessMessage(''), 8000)
      // Notify other open tabs (admin dashboard) that a new complaint was created
      try {
        const bc = new BroadcastChannel('complaints')
        bc.postMessage({ type: 'new-complaint' })
        bc.close()
      } catch (e) {
        // BroadcastChannel may not be available in older browsers; ignore errors
        console.warn('BroadcastChannel unavailable:', e)
      }
      
      // Reset form
      setFormData({
        title: '',
        Category: '',
        Description: '',
        location_address: '',
        location_District: '',
        location_taluk: '',
        ward: '',
        priority_level: 'medium', // ↩️ REVERTED TO ORIGINAL
        latitude: 0,
        longitude: 0,
      })
      setUploadedFiles([])
      setFilePreviews([])
    } catch (error: any) {
      console.error('Complaint submission error:', error)
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to submit complaint. Please try again.'
      
      if (error.message.includes('Invalid Signature') || error.message.includes('signature')) {
        errorMessage = 'Upload security signature mismatch. Please ensure the Backend API Secret matches Cloudinary perfectly.'
        console.error("%c[DEBUG HINT - SIGNATURE]", "color: orange; font-weight: bold", "Check your Render configuration for CLOUDINARY_API_SECRET. If missing or formatted with a space, Django will hash the wrong signature against Cloudinary. Ensure it exactly matches your Cloudinary Dashboard Secret.")
      } else if (error.message.includes('Expired') || error.message.includes('timestamp')) {
        errorMessage = 'Your upload session expired. Please refresh the page and try submitting the image again.'
        console.error("%c[DEBUG HINT - TIMESTAMP]", "color: orange; font-weight: bold", "Check server timezone if persistent. Cloudinary timestamps must match Unix Epoch accurately.")
      } else if (error.message.includes('Missing env variables') || error.message.includes('Must supply api_key')) {
        errorMessage = 'Server configuration error: Standard environment variables are missing on Render.'
        console.error("%c[DEBUG HINT - ENV VARS]", "color: orange; font-weight: bold", "Your Django setup on Render is missing key variables: CLOUDINARY_CLOUD_NAME or CLOUDINARY_API_KEY. Inject them and deploy again.")
      } else if (error.message.includes('Cloudinary') || error.message.includes('upload failed')) {
        errorMessage = 'Image upload to Cloudinary directly failed. Please check your network or file format.'
        console.error("%c[DEBUG HINT - UPLOAD FAILURE]", "color: orange; font-weight: bold", "Cloudinary rejected the POST request natively. Check network CORS limits or ensure the file isn't fundamentally broken/too large.")
      } else if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Connection blocked by CORS policies or Backend is offline.'
        console.error("%c[DEBUG HINT - CORS/OFFLINE]", "color: orange; font-weight: bold", "If NEXT_PUBLIC_API_URL is wrong, fetch will crash here. Also check Django CORS_ALLOW_ALL_ORIGINS = True and verify the backend Render instance is actually awake!")
      } else if (error.message.includes('Database connection') || error.message.includes('psycopg2') || error.message.includes('relation "complaints_') || error.message.includes('Neon')) {
        errorMessage = 'Database sync error: PostgreSQL (Neon DB) is disconnected or requires migrations.'
        console.error("%c[DEBUG HINT - NEON DB]", "color: orange; font-weight: bold", "Django couldn't sync with PostgreSQL. Ensure DATABASE_URL is explicitly set for Neon in Render, and run 'python manage.py migrate' natively inside Render CLI to fix mapping.")
      } else if (error.message.includes('Server error (500)') || error.message.includes('Internal Server Error')) {
        errorMessage = 'Server is currently experiencing technical difficulties. Please check your backend logs.'
        console.error("%c[DEBUG HINT - BACKEND 500]", "color: orange; font-weight: bold", "Server crashed on `/api/raisecomplaint/` ingestion. Check your Render Logs natively for the stack trace.")
      } else if (error.message.includes('Server error (404)')) {
        errorMessage = 'Complaint submission endpoint not found. Please contact support.'
        console.error("%c[DEBUG HINT - 404 URL]", "color: orange; font-weight: bold", "Cannot locate endpoint. Confirm API_BASE_URL resolves specifically to `/api/raisecomplaint/` cleanly.")
      } else if (error.message.includes('Server error (400)')) {
        errorMessage = 'Invalid data provided. Please check all fields and try again.'
        console.error("%c[DEBUG HINT - 400 VALIDATION]", "color: orange; font-weight: bold", "Django REST validation failed parsing Payload contents. Ensure null validation matches models.py formats structure.")
      } else if (error.message.includes('Server returned an error page')) {
        errorMessage = 'Server is experiencing issues. Please try again later.'
      } else if (error.message.includes('Invalid response format')) {
        errorMessage = 'Server response format is invalid. Please contact support.'
      } else {
        errorMessage = error.message
      }
      
      alert(`Error: ${errorMessage}`)
      setSubmitted(false) // Reset submitted state on error
      setIsSubmitting(false) // Reset submitting state on error
    } finally {
      setIsSubmitting(false) // Ensure loading state is reset
    }
  }


  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success banner intentionally removed to avoid duplicate/anchoring issues */}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6" >
              {/* Complaint Title */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Department */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="Category"
                  value={formData.Category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  required
                  disabled={departments.length === 0}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {departmentsMessage ? (
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">{departmentsMessage}</p>
                ) : null}
                <p className="text-xs text-muted-foreground mt-2">
                  Your complaint will be routed to the selected department.
                </p>
              </div>

              {/* Description */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  placeholder="Provide detailed information about the issue..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                  required
                />
              </div>

              {/* File Upload */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">
                  Attach Photos/Videos <span className="text-muted-foreground">(Optional - Max 3 files, 10MB each)</span>
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    Drag and drop files or <button type="button" className="text-primary hover:underline">browse</button>
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept="image/*,video/*"
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <span className="text-xs text-muted-foreground">Supported: Images & Videos</span>
                  </label>
                </div>

                {fileError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-red-600">{fileError}</p>
                  </div>
                )}

                {/* File Previews */}
                {filePreviews.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Uploaded Files</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {filePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          {preview.type === 'image' ? (
                            <img
                              src={preview.url}
                              alt={preview.name}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                          ) : (
                            <div className="w-full h-32 bg-muted rounded-lg border border-border flex items-center justify-center">
                              <Play className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-2 truncate">{preview.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Location Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Location Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location_address"
                      value={formData.location_address}
                      onChange={handleInputChange}
                      placeholder="Enter street address or location name"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="location_District"
                        value={formData.location_District}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Select district</option>
                        {districts.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Taluka <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="location_taluk"
                        value={formData.location_taluk}
                        onChange={handleInputChange}
                        placeholder="Enter taluka name"
                        className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Ward Number <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      placeholder="Ward number if applicable"
                      className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Priority Level */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <label className="block text-sm font-semibold text-foreground mb-4">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                {/* ↩️ REVERTED TO ORIGINAL */}
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority_level"
                        value={level}
                        checked={formData.priority_level === level}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button 
                  type="submit"
                  className="flex-1 bg-accent text-accent-foreground hover:bg-yellow-500 font-semibold py-3 rounded-lg transition-all duration-200"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Complaint'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="flex-1 py-3"
                  size="lg"
                  onClick={() => {
                    setFormData({
                      title: '',
                      Category: '',
                      Description: '',
                      location_address: '',
                      location_District: '',
                      location_taluk: '',
                      ward: '',
                      priority_level: 'medium', // ↩️ REVERTED TO ORIGINAL
                      latitude: 0,
                      longitude: 0,
                    })
                    setUploadedFiles([])
                    setFilePreviews([])
                    setSubmitted(false)
                    setSuccessMessage('')
                  }}
                >
                  Clear Form
                </Button>
              </div>
              {/* Success message area placed below Submit/Clear buttons (matches requested placement) */}
              {successMessage && (
                <div className="mt-4">
                  <div className="w-full p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center justify-between">
                    <div className="text-sm">{successMessage}</div>
                    <button type="button" onClick={() => setSuccessMessage('')} className="text-green-700 font-bold ml-4">✕</button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Sidebar - Map & Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Map Component */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Location Map</h3>
                <ComplaintMap 
                  onLocationSelect={handleLocationSelect}
                  latitude={formData.latitude || undefined}
                  longitude={formData.longitude || undefined}
                />
              </div>

              {/* Complaint Guidelines */}
              <div className="glass-effect rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Important Guidelines</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Provide clear and accurate information</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Attach photos/videos as evidence</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Include exact location details</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Avoid duplicate complaints</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                    <span className="text-sm text-muted-foreground">Be respectful and factual in description</span>
                  </li>
                </ul>
              </div>

              {/* Info Card */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Tracking Your Complaint</p>
                    <p className="text-xs text-muted-foreground">You will receive a unique complaint ID after submission. Use this ID to track the status and progress of your complaint anytime.</p>
                  </div>
                </div>
              </div>

              {/* Expected Timeline Card */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6">
                <div className="flex gap-3">
                  <div className="text-2xl">⏱️</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Expected Resolution Time</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>High Priority: 2-3 days</li>
                      <li>Medium Priority: 5-7 days</li>
                      <li>Low Priority: 10-14 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
