'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface DistrictData {
  name: string
  area: string
  population: string
  hq: string
  villages: number
  total_complaints: number
  resolved_complaints: number
  pending_complaints: number
  inprogress_complaints: number
  sla_compliance: number
}

export default function GujaratMapSection() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null)
  const [loading, setLoading] = useState(false)
  const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || 'https://civic-backend-iob6.onrender.com'

  const handleDistrictClick = async (districtName: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/district/${districtName}/`)
      const data = await response.json()
      setSelectedDistrict(data)
    } catch (error) {
      console.error('Error fetching district data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Gujarat at a Glance
          </h2>
          <p className="text-lg text-muted-foreground">
            Click on any district to view detailed statistics
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* SVG Map */}
          <div className="glass-effect rounded-lg p-6 border border-border">
            <svg viewBox="0 0 800 600" className="w-full h-auto">
              {/* Simplified Gujarat Map - Districts as clickable paths */}
              <g id="districts">
                {/* Ahmedabad */}
                <path
                  d="M 350 250 L 400 240 L 420 270 L 400 300 L 350 290 Z"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-yellow-400 transition-colors"
                  onClick={() => handleDistrictClick('Ahmedabad')}
                >
                  <title>Ahmedabad</title>
                </path>
                
                {/* Surat */}
                <path
                  d="M 280 380 L 330 370 L 350 400 L 330 430 L 280 420 Z"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-yellow-400 transition-colors"
                  onClick={() => handleDistrictClick('Surat')}
                >
                  <title>Surat</title>
                </path>

                {/* Vadodara */}
                <path
                  d="M 320 300 L 370 290 L 390 320 L 370 350 L 320 340 Z"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-yellow-400 transition-colors"
                  onClick={() => handleDistrictClick('Vadodara')}
                >
                  <title>Vadodara</title>
                </path>

                {/* Rajkot */}
                <path
                  d="M 200 280 L 250 270 L 270 300 L 250 330 L 200 320 Z"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-yellow-400 transition-colors"
                  onClick={() => handleDistrictClick('Rajkot')}
                >
                  <title>Rajkot</title>
                </path>

                {/* Bhavnagar */}
                <path
                  d="M 280 320 L 330 310 L 350 340 L 330 370 L 280 360 Z"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-yellow-400 transition-colors"
                  onClick={() => handleDistrictClick('Bhavnagar')}
                >
                  <title>Bhavnagar</title>
                </path>

                {/* Add more districts as needed */}
              </g>

              {/* District Labels */}
              <text x="375" y="270" fontSize="12" fill="#fff" textAnchor="middle">Ahmedabad</text>
              <text x="305" y="400" fontSize="12" fill="#fff" textAnchor="middle">Surat</text>
              <text x="345" y="320" fontSize="12" fill="#fff" textAnchor="middle">Vadodara</text>
              <text x="225" y="300" fontSize="12" fill="#fff" textAnchor="middle">Rajkot</text>
              <text x="305" y="340" fontSize="12" fill="#fff" textAnchor="middle">Bhavnagar</text>
            </svg>
          </div>

          {/* District Details Panel */}
          <div className="glass-effect rounded-lg p-6 border border-border min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : selectedDistrict ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-primary">{selectedDistrict.name}</h3>
                  <button
                    onClick={() => setSelectedDistrict(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Area</p>
                    <p className="text-lg font-semibold">{selectedDistrict.area}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Population</p>
                    <p className="text-lg font-semibold">{selectedDistrict.population}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">District HQ</p>
                    <p className="text-lg font-semibold">{selectedDistrict.hq}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Villages</p>
                    <p className="text-lg font-semibold">{selectedDistrict.villages}</p>
                  </div>
                </div>

                {/* Complaint Statistics */}
                <div className="border-t border-border pt-6">
                  <h4 className="text-lg font-semibold mb-4">Complaint Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-sm font-medium">Total Complaints</span>
                      <span className="text-xl font-bold text-blue-600">{selectedDistrict.total_complaints}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-sm font-medium">Resolved</span>
                      <span className="text-xl font-bold text-green-600">{selectedDistrict.resolved_complaints}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                      <span className="text-sm font-medium">Pending</span>
                      <span className="text-xl font-bold text-red-600">{selectedDistrict.pending_complaints}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg">
                      <span className="text-sm font-medium">In Progress</span>
                      <span className="text-xl font-bold text-amber-600">{selectedDistrict.inprogress_complaints}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                      <span className="text-sm font-medium">SLA Compliance</span>
                      <span className="text-xl font-bold text-purple-600">{selectedDistrict.sla_compliance.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Select a District</h3>
                <p className="text-muted-foreground">Click on any district on the map to view detailed information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
