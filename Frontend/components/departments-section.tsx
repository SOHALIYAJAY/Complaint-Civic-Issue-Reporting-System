'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, Users, ArrowRight } from 'lucide-react'
import api from '@/lib/axios'

interface Department {
  id: number
  name: string
  category: string
  description: string
  contact_email: string
  contact_phone: string
  head_officer: string | null
  officer_count: number
}

const categoryIcons: Record<string, string> = {
  'ROADS': '🛣️',
  'TRAFFIC': '🚦',
  'WATER': '💧',
  'SEWERAGE': '🚰',
  'SANITATION': '🗑️',
  'LIGHTING': '💡',
  'PARKS': '🌳',
  'ANIMALS': '🐕',
  'ILLEGAL_CONSTRUCTION': '🏗️',
  'ENCROACHMENT': '⚠️',
  'PROPERTY_DAMAGE': '🔨',
  'ELECTRICITY': '⚡',
  'OTHER': '📋'
}

const categoryColors: Record<string, string> = {
  'ROADS': 'from-slate-500 to-slate-600',
  'TRAFFIC': 'from-red-500 to-red-600',
  'WATER': 'from-blue-500 to-blue-600',
  'SEWERAGE': 'from-teal-500 to-teal-600',
  'SANITATION': 'from-green-500 to-green-600',
  'LIGHTING': 'from-yellow-500 to-yellow-600',
  'PARKS': 'from-emerald-500 to-emerald-600',
  'ANIMALS': 'from-orange-500 to-orange-600',
  'ILLEGAL_CONSTRUCTION': 'from-purple-500 to-purple-600',
  'ENCROACHMENT': 'from-amber-500 to-amber-600',
  'PROPERTY_DAMAGE': 'from-rose-500 to-rose-600',
  'ELECTRICITY': 'from-indigo-500 to-indigo-600',
  'OTHER': 'from-gray-500 to-gray-600'
}

export default function DepartmentsSection() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/api/deptinfo/")
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-600">Loading departments...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <div
              key={dept.id}
              className="group bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Header with gradient */}
              <div className={`h-20 bg-gradient-to-r ${categoryColors[dept.category] || categoryColors['OTHER']} rounded-t-lg flex items-center justify-between px-6`}>
                <span className="text-4xl">{categoryIcons[dept.category] || categoryIcons['OTHER']}</span>
                <ArrowRight className="w-6 h-6 text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {dept.description || 'Serving the community with dedication'}
                </p>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{dept.contact_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="truncate">{dept.contact_email}</span>
                  </div>
                </div>

                {/* Officers Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{dept.officer_count} Officers</span>
                  </div>
                  {dept.head_officer && (
                    <span className="text-xs text-slate-500 truncate max-w-[150px]" title={dept.head_officer}>
                      Head: {dept.head_officer.split('@')[0]}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 flex items-center justify-center gap-2">
                  Report Issue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No departments available at the moment.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
